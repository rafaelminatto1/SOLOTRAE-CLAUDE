import React, { useEffect, useRef } from 'react';
import { errorLogger } from '../../utils/errorLogger';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    domContentLoaded: 0,
  };

  private observer?: PerformanceObserver;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Monitora métricas básicas de carregamento
    window.addEventListener('load', () => {
      this.collectBasicMetrics();
    });

    // Monitora Web Vitals se disponível
    if ('PerformanceObserver' in window) {
      this.setupWebVitalsMonitoring();
    }

    // Monitora navegação SPA
    this.setupSPAMonitoring();
  }

  private collectBasicMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      
      this.reportMetrics('page_load', this.metrics);
    }
  }

  private setupWebVitalsMonitoring(): void {
    try {
      // First Contentful Paint (FCP)
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      this.observer.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      errorLogger.logWarning('Failed to setup Web Vitals monitoring', { error });
    }
  }

  private setupSPAMonitoring(): void {
    // Monitora mudanças de rota em SPAs
    let lastUrl = location.href;
    
    const observer = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        this.onRouteChange(lastUrl, currentUrl);
        lastUrl = currentUrl;
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    // Monitora mudanças no history API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        performanceMonitor.onRouteChange(lastUrl, location.href);
        lastUrl = location.href;
      }, 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        performanceMonitor.onRouteChange(lastUrl, location.href);
        lastUrl = location.href;
      }, 0);
    };
  }

  private onRouteChange(from: string, to: string): void {
    const startTime = performance.now();
    
    // Aguarda um pouco para a rota carregar
    setTimeout(() => {
      const endTime = performance.now();
      const routeChangeTime = endTime - startTime;
      
      this.reportMetrics('route_change', {
        from,
        to,
        duration: routeChangeTime,
        timestamp: new Date().toISOString(),
      });
    }, 100);
  }

  private reportMetrics(type: string, data: any): void {
    try {
      // Log para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${type}:`, data);
      }

      // Em produção, você pode enviar para um serviço de analytics
      if (process.env.NODE_ENV === 'production') {
        // Exemplo: enviar para Google Analytics, Mixpanel, etc.
        this.sendToAnalytics(type, data);
      }

      // Detectar problemas de performance
      this.detectPerformanceIssues(type, data);

    } catch (error) {
      errorLogger.logError({
        message: 'Failed to report performance metrics',
        context: { type, data, error },
      });
    }
  }

  private sendToAnalytics(type: string, data: any): void {
    // Implementar integração com serviços de analytics
    // Exemplo com Google Analytics 4:
    /*
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_type: type,
        metric_value: JSON.stringify(data),
      });
    }
    */
  }

  private detectPerformanceIssues(type: string, data: any): void {
    const thresholds = {
      pageLoadTime: 3000, // 3 segundos
      firstContentfulPaint: 1800, // 1.8 segundos
      largestContentfulPaint: 2500, // 2.5 segundos
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
      routeChangeTime: 1000, // 1 segundo
    };

    if (type === 'page_load') {
      if (data.pageLoadTime > thresholds.pageLoadTime) {
        errorLogger.logWarning('Slow page load detected', {
          loadTime: data.pageLoadTime,
          threshold: thresholds.pageLoadTime,
        });
      }

      if (data.firstContentfulPaint && data.firstContentfulPaint > thresholds.firstContentfulPaint) {
        errorLogger.logWarning('Slow First Contentful Paint', {
          fcp: data.firstContentfulPaint,
          threshold: thresholds.firstContentfulPaint,
        });
      }

      if (data.largestContentfulPaint && data.largestContentfulPaint > thresholds.largestContentfulPaint) {
        errorLogger.logWarning('Slow Largest Contentful Paint', {
          lcp: data.largestContentfulPaint,
          threshold: thresholds.largestContentfulPaint,
        });
      }

      if (data.cumulativeLayoutShift && data.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
        errorLogger.logWarning('High Cumulative Layout Shift', {
          cls: data.cumulativeLayoutShift,
          threshold: thresholds.cumulativeLayoutShift,
        });
      }
    }

    if (type === 'route_change' && data.duration > thresholds.routeChangeTime) {
      errorLogger.logWarning('Slow route change detected', {
        from: data.from,
        to: data.to,
        duration: data.duration,
        threshold: thresholds.routeChangeTime,
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Instância singleton
export const performanceMonitor = new PerformanceMonitor();

// Componente React para integração
const PerformanceMonitorComponent: React.FC = () => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    monitorRef.current = performanceMonitor;

    return () => {
      if (monitorRef.current) {
        monitorRef.current.cleanup();
      }
    };
  }, []);

  // Componente invisível - apenas para inicialização
  return null;
};

export default PerformanceMonitorComponent;