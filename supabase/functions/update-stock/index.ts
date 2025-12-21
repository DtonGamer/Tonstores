import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  jsonResponse,
  handleCorsOptions,
  createSupabaseClient,
  handleCommonError,
  isDevelopmentMode,
  mapSnakeToCamel
} from '../_shared/utils.ts';

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
      return handleCorsOptions();
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return jsonResponse(405, { success: false, error: "Method not allowed" });
    }

    // Parse request body
    const requestData = await req.json();

    // Check for development mode
    const devMode = requestData.dev_mode === true || isDevelopmentMode();

    // Handle development mode
    if (devMode) {
      console.log("Development mode - simulating stock update operation");

      // Simulate the stock update operation without actually connecting to Supabase
      if (requestData.orderId) {
        console.log(`[StockService] Simulating stock update for order: ${requestData.orderId}`);
        // In dev mode, we just log that we would update the stock
        return jsonResponse(200, {
          success: true,
          message: "Stock update simulated in development mode",
          dev_mode: true,
          simulated_order_id: requestData.orderId
        });
      } else if (requestData.productId && requestData.quantity !== undefined && requestData.quantity !== null) {
        console.log(`[StockService] Simulating stock update for product: ${requestData.productId}, quantity: ${requestData.quantity}`);
        return jsonResponse(200, {
          success: true,
          message: "Stock update simulated in development mode",
          dev_mode: true,
          simulated_product_id: requestData.productId,
          simulated_quantity: requestData.quantity
        });
      } else {
        return jsonResponse(400, {
          success: false,
          error: "Missing required parameters: either orderId or both productId and quantity"
        });
      }
    }

    // Initialize Supabase client using shared utility
    const supabase = createSupabaseClient();
    if (!supabase) {
      return jsonResponse(500, { error: "Supabase configuration is missing", success: false });
    }

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
    return handleCommonError(error, "Stock update");
  }
});