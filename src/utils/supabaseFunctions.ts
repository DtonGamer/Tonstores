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
  const { data: { session } } = await supabase.auth.getSession();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // DEBUG: Log environment variables
  console.log('DEBUG - Environment check:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    anonKeyLength: supabaseAnonKey?.length,
    // Don't log the actual key for security
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    ...options.headers
  };

  // Add authorization header if we have a session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Only add guest ID header if user is not authenticated
  if (session?.access_token) {
    // User is authenticated, don't add guest ID header
  } else {
    // User is not authenticated, add guest ID header if available
    if (typeof window !== 'undefined') {
      const guestId = localStorage.getItem('Tonstores-guest-id');
      if (guestId) {
        headers['X-Guest-ID'] = guestId;
      }
    }
  }

  // DEBUG: Log headers (without sensitive data)
  console.log('DEBUG - Request headers:', {
    hasApiKey: !!headers['apikey'],
    hasAuth: !!headers['Authorization'],
    hasGuestId: !!headers['X-Guest-ID'],
    authHeaderPresent: headers['Authorization'] ? 'YES' : 'NO',
    apikeyHeaderPresent: headers['apikey'] ? 'YES' : 'NO'
  });

  headers['Cache-Control'] = 'no-cache';
  headers['Pragma'] = 'no-cache';

  try {
    const response = await fetch(functionUrl, {
      method: options.method || 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error calling function ${functionName}:`, errorText);
      throw new Error(`Function call failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling Supabase function ${functionName}:`, error);
    throw error;
  }
};

