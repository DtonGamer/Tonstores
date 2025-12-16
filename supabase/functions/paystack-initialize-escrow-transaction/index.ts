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
  amount: number; // Amount in kobo
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
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Parse JSON body
  let data;
  try {
    data = await req.json();
  } catch (err) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  // Check for development mode
  const isDevelopmentMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true";

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

  // Destructure required fields based on Paystack documentation
  const {
    amount, // in kobo
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

  // Handle development mode
  if (isDevelopmentMode) {
    console.log("Development mode - returning mock escrow transaction initialization");

    // Generate a mock transaction reference
    const mockTransactionReference = `DEV_ESCROW_${Math.floor(Math.random() * 1000000)}`;
    const mockAuthorizationUrl = `https://test.paystack.com/checkout/${mockTransactionReference}`;

    // Return mock response similar to Paystack API
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
        original_transaction_split: data.incomeSplitConfig, // Include original split for reference
        funds_destination: "platform_escrow_account" // Clarify where funds are going
      }
    });
  }

  // Get platform escrow account from database to hold funds initially
  let platformSubaccount;
  // Initialize Supabase client to fetch platform account details from the database using shared utility
  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  // Fetch the platform escrow account details from the database
  const { data: platformAccountData, error: platformAccountError } = await supabase
    .from('platform_accounts')
    .select('paystack_subaccount_code')
    .eq('is_escrow_account', true)
    .eq('is_active', true)
    .single();

  if (platformAccountError || !platformAccountData) {
    console.error("Error fetching platform escrow account:", platformAccountError);
    console.log("Proceeding with standard transaction as fallback");
    // For fallback, we'll process as a standard transaction but mark as escrow in DB
    platformSubaccount = null;
  } else {
    platformSubaccount = platformAccountData.paystack_subaccount_code;
  }

  // Validate required fields according to Paystack docs
  if (!amount || !email || !reference || !callbackUrl) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["amount", "email", "reference", "callbackUrl"]
    });
  }

  // Get user ID for database storage (optional but recommended)
  if (!userId) {
    console.warn("User ID is missing in escrow transaction initialization");
  }

  // Store original income split configuration for later use during release
  if (incomeSplitConfig && orderId) {
    // Store the original split configuration to use when releasing funds from escrow
    for (const splitConfig of incomeSplitConfig) {
      await supabase.from('income_split_configs').upsert({
        user_id: userId,
        order_id: orderId,
        subaccount_code: splitConfig.subAccountCode,
        fee_percentage: splitConfig.feePercentage,
        split_percentage: splitConfig.splitPercentage,
        fee_bearer: splitConfig.feeBearer,
        status: "pending_release", // Will be active when funds are released
        created_at: new Date().toISOString()
      }, {
        onConflict: 'order_id,subaccount_code' // Only upsert if this combination doesn't exist
      });
    }
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  // Prepare payload for Paystack according to their API documentation
  // For escrow, we want to route funds through a platform account if available
  const payload: PaystackInitializeTransactionPayload = {
    amount: Math.round(Number(amount)), // Paystack expects amount in kobo
    email,
    currency: currency || 'NGN',
    reference,
    callbackUrl,
    metadata: metadata || {},
    channels: channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
  };

  // If we have a platform escrow account, add subaccount information
  if (platformSubaccount) {
    // For escrow transactions, route to the platform account initially
    payload.subaccount = platformSubaccount;
    payload.bearer_type = "subaccount";
    payload.transaction_charge = 0; // Platform covers the fee initially
  } else {
    // If no platform account is available, try to use the original split config to route
    // funds to the platform temporarily
    if (incomeSplitConfig && incomeSplitConfig.length > 0) {
      // Use the first split configuration as the platform account temporarily
      payload.subaccount = platformSubaccount || incomeSplitConfig[0]?.subAccountCode;
      payload.bearer_type = "subaccount";
      payload.transaction_charge = 0;
    }
  }

  try {
    // Call Paystack API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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
      // Log detailed error info
      console.error("Paystack API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Paystack error message with detailed info
      return jsonResponse(resp.status, {
        error: result.message || "Paystack API error",
        details: result
      });
    }

    // Success: return transaction details
    const transactionReference = result.data.reference;
    const authorizationUrl = result.data.authorization_url;
    const accessCode = result.data.access_code;

    // Store escrow transaction info in database
    if (supabase && userId) {
      try {
        await supabase.from('escrow_transactions').insert({
          user_id: userId,
          order_id: orderId,
          transaction_reference: transactionReference,
          payment_reference: reference,
          amount: amount,
          currency: currency,
          customer_email: email,
          status: "held", // Initially held in escrow
          escrow_account_code: platformSubaccount || "STANDARD_TRANSACTION",
          original_income_split_config: incomeSplitConfig, // Store original config
          created_at: new Date().toISOString()
        });

        // Also update the order to reflect that it's in escrow
        if (orderId) {
          await supabase
            .from('orders')
            .update({ 
              escrow_status: 'held',
              payment_gateway: 'paystack'
            })
            .eq('id', orderId);
        }
      } catch (dbError) {
        console.error("Error storing escrow transaction in database:", dbError);
        // Continue with response - we still initialized the transaction, just failed to update local DB
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Escrow transaction initialized",
      data: {
        ...result.data,
        escrow_status: "held",
        escrow_account_code: platformSubaccount,
        original_transaction_split: incomeSplitConfig, // Include original split for reference
        funds_destination: platformSubaccount ? "platform_escrow_account" : "standard_account"
      }
    });
  } catch (error: any) {
    return handleCommonError(error, "Paystack escrow transaction initialization");
  }
});