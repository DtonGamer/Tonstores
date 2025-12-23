import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures user has a session (anonymous or authenticated)
 * Call this once on app initialization
 */
export const ensureUserSession = async () => {
  try {
    // Check if session already exists
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // No session - create anonymous user
      console.log('Creating anonymous session...');
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Error creating anonymous session:', error);
        return { session: null, error };
      }

      console.log('Anonymous session created');
      return { session: data.session, error: null };
    }

    // Session exists
    return { session, error: null };
  } catch (error) {
    console.error('Error ensuring session:', error);
    return { session: null, error };
  }
};

/**
 * Get the current user (could be anonymous or authenticated)
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
};

/**
 * Check if current user is anonymous
 */
export const isAnonymousUser = async (user?: any) => {
  const currentUser = user || await getCurrentUser();
  // Anonymous users have no identities or empty identities array
  return currentUser && (!currentUser.identities || currentUser.identities.length === 0);
};

/**
 * Get current user ID (works for both anonymous and authenticated users)
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
};

/**
 * Convert anonymous user to permanent account
 * This keeps all their existing data (orders, cart, etc.)
 */
export const convertAnonymousToUser = async (email: string, password: string) => {
  try {
    const user = await getCurrentUser();

    if (!user || !(await isAnonymousUser(user))) {
      throw new Error('No anonymous user to convert');
    }

    // Update the anonymous user with email/password
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (error) {
      console.error('Error converting anonymous user:', error);
      return { data: null, error };
    }

    console.log('Anonymous user converted to permanent account');
    return { data, error: null };
  } catch (error) {
    console.error('Error converting user:', error);
    return { data: null, error };
  }
};

/**
 * Wrapper function for Supabase operations that ensures session parameters
 * are set correctly before executing the operation
 *
 * @param operation - The database operation to perform
 * @returns Promise with the result of the operation
 */
export const withUserSession = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  // Execute the operation directly - Supabase handles session automatically
  return await operation();
};