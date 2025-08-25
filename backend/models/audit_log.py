# -*- coding: utf-8 -*-
"""
Model de Log de Auditoria
Sistema FisioFlow - Auditoria e Compliance LGPD
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
import json
from typing import Dict, Any, Optional

class ActionType(enum.Enum):
    """Enum para tipos de ação"""
    # CRUD Operations
    CREATE = "CREATE"  # Criação
    READ = "READ"  # Leitura
    UPDATE = "UPDATE"  # Atualização
    DELETE = "DELETE"  # Exclusão
    
    # Authentication
    LOGIN = "LOGIN"  # Login
    LOGOUT = "LOGOUT"  # Logout
    LOGIN_FAILED = "LOGIN_FAILED"  # Falha no login
    PASSWORD_CHANGE = "PASSWORD_CHANGE"  # Mudança de senha
    PASSWORD_RESET = "PASSWORD_RESET"  # Reset de senha
    TWO_FACTOR_ENABLE = "TWO_FACTOR_ENABLE"  # Ativação 2FA
    TWO_FACTOR_DISABLE = "TWO_FACTOR_DISABLE"  # Desativação 2FA
    
    # Authorization
    ACCESS_GRANTED = "ACCESS_GRANTED"  # Acesso concedido
    ACCESS_DENIED = "ACCESS_DENIED"  # Acesso negado
    PERMISSION_CHANGE = "PERMISSION_CHANGE"  # Mudança de permissão
    
    # Data Operations
    EXPORT = "EXPORT"  # Exportação de dados
    IMPORT = "IMPORT"  # Importação de dados
    BACKUP = "BACKUP"  # Backup
    RESTORE = "RESTORE"  # Restauração
    
    # LGPD Operations
    CONSENT_GIVEN = "CONSENT_GIVEN"  # Consentimento dado
    CONSENT_WITHDRAWN = "CONSENT_WITHDRAWN"  # Consentimento retirado
    DATA_PORTABILITY = "DATA_PORTABILITY"  # Portabilidade de dados
    RIGHT_TO_FORGET = "RIGHT_TO_FORGET"  # Direito ao esquecimento
    DATA_CORRECTION = "DATA_CORRECTION"  # Correção de dados
    DATA_ACCESS_REQUEST = "DATA_ACCESS_REQUEST"  # Solicitação de acesso aos dados
    
    # Financial Operations
    PAYMENT_PROCESSED = "PAYMENT_PROCESSED"  # Pagamento processado
    REFUND_PROCESSED = "REFUND_PROCESSED"  # Reembolso processado
    TRANSACTION_CANCELLED = "TRANSACTION_CANCELLED"  # Transação cancelada
    
    # Medical Operations
    MEDICAL_RECORD_ACCESS = "MEDICAL_RECORD_ACCESS"  # Acesso a prontuário
    PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED"  # Prescrição criada
    EVOLUTION_RECORDED = "EVOLUTION_RECORDED"  # Evolução registrada
    
    # System Operations
    SYSTEM_CONFIG_CHANGE = "SYSTEM_CONFIG_CHANGE"  # Mudança de configuração
    MAINTENANCE_MODE = "MAINTENANCE_MODE"  # Modo manutenção
    DATA_MIGRATION = "DATA_MIGRATION"  # Migração de dados
    
    # Security Events
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"  # Atividade suspeita
    SECURITY_BREACH = "SECURITY_BREACH"  # Violação de segurança
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"  # Limite de taxa excedido
    
    # Other
    OTHER = "OTHER"  # Outros

class EntityType(enum.Enum):
    """Enum para tipos de entidade"""
    USER = "USER"  # Usuário
    PATIENT = "PATIENT"  # Paciente
    APPOINTMENT = "APPOINTMENT"  # Consulta
    EXERCISE = "EXERCISE"  # Exercício
    PRESCRIPTION = "PRESCRIPTION"  # Prescrição
    MEDICAL_RECORD = "MEDICAL_RECORD"  # Prontuário
    EVOLUTION = "EVOLUTION"  # Evolução
    AI_CONSULTATION = "AI_CONSULTATION"  # Consulta IA
    PARTNER = "PARTNER"  # Parceiro
    VOUCHER = "VOUCHER"  # Voucher
    FINANCIAL_TRANSACTION = "FINANCIAL_TRANSACTION"  # Transação financeira
    SYSTEM = "SYSTEM"  # Sistema
    OTHER = "OTHER"  # Outros

class SeverityLevel(enum.Enum):
    """Enum para níveis de severidade"""
    LOW = "LOW"  # Baixo
    MEDIUM = "MEDIUM"  # Médio
    HIGH = "HIGH"  # Alto
    CRITICAL = "CRITICAL"  # Crítico

class AuditLog(db.Model):
    """Model para logs de auditoria"""
    
    __tablename__ = 'audit_logs'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO DA AÇÃO ===
    
    # Tipo e descrição
    action_type = Column(Enum(ActionType), nullable=False, index=True)
    action_description = Column(String(500), nullable=False)  # Descrição da ação
    
    # Entidade afetada
    entity_type = Column(Enum(EntityType), nullable=True, index=True)
    entity_id = Column(String(50), nullable=True, index=True)  # ID da entidade (string para flexibilidade)
    entity_name = Column(String(200), nullable=True)  # Nome/descrição da entidade
    
    # === USUÁRIO E SESSÃO ===
    
    # Usuário que executou a ação
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)  # Email do usuário (para casos de usuário deletado)
    user_name = Column(String(200), nullable=True)  # Nome do usuário
    user_role = Column(String(50), nullable=True)  # Perfil do usuário
    
    # Dados da sessão
    session_id = Column(String(200), nullable=True, index=True)  # ID da sessão
    request_id = Column(String(200), nullable=True, index=True)  # ID da requisição
    
    # === DADOS TÉCNICOS ===
    
    # Informações de rede
    ip_address = Column(String(45), nullable=True, index=True)  # IPv4 ou IPv6
    user_agent = Column(Text, nullable=True)  # User agent
    referer = Column(String(500), nullable=True)  # Página de origem
    
    # Informações da requisição
    http_method = Column(String(10), nullable=True)  # GET, POST, PUT, DELETE
    endpoint = Column(String(500), nullable=True)  # Endpoint acessado
    request_params = Column(JSON, nullable=True)  # Parâmetros da requisição
    response_status = Column(Integer, nullable=True)  # Status HTTP da resposta
    
    # === DADOS DA AÇÃO ===
    
    # Estado anterior e novo
    old_values = Column(JSON, nullable=True)  # Valores anteriores (para UPDATE/DELETE)
    new_values = Column(JSON, nullable=True)  # Novos valores (para CREATE/UPDATE)
    
    # Dados adicionais
    additional_data = Column(JSON, nullable=True)  # Dados adicionais específicos da ação
    
    # === CLASSIFICAÇÃO ===
    
    # Severidade e categorização
    severity = Column(Enum(SeverityLevel), default=SeverityLevel.LOW, nullable=False, index=True)
    is_sensitive = Column(Boolean, default=False, nullable=False, index=True)  # Dados sensíveis
    is_lgpd_relevant = Column(Boolean, default=False, nullable=False, index=True)  # Relevante para LGPD
    is_security_event = Column(Boolean, default=False, nullable=False, index=True)  # Evento de segurança
    
    # Tags para categorização
    tags = Column(JSON, nullable=True)  # Tags para busca e categorização
    
    # === RESULTADO E STATUS ===
    
    # Resultado da ação
    success = Column(Boolean, default=True, nullable=False, index=True)  # Sucesso da ação
    error_message = Column(Text, nullable=True)  # Mensagem de erro (se houver)
    error_code = Column(String(50), nullable=True)  # Código do erro
    
    # Duração
    duration_ms = Column(Integer, nullable=True)  # Duração em milissegundos
    
    # === CONTEXTO LGPD ===
    
    # Base legal
    legal_basis = Column(String(100), nullable=True)  # Base legal LGPD
    consent_id = Column(String(200), nullable=True)  # ID do consentimento
    data_subject_id = Column(Integer, nullable=True)  # ID do titular dos dados
    
    # Finalidade
    processing_purpose = Column(String(500), nullable=True)  # Finalidade do processamento
    data_categories = Column(JSON, nullable=True)  # Categorias de dados processados
    
    # === GEOLOCALIZAÇÃO ===
    
    # Localização
    country = Column(String(2), nullable=True)  # Código do país (ISO 3166-1)
    region = Column(String(100), nullable=True)  # Estado/região
    city = Column(String(100), nullable=True)  # Cidade
    timezone = Column(String(50), nullable=True)  # Fuso horário
    
    # === DISPOSITIVO E APLICAÇÃO ===
    
    # Informações do dispositivo
    device_type = Column(String(50), nullable=True)  # desktop, mobile, tablet
    device_os = Column(String(100), nullable=True)  # Sistema operacional
    browser = Column(String(100), nullable=True)  # Navegador
    app_version = Column(String(50), nullable=True)  # Versão da aplicação
    
    # === RETENÇÃO E ARQUIVAMENTO ===
    
    # Controle de retenção
    retention_period_days = Column(Integer, nullable=True)  # Período de retenção em dias
    archive_date = Column(DateTime, nullable=True)  # Data para arquivamento
    delete_date = Column(DateTime, nullable=True)  # Data para exclusão
    is_archived = Column(Boolean, default=False, nullable=False, index=True)  # Arquivado
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    timestamp = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    user = relationship('User', foreign_keys=[user_id])
    
    def __init__(self, **kwargs):
        super(AuditLog, self).__init__(**kwargs)
        if not self.timestamp:
            self.timestamp = datetime.now(pytz.UTC)
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        
        # Definir período de retenção baseado na severidade e tipo
        if not self.retention_period_days:
            self.set_default_retention_period()
            
    def set_default_retention_period(self):
        """Define período de retenção padrão baseado no tipo e severidade"""
        # Períodos padrão em dias
        if self.is_lgpd_relevant or self.is_security_event:
            # Dados LGPD e eventos de segurança: 5 anos
            self.retention_period_days = 1825
        elif self.severity == SeverityLevel.CRITICAL:
            # Eventos críticos: 3 anos
            self.retention_period_days = 1095
        elif self.severity == SeverityLevel.HIGH:
            # Eventos de alta severidade: 2 anos
            self.retention_period_days = 730
        elif self.action_type in [ActionType.LOGIN, ActionType.LOGOUT, ActionType.ACCESS_GRANTED]:
            # Logs de acesso: 1 ano
            self.retention_period_days = 365
        else:
            # Outros logs: 6 meses
            self.retention_period_days = 180
            
        # Calcular datas de arquivamento e exclusão
        if self.retention_period_days:
            from datetime import timedelta
            self.archive_date = self.timestamp + timedelta(days=self.retention_period_days - 30)  # Arquivar 30 dias antes
            self.delete_date = self.timestamp + timedelta(days=self.retention_period_days)
            
    @property
    def action_type_display(self) -> str:
        """Retorna o tipo de ação formatado"""
        action_names = {
            # CRUD
            ActionType.CREATE: "Criação",
            ActionType.READ: "Leitura",
            ActionType.UPDATE: "Atualização",
            ActionType.DELETE: "Exclusão",
            
            # Autenticação
            ActionType.LOGIN: "Login",
            ActionType.LOGOUT: "Logout",
            ActionType.LOGIN_FAILED: "Falha no Login",
            ActionType.PASSWORD_CHANGE: "Mudança de Senha",
            ActionType.PASSWORD_RESET: "Reset de Senha",
            ActionType.TWO_FACTOR_ENABLE: "Ativação 2FA",
            ActionType.TWO_FACTOR_DISABLE: "Desativação 2FA",
            
            # Autorização
            ActionType.ACCESS_GRANTED: "Acesso Concedido",
            ActionType.ACCESS_DENIED: "Acesso Negado",
            ActionType.PERMISSION_CHANGE: "Mudança de Permissão",
            
            # Dados
            ActionType.EXPORT: "Exportação",
            ActionType.IMPORT: "Importação",
            ActionType.BACKUP: "Backup",
            ActionType.RESTORE: "Restauração",
            
            # LGPD
            ActionType.CONSENT_GIVEN: "Consentimento Dado",
            ActionType.CONSENT_WITHDRAWN: "Consentimento Retirado",
            ActionType.DATA_PORTABILITY: "Portabilidade de Dados",
            ActionType.RIGHT_TO_FORGET: "Direito ao Esquecimento",
            ActionType.DATA_CORRECTION: "Correção de Dados",
            ActionType.DATA_ACCESS_REQUEST: "Solicitação de Acesso",
            
            # Financeiro
            ActionType.PAYMENT_PROCESSED: "Pagamento Processado",
            ActionType.REFUND_PROCESSED: "Reembolso Processado",
            ActionType.TRANSACTION_CANCELLED: "Transação Cancelada",
            
            # Médico
            ActionType.MEDICAL_RECORD_ACCESS: "Acesso a Prontuário",
            ActionType.PRESCRIPTION_CREATED: "Prescrição Criada",
            ActionType.EVOLUTION_RECORDED: "Evolução Registrada",
            
            # Sistema
            ActionType.SYSTEM_CONFIG_CHANGE: "Mudança de Configuração",
            ActionType.MAINTENANCE_MODE: "Modo Manutenção",
            ActionType.DATA_MIGRATION: "Migração de Dados",
            
            # Segurança
            ActionType.SUSPICIOUS_ACTIVITY: "Atividade Suspeita",
            ActionType.SECURITY_BREACH: "Violação de Segurança",
            ActionType.RATE_LIMIT_EXCEEDED: "Limite de Taxa Excedido",
            
            ActionType.OTHER: "Outros"
        }
        return action_names.get(self.action_type, self.action_type.value)
        
    @property
    def entity_type_display(self) -> str:
        """Retorna o tipo de entidade formatado"""
        entity_names = {
            EntityType.USER: "Usuário",
            EntityType.PATIENT: "Paciente",
            EntityType.APPOINTMENT: "Consulta",
            EntityType.EXERCISE: "Exercício",
            EntityType.PRESCRIPTION: "Prescrição",
            EntityType.MEDICAL_RECORD: "Prontuário",
            EntityType.EVOLUTION: "Evolução",
            EntityType.AI_CONSULTATION: "Consulta IA",
            EntityType.PARTNER: "Parceiro",
            EntityType.VOUCHER: "Voucher",
            EntityType.FINANCIAL_TRANSACTION: "Transação Financeira",
            EntityType.SYSTEM: "Sistema",
            EntityType.OTHER: "Outros"
        }
        return entity_names.get(self.entity_type, self.entity_type.value if self.entity_type else "N/A")
        
    @property
    def severity_display(self) -> str:
        """Retorna a severidade formatada"""
        severity_names = {
            SeverityLevel.LOW: "Baixo",
            SeverityLevel.MEDIUM: "Médio",
            SeverityLevel.HIGH: "Alto",
            SeverityLevel.CRITICAL: "Crítico"
        }
        return severity_names.get(self.severity, self.severity.value)
        
    @property
    def is_expired(self) -> bool:
        """Verifica se o log expirou"""
        if not self.delete_date:
            return False
        return datetime.now(pytz.UTC) > self.delete_date.replace(tzinfo=pytz.UTC)
        
    @property
    def should_be_archived(self) -> bool:
        """Verifica se o log deve ser arquivado"""
        if not self.archive_date or self.is_archived:
            return False
        return datetime.now(pytz.UTC) > self.archive_date.replace(tzinfo=pytz.UTC)
        
    def get_old_values(self) -> dict:
        """Retorna os valores anteriores"""
        return self.old_values or {}
        
    def get_new_values(self) -> dict:
        """Retorna os novos valores"""
        return self.new_values or {}
        
    def get_additional_data(self) -> dict:
        """Retorna dados adicionais"""
        return self.additional_data or {}
        
    def get_request_params(self) -> dict:
        """Retorna parâmetros da requisição"""
        return self.request_params or {}
        
    def get_tags(self) -> list:
        """Retorna as tags"""
        return self.tags or []
        
    def get_data_categories(self) -> list:
        """Retorna categorias de dados"""
        return self.data_categories or []
        
    def add_tag(self, tag: str):
        """Adiciona uma tag"""
        tags = self.get_tags()
        if tag not in tags:
            tags.append(tag)
            self.tags = tags
            
    def add_data_category(self, category: str):
        """Adiciona categoria de dados"""
        categories = self.get_data_categories()
        if category not in categories:
            categories.append(category)
            self.data_categories = categories
            
    def set_old_values(self, values: dict):
        """Define valores anteriores"""
        self.old_values = self._sanitize_values(values)
        
    def set_new_values(self, values: dict):
        """Define novos valores"""
        self.new_values = self._sanitize_values(values)
        
    def set_additional_data(self, data: dict):
        """Define dados adicionais"""
        self.additional_data = data
        
    def _sanitize_values(self, values: dict) -> dict:
        """Remove dados sensíveis dos valores"""
        if not values:
            return {}
            
        sanitized = {}
        sensitive_fields = [
            'password', 'senha', 'token', 'secret', 'key', 'cpf', 'rg',
            'credit_card', 'card_number', 'cvv', 'pix_key', 'bank_account'
        ]
        
        for key, value in values.items():
            key_lower = key.lower()
            if any(sensitive in key_lower for sensitive in sensitive_fields):
                sanitized[key] = "[REDACTED]"
            elif isinstance(value, str) and len(value) > 1000:
                # Truncar valores muito longos
                sanitized[key] = value[:1000] + "...[TRUNCATED]"
            else:
                sanitized[key] = value
                
        return sanitized
        
    def archive(self):
        """Arquiva o log"""
        self.is_archived = True
        
    def extend_retention(self, additional_days: int):
        """Estende o período de retenção"""
        if self.retention_period_days:
            self.retention_period_days += additional_days
            
            from datetime import timedelta
            if self.archive_date:
                self.archive_date += timedelta(days=additional_days)
            if self.delete_date:
                self.delete_date += timedelta(days=additional_days)
                
    @classmethod
    def log_action(
        cls,
        action_type: ActionType,
        description: str,
        user_id: Optional[int] = None,
        entity_type: Optional[EntityType] = None,
        entity_id: Optional[str] = None,
        entity_name: Optional[str] = None,
        old_values: Optional[dict] = None,
        new_values: Optional[dict] = None,
        additional_data: Optional[dict] = None,
        severity: SeverityLevel = SeverityLevel.LOW,
        is_sensitive: bool = False,
        is_lgpd_relevant: bool = False,
        is_security_event: bool = False,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_id: Optional[str] = None,
        request_id: Optional[str] = None,
        http_method: Optional[str] = None,
        endpoint: Optional[str] = None,
        request_params: Optional[dict] = None,
        response_status: Optional[int] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        error_code: Optional[str] = None,
        duration_ms: Optional[int] = None,
        legal_basis: Optional[str] = None,
        consent_id: Optional[str] = None,
        data_subject_id: Optional[int] = None,
        processing_purpose: Optional[str] = None,
        data_categories: Optional[list] = None,
        tags: Optional[list] = None
    ) -> 'AuditLog':
        """Cria um log de auditoria"""
        
        log = cls(
            action_type=action_type,
            action_description=description,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            entity_name=entity_name,
            user_id=user_id,
            severity=severity,
            is_sensitive=is_sensitive,
            is_lgpd_relevant=is_lgpd_relevant,
            is_security_event=is_security_event,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            request_id=request_id,
            http_method=http_method,
            endpoint=endpoint,
            request_params=request_params,
            response_status=response_status,
            success=success,
            error_message=error_message,
            error_code=error_code,
            duration_ms=duration_ms,
            legal_basis=legal_basis,
            consent_id=consent_id,
            data_subject_id=data_subject_id,
            processing_purpose=processing_purpose,
            data_categories=data_categories,
            tags=tags
        )
        
        if old_values:
            log.set_old_values(old_values)
        if new_values:
            log.set_new_values(new_values)
        if additional_data:
            log.set_additional_data(additional_data)
            
        return log
        
    @classmethod
    def get_by_user(cls, user_id: int, limit: int = 100):
        """Busca logs por usuário"""
        return cls.query.filter_by(user_id=user_id).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_entity(cls, entity_type: EntityType, entity_id: str, limit: int = 100):
        """Busca logs por entidade"""
        return cls.query.filter(
            cls.entity_type == entity_type,
            cls.entity_id == entity_id
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_action_type(cls, action_type: ActionType, limit: int = 100):
        """Busca logs por tipo de ação"""
        return cls.query.filter_by(action_type=action_type).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_period(cls, start_date: datetime, end_date: datetime):
        """Busca logs por período"""
        return cls.query.filter(
            cls.timestamp >= start_date,
            cls.timestamp <= end_date
        ).order_by(cls.timestamp.desc()).all()
        
    @classmethod
    def get_security_events(cls, limit: int = 100):
        """Busca eventos de segurança"""
        return cls.query.filter_by(is_security_event=True).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_lgpd_relevant(cls, limit: int = 100):
        """Busca logs relevantes para LGPD"""
        return cls.query.filter_by(is_lgpd_relevant=True).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_failed_actions(cls, limit: int = 100):
        """Busca ações que falharam"""
        return cls.query.filter_by(success=False).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_severity(cls, severity: SeverityLevel, limit: int = 100):
        """Busca logs por severidade"""
        return cls.query.filter_by(severity=severity).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_expired_logs(cls):
        """Busca logs expirados"""
        now = datetime.now(pytz.UTC)
        return cls.query.filter(
            cls.delete_date.isnot(None),
            cls.delete_date < now
        ).all()
        
    @classmethod
    def get_logs_to_archive(cls):
        """Busca logs que devem ser arquivados"""
        now = datetime.now(pytz.UTC)
        return cls.query.filter(
            cls.archive_date.isnot(None),
            cls.archive_date < now,
            cls.is_archived == False
        ).all()
        
    @classmethod
    def cleanup_expired_logs(cls) -> int:
        """Remove logs expirados"""
        expired_logs = cls.get_expired_logs()
        count = len(expired_logs)
        
        for log in expired_logs:
            db.session.delete(log)
            
        db.session.commit()
        return count
        
    @classmethod
    def archive_old_logs(cls) -> int:
        """Arquiva logs antigos"""
        logs_to_archive = cls.get_logs_to_archive()
        count = len(logs_to_archive)
        
        for log in logs_to_archive:
            log.archive()
            
        db.session.commit()
        return count
        
    @classmethod
    def get_statistics(cls, start_date: datetime = None, end_date: datetime = None) -> dict:
        """Retorna estatísticas dos logs"""
        query = cls.query
        
        if start_date:
            query = query.filter(cls.timestamp >= start_date)
        if end_date:
            query = query.filter(cls.timestamp <= end_date)
            
        logs = query.all()
        
        # Estatísticas gerais
        total_logs = len(logs)
        successful_actions = len([l for l in logs if l.success])
        failed_actions = len([l for l in logs if not l.success])
        
        # Por tipo de ação
        by_action_type = {}
        for log in logs:
            action = log.action_type.value
            by_action_type[action] = by_action_type.get(action, 0) + 1
            
        # Por severidade
        by_severity = {}
        for log in logs:
            severity = log.severity.value
            by_severity[severity] = by_severity.get(severity, 0) + 1
            
        # Por usuário
        by_user = {}
        for log in logs:
            if log.user_id:
                by_user[log.user_id] = by_user.get(log.user_id, 0) + 1
                
        # Eventos especiais
        security_events = len([l for l in logs if l.is_security_event])
        lgpd_events = len([l for l in logs if l.is_lgpd_relevant])
        sensitive_data_access = len([l for l in logs if l.is_sensitive])
        
        return {
            'total_logs': total_logs,
            'successful_actions': successful_actions,
            'failed_actions': failed_actions,
            'success_rate': (successful_actions / total_logs * 100) if total_logs > 0 else 0,
            'by_action_type': by_action_type,
            'by_severity': by_severity,
            'by_user': by_user,
            'security_events': security_events,
            'lgpd_events': lgpd_events,
            'sensitive_data_access': sensitive_data_access,
            'period': {
                'start_date': start_date.isoformat() if start_date else None,
                'end_date': end_date.isoformat() if end_date else None
            }
        }
        
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte o log para dicionário"""
        data = {
            'id': self.id,
            'action_type': self.action_type.value,
            'action_type_display': self.action_type_display,
            'action_description': self.action_description,
            'entity_type': self.entity_type.value if self.entity_type else None,
            'entity_type_display': self.entity_type_display,
            'entity_id': self.entity_id,
            'entity_name': self.entity_name,
            'user_id': self.user_id,
            'user_email': self.user_email,
            'user_name': self.user_name,
            'user_role': self.user_role,
            'severity': self.severity.value,
            'severity_display': self.severity_display,
            'is_sensitive': self.is_sensitive,
            'is_lgpd_relevant': self.is_lgpd_relevant,
            'is_security_event': self.is_security_event,
            'success': self.success,
            'timestamp': self.timestamp.isoformat(),
            'created_at': self.created_at.isoformat(),
            'tags': self.get_tags(),
            'is_archived': self.is_archived,
            'is_expired': self.is_expired,
            'should_be_archived': self.should_be_archived
        }
        
        if include_sensitive:
            # Incluir dados sensíveis
            sensitive_fields = [
                'session_id', 'request_id', 'ip_address', 'user_agent', 'referer',
                'http_method', 'endpoint', 'response_status', 'error_message',
                'error_code', 'duration_ms', 'legal_basis', 'consent_id',
                'data_subject_id', 'processing_purpose', 'country', 'region',
                'city', 'timezone', 'device_type', 'device_os', 'browser',
                'app_version', 'retention_period_days', 'archive_date', 'delete_date'
            ]
            
            for field in sensitive_fields:
                value = getattr(self, field)
                if isinstance(value, datetime):
                    data[field] = value.isoformat() if value else None
                else:
                    data[field] = value
                    
            data['old_values'] = self.get_old_values()
            data['new_values'] = self.get_new_values()
            data['additional_data'] = self.get_additional_data()
            data['request_params'] = self.get_request_params()
            data['data_categories'] = self.get_data_categories()
            
        return data
        
    def __repr__(self):
        return f'<AuditLog {self.id} - {self.action_type.value} - {self.timestamp}>'