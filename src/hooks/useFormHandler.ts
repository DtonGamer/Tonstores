import { useState, useCallback } from 'react';

type FormHandlerOptions<T> = {
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  validate?: (data: T) => { isValid: boolean; errors?: Record<string, string> };
};

export const useFormHandler = <T extends Record<string, any>>(options: FormHandlerOptions<T>) => {
  const [formData, setFormData] = useState<T>({} as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Run validation if provided
      if (options.validate) {
        const validation = options.validate(formData);
        if (!validation.isValid && validation.errors) {
          setErrors(validation.errors);
          options.onError?.(new Error('Validation failed'));
          return;
        }
      }
      
      await options.onSubmit(formData);
      options.onSuccess?.();
      
      // Clear form data after successful submission if needed
      // setFormData({} as T);
    } catch (error) {
      console.error('Form submission error:', error);
      options.onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, options]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors
  };
};