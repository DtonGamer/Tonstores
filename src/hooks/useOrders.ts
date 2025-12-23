import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CartItem } from "./useCart";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId, isAnonymousUser } from "@/utils/sessionHelpers";

// Function to generate UUID v4
const generateUUID = () => {
  return uuidv4();
};

export type OrderFormData = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  delivery_notes?: string;
  social_media_source?: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  delivery_notes?: string;
  total_amount: number;
  status: string;
  payment_status?: string;
  escrow_status?: string;
  release_date?: string;
  catalog_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  payment_provider?: string | null;
  payment_reference?: string | null;
  social_media_source?: string | null;
  catalogs?: {
    name: string;
    slug: string;
  };
};

export const useOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const createOrder = async (
    catalogId: string,
    catalogUserId: string,
    formData: OrderFormData,
    items: CartItem[]
  ) => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error');
      }

      // Determine if this is an anonymous user order
      const isAnonymousOrder = !sessionData.session?.user || await isAnonymousUser(sessionData.session?.user);
      const userId = await getCurrentUserId();

      // Validate required data
      if (!catalogId || !items.length) {
        throw new Error('Missing required order data');
      }

      // Calculate total amount with type safety
      const totalAmount = items.reduce((sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

      // Create the order with proper handling for anonymous users
      const orderData: any = {
        ...formData,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "pending",
        escrow_status: "held", // Initialize escrow status as 'held' by default
        catalog_id: catalogId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        placed_as_guest: isAnonymousOrder, // Use a simpler flag for anonymous orders
        user_id: sessionData.session?.user?.id || userId
      };

      const orderResult = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      const order = orderResult.data;
      const orderError = orderResult.error;

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      if (!order) {
        throw new Error('Order creation failed');
      }

      // Create order items - Supabase handles authentication automatically
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: Number(item.quantity) || 0,
        price_at_purchase: Number(item.price) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const itemsResult = await supabase
        .from("order_items")
        .insert(orderItems);

      const itemsError = itemsResult.error;

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Attempt to delete the order if items creation fails
        try {
          await supabase.from("orders").delete().eq('id', order.id);
        } catch (deleteError) {
          console.error('Error deleting failed order:', deleteError);
        }
        throw itemsError;
      }

      toast({
        title: "Order placed successfully",
        description: "Your order has been submitted.",
      });

      return order;
    } catch (error: any) {
      toast({
        title: "Error creating order",
        description: error.message || 'Failed to create order',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUserOrders = async () => {
    try {
      setIsLoading(true);

      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error');
      }

      const currentUserId = sessionData.session?.user?.id;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Query orders by user_id - Supabase RLS will handle permissions automatically
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          catalogs (
            name,
            slug
          )
        `)
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error retrieving orders",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getOrderDetails = useCallback(async (orderId: string) => {
    try {
      setIsLoading(true);
      
      // Get order details
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          catalogs (
            name,
            slug,
            user_id
          )
        `)
        .eq("id", orderId)
        .limit(1);
      
      if (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
      
      if (!orders || orders.length === 0) {
        console.error("Order not found:", orderId);
        throw new Error("Order not found");
      }
      
      const order = orders[0];
      // Take the first order if multiple exist
      
      // Get order items with product details
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          price_at_purchase,
          product_id,
          product:product_id (
            id,
            name,
            image_url
          )
        `)
        .eq("order_id", orderId);
      
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        throw itemsError;
      }
      
      return { order, items: items || [] };
    } catch (error: any) {
     // console.error("Error retrieving order details:", error);
    //  toast({
    //     title: "Error retrieving order details",
    //    description: error.message || "Failed to load order details",
    //    variant: "destructive",
    //  });
     // throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Updates the status of an order with security checks
   *
   * @param orderId - The ID of the order to update
   * @param status - The new order status
   * @param paymentStatus - Optional new payment status
   * @param escrowStatus - Optional new escrow status
   * @returns A promise that resolves to true if the update was successful
   */
  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string, escrowStatus?: string) => {
    try {
      setIsLoading(true);

      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error');
      }

      const currentUserId = sessionData.session?.user?.id;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Update the order status - Supabase RLS will handle permissions
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status,
          ...(paymentStatus && { payment_status: paymentStatus }),
          ...(escrowStatus && { escrow_status: escrowStatus }),
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId)
        .eq("user_id", currentUserId); // Ensure user can only update their own orders

      if (updateError) throw updateError;

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to check if a user is the seller of a catalog
  const isSellerOfCatalog = async (userId: string, catalogId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("catalogs")
        .select("user_id")
        .eq("id", catalogId)
        .single();
        
      if (error) return false;
      return data.user_id === userId;
    } catch {
      return false;
    }
  };
  
  return {
    createOrder,
    getUserOrders,
    getOrderDetails,
    updateOrderStatus,
    isLoading
  };
};
