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
    console.log("Development mode - processing webhook without signature verification");

    try {
      // Parse the JSON body
      const payload = JSON.parse(rawBody);
      console.log("Processing webhook payload in development mode:", payload);

      // Simulate processing the webhook
      if (payload.event) {
        console.log(`Processing simulated ${payload.event} event in development mode`);

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
    return jsonResponse(500, { error: "Paystack secret key not configured" });
  }

  // Get signature from header
  const signature = req.headers.get('X-Paystack-Signature');
  if (!signature) {
    return jsonResponse(400, { error: "No signature provided" });
  }

  // Create expected signature using native crypto
  const expectedSignature = await createHmacSignature(PAYSTACK_SECRET_KEY, rawBody);

  // Verify signature
  if (signature !== expectedSignature) {
    return jsonResponse(400, { error: "Invalid signature" });
  }

  try {
    // Parse the JSON body
    const payload = JSON.parse(rawBody);

    // Check if this is a development webhook
    if (payload.event === "charge.success" || payload.event === "transfer.success") {
      console.log("Processing Paystack webhook:", payload.event);

      // Extract transaction data
      const data = payload.data;
      const reference = data.reference || data.transfer_code;

      if (reference) {
        const supabase = createSupabaseClient();
        if (supabase) {
          try {
            // Find the order associated with this transaction
            const { data: orderData } = await supabase
              .from('orders')
              .select('id, status, payment_status, user_id')
              .or(`payment_reference.eq.${reference},transaction_reference.eq.${reference}`)
              .single();

            if (orderData) {
              let updateData: any = {
                updated_at: new Date().toISOString()
              };

              // Handle different event types
              if (payload.event === "charge.success") {
                // Payment successful
                updateData.status = 'paid';
                updateData.payment_status = 'paid';
                updateData.payment_date = new Date().toISOString();
                
                // Update the actual payment reference if it's different
                if (data.transaction_id) {
                  updateData.transaction_reference = data.transaction_id;
                }
              } else if (payload.event === "transfer.success") {
                // Payout successful - mark order as completed/paid out
                updateData.payout_status = 'completed';
                updateData.release_date = new Date().toISOString();
              }

              // Update the order status
              await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderData.id);

              // If payment was successful, update stock quantities
              if (payload.event === "charge.success") {
                try {
                  const supabaseUrl = Deno.env.get("SUPABASE_URL");
                  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
                  
                  if (supabaseUrl && supabaseServiceKey) {
                    // Call update-stock function to reduce product quantities
                    await fetch(`${supabaseUrl}/functions/v1/update-stock`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ orderId: orderData.id })
                    });
                  }
                } catch (stockError) {
                  console.error('Error updating stock after successful payment:', stockError);
                  // Continue processing even if stock update fails
                }
              }
            }
          } catch (dbError) {
            console.error("Error processing Paystack webhook:", dbError);
            // Continue to acknowledge receipt
          }
        }
      }
    }

    return jsonResponse(200, { message: "Webhook received and processed" });
  } catch (error) {
    return handleCommonError(error, "Paystack webhook processing");
  }
});