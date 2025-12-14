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

// Define types for Monnify subaccount creation
export interface MonnifySubaccountParams {
  accountName: string;
  accountNumber: string;
  accountType: 'PERSONAL' | 'BUSINESS';
  currencyCode: string;
  bankCode: string;
  email: string;
  bvn?: string;
}

export interface PayoutParams {
  amount: number;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  reference: string;
  narration?: string;
}

export interface MonnifyLedgerEntry {
  id: string;
  subaccountCode: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface MonnifyLedgerHistoryResponse {
  entries: MonnifyLedgerEntry[];
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
 * Get the Monnify API key to use
 * Uses environment variable only
 */
export const getMonnifyApiKey = async (userId?: string): Promise<string> => {
  return PaymentConfigService.getMonnifyApiKey(userId);
};

/**
 * Get the Monnify secret key for server-side operations
 * Uses environment variable only
 */
export const getMonnifySecretKey = async (): Promise<string> => {
  return PaymentConfigService.getMonnifySecretKey();
};

/**
 * Create a Monnify subaccount with the user's bank details
 */
export const createMonnifySubaccount = async (params: MonnifySubaccountParams): Promise<string> => {
  const { accountName, accountNumber, accountType, currencyCode, bankCode, email, bvn } = params;

  // Get user information for the request
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get business name and email from profile
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
    accountName: accountName,
    accountNumber: accountNumber,
    accountType: accountType || 'BUSINESS',
    currencyCode: currencyCode || 'NGN',
    bankCode: bankCode,
    email: email || profileData?.email || user.email,
    ...(bvn && { bvn }),
    additionalInformation: `Subaccount for ${profileData?.business_name || "Tonstores"}`,
    percentageCharge: 1.5, // 1.5% fee for Monnify
  };

  // Call the Supabase edge function for Monnify subaccount creation
  const functionUrl = `${PaymentConfigService.getApiBaseUrl()}/api/monnify-subaccount`;
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({
      userId: user.id,
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
      accountType: payload.accountType,
      currencyCode: payload.currencyCode,
      bankCode: payload.bankCode,
      email: payload.email,
      percentageCharge: payload.percentageCharge,
      additionalInformation: payload.additionalInformation,
      ...(bvn && { bvn })
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
 * Process a payout to a seller's bank account using Monnify
 */
export const processMonnifySellerPayout = async (params: PayoutParams): Promise<boolean> => {
  try {
    const { amount, accountNumber, bankCode, accountName, reference, narration } = params;

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Call the API endpoint to process the payout
    const response = await fetch(`${PaymentConfigService.getApiBaseUrl()}/api/monnify-process-payout`, {
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
 * Get the payout balance for a seller using Monnify
 */
export const getMonnifySellerBalance = async (userId: string): Promise<number> => {
  try {
    // Check if we're in development mode
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // For local development, return a mock balance to avoid CORS issues
    if (isLocalDevelopment) {
      // Return a random balance between 0 and 100,000 (in kobo)
      return Math.floor(Math.random() * 10000000);
    }

    // Call the API endpoint to get the seller's balance
    const response = await fetch(`${PaymentConfigService.getApiBaseUrl()}/api/monnify-seller-balance?userId=${userId}`, {
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
 * Get the seller's ledger history from Monnify
 */
export const getMonnifySellerLedgerHistory = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MonnifyLedgerHistoryResponse> => {
  try {
    // Check if we're in development mode
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // For local development, return mock data to avoid CORS issues
    if (isLocalDevelopment) {
      // Generate some mock ledger entries
      const mockEntries: MonnifyLedgerEntry[] = Array.from({ length: 10 }, (_, i) => ({
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
      `${PaymentConfigService.getApiBaseUrl()}/api/monnify-ledger-history?userId=${userId}&limit=${limit}&offset=${offset}`,
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
 * Create a Monnify payment configuration for subscription
 */
export const createMonnifyConfig = async ({
  plan,
  user,
  billingCycle,
  onSuccess,
  onClose,
}: PaymentConfig) => {
  // Retrieve Monnify public key
  const publicKey = await PaymentConfigService.getMonnifyApiKey();

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, business_name")
    .eq("id", user.id)
    .single();

  // Calculate amount based on billing cycle
  const amount = billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;

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
    reference: `monnify_sub_${user.id}_${Date.now().toString()}`,
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
 * Get the seller's payout history using Monnify
 */
export const getMonnifySellerPayoutHistory = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<MonnifyPayoutHistoryResponse> => {
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
      `${PaymentConfigService.getApiBaseUrl()}/api/monnify-payout-history?userId=${userId}&limit=${limit}&offset=${offset}`,
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

export interface MonnifyPayoutHistoryResponse {
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