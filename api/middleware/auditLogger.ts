/**
 * Sistema de Logs de Auditoria
 * Registra todas as ações críticas do sistema para compliance e segurança
 */
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Tipos para logs de auditoria
export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  session_id?: string;
  success: boolean;
  error_message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'system' | 'security' | 'compliance';
}

// Configurações de auditoria
const AUDIT_CONFIG = {
  // Ações que sempre devem ser auditadas
  CRITICAL_ACTIONS: [
    'login',
    'logout',
    'password_change',
    'password_reset',
    'user_create',
    'user_delete',
    'user_role_change',
    'data_export',
    'data_import',
    'backup_create',
    'backup_restore',
    'system_config_change',
    'security_setting_change'
  ],
  
  // Recursos sensíveis
  SENSITIVE_RESOURCES: [
    'users',
    'patients',
    'appointments',
    'medical_records',
    'payments',
    'system_config',
    'audit_logs'
  ],
  
  // Configurações de retenção
  RETENTION_DAYS: 2555, // 7 anos para compliance médico
  
  // Configurações de performance
  BATCH_SIZE: 100,
  FLUSH_INTERVAL: 5000, // 5 segundos
};

/**
 * Classe principal do sistema de auditoria
 */
export class AuditLogger {
  private supabase: any;
  private logQueue: AuditLogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Inicializar cliente Supabase para logs
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.warn('⚠️ Supabase não configurado para logs de auditoria');
      this.isEnabled = false;
    }

    // Iniciar timer de flush
    this.startFlushTimer();
    
    // Graceful shutdown
    process.on('SIGINT', () => this.flush());
    process.on('SIGTERM', () => this.flush());
  }

  /**
   * Registrar uma ação de auditoria
   */
  async log(entry: Partial<AuditLogEntry>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const auditEntry: AuditLogEntry = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        success: true,
        severity: 'medium',
        category: 'system',
        ...entry
      };

      // Adicionar à fila
      this.logQueue.push(auditEntry);

      // Log local para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Audit Log:', {
          action: auditEntry.action,
          user: auditEntry.user_email || auditEntry.user_id,
          resource: `${auditEntry.resource_type}:${auditEntry.resource_id}`,
          success: auditEntry.success,
          severity: auditEntry.severity
        });
      }

      // Flush se a fila estiver cheia
      if (this.logQueue.length >= AUDIT_CONFIG.BATCH_SIZE) {
        await this.flush();
      }
    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Flush dos logs para o banco de dados
   */
  async flush(): Promise<void> {
    if (!this.isEnabled || this.logQueue.length === 0) return;

    try {
      const logsToFlush = [...this.logQueue];
      this.logQueue = [];

      // Inserir no Supabase
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(logsToFlush);

      if (error) {
        console.error('❌ Erro ao salvar logs de auditoria:', error);
        // Recolocar na fila em caso de erro
        this.logQueue.unshift(...logsToFlush);
      } else {
        console.log(`✅ ${logsToFlush.length} logs de auditoria salvos`);
      }
    } catch (error) {
      console.error('❌ Erro crítico no flush de auditoria:', error);
    }
  }

  /**
   * Iniciar timer de flush automático
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, AUDIT_CONFIG.FLUSH_INTERVAL);
  }

  /**
   * Gerar ID único para o log
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verificar se uma ação deve ser auditada
   */
  shouldAudit(action: string, resourceType?: string): boolean {
    return (
      AUDIT_CONFIG.CRITICAL_ACTIONS.includes(action) ||
      (resourceType && AUDIT_CONFIG.SENSITIVE_RESOURCES.includes(resourceType))
    );
  }

  /**
   * Obter estatísticas de auditoria
   */
  async getStats(): Promise<any> {
    if (!this.isEnabled) return { enabled: false };

    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('category, severity, success')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        enabled: true,
        queueSize: this.logQueue.length,
        last24Hours: {
          total: data.length,
          byCategory: this.groupBy(data, 'category'),
          bySeverity: this.groupBy(data, 'severity'),
          successRate: data.filter(log => log.success).length / data.length
        }
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de auditoria:', error);
      return { enabled: true, error: error.message };
    }
  }

  /**
   * Utilitário para agrupar dados
   */
  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const group = item[key] || 'unknown';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Limpar logs antigos (para compliance)
   */
  async cleanupOldLogs(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const cutoffDate = new Date(
        Date.now() - AUDIT_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate);

      if (error) {
        console.error('Erro ao limpar logs antigos:', error);
      } else {
        console.log('✅ Logs antigos removidos com sucesso');
      }
    } catch (error) {
      console.error('Erro crítico na limpeza de logs:', error);
    }
  }
}

// Instância global do logger
export const auditLogger = new AuditLogger();

/**
 * Middleware para auditoria automática de requisições
 */
export function auditMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const sessionId = req.sessionID || req.get('X-Session-ID');

    // Interceptar resposta para log
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const success = statusCode < 400;

      // Determinar se deve auditar
      const action = `${method.toLowerCase()}_${url.split('/').pop() || 'unknown'}`;
      const resourceType = extractResourceType(url);
      const resourceId = extractResourceId(url);

      if (auditLogger.shouldAudit(action, resourceType) || !success) {
        const severity = determineSeverity(method, url, statusCode);
        const category = determineCategory(url);

        auditLogger.log({
          user_id: userId,
          user_email: userEmail,
          action,
          resource_type: resourceType || 'unknown',
          resource_id: resourceId,
          details: {
            method,
            url,
            statusCode,
            duration,
            bodySize: typeof body === 'string' ? body.length : 0
          },
          ip_address: ip,
          user_agent: userAgent,
          session_id: sessionId,
          success,
          error_message: !success ? extractErrorMessage(body) : undefined,
          severity,
          category
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

/**
 * Utilitários para extração de informações
 */
function extractResourceType(url: string): string | undefined {
  const segments = url.split('/').filter(Boolean);
  if (segments.length >= 2 && segments[0] === 'api') {
    return segments[1];
  }
  return undefined;
}

function extractResourceId(url: string): string | undefined {
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Verificar se é um ID (número ou UUID)
  if (/^\d+$/.test(lastSegment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment)) {
    return lastSegment;
  }
  
  return undefined;
}

function determineSeverity(method: string, url: string, statusCode: number): AuditLogEntry['severity'] {
  if (statusCode >= 500) return 'critical';
  if (statusCode >= 400) return 'high';
  if (method === 'DELETE') return 'high';
  if (url.includes('/auth/') || url.includes('/admin/')) return 'high';
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') return 'medium';
  return 'low';
}

function determineCategory(url: string): AuditLogEntry['category'] {
  if (url.includes('/auth/')) return 'auth';
  if (url.includes('/admin/') || url.includes('/system/')) return 'system';
  if (url.includes('/security/')) return 'security';
  if (url.includes('/export/') || url.includes('/import/')) return 'compliance';
  return 'data';
}

function extractErrorMessage(body: any): string | undefined {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return parsed.error || parsed.message;
    } catch {
      return body.substring(0, 200);
    }
  }
  return undefined;
}

/**
 * Funções de conveniência para logging manual
 */
export const auditLog = {
  // Autenticação
  login: (userId: string, userEmail: string, ip: string, success: boolean, error?: string) => {
    auditLogger.log({
      user_id: userId,
      user_email: userEmail,
      action: 'login',
      resource_type: 'auth',
      ip_address: ip,
      user_agent: 'system',
      success,
      error_message: error,
      severity: success ? 'medium' : 'high',
      category: 'auth'
    });
  },

  logout: (userId: string, userEmail: string, ip: string) => {
    auditLogger.log({
      user_id: userId,
      user_email: userEmail,
      action: 'logout',
      resource_type: 'auth',
      ip_address: ip,
      user_agent: 'system',
      success: true,
      severity: 'low',
      category: 'auth'
    });
  },

  // Dados sensíveis
  dataAccess: (userId: string, resourceType: string, resourceId: string, action: string, ip: string) => {
    auditLogger.log({
      user_id: userId,
      action: `data_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: ip,
      user_agent: 'system',
      success: true,
      severity: 'medium',
      category: 'data'
    });
  },

  // Alterações de sistema
  systemChange: (userId: string, action: string, details: any, ip: string) => {
    auditLogger.log({
      user_id: userId,
      action,
      resource_type: 'system',
      details,
      ip_address: ip,
      user_agent: 'system',
      success: true,
      severity: 'high',
      category: 'system'
    });
  },

  // Eventos de segurança
  securityEvent: (userId: string | undefined, action: string, details: any, ip: string, severity: AuditLogEntry['severity'] = 'high') => {
    auditLogger.log({
      user_id: userId,
      action,
      resource_type: 'security',
      details,
      ip_address: ip,
      user_agent: 'system',
      success: false,
      severity,
      category: 'security'
    });
  }
};

export default {
  auditLogger,
  auditMiddleware,
  auditLog,
  AUDIT_CONFIG
};