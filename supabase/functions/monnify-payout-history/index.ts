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
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const devMode = url.searchParams.get("dev_mode") === "true" || Deno.env.get("DEV_MODE") === "true";

    // Handle development mode
    if (devMode) {
      const mockUserId = userId || "test-seller-123";

      // Create mock payout history
      const mockPayouts = [];
      for (let i = 0; i < Math.min(limit, 5); i++) { // Limit to 5 for demo
        const payoutId = Math.floor(Math.random() * 1000) + offset;
        mockPayouts.push({
          id: payoutId,
          reference: `PAYOUT_${Math.random().toString(36).substring(2, 10)}`,
          amount: Math.floor(Math.random() * 50000) + 5000, // Random amount between 5000 and 55000
          status: ["SUCCESS", "PROCESSING", "FAILED"][Math.floor(Math.random() * 3)],
          destinationAccount: {
            accountNumber: `200${Math.random().toString().substring(2, 12)}`,
            accountName: "Test Account",
            bankName: "Test Bank",
            bankCode: "TEST"
          },
          narration: `Payout for sales - ${new Date().toISOString().split('T')[0]}`,
          fee: Math.floor(Math.random() * 100) + 10, // Random fee between 10 and 110
          currency: "NGN",
          createdAt: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)).toISOString(), // Different dates
          completedAt: Math.random() > 0.3 ? new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString() : null
        });
      }

      return jsonResponse(200, {
        status: true,
        message: "Payout history retrieved (Development Mode)",
        data: mockPayouts,
        pagination: {
          currentPage: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total: mockPayouts.length,
          hasNextPage: false,
          hasPrevPage: offset > 0
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

    // Query payout history for this user from our local database
    const { data: payoutHistory, error, count } = await supabase
      .from('payouts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching payout history:", error);
      return jsonResponse(500, { error: "Error fetching payout data" });
    }

    // Format the data to match the expected payout format
    const formattedPayouts = payoutHistory.map(payout => ({
      id: payout.id,
      reference: payout.payout_reference,
      amount: payout.amount,
      status: payout.status,
      destinationAccount: {
        accountNumber: payout.destination_account_number,
        accountName: payout.destination_account_name,
        bankName: payout.destination_bank_name,
        bankCode: payout.destination_bank_code
      },
      narration: payout.narration,
      fee: payout.fee,
      currency: payout.currency || "NGN",
      createdAt: payout.created_at,
      completedAt: payout.completed_at
    }));

    // Calculate pagination info
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = count ? Math.ceil(count / limit) : 1;

    return jsonResponse(200, {
      status: true,
      message: "Payout history retrieved",
      data: formattedPayouts,
      pagination: {
        currentPage,
        pageSize: limit,
        total: count || 0,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    });
  } catch (error: any) {
    console.error("Error retrieving payout history:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});