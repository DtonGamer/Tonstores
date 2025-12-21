import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to call Supabase Edge Functions with proper authentication
 * Supports both GET and POST methods with proper query parameter handling
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

  const method = options.method || 'POST';
  
  // Build URL with query parameters for GET requests
  let functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
  
  if (method === 'GET' && data && Object.keys(data).length > 0) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      functionUrl += `?${queryString}`;
    }
  }

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
  if (!session?.access_token) {
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
    method,
    hasApiKey: !!headers['apikey'],
    hasAuth: !!headers['Authorization'],
    hasGuestId: !!headers['X-Guest-ID'],
    authHeaderPresent: headers['Authorization'] ? 'YES' : 'NO',
    apikeyHeaderPresent: headers['apikey'] ? 'YES' : 'NO',
    url: functionUrl
  });

  headers['Cache-Control'] = 'no-cache';
  headers['Pragma'] = 'no-cache';

  try {
    const fetchOptions: RequestInit = {
      method,
      headers
    };

    // Only add body for POST, PUT, PATCH methods
    if (method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(functionUrl, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error calling function ${functionName}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Function call failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // DEBUG: Log successful response
    console.log(`DEBUG - Function ${functionName} response:`, {
      status: response.status,
      hasData: !!result.data,
      dataLength: Array.isArray(result.data) ? result.data.length : 'N/A'
    });

    return result;
  } catch (error) {
    console.error(`Error calling Supabase function ${functionName}:`, error);
    throw error;
  }
};
