import { useState, useCallback } from 'react';

/**
 * A hook for handling simple form state changes with common patterns
 * 
 * @param initialState - The initial state of the form
 * @returns An object containing form state and handlers
 */
export const useSimpleForm = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  return {
    formData,
    handleChange,
    setFieldValue,
    setFormData,
    resetForm
  };
};