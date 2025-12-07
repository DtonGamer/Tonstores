import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Global variable to store supabase client across hot module reloads
declare global {
  var __supabase_singleton: any;
}

let supabaseClient: any;

// Try to reuse an existing client in development to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  if (!globalThis.__supabase_singleton) {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    globalThis.__supabase_singleton = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'tonstores-auth-token',
          storage: {
            getItem: (key: string) => {
              try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
              } catch (error) {
                console.error('Error getting auth data from localStorage:', error);
                return null;
              }
            },
            setItem: (key: string, value: any) => {
              try {
                localStorage.setItem(key, JSON.stringify(value));
              } catch (error) {
                console.error('Error setting auth data in localStorage:', error);
              }
            },
            removeItem: (key: string) => {
              try {
                localStorage.removeItem(key);
              } catch (error) {
                console.error('Error removing auth data from localStorage:', error);
              }
            }
          }
        }
      }
    );
  }
  supabaseClient = globalThis.__supabase_singleton;
} else {
  // Production: create client normally
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,  // Changed to false to prevent automatic session refresh issues
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'tonstores-auth-token',
        storage: {
          getItem: (key: string) => {
            try {
              const value = localStorage.getItem(key);
              return value ? JSON.parse(value) : null;
            } catch (error) {
              console.error('Error getting auth data from localStorage:', error);
              return null;
            }
          },
          setItem: (key: string, value: any) => {
            try {
              localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
              console.error('Error setting auth data in localStorage:', error);
            }
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.error('Error removing auth data from localStorage:', error);
            }
          }
        }
      }
    }
  );
}

export const supabase = supabaseClient;