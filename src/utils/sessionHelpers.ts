import { supabase } from '@/integrations/supabase/client';

/**
 * Get the current user
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
 * Get current user ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
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