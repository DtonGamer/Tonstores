import { useCallback } from 'react';
import { withSessionParams, ensureSessionParams } from './sessionParams';

/**
 * Higher-order hook that wraps a function with session parameter handling
 * This eliminates the need to call withSessionParams in multiple places
 * 
 * @returns A function that wraps the provided callback with session parameter handling
 */
export const useWithSession = () => {
  /**
   * Wraps a function with session parameter handling
   * 
   * @param callback The function to wrap with session parameter handling
   * @returns The wrapped function
   */
  const withSession = useCallback(<T extends any[], R>(
    callback: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      // Ensure session parameters are set before proceeding
      await ensureSessionParams();
      
      // Execute the callback with session parameters
      return withSessionParams(async () => {
        return await callback(...args);
      });
    };
  }, []);

  return { withSession };
};

export default useWithSession; 