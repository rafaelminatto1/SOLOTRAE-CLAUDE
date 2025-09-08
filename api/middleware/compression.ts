/**
 * Middleware de compressão para otimizar o tamanho das respostas HTTP
 */
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// =============================================
// CONFIGURAÇÃO DE COMPRESSÃO
// =============================================

interface CompressionConfig {
  threshold: number; // Tamanho mínimo em bytes para comprimir
  level: number; // Nível de compressão (1-9)
  chunkSize: number; // Tamanho do chunk
  windowBits: number; // Tamanho da janela
  memLevel: number; // Nível de memória
  strategy: number; // Estratégia de compressão
}

const COMPRESSION_CONFIG: CompressionConfig = {
  threshold: 1024, // Comprimir apenas respostas > 1KB
  level: 6, // Nível balanceado entre velocidade e compressão
  chunkSize: 16 * 1024, // 16KB chunks
  windowBits: 15,
  memLevel: 8,
  strategy: 0 // Z_DEFAULT_STRATEGY
};

// =============================================
// FILTROS DE COMPRESSÃO
// =============================================

/**
 * Determina se uma requisição deve ser comprimida
 */
function shouldCompress(req: Request, res: Response): boolean {
  // Não comprimir se o cliente não suporta
  if (!req.headers['accept-encoding']?.includes('gzip')) {
    return false;
  }

  // Não comprimir respostas já comprimidas
  if (res.getHeader('content-encoding')) {
    return false;
  }

  // Não comprimir uploads de arquivos
  if (req.path.includes('/upload') || req.path.includes('/files')) {
    return false;
  }

  // Não comprimir streams de dados em tempo real
  if (req.path.includes('/realtime') || req.path.includes('/stream')) {
    return false;
  }

  // Comprimir apenas tipos de conteúdo específicos
  const contentType = res.getHeader('content-type') as string;
  if (contentType) {
    const compressibleTypes = [
      'application/json',
      'application/javascript',
      'text/css',
      'text/html',
      'text/plain',
      'text/xml',
      'application/xml'
    ];
    
    return compressibleTypes.some(type => contentType.includes(type));
  }

  return true;
}

/**
 * Filtro para APIs que devem ter compressão agressiva
 */
function shouldUseHighCompression(req: Request): boolean {
  const highCompressionPaths = [
    '/api/reports',
    '/api/analytics',
    '/api/export',
    '/api/statistics'
  ];
  
  return highCompressionPaths.some(path => req.path.startsWith(path));
}

// =============================================
// MIDDLEWARES DE COMPRESSÃO
// =============================================

/**
 * Middleware de compressão padrão
 */
export const compressionMiddleware = compression({
  threshold: COMPRESSION_CONFIG.threshold,
  level: COMPRESSION_CONFIG.level,
  chunkSize: COMPRESSION_CONFIG.chunkSize,
  windowBits: COMPRESSION_CONFIG.windowBits,
  memLevel: COMPRESSION_CONFIG.memLevel,
  strategy: COMPRESSION_CONFIG.strategy,
  filter: shouldCompress
});

/**
 * Middleware de compressão agressiva para endpoints específicos
 */
export const highCompressionMiddleware = compression({
  threshold: 512, // Comprimir respostas > 512 bytes
  level: 9, // Máxima compressão
  chunkSize: COMPRESSION_CONFIG.chunkSize,
  windowBits: COMPRESSION_CONFIG.windowBits,
  memLevel: COMPRESSION_CONFIG.memLevel,
  strategy: COMPRESSION_CONFIG.strategy,
  filter: (req: Request, res: Response) => {
    return shouldCompress(req, res) && shouldUseHighCompression(req);
  }
});

/**
 * Middleware condicional que aplica compressão baseada no endpoint
 */
export const adaptiveCompressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (shouldUseHighCompression(req)) {
    return highCompressionMiddleware(req, res, next);
  } else {
    return compressionMiddleware(req, res, next);
  }
};

// =============================================
// UTILITÁRIOS DE MONITORAMENTO
// =============================================

/**
 * Middleware para monitorar a eficiência da compressão
 */
export const compressionMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  let originalSize = 0;
  
  // Interceptar res.send
  res.send = function(data: any) {
    if (data) {
      originalSize = Buffer.byteLength(data, 'utf8');
    }
    return originalSend.call(this, data);
  };
  
  // Interceptar res.json
  res.json = function(data: any) {
    if (data) {
      originalSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
    }
    return originalJson.call(this, data);
  };
  
  // Adicionar headers de monitoramento
  res.on('finish', () => {
    const contentEncoding = res.getHeader('content-encoding');
    const contentLength = res.getHeader('content-length');
    
    if (contentEncoding === 'gzip' && originalSize > 0 && contentLength) {
      const compressedSize = parseInt(contentLength as string);
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
      
      // Log da eficiência da compressão
      console.log(`Compression: ${req.method} ${req.path} - Original: ${originalSize}b, Compressed: ${compressedSize}b, Ratio: ${compressionRatio}%`);
      
      // Adicionar headers informativos (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        res.setHeader('X-Original-Size', originalSize);
        res.setHeader('X-Compressed-Size', compressedSize);
        res.setHeader('X-Compression-Ratio', `${compressionRatio}%`);
      }
    }
  });
  
  next();
};

// =============================================
// CONFIGURAÇÃO PARA DIFERENTES AMBIENTES
// =============================================

/**
 * Obter configuração de compressão baseada no ambiente
 */
export function getCompressionConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...COMPRESSION_CONFIG,
        level: 6, // Balanceado para produção
        threshold: 1024
      };
    
    case 'development':
      return {
        ...COMPRESSION_CONFIG,
        level: 1, // Compressão rápida para desenvolvimento
        threshold: 0 // Comprimir tudo para testes
      };
    
    default:
      return COMPRESSION_CONFIG;
  }
}

/**
 * Middleware de compressão configurado para o ambiente atual
 */
export const environmentCompressionMiddleware = compression({
  ...getCompressionConfig(),
  filter: shouldCompress
});

export default compressionMiddleware;