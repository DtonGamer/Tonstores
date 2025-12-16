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
    console.log("Development mode - returning mock Paystack payout history");

    // Generate mock payout records
    const mockPayouts = Array.from({ length: 15 }, (_, i) => {
      const amount = Math.floor(Math.random() * 5000000); // Random amount between 0 and 50,000 (in kobo)
      const fee = Math.floor(amount * 0.015); // 1.5% fee

      return {
        id: `mock-payout-${i + 1}`,
        amount: amount,
        fee: fee,
        net_amount: amount - fee,
        status: ['SUCCESS', 'FAILED', 'PROCESSING'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - i * 86400000).toISOString(), // Each entry is one day older
        reference: `REF-${Math.random().toString(36).substring(2, 10)}`,
        userId: userId,
        destinationAccount: {
          accountNumber: `200${Math.random().toString().substring(2, 12)}`,
          accountName: `Test Account ${i + 1}`,
          bankName: 'Test Bank',
          bankCode: 'TEST'
        }
      };
    });

    // Calculate totals
    const totalAmount = mockPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = mockPayouts.reduce((sum, p) => sum + p.fee, 0);

    const paginatedPayouts = mockPayouts.slice(offset, offset + limit);

    return jsonResponse(200, {
      payouts: paginatedPayouts,
      pagination: {
        total: mockPayouts.length,
        limit,
        offset,
        hasNextPage: offset + limit < mockPayouts.length,
        hasPrevPage: offset > 0
      },
      summary: {
        total_amount: totalAmount,
        total_fees: totalFees,
        total_net_amount: totalAmount - totalFees
      }
    });
  }

  // Initialize Supabase client using shared utility
  const supabase = createSupabaseClient();
  if (!supabase) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  try {
    // Query payout history for the user
    // This would typically come from a payouts or transfers table
    let query = supabase
      .from('payouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching payout history:", error);
      return jsonResponse(500, { error: error.message });
    }

    // Calculate summary data
    const totalAmount = data.reduce((sum, payout) => sum + (payout.amount || 0), 0);
    const totalFees = data.reduce((sum, payout) => sum + (payout.fee || 0), 0);

    // Return the payout data with pagination
    return jsonResponse(200, {
      payouts: data.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        fee: payout.fee,
        net_amount: payout.net_amount || (payout.amount - (payout.fee || 0)),
        status: payout.status,
        created_at: payout.created_at,
        reference: payout.reference,
        userId: payout.user_id,
        destinationAccount: {
          accountNumber: payout.destination_account_number,
          accountName: payout.destination_account_name,
          bankName: payout.destination_bank_name,
          bankCode: payout.destination_bank_code
        }
      })),
      pagination: {
        total: data.length, // Simplified - in real implementation you'd query for total count separately
        limit,
        offset,
        hasNextPage: data.length === limit, // Simplified logic
        hasPrevPage: offset > 0
      },
      summary: {
        total_amount: totalAmount,
        total_fees: totalFees,
        total_net_amount: totalAmount - totalFees
      }
    });
  } catch (error: any) {
    return handleCommonError(error, "Paystack payout history processing");
  }
});