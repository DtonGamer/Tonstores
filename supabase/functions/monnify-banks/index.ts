import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Expires": "0"
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
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }

  // Only allow GET
  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Check for development mode
  const url = new URL(req.url);
  const isDevelopmentMode = url.searchParams.get("dev_mode") === "true" || Deno.env.get("DEV_MODE") === "true";

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Return mock banks data
    const mockBanks = [
      {
        bankCode: "044",
        bankName: "Access Bank",
        enabled: true
      },
      {
        bankCode: "023",
        bankName: "Citibank Nigeria",
        enabled: true
      },
      {
        bankCode: "050",
        bankName: "EcoBank Nigeria",
        enabled: true
      },
      {
        bankCode: "070",
        bankName: "Fidelity Bank",
        enabled: true
      },
      {
        bankCode: "011",
        bankName: "First Bank of Nigeria",
        enabled: true
      },
      {
        bankCode: "214",
        bankName: "First City Monument Bank",
        enabled: true
      },
      {
        bankCode: "058",
        bankName: "Guaranty Trust Bank",
        enabled: true
      },
      {
        bankCode: "030",
        bankName: "Heritage Bank",
        enabled: true
      },
      {
        bankCode: "301",
        bankName: "Jaiz Bank",
        enabled: true
      },
      {
        bankCode: "082",
        bankName: "Keystone Bank",
        enabled: true
      },
      {
        bankCode: "014",
        bankName: "Mainstreet Bank",
        enabled: true
      },
      {
        bankCode: "076",
        bankName: "Polaris Bank",
        enabled: true
      },
      {
        bankCode: "221",
        bankName: "Stanbic IBTC Bank",
        enabled: true
      },
      {
        bankCode: "068",
        bankName: "Standard Chartered Bank",
        enabled: true
      },
      {
        bankCode: "232",
        bankName: "Sterling Bank",
        enabled: true
      },
      {
        bankCode: "039",
        bankName: "Wema Bank",
        enabled: true
      },
      {
        bankCode: "057",
        bankName: "Zenith Bank",
        enabled: true
      }
    ];

    return jsonResponse(200, {
      status: true,
      message: "Banks retrieved (Development Mode)",
      dev_mode: true,
      data: mockBanks,
      total: mockBanks.length
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

    const resp = await fetch("https://api.monnify.com/api/v1/bank", {
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

    // Success: return banks list
    return jsonResponse(200, {
      status: true,
      message: "Banks retrieved",
      data: result.responseBody,
      total: Array.isArray(result.responseBody) ? result.responseBody.length : 0
    });
  } catch (error: any) {
    console.error("Error retrieving banks:", error);

    // Check for timeout error
    if (error.name === "AbortError") {
      return jsonResponse(504, { error: "API request timed out" });
    }

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});