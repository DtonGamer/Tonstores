/**
 * Utility function for conditional logging in development mode
 */
export const debugLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};