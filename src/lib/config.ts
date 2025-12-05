/**
 * Shared configuration module for the application
 * This provides consistent access to environment variables across different parts of the app
 */

// Determine if we're running in a browser or server environment
const isBrowser = typeof window !== 'undefined';

/**
 * Function to safely get environment variables with proper typing
 * Works in both browser (Vite) and server (Node.js) environments
 */
function getEnv(key: string): string | undefined {
  if (isBrowser) {
    // In browser context (for client-side code using Vite)
    return import.meta.env[key];
  } else {
    // In Node.js context (for Netlify functions)
    return process.env[key];
  }
}

/**
 * Payment configuration
 */
export const paymentConfig = {
  // Monnify configuration
  monnify: {
    apiKey: () => {
      // In production, only use VITE_ prefixed variables
      if (environment.isProduction()) {
        return getEnv('VITE_MONNIFY_API_KEY');
      }
      // In development, fall back to non-prefixed variables if needed
      return getEnv('VITE_MONNIFY_API_KEY') || getEnv('MONNIFY_API_KEY');
    },
    secretKey: () => {
      // In production, only use VITE_ prefixed variables
      if (environment.isProduction()) {
        return getEnv('VITE_MONNIFY_SECRET_KEY');
      }
      // In development, fall back to non-prefixed variables if needed
      return getEnv('VITE_MONNIFY_SECRET_KEY') || getEnv('MONNIFY_SECRET_KEY');
    },
    contractCode: () => {
      // In production, only use VITE_ prefixed variables
      if (environment.isProduction()) {
        return getEnv('VITE_MONNIFY_CONTRACT_CODE');
      }
      // In development, fall back to non-prefixed variables if needed
      return getEnv('VITE_MONNIFY_CONTRACT_CODE') || getEnv('MONNIFY_CONTRACT_CODE');
    },
    percentageFee: 0.015, // 1.5% fee
  },
  // Base URL for API calls
  apiBaseUrl: () => {
    // Use environment variable if available
    const envUrl = getEnv('VITE_SITE_URL');
    if (envUrl) return envUrl;

    // Fallback to current window location in browser
    if (typeof window !== 'undefined') {
      const location = window.location;
      return `${location.protocol}//${location.host}`;
    }

    return '';
  },
};

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: () => getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || '',
  anonKey: () => getEnv('VITE_SUPABASE_ANON_KEY') || '',
  serviceKey: () => getEnv('VITE_SUPABASE_SERVICE_KEY') || getEnv('SUPABASE_SERVICE_KEY') || '',
};

/**
 * Environment information
 */
export const environment = {
  isDevelopment: () => {
    const env = getEnv('NODE_ENV') || getEnv('VITE_NODE_ENV');
    return env === 'development';
  },
  isProduction: () => {
    const env = getEnv('NODE_ENV') || getEnv('VITE_NODE_ENV');
    return env === 'production';
  }
}; 