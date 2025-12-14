import { Role } from '@/hooks/useProfile';

export interface ProfileBase {
  id: string;
  business_name: string;
  avatar_url?: string;
  business_logo_url?: string;
  website?: string;
  contact_email?: string;
  phone_number?: string;
  role?: 'user' | 'admin';
  monnify_api_key?: string;
  monnify_secret_key?: string;
  monnify_subaccount_code?: string;
  monnify_subaccount_id?: string;
  email_support?: string;
  whatsapp_support?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  tiktok_handle?: string;
  business_address?: string;
  business_description?: string;
  kyc_verified?: boolean;
  kyc_verified_at?: string;
  is_affiliate?: boolean;
  affiliate_status?: 'active' | 'pending' | 'inactive';
  affiliate_commission_rate?: number;
  affiliate_total_earnings?: number;
  affiliate_total_referrals?: number;
  referral_code?: string;
  created_at: string;
  updated_at: string;
}

declare module '@/hooks/useProfile' {
  interface ProfileBase {
    kyc_verified?: boolean;
    kyc_verified_at?: string;
  }
} 