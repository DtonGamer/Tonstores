import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { supabase } from "@/integrations/supabase/client";
import { Order } from "./useOrders";
import useAuth from "@/contexts/AuthContext";
import { getGuestUserId, setGuestSessionParam } from "@/utils/sessionParams";
import useWithSession from "@/utils/useWithSession";
import { PaymentStatusService } from "@/services/PaymentStatusService";
import { PaymentConfigService } from "@/services/PaymentConfigService";
import { StockService } from "@/services/StockService";
import { paystackApi } from "@/services/PaystackApi";

// Define payment provider types
export type PaymentProvider = "paystack" | "moniepoint" | "opay";

// Define function parameter and return types
interface InitiatePaymentProps {
  order: Order;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

interface PaymentConfig {
  amount: number;
  customer: {
    email: string;
    name: string;
    phoneNumber: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

// Define Paystack specific configuration type
interface PaystackConfig {
  amount: number; // Amount in kobo
  email: string;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: {
    order_id: string;
    customer_name: string;
    guest_id?: string;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  channels: string[];
  onSuccess: (transaction: any) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const usePaystackPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentRetryAvailable, setPaymentRetryAvailable] = useState(false);
  const { user } = useAuth();
  const { withSession } = useWithSession();

  // Debug logging for tracking the order ID
  useEffect(() => {
    if (currentOrderId) {
      // console.log("Current order ID set:", currentOrderId);
    }
  }, [currentOrderId]);

  // Helper function to check if an order exists and is accessible
  const checkOrderExists = async (orderId: string): Promise<boolean> => {
    if (!orderId) return false;

    try {
      return withSession(async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('id', orderId)
          .limit(1);

        if (error) {
          console.error("Error checking order existence:", error);
          return false;
        }

        return data && data.length > 0;
      })();
    } catch (error) {
      console.error("Exception checking order existence:", error);
      return false;
    }
  };

  // Helper function to update order status
  const updateOrderStatus = async (orderId: string, status: 'paid' | 'cancelled' | 'failed', paymentStatus: 'paid' | 'failed' | 'cancelled', escrowStatus?: 'held' | 'released' | 'refunded') => {
    if (!orderId) {
      console.error("Cannot update order: Missing order ID");
      return false;
    }

    try {
      // First check if the order exists and is accessible
      const exists = await checkOrderExists(orderId);
      if (!exists) {
        console.error(`Order with ID ${orderId} not found or not accessible`);
        return false;
      }

      // Use the PaymentStatusService for updating order status
      return await PaymentStatusService.updateOrderStatusClient(
        orderId,
        status,
        paymentStatus,
        undefined, // reference
        escrowStatus
      );
    } catch (updateError) {
      console.error(`Error updating order status to ${status}:`, updateError);
      return false;
    }
  };

  const initializePayment = async ({
    order,
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,
    onClose
  }: InitiatePaymentProps) => {
    // Check if this is a guest order
    const isGuestOrder = !user;
    const guestId = getGuestUserId(); // This will always return a valid string now

    setIsLoading(true);
    setPaymentRetryAvailable(false);

    // Validate order
    if (!order || !order.id) {
      console.error("Invalid order object:", order);
      toast.error("Invalid order. Please try again.");
      setIsLoading(false);
      onClose();
      return;
    }

    setCurrentOrderId(order.id);

    // For guest orders, ensure guest session params are properly set
    if (isGuestOrder) {
      console.log("Explicitly setting guest session for payment initialization");
      await setGuestSessionParam(guestId);
    }

    try {
      // Check if the order exists and is accessible
      const orderExists = await checkOrderExists(order.id);
      if (!orderExists) {
        console.error("Order not accessible:", order.id);
        toast.error("Order not found or not accessible. Please try again.");
        setIsLoading(false);
        onClose();
        return;
      }

      // Get the Paystack public key
      let publicKey;
      try {
        publicKey = await PaymentConfigService.getPaystackPublicKey();
      } catch (error) {
        console.error("Failed to get Paystack API key:", error);
        toast.error("Payment system configuration error. Please contact support.");
        setIsLoading(false);
        onClose();
        return;
      }

      // Validate that we have a valid public key
      if (!publicKey || publicKey.trim() === "" || publicKey === "undefined") {
        console.error("Invalid Paystack API key:", publicKey);
        toast.error("Payment configuration error. Please contact support.");
        onClose();
        return;
      }

      // Get the seller's subaccount code if available
      let subaccountCode = null;
      try {
        // For guest orders, user_id may be null, so check catalog_id instead
        // If user_id exists, check if it's a valid UUID before querying
        if (order.user_id &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.user_id)) {
          subaccountCode = await PaymentConfigService.getSellerPaystackSubaccountCode(order.user_id);
        } else if (order.catalog_id) {
          // For guest orders, try to get seller info from catalog_id
          const catalogId = order.catalog_id;
          const { data: catalogData, error: catalogError } = await supabase
            .from("catalogs")
            .select("user_id")
            .eq("id", catalogId)
            .maybeSingle();

          if (!catalogError && catalogData?.user_id) {
            subaccountCode = await PaymentConfigService.getSellerPaystackSubaccountCode(catalogData.user_id);
          }
        }
      } catch (error) {
        console.error("Error fetching seller subaccount:", error);
        // Continue without subaccount if there's an error
      }

      // Build payment configuration
      const paymentConfig: PaystackConfig = {
        amount: order.total_amount * 100, // Convert to kobo for Paystack
        email: customerEmail,
        currency: 'NGN', // Specify Nigerian Naira as the currency
        // Generate a reference if one doesn't exist in the order
        reference: `PS_${order.id.substring(0, 8)}_${Date.now()}`,
        callbackUrl: `${window.location.origin}/api/paystack-webhook`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        metadata: {
          order_id: order.id,
          customer_name: customerName,
          guest_id: isGuestOrder ? guestId : undefined,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: order.id
            },
            {
              display_name: "Customer Phone",
              variable_name: "customer_phone",
              value: customerPhone
            }
          ]
        },
        onSuccess: (transaction: any) => {
          // Function to update order status with retry logic
          const updateWithRetry = async (retries = 3) => {
            console.log(`Updating order status after successful payment (${retries} retries left)`);
            try {
              // For guest orders, ensure guest session params are properly set
              if (isGuestOrder) {
                await setGuestSessionParam(guestId);
              }

              // Update order status - set payment as paid but escrow as held
              const success = await updateOrderStatus(
                order.id,
                'paid',
                'paid',
                'held' // Set escrow status to 'held' after successful payment
              );

              if (success) {
                console.log("Order status updated successfully");
                onSuccess(transaction.reference);
              } else if (retries > 0) {
                console.log(`Order status update failed, retrying... (${retries} attempts left)`);
                setTimeout(() => updateWithRetry(retries - 1), 1000);
              } else {
                console.error("Failed to update order status after multiple attempts");
                setPaymentRetryAvailable(true);
                toast.error("We are having trouble connecting to the payment provider.");
              }
            } catch (updateError) {
              console.error("Error updating order status:", updateError);
              if (retries > 0) {
                console.log(`Retrying after error (${retries} attempts left)`);
                setTimeout(() => updateWithRetry(retries - 1), 1000);
              } else {
                console.error("Failed to update order status after multiple attempts");
                setPaymentRetryAvailable(true);
                toast.error("We are having trouble connecting to the payment provider.");
              }
            }
          };

          // Start the update process with retries
          updateWithRetry();
        },
        onCancel: () => {
          setShowCancelConfirm(true);
        },
        onClose: () => {
          setIsLoading(false);
          setCurrentOrderId(null);
          onClose();
        },
      };

      // Add subaccount to metadata if available
      if (subaccountCode) {
        paymentConfig.metadata = {
          ...paymentConfig.metadata,
          subaccount: subaccountCode,
          percentage_charge: 1.5 // Default charge percentage
        };
      }

      // Prepare Paystack transaction data
      const paystackTransactionData = {
        amount: paymentConfig.amount, // Amount in kobo
        email: paymentConfig.email,
        currency: paymentConfig.currency,
        reference: paymentConfig.reference,
        callbackUrl: paymentConfig.callbackUrl,
        channels: paymentConfig.channels,
        metadata: paymentConfig.metadata
      };

      // Call the paystackApi service to initialize the escrow transaction
      // For escrow, we route the payment through a platform account initially
      const transactionData = await paystackApi.initializeEscrowTransaction({
        ...paystackTransactionData,
        incomeSplitConfig: paymentConfig.metadata.subaccount ? [{
          subAccountCode: paymentConfig.metadata.subaccount,
          feePercentage: paymentConfig.metadata.percentage_charge || 1.5,
          splitPercentage: 100, // Initially 100% goes to platform
          feeBearer: true
        }] : undefined,
        userId: order.user_id,
        orderId: order.id  // Include order ID for tracking
      });

      if (transactionData.status && transactionData.data?.authorization_url) {
        // Open the Paystack checkout page in the same window
        window.location.href = transactionData.data.authorization_url;
      } else {
        throw new Error(transactionData.message || 'Failed to get checkout URL from Paystack');
      }

    } catch (error: any) {
      console.error("Error initializing payment:", error);

      // Check if this is a policy error
      const isPolicyError = error.code === '42501' ||
                          (error.message && error.message.includes('row-level security policy'));

      if (isPolicyError && isGuestOrder) {
        console.error("RLS policy error detected for guest order, retrying with explicit session params");

        // Set payment retry flag
        setPaymentRetryAvailable(true);

        // Show more user-friendly error
        toast.error("We are having trouble connecting to the payment provider.");
      } else {
        toast.error(error.message || "Failed to initialize payment. Please try again.");
      }

      setIsLoading(false);
      onClose();
    }
  };

  const handleCancelConfirm = async () => {
    if (currentOrderId) {
      try {
        const success = await updateOrderStatus(currentOrderId, 'cancelled', 'cancelled', 'refunded');
        if (!success) {
          console.error("Failed to update order status to cancelled");
        }
      } catch (error) {
        console.error("Error cancelling payment:", error);
      }

      setShowCancelConfirm(false);
    }
  };

  const handleCancelDeny = () => {
    setShowCancelConfirm(false);
  };

  return {
    initializePayment,
    updateOrderStatus,
    isLoading,
    showCancelConfirm,
    handleCancelConfirm,
    handleCancelDeny,
    paymentRetryAvailable,
    currentOrderId
  };
};