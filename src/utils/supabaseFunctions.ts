import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to call Supabase Edge Functions with proper authentication
 * Note: For this to work properly, Supabase functions should be deployed with --no-verify-jwt
 * for public endpoints or the frontend needs to handle authentication properly
 */
export const callSupabaseFunction = async (
  functionName: string,
  data: any = {},
  options: { method?: string; headers?: Record<string, string> } = {}
): Promise<any> => {
  // Get the current session to include the authorization token if needed
  const { data: { session } } = await supabase.auth.getSession();

  // Construct the URL for the Supabase function
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add authorization header if we have a session (for protected functions)
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Add the anon key which is required for many Supabase operations
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  // Add guest ID header if available (for tracking and session management)
  if (typeof window !== 'undefined') {
    const guestId = localStorage.getItem('tonstores-guest-id');
    if (guestId) {
      headers['X-Guest-ID'] = guestId;
    }
  }

  // Only add cache control headers if not already present, and avoid headers that cause CORS issues
  if (!headers['Cache-Control']) {
    headers['Cache-Control'] = 'no-cache';
  }
  if (!headers['Pragma']) {
    headers['Pragma'] = 'no-cache';
  }

  try {
    const response = await fetch(functionUrl, {
      method: options.method || 'POST',
      headers,
      body: JSON.stringify(data)
    });

    // For Supabase Functions, 401 errors might occur if JWT verification is enabled
    // but the function requires authentication differently
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error calling function ${functionName}:`, errorText);
      console.error(`Status: ${response.status}, Status Text: ${response.statusText}`);

      // Try to parse as JSON first, fallback to text
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || errorJson.message || `Function call failed: ${errorText}`);
      } catch (e) {
        throw new Error(`Function call failed: ${errorText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling Supabase function ${functionName}:`, error);
    throw error;
  }
};

// Specific function calls for convenience
export const callMonnifyBanks = async (options: { dev_mode?: boolean } = {}) => {
  return callSupabaseFunction('monnify-banks', { dev_mode: options.dev_mode });
};

export const callMonnifyVerifyAccount = async (data: { 
  account_number: string; 
  bank_code: string; 
  dev_mode?: boolean 
}) => {
  return callSupabaseFunction('monnify-verify-account', data);
};

export const callMonnifySubaccount = async (data: any) => {
  return callSupabaseFunction('monnify-subaccount', data);
};

export const callMonnifyCustomerVerification = async (data: any) => {
  return callSupabaseFunction('monnify-customer-verification', data);
};

export const callMonnifyInitializeTransaction = async (data: any) => {
  return callSupabaseFunction('monnify-initialize-transaction', data);
};

export const callTrackEvent = async (data: any) => {
  return callSupabaseFunction('track-event', data);
};