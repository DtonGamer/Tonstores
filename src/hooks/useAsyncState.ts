import { useState, useEffect } from 'react';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * A custom hook for handling async operations with loading and error states
 * 
 * @param asyncFn An async function to execute
 * @param deps Dependency array for re-execution (similar to useEffect)
 * @returns Object containing data, loading state, error state, and refetch function
 */
export const useAsyncState = <T>(
  asyncFn: () => Promise<T>,
  deps?: React.DependencyList
): AsyncState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const executeAsyncFn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
      console.error('Async operation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeAsyncFn();
  }, deps || []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    executeAsyncFn();
  }, [refetchTrigger]); // When refetchTrigger changes, re-execute

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { data, loading, error, refetch };
};