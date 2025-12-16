import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { jsonResponse, handleCorsOptions, createSupabaseClient, handleCommonError, isDevelopmentMode } from "../_shared/utils.ts";

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  // Only allow GET
  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  // Get query parameters
  const url = new URL(req.url);
  const reference = url.searchParams.get('reference');

  // Check for development mode
  const devMode = url.searchParams.get('dev_mode') === 'true' || isDevelopmentMode();

  // Handle development mode
  if (devMode) {
    console.log("Development mode - returning mock Paystack transaction verification");

    // Generate a mock response similar to Paystack API
    return jsonResponse(200, {
      status: true,
      message: "Verification successful (Development Mode)",
      dev_mode: true,
      data: {
        reference: reference || `DEV_REF_${Math.floor(Math.random() * 1000000)}`,
        status: "success",
        amount: 100000, // Amount in kobo
        currency: "NGN",
        customer: {
          email: "customer@example.com",
          first_name: "John",
          last_name: "Doe"
        },
        metadata: {
          order_id: `ORD_${Math.floor(Math.random() * 100000)}`,
          custom_fields: []
        }
      }
    });
  }

  // Validate required field
  if (!reference) {
    return jsonResponse(400, {
      error: "Missing required field",
      required: ["reference"]
    });
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  try {
    // Call Paystack API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (!result.status) {
      // Log detailed error info
      console.error("Paystack API verification error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Paystack error message with detailed info
      return jsonResponse(resp.status, {
        error: result.message || "Paystack API verification error",
        details: result
      });
    }

    // Success: return transaction details
    const transactionData = result.data;

    // Update order status in database based on verification result
    if (transactionData.reference) {
      const supabase = createSupabaseClient();
      if (supabase) {

        try {
          // Find the order associated with this transaction
          const { data: orderData } = await supabase
            .from('orders')
            .select('id, status, payment_status')
            .eq('payment_reference', transactionData.reference)
            .single();

          if (orderData) {
            // Update order status based on transaction status
            let newStatus = orderData.status;
            let newPaymentStatus = orderData.payment_status;

            if (transactionData.status === 'success') {
              newStatus = 'paid';
              newPaymentStatus = 'paid';
            } else if (transactionData.status === 'failed') {
              newStatus = 'failed';
              newPaymentStatus = 'failed';
            }

            // Update the order status
            await supabase
              .from('orders')
              .update({ 
                status: newStatus,
                payment_status: newPaymentStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderData.id);
          }
        } catch (dbError) {
          console.error("Error updating order status from Paystack verification:", dbError);
          // Continue with response - verification still succeeded at Paystack level
        }
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Verification successful",
      data: {
        ...result.data
      }
    });
  } catch (error: any) {
    return handleCommonError(error, "verify-transaction");
  }
});