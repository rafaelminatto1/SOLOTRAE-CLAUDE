/**
 * Rate Limiting Middleware
 * Implementa controle de taxa de requisições para prevenir abuso das APIs
 */
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

// Interface para configuração do rate limiter
interface RateLimiterConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requisições por janela
  message?: string; // Mensagem de erro personalizada
  skipSuccessfulRequests?: boolean; // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean; // Pular requisições com falha
  keyGenerator?: (req: Request) => string; // Gerador de chave personalizado
  onLimitReached?: (req: Request, res: Response) => void; // Callback quando limite é atingido
}

// Configurações padrão para diferentes tipos de endpoints
export const RATE_LIMIT_CONFIGS = {
  // Endpoints de autenticação (mais restritivo)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 tentativas por IP
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  
  // APIs gerais
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // 100 requisições por IP
    message: 'Muitas requisições. Tente novamente mais tarde.'
  },
  
  // Upload de arquivos (mais restritivo)
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10, // 10 uploads por hora
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
  },
  
  // Endpoints críticos (muito restritivo)
  CRITICAL: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 5, // 5 requisições por hora
    message: 'Limite de requisições críticas atingido.'
  },
  
  // Endpoints públicos (menos restritivo)
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 200, // 200 requisições por IP
    message: 'Muitas requisições. Tente novamente mais tarde.'
  }
};

// Cliente Redis para armazenar contadores (opcional)
let redisClient: any = null;

// Inicializar Redis se disponível
try {
  if (process.env.REDIS_URL) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    redisClient.connect();
    console.log('✅ Redis conectado para rate limiting');
  }
} catch (error) {
  console.warn('⚠️ Redis não disponível, usando memória local para rate limiting');
}

// Armazenamento em memória como fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Limpeza periódica do armazenamento em memória
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60000); // Limpar a cada minuto

/**
 * Classe principal do Rate Limiter
 */
class RateLimiter {
  private config: RateLimiterConfig;
  
  constructor(config: RateLimiterConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req: Request) => this.getClientKey(req),
      ...config
    };
  }
  
  // Gera chave única para o cliente
  private getClientKey(req: Request): string {
    // Priorizar IP real do cliente
    const clientIp = 
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      'unknown';
    
    // Incluir user ID se autenticado para rate limiting por usuário
    const userId = req.user?.id;
    
    return userId ? `user:${userId}` : `ip:${clientIp}`;
  }
  
  // Middleware principal
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.config.keyGenerator!(req);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        
        let currentCount = 0;
        let resetTime = now + this.config.windowMs;
        
        if (redisClient) {
          // Usar Redis se disponível
          currentCount = await this.handleRedisRateLimit(key, now, windowStart);
        } else {
          // Usar armazenamento em memória
          currentCount = this.handleMemoryRateLimit(key, now, resetTime);
        }
        
        // Verificar se excedeu o limite
        if (currentCount > this.config.maxRequests) {
          // Callback personalizado quando limite é atingido
          if (this.config.onLimitReached) {
            this.config.onLimitReached(req, res);
          }
          
          // Log do evento
          console.warn(`🚫 Rate limit exceeded for ${key}: ${currentCount}/${this.config.maxRequests}`);
          
          // Retornar erro 429
          return res.status(429).json({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: this.config.message || 'Muitas requisições. Tente novamente mais tarde.',
            retryAfter: Math.ceil(this.config.windowMs / 1000),
            limit: this.config.maxRequests,
            remaining: 0,
            resetTime: new Date(resetTime).toISOString()
          });
        }
        
        // Adicionar headers informativos
        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - currentCount).toString(),
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'X-RateLimit-Window': this.config.windowMs.toString()
        });
        
        // Interceptar resposta para contar apenas requisições relevantes
        const originalSend = res.send;
        res.send = function(body) {
          const statusCode = res.statusCode;
          
          // Decidir se deve contar esta requisição
          const shouldSkip = 
            (this.config.skipSuccessfulRequests && statusCode < 400) ||
            (this.config.skipFailedRequests && statusCode >= 400);
          
          if (shouldSkip) {
            // Decrementar contador se não deve contar
            if (redisClient) {
              redisClient.decr(`rate_limit:${key}`);
            } else {
              const stored = memoryStore.get(key);
              if (stored && stored.count > 0) {
                stored.count--;
              }
            }
          }
          
          return originalSend.call(this, body);
        }.bind({ config: this.config });
        
        next();
      } catch (error) {
        console.error('❌ Erro no rate limiter:', error);
        // Em caso de erro, permitir a requisição
        next();
      }
    };
  }
  
  // Gerenciar rate limit com Redis
  private async handleRedisRateLimit(key: string, now: number, windowStart: number): Promise<number> {
    const redisKey = `rate_limit:${key}`;
    
    // Usar pipeline para operações atômicas
    const pipeline = redisClient.multi();
    
    // Incrementar contador
    pipeline.incr(redisKey);
    
    // Definir expiração se é a primeira requisição
    pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
    
    const results = await pipeline.exec();
    return results[0][1] as number;
  }
  
  // Gerenciar rate limit com memória
  private handleMemoryRateLimit(key: string, now: number, resetTime: number): number {
    const stored = memoryStore.get(key);
    
    if (!stored || now > stored.resetTime) {
      // Primeira requisição ou janela expirou
      memoryStore.set(key, { count: 1, resetTime });
      return 1;
    } else {
      // Incrementar contador existente
      stored.count++;
      return stored.count;
    }
  }
}

/**
 * Factory functions para criar middlewares de rate limiting
 */

// Rate limiter genérico
export function createRateLimiter(config: RateLimiterConfig) {
  const limiter = new RateLimiter(config);
  return limiter.middleware();
}

// Rate limiter para autenticação
export const authRateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.AUTH);

// Rate limiter para APIs gerais
export const apiRateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.API);

// Rate limiter para uploads
export const uploadRateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.UPLOAD);

// Rate limiter para endpoints críticos
export const criticalRateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.CRITICAL);

// Rate limiter para endpoints públicos
export const publicRateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.PUBLIC);

// Rate limiter personalizado por usuário autenticado
export function createUserRateLimiter(maxRequests: number, windowMs: number = 15 * 60 * 1000) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req: Request) => {
      // Rate limit por usuário se autenticado, senão por IP
      return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    message: `Limite de ${maxRequests} requisições por ${Math.ceil(windowMs / 60000)} minutos atingido.`
  });
}

// Rate limiter adaptativo baseado no endpoint
export function createAdaptiveRateLimiter(req: Request) {
  const path = req.path.toLowerCase();
  
  if (path.includes('/auth/') || path.includes('/login') || path.includes('/register')) {
    return authRateLimiter;
  }
  
  if (path.includes('/upload')) {
    return uploadRateLimiter;
  }
  
  if (path.includes('/admin/') || path.includes('/critical/')) {
    return criticalRateLimiter;
  }
  
  if (path.includes('/public/')) {
    return publicRateLimiter;
  }
  
  return apiRateLimiter;
}

// Middleware para aplicar rate limiting adaptativo
export const adaptiveRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const limiter = createAdaptiveRateLimiter(req);
  return limiter(req, res, next);
};

// Utilitários para monitoramento
export const rateLimitUtils = {
  // Obter estatísticas de rate limiting
  async getStats(key?: string): Promise<any> {
    if (redisClient) {
      const pattern = key ? `rate_limit:${key}` : 'rate_limit:*';
      const keys = await redisClient.keys(pattern);
      const stats: any = {};
      
      for (const redisKey of keys) {
        const count = await redisClient.get(redisKey);
        const ttl = await redisClient.ttl(redisKey);
        stats[redisKey.replace('rate_limit:', '')] = {
          count: parseInt(count) || 0,
          ttl
        };
      }
      
      return stats;
    } else {
      // Retornar estatísticas do armazenamento em memória
      const stats: any = {};
      const now = Date.now();
      
      for (const [memKey, value] of memoryStore.entries()) {
        if (!key || memKey.includes(key)) {
          stats[memKey] = {
            count: value.count,
            ttl: Math.max(0, Math.ceil((value.resetTime - now) / 1000))
          };
        }
      }
      
      return stats;
    }
  },
  
  // Limpar rate limit para uma chave específica
  async clearRateLimit(key: string): Promise<void> {
    if (redisClient) {
      await redisClient.del(`rate_limit:${key}`);
    } else {
      memoryStore.delete(key);
    }
  },
  
  // Limpar todos os rate limits
  async clearAllRateLimits(): Promise<void> {
    if (redisClient) {
      const keys = await redisClient.keys('rate_limit:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      memoryStore.clear();
    }
  }
};

export default RateLimiter;