import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

interface CreateLedgerEntryParams {
  subaccount_code: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  description: string;
  seller_id: string;
}

interface CreateLedgerEntryRequest {
  params: CreateLedgerEntryParams;
}

interface ResponseBody {
  success: boolean;
  error?: string;
}

function jsonResponse(status: number, body: ResponseBody) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Client-Source, X-Guest-ID, apikey, cache-control, pragma",
      "Pragma": "no-cache"
    },
  });
}

// Handle CORS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Client-Source, X-Guest-ID, apikey, cache-control, pragma",
      "Pragma": "no-cache"
    },
  });
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return handleOptions();
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return jsonResponse(405, { success: false, error: "Method not allowed" });
    }

    // Parse request body
    const requestData: CreateLedgerEntryRequest = await req.json();

    // Check for development mode
    const isDevelopmentMode = requestData.params.dev_mode === true || Deno.env.get("DEV_MODE") === "true";

    // Handle development mode
    if (isDevelopmentMode) {
      // Return success without actually inserting into the database
      console.log('Development mode - creating ledger entry mock:', requestData.params);

      return jsonResponse(200, {
        success: true,
        message: "Ledger entry created (Development Mode)"
      });
    }

    // Get Supabase credentials from environment (only needed in regular mode)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { success: false, error: "Supabase configuration is missing" });
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate required fields
    const { subaccount_code, type, amount, reference, description, seller_id } = requestData.params;

    if (!subaccount_code || !type || !amount || !reference || !description || !seller_id) {
      return jsonResponse(400, {
        success: false,
        error: "Missing required parameters: subaccount_code, type, amount, reference, description, or seller_id"
      });
    }

    // Validate type
    if (type !== 'credit' && type !== 'debit') {
      return jsonResponse(400, {
        success: false,
        error: "Type must be either 'credit' or 'debit'"
      });
    }

    // Insert ledger entry
    const { error } = await supabase
      .from('ledger_entries')
      .insert({
        subaccount_code,
        type,
        amount,
        reference,
        description,
        seller_id,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating ledger entry:', error);
      return jsonResponse(500, {
        success: false,
        error: `Error creating ledger entry: ${error.message}`
      });
    }

    return jsonResponse(200, {
      success: true
    });

  } catch (error) {
    console.error("Unexpected error in monnify-create-ledger-entry function:", error);
    return jsonResponse(500, {
      success: false,
      error: `Unexpected error: ${error.message}`
    });
  }
});