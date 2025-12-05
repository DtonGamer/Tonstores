# Stock Update System

## Overview

The stock update system is responsible for decreasing product stock quantities when orders are paid. This document explains how stock updates are handled in the application.

## Stock Update Flow

1. When a payment is successful, the order status is updated to "paid"
2. The `PaymentStatusService.updateOrderStatus` method is called, which:
   - Updates the order status in the database
   - Calls `StockService.updateStockForOrder` to update stock quantities
   - Creates ledger entries if needed

3. The `StockService.updateStockForOrder` method:
   - Retrieves all order items for the given order
   - For each item, calls `decreaseProductStock` to update the stock quantity
   - Logs detailed information about the stock update process

## Recent Changes

We've removed duplicate stock update logic to ensure stock is updated exactly once per order:

1. Removed the `updateProductStockForOrder` method from `PaymentStatusService`
   - This was a duplicate of the functionality in `StockService`
   - Now all stock updates go through the dedicated `StockService`

2. Removed the direct stock update call in the `usePaystackPayment` hook
   - The stock was being updated twice: once in the hook and once in the `PaymentStatusService`
   - Now stock updates are only triggered by the `PaymentStatusService`

3. Kept the debug button in the OrderSuccess page
   - This is only visible in development mode
   - It's useful for testing stock updates manually

## Debugging Stock Updates

If stock quantities are not being updated properly:

1. Check the browser console for logs from `StockService` (prefixed with `[StockService]`)
2. Verify that the order status is being updated to "paid" successfully
3. Check if there are any permission issues with updating the products table
4. In development mode, use the "Update Stock (Debug)" button on the OrderSuccess page to manually trigger stock updates

## Manual Stock Updates

For manual stock updates (by admin/seller), use the `updateStockQuantity` method in the `useProducts` hook. This is separate from the automatic stock updates during order processing. 