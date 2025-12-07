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
    incomeSplitConfig,
    customDescription,
    chargeRedirectUrl,
    metadata,
    userId
  } = data;

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Use provided data or defaults for testing
    const testAmount = amount || 10000; // 100.00 in smallest currency unit
    const testCurrency = currencyCode || "NGN";
    const testCustomerName = customerName || "Test Customer";
    const testCustomerEmail = customerEmail || "test@example.com";
    const testPaymentRef = paymentReference || `MNFY_${Math.random().toString(36).substring(2, 10)}`;
    const testUserId = userId || "test-user-123";

    // Create mock transaction response
    const mockTransactionReference = `MNFY|${Math.floor(10 + Math.random() * 90)}|${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '')}|${String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6)}`;
    const mockCheckoutUrl = "https://sandbox.monnify.com/pay/" + testPaymentRef;
    const mockAccountNumber = `200${Math.random().toString().substring(2, 12)}`;

    return jsonResponse(200, {
      status: true,
      message: "Transaction initialized (Development Mode)",
      dev_mode: true,
      data: {
        transactionReference: mockTransactionReference,
        contractCode: contractCode || "CONTRACT_CODE",
        amount: testAmount,
        currencyCode: testCurrency,
        paymentReference: testPaymentRef,
        customer: {
          customerName: testCustomerName,
          customerEmail: testCustomerEmail
        },
        paymentStatus: "AWAITING_PAYMENT",
        checkoutUrl: mockCheckoutUrl,
        accountNumber: mockAccountNumber, // For bank transfer
        accountName: "Test Merchant Account",
        bankName: "Test Bank",
        description: description || "Test Payment",
        transactionDate: new Date().toISOString()
      },
      request_data: {
        userId: testUserId,
        amount: testAmount,
        currencyCode: testCurrency,
        customerEmail: testCustomerEmail,
        paymentReference: testPaymentRef
      }
    });
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
    console.warn("User ID is missing in transaction initialization");
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

  // Get Monnify credentials from environment
  const MONNIFY_API_KEY = Deno.env.get("MONNIFY_API_KEY");
  const MONNIFY_SECRET_KEY = Deno.env.get("MONNIFY_SECRET_KEY");

  // We require Monnify credentials for this operation
  if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
    return jsonResponse(500, { error: "Monnify credentials not configured" });
  }

  // Prepare payload for Monnify according to their API documentation
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
    ...(incomeSplitConfig && { incomeSplitConfig }),
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

    // Store transaction info in database if supabase is available
    if (supabase && userId) {
      try {
        await supabase.from('transactions').insert({
          user_id: userId,
          transaction_reference: transactionReference,
          payment_reference: paymentReference,
          amount: amount,
          currency: currencyCode,
          customer_email: customerEmail,
          status: "initialized",
          checkout_url: checkoutUrl,
          created_at: new Date().toISOString()
        });

      } catch (dbError) {
        console.error("Error storing transaction in database:", dbError);
        // Continue with response - we still initialized the transaction, just failed to update local DB
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Transaction initialized",
      transactionReference: transactionReference,
      checkoutUrl: checkoutUrl,
      data: result.responseBody
    });
  } catch (error: any) {
    console.error("Error initializing transaction:", error);

    // Check for timeout error
    if (error.name === "AbortError") {
      return jsonResponse(504, { error: "API request timed out" });
    }

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});