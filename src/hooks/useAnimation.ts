import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAnimationOptions {
  trigger?: 'mount' | 'scroll' | 'manual';
  delay?: number;
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

export const useAnimation = (options: UseAnimationOptions = {}) => {
  const {
    trigger = 'mount',
    delay = 0,
    threshold = 0.1,
    once = true,
    rootMargin = '0px'
  } = options;

  const [isVisible, setIsVisible] = useState(trigger === 'mount');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const triggerAnimation = useCallback(() => {
    if (!once || !hasAnimated) {
      setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, delay);
    }
  }, [delay, once, hasAnimated]);

  const resetAnimation = useCallback(() => {
    setIsVisible(false);
    setHasAnimated(false);
  }, []);

  useEffect(() => {
    if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            triggerAnimation();
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold, rootMargin }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    } else if (trigger === 'mount') {
      triggerAnimation();
    }
  }, [trigger, triggerAnimation, threshold, rootMargin, once]);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
    triggerAnimation,
    resetAnimation
  };
};

// Hook para animações de lista (stagger effect)
export const useStaggerAnimation = (itemCount: number, staggerDelay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [isTriggered, setIsTriggered] = useState(false);

  const triggerStagger = useCallback(() => {
    if (isTriggered) return;
    
    setIsTriggered(true);
    
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, i]));
      }, i * staggerDelay);
    }
  }, [itemCount, staggerDelay, isTriggered]);

  const resetStagger = useCallback(() => {
    setVisibleItems(new Set());
    setIsTriggered(false);
  }, []);

  const isItemVisible = useCallback((index: number) => {
    return visibleItems.has(index);
  }, [visibleItems]);

  return {
    triggerStagger,
    resetStagger,
    isItemVisible,
    isTriggered
  };
};

// Hook para animações de hover
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return {
    ref: elementRef,
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};

// Hook para animações de loading
export const useLoadingAnimation = (isLoading: boolean) => {
  const [showContent, setShowContent] = useState(!isLoading);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'loaded' | 'hidden'>(
    isLoading ? 'loading' : 'loaded'
  );

  useEffect(() => {
    if (isLoading) {
      setAnimationPhase('loading');
      setShowContent(false);
    } else {
      setAnimationPhase('loaded');
      // Pequeno delay para suavizar a transição
      setTimeout(() => {
        setShowContent(true);
      }, 150);
    }
  }, [isLoading]);

  return {
    showContent,
    animationPhase,
    loadingClasses: animationPhase === 'loading' ? 'animate-pulse opacity-50' : '',
    contentClasses: showContent ? 'animate-fade-in' : 'opacity-0'
  };
};