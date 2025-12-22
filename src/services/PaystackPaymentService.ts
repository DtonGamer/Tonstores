import '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { getAdminProfile } from "@/hooks/useProfile";
import { PricingPlan } from '@/hooks/usePricingPlans';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { paymentConfig } from '@/lib/config';
import { PaymentConfigService } from './PaymentConfigService';
import { LedgerService } from '@/lib/ledger';
import { unifiedPaystackService } from './UnifiedPaystackService';

interface PaymentConfig {
  plan: PricingPlan;
  user: User;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

// Define types for Paystack subaccount creation
export interface PaystackSubaccountParams {
  business_name: string;
  account_number: string;
  bank_code: string;
  percentage_charge: number;
}

export interface PayoutParams {
  amount: number;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  reference: string;
  narration?: string;
}

export interface PaystackLedgerEntry {
  id: string;
  subaccountCode: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface PaystackLedgerHistoryResponse {
  entries: PaystackLedgerEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    total_credits: number;
    total_debits: number;
    balance: number;
  };
}

/**
 * Create a Paystack subaccount with the user's bank details
 */
export const createPaystackSubaccount = async (params: PaystackSubaccountParams): Promise<string> => {
  const { business_name, account_number, bank_code, percentage_charge } = params;

  // Get user information for the request
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get business name and email from profile if not provided
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("email, business_name")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw new Error("Could not fetch profile data");
  }

  // Build request payload
  const payload = {
    business_name: business_name || profileData?.business_name || "Default Business",
    account_number: account_number,
    bank_code: bank_code,
    percentage_charge: percentage_charge || 1.5,
  };

  // Call the unified Paystack service for subaccount creation
  const responseData = await unifiedPaystackService.createSubaccount({
    userId: user.id,
    business_name: payload.business_name,
    account_number: payload.account_number,
    bank_code: payload.bank_code,
    percentage_charge: payload.percentage_charge,
  });

  // Return the subaccount code
  const subaccountCode = responseData.subaccount_code || responseData.data?.subaccount_code || responseData.data?.subaccount?.subaccount_code;
  if (!subaccountCode) {
    throw new Error("No subaccount code returned");
  }

  return subaccountCode;
};

/**
 * Process a payout to a seller's account using Paystack
 */
export const processPaystackSellerPayout = async (params: PayoutParams): Promise<boolean> => {
  try {
    const { amount, accountNumber, bankCode, accountName, reference, narration } = params;

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Call the unified Paystack service to process the payout
    const responseData = await unifiedPaystackService.processPayout({
      amount,
      accountNumber,
      bankCode,
      accountName,
      reference,
      narration: narration || `Tonstores payout ${reference}`,
    });
    return responseData.status === true;
  } catch (error: any) {
    console.error('Error processing payout:', error);
    throw new Error(error.message || 'Failed to process payout');
  }
};

/**
 * Get the seller's balance using Paystack
 */
export const getPaystackSellerBalance = async (userId: string): Promise<number> => {
  try {
    // Call the unified Paystack service to get the seller's balance
    const responseData = await unifiedPaystackService.getSellerBalance(userId);
    return responseData.data?.balance || 0;
  } catch (error: any) {
    console.error('Error fetching seller balance:', error);
    return 0; // Default to zero if there's an error
  }
};

/**
 * Get the seller's ledger history from Paystack
 */
export const getPaystackSellerLedgerHistory = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<PaystackLedgerHistoryResponse> => {
  try {
    // Call the unified Paystack service to get the seller's ledger history
    const responseData = await unifiedPaystackService.getLedgerHistory(userId, limit, offset);
    return responseData;
  } catch (error: any) {
    console.error('Error fetching ledger history:', error);
    // Return empty data if there's an error
    return {
      entries: [],
      pagination: {
        total: 0,
        limit,
        offset,
        hasNextPage: false,
        hasPrevPage: false
      },
      summary: {
        total_credits: 0,
        total_debits: 0,
        balance: 0
      }
    };
  }
};

/**
 * Create a Paystack payment configuration for subscription
 */
export const createPaystackConfig = async ({
  plan,
  user,
  billingCycle,
  onSuccess,
  onClose,
}: PaymentConfig) => {
  // Retrieve Paystack public key
  const publicKey = await PaymentConfigService.getPaystackPublicKey();

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, business_name")
    .eq("id", user.id)
    .single();

  // Calculate amount based on billing cycle (Paystack uses kobo)
  const amount = billingCycle === 'yearly' ? plan.yearly_price * 100 : plan.monthly_price * 100; // Convert to kobo

  return {
    publicKey,
    amount,
    customerEmail: profile?.email || user.email || '',
    customerName: profile?.business_name || user.email?.split('@')[0] || 'Customer',
    currency: 'NGN',
    metadata: {
      user_id: user.id,
      plan_id: plan.id,
      billing_cycle: billingCycle
    },
    reference: `paystack_sub_${user.id}_${Date.now().toString()}`,
    onSuccess: (transaction: any) => {
      if (transaction && transaction.reference) {
        onSuccess(transaction.reference);
      }
    },
    onClose: () => {
      onClose();
    }
  };
};

/**
 * Get the seller's payout history using Paystack
 */
export const getPaystackSellerPayoutHistory = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<PaystackPayoutHistoryResponse> => {
  try {
    // Call the unified Paystack service to get the seller's payout history
    const responseData = await unifiedPaystackService.getPayoutHistory(userId, limit, offset);
    return responseData;
  } catch (error: any) {
    console.error('Error fetching payout history:', error);
    // Return empty data if there's an error
    return {
      payouts: [],
      pagination: {
        total: 0,
        limit,
        offset,
        hasNextPage: false,
        hasPrevPage: false
      },
      summary: {
        total_amount: 0,
        total_fees: 0,
        total_net_amount: 0
      }
    };
  }
};

export interface PaystackPayoutHistoryResponse {
  payouts: {
    id: string;
    amount: number;
    fee: number;
    net_amount: number;
    status: string;
    created_at: string;
    reference: string;
    userId?: string;
    destinationAccount: {
      accountNumber: string;
      accountName: string;
      bankName: string;
      bankCode: string;
    };
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    total_amount: number;
    total_fees: number;
    total_net_amount: number;
  };
}