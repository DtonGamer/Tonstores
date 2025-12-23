import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures user has a session (either authenticated or anonymous)
 * Call this on app initialization
 */
export const ensureUserSession = async () => {
  try {
    // Check if there's already a session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session exists, create an anonymous one
    if (!session) {
      console.log('No session found, signing in anonymously...');
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error signing in anonymously:', error);
        return { session: null, error };
      }
      
      console.log('Anonymous session created');
      return { session: data.session, error: null };
    }
    
    // Session already exists
    return { session, error: null };
  } catch (error) {
    console.error('Error ensuring user session:', error);
    return { session: null, error };
  }
};

/**
 * Checks if the current user is anonymous
 */
export const isAnonymousUser = (user: any): boolean => {
  // Anonymous users in Supabase have no identities or empty identities array
  return !user?.identities || user.identities.length === 0;
};

/**
 * Optional: Convert anonymous user to permanent account
 * Only needed if you want to allow users to "upgrade" their account
 */
export const convertAnonymousToUser = async (email: string, password: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !isAnonymousUser(user)) {
      throw new Error('No anonymous user to convert');
    }
    
    // Update the anonymous user with email/password
    const { data, error } = await supabase.auth.updateUser({
      email,
      password
    });
    
    if (error) {
      console.error('Error converting anonymous user:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error converting anonymous user:', error);
    return { data: null, error };
  }
};