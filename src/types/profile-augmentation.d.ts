import { ProfileBase } from "@/types/profile";
import { Role } from '@/hooks/useProfile';

declare module "@/types/profile" {
  interface ProfileBase {
    kyc_verified?: boolean;
    kyc_verified_at?: string;
    role: Role;
    paystack_subaccount_code?: string;
    paystack_account_number?: string;
    paystack_bvn?: string;
    paystack_kyc_status?: string;
    paystack_kyc_submitted_at?: string;
    paystack_percentage_charge?: number;
  }
}

// Augment the ProfileUpdate type from useProfile hook
declare module '@/hooks/useProfile' {
  interface ProfileUpdate {
    kyc_verified?: boolean;
    kyc_verified_at?: string;
    role?: Role;
    paystack_subaccount_code?: string;
    paystack_account_number?: string;
    paystack_bvn?: string;
    paystack_kyc_status?: string;
    paystack_kyc_submitted_at?: string;
    paystack_percentage_charge?: number;
  }
} 