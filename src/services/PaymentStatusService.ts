import { supabase } from "@/integrations/supabase/client";
import { withSessionParams, setGuestSessionParam, getGuestUserId } from "@/utils/sessionParams";
import { StockService } from "./StockService";

type OrderStatus = 'paid' | 'failed' | 'cancelled' | 'pending';
type PaymentStatus = 'paid' | 'failed' | 'cancelled' | 'pending';
type PayoutStatus = 'completed' | 'failed' | 'processing';

export interface UpdateOrderStatusParams {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  reference?: string;
  isAdminOperation?: boolean;
}

export interface UpdatePayoutStatusParams {
  payoutId: string;
  payoutStatus: PayoutStatus;
  reference: string;
  isAdminOperation?: boolean;
}

/**
 * Centralized service for handling payment status updates
 */
export const PaymentStatusService = {
  /**
   * Update order status and create appropriate ledger entries
   */
  async updateOrderStatus({
    orderId,
    status,
    paymentStatus,
    reference,
    isAdminOperation = false
  }: UpdateOrderStatusParams) {
    // Only use regular supabase client for client-side operations
    // Admin operations should be handled server-side to prevent exposing admin credentials
    const dbClient = supabase;

    try {
      // Get order details first - use maybeSingle instead of single to avoid 406 errors
      const { data: orderData, error: findError } = await dbClient
        .from('orders')
        .select('id, user_id, total_amount, transaction_reference, is_guest_order, guest_id')
        .eq('id', orderId)
        .maybeSingle();

      if (findError || !orderData) {
        console.error('Error finding order record:', findError || 'Order not found');
        return { success: false, error: 'Order record not found' };
      }

      // For guest orders, ensure guest session params are properly set
      if (orderData.is_guest_order && orderData.guest_id) {
        try {
          await setGuestSessionParam(orderData.guest_id);
        } catch (sessionError) {
          console.error('Error setting guest session param:', sessionError);
          // Continue anyway as we'll try to update the order
        }
      }

      // Update order status
      const { error: updateError } = await dbClient
        .from('orders')
        .update({
          status: status,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
          // Set payment reference if provided
          ...(reference && { payment_reference: reference }),
          // Set payment_date if the order is being marked as paid
          ...(status === 'paid' && { payment_date: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (updateError) {
        console.error(`Failed to update order status to ${status}:`, updateError);
        return { success: false, error: updateError };
      }

      // If payment status is 'paid', update product stock quantities
      if (paymentStatus === 'paid') {
        try {
          console.log(`Updating stock for paid order: ${orderId}`);
          const stockUpdated = await StockService.updateStockForOrder(orderId);
          console.log(`Stock update result for order ${orderId}: ${stockUpdated ? 'Success' : 'Failed'}`);
        } catch (stockError) {
          console.error('Error updating product stock:', stockError);
          // Continue even if stock update fails
        }
      }

      // Ledger entries should be created server-side only to prevent security issues
      // Client-side code should not attempt to create ledger entries directly
      if (paymentStatus === 'paid' && isAdminOperation) {
        console.warn('Client-side ledger entries are not supported. This should be handled server-side.');
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating order status:`, error);
      return { success: false, error };
    }
  },

  /**
   * Client-side wrapper for updating order status
   */
  async updateOrderStatusClient(
    orderId: string, 
    status: OrderStatus, 
    paymentStatus: PaymentStatus,
    reference?: string
  ) {
    if (!orderId) {
      console.error("Cannot update order: Missing order ID");
      return false;
    }

    // Get order details to check if it's a guest order
    let isGuestOrder = false;
    let guestId = '';
    
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('is_guest_order, guest_id')
        .eq('id', orderId)
        .maybeSingle();
        
      if (orderData) {
        isGuestOrder = !!orderData.is_guest_order;
        guestId = orderData.guest_id || getGuestUserId();
      }
    } catch (error) {
      console.error("Error checking if order is guest order:", error);
      // Continue anyway, we'll try to update using standard approach
    }
    
    // Implement retry logic
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        // For guest orders, ensure guest session params are properly set
        if (isGuestOrder && guestId) {
          await setGuestSessionParam(guestId);
        }
        
        // Try to update the order status
        const result = await withSessionParams(async () => {
          const { success, error } = await this.updateOrderStatus({ 
            orderId, 
            status, 
            paymentStatus,
            reference
          });
          
          if (!success) {
            console.error(`Failed to update order status:`, error);
            return false;
          }
          
          return true;
        });
        
        success = result;
        
        if (success) {
          console.log(`Successfully updated order status to ${status}`);
          break;
        } else {
          console.log(`Update failed, retries left: ${retries - 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error in client-side order status update (retries left: ${retries - 1}):`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      retries--;
    }
    
    return success;
  },

  /**
   * Update payout status and create appropriate ledger entries
   */
  async updatePayoutStatus({
    payoutId,
    payoutStatus,
    reference,
    isAdminOperation = false
  }: UpdatePayoutStatusParams) {
    // Only use regular supabase client for client-side operations
    // Admin operations should be handled server-side to prevent exposing admin credentials
    const dbClient = supabase;

    try {
      // Get payout details first
      const { data: payoutData, error: findError } = await dbClient
        .from('payouts')
        .select('id, user_id, amount')
        .eq('id', payoutId)
        .single();

      if (findError) {
        console.error('Error finding payout record:', findError);
        return { success: false, error: 'Payout record not found' };
      }

      // Update payout status
      const { error: updateError } = await dbClient
        .from('payouts')
        .update({
          status: payoutStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', payoutData.id);

      if (updateError) {
        console.error('Error updating payout record:', updateError);
        return { success: false, error: 'Failed to update payout record' };
      }

      // Ledger entries should be created server-side only to prevent security issues
      // Client-side code should not attempt to create ledger entries directly
      if (payoutStatus === 'completed' && isAdminOperation) {
        console.warn('Client-side ledger entries are not supported. This should be handled server-side.');
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating payout status:`, error);
      return { success: false, error };
    }
  }
}; 