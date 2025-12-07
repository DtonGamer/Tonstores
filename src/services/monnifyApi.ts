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
  verifyAccount: async (data: { account_number: string; bank_code: string }) => {
    const response = await callSupabaseFunction('monnify-verify-account', data);
    return response;
  },

  // Get banks
  getBanks: async () => {
    const response = await callSupabaseFunction('monnify-banks', {}, { method: 'GET' });
    return response;
  },

  // Initialize transaction
  initializeTransaction: async (data: any) => {
    const response = await callSupabaseFunction('monnify-initialize-transaction', data);
    return response;
  },

  // Create split configuration
  createSplit: async (data: any) => {
    const response = await callSupabaseFunction('monnify-create-split', data);
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

  // Webhook endpoint for Monnify notifications
  webhook: async (data: any) => {
    const response = await callSupabaseFunction('monnify-webhook', data);
    return response;
  }
};