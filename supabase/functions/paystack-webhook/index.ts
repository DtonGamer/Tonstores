import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

// Native Deno HMAC function using Web Crypto API
async function createHmacSignature(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  console.log("🚀 === PAYSTACK WEBHOOK RECEIVED ===");
  
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Get the raw request body
  const rawBody = await req.text();

  // Check for development mode - in dev mode, we don't require a signature
  const devMode = isDevelopmentMode();

  // Handle development mode
  if (devMode) {
    console.log("🧪 Development mode - processing webhook without signature verification");

    try {
      // Parse the JSON body
      const payload = JSON.parse(rawBody);
      console.log("📦 Processing webhook payload in development mode:", payload);

      // Simulate processing the webhook
      if (payload.event) {
        console.log(`✅ Processing simulated ${payload.event} event in development mode`);

        // Return success response
        return jsonResponse(200, {
          message: "Webhook received and processed (Development Mode)",
          dev_mode: true,
          event: payload.event
        });
      } else {
        return jsonResponse(400, { error: "No event provided in development mode" });
      }
    } catch (error) {
      return handleCommonError(error, "Development mode Paystack webhook processing");
    }
  }

  // Verify webhook signature
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET_KEY) {
    console.error("❌ Paystack secret key not configured");
    return jsonResponse(500, { error: "Paystack secret key not configured" });
  }

  // Get signature from header
  const signature = req.headers.get('X-Paystack-Signature');
  if (!signature) {
    console.error("❌ No signature provided");
    return jsonResponse(400, { error: "No signature provided" });
  }

  // Create expected signature using native crypto
  const expectedSignature = await createHmacSignature(PAYSTACK_SECRET_KEY, rawBody);

  // Verify signature
  if (signature !== expectedSignature) {
    console.error("❌ Invalid signature");
    return jsonResponse(400, { error: "Invalid signature" });
  }

  console.log("✅ Signature verified");

  try {
    // Parse the JSON body
    const payload = JSON.parse(rawBody);
    console.log("📋 Event type:", payload.event);

    // Initialize Supabase client
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.error("❌ Supabase configuration is missing");
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

    // Handle charge.success event
    if (payload.event === "charge.success") {
      console.log("💰 Processing charge.success event");

      // Extract transaction data
      const data = payload.data;
      const reference = data.reference;
      const amount = data.amount; // Amount in kobo

      console.log("📊 Transaction details:", { reference, amount });

      if (!reference) {
        console.error("❌ No reference found in webhook data");
        return jsonResponse(400, { error: "No reference provided" });
      }

      // Find the order associated with this transaction
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          payment_status, 
          user_id,
          total_amount,
          catalog_id,
          catalogs (
            user_id,
            profiles (
              id,
              paystack_subaccount_code
            )
          )
        `)
        .or(`payment_reference.eq.${reference},transaction_reference.eq.${reference}`)
        .single();

      if (orderError) {
        console.error("❌ Error finding order:", orderError);
        return jsonResponse(404, { error: "Order not found", reference });
      }

      console.log("✅ Order found:", orderData.id);

      // Check if already processed
      if (orderData.status === 'paid' && orderData.payment_status === 'paid') {
        console.log("⚠️ Order already marked as paid, skipping");
        return jsonResponse(200, { message: "Order already processed" });
      }

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          // Funds are only "held in escrow" once the payment is actually confirmed
          escrow_status: 'held',
          payment_date: new Date().toISOString(),
          transaction_reference: data.transaction_id || reference,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.id);

      if (updateError) {
        console.error("❌ Error updating order:", updateError);
        return jsonResponse(500, { error: "Failed to update order" });
      }

      console.log("✅ Order updated to paid");

      // Create ledger entry for the seller
      try {
        const sellerId = orderData.catalogs?.user_id;
        const subaccountCode = 'STANDARD';

        if (!sellerId) {
          console.error("⚠️ No seller ID found for order, skipping ledger entry");
        } else {
          console.log("💾 Creating ledger entry for seller:", sellerId);

          // Get the seller's profile_id from users table
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', sellerId)
            .single();

          if (userError || !userData) {
            console.error("❌ Error finding seller profile:", userError);
          } else {
            const { error: ledgerError } = await supabase
              .from('ledger_entries')
              .insert({
                seller_id: userData.id,
                subaccount_code: subaccountCode,
                type: 'credit',
                amount: orderData.total_amount,
                reference: reference,
                description: `Payment received for order ${orderData.id}`,
                created_at: new Date().toISOString()
              });

            if (ledgerError) {
              console.error("❌ Error creating ledger entry:", ledgerError);
            } else {
              console.log("✅ Ledger entry created successfully");
            }
          }
        }
      } catch (ledgerError) {
        console.error("❌ Exception creating ledger entry:", ledgerError);
        // Don't fail the webhook if ledger entry fails
      }

      // Update stock quantities
      try {
        console.log("📦 Updating stock quantities...");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (supabaseUrl && supabaseServiceKey) {
          const stockResponse = await fetch(`${supabaseUrl}/functions/v1/update-stock`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId: orderData.id })
          });

          if (stockResponse.ok) {
            console.log("✅ Stock updated successfully");
          } else {
            console.error("⚠️ Stock update failed:", await stockResponse.text());
          }
        }
      } catch (stockError) {
        console.error('⚠️ Error updating stock:', stockError);
        // Continue processing even if stock update fails
      }

      console.log("🎉 Charge success webhook processed successfully");
      return jsonResponse(200, { message: "Webhook processed successfully" });
    }

    // Handle transfer.success event
    if (payload.event === "transfer.success") {
      console.log("💸 Processing transfer.success event");

      const data = payload.data;
      const reference = data.reference || data.transfer_code;

      if (reference) {
        // Find the order associated with this transfer
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, status')
          .or(`payment_reference.eq.${reference},transaction_reference.eq.${reference}`)
          .single();

        if (orderData && !orderError) {
          // Update order with payout status
          await supabase
            .from('orders')
            .update({
              payout_status: 'completed',
              release_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', orderData.id);

          console.log("✅ Transfer success webhook processed");
        }
      }

      return jsonResponse(200, { message: "Transfer webhook processed" });
    }

    // Log unhandled events
    console.log("⚠️ Unhandled webhook event:", payload.event);
    return jsonResponse(200, { message: "Webhook received but not processed", event: payload.event });

  } catch (error) {
    console.error("❌ === WEBHOOK PROCESSING FAILED ===");
    console.error("❌ Error:", error);
    return handleCommonError(error, "Paystack webhook processing");
  }
});
