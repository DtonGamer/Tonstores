import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/lib/config';

declare global {
  var __supabase_admin_singleton: any;
}

let supabaseAdminClient: any;

// Try to reuse an existing admin client in development to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  if (!globalThis.__supabase_admin_singleton) {
    // Use the config helper to get environment variables in a cross-environment compatible way
    const SUPABASE_URL = supabaseConfig.url();
    const SUPABASE_SERVICE_ROLE_KEY = supabaseConfig.serviceKey();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase admin environment variables');
      throw new Error('Supabase configuration is missing');
    }

    globalThis.__supabase_admin_singleton = createClient<Database>(
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
  }
  supabaseAdminClient = globalThis.__supabase_admin_singleton;
} else {
  // Production: create client normally
  const SUPABASE_URL = supabaseConfig.url();
  const SUPABASE_SERVICE_ROLE_KEY = supabaseConfig.serviceKey();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase admin environment variables');
    throw new Error('Supabase configuration is missing');
  }

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
}

// This client has admin privileges and should be used server-side only
// or for specific admin operations that require elevated permissions
export const supabaseAdmin = supabaseAdminClient; 