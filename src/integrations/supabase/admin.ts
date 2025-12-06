import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/lib/config';

// This client has admin privileges and should be used server-side only
// It should never be used in client-side code as it exposes the service role key
// which has full access to the database and bypasses all RLS policies
// The client will be null in client-side environments where we don't have the service role key

let supabaseAdminClient: any = null;

// Only initialize the admin client in server-side environments where we have the required environment variables
if (typeof window === 'undefined') {
  const SUPABASE_URL = supabaseConfig.url();
  const SUPABASE_SERVICE_ROLE_KEY = supabaseConfig.serviceKey();

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdminClient = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          storage: {
            // Use memory storage instead of localStorage to avoid conflicts
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          }
        }
      }
    );
  } else {
    console.warn('Supabase admin environment variables are missing. Admin client will not be initialized.');
  }
} else {
  // In client-side environments, provide a warning if someone tries to use this
  console.warn('Supabase admin client is not available on the client-side for security reasons.');
}

export const supabaseAdmin = supabaseAdminClient; 