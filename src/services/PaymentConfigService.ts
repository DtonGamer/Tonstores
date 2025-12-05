import { paymentConfig } from '@/lib/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized service for payment configuration
 */
export const PaymentConfigService = {

  /**
   * Get the Monnify API key to use
   * @param userId Optional user ID if using seller-specific key
   * @returns The appropriate Monnify API key
   */
  async getMonnifyApiKey(userId?: string): Promise<string> {
    // Use environment variable only
    const envKey = paymentConfig.monnify.apiKey();
    if (!envKey) {
      throw new Error('Monnify API key not configured in environment variables');
    }

    return envKey;
  },

  /**
   * Get the Monnify secret key for server-side operations
   * @returns The Monnify secret key
   */
  async getMonnifySecretKey(): Promise<string> {
    const envKey = paymentConfig.monnify.secretKey();
    if (!envKey) {
      throw new Error('Monnify secret key not configured in environment variables');
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
   * Get seller's Monnify subaccount code
   * @param sellerId The seller ID to fetch subaccount for
   * @returns The subaccount code or null if not found
   */
  async getSellerMonnifySubaccountCode(sellerId: string): Promise<string | null> {
    if (!sellerId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('monnify_subaccount_code')
        .eq('id', sellerId)
        .single();

      if (error || !data?.monnify_subaccount_code) {
        return null;
      }

      return data.monnify_subaccount_code;
    } catch (error) {
      console.error('Error fetching seller Monnify subaccount code:', error);
      return null;
    }
  },

  /**
   * Ensure Monnify script is loaded in the browser
   * @returns Promise that resolves to true when script is loaded
   */
  ensureMonnifyScriptLoaded(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (typeof window !== 'undefined' && (window as any).Monnify) {
        resolve(true);
        return;
      }

      // Create script element for Monnify
      const script = document.createElement('script');
      script.src = 'https://sdk.monnify.com/plugin/monnify.js';
      script.async = true;

      // Set up event handlers
      script.onload = () => {
        console.log("Monnify script loaded successfully");
        resolve(true);
      };

      script.onerror = () => {
        console.error('Failed to load Monnify script');
        resolve(false);
      };

      // Add to document
      document.body.appendChild(script);
    });
  }
};

// For TypeScript to recognize the Monnify object on window
declare global {
  interface Window {
    Monnify: {
      initialize: (config: any) => any;
    }
  }
}