import { getCurrentSession } from '@/integrations/supabase/authManager';

// Singleton for auth state initialization
let authInitPromise: Promise<any> | null = null;

/**
 * Initializes auth state once and returns the same promise for subsequent calls
 * This prevents multiple calls to getSession() which creates multiple GoTrueClient instances
 */
export const initializeAuth = async () => {
  if (!authInitPromise) {
    authInitPromise = getCurrentSession();
  }
  return authInitPromise;
};

/**
 * Resets the auth initialization promise
 * This should only be used for testing or after signOut
 */
export const resetAuthInit = () => {
  authInitPromise = null;
}; 