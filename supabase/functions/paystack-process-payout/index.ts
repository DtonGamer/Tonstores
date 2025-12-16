import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
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
  const isDevelopmentMode = data.dev_mode === true || Deno.env.get("DEV_MODE") === "true";

  // Destructure required fields
  const {
    amount,
    destinationAccountNumber,
    destinationBankCode,
    destinationAccountName,
    reference,
    narration,
    userId,
    orderId
  } = data;

  // Handle development mode
  if (isDevelopmentMode) {
    console.log("Development mode - returning mock Paystack payout operation");

    // Generate a mock response similar to Paystack transfer
    return jsonResponse(200, {
      status: true,
      message: "Mock transfer initiated (Development Mode)",
      dev_mode: true,
      data: {
        transfer_code: `DEV_TRF_${Math.floor(Math.random() * 1000000)}`,
        amount: amount,
        recipient: destinationAccountNumber,
        status: "pending"
      }
    });
  }

  // Validate required fields
  if (!amount || !destinationAccountNumber || !destinationBankCode || !destinationAccountName || !reference) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["amount", "destinationAccountNumber", "destinationBankCode", "destinationAccountName", "reference"]
    });
  }

  // Get Paystack credentials from environment
  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

  // We require Paystack credentials for this operation
  if (!PAYSTACK_SECRET_KEY) {
    return jsonResponse(500, { error: "Paystack credentials not configured" });
  }

  try {
    // First, verify the account details
    const verifyResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${destinationAccountNumber}&bank_code=${destinationBankCode}`,
      {
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.status) {
      console.error("Account verification failed:", verifyResult);
      return jsonResponse(400, {
        error: verifyResult.message || "Account verification failed",
        details: verifyResult
      });
    }

    // Create a recipient for the transfer
    const recipientPayload = {
      type: "nuban",
      name: destinationAccountName,
      account_number: destinationAccountNumber,
      bank_code: destinationBankCode,
      currency: "NGN",
      metadata: {
        orderId: orderId
      }
    };

    // Create recipient
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipientPayload)
    });

    const recipientResult = await recipientResponse.json();

    if (!recipientResult.status) {
      console.error("Failed to create transfer recipient:", recipientResult);
      return jsonResponse(recipientResponse.status, {
        error: recipientResult.message || "Failed to create transfer recipient",
        details: recipientResult
      });
    }

    const recipientCode = recipientResult.data.recipient_code;

    // Initialize the transfer
    const transferPayload = {
      source: "balance", // Source of funds for the transfer
      amount: Math.round(Number(amount)), // Amount in kobo
      currency: "NGN",
      recipient: recipientCode,
      reference: reference,
      reason: narration || `Transfer for order ${orderId}`,
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
    if (!supabase) {
      return jsonResponse(500, { error: "Supabase configuration is missing" });
    }

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

    return jsonResponse(200, {
      status: true,
      message: "Transfer initiated",
      data: {
        ...result.data
      }
    });
  } catch (error) {
    return handleCommonError(error, "Paystack payout processing");
  }
});