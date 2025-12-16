import { callSupabaseFunction } from '@/utils/supabaseFunctions';

interface CreateLedgerEntryParams {
  subaccount_code: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  description: string;
  seller_id: string;
}

/**
 * LedgerService - Centralized service for all ledger-related operations
 */
export const LedgerService = {
  /**
   * Creates a ledger entry for tracking financial transactions
   *
   * @param params Ledger entry parameters
   * @returns Success status and any error information
   */
  async createLedgerEntry(params: CreateLedgerEntryParams) {
    try {
      const response = await callSupabaseFunction('paystack-create-ledger-entry', { params });

      if (!response.success) {
        console.error('Error creating ledger entry:', response.error);
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error creating ledger entry:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};