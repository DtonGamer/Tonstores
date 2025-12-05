import { supabaseAdmin } from '@/integrations/supabase/admin';

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
    const { error } = await supabaseAdmin
      .from('ledger_entries')
      .insert({
        ...params,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating ledger entry:', error);
      return { success: false, error };
    }
    
    return { success: true };
  }
}; 