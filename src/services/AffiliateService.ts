import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface Affiliate {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  total_spent: number;
  commission_earned: number;
  commission_rate: number;
}

export interface AffiliateStats {
  totalReferrals: number;
  totalEarnings: number;
  commissionRate: number;
  activeReferrals: number;
}

export class AffiliateService {
  static async getAffiliateStatus(userId: string): Promise<boolean> {
    try {
      // Check the user's profile for affiliate status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_affiliate')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error checking profile for affiliate status:', profileError);
        return false;
      }

      return !!profileData?.is_affiliate;
    } catch (error) {
      console.error('Error checking affiliate status:', error);
      return false;
    }
  }

  static async applyForAffiliate(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user is already an affiliate
      const isAffiliate = await this.getAffiliateStatus(userId);
      if (isAffiliate) {
        return { success: false, error: 'User is already an affiliate' };
      }

      // Generate a readable referral code based on the user's business name
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('business_name, id')
        .eq('id', userId)
        .single();

      if (profileFetchError) throw profileFetchError;

      const baseCode = profileData.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters
        .substring(0, 10); // Take first 10 characters

      // Add a random suffix to ensure uniqueness if needed
      const referralCode = `${baseCode}_${Math.floor(1000 + Math.random() * 9000)}`;

      // Update the user's profile to indicate they are applying to be an affiliate
      // and set their referral code
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_affiliate: true,
          affiliate_status: 'pending',
          referral_code: referralCode
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { success: true };
    } catch (error: any) {
      console.error('Error applying for affiliate:', error);
      return { success: false, error: error.message };
    }
  }

  static async getReferrals(userId: string): Promise<Affiliate[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_with_profile_view')
        .select(`
          id,
          referrer_id,
          referred_user_id,
          status,
          joined_at,
          total_spent,
          commission_earned,
          commission_rate,
          referred_user_business_name,
          referred_user_created_at
        `)
        .eq('referrer_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Map the view results to the Affiliate interface
      const mappedData = data?.map(item => ({
        ...item,
        referred_user: {
          business_name: item.referred_user_business_name,
          created_at: item.referred_user_created_at
        }
      })) || [];

      return mappedData;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  }

  static async getAffiliateStats(userId: string): Promise<AffiliateStats> {
    try {
      const referrals = await this.getReferrals(userId);

      const totalReferrals = referrals.length;
      const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0);
      const activeReferrals = referrals.filter(ref => ref.status === 'active').length;

      return {
        totalReferrals,
        totalEarnings,
        commissionRate: 20,
        activeReferrals
      };
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      return {
        totalReferrals: 0,
        totalEarnings: 0,
        commissionRate: 20,
        activeReferrals: 0
      };
    }
  }

  static async processReferral(referrerId: string, referredUserId: string): Promise<void> {
    try {
      // Check if this referral already exists
      const { data: existingReferral, error: existingError } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referred_user_id', referredUserId)
        .single();

      if (existingReferral && !existingError) {
        // Referral already exists, don't create duplicate
        console.log('Referral already exists for user:', referredUserId);
        return;
      }

      // Create the affiliate record
      const { error } = await supabase
        .from('affiliates')
        .insert({
          referrer_id: referrerId,
          referred_user_id: referredUserId,
          status: 'active',
          commission_rate: 20,
          joined_at: new Date().toISOString(),
          referral_type: 'referral' // Explicitly set referral type
        });

      if (error) throw error;

      console.log('Successfully created referral for user:', referredUserId, 'from referrer:', referrerId);
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  }

  // Function to process referral from URL parameters or manual code when a user signs up
  static async processReferralFromUrl(referredUserId: string, manualReferralCode: string = ''): Promise<void> {
    try {
      // Check URL for referral code first, then fall back to manual code
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get('ref');
      const referrerId = urlRef || manualReferralCode;

      if (!referrerId) {
        return; // No referral source
      }

      // First, try to match by user ID (for URL referrals)
      let referrerIdResult = null;

      // Validate that referrerId might be a user ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(referrerId)) {
        // It looks like a user ID, try to find the user directly
        const { data: referrerData, error: referrerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', referrerId)
          .single();

        if (!referrerError && referrerData) {
          referrerIdResult = referrerData.id;
        }
      }

      // If not found by ID, try to match by referral code (for both URL and manual codes)
      if (!referrerIdResult) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referrerId)
          .single();

        if (!referrerError && referrerData) {
          referrerIdResult = referrerData.id;
        }
      }

      // If still no referrer found, try to match by business name (for manual referral codes)
      if (!referrerIdResult) {
        // First try exact match on business name
        const { data: referrerData, error: referrerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('business_name', referrerId)
          .limit(1)
          .single();

        if (!referrerError && referrerData) {
          referrerIdResult = referrerData.id;
        }
      }

      // If still no referrer found, try case-insensitive partial match
      if (!referrerIdResult) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('profiles')
          .select('id, business_name')
          .ilike('business_name', `%${referrerId}%`) // Case-insensitive partial match
          .limit(1);

        if (!referrerError && referrerData && referrerData.length > 0) {
          // Verify it's an exact match despite case differences
          const exactMatch = referrerData.find(profile =>
            profile.business_name.toLowerCase() === referrerId.toLowerCase()
          );
          if (exactMatch) {
            referrerIdResult = exactMatch.id;
          }
        }
      }

      if (referrerIdResult) {
        // Make sure we're not trying to create a self-referral
        if (referrerIdResult === referredUserId) {
          console.warn('Cannot create self-referral for user:', referredUserId);
          return;
        }

        // Process the referral
        await this.processReferral(referrerIdResult, referredUserId);
      } else {
        console.error('No matching referrer found for code:', referrerId);
      }
    } catch (error) {
      console.error('Error processing referral from URL or manual code:', error);
    }
  }

  static async approveAffiliate(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update the user's profile to indicate they are an approved affiliate
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_affiliate: true,
          affiliate_status: 'active'
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { success: true };
    } catch (error: any) {
      console.error('Error approving affiliate:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAffiliateLink(userId: string): Promise<string> {
    // First try to get the referral code from the profile
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (error || !profileData?.referral_code) {
      // Fallback to user ID if no referral code exists
      return `${window.location.origin}/register?ref=${userId}`;
    }

    return `${window.location.origin}/register?ref=${profileData.referral_code}`;
  }
}