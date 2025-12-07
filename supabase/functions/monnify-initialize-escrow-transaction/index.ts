import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    },
  });
};

// Define interface for Monnify initialize transaction payload
interface MonnifyInitializeTransactionPayload {
  amount: number;
  currencyCode: string;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  description: string;
  callbackUrl: string;
  returnUrl?: string;
  contractCode?: string;
  paymentMethods?: string[];
  incomeSplitConfig?: Array<{
    subAccountCode: string;
    feePercentage: number;
    splitPercentage: number;
    feeBearer: boolean;
  }>;
  customDescription?: string;
  chargeRedirectUrl?: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
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
  if (data.customer_name && !data.customerName) {
    data.customerName = data.customer_name;
  }
  if (data.customer_email && !data.customerEmail) {
    data.customerEmail = data.customer_email;
  }
  if (data.callback_url && !data.callbackUrl) {
    data.callbackUrl = data.callback_url;
  }
  if (data.return_url && !data.returnUrl) {
    data.returnUrl = data.return_url;
  }
  if (data.contract_code && !data.contractCode) {
    data.contractCode = data.contract_code;
  }
  if (data.income_split_config && !data.incomeSplitConfig) {
    data.incomeSplitConfig = data.income_split_config;
  }
  if (data.custom_description && !data.customDescription) {
    data.customDescription = data.custom_description;
  }
  if (data.charge_redirect_url && !data.chargeRedirectUrl) {
    data.chargeRedirectUrl = data.charge_redirect_url;
  }

  // Destructure required fields based on Monnify documentation
  const {
    amount,
    currencyCode,
    customerName,
    customerEmail,
    paymentReference,
    description,
    callbackUrl,
    returnUrl,
    contractCode,
    paymentMethods,
    customDescription,
    chargeRedirectUrl,
    metadata,
    userId,
    orderId
  } = data;

  // Get platform escrow account from database to hold funds initially
  let platformIncomeSplitConfig;
  if (!isDevelopmentMode) {
    // Initialize Supabase client to fetch platform account details from the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the platform escrow account details from the database
    const { data: platformAccountData, error: platformAccountError } = await supabase
      .from('platform_accounts')
      .select('monnify_subaccount_code')
      .eq('is_escrow_account', true)
      .eq('is_active', true)
      .single();

    if (platformAccountError || !platformAccountData) {
      console.error("Error fetching platform escrow account:", platformAccountError);
      return jsonResponse(500, { 
        error: "Platform escrow account not configured", 
        details: platformAccountError?.message 
      });
    }

    // For escrow transactions, 100% of funds go to the platform escrow account initially
    // The original split configuration is stored for later release
    platformIncomeSplitConfig = [
      {
        subAccountCode: platformAccountData.monnify_subaccount_code,
        feePercentage: 0, // Fees will be handled separately when releasing
        splitPercentage: 100, // 100% goes to platform escrow initially
        feeBearer: true
      }
    ];
  } else {
    // In development mode, use a mock platform subaccount
    platformIncomeSplitConfig = [
      {
        subAccountCode: "DEV_PLATFORM_ESCROW_ACCT",
        feePercentage: 0,
        splitPercentage: 100,
        feeBearer: true
      }
    ];
  }

  // Validate required fields according to Monnify docs
  if (!amount || !currencyCode || !customerEmail || !paymentReference || !description || !callbackUrl) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["amount", "currencyCode", "customerEmail", "paymentReference", "description", "callbackUrl"]
    });
  }

  // Get user ID for database storage (optional but recommended)
  if (!userId) {
    console.warn("User ID is missing in escrow transaction initialization");
  }

  // Initialize Supabase client if environment variables are available
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let supabase;

  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } else {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  // Store original income split configuration for later use during release
  if (data.incomeSplitConfig && orderId) {
    // Store the original split configuration to use when releasing funds from escrow
    for (const splitConfig of data.incomeSplitConfig) {
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

  // Get Monnify credentials from environment
  const MONNIFY_API_KEY = Deno.env.get("MONNIFY_API_KEY");
  const MONNIFY_SECRET_KEY = Deno.env.get("MONNIFY_SECRET_KEY");

  // We require Monnify credentials for this operation
  if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
    return jsonResponse(500, { error: "Monnify credentials not configured" });
  }

  // Prepare payload for Monnify according to their API documentation
  // In escrow mode, we route all funds to the platform account initially
  const payload: MonnifyInitializeTransactionPayload = {
    amount: Number(amount),
    currencyCode: currencyCode,
    customerName: customerName || "",
    customerEmail,
    paymentReference,
    description,
    callbackUrl,
    ...(returnUrl && { returnUrl }),
    ...(contractCode && { contractCode }),
    ...(paymentMethods && { paymentMethods }),
    incomeSplitConfig: platformIncomeSplitConfig, // Use platform escrow split configuration
    ...(customDescription && { customDescription }),
    ...(chargeRedirectUrl && { chargeRedirectUrl }),
    ...(metadata && { metadata })
  };

  try {
    // Call Monnify API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Auth = btoa(authString);

    const resp = await fetch("https://api.monnify.com/api/v1/merchant/transaction/init-transaction", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${base64Auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (resp.status !== 200 || !result.requestSuccessful) {
      // Log detailed error info
      console.error("Monnify API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Monnify error message with detailed info
      return jsonResponse(resp.status, {
        error: result.responseMessage || "Monnify API error",
        details: result
      });
    }

    // Success: return transaction details
    const transactionReference = result.responseBody?.transactionReference;
    const checkoutUrl = result.responseBody?.checkoutUrl;

    // Store escrow transaction info in database
    if (supabase && userId) {
      try {
        await supabase.from('escrow_transactions').insert({
          user_id: userId,
          order_id: orderId,
          transaction_reference: transactionReference,
          payment_reference: paymentReference,
          amount: amount,
          currency: currencyCode,
          customer_email: customerEmail,
          status: "held", // Initially held in escrow
          escrow_account_code: platformIncomeSplitConfig[0].subAccountCode,
          original_income_split_config: data.incomeSplitConfig, // Store original config
          created_at: new Date().toISOString()
        });

        // Also update the order to reflect that it's in escrow
        if (orderId) {
          await supabase
            .from('orders')
            .update({ escrow_status: 'held' })
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
      transactionReference: transactionReference,
      checkoutUrl: checkoutUrl,
      escrow_status: "held",
      data: {
        ...result.responseBody,
        escrow_account_code: platformIncomeSplitConfig[0].subAccountCode,
        original_transaction_split: data.incomeSplitConfig, // Include original split for reference
        funds_destination: "platform_escrow_account" // Clarify where funds are going
      }
    });
  } catch (error: any) {
    console.error("Error initializing escrow transaction:", error);

    // Check for timeout error
    if (error.name === "AbortError") {
      return jsonResponse(504, { error: "API request timed out" });
    }

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});