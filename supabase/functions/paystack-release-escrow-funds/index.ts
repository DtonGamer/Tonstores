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
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-ID, apikey, cache-control, pragma",
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
  const devMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true" || isDevelopmentMode();

  // Destructure required fields
  const {
    orderId,
    recipientSubaccountCode,
    amount,
    reason
  } = data;

  // Handle development mode
  if (devMode) {
    console.log("Development mode - returning mock Paystack release funds operation");

    // Generate a mock response similar to Paystack transfer
    return jsonResponse(200, {
      status: true,
      message: "Mock transfer initiated (Development Mode)",
      dev_mode: true,
      data: {
        transfer_code: `DEV_TRF_${Math.floor(Math.random() * 1000000)}`,
        amount: amount,
        recipient: recipientSubaccountCode,
        status: "pending"
      }
    });
  }

  // Validate required fields
  if (!orderId || !recipientSubaccountCode) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["orderId", "recipientSubaccountCode"]
    });
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  try {
    // For the transfer, we need to use Paystack's Transfer API
    // First, we initialize a transfer recipient if it doesn't exist
    const transferPayload: any = {
      source: "balance",
      amount: Math.round(Number(amount)), // Amount in kobo
      currency: "NGN",
      recipient: recipientSubaccountCode,
      reason: reason || `Payment for order ${orderId}`,
    };

    // Call Paystack Transfer API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const resp = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(transferPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (!result.status) {
      // Log detailed error info
      console.error("Paystack Transfer API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Paystack error message with detailed info
      return jsonResponse(resp.status, {
        error: result.message || "Paystack Transfer API error",
        details: result
      });
    }

    // Success: return transfer details
    const transferData = result.data;

    // Update the order status in the database to reflect release
    const supabase = createSupabaseClient();
    if (supabase) {
      try {
        // Update the order to mark the transfer as initiated
        await supabase
          .from('orders')
          .update({
            payout_status: 'processing',
            updated_at: new Date().toISOString(),
            transfer_reference: transferData.transfer_code
          })
          .eq('id', orderId);
      } catch (dbError) {
        console.error("Error updating order status after transfer:", dbError);
        // Continue with response - transfer was successful, just DB update failed
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Transfer initiated",
      data: mapSnakeToCamel(result.data)
    });
  } catch (error: any) {
    return handleCommonError(error, "Paystack escrow funds release");
  }
});