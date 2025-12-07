import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CartItem } from "./useCart";
import { v4 as uuidv4 } from 'uuid';
import { getGuestUserId, withSessionParams, setGuestSessionParam, ensureSessionParams } from "@/utils/sessionParams";

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
      
      // Determine if this is a guest order and get the guest ID
      const isGuestOrder = !sessionData.session?.user;
      const guestId = getGuestUserId();
      
      // Set guest session params explicitly for guest orders
      if (isGuestOrder) {
        console.log("Creating order as guest with ID:", guestId);
        console.log("Explicitly setting guest session for order creation");
        
        // First ensure we have a clean session
        if (typeof window !== 'undefined') {
          // Clear any existing session data that might be interfering
          sessionStorage.removeItem('current-guest-id');
        }
        
        // Set the guest session with proper error handling
        const sessionSet = await setGuestSessionParam(guestId);
        if (!sessionSet) {
          console.error("Failed to set guest session parameters");
          throw new Error("Failed to establish guest session. Please try again.");
        }
        
        // Double-check that the session was set correctly
        try {
          const testResult = await supabase.rpc('test_guest_id');
          console.log("Guest session verification:", testResult);
        } catch (testError) {
          console.warn("Guest session verification failed:", testError);
          // Continue anyway as this is just a diagnostic check
        }
      }
      
      // Validate required data
      if (!catalogId || !items.length) {
        throw new Error('Missing required order data');
      }
      
      // Calculate total amount with type safety
      const totalAmount = items.reduce((sum, item) => 
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
      
      // Create the order with proper handling for guest users
      const orderData: any = {
        ...formData,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "pending",
        escrow_status: "held", // Initialize escrow status as 'held' by default
        catalog_id: catalogId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_guest_order: isGuestOrder,
        guest_id: isGuestOrder ? guestId : null,
        user_id: isGuestOrder ? null : sessionData.session?.user?.id
      };
      
      // Execute the operation with retry logic for guest orders
      let order;
      let orderError;
      let retries = 5;
      
      while (retries > 0) {
        // For guest orders, ensure session params are set before each attempt
        if (isGuestOrder) {
          await setGuestSessionParam(guestId);
        }
        
        // Attempt to create the order
        const result = await supabase
          .from("orders")
          .insert(orderData)
          .select()
          .single();
        
        order = result.data;
        orderError = result.error;
        
        // If successful or not a policy error, break the loop
        if (!orderError || orderError.code !== '42501') {
          break;
        }
        
        console.error(`Order creation failed (${retries} retries left):`, orderError);
        retries--;
        
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }
      
      if (!order) {
        throw new Error('Order creation failed');
      }
      
      // Create order items with error handling
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: Number(item.quantity) || 0,
        price_at_purchase: Number(item.price) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      let itemsError;
      retries = 3;
      
      while (retries > 0) {
        // For guest orders, ensure session params are set before each attempt
        if (isGuestOrder) {
          await setGuestSessionParam(guestId);
        }
        
        // Attempt to create the order items
        const result = await supabase
          .from("order_items")
          .insert(orderItems);
        
        itemsError = result.error;
        
        // If successful or not a policy error, break the loop
        if (!itemsError || itemsError.code !== '42501') {
          break;
        }
        
        console.error(`Order items creation failed (${retries} retries left):`, itemsError);
        retries--;
        
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
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
  
  const getUserOrders = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Get the current guest ID - will always be valid
      const guestId = getGuestUserId();
      
      // Check if this is a guest user ID
      const isGuestUser = userId === guestId;
      
      // For guest users, ensure guest session params are set
      if (isGuestUser) {
        await setGuestSessionParam(guestId);
      }
      
      if (isGuestUser) {
        // For guests, query orders directly with is_guest_order filter
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            catalogs (
              name,
              slug
            )
          `)
          .eq("is_guest_order", true)
          .eq("guest_id", guestId)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      } else {
        // For authenticated users, query orders by user_id
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            catalogs (
              name,
              slug
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      }
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
   * @param currentUserId - Optional user ID to validate permissions (if provided, checks if user has permission to update the order)
   * @returns A promise that resolves to true if the update was successful
   * @throws Error if the order is a guest order or if the user doesn't have permission to update it
   */
  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string, currentUserId?: string, escrowStatus?: string) => {
    try {
      setIsLoading(true);

      // First check if this is a guest order and who owns it
      const { data: orderData, error: fetchError } = await supabase
        .from("orders")
        .select("user_id, catalog_id, is_guest_order, guest_id")
        .eq("id", orderId)
        .single();

      if (fetchError) throw fetchError;

      // Get the current guest ID - will always be valid now
      const guestId = getGuestUserId();

      // Check if this is a guest order with matching guest ID
      const isGuestOrder = orderData.is_guest_order === true;
      const isCurrentGuestOrder = isGuestOrder && orderData.guest_id === guestId;

      // For guest orders, ensure guest session params are set
      if (isGuestOrder) {
        await setGuestSessionParam(guestId);
      }

      // Validate permissions
      if (currentUserId) {
        // If a user ID is provided, check if they have permission to update this order
        const isOwner = orderData.user_id === currentUserId;
        const isSeller = orderData.catalog_id && await isSellerOfCatalog(currentUserId, orderData.catalog_id);

        if (!isOwner && !isSeller && !isCurrentGuestOrder) {
          throw new Error('You do not have permission to update this order');
        }
      }

      // Update the order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status,
          ...(paymentStatus && { payment_status: paymentStatus }),
          ...(escrowStatus && { escrow_status: escrowStatus }),
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

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
