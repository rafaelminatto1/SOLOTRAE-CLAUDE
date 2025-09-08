import { Request, Response, NextFunction } from 'express';
// import Redis from 'ioredis'; // Desabilitado para desenvolvimento

// =============================================
// CONFIGURAÇÃO DO CACHE
// =============================================

interface CacheConfig {
  REDIS_URL?: string;
  DEFAULT_TTL: number;
  MAX_MEMORY_CACHE_SIZE: number;
  ENABLE_REDIS: boolean;
  ENABLE_MEMORY_FALLBACK: boolean;
  CACHE_KEY_PREFIX: string;
}

const CACHE_CONFIG: CacheConfig = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  DEFAULT_TTL: 300, // 5 minutos
  MAX_MEMORY_CACHE_SIZE: 1000, // máximo de 1000 entradas na memória
  ENABLE_REDIS: false, // Desabilitado para desenvolvimento
  ENABLE_MEMORY_FALLBACK: true,
  CACHE_KEY_PREFIX: 'fisioflow:'
};

// TTLs específicos por tipo de dados
const CACHE_TTLS = {
  users: 600, // 10 minutos
  patients: 300, // 5 minutos
  physiotherapists: 300, // 5 minutos
  exercises: 1800, // 30 minutos (dados mais estáticos)
  appointments: 60, // 1 minuto (dados dinâmicos)
  progress: 180, // 3 minutos
  notifications: 30, // 30 segundos
  stats: 900, // 15 minutos
  search: 120 // 2 minutos
};

// =============================================
// CACHE MANAGER
// =============================================

class CacheManager {
  private redis: any | null = null; // Tipo genérico para evitar erro de importação
  private memoryCache: Map<string, { data: any; expires: number }> = new Map();
  private isRedisConnected = false;

  constructor() {
    this.initializeRedis();
    this.startMemoryCleanup();
  }

  private async initializeRedis() {
    if (!CACHE_CONFIG.ENABLE_REDIS) {
      console.log('📦 Cache: Using memory-only cache (Redis disabled)');
      return;
    }

    // Redis desabilitado para desenvolvimento
    console.log('📦 Cache: Redis initialization skipped (development mode)');
    this.redis = null;
    this.isRedisConnected = false;
    
    /* 
    try {
      this.redis = new Redis(CACHE_CONFIG.REDIS_URL!, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        console.log('📦 Cache: Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.isRedisConnected = false;
        console.warn('📦 Cache: Redis error, falling back to memory cache:', error.message);
      });

      this.redis.on('close', () => {
        this.isRedisConnected = false;
        console.warn('📦 Cache: Redis connection closed, using memory cache');
      });

      await this.redis.connect();
    } catch (error) {
      console.warn('📦 Cache: Failed to connect to Redis, using memory cache:', error);
      this.redis = null;
    }
    */
  }

  private startMemoryCleanup() {
    // Limpeza da memória cache a cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, value] of this.memoryCache.entries()) {
        if (value.expires < now) {
          this.memoryCache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`📦 Cache: Cleaned ${cleaned} expired entries from memory cache`);
      }

      // Limitar tamanho do cache em memória
      if (this.memoryCache.size > CACHE_CONFIG.MAX_MEMORY_CACHE_SIZE) {
        const entries = Array.from(this.memoryCache.entries());
        entries.sort((a, b) => a[1].expires - b[1].expires);
        
        const toRemove = this.memoryCache.size - CACHE_CONFIG.MAX_MEMORY_CACHE_SIZE;
        for (let i = 0; i < toRemove; i++) {
          this.memoryCache.delete(entries[i][0]);
        }
        
        console.log(`📦 Cache: Removed ${toRemove} oldest entries to maintain size limit`);
      }
    }, 5 * 60 * 1000);
  }

  private getKey(key: string): string {
    return `${CACHE_CONFIG.CACHE_KEY_PREFIX}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);

    try {
      // Tentar Redis primeiro se disponível
      if (this.redis && this.isRedisConnected) {
        const result = await this.redis.get(fullKey);
        if (result) {
          return JSON.parse(result);
        }
      }
    } catch (error) {
      console.warn('📦 Cache: Redis get error:', error);
    }

    // Fallback para memória
    if (CACHE_CONFIG.ENABLE_MEMORY_FALLBACK) {
      const cached = this.memoryCache.get(fullKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
      
      // Remover se expirado
      if (cached) {
        this.memoryCache.delete(fullKey);
      }
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const finalTtl = ttl || CACHE_CONFIG.DEFAULT_TTL;
    const serialized = JSON.stringify(value);

    try {
      // Tentar Redis primeiro se disponível
      if (this.redis && this.isRedisConnected) {
        await this.redis.setex(fullKey, finalTtl, serialized);
      }
    } catch (error) {
      console.warn('📦 Cache: Redis set error:', error);
    }

    // Sempre salvar na memória como fallback
    if (CACHE_CONFIG.ENABLE_MEMORY_FALLBACK) {
      this.memoryCache.set(fullKey, {
        data: value,
        expires: Date.now() + (finalTtl * 1000)
      });
    }
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.getKey(key);

    try {
      if (this.redis && this.isRedisConnected) {
        await this.redis.del(fullKey);
      }
    } catch (error) {
      console.warn('📦 Cache: Redis delete error:', error);
    }

    this.memoryCache.delete(fullKey);
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (this.redis && this.isRedisConnected) {
        if (pattern) {
          const keys = await this.redis.keys(`${CACHE_CONFIG.CACHE_KEY_PREFIX}${pattern}*`);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } else {
          await this.redis.flushdb();
        }
      }
    } catch (error) {
      console.warn('📦 Cache: Redis clear error:', error);
    }

    // Limpar memória
    if (pattern) {
      const fullPattern = this.getKey(pattern);
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(fullPattern)) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      this.memoryCache.clear();
    }
  }

  getStats() {
    return {
      redis: {
        connected: this.isRedisConnected,
        enabled: CACHE_CONFIG.ENABLE_REDIS
      },
      memory: {
        size: this.memoryCache.size,
        maxSize: CACHE_CONFIG.MAX_MEMORY_CACHE_SIZE,
        enabled: CACHE_CONFIG.ENABLE_MEMORY_FALLBACK
      }
    };
  }
}

// Instância global do cache
export const cacheManager = new CacheManager();

// =============================================
// MIDDLEWARE DE CACHE
// =============================================

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  invalidatePatterns?: string[];
}

export function cacheMiddleware(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Verificar condição para cache
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Apenas cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Gerar chave do cache
    const cacheKey = options.keyGenerator 
      ? options.keyGenerator(req)
      : `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Tentar obter do cache
      const cached = await cacheManager.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Interceptar resposta para cachear
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cachear apenas respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheManager.set(cacheKey, data, options.ttl)
            .catch(error => console.warn('📦 Cache: Failed to cache response:', error));
        }
        
        res.setHeader('X-Cache', 'MISS');
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.warn('📦 Cache: Middleware error:', error);
      next();
    }
  };
}

// =============================================
// CACHE HELPERS ESPECÍFICOS
// =============================================

export const cacheHelpers = {
  // Cache para usuários
  users: {
    get: (userId: string) => cacheManager.get(`user:${userId}`),
    set: (userId: string, data: any) => cacheManager.set(`user:${userId}`, data, CACHE_TTLS.users),
    delete: (userId: string) => cacheManager.delete(`user:${userId}`),
    clear: () => cacheManager.clear('user:')
  },

  // Cache para pacientes
  patients: {
    get: (patientId: string) => cacheManager.get(`patient:${patientId}`),
    set: (patientId: string, data: any) => cacheManager.set(`patient:${patientId}`, data, CACHE_TTLS.patients),
    delete: (patientId: string) => cacheManager.delete(`patient:${patientId}`),
    clear: () => cacheManager.clear('patient:')
  },

  // Cache para fisioterapeutas
  physiotherapists: {
    get: (physioId: string) => cacheManager.get(`physiotherapist:${physioId}`),
    set: (physioId: string, data: any) => cacheManager.set(`physiotherapist:${physioId}`, data, CACHE_TTLS.physiotherapists),
    delete: (physioId: string) => cacheManager.delete(`physiotherapist:${physioId}`),
    clear: () => cacheManager.clear('physiotherapist:')
  },

  // Cache para exercícios
  exercises: {
    get: (exerciseId: string) => cacheManager.get(`exercise:${exerciseId}`),
    set: (exerciseId: string, data: any) => cacheManager.set(`exercise:${exerciseId}`, data, CACHE_TTLS.exercises),
    delete: (exerciseId: string) => cacheManager.delete(`exercise:${exerciseId}`),
    clear: () => cacheManager.clear('exercise:'),
    list: {
      get: (filters: string) => cacheManager.get(`exercises:list:${filters}`),
      set: (filters: string, data: any) => cacheManager.set(`exercises:list:${filters}`, data, CACHE_TTLS.exercises)
    }
  },

  // Cache para agendamentos
  appointments: {
    get: (appointmentId: string) => cacheManager.get(`appointment:${appointmentId}`),
    set: (appointmentId: string, data: any) => cacheManager.set(`appointment:${appointmentId}`, data, CACHE_TTLS.appointments),
    delete: (appointmentId: string) => cacheManager.delete(`appointment:${appointmentId}`),
    clear: () => cacheManager.clear('appointment:'),
    list: {
      get: (userId: string, filters: string) => cacheManager.get(`appointments:${userId}:${filters}`),
      set: (userId: string, filters: string, data: any) => cacheManager.set(`appointments:${userId}:${filters}`, data, CACHE_TTLS.appointments)
    }
  },

  // Cache para estatísticas
  stats: {
    get: (type: string, id: string) => cacheManager.get(`stats:${type}:${id}`),
    set: (type: string, id: string, data: any) => cacheManager.set(`stats:${type}:${id}`, data, CACHE_TTLS.stats),
    clear: () => cacheManager.clear('stats:')
  }
};

// =============================================
// MIDDLEWARE PARA INVALIDAÇÃO DE CACHE
// =============================================

export function cacheInvalidationMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptar resposta para invalidar cache após operações de escrita
    const originalJson = res.json;
    res.json = function(data: any) {
      // Invalidar cache apenas em operações de sucesso
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => {
          cacheManager.clear(pattern)
            .catch(error => console.warn('📦 Cache: Failed to invalidate pattern:', pattern, error));
        });
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
}

// =============================================
// FACTORY FUNCTIONS
// =============================================

export function createCacheMiddleware(type: keyof typeof CACHE_TTLS, options: Partial<CacheOptions> = {}) {
  return cacheMiddleware({
    ttl: CACHE_TTLS[type],
    ...options
  });
}

export function createListCacheMiddleware(type: keyof typeof CACHE_TTLS) {
  return cacheMiddleware({
    ttl: CACHE_TTLS[type],
    keyGenerator: (req) => {
      const { page, limit, ...filters } = req.query;
      return `${type}:list:${JSON.stringify(filters)}:${page || 1}:${limit || 10}`;
    }
  });
}

// =============================================
// HEALTH CHECK
// =============================================

export async function getCacheHealth() {
  const stats = cacheManager.getStats();
  
  return {
    status: 'healthy',
    cache: stats,
    timestamp: new Date().toISOString()
  };
}

// =============================================
// EXPORTS
// =============================================

// Alias para compatibilidade com imports existentes
export const physiotherapistCacheHelpers = cacheHelpers.physiotherapists;
export const patientCacheHelpers = cacheHelpers.patients;
export const userCacheHelpers = cacheHelpers.users;
export const exerciseCacheHelpers = cacheHelpers.exercises;
export const appointmentCacheHelpers = cacheHelpers.appointments;
export const statsCacheHelpers = cacheHelpers.stats;
export const treatmentPlanCacheHelpers = cacheHelpers.stats; // Usando stats como fallback
export const progressCacheHelpers = cacheHelpers.stats; // Usando stats como fallback

export default cacheManager;
export { CACHE_CONFIG, CACHE_TTLS };