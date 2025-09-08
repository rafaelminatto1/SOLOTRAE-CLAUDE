/**
 * Middleware Configuration
 * Centraliza a configuração de todos os middlewares da aplicação
 */
import { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { compressionMiddleware, compressionMonitoringMiddleware, adaptiveCompressionMiddleware } from './compression.js';
import { 
  apiRateLimiter, 
  authRateLimiter, 
  uploadRateLimiter, 
  adaptiveRateLimiter,
  rateLimitUtils 
} from './rateLimiter.js';

/**
 * Configurar middlewares de segurança
 */
export function setupSecurityMiddlewares(app: Express) {
  // Helmet para headers de segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.supabase.co", "wss://realtime.supabase.co"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS configuration
  const corsOptions = {
    origin: function (origin: string | undefined, callback: Function) {
      // Lista de origens permitidas
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173',
        'https://fisioflow.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      // Permitir requisições sem origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Não permitido pelo CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  app.use(cors(corsOptions));

  // Compressão gzip otimizada
  app.use(compressionMonitoringMiddleware);
  app.use(adaptiveCompressionMiddleware);
}

/**
 * Configurar middlewares de rate limiting
 */
export function setupRateLimitingMiddlewares(app: Express) {
  console.log('🛡️ Configurando rate limiting...');

  // Rate limiting global (aplicado a todas as rotas)
  app.use('/api', adaptiveRateLimiter);

  // Rate limiting específico para autenticação
  app.use('/api/auth', authRateLimiter);

  // Rate limiting para uploads
  app.use('/api/upload', uploadRateLimiter);

  // Endpoint para monitoramento de rate limiting (apenas para admins)
  app.get('/api/admin/rate-limit-stats', async (req: Request, res: Response) => {
    try {
      // Verificar se é admin (implementar verificação adequada)
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      const stats = await rateLimitUtils.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de rate limiting:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Endpoint para limpar rate limiting (apenas para admins)
  app.delete('/api/admin/rate-limit/:key?', async (req: Request, res: Response) => {
    try {
      // Verificar se é admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }

      const { key } = req.params;
      
      if (key) {
        await rateLimitUtils.clearRateLimit(key);
        res.json({
          success: true,
          message: `Rate limit removido para: ${key}`
        });
      } else {
        await rateLimitUtils.clearAllRateLimits();
        res.json({
          success: true,
          message: 'Todos os rate limits foram removidos'
        });
      }
    } catch (error) {
      console.error('Erro ao limpar rate limiting:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  console.log('✅ Rate limiting configurado');
}

/**
 * Configurar middlewares de logging e monitoramento
 */
export function setupLoggingMiddlewares(app: Express) {
  // Middleware de logging de requisições
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const userId = req.user?.id || 'anonymous';

    // Log da requisição
    console.log(`📥 ${method} ${url} - IP: ${ip} - User: ${userId}`);

    // Interceptar resposta para log
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - start;
      const { statusCode } = res;
      
      // Log da resposta
      const logLevel = statusCode >= 400 ? '❌' : '✅';
      console.log(`📤 ${logLevel} ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`);
      
      // Log detalhado para erros
      if (statusCode >= 400) {
        console.error(`🔍 Error details:`, {
          method,
          url,
          statusCode,
          ip,
          userAgent,
          userId,
          duration,
          body: typeof body === 'string' ? body.substring(0, 500) : body
        });
      }
      
      return originalSend.call(this, body);
    };

    next();
  });
}

/**
 * Configurar middleware de tratamento de erros
 */
export function setupErrorHandlingMiddlewares(app: Express) {
  // Middleware para rotas não encontradas
  app.use('*', (req: Request, res: Response) => {
    console.warn(`🔍 Rota não encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      message: 'Endpoint não encontrado',
      path: req.originalUrl,
      method: req.method
    });
  });

  // Middleware global de tratamento de erros
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('💥 Erro não tratado:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id
    });

    // Não expor detalhes do erro em produção
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: isDevelopment ? error.message : 'Erro interno do servidor',
      ...(isDevelopment && { stack: error.stack })
    });
  });
}

/**
 * Configurar todos os middlewares
 */
export function setupAllMiddlewares(app: Express) {
  console.log('🔧 Configurando middlewares...');
  
  // 1. Middlewares de segurança (primeiro)
  setupSecurityMiddlewares(app);
  
  // 2. Middlewares de logging
  setupLoggingMiddlewares(app);
  
  // 3. Middlewares de rate limiting
  setupRateLimitingMiddlewares(app);
  
  // 4. Middlewares de tratamento de erros (último)
  setupErrorHandlingMiddlewares(app);
  
  console.log('✅ Todos os middlewares configurados');
}

// Utilitários para monitoramento
export const middlewareUtils = {
  // Obter estatísticas de rate limiting
  getRateLimitStats: rateLimitUtils.getStats,
  
  // Limpar rate limits
  clearRateLimit: rateLimitUtils.clearRateLimit,
  clearAllRateLimits: rateLimitUtils.clearAllRateLimits,
  
  // Verificar saúde dos middlewares
  async healthCheck(): Promise<{ status: string; middlewares: any }> {
    try {
      const rateLimitStats = await rateLimitUtils.getStats();
      
      return {
        status: 'healthy',
        middlewares: {
          rateLimiting: {
            status: 'active',
            activeKeys: Object.keys(rateLimitStats).length
          },
          security: {
            status: 'active',
            features: ['helmet', 'cors', 'compression']
          },
          logging: {
            status: 'active'
          }
        }
      };
    } catch (error) {
      return {
        status: 'degraded',
        middlewares: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
};

export default {
  setupAllMiddlewares,
  setupSecurityMiddlewares,
  setupRateLimitingMiddlewares,
  setupLoggingMiddlewares,
  setupErrorHandlingMiddlewares,
  middlewareUtils
};