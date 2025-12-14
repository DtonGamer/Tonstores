import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";

// Global state to track if an auth listener already exists
let authSubscription: { unsubscribe: () => void } | null = null;
let isAuthListenerInitialized = false;

// Global callbacks to notify multiple subscribers
const authCallbacks: Array<(event: AuthChangeEvent, session: Session | null) => void> = [];

// Function to add a callback to the global auth event listeners
export const addAuthStateListener = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  authCallbacks.push(callback);
  
  // If this is the first listener, set up the global auth subscription
  if (!isAuthListenerInitialized) {
    initializeGlobalAuthListener();
  }
  
  // Return an unsubscribe function
  return () => {
    const index = authCallbacks.indexOf(callback);
    if (index > -1) {
      authCallbacks.splice(index, 1);
    }
    
    // If no more listeners, unsubscribe from the global subscription
    if (authCallbacks.length === 0 && authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
      isAuthListenerInitialized = false;
    }
  };
};

// Initialize the global auth listener if not already done
const initializeGlobalAuthListener = () => {
  if (!isAuthListenerInitialized) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // Notify all registered callbacks
        authCallbacks.forEach(callback => {
          callback(event, session);
        });
      }
    );
    
    authSubscription = subscription;
    isAuthListenerInitialized = true;
  }
};

// Function to get the current session
export const getCurrentSession = async () => {
  const result = await supabase.auth.getSession();

  if (result.error) {
    console.error("Error getting session:", result.error);
    // Return the same format as original Supabase getSession: { data: { session }, error }
    return { data: { session: null }, error: result.error };
  }

  // Return the same format as original Supabase getSession: { data: { session }, error }
  return { data: { session: result.data.session }, error: null };
};

// Function to refresh the current session
export const refreshCurrentSession = async () => {
  try {
    const result = await supabase.auth.refreshSession();

    if (result.error) {
      console.error("Error refreshing session:", result.error);
      // If refreshing fails due to oauth_client_id issue, return the current session instead of error
      // This prevents the app from breaking when there are auth configuration issues
      if (result.error.message.includes('oauth_client_id')) {
        console.warn("OAuth configuration issue detected. Session refresh failed due to auth schema configuration. Returning existing session.");

        // Get the current session without refreshing to maintain functionality
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        if (getSessionError) {
          console.error("Error getting current session:", getSessionError);
          return { data: { session: null }, error: result.error };
        }

        return { data: { session }, error: null };
      }

      // For other errors, return the original error
      // Return the same format as original Supabase refreshSession: { data: { session }, error }
      return { data: { session: null }, error: result.error };
    }

    // Return the same format as original Supabase refreshSession: { data: { session }, error }
    return { data: { session: result.data.session }, error: null };
  } catch (error) {
    console.error("Exception refreshing session:", error);
    // Return the same format as original Supabase refreshSession: { data: { session }, error }
    return { data: { session: null }, error };
  }
};

// Function to sign in with email and password
export const signInWithEmailAndPassword = async (email: string, password: string, captchaToken?: string | null) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      captchaToken: captchaToken || undefined
    }
  });
};

// Function to sign up with email and password
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  businessName: string,
  captchaToken?: string | null
) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: null, // Disable email verification
      data: { business_name: businessName },
      captchaToken: captchaToken || undefined
    }
  });
};

// Function to sign out the current user
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Function to get the current user
export const getCurrentUser = async (): Promise<{ user: User | null, error: any }> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error getting session:", error);
    return { user: null, error };
  }
  
  return { user: session?.user || null, error: null };
};