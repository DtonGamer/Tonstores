import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Hook to handle anonymous authentication for guest checkout
 * Uses Supabase's built-in anonymous sign-in feature
 */
export const useAnonymousAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Check if user is anonymous using the is_anonymous claim in JWT
          setIsAnonymous(session.user.is_anonymous || false);
        } else {
          // No session - sign in anonymously for guest checkout
          await signInAnonymously();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAnonymous(session.user.is_anonymous || false);
        } else {
          setUser(null);
          setIsAnonymous(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in anonymously for guest checkout
   */
  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error signing in anonymously:', error);
        return { user: null, error };
      }

      setUser(data.user);
      setIsAnonymous(true);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Exception signing in anonymously:', error);
      return { user: null, error };
    }
  };

  /**
   * Convert anonymous user to permanent user
   * @param email - User's email
   * @param password - User's password
   */
  const convertToPermananent = async (email: string, password: string) => {
    if (!user || !isAnonymous) {
      return { error: 'User is not anonymous or not signed in' };
    }

    try {
      // Update the anonymous user with email and password
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (error) {
        console.error('Error converting to permanent user:', error);
        return { error };
      }

      setIsAnonymous(false);
      return { data, error: null };
    } catch (error) {
      console.error('Exception converting to permanent user:', error);
      return { error };
    }
  };

  /**
   * Link anonymous user to existing account
   * @param email - Existing user's email
   * @param password - Existing user's password
   */
  const linkToExistingAccount = async (email: string, password: string) => {
    if (!user || !isAnonymous) {
      return { error: 'User is not anonymous or not signed in' };
    }

    const anonymousUserId = user.id;

    try {
      // Try to update the anonymous user with the email
      const { error: updateError } = await supabase.auth.updateUser({ email });

      if (updateError) {
        // Email belongs to existing user - sign in to that account
        const { data: signInData, error: signInError } = 
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          return { error: signInError };
        }

        if (signInData.user) {
          // Transfer orders from anonymous user to permanent user
          const { error: transferError } = await supabase
            .from('orders')
            .update({ user_id: signInData.user.id })
            .eq('user_id', anonymousUserId);

          if (transferError) {
            console.error('Error transferring orders:', transferError);
          }

          setUser(signInData.user);
          setIsAnonymous(false);
          
          return { data: signInData, error: null };
        }
      }

      return { error: updateError };
    } catch (error) {
      console.error('Exception linking to existing account:', error);
      return { error };
    }
  };

  return {
    user,
    isAnonymous,
    loading,
    signInAnonymously,
    convertToPermananent,
    linkToExistingAccount,
  };
};