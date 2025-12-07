import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PricingPlan } from '@/hooks/usePricingPlans';
import { User } from '@supabase/supabase-js';

// Define function parameter and return types
interface CreateMonnifyConfigProps {
  plan: PricingPlan;
  user: User;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

interface MonnifyConfig {
  amount: number;
  customerEmail: string;
  customerName: string;
  currency: string;
  reference: string;
  description: string;
  callbackUrl: string;
  metadata: {
    user_id: string;
    plan_id: string;
    billing_cycle: string;
    email: string;
  };
  onSuccess: (transaction: any) => void;
  onClose: () => void;
}

export const createMonnifyConfig = async ({
  plan,
  user,
  billingCycle,
  onSuccess,
  onClose
}: CreateMonnifyConfigProps): Promise<MonnifyConfig> => {
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

    // Calculate amount based on billing cycle
    const planAmount = billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;

    // Create a reference for the transaction
    const reference = `MONNIFY_SUB_${user.id.substring(0, 8)}_${Date.now()}`;

    // Build the Monnify config
    const config: MonnifyConfig = {
      amount: planAmount,
      customerEmail: user.email || '',
      customerName: profile.business_name || user.email || 'Customer',
      currency: 'NGN',
      reference: reference,
      description: `Subscription to ${plan.name} plan (${billingCycle})`,
      callbackUrl: `${window.location.origin}/api/monnify-webhook`,
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
    console.error('Error creating Monnify config:', error);
    toast.error(error.message || 'Failed to create payment configuration');
    throw error;
  }
};