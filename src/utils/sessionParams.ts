import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Gets the guest user ID from local storage or generates a new one if not found
 * @returns The guest user ID (either existing or newly generated)
 */
export const getGuestUserId = (): string => {
  if (typeof window === 'undefined') return generateUUID();

  const storageKey = 'tonstores-guest-id';
  let guestId = localStorage.getItem(storageKey);

  if (!guestId) {
    guestId = generateUUID();
    localStorage.setItem(storageKey, guestId);
  }

  return guestId;
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Sets up a global fetch interceptor to add the X-Guest-ID header to all requests
 * This should be called once during app initialization
 */
export const setupGuestIdInterceptor = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    // Check if user is authenticated first
    const supabase = (await import('@/integrations/supabase/client')).supabase;
    const { data: { session } } = await supabase.auth.getSession();

    // If user is authenticated, don't add guest ID header
    if (session?.user) {
      return originalFetch(input, init);
    }

    // Get the current guest ID from sessionStorage, fallback to localStorage
    let guestId = sessionStorage.getItem('current-guest-id');

    // Fall back to localStorage if not found in sessionStorage
    if (!guestId) {
      guestId = localStorage.getItem('tonstores-guest-id') ?? undefined;
      // Keep sessionStorage in sync for the current tab
      if (guestId) {
        sessionStorage.setItem('current-guest-id', guestId);
      }
    }

    if (guestId) {
      // Create a new init object with the X-Guest-ID header
      const newInit = { ...init };
      if (!newInit.headers) {
        newInit.headers = {};
      }

      // Convert Headers object to plain object if needed
      if (newInit.headers instanceof Headers) {
        const headers = {};
        newInit.headers.forEach((value, key) => {
          headers[key] = value;
        });
        newInit.headers = headers;
      }

      // Add our header
      newInit.headers['X-Guest-ID'] = guestId;

      // Call the original fetch with our modified init
      return originalFetch(input, newInit);
    }

    // If no guest ID, just use the original fetch
    return originalFetch(input, init);
  };
};

/**
 * Sets the guest ID as a custom header for Supabase requests
 * This approach is more reliable than using session parameters
 *
 * @param guestId - The guest ID to set
 * @returns Promise that resolves to true if successful
 */
export const setGuestSessionParam = async (guestId: string): Promise<boolean> => {
  try {
    if (!guestId) {
      console.error("Cannot set guest session param: guestId is empty");
      return false;
    }

    console.log("Setting guest session with ID:", guestId);

    // Set auth header for functions
    supabase.functions.setAuth(guestId);

    // Store the guest ID in sessionStorage for fetch interceptor to access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current-guest-id', guestId);
    }

    // Call RPC with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const { error } = await supabase.rpc('set_app_guest_id', { guest_id: guestId });
        if (!error) {
          console.log("Successfully set guest ID via RPC");
          return true;
        }
        console.warn(`RPC failed (${retries} retries left)`, error);
      } catch (rpcError) {
        console.warn(`RPC failed (${retries} retries left)`, rpcError);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      retries--;
    }

    return false;
  } catch (err) {
    console.error("Error setting guest session header:", err);
    return false;
  }
};

/**
 * Sets all necessary session parameters based on current auth state
 * @returns Promise that resolves to true if successful
 */
export const ensureSessionParams = async (): Promise<boolean> => {
  try {
    // Use the centralized auth initialization helper
    const { initializeAuth } = await import('@/utils/supabaseHelpers');
    const result = await initializeAuth();

    // The auth manager now returns the same format as original Supabase API:
    // { data: { session }, error }
    if (result?.data?.session?.user) return true;

    const guestId = getGuestUserId();
    return await setGuestSessionParam(guestId);
  } catch (err) {
    console.error("Error ensuring session params:", err);
    return false;
  }
};

/**
 * Wrapper function for Supabase operations that ensures session parameters
 * are set correctly before executing the operation
 *
 * @param operation - The database operation to perform
 * @returns Promise with the result of the operation
 */
export const withSessionParams = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  // Ensure session parameters are set before operation
  await ensureSessionParams();

  // Execute the operation
  return await operation();
};