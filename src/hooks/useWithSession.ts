import { useCallback } from 'react';
import { withUserSession } from '../utils/sessionHelpers';

/**
 * Higher-order hook that wraps a function
 * This is a simplified version that doesn't require session parameters
 *
 * @returns A function that wraps the provided callback
 */
export const useWithSession = () => {
  /**
   * Wraps a function
   *
   * @param callback The function to wrap
   * @returns The wrapped function
   */
  const withSession = useCallback(<T extends any[], R>(
    callback: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      // Execute the callback directly - Supabase handles session automatically
      return await callback(...args);
    };
  }, []);

  return { withSession };
};

export default useWithSession;