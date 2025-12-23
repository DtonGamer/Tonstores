import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

// Define interface for Paystack initialize transaction payload
interface PaystackInitializeTransactionPayload {
  amount: number;
  email: string;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: any;
  channels?: string[];
  subaccount?: string;
  transaction_charge?: number;
  bearer_type?: string;
  bearer_subaccount?: string;
}

serve(async (req) => {
  console.log("🚀 === ESCROW TRANSACTION INITIALIZATION START ===");
  console.log("📥 Request Method:", req.method);
  console.log("📥 Request URL:", req.url);
  
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS OPTIONS request");
    return handleCorsOptions();
  }

  // Only allow POST
  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Parse JSON body
  let data;
  try {
    data = await req.json();
    console.log("📦 Raw request body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error parsing JSON body:", err);
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  // Check for development mode
  const devMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true" || isDevelopmentMode();
  console.log("🔧 Development mode:", devMode);

  // Map snake_case field names to camelCase if they exist
  if (data.payment_reference && !data.paymentReference) {
    data.paymentReference = data.payment_reference;
  }
  if (data.customer_email && !data.email) {
    data.email = data.customer_email;
  }
  if (data.callback_url && !data.callbackUrl) {
    data.callbackUrl = data.callback_url;
  }
  if (data.return_url && !data.returnUrl) {
    data.returnUrl = data.return_url;
  }
  if (data.custom_description && !data.customDescription) {
    data.customDescription = data.custom_description;
  }
  if (data.charge_redirect_url && !data.chargeRedirectUrl) {
    data.chargeRedirectUrl = data.charge_redirect_url;
  }
  if (data.income_split_config && !data.incomeSplitConfig) {
    data.incomeSplitConfig = data.income_split_config;
  }

  // Destructure required fields
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
    currency,
    reference,
    callbackUrl: callbackUrl?.substring(0, 50) + "...",
    userId,
    orderId,
    hasMetadata: !!metadata,
    hasChannels: !!channels,
    hasIncomeSplitConfig: !!incomeSplitConfig,
    splitConfigCount: incomeSplitConfig?.length || 0
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
      transactionReference: mockTransactionReference,
      authorization_url: mockAuthorizationUrl,
      escrow_status: "held",
      data: {
        transactionReference: mockTransactionReference,
        authorization_url: mockAuthorizationUrl,
        amount: amount,
        currency: currency,
        email: email,
        reference: reference,
        escrow_account_code: "DEV_PLATFORM_ESCROW_ACCT",
        original_transaction_split: data.incomeSplitConfig,
        funds_destination: "platform_escrow_account"
      }
    });
  }

  // Initialize Supabase client
  console.log("🔌 Initializing Supabase client...");
  const supabase = createSupabaseClient();
  if (!supabase) {
    console.error("❌ Supabase configuration is missing");
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }
  console.log("✅ Supabase client initialized");

  // Fetch the platform escrow account
  console.log("🔍 Fetching platform escrow account...");
  const { data: platformAccountData, error: platformAccountError } = await supabase
    .from('platform_accounts')
    .select('paystack_subaccount_code')
    .eq('is_escrow_account', true)
    .eq('is_active', true)
    .single();

  let platformSubaccount;
  if (platformAccountError || !platformAccountData) {
    console.error("⚠️ Error fetching platform escrow account:", platformAccountError);
    console.log("⚠️ Proceeding with standard transaction as fallback");
    platformSubaccount = null;
  } else {
    platformSubaccount = platformAccountData.paystack_subaccount_code;
    console.log("✅ Platform escrow account found:", platformSubaccount);
  }

  // Validate required fields
  if (!amount || !email || !reference || !callbackUrl) {
    console.error("❌ Missing required fields:", {
      hasAmount: !!amount,
      hasEmail: !!email,
      hasReference: !!reference,
      hasCallbackUrl: !!callbackUrl
    });
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["amount", "email", "reference", "callbackUrl"]
    });
  }

  if (!userId) {
    console.warn("⚠️ User ID is missing in escrow transaction initialization");
  }

  // Store original income split configuration
  if (incomeSplitConfig && orderId) {
    console.log("💾 Storing income split configuration...");
    console.log("Split configs to store:", incomeSplitConfig.length);
    
    for (const splitConfig of incomeSplitConfig) {
      console.log("  - Storing split:", {
        subaccount: splitConfig.subAccountCode,
        feePercentage: splitConfig.feePercentage,
        splitPercentage: splitConfig.splitPercentage
      });
      
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
        console.log("  ✅ Split config stored successfully");
      } catch (splitError) {
        console.error("  ❌ Error storing split config:", splitError);
      }
    }
  }

  // Get Paystack credentials
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  console.log("🔑 Paystack secret key exists:", !!PAYSTACK_SECRET_KEY);
  console.log("🔑 Paystack secret key length:", PAYSTACK_SECRET_KEY?.length || 0);

  if (!PAYSTACK_SECRET_KEY) {
    console.error("❌ Paystack credentials not configured");
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  // Prepare payload for Paystack
  console.log("📝 Preparing Paystack payload...");
  const payload: PaystackInitializeTransactionPayload = {
    amount: Math.round(Number(amount)),
    email,
    currency: currency || 'NGN',
    reference,
    callbackUrl,
    metadata: metadata || {},
    channels: channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
  };

  console.log("📝 Base payload:", {
    amount: payload.amount,
    email: payload.email,
    currency: payload.currency,
    reference: payload.reference,
    callbackUrl: payload.callbackUrl?.substring(0, 50) + "...",
    channelCount: payload.channels?.length,
    hasMetadata: !!payload.metadata
  });

  // Add escrow account routing
  if (platformSubaccount) {
    console.log("💰 Adding platform escrow routing to payload");
    payload.subaccount = platformSubaccount;
    payload.bearer_type = "subaccount";
    payload.transaction_charge = 0;
    console.log("  - Subaccount:", platformSubaccount);
    console.log("  - Bearer type:", payload.bearer_type);
    console.log("  - Transaction charge:", payload.transaction_charge);
  } else {
    if (incomeSplitConfig && incomeSplitConfig.length > 0) {
      console.log("💰 Using fallback routing with split config");
      payload.subaccount = incomeSplitConfig[0]?.subAccountCode;
      payload.bearer_type = "subaccount";
      payload.transaction_charge = 0;
      console.log("  - Fallback subaccount:", payload.subaccount);
    } else {
      console.log("⚠️ No escrow routing configured - using standard transaction");
    }
  }

  console.log("📤 Final payload to Paystack:", JSON.stringify(payload, null, 2));

  try {
    console.log("🌐 Calling Paystack API...");
    console.log("🌐 URL: https://api.paystack.co/transaction/initialize");
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.error("⏱️ Request timeout after 15 seconds");
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
    
    console.log("📨 Paystack response status:", resp.status);
    console.log("📨 Paystack response status text:", resp.statusText);
    console.log("📨 Paystack response headers:", Object.fromEntries(resp.headers.entries()));

    const result = await resp.json();
    console.log("📨 Paystack response body:", JSON.stringify(result, null, 2));

    if (!result.status) {
      console.error("❌ Paystack API returned error status");
      console.error("❌ Error details:", {
        status: resp.status,
        statusText: resp.statusText,
        message: result.message,
        fullResult: result
      });

      return jsonResponse(resp.status, {
        error: result.message || "Paystack API error",
        details: result
      });
    }

    console.log("✅ Paystack transaction initialized successfully");
    const transactionReference = result.data.reference;
    const authorizationUrl = result.data.authorization_url;
    const accessCode = result.data.access_code;

    console.log("✅ Transaction details:", {
      reference: transactionReference,
      authorizationUrl: authorizationUrl?.substring(0, 50) + "...",
      accessCode
    });

    // Store escrow transaction in database
    if (supabase && userId) {
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
          console.log("✅ Escrow transaction stored successfully");
        }

        // Update order
        if (orderId) {
          console.log("💾 Updating order status...");
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              escrow_status: 'held',
              payment_gateway: 'paystack'
            })
            .eq('id', orderId);

          if (updateError) {
            console.error("❌ Error updating order:", updateError);
          } else {
            console.log("✅ Order updated successfully");
          }
        }
      } catch (dbError) {
        console.error("❌ Database error:", dbError);
      }
    }

    console.log("🎉 === ESCROW TRANSACTION INITIALIZATION SUCCESS ===");
    return jsonResponse(200, {
      status: true,
      message: "Escrow transaction initialized",
      data: {
        ...mapSnakeToCamel(result.data),
        escrow_status: "held",
        escrow_account_code: platformSubaccount,
        original_transaction_split: incomeSplitConfig,
        funds_destination: platformSubaccount ? "platform_escrow_account" : "standard_account"
      }
    });
  } catch (error) {
    console.error("❌ === ESCROW TRANSACTION INITIALIZATION FAILED ===");
    console.error("❌ Error type:", error?.constructor?.name);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error stack:", error?.stack);
    console.error("❌ Full error object:", error);
    
    return handleCommonError(error, "Paystack escrow transaction initialization");
  }
});