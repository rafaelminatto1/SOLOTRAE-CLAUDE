import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    rounded = 'lg',
    hover = false,
    clickable = false,
    glow = false,
    gradient = false,
    children,
    ...props
  }, ref) => {
    const baseClasses = [
      'relative overflow-hidden transition-all duration-300 ease-out',
      gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white',
    ];

    const variantClasses = {
      default: 'shadow-sm border border-gray-200 hover:shadow-md',
      outlined: 'border-2 border-gray-200 hover:border-gray-300',
      elevated: 'shadow-lg border border-gray-100 hover:shadow-xl',
      filled: 'bg-gray-50 border border-gray-200 hover:bg-gray-100',
      glass: 'backdrop-blur-md bg-white/80 border border-white/20 shadow-lg hover:bg-white/90',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    };

    const interactionClasses = [
      hover && 'hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]',
      clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]',
    ];

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          roundedClasses[rounded],
          interactionClasses,
          className
        )}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({
    className,
    padding = 'md',
    children,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border-b border-gray-200',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({
    className,
    padding = 'md',
    children,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({
    className,
    padding = 'md',
    border = true,
    children,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          border && 'border-t border-gray-200',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({
    className,
    as: Component = 'h3',
    children,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-none tracking-tight text-gray-900',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({
    className,
    children,
    ...props
  }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm text-gray-600',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
export default Card;