import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import * as Sentry from '@sentry/react';

// Tipos para métricas de performance
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Configuração de thresholds para Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Função para determinar o rating da métrica
function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Função para enviar métricas
function sendMetric(metric: PerformanceMetric) {
  // Enviar para Vercel Analytics se disponível
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', 'Web Vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Enviar para Sentry como contexto
  Sentry.captureMessage(`Core Web Vital: ${metric.name}`, 'info');

  // Log para desenvolvimento
  if (import.meta.env.DEV) {
    console.log(`📊 ${metric.name}:`, {
      value: `${metric.value}ms`,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString(),
    });
  }

  // Armazenar localmente para análise
  storeMetricLocally(metric);
}

// Armazenar métricas no localStorage
function storeMetricLocally(metric: PerformanceMetric) {
  try {
    const stored = localStorage.getItem('fisioflow_metrics') || '[]';
    const metrics = JSON.parse(stored);
    
    // Manter apenas as últimas 50 métricas
    metrics.push(metric);
    if (metrics.length > 50) {
      metrics.shift();
    }
    
    localStorage.setItem('fisioflow_metrics', JSON.stringify(metrics));
  } catch (error) {
    console.warn('Erro ao armazenar métrica:', error);
  }
}

// Inicializar monitoramento de Core Web Vitals
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  onLCP((metric) => {
    sendMetric({
      name: 'LCP',
      value: metric.value,
      rating: getRating('LCP', metric.value),
      timestamp: Date.now(),
    });
  });

  // First Input Delay (FID) - Deprecated in web-vitals v3
  // Replaced by INP (Interaction to Next Paint)

  // Cumulative Layout Shift (CLS)
  onCLS((metric) => {
    sendMetric({
      name: 'CLS',
      value: metric.value,
      rating: getRating('CLS', metric.value),
      timestamp: Date.now(),
    });
  });

  // First Contentful Paint (FCP)
  onFCP((metric) => {
    sendMetric({
      name: 'FCP',
      value: metric.value,
      rating: getRating('FCP', metric.value),
      timestamp: Date.now(),
    });
  });

  // Time to First Byte (TTFB)
  onTTFB((metric) => {
    sendMetric({
      name: 'TTFB',
      value: metric.value,
      rating: getRating('TTFB', metric.value),
      timestamp: Date.now(),
    });
  });

  // Interaction to Next Paint (INP)
  onINP((metric) => {
    sendMetric({
      name: 'INP',
      value: metric.value,
      rating: getRating('INP', metric.value),
      timestamp: Date.now(),
    });
  });
}

// Função para obter métricas armazenadas
export function getStoredMetrics(): PerformanceMetric[] {
  try {
    const stored = localStorage.getItem('fisioflow_metrics') || '[]';
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Erro ao recuperar métricas:', error);
    return [];
  }
}

// Função para limpar métricas armazenadas
export function clearStoredMetrics() {
  try {
    localStorage.removeItem('fisioflow_metrics');
  } catch (error) {
    console.warn('Erro ao limpar métricas:', error);
  }
}

// Hook personalizado para monitoramento de performance de componentes
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  return {
    // Marcar fim do carregamento do componente
    markComplete: () => {
      const duration = performance.now() - startTime;
      
      if (import.meta.env.DEV) {
        console.log(`⚡ ${componentName} renderizado em ${duration.toFixed(2)}ms`);
      }

      // Enviar métrica customizada
      sendMetric({
        name: `Component_${componentName}`,
        value: duration,
        rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      });
    },
  };
}

// Monitoramento de recursos (imagens, scripts, etc.)
export function monitorResourceLoading() {
  if (typeof window === 'undefined') return;

  // Observer para recursos
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming;
        
        // Monitorar apenas recursos importantes
        if (resource.name.includes('.js') || resource.name.includes('.css') || resource.name.includes('.woff')) {
          const loadTime = resource.responseEnd - resource.startTime;
          
          if (loadTime > 1000) { // Recursos que demoram mais de 1s
            Sentry.captureMessage(`Recurso lento: ${resource.name} (${loadTime.toFixed(2)}ms)`, 'warning');
          }
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}

// Monitoramento de navegação
export function monitorNavigation() {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const nav = entry as PerformanceNavigationTiming;
        
        const metrics = {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
          totalTime: nav.loadEventEnd - nav.fetchStart,
        };

        if (import.meta.env.DEV) {
          console.log('📈 Métricas de navegação:', metrics);
        }
      }
    });
  });

  observer.observe({ entryTypes: ['navigation'] });
}