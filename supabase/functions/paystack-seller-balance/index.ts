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
    return handleCorsOptions();
  }

  // Only allow GET
  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Parse query parameters
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  // Validate required parameters
  if (!userId) {
    return jsonResponse(400, {
      error: "Missing required parameter",
      required: ["userId"]
    });
  }

  // Check for development mode
  const isDevelopmentMode = url.searchParams.get('dev_mode') === 'true' || Deno.env.get("DEV_MODE") === "true";

  // Handle development mode
  if (isDevelopmentMode) {
    console.log("Development mode - returning mock Paystack seller balance");

    // Generate a random balance between 0 and 100,000 (in kobo)
    const mockBalance = Math.floor(Math.random() * 10000000);

    return jsonResponse(200, {
      status: true,
      message: "Mock balance retrieved (Development Mode)",
      dev_mode: true,
      data: {
        balance: mockBalance,
        currency: "NGN",
        userId: userId
      }
    });
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  try {
    // Call Paystack Balance API to get the user's balance
    // This returns the available balance in the connected Paystack account
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const resp = await fetch("https://api.paystack.co/balance", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (!result.status) {
      // Log detailed error info
      console.error("Paystack Balance API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Paystack error message with detailed info
      return jsonResponse(resp.status, {
        error: result.message || "Paystack Balance API error",
        details: result
      });
    }

    // Success: return balance details
    const balanceData = Array.isArray(result.data) ? result.data[0] : result.data;
    const balanceInKobo = balanceData.balance; // Paystack returns balance in kobo

    return jsonResponse(200, {
      status: true,
      message: "Balance retrieved successfully",
      data: {
        balance: balanceInKobo,
        currency: balanceData.currency || "NGN",
        userId: userId
      }
    });
  } catch (error: any) {
    return handleCommonError(error, "Paystack seller balance retrieval");
  }
  }
});