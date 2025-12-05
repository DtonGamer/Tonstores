/**
 * Stock configuration settings
 */

// Default threshold for low stock warning (can be overridden by user settings)
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// Stock status types
export type StockStatus = 'normal' | 'low' | 'out';

/**
 * Determines the stock status based on the current stock level and threshold
 * @param currentStock The current stock level
 * @param threshold Optional custom threshold (defaults to DEFAULT_LOW_STOCK_THRESHOLD)
 * @returns Stock status: 'normal', 'low', or 'out'
 */
export const getStockStatus = (
  currentStock: number, 
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): StockStatus => {
  if (currentStock <= 0) return 'out';
  if (currentStock <= threshold) return 'low';
  return 'normal';
}; 