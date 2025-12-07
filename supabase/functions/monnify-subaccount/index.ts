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

// Define interface for Monnify subaccount payload
interface MonnifySubaccountPayload {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  currencyCode: string;
  percentageCharge: number;
  additionalInformation?: string;
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
  // This allows the API to support both naming conventions
  if (data.account_name && !data.accountName) {
    data.accountName = data.account_name;
  }
  if (data.account_number && !data.accountNumber) {
    data.accountNumber = data.account_number;
  }
  if (data.bank_code && !data.bankCode) {
    data.bankCode = data.bank_code;
  }
  if (data.currency_code && !data.currencyCode) {
    data.currencyCode = data.currency_code;
  }
  if (data.percentage_charge !== undefined && data.percentageCharge === undefined) {
    data.percentageCharge = data.percentage_charge;
  }
  if (data.user_id && !data.userId) {
    data.userId = data.user_id;
  }
  if (data.additional_information && !data.additionalInformation) {
    data.additionalInformation = data.additional_information;
  }

  // Destructure required fields based on Monnify documentation
  const {
    accountName,
    accountNumber,
    bankCode,
    currencyCode,
    percentageCharge,
    additionalInformation,
    metadata,
    userId
  } = data;

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Use provided data or defaults for testing
    const testName = accountName || "Test Business";
    const testBankCode = bankCode || "057";
    const testAccountNumber = accountNumber || "0000000000";
    const testPercentageCharge = percentageCharge || 2;
    const testUserId = userId || "test-user-123";

    // Create mock subaccount response
    const mockSubaccountCode = `SUB_${Math.random().toString(36).substring(2, 10)}`;
    const mockAccountReference = `ACC_${Math.random().toString(36).substring(2, 10)}`;

    return jsonResponse(200, {
      status: true,
      message: "Subaccount created (Development Mode)",
      subaccountCode: mockSubaccountCode,
      dev_mode: true,
      data: {
        accountReference: mockAccountReference,
        accountName: testName,
        accountNumber: testAccountNumber,
        currencyCode: currencyCode || "NGN",
        bankName: "Zenith Bank",
        bankCode: testBankCode,
        bankAccountName: testName,
        percentageCharge: testPercentageCharge,
        virtualAccountNumber: `200${Math.random().toString().substring(2, 12)}`,
        reservedAccountType: "GENERAL",
        isActive: true,
        subaccountCode: mockSubaccountCode,
        createdAt: new Date().toISOString()
      },
      request_data: {
        userId: testUserId,
        accountName: testName,
        bankCode: testBankCode,
        accountNumber: testAccountNumber,
        percentageCharge: testPercentageCharge,
        currencyCode: currencyCode || "NGN"
      }
    });
  }

  // Validate required fields according to Monnify docs
  if (!accountName || !accountNumber || !bankCode || percentageCharge === undefined || !currencyCode) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["accountName", "accountNumber", "bankCode", "percentageCharge", "currencyCode"]
    });
  }

  // Get user ID for database storage
  if (!userId) {
    return jsonResponse(400, { error: "User ID is required" });
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
  const MONNIFY_CONTRACT_CODE = Deno.env.get("MONNIFY_CONTRACT_CODE");

  // We require Monnify credentials for this operation
  if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
    return jsonResponse(500, { error: "Monnify credentials not configured" });
  }

  // Prepare payload for Monnify according to their API documentation
  const payload: MonnifySubaccountPayload = {
    accountName,
    accountNumber,
    bankCode,
    currencyCode,
    percentageCharge: Number(percentageCharge),
    additionalInformation: additionalInformation || `Subaccount for ${accountName}`,
    metadata: metadata || {}
  };

  try {
    // Call Monnify API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Auth = btoa(authString);

    const resp = await fetch("https://api.monnify.com/api/v1/sub-account", {
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

    // Success: return subaccount code
    const subaccountCode = result.responseBody?.subAccountCode;
    const accountReference = result.responseBody?.accountReference;

    // Store account info in database if supabase is available
    if (supabase) {
      try {
        // Store bank details in payment_accounts table
        await supabase.from('payment_accounts').upsert({
          profile_id: userId,
          bank_name: result.responseBody?.bankName || bankCode,
          account_number: accountNumber,
          account_name: result.responseBody?.bankAccountName || accountName,
          subaccount_code: subaccountCode,
          created_at: new Date().toISOString()
        });

        // Update profile with subaccount code and KYC verification
        await supabase.from('profiles').update({
          monnify_subaccount_code: subaccountCode,
          kyc_verified: true,
          kyc_verified_at: new Date().toISOString()
        }).eq('id', userId);

      } catch (dbError) {
        console.error("Error updating user profile:", dbError);
        // Continue with response - we still created the subaccount, just failed to update local DB
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Subaccount created",
      subaccountCode: subaccountCode,
      accountReference: accountReference,
      data: result.responseBody
    });
  } catch (error: any) {
    console.error("Error creating subaccount:", error);

    // Check for timeout error
    if (error.name === "AbortError") {
      return jsonResponse(504, { error: "API request timed out" });
    }

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});