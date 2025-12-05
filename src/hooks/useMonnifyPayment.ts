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

// Define payment provider types
export type PaymentProvider = "monnify" | "moniepoint" | "opay";

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

// Define Monnify specific configuration type
interface MonnifyConfig {
  amount: number;
  customerEmail: string;
  customerName: string;
  currency: string;
  reference: string;
  description: string;
  callbackUrl: string;
  returnUrl?: string;
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
  incomeSplitConfig?: Array<{
    subAccountCode: string;
    feePercentage: number;
    splitPercentage: number;
    feeBearer: boolean;
  }>;
  onSuccess: (transaction: any) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const useMonnifyPayment = () => {
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
  const updateOrderStatus = async (orderId: string, status: 'paid' | 'cancelled' | 'failed', paymentStatus: 'paid' | 'failed' | 'cancelled') => {
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
        paymentStatus
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

      // Get the Monnify API key
      let publicKey;
      try {
        publicKey = await PaymentConfigService.getMonnifyApiKey(order.user_id);
      } catch (error) {
        console.error("Failed to get Monnify API key:", error);
        toast.error("Payment system configuration error. Please contact support.");
        setIsLoading(false);
        onClose();
        return;
      }

      // Validate that we have a valid public key
      if (!publicKey || publicKey.trim() === "" || publicKey === "undefined") {
        console.error("Invalid Monnify API key:", publicKey);
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
          subaccountCode = await PaymentConfigService.getSellerMonnifySubaccountCode(order.user_id);
        } else if (order.catalog_id) {
          // For guest orders, try to get seller info from catalog_id
          const catalogId = order.catalog_id;
          const { data: catalogData, error: catalogError } = await supabase
            .from("catalogs")
            .select("user_id")
            .eq("id", catalogId)
            .maybeSingle();

          if (!catalogError && catalogData?.user_id) {
            subaccountCode = await PaymentConfigService.getSellerMonnifySubaccountCode(catalogData.user_id);
          }
        }
      } catch (error) {
        console.error("Error fetching seller subaccount:", error);
        // Continue without subaccount if there's an error
      }

      // Build payment configuration
      const paymentConfig: MonnifyConfig = {
        amount: order.total_amount, // Amount in kobo
        customerEmail: customerEmail,
        customerName: customerName,
        currency: 'NGN', // Specify Nigerian Naira as the currency
        // Generate a reference if one doesn't exist in the order
        reference: `MNFY_${order.id.substring(0, 8)}_${Date.now()}`,
        description: `Payment for Order #${order.id}`,
        callbackUrl: `${window.location.origin}/api/monnify-webhook`,
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

              // Update order status
              const success = await updateOrderStatus(
                order.id,
                'paid',
                'paid'
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

      // Add income split configuration if subaccount is available
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (subaccountCode && !isDevelopment) {
        console.log("Adding income split configuration with subaccount:", subaccountCode);
        paymentConfig.incomeSplitConfig = [
          {
            subAccountCode: subaccountCode,
            feePercentage: 2, // 2% fee
            splitPercentage: 98, // 98% goes to the seller
            feeBearer: true
          }
        ];
      } else if (isDevelopment) {
        console.log("Skipping subaccount in development mode");
      }

      // Prepare Monnify transaction data
      const monnifyTransactionData = {
        amount: paymentConfig.amount / 100, // Convert from kobo to naira
        currencyCode: paymentConfig.currency,
        customerName: paymentConfig.customerName,
        customerEmail: paymentConfig.customerEmail,
        paymentReference: paymentConfig.reference,
        description: paymentConfig.description,
        callbackUrl: paymentConfig.callbackUrl,
        ...(paymentConfig.incomeSplitConfig && { incomeSplitConfig: paymentConfig.incomeSplitConfig }),
        ...(paymentConfig.returnUrl && { returnUrl: paymentConfig.returnUrl }),
        metadata: paymentConfig.metadata
      };

      // Call the API to initialize the Monnify transaction
      const response = await fetch('/api/monnify-initialize-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...monnifyTransactionData,
          userId: order.user_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize Monnify transaction');
      }

      const transactionData = await response.json();

      if (transactionData.status && transactionData.data?.checkoutUrl) {
        // Open the Monnify checkout page in the same window
        window.location.href = transactionData.data.checkoutUrl;
      } else {
        throw new Error(transactionData.message || 'Failed to get checkout URL from Monnify');
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
        const success = await updateOrderStatus(currentOrderId, 'cancelled', 'cancelled');
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