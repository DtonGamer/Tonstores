import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Helper function to return standardized JSON responses
const jsonResponse = (statusCode: number, body: any) => {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    },
  });
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
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

  // Destructure required fields
  const { orderId } = data;

  // Validate required fields
  if (!orderId) {
    return jsonResponse(400, { error: "Order ID is required" });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(500, { error: "Supabase configuration is missing" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log(`Manual stock update requested for order: ${orderId}`);

    // Get order items with quantities
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return jsonResponse(500, { error: "Failed to fetch order items" });
    }

    if (!orderItems || orderItems.length === 0) {
      console.warn(`No items found for order ${orderId}`);
      return jsonResponse(400, { error: "No items found for the specified order" });
    }

    console.log(`Found ${orderItems.length} items to update stock for`);

    // Update stock for each product
    let successfulUpdates = 0;
    for (const item of orderItems) {
      const success = await decreaseProductStock(supabase, item.product_id, item.quantity);
      if (success) {
        successfulUpdates++;
      }
    }

    console.log(`Completed stock update for order: ${orderId}. Updated ${successfulUpdates}/${orderItems.length} items`);
    
    return jsonResponse(200, { 
      success: true, 
      message: `Stock updated successfully for ${successfulUpdates}/${orderItems.length} items`,
      updatedItems: successfulUpdates,
      totalItems: orderItems.length
    });
  } catch (error: any) {
    console.error('Error in update-stock function:', error);
    return jsonResponse(500, { error: error.message || "Internal server error" });
  }
});

/**
 * Decrease stock for a specific product
 */
async function decreaseProductStock(supabase: any, productId: string, quantity: number) {
  try {
    console.log(`Decreasing stock for product ${productId} by ${quantity}`);

    // Get current stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', productId)
      .maybeSingle();

    if (productError || !product) {
      console.error(`Error fetching product ${productId}:`, productError);
      return false;
    }

    // Calculate new stock quantity
    const currentStock = product.stock_quantity || 0;
    const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative

    console.log(`Product "${product.name}": Current stock: ${currentStock}, Ordered: ${quantity}, New stock: ${newStock}`);

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (updateError) {
      console.error(`Error updating stock for product ${productId}:`, updateError);
      return false;
    }

    console.log(`Successfully updated stock for product ${productId} to ${newStock}`);
    return true;
  } catch (error) {
    console.error('Error decreasing product stock:', error);
    return false;
  }
}