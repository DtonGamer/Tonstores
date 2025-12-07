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
    
    // Get the signature from the header
    const signature = req.headers.get("monnify-signature");
    
    if (!signature) {
      console.error("Missing monnify signature in webhook");
      return jsonResponse(401, { error: "Missing signature" });
    }
    
    // Validate the signature
    const computedHash = computeHash(rawBody);
    
    if (signature !== computedHash) {
      console.error("Invalid signature in webhook:", {
        received: signature,
        computed: computedHash,
        rawBody: rawBody
      });
      return jsonResponse(401, { error: "Invalid signature" });
    }

    // Parse the validated body
    const eventData = JSON.parse(rawBody);
    const { eventType, eventData: eventPayload } = eventData;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process different event types
    switch (eventType) {
      case "SUCCESSFUL_TRANSACTION": {
        const { 
          transactionReference, 
          paymentReference, 
          amountPaid, 
          paymentStatus, 
          customer 
        } = eventPayload;

        // Update the transaction status in the database
        const { error } = await supabase
          .from('transactions')
          .update({ 
            status: 'completed', 
            payment_status: paymentStatus,
            amount_paid: amountPaid,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_reference', transactionReference);

        if (error) {
          console.error("Error updating transaction in database:", error);
        }

        // Also try to update the related order if one exists
        try {
          const { error: orderError } = await supabase
            .from('orders')
            .update({ 
              status: 'paid', 
              payment_status: paymentStatus,
              updated_at: new Date().toISOString()
            })
            .eq('transaction_reference', transactionReference);

          if (orderError) {
            console.error("Error updating order in database:", orderError);
          }
        } catch (orderUpdateError) {
          console.error("Error updating order:", orderUpdateError);
        }

        // Log successful transaction
        console.log(`Webhook: Transaction ${transactionReference} completed successfully`);
        break;
      }

      case "FAILED_TRANSACTION": {
        const { 
          transactionReference, 
          paymentReference, 
          paymentStatus 
        } = eventPayload;

        // Update the transaction status in the database
        const { error } = await supabase
          .from('transactions')
          .update({ 
            status: 'failed', 
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_reference', transactionReference);

        if (error) {
          console.error("Error updating failed transaction in database:", error);
        }

        console.log(`Webhook: Transaction ${transactionReference} failed`);
        break;
      }

      case "SETTLEMENT": {
        const { 
          settlementReference, 
          amount, 
          destinationAccountNumber,
          transactions: relatedTransactions 
        } = eventPayload;

        // Update settlement in database
        const { error } = await supabase
          .from('settlements')
          .insert({
            settlement_reference: settlementReference,
            amount: amount,
            account_number: destinationAccountNumber,
            status: 'completed',
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error("Error inserting settlement in database:", error);
        }

        // Update related transactions with settlement info
        if (relatedTransactions && Array.isArray(relatedTransactions)) {
          for (const transaction of relatedTransactions) {
            const { transactionReference } = transaction;
            const { error: txError } = await supabase
              .from('transactions')
              .update({ 
                settlement_reference: settlementReference,
                status: 'settled',
                updated_at: new Date().toISOString()
              })
              .eq('transaction_reference', transactionReference);

            if (txError) {
              console.error(`Error updating transaction ${transactionReference} with settlement info:`, txError);
            }
          }
        }

        console.log(`Webhook: Settlement ${settlementReference} processed`);
        break;
      }

      default:
        console.log(`Webhook: Received unhandled event type: ${eventType}`);
        break;
    }

    // Return 200 status to acknowledge receipt (required by Monnify to prevent resending)
    return jsonResponse(200, { 
      message: "Webhook processed successfully", 
      eventType: eventType,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);

    // Return 500 to indicate processing error
    // Monnify will retry if it doesn't receive 200
    return jsonResponse(500, { 
      error: error.message || "Internal server error processing webhook" 
    });
  }
});