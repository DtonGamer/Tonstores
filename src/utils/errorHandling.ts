import { debugLog } from "./debug";

/**
 * Type definition for error handler options
 */
type ErrorHandlerOptions = {
  fallbackValue?: any;
  showNotification?: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
  logError?: boolean;
  context?: string; // Additional context about where the error occurred
};

/**
 * A utility function for handling errors consistently
 *
 * @param error The error object that was caught
 * @param options Configuration options for error handling
 * @returns The fallback value specified in options, or undefined
 */
export const handleError = (error: any, options: ErrorHandlerOptions = {}): any => {
  const {
    fallbackValue,
    showNotification = false,
    notificationTitle = "Error",
    notificationMessage = error?.message || "An unexpected error occurred",
    logError = true,
    context = ""
  } = options;

  if (logError) {
    debugLog(`Error in ${context || 'unknown context'}:`, error);
    console.error(`Error in ${context || 'unknown context'}:`, error);
  }

  if (showNotification) {
    // Import toast here or expect it to be passed in
    // Since we can't import it here (would create circular dependencies),
    // we'll just log it, and components would implement their own notification
    debugLog("Notification:", notificationTitle, notificationMessage);
  }

  return fallbackValue;
};

/**
 * A utility for wrapping async operations with consistent error handling
 *
 * @param operation A function that returns a Promise
 * @param options Configuration options for error handling
 * @returns The result of the operation or fallback value if error occurred
 */
export const withErrorHandling = async <T,>(
  operation: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    return handleError(error, options);
  }
};

/**
 * A utility for handling API calls with consistent error handling
 *
 * @param apiCall A function that returns a Promise with API call
 * @param options Configuration options for error handling
 * @returns The result of the API call or fallback value if error occurred
 */
export const handleApiCall = async <T,>(
  apiCall: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | undefined> => {
  try {
    return await apiCall();
  } catch (error: any) {
    // Add more specific handling for API errors
    const errorMessage = error?.message || "API call failed";

    return handleError(error, {
      ...options,
      notificationMessage: options.notificationMessage || errorMessage,
      context: options.context || "API Call"
    });
  }
};

/**
 * A utility function that wraps a Promise and handles errors by logging them
 * This replaces the common .catch(console.error) pattern
 *
 * @param promise The promise to handle
 * @param fallback Optional fallback value or function to call on error
 * @returns A promise with standardized error handling
 */
export const safePromise = <T>(
  promise: Promise<T>,
  fallback?: T | (() => T),
  context?: string
): Promise<T | undefined> => {
  return promise.catch((error) => {
    debugLog(`Error in ${context || 'safePromise'}:`, error);
    console.error(error);

    if (!fallback) return undefined;
    
    return typeof fallback === 'function' 
      ? (fallback as () => T)() 
      : fallback;
  });
};

/**
 * A utility function that safely executes tracking operations without affecting main functionality
 * This is specifically used to wrap trackEvent and similar calls
 *
 * @param trackingPromise The tracking operation promise to execute
 * @param fallback Optional fallback value or function to call on error
 * @returns A promise with standardized error handling
 */
export const safeTrack = <T>(
  trackingPromise: Promise<T>,
  fallback?: T | (() => T)
): Promise<T | undefined> => {
  return trackingPromise.catch((error) => {
    debugLog('Error in safeTrack:', error);
    console.error(error);

    if (!fallback) return undefined;
    
    return typeof fallback === 'function' 
      ? (fallback as () => T)() 
      : fallback;
  });
};

/**
 * A utility to create a timeout for promises
 *
 * @param promise The promise to add timeout to
 * @param timeoutMs The timeout in milliseconds
 * @param errorMessage Custom error message
 * @returns Promise that will timeout after specified time
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ) as Promise<T>
  ]);
};