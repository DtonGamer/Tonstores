import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin";

/**
 * Service for managing product stock
 */
export const StockService = {
  /**
   * Update product stock quantities for a paid order
   * @param orderId The ID of the order to update stock for
   * @returns Promise<boolean> True if successful, false otherwise
   */
  async updateStockForOrder(orderId: string): Promise<boolean> {
    try {
      console.log(`[StockService] Starting stock update for order: ${orderId}`);
      
      // Get order items with quantities
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);
      
      if (itemsError) {
        console.error('[StockService] Error fetching order items:', itemsError);
        return false;
      }
      
      if (!orderItems || orderItems.length === 0) {
        console.warn(`[StockService] No items found for order ${orderId}`);
        return false;
      }

      console.log(`[StockService] Found ${orderItems.length} items to update stock for`);

      // Update stock for each product
      for (const item of orderItems) {
        await this.decreaseProductStock(item.product_id, item.quantity);
      }

      console.log(`[StockService] Completed stock update for order: ${orderId}`);
      return true;
    } catch (error) {
      console.error('[StockService] Error updating stock for order:', error);
      return false;
    }
  },

  /**
   * Decrease stock for a specific product
   * @param productId The product ID
   * @param quantity The quantity to decrease
   * @returns Promise<boolean> True if successful, false otherwise
   */
  async decreaseProductStock(productId: string, quantity: number): Promise<boolean> {
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
        return false;
      }

      // Calculate new stock quantity
      const currentStock = product.stock_quantity || 0;
      const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative
      
      console.log(`[StockService] Product "${product.name}": Current stock: ${currentStock}, Ordered: ${quantity}, New stock: ${newStock}`);
      
      // Update product stock using supabaseAdmin to bypass RLS policies
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);
      
      if (updateError) {
        console.error(`[StockService] Error updating stock for product ${productId}:`, updateError);
        return false;
      }
      
      console.log(`[StockService] Successfully updated stock for product ${productId} to ${newStock}`);
      return true;
    } catch (error) {
      console.error('[StockService] Error decreasing product stock:', error);
      return false;
    }
  }
}; 