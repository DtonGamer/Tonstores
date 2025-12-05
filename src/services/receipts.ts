import { toast } from 'react-hot-toast';
import { paymentConfig } from '@/lib/config';

/**
 * Service functions for handling transaction receipts
 */

/**
 * Interface for receipt sending request
 */
interface SendReceiptProps {
  reference: string;
  sellerId?: string;
}

/**
 * Send transaction receipts for a specific transaction
 * @param params - The receipt parameters
 * @returns Promise with the result
 */
export const sendTransactionReceipts = async (params: SendReceiptProps): Promise<{ success: boolean; message: string }> => {
  const { reference, sellerId } = params;
  
  try {
    const apiBaseUrl = paymentConfig.apiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/monnify-transaction-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        seller_id: sellerId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send receipts');
    }

    return {
      success: true,
      message: data.message || 'Receipts sent successfully',
    };
  } catch (error) {
    console.error('Error sending transaction receipts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Send transaction receipts with UI feedback (toast notifications)
 * @param params - The receipt parameters
 */
export const sendTransactionReceiptsWithToast = async (params: SendReceiptProps): Promise<void> => {
  toast.promise(
    sendTransactionReceipts(params),
    {
      loading: 'Sending receipts...',
      success: (data) => data.message || 'Receipts sent successfully',
      error: (err) => err.message || 'Failed to send receipts',
    }
  );
};

/**
 * Interface for webhook configuration request
 */
interface ConfigureWebhookProps {
  sellerId: string;
  webhookUrl?: string;
}

/**
 * Configure Paystack webhook for a seller
 * @param params - The webhook configuration parameters
 * @returns Promise with the result
 */
export const configurePaystackWebhook = async (params: ConfigureWebhookProps): Promise<{ success: boolean; message: string }> => {
  const { sellerId, webhookUrl } = params;
  
  try {
    const apiBaseUrl = paymentConfig.apiBaseUrl();
    // Use the default webhook URL if not provided
    const finalWebhookUrl = webhookUrl || `${apiBaseUrl}/.netlify/functions/paystack-webhook`;
    
    const response = await fetch(`${apiBaseUrl}/.netlify/functions/configure-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seller_id: sellerId,
        webhook_url: finalWebhookUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.paystack_message || 'Failed to configure webhook');
    }

    return {
      success: true,
      message: data.message || 'Webhook configured successfully',
    };
  } catch (error) {
    console.error('Error configuring webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Configure Paystack webhook with UI feedback (toast notifications)
 * @param params - The webhook configuration parameters
 */
export const configurePaystackWebhookWithToast = async (params: ConfigureWebhookProps): Promise<void> => {
  toast.promise(
    configurePaystackWebhook(params),
    {
      loading: 'Configuring webhook...',
      success: (data) => data.message || 'Webhook configured successfully',
      error: (err) => err.message || 'Failed to configure webhook',
    }
  );
}; 