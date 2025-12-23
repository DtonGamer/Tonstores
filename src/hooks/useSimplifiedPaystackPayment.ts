import { useState } from "react";
import { toast } from 'react-hot-toast';
import { supabase } from "@/integrations/supabase/client";
import { Order } from "./useOrders";
import useAuth from "@/contexts/AuthContext";
import { getCurrentUserId, isAnonymousUser } from "@/utils/sessionHelpers";
import useWithSession from "@/hooks/useWithSession";
import { PaymentStatusService } from "@/services/PaymentStatusService";
import { PaymentConfigService } from "@/services/PaymentConfigService";
import { unifiedPaystackService } from "@/services/UnifiedPaystackService";

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
  amount: number;
  email: string;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: {
    order_id: string;
    customer_name: string;
    guest_id?: string;
    user_id?: string;
    is_anonymous?: boolean;
    subaccount?: string;
    percentage_charge?: number;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: any;
  };
  channels: string[];
  onSuccess: (transaction: any) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const useSimplifiedPaystackPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentRetryAvailable, setPaymentRetryAvailable] = useState(false);
  const { user } = useAuth();
  const { withSession } = useWithSession();

  // Helper function to update order status
  const updateOrderStatus = async (orderId: string, status: 'paid' | 'cancelled' | 'failed', paymentStatus: 'paid' | 'failed' | 'cancelled', escrowStatus?: 'held' | 'released' | 'refunded') => {
    if (!orderId) {
      console.error("Cannot update order: Missing order ID");
      return false;
    }

    try {
      return await PaymentStatusService.updateOrderStatusClient(
        orderId,
        status,
        paymentStatus,
        undefined,
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
    // Create a debug log that persists
    const debugLog = (message: string, data?: any) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        data
      };
      console.log('🔍 DEBUG:', logEntry);
      
      // Store in localStorage so you can check after redirect
      try {
        const existingLogs = JSON.parse(localStorage.getItem('payment_debug_logs') || '[]');
        existingLogs.push(logEntry);
        localStorage.setItem('payment_debug_logs', JSON.stringify(existingLogs.slice(-20))); // Keep last 20 logs
      } catch (e) {
        console.error('Failed to store debug log:', e);
      }
    };

    debugLog('=== PAYMENT INITIALIZATION START ===');
    debugLog('Environment', {
      origin: window.location.origin,
      hostname: window.location.hostname,
      isProduction: !window.location.hostname.includes('localhost')
    });

    const isAnonymousOrder = !user || await isAnonymousUser();
    const userId = await getCurrentUserId();

    setIsLoading(true);
    setPaymentRetryAvailable(false);

    if (!order || !order.id) {
      debugLog('ERROR: Invalid order', { order });
      console.error("Invalid order object:", order);
      toast.error("Invalid order. Please try again.");
      setIsLoading(false);
      onClose();
      return;
    }

    setCurrentOrderId(order.id);
    debugLog('Order validated', { orderId: order.id, isAnonymous: isAnonymousOrder });

    try {
      // Get the Paystack public key
      debugLog('Fetching Paystack public key...');
      let publicKey;
      try {
        publicKey = await PaymentConfigService.getPaystackPublicKey();
        debugLog('Public key fetched', { hasKey: !!publicKey, keyLength: publicKey?.length });
      } catch (error) {
        debugLog('ERROR: Failed to get Paystack key', { error });
        console.error("Failed to get Paystack API key:", error);
        toast.error("Payment system configuration error. Please contact support.");
        setIsLoading(false);
        onClose();
        return;
      }

      if (!publicKey || publicKey.trim() === "" || publicKey === "undefined") {
        debugLog('ERROR: Invalid public key', { publicKey });
        console.error("Invalid Paystack API key:", publicKey);
        toast.error("Payment configuration error. Please contact support.");
        onClose();
        return;
      }

      // Get the seller's subaccount code
      debugLog('Fetching seller subaccount...');
      let subaccountCode = null;
      try {
        if (order.user_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.user_id)) {
          subaccountCode = await PaymentConfigService.getSellerPaystackSubaccountCode(order.user_id);
          debugLog('Subaccount fetched', { subaccountCode });
        } else if (order.catalog_id) {
          const { data: catalogData, error: catalogError } = await supabase
            .from("catalogs")
            .select("user_id")
            .eq("id", order.catalog_id)
            .maybeSingle();

          if (!catalogError && catalogData?.user_id) {
            subaccountCode = await PaymentConfigService.getSellerPaystackSubaccountCode(catalogData.user_id);
            debugLog('Subaccount fetched from catalog', { subaccountCode });
          }
        }
      } catch (error) {
        debugLog('WARNING: Error fetching subaccount', { error });
        console.error("Error fetching seller subaccount:", error);
      }

      // Build payment configuration
      const paymentConfig: PaystackConfig = {
        amount: order.total_amount * 100,
        email: customerEmail,
        currency: 'NGN',
        reference: `PS_${order.id.substring(0, 8)}_${Date.now()}`,
        callbackUrl: `${window.location.origin}/api/paystack-webhook`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        metadata: {
          order_id: order.id,
          customer_name: customerName,
          user_id: userId,
          is_anonymous: isAnonymousOrder,
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
          debugLog('Payment success callback', { reference: transaction.reference });
          const updateWithRetry = async (retries = 3) => {
            try {
              const success = await updateOrderStatus(
                order.id,
                'paid',
                'paid',
                'held'
              );

              if (success) {
                debugLog('Order status updated successfully');
                onSuccess(transaction.reference);
              } else if (retries > 0) {
                debugLog(`Order status update failed, retrying... (${retries} attempts left)`);
                setTimeout(() => updateWithRetry(retries - 1), 1000);
              } else {
                debugLog('ERROR: Failed to update order status after retries');
                setPaymentRetryAvailable(true);
                toast.error("We are having trouble connecting to the payment provider.");
              }
            } catch (updateError) {
              debugLog('ERROR: Exception updating order status', { updateError, retries });
              if (retries > 0) {
                setTimeout(() => updateWithRetry(retries - 1), 1000);
              } else {
                setPaymentRetryAvailable(true);
                toast.error("We are having trouble connecting to the payment provider.");
              }
            }
          };

          updateWithRetry();
        },
        onCancel: () => {
          debugLog('Payment cancelled by user');
          setShowCancelConfirm(true);
        },
        onClose: () => {
          debugLog('Payment modal closed');
          setIsLoading(false);
          setCurrentOrderId(null);
          onClose();
        },
      };

      if (subaccountCode) {
        paymentConfig.metadata = {
          ...paymentConfig.metadata,
          subaccount: subaccountCode,
          percentage_charge: 1.5
        };
      }

      debugLog('Payment config prepared', {
        amount: paymentConfig.amount,
        email: paymentConfig.email,
        reference: paymentConfig.reference,
        hasSubaccount: !!subaccountCode
      });

      const paystackTransactionData = {
        amount: paymentConfig.amount,
        email: paymentConfig.email,
        currency: paymentConfig.currency,
        reference: paymentConfig.reference,
        callbackUrl: paymentConfig.callbackUrl,
        channels: paymentConfig.channels,
        metadata: paymentConfig.metadata
      };

      debugLog('Calling initializeEscrowTransaction...');

      // Call the unified paystack service
      const transactionData = await unifiedPaystackService.initializeEscrowTransaction({
        ...paystackTransactionData,
        incomeSplitConfig: paymentConfig.metadata.subaccount ? [{
          subAccountCode: paymentConfig.metadata.subaccount,
          feePercentage: paymentConfig.metadata.percentage_charge || 1.5,
          splitPercentage: 100,
          feeBearer: true
        }] : undefined,
        userId: order.user_id,
        orderId: order.id
      });

      debugLog('Transaction initialized', {
        status: transactionData.status,
        hasData: !!transactionData.data,
        hasAuthUrl: !!transactionData.data?.authorization_url,
        authUrl: transactionData.data?.authorization_url,
        message: transactionData.message
      });

      // Check if we got a valid response
      if (!transactionData) {
        debugLog('ERROR: No transaction data received');
        throw new Error('No response from payment service');
      }

      if (!transactionData.status) {
        debugLog('ERROR: Transaction status is false', { transactionData });
        throw new Error(transactionData.message || 'Transaction initialization failed');
      }

      if (!transactionData.data) {
        debugLog('ERROR: No data in transaction response', { transactionData });
        throw new Error('Invalid response from payment service');
      }

      if (!transactionData.data.authorization_url) {
        debugLog('ERROR: No authorization URL', { data: transactionData.data });
        throw new Error('No checkout URL received from Paystack');
      }

      // If we got here, we have a valid URL
      const authUrl = transactionData.data.authorization_url;
      debugLog('REDIRECTING NOW', { url: authUrl });

      // Add a small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try the standard redirect first
      try {
        window.location.href = authUrl;
      } catch (redirectError) {
        debugLog('Standard redirect failed, trying window.open as fallback', { redirectError });
        console.error('Standard redirect failed:', redirectError);

        // Fallback: Open in a new tab/window if the redirect fails
        const newWindow = window.open(authUrl, '_blank');

        if (!newWindow) {
          // If popup is blocked, show a message to the user
          debugLog('Popup blocked, showing fallback UI');
          console.error('Popup blocked - showing fallback UI');
          toast.error('Payment page blocked. Please allow popups for this site or check your browser settings.');
        }
      }

      // This line should never be reached if redirect works
      debugLog('WARNING: Code after redirect was executed - redirect may have failed');

      // Additional logging in case redirect doesn't work
      console.log('DEBUG: Redirect failed - still on the same page');
      console.log('DEBUG: Authorization URL was:', authUrl);
      console.log('DEBUG: Environment:', {
        hostname: window.location.hostname,
        origin: window.location.origin,
        isSecure: window.location.protocol === 'https:',
        referrer: document.referrer
      });

    } catch (error: any) {
      debugLog('FATAL ERROR', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      console.error("Error initializing payment:", error);

      const isPolicyError = error.code === '42501' ||
                          (error.message && error.message.includes('row-level security policy'));

      if (isPolicyError && isAnonymousOrder) {
        console.error("RLS policy error detected for anonymous order");
        setPaymentRetryAvailable(true);
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