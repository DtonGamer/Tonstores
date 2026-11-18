import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
} from '../_shared/utils.ts';

interface PaystackInitializeTransactionPayload {
  amount: number;
  email: string;
  currency: string;
  reference: string;
  callback_url: string;
  metadata?: any;
  channels?: string[];
  subaccount?: string;
  transaction_charge?: number;
  bearer_type?: string;
  bearer_subaccount?: string;
}

serve(async (req) => {
  console.log("🚀 === ESCROW TRANSACTION INITIALIZATION START ===");
  
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  let data;
  try {
    data = await req.json();
    console.log("📦 Request received");
  } catch (err) {
    console.error("❌ Error parsing JSON body:", err);
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const devMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true" || isDevelopmentMode();
  console.log("🔧 Development mode:", devMode);

  // Map snake_case to camelCase
  if (data.payment_reference && !data.paymentReference) {
    data.paymentReference = data.payment_reference;
  }
  if (data.customer_email && !data.email) {
    data.email = data.customer_email;
  }
  if (data.callback_url && !data.callbackUrl) {
    data.callbackUrl = data.callback_url;
  }
  if (data.income_split_config && !data.incomeSplitConfig) {
    data.incomeSplitConfig = data.income_split_config;
  }

  const {
    amount,
    email,
    currency,
    reference,
    callbackUrl,
    metadata,
    channels,
    userId,
    orderId,
    incomeSplitConfig
  } = data;

  console.log("📋 Extracted fields:", {
    amount,
    email,
    userId: userId || 'NOT PROVIDED',
    orderId,
    hasMetadata: !!metadata,
    isAnonymous: metadata?.is_anonymous
  });

  // Handle development mode
  if (devMode) {
    console.log("🧪 Development mode - returning mock response");
    const mockTransactionReference = `DEV_ESCROW_${Math.floor(Math.random() * 1000000)}`;
    const mockAuthorizationUrl = `https://test.paystack.com/checkout/${mockTransactionReference}`;

    return jsonResponse(200, {
      status: true,
      message: "Escrow transaction initialized (Development Mode)",
      dev_mode: true,
      data: {
        authorization_url: mockAuthorizationUrl,
        authorizationUrl: mockAuthorizationUrl,
        access_code: mockTransactionReference,
        accessCode: mockTransactionReference,
        reference: mockTransactionReference
      }
    });
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  // Fetch the platform escrow account
  const { data: platformAccountData, error: platformAccountError } = await supabase
    .from('platform_accounts')
    .select('paystack_subaccount_code')
    .eq('is_escrow_account', true)
    .eq('is_active', true)
    .single();

  let platformSubaccount;
  if (platformAccountError || !platformAccountData) {
    console.error("⚠️ Error fetching platform escrow account:", platformAccountError);
    platformSubaccount = null;
  } else {
    platformSubaccount = platformAccountData.paystack_subaccount_code;
    console.log("✅ Platform escrow account found");
  }

  // Validate required fields
  if (!amount || !email || !reference || !callbackUrl) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["amount", "email", "reference", "callbackUrl"]
    });
  }

  // Validate userId exists (even for anonymous users, Supabase creates a real user)
  if (!userId) {
    console.error("❌ User ID is missing - this should not happen with anonymous auth");
    return jsonResponse(400, {
      error: "User ID is required. Anonymous users should be signed in automatically."
    });
  }

  // Store original income split configuration
  if (incomeSplitConfig && orderId && userId) {
    console.log("💾 Storing income split configuration...");
    
    for (const splitConfig of incomeSplitConfig) {
      try {
        await supabase.from('income_split_configs').upsert({
          user_id: userId,
          order_id: orderId,
          subaccount_code: splitConfig.subAccountCode,
          fee_percentage: splitConfig.feePercentage,
          split_percentage: splitConfig.splitPercentage,
          fee_bearer: splitConfig.feeBearer,
          status: "pending_release",
          created_at: new Date().toISOString()
        }, {
          onConflict: 'order_id,subaccount_code'
        });
        console.log("  ✅ Split config stored");
      } catch (splitError) {
        console.error("  ❌ Error storing split config:", splitError);
      }
    }
  }

  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  // Prepare payload for Paystack
  const payload: PaystackInitializeTransactionPayload = {
    amount: Math.round(Number(amount)),
    email,
    currency: currency || 'NGN',
    reference,
    // Paystack's field is callback_url; camelCase is silently ignored
    callback_url: callbackUrl,
    metadata: metadata || {},
    channels: channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
  };

  // Add escrow account routing
  if (platformSubaccount) {
    payload.subaccount = platformSubaccount;
    payload.bearer_type = "subaccount";
    payload.transaction_charge = 0;
  } else if (incomeSplitConfig && incomeSplitConfig.length > 0) {
    payload.subaccount = incomeSplitConfig[0]?.subAccountCode;
    payload.bearer_type = "subaccount";
    payload.transaction_charge = 0;
  }

  try {
    console.log("🌐 Calling Paystack API...");
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    
    const result = await resp.json();

    if (!result.status) {
      console.error("❌ Paystack API error:", result.message);
      return jsonResponse(resp.status, {
        error: result.message || "Paystack API error",
        details: result
      });
    }

    console.log("✅ Paystack transaction initialized successfully");
    const transactionReference = result.data.reference;
    const authorizationUrl = result.data.authorization_url;
    const accessCode = result.data.access_code;

    // Store escrow transaction in database
    if (supabase && orderId) {
      console.log("💾 Storing escrow transaction in database...");
      try {
        const { error: insertError } = await supabase.from('escrow_transactions').insert({
          user_id: userId,
          order_id: orderId,
          transaction_reference: transactionReference,
          payment_reference: reference,
          amount: amount,
          currency: currency,
          customer_email: email,
          status: "held",
          escrow_account_code: platformSubaccount || "STANDARD_TRANSACTION",
          original_income_split_config: incomeSplitConfig,
          created_at: new Date().toISOString()
        });

        if (insertError) {
          console.error("❌ Error inserting escrow transaction:", insertError);
        } else {
          console.log("✅ Escrow transaction stored");
        }

        // Update order
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            escrow_status: 'held',
            payment_gateway: 'paystack',
            payment_reference: reference,
            transaction_reference: transactionReference,
            is_anonymous_order: metadata?.is_anonymous || false
          })
          .eq('id', orderId);

        if (updateError) {
          console.error("❌ Error updating order:", updateError);
        } else {
          console.log("✅ Order updated");
        }
      } catch (dbError) {
        console.error("❌ Database error:", dbError);
      }
    }

    console.log("🎉 === ESCROW TRANSACTION INITIALIZATION SUCCESS ===");
    
    // Return both snake_case and camelCase for compatibility
    return jsonResponse(200, {
      status: true,
      message: "Escrow transaction initialized",
      data: {
        authorization_url: authorizationUrl,
        authorizationUrl: authorizationUrl,
        access_code: accessCode,
        accessCode: accessCode,
        reference: transactionReference,
        escrowStatus: "held",
        escrow_status: "held"
      }
    });
  } catch (error) {
    console.error("❌ === ESCROW TRANSACTION INITIALIZATION FAILED ===");
    console.error("❌ Error:", error);
    
    return handleCommonError(error, "Paystack escrow transaction initialization");
  }
});
