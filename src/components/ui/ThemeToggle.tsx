import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Button from './Button';
import AnimatedContainer from './AnimatedContainer';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function ThemeToggle({ 
  className = '', 
  size = 'md', 
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'light' ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
      
      <AnimatedContainer animation="scale-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={`${sizeClasses[size]} p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden`}
          aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {/* Background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
          
          {/* Icon container with rotation animation */}
          <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
            {theme === 'light' ? (
              <Moon 
                className={`${iconSizes[size]} text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400`}
              />
            ) : (
              <Sun 
                className={`${iconSizes[size]} text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-yellow-500`}
              />
            )}
          </div>
        </Button>
      </AnimatedContainer>
    </div>
  );
}

export { ThemeToggle };
export default ThemeToggle;