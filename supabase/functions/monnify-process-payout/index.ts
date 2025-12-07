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

// Define interface for payout payload
interface PayoutPayload {
  userId: string;
  amount: number;
  destinationAccountNumber: string;
  destinationBankCode: string;
  destinationAccountName: string;
  narration: string;
  currency?: string;
  reference?: string;
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
  if (data.user_id && !data.userId) {
    data.userId = data.user_id;
  }
  if (data.destination_account_number && !data.destinationAccountNumber) {
    data.destinationAccountNumber = data.destination_account_number;
  }
  if (data.destination_bank_code && !data.destinationBankCode) {
    data.destinationBankCode = data.destination_bank_code;
  }
  if (data.destination_account_name && !data.destinationAccountName) {
    data.destinationAccountName = data.destination_account_name;
  }
  if (data.payout_reference && !data.reference) {
    data.reference = data.payout_reference;
  }

  // Destructure required fields
  const {
    userId,
    amount,
    destinationAccountNumber,
    destinationBankCode,
    destinationAccountName,
    narration,
    currency,
    reference
  } = data;

  // Handle development mode with test data
  if (isDevelopmentMode) {
    const mockUserId = userId || "test-seller-123";
    const mockReference = reference || `PAYOUT_${Math.random().toString(36).substring(2, 10)}`;
    
    // Create mock payout response
    return jsonResponse(200, {
      status: true,
      message: "Payout processed (Development Mode)",
      data: {
        reference: mockReference,
        amount: amount,
        status: "PROCESSING",
        destinationAccount: {
          accountNumber: destinationAccountNumber,
          accountName: destinationAccountName,
          bankName: "Test Bank",
          bankCode: destinationBankCode
        },
        narration: narration,
        currency: currency || "NGN",
        userId: mockUserId,
        createdAt: new Date().toISOString()
      },
      dev_mode: true
    });
  }

  // Validate required fields
  if (!userId || !amount || !destinationAccountNumber || !destinationBankCode || !destinationAccountName || !narration) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["userId", "amount", "destinationAccountNumber", "destinationBankCode", "destinationAccountName", "narration"]
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if user exists and has sufficient balance
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('monnify_subaccount_code, id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      return jsonResponse(404, { error: "User not found" });
    }

    // In a real implementation, we would check the user's balance against the payout amount
    // For this implementation, we'll record the payout in our database

    // Generate a reference if not provided
    const payoutReference = reference || `MNFYPAY${Date.now()}`;

    // Insert payout record into database
    const { data: payoutRecord, error: payoutError } = await supabase
      .from('payouts')
      .insert([{
        user_id: userId,
        payout_reference: payoutReference,
        amount: amount,
        destination_account_number: destinationAccountNumber,
        destination_bank_code: destinationBankCode,
        destination_account_name: destinationAccountName,
        narration: narration,
        currency: currency || "NGN",
        status: "PROCESSING",
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (payoutError) {
      console.error("Error inserting payout record:", payoutError);
      return jsonResponse(500, { error: "Error creating payout record" });
    }

    // In a real implementation, this is where we would call Monnify's disbursement API
    // Since Monnify's disbursement API requires different parameters, 
    // we're simulating the process by updating the database

    return jsonResponse(200, {
      status: true,
      message: "Payout processing initiated",
      data: {
        reference: payoutReference,
        amount: amount,
        status: "PROCESSING",
        destinationAccount: {
          accountNumber: destinationAccountNumber,
          accountName: destinationAccountName,
          bankCode: destinationBankCode
        },
        narration: narration,
        currency: currency || "NGN",
        userId: userId,
        createdAt: payoutRecord.created_at
      }
    });
  } catch (error: any) {
    console.error("Error processing payout:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});