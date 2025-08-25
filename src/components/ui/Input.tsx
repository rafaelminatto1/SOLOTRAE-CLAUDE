import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    inputSize = 'md',
    fullWidth = true,
    disabled,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Generate a unique ID if not provided
    const inputId = id || React.useId();
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon || isPassword;

    const containerClasses = cn(
      'relative',
      fullWidth ? 'w-full' : 'w-auto'
    );

    const labelClasses = cn(
      'block text-sm font-medium mb-1.5 transition-colors',
      hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-dark-300',
      disabled && 'text-gray-400 dark:text-dark-500'
    );

    const inputWrapperClasses = cn(
      'relative flex items-center',
      fullWidth ? 'w-full' : 'w-auto'
    );

    const baseInputClasses = [
      'block w-full rounded-lg border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-50 dark:disabled:bg-dark-800 disabled:text-gray-500 dark:disabled:text-dark-500 disabled:cursor-not-allowed',
      'placeholder:text-gray-400 dark:placeholder:text-dark-500',
    ];

    const variantClasses = {
      default: [
        'bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-white',
        hasError
          ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
          : 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400',
        isFocused && !hasError && 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400',
      ],
      filled: [
        'bg-gray-50 dark:bg-dark-700 border-transparent text-gray-900 dark:text-white',
        hasError
          ? 'bg-red-50 dark:bg-red-900/20 focus:bg-white dark:focus:bg-dark-800 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
          : 'focus:bg-white dark:focus:bg-dark-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400',
        isFocused && !hasError && 'bg-white dark:bg-dark-800 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400',
      ],
    };

    const sizeClasses = {
      sm: cn(
        'px-3 py-1.5 text-sm',
        hasLeftIcon && 'pl-9',
        hasRightIcon && 'pr-9'
      ),
      md: cn(
        'px-3 py-2 text-sm',
        hasLeftIcon && 'pl-10',
        hasRightIcon && 'pr-10'
      ),
      lg: cn(
        'px-4 py-3 text-base',
        hasLeftIcon && 'pl-12',
        hasRightIcon && 'pr-12'
      ),
    };

    const iconSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const iconPositionClasses = {
      sm: {
        left: 'left-2.5',
        right: 'right-2.5',
      },
      md: {
        left: 'left-3',
        right: 'right-3',
      },
      lg: {
        left: 'left-3',
        right: 'right-3',
      },
    };

    const helperTextClasses = cn(
      'mt-1.5 text-xs transition-colors',
      hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-dark-400'
    );

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className={inputWrapperClasses}>
          {leftIcon && (
            <div className={cn(
              'absolute z-10 flex items-center justify-center text-gray-400 dark:text-dark-500 transition-colors',
              iconPositionClasses[inputSize].left,
              'top-1/2 -translate-y-1/2'
            )}>
              <span className={iconSizeClasses[inputSize]}>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              baseInputClasses,
              variantClasses[variant],
              sizeClasses[inputSize],
              className
            )}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className={cn(
              'absolute z-10 flex items-center justify-center',
              iconPositionClasses[inputSize].right,
              'top-1/2 -translate-y-1/2'
            )}>
              {isPassword ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={cn(
                    'text-gray-400 dark:text-dark-500 hover:text-gray-600 dark:hover:text-dark-300 transition-colors',
                    'focus:outline-none focus:text-gray-600 dark:focus:text-dark-300',
                    iconSizeClasses[inputSize]
                  )}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className={iconSizeClasses[inputSize]} />
                  ) : (
                    <Eye className={iconSizeClasses[inputSize]} />
                  )}
                </button>
              ) : (
                <span className={cn(
                  'text-gray-400 dark:text-dark-500 transition-colors',
                  iconSizeClasses[inputSize]
                )}>
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={helperTextClasses}>
            {error && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {!error && helperText && (
              <span>{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;