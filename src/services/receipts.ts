import { toast } from 'react-hot-toast';
import { paymentConfig } from '@/lib/config';
import { unifiedPaystackService } from './UnifiedPaystackService';

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
    const result = await unifiedPaystackService.sendTransactionReceipt({
      reference,
      seller_id: sellerId,
    });

    return {
      success: true,
      message: result.message || 'Receipts sent successfully',
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

// Note: Paystack webhook configuration is typically done in the Paystack dashboard
// and not programmatically per seller. The application's webhook endpoint is already
// configured to handle all Paystack events.