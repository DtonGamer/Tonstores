import { callSupabaseFunction } from '@/utils/supabaseFunctions';

/**
 * API service to handle all requests to our Supabase edge functions
 * This replaces the old Netlify function calls
 */

export const monnifyApi = {
  // Subaccount management
  createSubaccount: async (data: any) => {
    const response = await callSupabaseFunction('monnify-subaccount', data);
    return response;
  },

  // Bank verification
  verifyAccount: async (data: { account_number: string; bank_code: string; dev_mode?: boolean }) => {
    const response = await callSupabaseFunction('monnify-verify-account', data);
    return response;
  },

  // Get banks
  getBanks: async (options: { dev_mode?: boolean } = {}) => {
    const response = await callSupabaseFunction('monnify-banks', { dev_mode: options.dev_mode }, { method: 'GET' });
    return response;
  },

  // Initialize escrow transaction for product purchases
  initializeEscrowTransaction: async (data: any) => {
    const response = await callSupabaseFunction('monnify-initialize-escrow-transaction', data);
    return response;
  },

  // Initialize direct transaction (non-escrow) for subscriptions and other direct payments
  initializeDirectTransaction: async (data: any) => {
    const response = await callSupabaseFunction('monnify-initialize-transaction', data);
    return response;
  },

  // Get seller balance
  getSellerBalance: async (userId: string) => {
    const response = await callSupabaseFunction('monnify-seller-balance', { userId }, { method: 'GET' });
    return response;
  },

  // Get ledger history
  getLedgerHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await callSupabaseFunction('monnify-ledger-history', { userId, limit, offset }, { method: 'GET' });
    return response;
  },

  // Get payout history
  getPayoutHistory: async (userId: string, limit: number = 10, offset: number = 0) => {
    const response = await callSupabaseFunction('monnify-payout-history', { userId, limit, offset }, { method: 'GET' });
    return response;
  },

  // Process payout
  processPayout: async (data: any) => {
    const response = await callSupabaseFunction('monnify-process-payout', data);
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
    const response = await callSupabaseFunction('monnify-customer-verification', requestData);
    return response;
  },

  // Webhook endpoint for Monnify notifications
  webhook: async (data: any) => {
    const response = await callSupabaseFunction('monnify-webhook', data);
    return response;
  }
};