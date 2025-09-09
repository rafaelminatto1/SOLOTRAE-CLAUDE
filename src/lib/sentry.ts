import * as Sentry from '@sentry/react';
import React from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

// Configuração do Sentry
export const initSentry = () => {
  // Só inicializa o Sentry em produção
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      // Configurações adicionais
      beforeSend(event) {
        // Filtrar eventos sensíveis em produção
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('ChunkLoadError')) {
            return null; // Não reportar erros de chunk loading
          }
        }
        return event;
      },
    });
  }
};

// Error Boundary com Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Hook personalizado para capturar erros
export function useSentry() {
  return {
    captureMessage: Sentry.captureMessage,
    captureException: Sentry.captureException,
    setUser: Sentry.setUser,
    setTag: Sentry.setTag,
    setContext: Sentry.setContext,
  };
}

// Função para capturar erros (para uso fora de componentes)
export const captureError = Sentry.captureException;