/**
 * A utility function for handling standard form input changes
 * Updates form state and clears related errors
 * 
 * @param e - The React change event
 * @param setFormData - Function to set form data state
 * @param setErrors - Function to set errors state (optional)
 */
export const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  const { name, value } = e.target;
  setFormData((prev: any) => ({ ...prev, [name]: value }));

  // Clear error when user starts typing
  if (setErrors && name) {
    setErrors((prev: Record<string, string>) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};