import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

interface ReleaseEscrowFundsPayload {
  orderId: string;
  releaseToSubaccountCode: string;
  amount?: number; // Optional - if not provided, will use the order total amount
  userId?: string;
  dev_mode?: boolean;
}

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

  // Parse JSON body
  let data: ReleaseEscrowFundsPayload;
  try {
    data = await req.json();
  } catch (err) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const { orderId, releaseToSubaccountCode, amount, userId, dev_mode } = data;

  // Validate required fields
  if (!orderId || !releaseToSubaccountCode) {
    return jsonResponse(400, {
      error: "Missing required fields",
      required: ["orderId", "releaseToSubaccountCode"]
    });
  }

  // Check for development mode early
  const isDevelopmentMode = dev_mode || Deno.env.get("DEV_MODE") === "true";

  // Handle development mode before database operations
  if (isDevelopmentMode) {
    // In development mode, simulate the fund release without checking database
    console.log(`Development Mode: Simulating release of funds to subaccount: ${releaseToSubaccountCode}`);

    // Return mock success response
    return jsonResponse(200, {
      status: true,
      message: "Funds released successfully (Development Mode)",
      dev_mode: true,
      data: {
        orderId: orderId,
        releaseAmount: amount || 0, // Use provided amount or 0 in dev mode
        releasedToSubaccount: releaseToSubaccountCode,
        originalEscrowAccount: "DEV_MOCK_ACCOUNT"
      }
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get the order details to verify escrow status and get the amount
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, user_id, customer_name, customer_email, escrow_status')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error("Error fetching order:", orderError);
      return jsonResponse(404, { error: "Order not found" });
    }

    // Check if funds are currently held in escrow
    if (orderData.escrow_status !== 'held') {
      return jsonResponse(400, { 
        error: "Funds are not currently held in escrow", 
        currentStatus: orderData.escrow_status 
      });
    }

    // Get the escrow transaction details
    const { data: escrowTxnData, error: escrowTxnError } = await supabase
      .from('escrow_transactions')
      .select('transaction_reference, payment_reference, amount as original_amount, escrow_account_code')
      .eq('order_id', orderId)
      .eq('status', 'held')
      .single();

    if (escrowTxnError || !escrowTxnData) {
      console.error("Error fetching escrow transaction:", escrowTxnError);
      return jsonResponse(404, { error: "Escrow transaction not found or already released" });
    }

    // Determine the amount to release (use provided amount or order total)
    const releaseAmount = amount || orderData.total_amount;
    
    if (releaseAmount > orderData.total_amount) {
      return jsonResponse(400, { 
        error: "Release amount exceeds original transaction amount", 
        maxAmount: orderData.total_amount 
      });
    }

    // Check for duplicate release attempts
    const { data: existingRelease, error: existingReleaseError } = await supabase
      .from('escrow_transactions')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'released')
      .maybeSingle();

    if (existingRelease) {
      return jsonResponse(400, {
        error: "Funds already released for this order",
        transactionId: existingRelease.id
      });
    }

    if (isDevelopmentMode) {
      // In development mode, simulate the fund release
      console.log(`Development Mode: Simulating transfer of ${releaseAmount} to subaccount: ${releaseToSubaccountCode}`);

      // Update the order status to released in the database
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({
          escrow_status: 'released',
          release_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateOrderError) {
        console.error("Error updating order status:", updateOrderError);
        return jsonResponse(500, { error: "Failed to update order status" });
      }

      // Update the escrow transaction status
      const { error: updateEscrowTxnError } = await supabase
        .from('escrow_transactions')
        .update({
          status: 'released',
          release_to_subaccount: releaseToSubaccountCode,
          release_amount: releaseAmount,
          released_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (updateEscrowTxnError) {
        console.error("Error updating escrow transaction:", updateEscrowTxnError);
        return jsonResponse(500, { error: "Failed to update escrow transaction" });
      }

      return jsonResponse(200, {
        status: true,
        message: "Funds released successfully (Development Mode)",
        dev_mode: true,
        data: {
          orderId: orderId,
          releaseAmount: releaseAmount,
          releasedToSubaccount: releaseToSubaccountCode,
          originalEscrowAccount: escrowTxnData.escrow_account_code
        }
      });
    }

    // For a real implementation, you would use Monnify's disbursement API to transfer funds
    // from the platform's escrow account to the seller's subaccount
    // This would involve calling Monnify's transfer endpoint
    
    // Get Monnify credentials from environment
    const MONNIFY_API_KEY = Deno.env.get("MONNIFY_API_KEY");
    const MONNIFY_SECRET_KEY = Deno.env.get("MONNIFY_SECRET_KEY");

    if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
      return jsonResponse(500, { error: "Monnify credentials not configured" });
    }

    // First, get the original split configuration for the order
    // This will determine how to distribute the funds from escrow
    const { data: splitConfig, error: splitError } = await supabase
      .from('income_split_configs')
      .select('*')
      .eq('user_id', orderData.user_id) // The seller's user ID
      .eq('status', 'active');

    if (splitError) {
      console.error("Error fetching split configuration:", splitError);
      // If there's an error with split config, just send funds to the specified subaccount
    }

    // Check platform wallet balance before proceeding with disbursement
    const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
    const base64Auth = btoa(authString);

    const walletResponse = await fetch("https://api.monnify.com/api/v1/disbursements/wallet-balance", {
      method: "GET",
      headers: {
        "Authorization": `Basic ${base64Auth}`,
        "Content-Type": "application/json"
      }
    });

    const walletData = await walletResponse.json();
    if (walletResponse.status !== 200 || !walletData.requestSuccessful) {
      console.error("Error fetching wallet balance:", walletData);
      return jsonResponse(walletResponse.status, {
        error: walletData.responseMessage || "Error fetching wallet balance",
        details: walletData
      });
    }

    const availableBalance = walletData.responseBody?.availableBalance * 100; // Convert to kobo
    if (availableBalance < releaseAmount) {
      return jsonResponse(400, {
        error: "Insufficient balance in escrow account",
        available: availableBalance / 100, // Convert back to naira for display
        required: releaseAmount / 100,
        currency: "NGN"
      });
    }

    let transferResult;
    let transferResponse;

    if (splitConfig && splitConfig.length > 0) {
      // Apply the original split configuration to distribute funds appropriately
      let totalProcessed = 0;
      const adjustedReleaseAmount = releaseAmount; // Keep in kobo for calculations

      for (const config of splitConfig) {
        // Calculate the amount for this specific split
        const amountForThisSplit = Math.floor(adjustedReleaseAmount * (config.split_percentage / 100));
        totalProcessed += amountForThisSplit;

        const splitTransferPayload = {
          amount: amountForThisSplit / 100, // Convert from kobo to naira
          subAccountCode: config.subaccount_code, // The specific account for this split
          reference: `ESCROW_SPLIT_${orderId}_${config.subaccount_code}_${Date.now()}`,
          narration: `Escrow split release for order ${orderId}`,
        };

        // Call Monnify's disbursement endpoint for this split
        const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
        const base64Auth = btoa(authString);

        transferResponse = await fetch("https://api.monnify.com/api/v1/disbursements/single", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${base64Auth}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(splitTransferPayload)
        });

        transferResult = await transferResponse.json();

        if (transferResponse.status !== 200 || !transferResult.requestSuccessful) {
          console.error("Monnify disbursement error for split:", transferResult);
          // In a more robust implementation, you'd handle partial failures
          return jsonResponse(transferResponse.status, {
            error: transferResult.responseMessage || "Disbursement failed for split",
            details: transferResult
          });
        }
      }

      // Handle any remaining amount due to rounding (e.g., 1 kobo left)
      const remainder = adjustedReleaseAmount - totalProcessed;
      if (remainder !== 0) {
        // Add the remainder to the first split or to the platform
        const remainderPayload = {
          amount: Math.abs(remainder) / 100, // Convert from kobo to naira
          subAccountCode: splitConfig[0].subaccount_code, // Add to first split
          reference: `ESCROW_REMAINDER_${orderId}_${Date.now()}`,
          narration: `Escrow remainder release for order ${orderId}`,
        };

        const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
        const base64Auth = btoa(authString);

        transferResponse = await fetch("https://api.monnify.com/api/v1/disbursements/single", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${base64Auth}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(remainderPayload)
        });

        transferResult = await transferResponse.json();

        if (transferResponse.status !== 200 || !transferResult.requestSuccessful) {
          console.error("Monnify disbursement error for remainder:", transferResult);
          return jsonResponse(transferResponse.status, {
            error: transferResult.responseMessage || "Disbursement failed for remainder",
            details: transferResult
          });
        }
      }
    } else {
      // No split configuration, send all funds to the specified subaccount
      const transferPayload = {
        amount: releaseAmount / 100, // Convert from kobo to naira
        subAccountCode: releaseToSubaccountCode, // The seller's subaccount
        reference: `ESCROW_RELEASE_${orderId}_${Date.now()}`,
        narration: `Escrow release for order ${orderId}`,
      };

      // Call Monnify's disbursement endpoint
      const authString = `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`;
      const base64Auth = btoa(authString);

      transferResponse = await fetch("https://api.monnify.com/api/v1/disbursements/single", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${base64Auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(transferPayload)
      });

      transferResult = await transferResponse.json();

      if (transferResponse.status !== 200 || !transferResult.requestSuccessful) {
        console.error("Monnify disbursement error:", transferResult);
        return jsonResponse(transferResponse.status, {
          error: transferResult.responseMessage || "Disbursement failed",
          details: transferResult
        });
      }
    }

    // If the transfer was successful, update the order and escrow transaction status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ 
        escrow_status: 'released',
        release_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateOrderError) {
      console.error("Error updating order status:", updateOrderError);
      return jsonResponse(500, { error: "Failed to update order status after release" });
    }

    // Update the escrow transaction status
    const { error: updateEscrowTxnError } = await supabase
      .from('escrow_transactions')
      .update({ 
        status: 'released',
        release_to_subaccount: releaseToSubaccountCode,
        release_amount: releaseAmount,
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (updateEscrowTxnError) {
      console.error("Error updating escrow transaction:", updateEscrowTxnError);
      return jsonResponse(500, { error: "Failed to update escrow transaction" });
    }

    return jsonResponse(200, {
      status: true,
      message: "Funds released successfully",
      data: {
        orderId: orderId,
        releaseAmount: releaseAmount,
        releasedToSubaccount: releaseToSubaccountCode,
        originalEscrowAccount: escrowTxnData.escrow_account_code,
        transferResult: transferResult
      }
    });
  } catch (error: any) {
    console.error("Error releasing escrow funds:", error);
    return jsonResponse(500, {
      error: error.message || "Internal server error"
    });
  }
});