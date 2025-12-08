import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
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
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
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

      // Create mock ledger entries
      const mockEntries = [];
      for (let i = 0; i < limit; i++) {
        const entryId = Math.floor(Math.random() * 1000) + offset;
        mockEntries.push({
          id: entryId,
          type: Math.random() > 0.5 ? "credit" : "debit",
          amount: Math.floor(Math.random() * 10000) + 1000, // Random amount between 1000 and 11000
          reference: `TXN_${Math.random().toString(36).substring(2, 10)}`,
          description: `Test ${Math.random() > 0.5 ? "sale" : "payout"} transaction`,
          subaccountCode: `SUB_${Math.random().toString(36).substring(2, 8)}`,
          userId: mockUserId,
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString() // Different dates
        });
      }

      return jsonResponse(200, {
        status: true,
        message: "Ledger history retrieved (Development Mode)",
        data: mockEntries,
        pagination: {
          currentPage: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total: mockEntries.length,
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

    // Query ledger transactions for this user from our local database
    const { data: ledgerEntries, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching ledger entries:", error);
      return jsonResponse(500, { error: "Error fetching ledger data" });
    }

    // Format the data to match the expected ledger entry format
    const formattedEntries = ledgerEntries.map(entry => ({
      id: entry.id,
      type: entry.amount_paid && parseInt(entry.amount_paid.toString()) > 0 ? "credit" : "debit",
      amount: entry.amount_paid || 0,
      reference: entry.transaction_reference || entry.payment_reference,
      description: entry.description || "Transaction",
      subaccountCode: entry.subaccount_code || null,
      userId: entry.user_id,
      createdAt: entry.created_at,
      status: entry.status,
      currency: entry.currency || "NGN"
    }));

    // Calculate pagination info
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = count ? Math.ceil(count / limit) : 1;

    return jsonResponse(200, {
      status: true,
      message: "Ledger history retrieved",
      data: formattedEntries,
      pagination: {
        currentPage,
        pageSize: limit,
        total: count || 0,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    });
  } catch (error: any) {
    console.error("Error retrieving ledger history:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});