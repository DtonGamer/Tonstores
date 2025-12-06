import { supabase } from "@/integrations/supabase/client";
import { callSupabaseFunction } from '@/utils/supabaseFunctions';

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

      const response = await callSupabaseFunction('update-stock', { orderId });

      if (!response.success) {
        console.error('[StockService] Error updating stock for order:', response.error);
        return false;
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

      const response = await callSupabaseFunction('update-stock', {
        productId,
        quantity
      });

      if (!response.success) {
        console.error('[StockService] Error updating stock for product:', response.error);
        return false;
      }

      console.log(`[StockService] Successfully updated stock for product ${productId}`);
      return true;
    } catch (error) {
      console.error('[StockService] Error decreasing product stock:', error);
      return false;
    }
  }
}; 