import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
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
        account_number: testAccountNumber,
        bank_code: testBankCode,
        account_name: "Test Account Name",
        bank_name: "Test Bank Name"
      },
      request_data: {
        account_number: testAccountNumber,
        bank_code: testBankCode
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
    // Get Paystack credentials from environment
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    // We require Paystack credentials for this operation
    if (!PAYSTACK_SECRET_KEY) {
      return jsonResponse(500, { error: "Paystack credentials not configured" });
    }

    // Call Paystack API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const params = new URLSearchParams({
      account_number: accountNumber,
      bank_code: bankCode,
    });

    const resp = await fetch(`https://api.paystack.co/bank/resolve?${params}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (resp.status !== 200 || !result.status) {
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

    // Success: return account verification details
    return jsonResponse(200, {
      status: true,
      message: "Account verified",
      data: result.data
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