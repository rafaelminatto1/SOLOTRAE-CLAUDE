import React, { createContext, useContext, useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface FormContextValue {
  formId: string;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  isSubmitting?: boolean;
  className?: string;
  noValidate?: boolean;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  errors = {},
  touched = {},
  isSubmitting = false,
  className,
  noValidate = true,
}) => {
  const formId = useId();

  const contextValue: FormContextValue = {
    formId,
    errors,
    touched,
    isSubmitting,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        onSubmit={onSubmit}
        noValidate={noValidate}
        className={cn('space-y-4', className)}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

export interface FormFieldProps {
  name: string;
  label?: string;
  children: React.ReactNode;
  required?: boolean;
  description?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  children,
  required = false,
  description,
  className,
}) => {
  const { errors, touched } = useFormContext();
  const fieldId = useId();
  const hasError = touched[name] && errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium text-gray-700',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {children}
      </div>

      {description && !hasError && (
        <p id={`${fieldId}-description`} className="text-sm text-gray-500">
          {description}
        </p>
      )}

      {hasError && (
        <div id={`${fieldId}-error`} className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );
};

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className,
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn(
      'flex items-center gap-3 pt-4 border-t border-gray-200',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

export interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700',
      className
    )}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export interface FormSuccessProps {
  message?: string;
  className?: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700',
      className
    )}>
      <div className="h-4 w-4 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
        <div className="h-2 w-2 bg-white rounded-full" />
      </div>
      <span>{message}</span>
    </div>
  );
};

// Hook para validação de formulários
export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  handleChange: (name: keyof T) => (value: any) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setFieldTouched: (name: keyof T, touched?: boolean) => void;
  resetForm: () => void;
  isValid: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = React.useCallback((vals: T) => {
    if (!validationSchema) return {};
    return validationSchema(vals);
  }, [validationSchema]);

  const handleChange = React.useCallback((name: keyof T) => (value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = React.useCallback((name: keyof T) => () => {
    setTouched(prev => ({ ...prev, [name as string]: true }));
    
    // Validate field on blur
    const fieldErrors = validate(values);
    if (fieldErrors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: fieldErrors[name as string] }));
    }
  }, [values, validate]);

  const setFieldValue = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = React.useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }));
  }, []);

  const setFieldTouched = React.useCallback((name: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name as string]: isTouched }));
  }, []);

  const resetForm = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate all fields
    const formErrors = validate(values);
    setErrors(formErrors);

    // If no errors, submit
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const isValid = React.useMemo(() => {
    return Object.keys(validate(values)).length === 0;
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    isValid,
  };
}