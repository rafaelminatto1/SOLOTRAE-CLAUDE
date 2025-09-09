import { useState, useEffect, useRef, useCallback } from 'react';

// Hook para lazy loading de imagens
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            setIsError(false);
          };
          
          img.onerror = () => {
            setIsError(true);
            setIsLoaded(false);
          };
          
          img.src = src;
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    isError
  };
}

// Hook para lazy loading de componentes
export function useLazyComponent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: {
    threshold?: number;
    rootMargin?: string;
    fallback?: React.ComponentType;
  } = {}
) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { threshold = 0.1, rootMargin = '100px', fallback } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !Component && !isLoading) {
          setIsLoading(true);
          
          importFn()
            .then((module) => {
              setComponent(() => module.default);
              setError(null);
            })
            .catch((err) => {
              setError(err);
              console.error('Erro ao carregar componente:', err);
            })
            .finally(() => {
              setIsLoading(false);
            });
          
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [Component, isLoading, importFn, threshold, rootMargin]);

  const LazyComponent = useCallback(
    (props: T) => {
      if (error && fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent {...props} />;
      }
      
      if (Component) {
        return <Component {...props} />;
      }
      
      return <div ref={elementRef} />;
    },
    [Component, error, fallback]
  );

  return {
    Component: LazyComponent,
    isLoading,
    error,
    ref: elementRef
  };
}

// Hook para intersection observer genérico
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const callbackRef = useRef(callback);

  // Atualizar callback ref quando callback mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => callbackRef.current(entry),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return elementRef;
}

// Hook para lazy loading de listas (virtualização simples)
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
}

// Hook para preload de recursos
export function usePreload() {
  const preloadedResources = useRef(new Set<string>());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadComponent = useCallback(
    async (importFn: () => Promise<any>): Promise<void> => {
      try {
        await importFn();
      } catch (error) {
        console.error('Erro ao precarregar componente:', error);
        throw error;
      }
    },
    []
  );

  const preloadRoute = useCallback((path: string) => {
    // Preload de rota usando link prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  }, []);

  return {
    preloadImage,
    preloadComponent,
    preloadRoute,
    isPreloaded: (src: string) => preloadedResources.current.has(src)
  };
}

// Hook para loading states progressivos
export function useProgressiveLoading(steps: string[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const completeStep = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    
    // Avançar para próximo step se o atual foi completado
    if (stepIndex === currentStep) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [currentStep, steps.length]);

  const isStepCompleted = useCallback(
    (stepIndex: number) => completedSteps.has(stepIndex),
    [completedSteps]
  );

  const isStepActive = useCallback(
    (stepIndex: number) => stepIndex === currentStep,
    [currentStep]
  );

  const progress = (completedSteps.size / steps.length) * 100;

  return {
    currentStep,
    completedSteps: Array.from(completedSteps),
    completeStep,
    isStepCompleted,
    isStepActive,
    progress,
    isComplete: completedSteps.size === steps.length
  };
}