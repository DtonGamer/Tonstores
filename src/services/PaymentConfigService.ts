import { paymentConfig } from '@/lib/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized service for payment configuration
 */
export const PaymentConfigService = {

  /**
   * Get the Paystack public key to use
   * @param userId Optional user ID if using seller-specific key
   * @returns The appropriate Paystack public key
   */
  async getPaystackPublicKey(userId?: string): Promise<string> {
    // Use environment variable only
    const envKey = paymentConfig.paystack.publicKey();
    if (!envKey) {
      throw new Error('Paystack public key not configured in environment variables');
    }

    return envKey;
  },


  /**
   * Get API base URL for payment endpoints
   * @returns The API base URL
   */
  getApiBaseUrl(): string {
    return paymentConfig.apiBaseUrl();
  },

  /**
   * Get seller's Paystack subaccount code
   * @param sellerId The seller ID to fetch subaccount for
   * @returns The subaccount code or null if not found
   */
  async getSellerPaystackSubaccountCode(sellerId: string): Promise<string | null> {
    if (!sellerId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('paystack_subaccount_code')
        .eq('id', sellerId)
        .single();

      if (error || !data?.paystack_subaccount_code) {
        return null;
      }

      return data.paystack_subaccount_code;
    } catch (error) {
      console.error('Error fetching seller Paystack subaccount code:', error);
      return null;
    }
  },


  /**
   * Ensure Paystack script is loaded in the browser
   * @returns Promise that resolves to true when script is loaded
   */
  ensurePaystackScriptLoaded(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        resolve(true);
        return;
      }

      // Create script element for Paystack
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;

      // Set up event handlers
      script.onload = () => {
        console.log("Paystack script loaded successfully");
        resolve(true);
      };

      script.onerror = () => {
        console.error('Failed to load Paystack script');
        resolve(false);
      };

      // Add to document
      document.body.appendChild(script);
    });
  }
};

// For TypeScript to recognize the Paystack object on window
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => any;
    }
  }
}