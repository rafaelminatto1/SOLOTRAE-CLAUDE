-- =================================
-- TABELA DE LOGS DE AUDITORIA
-- =================================
-- Criação da tabela para armazenar logs de auditoria completos
-- Compliance com regulamentações médicas (LGPD, CFM, etc.)

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET NOT NULL,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('auth', 'data', 'system', 'security', 'compliance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);

-- Índice composto para consultas comuns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category_timestamp ON audit_logs(category, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity_timestamp ON audit_logs(severity, timestamp DESC);

-- Índice para busca por texto (GIN)
CREATE INDEX IF NOT EXISTS idx_audit_logs_details_gin ON audit_logs USING GIN (details);
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON audit_logs USING GIN (
    to_tsvector('portuguese', 
        COALESCE(action, '') || ' ' || 
        COALESCE(resource_type, '') || ' ' || 
        COALESCE(error_message, '') || ' ' ||
        COALESCE(user_email, '')
    )
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para administradores (acesso total)
CREATE POLICY "Admins can access all audit logs" ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Política para usuários (apenas seus próprios logs)
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'manager')
        )
    );

-- Política para inserção (apenas sistema)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Manter logs por 7 anos (2555 dias) para compliance médico
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '2555 days';
    
    -- Log da operação de limpeza
    INSERT INTO audit_logs (
        action, 
        resource_type, 
        details, 
        ip_address, 
        user_agent, 
        success, 
        severity, 
        category
    ) VALUES (
        'cleanup_old_logs',
        'system',
        jsonb_build_object('retention_days', 2555),
        '127.0.0.1',
        'system-cron',
        true,
        'low',
        'system'
    );
END;
$$;

-- Função para obter estatísticas de auditoria
CREATE OR REPLACE FUNCTION get_audit_stats(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_logs BIGINT,
    success_rate NUMERIC,
    by_category JSONB,
    by_severity JSONB,
    by_action JSONB,
    top_users JSONB,
    error_summary JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE success = true) as successes,
            jsonb_object_agg(category, cnt) as categories,
            jsonb_object_agg(severity, sev_cnt) as severities,
            jsonb_object_agg(action, act_cnt) as actions
        FROM (
            SELECT 
                category,
                severity,
                action,
                COUNT(*) as cnt,
                COUNT(*) as sev_cnt,
                COUNT(*) as act_cnt
            FROM audit_logs 
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY category, severity, action
        ) grouped
    ),
    user_stats AS (
        SELECT jsonb_object_agg(user_email, log_count) as top_users
        FROM (
            SELECT 
                COALESCE(user_email, 'anonymous') as user_email,
                COUNT(*) as log_count
            FROM audit_logs 
            WHERE timestamp BETWEEN start_date AND end_date
            GROUP BY user_email
            ORDER BY log_count DESC
            LIMIT 10
        ) top_users_query
    ),
    error_stats AS (
        SELECT jsonb_object_agg(error_type, error_count) as errors
        FROM (
            SELECT 
                COALESCE(LEFT(error_message, 50), 'No error') as error_type,
                COUNT(*) as error_count
            FROM audit_logs 
            WHERE timestamp BETWEEN start_date AND end_date
            AND success = false
            GROUP BY LEFT(error_message, 50)
            ORDER BY error_count DESC
            LIMIT 10
        ) error_query
    )
    SELECT 
        stats.total,
        ROUND((stats.successes::NUMERIC / NULLIF(stats.total, 0)) * 100, 2),
        stats.categories,
        stats.severities,
        stats.actions,
        user_stats.top_users,
        error_stats.errors
    FROM stats, user_stats, error_stats;
END;
$$;

-- Função para busca avançada em logs
CREATE OR REPLACE FUNCTION search_audit_logs(
    search_term TEXT DEFAULT '',
    filter_category TEXT DEFAULT NULL,
    filter_severity TEXT DEFAULT NULL,
    filter_user_id UUID DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW(),
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    user_email TEXT,
    action TEXT,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMPTZ,
    success BOOLEAN,
    error_message TEXT,
    severity TEXT,
    category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.user_email,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.ip_address,
        al.timestamp,
        al.success,
        al.error_message,
        al.severity,
        al.category
    FROM audit_logs al
    WHERE 
        al.timestamp BETWEEN start_date AND end_date
        AND (filter_category IS NULL OR al.category = filter_category)
        AND (filter_severity IS NULL OR al.severity = filter_severity)
        AND (filter_user_id IS NULL OR al.user_id = filter_user_id)
        AND (
            search_term = '' OR
            to_tsvector('portuguese', 
                COALESCE(al.action, '') || ' ' || 
                COALESCE(al.resource_type, '') || ' ' || 
                COALESCE(al.error_message, '') || ' ' ||
                COALESCE(al.user_email, '')
            ) @@ plainto_tsquery('portuguese', search_term)
        )
    ORDER BY al.timestamp DESC
    LIMIT limit_count;
END;
$$;

-- Trigger para validação de dados
CREATE OR REPLACE FUNCTION validate_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar IP address
    IF NEW.ip_address IS NULL THEN
        NEW.ip_address := '0.0.0.0'::INET;
    END IF;
    
    -- Validar timestamp
    IF NEW.timestamp IS NULL THEN
        NEW.timestamp := NOW();
    END IF;
    
    -- Limitar tamanho do error_message
    IF LENGTH(NEW.error_message) > 1000 THEN
        NEW.error_message := LEFT(NEW.error_message, 997) || '...';
    END IF;
    
    -- Limitar tamanho do user_agent
    IF LENGTH(NEW.user_agent) > 500 THEN
        NEW.user_agent := LEFT(NEW.user_agent, 497) || '...';
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_audit_log_trigger
    BEFORE INSERT OR UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION validate_audit_log();

-- Comentários para documentação
COMMENT ON TABLE audit_logs IS 'Tabela de logs de auditoria para compliance e segurança';
COMMENT ON COLUMN audit_logs.user_id IS 'ID do usuário que executou a ação';
COMMENT ON COLUMN audit_logs.action IS 'Ação executada (login, create, update, delete, etc.)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso afetado (users, patients, appointments, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID específico do recurso afetado';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes adicionais da ação em formato JSON';
COMMENT ON COLUMN audit_logs.severity IS 'Nível de severidade: low, medium, high, critical';
COMMENT ON COLUMN audit_logs.category IS 'Categoria: auth, data, system, security, compliance';

-- Conceder permissões
GRANT SELECT ON audit_logs TO anon;
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO service_role;
GRANT ALL ON audit_logs TO service_role;

-- Conceder permissões nas funções
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_stats(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION search_audit_logs(TEXT, TEXT, TEXT, UUID, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO authenticated;

-- Criar job para limpeza automática (executar mensalmente)
-- Nota: Isso requer a extensão pg_cron que deve ser habilitada pelo administrador
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 1 * *', 'SELECT cleanup_old_audit_logs();');

COMMIT;