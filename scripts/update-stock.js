#!/usr/bin/env node

/**
 * Script to manually update stock for a specific order
 * 
 * Usage: 
 * node scripts/update-stock.js ORDER_ID
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Get order ID from command line arguments
const orderId = process.argv[2];

if (!orderId) {
  console.error('Error: Order ID must be provided as a command line argument');
  console.error('Usage: node scripts/update-stock.js ORDER_ID');
  process.exit(1);
}

/**
 * Update stock for a specific order
 */
async function updateStockForOrder(orderId) {
  try {
    console.log(`Starting stock update for order: ${orderId}`);
    
    // Get order items with quantities
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return false;
    }
    
    if (!orderItems || orderItems.length === 0) {
      console.warn(`No items found for order ${orderId}`);
      return false;
    }

    console.log(`Found ${orderItems.length} items to update stock for`);

    // Update stock for each product
    for (const item of orderItems) {
      await decreaseProductStock(item.product_id, item.quantity);
    }

    console.log(`Completed stock update for order: ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error updating stock for order:', error);
    return false;
  }
}

/**
 * Decrease stock for a specific product
 */
async function decreaseProductStock(productId, quantity) {
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

// Execute stock update
updateStockForOrder(orderId)
  .then(result => {
    if (result) {
      console.log('Stock update completed successfully');
      process.exit(0);
    } else {
      console.error('Stock update failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 