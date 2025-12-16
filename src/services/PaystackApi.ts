import { callSupabaseFunction } from '@/utils/supabaseFunctions';

/**
 * API service to handle all requests to our Supabase edge functions
 * This replaces the old Netlify function calls
 */

export const paystackApi = {
  // Subaccount management
  createSubaccount: async (data: any) => {
    const response = await callSupabaseFunction('paystack-subaccount', data);
    return response;
  },

  // Bank verification
  verifyAccount: async (data: { account_number: string; bank_code: string; dev_mode?: boolean }) => {
    const response = await callSupabaseFunction('paystack-verify-account', data);
    return response;
  },

  // Get banks
  getBanks: async (options: { dev_mode?: boolean } = {}) => {
    const response = await callSupabaseFunction('paystack-banks', { dev_mode: options.dev_mode }, { method: 'GET' });
    return response;
  },

  // Initialize transaction for product purchases
  initializeTransaction: async (data: any) => {
    const response = await callSupabaseFunction('paystack-initialize-transaction', data);
    return response;
  },

  // Initialize escrow transaction for product purchases (funds go to platform first)
  initializeEscrowTransaction: async (data: any) => {
    const response = await callSupabaseFunction('paystack-initialize-escrow-transaction', data);
    return response;
  },

  // Get seller balance
  getSellerBalance: async (userId: string) => {
    const response = await callSupabaseFunction('paystack-seller-balance', { userId }, { method: 'GET' });
    return response;
  },

  // Get ledger history
  getLedgerHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await callSupabaseFunction('paystack-ledger-history', { userId, limit, offset }, { method: 'GET' });
    return response;
  },

  // Get payout history
  getPayoutHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await callSupabaseFunction('paystack-payout-history', { userId, limit, offset }, { method: 'GET' });
    return response;
  },

  // Process payout
  processPayout: async (data: any) => {
    const response = await callSupabaseFunction('paystack-process-payout', data);
    return response;
  },


  // Customer verification
  customerVerification: async (data: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    bvn?: string;
    dev_mode?: boolean;
  }) => {
    const requestData = {
      ...data,
      dev_mode: data.dev_mode ?? (import.meta.env.MODE === 'development' || import.meta.env.DEV_MODE === 'true')
    };
    const response = await callSupabaseFunction('paystack-customer-verification', requestData);
    return response;
  },

  // Webhook endpoint for Paystack notifications
  webhook: async (data: any) => {
    const response = await callSupabaseFunction('paystack-webhook', data);
    return response;
  }
};