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

  // Call the Supabase edge function for Paystack subaccount creation
  const response = await fetch(`${PaymentConfigService.getApiBaseUrl()}/api/paystack-subaccount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({
      userId: user.id,
      business_name: payload.business_name,
      account_number: payload.account_number,
      bank_code: payload.bank_code,
      percentage_charge: payload.percentage_charge,
    })
  });

  if (!response.ok) {
    // Try to get the error message from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || `API call failed with status ${response.status}`);
    } catch (e) {
      throw new Error(`API call failed with status ${response.status}`);
    }
  }

  // Parse the response
  const responseData = await response.json();

  // Return the subaccount code
  if (!responseData.subaccountCode) {
    throw new Error("No subaccount code returned");
  }

  return responseData.subaccountCode;
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

    // Call the API endpoint to process the payout
    const response = await fetch(`${PaymentConfigService.getApiBaseUrl()}/api/paystack-process-payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      body: JSON.stringify({
        amount,
        destinationAccountNumber: accountNumber,
        destinationBankCode: bankCode,
        destinationAccountName: accountName,
        reference,
        narration: narration || `Tonstores payout ${reference}`,
        userId: user.id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to process payout: ${response.status}`);
    }

    const responseData = await response.json();
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
    // Check if we're in development mode
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // For local development, return a mock balance to avoid CORS issues
    if (isLocalDevelopment) {
      // Return a random balance between 0 and 100,000 (in kobo)
      return Math.floor(Math.random() * 10000000);
    }

    // Call the API endpoint to get the seller's balance
    const response = await fetch(`${PaymentConfigService.getApiBaseUrl()}/api/paystack-seller-balance?userId=${userId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const responseData = await response.json();
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
    // Check if we're in development mode
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // For local development, return mock data to avoid CORS issues
    if (isLocalDevelopment) {
      // Generate some mock ledger entries
      const mockEntries: PaystackLedgerEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `mock-entry-${i + 1}`,
        subaccountCode: 'SUB_mock12345',
        type: i % 3 === 0 ? 'debit' : 'credit',
        amount: Math.floor(Math.random() * 1000000), // Random amount between 0 and 10,000 (in kobo)
        reference: `REF-${Math.random().toString(36).substring(2, 10)}`,
        description: i % 3 === 0 ? 'Payout processed' : 'Payment received',
        userId: userId,
        createdAt: new Date(Date.now() - i * 86400000).toISOString() // Each entry is one day older
      }));

      // Calculate totals
      const totalCredits = mockEntries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
      const totalDebits = mockEntries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

      return {
        entries: mockEntries.slice(offset, offset + limit),
        pagination: {
          total: mockEntries.length,
          limit,
          offset,
          hasNextPage: offset + limit < mockEntries.length,
          hasPrevPage: offset > 0
        },
        summary: {
          total_credits: totalCredits,
          total_debits: totalDebits,
          balance: totalCredits - totalDebits
        }
      };
    }

    // Call the API endpoint to get the seller's ledger history
    const response = await fetch(
      `${PaymentConfigService.getApiBaseUrl()}/api/paystack-ledger-history?userId=${userId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const responseData = await response.json();
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
    // Check if we're in development mode
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // For local development, return mock data to avoid CORS issues
    if (isLocalDevelopment) {
      // Generate some mock payout records
      const mockPayouts = Array.from({ length: 15 }, (_, i) => {
        const amount = Math.floor(Math.random() * 5000000); // Random amount between 0 and 50,000 (in kobo)
        const fee = Math.floor(amount * 0.015); // 1.5% fee

        return {
          id: `mock-payout-${i + 1}`,
          amount: amount,
          fee: fee,
          net_amount: amount - fee,
          status: ['SUCCESS', 'FAILED', 'PROCESSING'][Math.floor(Math.random() * 3)],
          created_at: new Date(Date.now() - i * 86400000).toISOString(), // Each entry is one day older
          reference: `REF-${Math.random().toString(36).substring(2, 10)}`,
          userId: userId,
          destinationAccount: {
            accountNumber: `200${Math.random().toString().substring(2, 12)}`,
            accountName: `Test Account ${i + 1}`,
            bankName: 'Test Bank',
            bankCode: 'TEST'
          }
        };
      });

      // Calculate totals
      const totalAmount = mockPayouts.reduce((sum, p) => sum + p.amount, 0);
      const totalFees = mockPayouts.reduce((sum, p) => sum + p.fee, 0);

      return {
        payouts: mockPayouts.slice(offset, offset + limit),
        pagination: {
          total: mockPayouts.length,
          limit,
          offset,
          hasNextPage: offset + limit < mockPayouts.length,
          hasPrevPage: offset > 0
        },
        summary: {
          total_amount: totalAmount,
          total_fees: totalFees,
          total_net_amount: totalAmount - totalFees
        }
      };
    }

    // Call the API endpoint to get the seller's payout history
    const response = await fetch(
      `${PaymentConfigService.getApiBaseUrl()}/api/paystack-payout-history?userId=${userId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const responseData = await response.json();
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