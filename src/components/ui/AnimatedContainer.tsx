import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-in' | 'bounce-gentle';
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
  trigger?: 'mount' | 'scroll' | 'hover';
  threshold?: number;
  className?: string;
  once?: boolean;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 'normal',
  trigger = 'mount',
  threshold = 0.1,
  className,
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'mount');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && (!once || !hasAnimated)) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          } else if (!once && !entry.isIntersecting) {
            setIsVisible(false);
          }
        },
        { threshold }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    } else if (trigger === 'mount') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, threshold, once, hasAnimated]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    const baseAnimation = `animate-${animation}`;
    const durationClass = duration === 'fast' ? 'duration-200' : duration === 'slow' ? 'duration-700' : 'duration-300';
    
    return `${baseAnimation} ${durationClass}`;
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        getAnimationClass(),
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
export { AnimatedContainer };