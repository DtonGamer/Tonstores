import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { sha512 } from "https://esm.sh/js-sha512";

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

// Function to compute hash for webhook validation
const computeHash = (requestBody: string) => {
  const monnifySecretKey = Deno.env.get("MONNIFY_SECRET_KEY");
  if (!monnifySecretKey) {
    throw new Error("MONNIFY_SECRET_KEY not configured");
  }
  return sha512.hmac(monnifySecretKey, requestBody);
};

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

  try {
    // Read raw body for hash validation
    const rawBody = await req.text();

    // Check for development mode
    const isDevelopmentMode = req.headers.get("dev_mode") === "true" || Deno.env.get("DEV_MODE") === "true";

    // Handle development mode
    if (isDevelopmentMode) {
      console.log("Development mode - skipping signature validation for escrow webhook");
      // Parse the body directly without signature validation
      const payload = JSON.parse(rawBody);

      console.log("Received Monnify escrow webhook (Dev Mode):", payload.eventName, payload);

      // Return success response to acknowledge webhook
      return jsonResponse(200, {
        status: 'success',
        message: 'Escrow webhook processed successfully in development mode',
        dev_mode: true,
        eventName: payload.eventName
      });
    }

    // Get the signature from the header (for production mode)
    const signature = req.headers.get("monnify-signature");

    if (!signature) {
      console.error("Missing monnify signature in webhook");
      return jsonResponse(401, { error: "Missing signature" });
    }

    // Validate the signature
    const computedHash = computeHash(rawBody);

    if (computedHash !== signature) {
      console.error("Invalid webhook signature");
      console.log("Computed hash:", computedHash);
      console.log("Received signature:", signature);
      return jsonResponse(401, { error: "Invalid signature" });
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);

    console.log("Received Monnify webhook:", payload.eventName, payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    switch (payload.eventName) {
      case "TRANSACTION.PAID":
        // Update escrow transaction to 'held' status after successful payment
        if (payload.transactionReference) {
          // Update the escrow transaction status
          const { error } = await supabase
            .from('escrow_transactions')
            .update({
              status: 'held',
              updated_at: new Date().toISOString()
            })
            .eq('transaction_reference', payload.transactionReference);

          if (error) {
            console.error("Error updating escrow transaction:", error);
            // Don't return error here as the webhook was processed
          } else {
            console.log(`Updated escrow transaction ${payload.transactionReference} to 'held' status`);
            
            // Also update the linked order
            const { error: orderError } = await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('transaction_reference', payload.transactionReference); // Assuming transaction reference is stored in orders

            if (orderError) {
              console.error("Error updating order status:", orderError);
            } else {
              console.log(`Updated order linked to transaction ${payload.transactionReference} to 'paid' status`);
            }
          }
        }
        break;

      case "DISBURSEMENT.SUCCESSFUL":
        // Update escrow transaction to 'released' status after successful disbursement
        if (payload.reference) {
          const { error } = await supabase
            .from('escrow_transactions')
            .update({
              status: 'released',
              released_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .ilike('reference', `%${payload.reference}%`); // Use ilike to match partial reference

          if (error) {
            console.error("Error updating escrow transaction on disbursement success:", error);
          } else {
            console.log(`Updated escrow transaction with reference ${payload.reference} to 'released' status`);
          }
        }
        break;

      case "TRANSACTION.FAILED":
        // Update escrow transaction to 'failed' status
        if (payload.transactionReference) {
          const { error } = await supabase
            .from('escrow_transactions')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('transaction_reference', payload.transactionReference);

          if (error) {
            console.error("Error updating escrow transaction on failure:", error);
          } else {
            console.log(`Updated escrow transaction ${payload.transactionReference} to 'failed' status`);
          }
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${payload.eventName}`);
        break;
    }

    // Return success response to acknowledge webhook
    return jsonResponse(200, { 
      status: 'success',
      message: 'Webhook processed successfully' 
    });

  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return jsonResponse(500, { 
      error: error.message || "Internal server error" 
    });
  }
});