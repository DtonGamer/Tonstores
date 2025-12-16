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
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');

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
    console.log("Development mode - returning mock Paystack ledger history");

    // Generate mock ledger entries
    const mockEntries = Array.from({ length: 20 }, (_, i) => {
      const isCredit = i % 3 !== 0; // 2/3 are credits, 1/3 are debits
      return {
        id: `mock-entry-${i + 1}`,
        subaccountCode: 'SUB_mock12345',
        type: isCredit ? 'credit' : 'debit',
        amount: isCredit ? Math.floor(Math.random() * 500000) : Math.floor(Math.random() * 100000),
        reference: `REF-${Math.random().toString(36).substring(2, 10)}`,
        description: isCredit ? 'Payment received' : 'Payout processed',
        userId: userId,
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString() // Each entry is one day older
      };
    });

    // Calculate totals
    const totalCredits = mockEntries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
    const totalDebits = mockEntries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

    const paginatedEntries = mockEntries.slice(offset, offset + limit);

    return jsonResponse(200, {
      entries: paginatedEntries,
      pagination: {
        total: mockEntries.length,
        limit,
        offset,
        hasNextPage: offset + limit < mockEntries.length,
        hasPrevPage: offset > 0
      },
      summary: {
        total_credits: totalCredits,
        total_debits: totalDebits,
        balance: totalCredits - totalDebits
      }
    });
  }

  // Initialize Supabase client using shared utility
  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  try {
    // Query ledger entries for the user
    // This would typically come from a ledger_entries table
    let query = supabase
      .from('ledger_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching ledger history:", error);
      return jsonResponse(500, { error: error.message });
    }

    // Calculate summary data
    const totalCredits = data.filter(entry => entry.type === 'credit').reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const totalDebits = data.filter(entry => entry.type === 'debit').reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const balance = totalCredits - totalDebits;

    // Return the ledger data with pagination
    return jsonResponse(200, {
      entries: data.map(entry => ({
        id: entry.id,
        subaccountCode: entry.subaccount_code,
        type: entry.type,
        amount: entry.amount,
        reference: entry.reference,
        description: entry.description,
        userId: entry.user_id,
        createdAt: entry.created_at
      })),
      pagination: {
        total: data.length, // Simplified - in real implementation you'd query for total count separately
        limit,
        offset,
        hasNextPage: data.length === limit, // Simplified logic
        hasPrevPage: offset > 0
      },
      summary: {
        total_credits: totalCredits,
        total_debits: totalDebits,
        balance: balance
      }
    });
  } catch (error) {
    return handleCommonError(error, "Paystack ledger history processing");
  }
});