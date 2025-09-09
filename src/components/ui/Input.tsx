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
      hasError ? 'text-red-600' : 'text-gray-700',
      disabled && 'text-gray-400'
    );

    const inputWrapperClasses = cn(
      'relative flex items-center',
      fullWidth ? 'w-full' : 'w-auto'
    );

    const baseInputClasses = [
      'block w-full rounded-lg border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
    ];

    const variantClasses = {
      default: [
        'bg-white border-gray-300 text-gray-900',
        hasError
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'focus:border-blue-500 focus:ring-blue-500',
        isFocused && !hasError && 'border-blue-500 ring-2 ring-blue-500',
      ],
      filled: [
        'bg-gray-50 border-transparent text-gray-900',
        hasError
          ? 'bg-red-50 focus:bg-white focus:border-red-500 focus:ring-red-500'
          : 'focus:bg-white focus:border-blue-500 focus:ring-blue-500',
        isFocused && !hasError && 'bg-white border-blue-500 ring-2 ring-blue-500',
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
      hasError ? 'text-red-600' : 'text-gray-500'
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
              'absolute z-10 flex items-center justify-center text-gray-400 transition-colors',
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
                    'text-gray-400 hover:text-gray-600 transition-colors',
                    'focus:outline-none focus:text-gray-600',
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
                  'text-gray-400 transition-colors',
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