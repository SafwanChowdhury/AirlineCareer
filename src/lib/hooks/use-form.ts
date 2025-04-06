// src/lib/hooks/use-form.ts
import { useState, useCallback } from 'react';

export type FieldValidator<T> = (value: any, formData: T) => string | null;

export type FormValidators<T> = {
  [K in keyof T]?: FieldValidator<T>;
};

export interface FormOptions<T> {
  initialValues: T;
  validators?: FormValidators<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  resetOnSubmit?: boolean;
}

export interface FormResult<T> {
  // Form values and state
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Event handlers
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  
  // Form actions
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
}

/**
 * Hook for managing form state with validation
 * Provides a standardized interface similar to Formik but lighter weight
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validators = {},
  onSubmit,
  resetOnSubmit = false
}: FormOptions<T>): FormResult<T> {
  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);
  
  // Validate a single field
  const validateField = useCallback((field: keyof T): string | null => {
    const validator = validators[field];
    if (!validator) return null;
    
    const errorMessage = validator(values[field], values);
    return errorMessage;
  }, [validators, values]);
  
  // Update a field's value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => {
      // Handle special case for string fields
      if (typeof prev[field] === 'string' && typeof value === 'object' && value?.target?.value) {
        return { ...prev, [field]: value.target.value };
      }
      return { ...prev, [field]: value };
    });
    setIsDirty(true);
    
    // Validate the field if it's been touched
    if (touched[field]) {
      const errorMessage = validateField(field);
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  }, [touched, validateField]);
  
  // Handle field change from input
  const handleChange = useCallback((field: keyof T, value: any) => {
    setFieldValue(field, value);
  }, [setFieldValue]);
  
  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field
    const errorMessage = validateField(field);
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
  }, [validateField]);
  
  // Set error manually for a field
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  // Set multiple values at once
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);
  
  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    // Check each field with a validator
    Object.keys(validators).forEach(key => {
      const field = key as keyof T;
      const errorMessage = validateField(field);
      
      if (errorMessage) {
        newErrors[field] = errorMessage;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validateField, validators]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
      // Mark all fields as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach(key => {
        const field = key as keyof T;
        allTouched[field] = true;
      });
      setTouched(allTouched);
      return;
    }
    
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        if (resetOnSubmit) {
          resetForm();
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [onSubmit, resetForm, resetOnSubmit, validateForm, values]);
  
  // Check if the form is valid
  const isValid = Object.keys(errors).length === 0;
  
  return {
    // Form values and state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Event handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Form actions
    setFieldValue,
    setFieldError,
    setValues: setFormValues,
    resetForm,
    validateField,
    validateForm
  };
}