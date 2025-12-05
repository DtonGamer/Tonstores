/**
 * Environment variables utility
 * 
 * This file provides a centralized way to access environment variables
 * with proper fallbacks for development and testing.
 */

// Cloudflare Turnstile
// Using the test key for development: https://developers.cloudflare.com/turnstile/reference/testing/
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

// Export other environment variables here 