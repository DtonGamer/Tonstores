import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

interface UpdateStockRequest {
  orderId: string;
}

interface DecreaseProductStockRequest {
  productId: string;
  quantity: number;
}

interface ResponseBody {
  success: boolean;
  error?: string;
  data?: any;
}

function jsonResponse(status: number, body: ResponseBody) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Client-Source, X-Guest-ID, apikey, cache-control",
    },
  });
}

// Handle CORS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Client-Source, X-Guest-ID, apikey, cache-control",
    },
  });
}

// Function to decrease product stock
async function decreaseProductStock(supabase: any, productId: string, quantity: number) {
  try {
    console.log(`[StockService] Decreasing stock for product ${productId} by ${quantity}`);

    // Get current stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      console.error(`[StockService] Error fetching product ${productId}:`, productError);
      throw new Error(`Error fetching product: ${productError?.message || 'Product not found'}`);
    }

    // Calculate new stock quantity
    const currentStock = product.stock_quantity || 0;
    const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative

    console.log(`[StockService] Product "${product.name}": Current stock: ${currentStock}, Ordered: ${quantity}, New stock: ${newStock}`);

    // Update product stock using service role to bypass RLS policies
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (updateError) {
      console.error(`[StockService] Error updating stock for product ${productId}:`, updateError);
      throw new Error(`Error updating stock: ${updateError.message}`);
    }

    console.log(`[StockService] Successfully updated stock for product ${productId} to ${newStock}`);
    return true;
  } catch (error) {
    console.error('[StockService] Error decreasing product stock:', error);
    throw error;
  }
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return handleOptions();
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return jsonResponse(405, { success: false, error: "Method not allowed" });
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse(500, { error: "Supabase configuration is missing", success: false });
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();

    // If we have an orderId, update stock for the entire order
    if (requestData.orderId) {
      console.log(`[StockService] Starting stock update for order: ${requestData.orderId}`);

      // Get order items with quantities
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', requestData.orderId);

      if (itemsError) {
        console.error('[StockService] Error fetching order items:', itemsError);
        return jsonResponse(500, { error: `Error fetching order items: ${itemsError.message}`, success: false });
      }

      if (!orderItems || orderItems.length === 0) {
        console.warn(`[StockService] No items found for order ${requestData.orderId}`);
        return jsonResponse(200, { success: true });
      }

      console.log(`[StockService] Found ${orderItems.length} items to update stock for`);

      // Update stock for each product
      for (const item of orderItems) {
        await decreaseProductStock(supabase, item.product_id, item.quantity);
      }

      console.log(`[StockService] Completed stock update for order: ${requestData.orderId}`);
      return jsonResponse(200, { success: true });
    } 
    // If we have productId and quantity, update a single product
    else if (requestData.productId && requestData.quantity !== undefined && requestData.quantity !== null) {
      await decreaseProductStock(supabase, requestData.productId, requestData.quantity);
      return jsonResponse(200, { success: true });
    }
    else {
      return jsonResponse(400, { 
        success: false, 
        error: "Missing required parameters: either orderId or both productId and quantity" 
      });
    }

  } catch (error) {
    console.error("Unexpected error in update-stock function:", error);
    return jsonResponse(500, { 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    });
  }
});