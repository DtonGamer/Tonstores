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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }

  // Only allow GET
  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const devMode = url.searchParams.get("dev_mode") === "true" || Deno.env.get("DEV_MODE") === "true";

    // Handle development mode
    if (devMode) {
      const mockUserId = userId || "test-seller-123";
      return jsonResponse(200, {
        status: true,
        message: "Seller balance retrieved (Development Mode)",
        data: {
          balance: 50000, // 500.00 in smallest currency unit
          currency: "NGN",
          availableBalance: 45000, // After deducting fees
          reservedBalance: 5000, // For pending transactions
          userId: mockUserId
        },
        dev_mode: true
      });
    }

    // Validate required fields
    if (!userId) {
      return jsonResponse(400, { error: "User ID is required" });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's profile to potentially get Monnify account info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('monnify_subaccount_code, id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return jsonResponse(500, { error: "Error fetching user profile" });
    }

    // In a real implementation, we would call Monnify's API to get the actual balance
    // However, Monnify doesn't have a direct endpoint to get a seller's balance
    // Instead, we'll aggregate data from our transactions and settlements for this user
    
    // Get transaction totals for this user
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount_paid, status, created_at')
      .eq('user_id', userId)
      .in('status', ['completed', 'settled']);

    if (txError) {
      console.error("Error fetching transactions:", txError);
      return jsonResponse(500, { error: "Error fetching transaction data" });
    }

    // Calculate total earnings
    let totalEarnings = 0;
    if (transactions) {
      for (const tx of transactions) {
        if (tx.amount_paid && tx.status === 'completed') {
          totalEarnings += parseInt(tx.amount_paid.toString());
        }
      }
    }

    // Get settled amounts
    const { data: settlements, error: settlementError } = await supabase
      .from('settlements')
      .select('amount, status')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (settlementError) {
      console.error("Error fetching settlements:", settlementError);
      return jsonResponse(500, { error: "Error fetching settlement data" });
    }

    let totalSettled = 0;
    if (settlements) {
      for (const settlement of settlements) {
        if (settlement.amount) {
          totalSettled += parseInt(settlement.amount.toString());
        }
      }
    }

    // Calculate available balance (settled amount minus any pending deductions)
    const availableBalance = totalSettled;
    const reservedBalance = totalEarnings - totalSettled; // Amount pending settlement

    // Return balance information
    return jsonResponse(200, {
      status: true,
      message: "Seller balance retrieved",
      data: {
        balance: totalEarnings,
        currency: "NGN",
        availableBalance: availableBalance,
        reservedBalance: reservedBalance > 0 ? reservedBalance : 0,
        userId: userId
      }
    });
  } catch (error: any) {
    console.error("Error retrieving seller balance:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});