import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { jsonResponse, handleCorsOptions, createSupabaseClient, handleCommonError, isDevelopmentMode, mapSnakeToCamel } from "../_shared/utils.ts";

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
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
  const devMode = data.dev_mode === true || isDevelopmentMode();

  // Destructure required fields
  const {
    amount,
    email,
    currency,
    reference,
    publicKey,
    metadata,
    userId,
    orderId,
    subaccountCode
  } = data;

  // Handle development mode
  if (devMode) {
    console.log("Development mode - returning mock Paystack transaction initialization");

    // Generate a mock transaction reference
    const mockTransactionReference = `DEV_PAYSTACK_${Math.floor(Math.random() * 1000000)}`;
    const mockAuthorizationUrl = `https://test.paystack.com/checkout/${mockTransactionReference}`;
    const mockAccessCode = `DEV_ACCESS_${Math.floor(Math.random() * 1000000)}`;

    // Return mock response similar to Paystack API
    return jsonResponse(200, {
      status: true,
      message: "Transaction initialized (Development Mode)",
      dev_mode: true,
      transactionReference: mockTransactionReference,
      authorization_url: mockAuthorizationUrl,
      access_code: mockAccessCode,
      data: {
        transactionReference: mockTransactionReference,
        authorization_url: mockAuthorizationUrl,
        access_code: mockAccessCode,
        amount: amount,
        currency: currency,
        email: email,
        reference: reference,
        metadata: metadata
      }
    });
  }

  // Validate required fields
  if (!amount || !email || !reference) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["amount", "email", "reference"]
    });
  }

  // Get user ID for database storage (optional but recommended)
  if (!userId) {
    console.warn("User ID is missing in Paystack transaction initialization");
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  // Prepare payload for Paystack according to their API documentation
  const payload: any = {
    amount: Math.round(Number(amount)), // Paystack expects amount in kobo (smallest currency unit)
    email,
    currency: currency || 'NGN',
    reference,
    metadata: metadata || {},
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
  };

  // Add subaccount if provided
  if (subaccountCode) {
    payload.subaccount = subaccountCode;
    payload.channels = ['card', 'bank']; // Restrict channels for subaccount transactions
  }

  try {
    // Call Paystack API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const result = await resp.json();

    if (!result.status) {
      // Log detailed error info
      console.error("Paystack API error:", {
        status: resp.status,
        statusText: resp.statusText,
        result
      });

      // Forward Paystack error message with detailed info
      return jsonResponse(resp.status, {
        error: result.message || "Paystack API error",
        details: result
      });
    }

    // Convert Paystack response data from snake_case to camelCase
    const camelCaseData = {
      ...mapSnakeToCamel(result.data),
      amount: amount,
      currency: currency,
      email: email,
      reference: reference
    };

    // Success: return transaction details
    const transactionReference = result.data.reference;
    const authorizationUrl = result.data.authorization_url;
    const accessCode = result.data.access_code;

    // Store transaction info in database
    if (userId) {
      const supabase = createSupabaseClient();
      if (supabase) {

        try {
          await supabase.from('paystack_transactions').insert({
            user_id: userId,
            order_id: orderId,
            transaction_reference: transactionReference,
            amount: amount,
            currency: currency,
            customer_email: email,
            status: "initialized", // Initially pending
            subaccount_code: subaccountCode || null,
            metadata: metadata,
            created_at: new Date().toISOString()
          });

          // Also update the order to reflect that it's being processed via Paystack
          if (orderId) {
            await supabase
              .from('orders')
              .update({
                payment_gateway: 'paystack',
                payment_reference: transactionReference
              })
              .eq('id', orderId);
          }
        } catch (dbError) {
          console.error("Error storing Paystack transaction in database:", dbError);
          // Continue with response - we still initialized the transaction, just failed to update local DB
        }
      }
    }

    return jsonResponse(200, {
      status: true,
      message: "Transaction initialized",
      data: camelCaseData
    });
  } catch (error: any) {
    return handleCommonError(error, "initialize-transaction");
  }
});