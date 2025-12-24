import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define user types
export type UserType = 'buyer' | 'seller';

// Define user role
export type UserRole = 'user' | 'admin';

// User profile interface with type
export interface UserProfile {
  id: string;
  email: string;
  business_name: string;
  role: UserRole;
  user_type: UserType;
  created_at: string;
  updated_at: string;
  paystack_public_key?: string;
  paystack_secret_key?: string;
  paystack_subaccount_id?: string;
  paystack_subaccount_code?: string;
  email_support?: string;
  whatsapp_support?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  facebook_handle?: string;
}

/**
 * Hook to get the current user's profile and type
 */
export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          throw error;
        }

        setUserProfile(data as UserProfile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    // Set up real-time subscription to profile changes
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(res => res.data.user?.id)}`,
        },
        (payload) => {
          setUserProfile(payload.new as UserProfile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isBuyer = userProfile?.user_type === 'buyer';
  const isSeller = userProfile?.user_type === 'seller';
  const isAdmin = userProfile?.role === 'admin';

  return {
    userProfile,
    isBuyer,
    isSeller,
    isAdmin,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          throw error;
        }

        setUserProfile(data as UserProfile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    },
  };
};

/**
 * Custom hook to check if the current user is a buyer
 */
export const useIsBuyer = (): { isBuyer: boolean; isLoading: boolean } => {
  const { isBuyer, isLoading } = useUserProfile();
  return { isBuyer, isLoading };
};

/**
 * Custom hook to check if the current user is a seller
 */
export const useIsSeller = (): { isSeller: boolean; isLoading: boolean } => {
  const { isSeller, isLoading } = useUserProfile();
  return { isSeller, isLoading };
};

/**
 * Custom hook to check if the current user is an admin
 */
export const useIsAdmin = (): { isAdmin: boolean; isLoading: boolean } => {
  const { isAdmin, isLoading } = useUserProfile();
  return { isAdmin, isLoading };
};

/**
 * Function to get the current user type
 */
export const getCurrentUserType = async (): Promise<UserType | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    if (error) {
      throw error;
    }

    return data.user_type as UserType;
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
};

/**
 * Function to update the current user's type
 * Only admins can update user types
 */
export const updateUserType = async (userId: string, userType: UserType): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Check if current user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (profileData.role !== 'admin') {
      throw new Error('Only admins can update user types');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ user_type: userType })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating user type:', error);
    return false;
  }
};