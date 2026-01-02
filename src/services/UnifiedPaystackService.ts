/**
 * Unified Paystack Service
 * Consolidates all Paystack operations with consistent dev mode handling
 */

import { callSupabaseFunction } from '@/utils/supabaseFunctions';

// Define types for Paystack operations
export interface PaystackSubaccountParams {
  business_name: string;
  account_number: string;
  bank_code: string;
  percentage_charge: number;
  contact_email?: string;
  contact_name?: string;
  contact_phone?: string;
  bvn?: string;
  userId: string;
}

export interface PaystackVerifyAccountParams {
  account_number: string;
  bank_code: string;
}

export interface PaystackInitializeTransactionParams {
  amount: number;
  email: string;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: any;
  channels?: string[];
  subaccount?: string;
  transaction_charge?: number;
  bearer_type?: string;
  bearer_subaccount?: string;
  userId?: string;
  orderId?: string;
}

export interface PaystackCustomerVerificationParams {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bvn?: string;
  dateOfBirth?: string;
  identificationType?: string;
  identificationNumber?: string;
  identificationExpiryDate?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  businessName?: string;
  businessType?: string;
  businessRegistrationNumber?: string;
  tin?: string;
}

export interface PaystackPayoutParams {
  amount: number;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  reference: string;
  narration?: string;
}

export interface PaystackInitializeEscrowTransactionParams {
  amount: number;
  email: string;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: any;
  channels?: string[];
  subaccount?: string;
  transaction_charge?: number;
  bearer_type?: string;
  bearer_subaccount?: string;
  userId?: string;
  orderId?: string;
  incomeSplitConfig?: Array<{
    subAccountCode: string;
    feePercentage: number;
    splitPercentage: number;
    feeBearer: boolean;
  }>;
}

// Dev mode helper
const isDevMode = (): boolean => {
  return import.meta.env.MODE === 'development' || 
         import.meta.env.DEV_MODE === 'true' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

export const unifiedPaystackService = {
  // Subaccount management
  createSubaccount: async (params: PaystackSubaccountParams) => {
    const response = await callSupabaseFunction('paystack-subaccount', {
      ...params,
      dev_mode: isDevMode()
    });
    return response;
  },

  // Bank verification
  verifyAccount: async (params: PaystackVerifyAccountParams) => {
    const response = await callSupabaseFunction('paystack-verify-account', {
      ...params,
      dev_mode: isDevMode()
    });
    return response;
  },

  // Get banks
  getBanks: async () => {
    const response = await callSupabaseFunction('paystack-banks', { 
      dev_mode: isDevMode() 
    }, { method: 'GET' });
    return response;
  },

  // Initialize transaction for product purchases
  initializeTransaction: async (params: PaystackInitializeTransactionParams) => {
    const response = await callSupabaseFunction('paystack-initialize-transaction', {
      ...params,
      dev_mode: isDevMode()
    });
    return response;
  },

  // Initialize escrow transaction for product purchases (funds go to platform first)
  initializeEscrowTransaction: async (params: PaystackInitializeEscrowTransactionParams) => {
    try {
      const response = await callSupabaseFunction('paystack-initialize-escrow-transaction', {
        ...params,
        dev_mode: isDevMode()
      });

      // Add this logging RIGHT after getting the response
      console.log('EDGE FUNCTION RESPONSE:', JSON.stringify(response, null, 2));

      // Additional logging specifically for the authorization URL
      if (response?.data?.authorization_url) {
        console.log('✅ AUTHORIZATION URL AVAILABLE:', response.data.authorization_url);
      } else {
        console.error('❌ NO AUTHORIZATION URL IN RESPONSE:', {
          hasResponse: !!response,
          hasData: !!response?.data,
          hasAuthUrl: !!response?.data?.authorization_url
        });
      }

      // Make sure you're returning the data correctly
      return response; // Should have data.data.authorization_url
    } catch (error) {
      console.error('ERROR in initializeEscrowTransaction:', error);
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  },

  // Get seller balance
  getSellerBalance: async (userId: string) => {
    const response = await callSupabaseFunction('paystack-seller-balance', { 
      userId, 
      dev_mode: isDevMode() 
    }, { method: 'GET' });
    return response;
  },

  // Get ledger history
  getLedgerHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await callSupabaseFunction('paystack-ledger-history', { 
      userId, 
      limit, 
      offset, 
      dev_mode: isDevMode() 
    }, { method: 'GET' });
    return response;
  },

  // Get payout history
  getPayoutHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await callSupabaseFunction('paystack-payout-history', { 
      userId, 
      limit, 
      offset, 
      dev_mode: isDevMode() 
    }, { method: 'GET' });
    return response;
  },

  // Process payout
  processPayout: async (params: PaystackPayoutParams) => {
    const response = await callSupabaseFunction('paystack-process-payout', {
      ...params,
      dev_mode: isDevMode()
    });
    return response;
  },

  // Request manual payout
  requestPayout: async (userId: string) => {
    const response = await callSupabaseFunction('request-payout', {
      userId,
      dev_mode: isDevMode()
    });
    return response;
  },

  // Customer verification
  customerVerification: async (params: PaystackCustomerVerificationParams) => {
    const response = await callSupabaseFunction('paystack-customer-verification', {
      ...params,
      dev_mode: isDevMode()
    });
    return response;
  },

  // Webhook endpoint for Paystack notifications
  webhook: async (data: any) => {
    const response = await callSupabaseFunction('paystack-webhook', data);
    return response;
  },

  // Send transaction receipt
  sendTransactionReceipt: async (data: { reference: string; seller_id?: string }) => {
    const response = await callSupabaseFunction('paystack-transaction-receipt', {
      ...data,
      dev_mode: isDevMode()
    });
    return response;
  }
};