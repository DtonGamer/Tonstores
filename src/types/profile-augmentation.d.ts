import { ProfileBase } from "@/types/profile";
import { Role } from '@/hooks/useProfile';

declare module "@/types/profile" {
  interface ProfileBase {
    kyc_verified?: boolean;
    kyc_verified_at?: string;
    role: Role;
    monnify_api_key?: string;
    monnify_secret_key?: string;
    monnify_subaccount_code?: string;
    monnify_subaccount_id?: string;
  }
}

// Augment the ProfileUpdate type from useProfile hook
declare module '@/hooks/useProfile' {
  interface ProfileUpdate {
    kyc_verified?: boolean;
    kyc_verified_at?: string;
    role?: Role;
    monnify_api_key?: string;
    monnify_secret_key?: string;
    monnify_subaccount_code?: string;
    monnify_subaccount_id?: string;
  }
} 