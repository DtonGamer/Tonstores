import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  // Destructure required fields based on Monnify income split config
  const {
    incomeSplitConfig,
    userId
  } = data;

  // Handle development mode with test data
  if (isDevelopmentMode) {
    // Use provided data or defaults for testing
    const testUserId = userId || "test-user-123";
    const testIncomeSplitConfig = incomeSplitConfig || [
      {
        subAccountCode: "SUB_ACCT_123456",
        feePercentage: 10,
        splitPercentage: 80,
        feeBearer: true
      }
    ];

    // Create mock split configuration response
    return jsonResponse(200, {
      status: true,
      message: "Split configuration created (Development Mode)",
      dev_mode: true,
      data: {
        incomeSplitConfig: testIncomeSplitConfig,
        splitReference: `SPLIT_${Math.random().toString(36).substring(2, 10)}`,
        status: "ACTIVE"
      },
      request_data: {
        userId: testUserId,
        incomeSplitConfig: testIncomeSplitConfig
      }
    });
  }

  // Validate required fields
  if (!incomeSplitConfig || !Array.isArray(incomeSplitConfig) || incomeSplitConfig.length === 0) {
    return jsonResponse(400, {
      error: "Missing required incomeSplitConfig array",
      required: ["incomeSplitConfig"]
    });
  }

  // Validate each split configuration
  for (const config of incomeSplitConfig) {
    if (!config.subAccountCode || config.feePercentage === undefined || config.splitPercentage === undefined || config.feeBearer === undefined) {
      return jsonResponse(400, {
        error: "Each income split config must include subAccountCode, feePercentage, splitPercentage, and feeBearer",
        required: ["subAccountCode", "feePercentage", "splitPercentage", "feeBearer"]
      });
    }
  }

  // Get user ID for database storage (optional but recommended)
  if (!userId) {
    console.warn("User ID is missing in split configuration");
  }

  try {
    // Get Monnify credentials from environment
    const MONNIFY_API_KEY = Deno.env.get("MONNIFY_API_KEY");
    const MONNIFY_SECRET_KEY = Deno.env.get("MONNIFY_SECRET_KEY");

    // We require Monnify credentials for this operation
    if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
      return jsonResponse(500, { error: "Monnify credentials not configured" });
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

    // Prepare payload for Monnify according to their API documentation
    // Note: Monnify doesn't have a direct "create split" endpoint like Paystack
    // Instead, the split configuration is passed during transaction initialization
    // We'll store this configuration in the database for later use during transaction initialization
    
    // Store split configuration in database
    if (supabase && userId) {
      // First, remove existing split configs for this user
      await supabase
        .from('income_split_configs')
        .delete()
        .eq('user_id', userId);

      // Then insert new configs
      for (const config of incomeSplitConfig) {
        await supabase
          .from('income_split_configs')
          .insert({
            user_id: userId,
            subaccount_code: config.subAccountCode,
            fee_percentage: config.feePercentage,
            split_percentage: config.splitPercentage,
            fee_bearer: config.feeBearer,
            status: "active",
            created_at: new Date().toISOString()
          });
      }
    }

    // Since Monnify doesn't have a direct API for creating splits,
    // we'll just return the configuration that was stored
    return jsonResponse(200, {
      status: true,
      message: "Split configuration stored successfully",
      data: {
        incomeSplitConfig,
        status: "ACTIVE"
      }
    });
  } catch (error: any) {
    console.error("Error processing split configuration:", error);

    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});