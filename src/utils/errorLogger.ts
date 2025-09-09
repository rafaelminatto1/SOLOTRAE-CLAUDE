/**
 * Sistema de logging de erros para FisioFlow
 * Captura e reporta erros da aplicação para monitoramento
 */

import React from 'react';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Captura erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });

    // Captura promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        type: 'unhandledrejection',
      });
    });

    // Captura erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.logError({
          message: `Resource loading error: ${(event.target as any)?.src || (event.target as any)?.href}`,
          type: 'resource',
          element: (event.target as any)?.tagName,
        });
      }
    }, true);
  }

  public logError(error: {
    message: string;
    stack?: string;
    url?: string;
    line?: number;
    column?: number;
    type?: string;
    element?: string;
    context?: Record<string, any>;
  }): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      context: {
        ...error.context,
        type: error.type,
        element: error.element,
        line: error.line,
        column: error.column,
      },
    };

    this.addLog(errorLog);
    this.reportError(errorLog);
  }

  public logWarning(message: string, context?: Record<string, any>): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warn',
      message,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      context,
    };

    this.addLog(warningLog);
    console.warn('[FisioFlow Warning]', message, context);
  }

  public logInfo(message: string, context?: Record<string, any>): void {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      context,
    };

    this.addLog(infoLog);
    console.info('[FisioFlow Info]', message, context);
  }

  private addLog(log: ErrorLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Salva no localStorage para persistência
    try {
      localStorage.setItem('fisioflow_error_logs', JSON.stringify(this.logs.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to save error logs to localStorage:', e);
    }
  }

  private async reportError(errorLog: ErrorLog): Promise<void> {
    try {
      // Em produção, você pode enviar para um serviço de monitoramento
      // como Sentry, LogRocket, ou um endpoint personalizado
      
      // Por enquanto, apenas logamos no console em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('[FisioFlow Error]', {
          message: errorLog.message,
          stack: errorLog.stack,
          context: errorLog.context,
          timestamp: errorLog.timestamp,
        });
      }

      // Em produção, descomente e configure um serviço de monitoramento:
      /*
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog),
        });
      }
      */
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('fisioflow_error_logs');
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  // Método para capturar erros de API
  public logApiError(error: any, endpoint: string, method: string): void {
    this.logError({
      message: `API Error: ${method} ${endpoint}`,
      stack: error.stack,
      context: {
        endpoint,
        method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
      },
    });
  }

  // Método para capturar erros de autenticação
  public logAuthError(error: any, action: string): void {
    this.logError({
      message: `Auth Error: ${action}`,
      stack: error.stack,
      context: {
        action,
        errorCode: error.code,
        errorMessage: error.message,
      },
    });
  }
}

// Instância singleton
export const errorLogger = new ErrorLogger();

// Hook para React components
export const useErrorLogger = () => {
  return {
    logError: errorLogger.logError.bind(errorLogger),
    logWarning: errorLogger.logWarning.bind(errorLogger),
    logInfo: errorLogger.logInfo.bind(errorLogger),
    logApiError: errorLogger.logApiError.bind(errorLogger),
    logAuthError: errorLogger.logAuthError.bind(errorLogger),
    getLogs: errorLogger.getLogs.bind(errorLogger),
    clearLogs: errorLogger.clearLogs.bind(errorLogger),
  };
};

// Função para capturar erros em componentes React
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
      errorLogger.logError({
        message: `React Error Boundary: ${error.message}`,
        stack: error.stack,
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement('div', {
          className: 'min-h-screen flex items-center justify-center bg-gray-50'
        }, 
          React.createElement('div', {
            className: 'text-center p-8'
          },
            React.createElement('h2', {
              className: 'text-2xl font-bold text-gray-900 mb-4'
            }, 'Oops! Algo deu errado'),
            React.createElement('p', {
              className: 'text-gray-600 mb-6'
            }, 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'),
            React.createElement('button', {
              onClick: () => window.location.reload(),
              className: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            }, 'Recarregar Página')
          )
        );
      }

      return React.createElement(Component, this.props);
    }
  };
};

export default errorLogger;