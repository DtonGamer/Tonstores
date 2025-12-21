import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PricingPlan } from '@/hooks/usePricingPlans';
import { User } from '@supabase/supabase-js';

// Define function parameter and return types
interface CreatePaystackConfigProps {
  plan: PricingPlan;
  user: User;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

interface PaystackConfig {
  amount: number; // Amount in kobo
  customerEmail: string;
  customerName: string;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: {
    user_id: string;
    plan_id: string;
    billing_cycle: string;
    email: string;
  };
  publicKey: string; // Paystack public key
  onSuccess: (transaction: any) => void;
  onClose: () => void;
}

export const createPaystackConfig = async ({
  plan,
  user,
  billingCycle,
  onSuccess,
  onClose
}: CreatePaystackConfigProps): Promise<PaystackConfig> => {
  try {
    // Get user profile to get business name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Could not retrieve user profile');
    }

    // Calculate amount based on billing cycle (Paystack uses kobo)
    const planAmount = billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
    const amountInKobo = planAmount * 100; // Convert to kobo

    // Get Paystack public key
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('Paystack public key not configured');
    }

    // Create a reference for the transaction
    const reference = `PAYSTACK_SUB_${user.id.substring(0, 8)}_${Date.now()}`;

    // Build the Paystack config
    const config: PaystackConfig = {
      amount: amountInKobo, // Paystack expects amount in kobo
      customerEmail: user.email || '',
      customerName: profile.business_name || user.email || 'Customer',
      currency: 'NGN',
      reference: reference,
      callbackUrl: `${window.location.origin}/api/paystack-webhook`, // Browser will be redirected here after payment
      publicKey,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        billing_cycle: billingCycle,
        email: user.email || ''
      },
      onSuccess: (transaction: any) => {
        // Call the provided success handler
        onSuccess(transaction.reference);
      },
      onClose: () => {
        // Call the provided close handler
        onClose();
      }
    };

    return config;
  } catch (error: any) {
    console.error('Error creating Paystack config:', error);
    toast.error(error.message || 'Failed to create payment configuration');
    throw error;
  }
};