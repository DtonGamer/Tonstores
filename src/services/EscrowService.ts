import { supabase } from "@/integrations/supabase/client";
import { PaymentStatusService } from "./PaymentStatusService";

type OrderStatus = 'paid' | 'failed' | 'cancelled' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'dispute';
type PaymentStatus = 'paid' | 'failed' | 'cancelled' | 'pending' | 'refunded';
type EscrowStatus = 'held' | 'released' | 'refunded';

export interface ConfirmDeliveryParams {
  orderId: string;
  userId?: string;
}

export interface EscrowReleaseParams {
  orderId: string;
  adminId?: string;
}

export interface EscrowRefundParams {
  orderId: string;
  adminId?: string;
}

/**
 * Service for handling escrow-related operations
 */
export const EscrowService = {
  /**
   * Confirm delivery and release funds from escrow
   * This is called by the buyer after confirming they received their order
   */
  async confirmDeliveryAndReleaseFunds({ orderId, userId }: ConfirmDeliveryParams) {
    if (!orderId) {
      console.error("Cannot confirm delivery: Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    try {
      // First, get the order details to check amount and seller account info
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*, catalogs (user_id)')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error("Error fetching order details:", fetchError);
        return { success: false, error: fetchError.message };
      }

      if (!order) {
        console.error("Order not found:", orderId);
        return { success: false, error: "Order not found" };
      }

      if (!order.catalogs || !order.catalogs.user_id) {
        console.error("Seller user ID not found for order:", orderId);
        return { success: false, error: "Seller information not available" };
      }

      // Get seller's profile to retrieve their Monnify subaccount code
      const { data: sellerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('monnify_subaccount_code')
        .eq('id', order.catalogs.user_id)
        .single();

      if (profileError) {
        console.error("Error fetching seller profile:", profileError);
        return { success: false, error: "Seller account information not available" };
      }

      if (!sellerProfile.monnify_subaccount_code) {
        console.error("Seller does not have a Monnify subaccount:", order.catalogs.user_id);
        return { success: false, error: "Seller has not set up payment account" };
      }

      // Update the order's status and escrow status
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          escrow_status: 'released',
          release_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('escrow_status', 'held') // Only allow release if currently held
        .select()
        .single();

      if (error) {
        console.error("Error confirming delivery:", error);

        // Check if the error is due to permission issues or business rule violations
        if (error.code === '42501' || error.message.includes('permission')) {
          return { success: false, error: "You don't have permission to confirm delivery for this order" };
        }

        return { success: false, error: error.message };
      }

      // In a complete implementation, you would call Monnify's disbursement API here
      // to transfer the funds to the seller's account
      // Note: For true escrow functionality with Monnify, you would need to:
      // 1. Initially route payments to a platform account using incomeSplitConfig
      // 2. Hold the funds in the platform account until delivery confirmation
      // 3. On delivery confirmation, process a disbursement to the seller's account
      // For now, we're tracking this in the database status and in a real implementation,
      // you would execute the disbursement via Monnify's API
      await this.releaseFundsToSeller(orderId, sellerProfile.monnify_subaccount_code);

      console.log(`Successfully confirmed delivery and released funds for order ${orderId}`, updatedOrder);

      return {
        success: true,
        order: updatedOrder,
        message: "Delivery confirmed and funds release process initiated"
      };
    } catch (error) {
      console.error("Error confirming delivery and releasing funds:", error);
      return { success: false, error };
    }
  },

  /**
   * Seller ships the order - this moves the order from processing to shipped
   * but funds remain in escrow
   */
  async markOrderAsShipped(orderId: string) {
    if (!orderId) {
      console.error("Cannot mark order as shipped: Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    try {
      // Update order status to shipped while keeping funds in escrow
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error("Error marking order as shipped:", error);
        return { success: false, error: error.message };
      }

      console.log(`Successfully marked order ${orderId} as shipped`, data);

      return { 
        success: true, 
        order: data,
        message: "Order marked as shipped successfully" 
      };
    } catch (error) {
      console.error("Error marking order as shipped:", error);
      return { success: false, error };
    }
  },

  /**
   * Admin function to manually release funds from escrow
   */
  async adminReleaseEscrowFunds({ orderId, adminId }: EscrowReleaseParams) {
    return PaymentStatusService.releaseEscrowFunds(orderId, adminId);
  },

  /**
   * Admin function to manually refund funds from escrow
   */
  async adminRefundEscrowFunds({ orderId, adminId }: EscrowRefundParams) {
    return PaymentStatusService.refundEscrowFunds(orderId, adminId);
  },

  /**
   * Get escrow summary for a user
   */
  async getUserEscrowSummary(userId: string) {
    if (!userId) {
      console.error("Cannot get escrow summary: Missing user ID");
      return { success: false, error: "Missing user ID" };
    }

    try {
      // Get orders where user is seller with held funds
      const { data: sellerOrders, error: sellerError } = await supabase
        .from('orders')
        .select('id, total_amount, customer_name, created_at, escrow_status')
        .eq('user_id', userId)
        .eq('escrow_status', 'held')
        .gt('total_amount', 0);

      if (sellerError) {
        console.error("Error getting seller escrow orders:", sellerError);
        return { success: false, error: sellerError.message };
      }

      // Calculate total held amount
      const totalHeld = sellerOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      return { 
        success: true,
        summary: {
          heldOrders: sellerOrders || [],
          totalHeldAmount: totalHeld,
          count: sellerOrders?.length || 0
        }
      };
    } catch (error) {
      console.error("Error getting user escrow summary:", error);
      return { success: false, error };
    }
  },

  /**
   * Actually release funds to seller using Monnify disbursement API
   */
  async releaseFundsToSeller(orderId: string, subAccountCode: string) {
    try {
      // Get the order details to get the amount to transfer
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('total_amount, customer_name, customer_email')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        console.error("Error fetching order for fund release:", fetchError);
        throw new Error("Could not fetch order details for fund release");
      }

      // Call the Supabase function to release funds from escrow to the seller
      const releaseData = {
        orderId: orderId,
        releaseToSubaccountCode: subAccountCode,
        amount: order.total_amount, // Optional - if not provided, will use order total
        dev_mode: process.env.NODE_ENV === 'development' // Pass development mode flag
      };

      const response = await fetch('/api/monnify-release-escrow-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(releaseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error releasing funds to seller:", errorData);
        throw new Error(errorData.error || "Failed to release funds to seller");
      }

      const result = await response.json();
      console.log("Fund release result:", result);

      return { success: true, result };
    } catch (error) {
      console.error("Error in releaseFundsToSeller:", error);
      return { success: false, error };
    }
  },

  /**
   * Get order details with escrow status
   */
  async getOrderWithEscrowStatus(orderId: string) {
    if (!orderId) {
      console.error("Cannot get order: Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          catalogs (
            name,
            slug
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error("Error getting order details:", error);
        return { success: false, error: error.message };
      }

      return { success: true, order: data };
    } catch (error) {
      console.error("Error getting order details:", error);
      return { success: false, error };
    }
  }
};