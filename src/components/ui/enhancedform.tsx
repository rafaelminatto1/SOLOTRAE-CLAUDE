import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

// Enhanced Form Component
export interface EnhancedFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const EnhancedForm: React.FC<EnhancedFormProps> = ({
  children,
  onSubmit,
  className = ''
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
};

// Form Field Component
export interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  error,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Input Component
export interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  touched?: boolean;
  icon?: LucideIcon;
  rightIcon?: React.ReactNode;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>((
  {
    label,
    error,
    touched,
    icon: Icon,
    rightIcon,
    onChange,
    onBlur,
    className = '',
    ...props
  },
  ref
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error && touched ? 'border-red-500' : 'border-gray-300'}
    ${Icon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        )}
        <input
          ref={ref}
          onChange={handleChange}
          onBlur={onBlur}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && touched && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

EnhancedInput.displayName = 'EnhancedInput';

// Enhanced Select Component
export interface EnhancedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  touched?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const EnhancedSelect = forwardRef<HTMLSelectElement, EnhancedSelectProps>((
  {
    label,
    error,
    touched,
    options,
    placeholder,
    onChange,
    onBlur,
    className = '',
    ...props
  },
  ref
) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const selectClasses = `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error && touched ? 'border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        onChange={handleChange}
        onBlur={onBlur}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && touched && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

EnhancedSelect.displayName = 'EnhancedSelect';

// Submit Button Component
export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <Button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`w-full ${className}`}
      {...props}
    >
      {isSubmitting ? 'Carregando...' : children}
    </Button>
  );
};

// Form validation utilities
export const getFieldError = (errors: Record<string, string>, touched: Record<string, boolean>, fieldName: string): string | undefined => {
  return touched[fieldName] ? errors[fieldName] : undefined;
};

export const isFieldTouched = (touched: Record<string, boolean>, fieldName: string): boolean => {
  return Boolean(touched[fieldName]);
};

export const hasFieldError = (errors: Record<string, string>, touched: Record<string, boolean>, fieldName: string): boolean => {
  return Boolean(touched[fieldName] && errors[fieldName]);
};

// Form state helpers
export const getFormErrors = (errors: Record<string, string>, touched: Record<string, boolean>): Record<string, string> => {
  const formErrors: Record<string, string> = {};
  Object.keys(touched).forEach(key => {
    if (touched[key] && errors[key]) {
      formErrors[key] = errors[key];
    }
  });
  return formErrors;
};

export const isFormValid = (errors: Record<string, string>, touched: Record<string, boolean>): boolean => {
  const touchedFields = Object.keys(touched).filter(key => touched[key]);
  if (touchedFields.length === 0) return false;
  
  return touchedFields.every(key => !errors[key]);
};

export const getFormTouchedFields = (touched: Record<string, boolean>): string[] => {
  return Object.keys(touched).filter(key => touched[key]);
};

export const resetFormState = () => ({
  values: {},
  errors: {},
  touched: {},
  isSubmitting: false
});