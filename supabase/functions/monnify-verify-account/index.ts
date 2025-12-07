import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
  if (data.account_number && !data.accountNumber) {
    data.accountNumber = data.account_number;
  }
  if (data.bank_code && !data.bankCode) {
    data.bankCode = data.bank_code;
  }

  // Destructure required fields
  const {
    accountNumber,
    bankCode
  } = data;

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Use provided data or defaults for testing
    const testAccountNumber = accountNumber || "0000000000";
    const testBankCode = bankCode || "057";

    // Create mock account verification response
    return jsonResponse(200, {
      status: true,
      message: "Account verified (Development Mode)",
      dev_mode: true,
      data: {
        accountNumber: testAccountNumber,
        bankCode: testBankCode,
        accountName: "Test Account Name",
        bankName: "Test Bank Name"
      },
      request_data: {
        accountNumber: testAccountNumber,
        bankCode: testBankCode
      }
    });
  }

  // Validate required fields
  if (!accountNumber || !bankCode) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["accountNumber", "bankCode"]
    });
  }

  try {
    // Get Monnify credentials from environment
    const MONNIFY_API_KEY = Deno.env.get("MONNIFY_API_KEY");
    const MONNIFY_SECRET_KEY = Deno.env.get("MONNIFY_SECRET_KEY");

    // We require Monnify credentials for this operation
    if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
      return jsonResponse(500, { error: "Monnify credentials not configured" });
    }

    // Call Monnify API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Auth = btoa(authString);

    // Prepare query parameters
    const queryParams = new URLSearchParams({
      accountNumber: accountNumber,
      bankCode: bankCode
    });

    const resp = await fetch(`https://api.monnify.com/api/v1/disbursements/validate-account?${queryParams}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${base64Auth}`,
        "Content-Type": "application/json"
      },
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

    // Success: return account verification details
    return jsonResponse(200, {
      status: true,
      message: "Account verified",
      data: result.responseBody
    });
  } catch (error: any) {
    console.error("Error verifying account:", error);

    // Check for timeout error
    if (error.name === "AbortError") {
      return jsonResponse(504, { error: "API request timed out" });
    }

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});