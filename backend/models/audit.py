from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
import pytz
import uuid
import enum
from typing import Dict, List, Any, Optional
import json

Base = declarative_base()

# === ENUMS ===

class AuditAction(enum.Enum):
    """Ações de auditoria"""
    CREATE = "create"  # Criar
    READ = "read"  # Ler
    UPDATE = "update"  # Atualizar
    DELETE = "delete"  # Deletar
    LOGIN = "login"  # Login
    LOGOUT = "logout"  # Logout
    LOGIN_FAILED = "login_failed"  # Login falhou
    PASSWORD_CHANGE = "password_change"  # Mudança de senha
    PASSWORD_RESET = "password_reset"  # Reset de senha
    PERMISSION_GRANTED = "permission_granted"  # Permissão concedida
    PERMISSION_REVOKED = "permission_revoked"  # Permissão revogada
    EXPORT = "export"  # Exportar
    IMPORT = "import"  # Importar
    BACKUP = "backup"  # Backup
    RESTORE = "restore"  # Restaurar
    SYNC = "sync"  # Sincronizar
    SEND = "send"  # Enviar
    RECEIVE = "receive"  # Receber
    APPROVE = "approve"  # Aprovar
    REJECT = "reject"  # Rejeitar
    CANCEL = "cancel"  # Cancelar
    ACTIVATE = "activate"  # Ativar
    DEACTIVATE = "deactivate"  # Desativar
    ARCHIVE = "archive"  # Arquivar
    UNARCHIVE = "unarchive"  # Desarquivar
    PUBLISH = "publish"  # Publicar
    UNPUBLISH = "unpublish"  # Despublicar
    SHARE = "share"  # Compartilhar
    UNSHARE = "unshare"  # Parar de compartilhar
    DOWNLOAD = "download"  # Download
    UPLOAD = "upload"  # Upload
    PRINT = "print"  # Imprimir
    EMAIL = "email"  # Email
    SMS = "sms"  # SMS
    WHATSAPP = "whatsapp"  # WhatsApp
    NOTIFICATION = "notification"  # Notificação
    INTEGRATION = "integration"  # Integração
    API_CALL = "api_call"  # Chamada de API
    WEBHOOK = "webhook"  # Webhook
    CUSTOM = "custom"  # Personalizada

class AuditLevel(enum.Enum):
    """Níveis de auditoria"""
    DEBUG = "debug"  # Debug
    INFO = "info"  # Informação
    WARNING = "warning"  # Aviso
    ERROR = "error"  # Erro
    CRITICAL = "critical"  # Crítico

class AuditStatus(enum.Enum):
    """Status da auditoria"""
    SUCCESS = "success"  # Sucesso
    FAILED = "failed"  # Falhou
    PENDING = "pending"  # Pendente
    CANCELLED = "cancelled"  # Cancelado

# === MODELS ===

class AuditLog(Base):
    """Model para logs de auditoria"""
    __tablename__ = 'audit_logs'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === USUÁRIO ===
    
    # Usuário que executou a ação
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    
    # Nome do usuário (para casos onde o usuário foi deletado)
    user_name = Column(String(200), nullable=True)
    
    # Email do usuário
    user_email = Column(String(200), nullable=True)
    
    # Tipo de usuário
    user_type = Column(String(50), nullable=True)
    
    # === AÇÃO ===
    
    # Ação executada
    action = Column(SQLEnum(AuditAction), nullable=False, index=True)
    
    # Descrição da ação
    action_description = Column(String(500), nullable=True)
    
    # Nível
    level = Column(SQLEnum(AuditLevel), nullable=False, default=AuditLevel.INFO, index=True)
    
    # Status
    status = Column(SQLEnum(AuditStatus), nullable=False, default=AuditStatus.SUCCESS, index=True)
    
    # === ENTIDADE AFETADA ===
    
    # Tipo da entidade
    entity_type = Column(String(100), nullable=True, index=True)
    
    # ID da entidade
    entity_id = Column(Integer, nullable=True, index=True)
    
    # Nome/título da entidade
    entity_name = Column(String(500), nullable=True)
    
    # === DADOS ===
    
    # Dados antes da alteração
    old_values = Column(JSON, nullable=True)
    
    # Dados depois da alteração
    new_values = Column(JSON, nullable=True)
    
    # Dados adicionais
    additional_data = Column(JSON, nullable=True)
    
    # === CONTEXTO ===
    
    # Módulo/seção do sistema
    module = Column(String(100), nullable=True, index=True)
    
    # Função/método
    function = Column(String(200), nullable=True)
    
    # URL da requisição
    request_url = Column(String(1000), nullable=True)
    
    # Método HTTP
    request_method = Column(String(10), nullable=True)
    
    # Parâmetros da requisição
    request_params = Column(JSON, nullable=True)
    
    # Headers da requisição
    request_headers = Column(JSON, nullable=True)
    
    # Body da requisição
    request_body = Column(Text, nullable=True)
    
    # === RESPOSTA ===
    
    # Status da resposta
    response_status = Column(Integer, nullable=True)
    
    # Headers da resposta
    response_headers = Column(JSON, nullable=True)
    
    # Body da resposta
    response_body = Column(Text, nullable=True)
    
    # === SESSÃO ===
    
    # ID da sessão
    session_id = Column(String(200), nullable=True, index=True)
    
    # Token de acesso
    access_token = Column(String(500), nullable=True)
    
    # === LOCALIZAÇÃO ===
    
    # Endereço IP
    ip_address = Column(String(45), nullable=True, index=True)  # IPv6 suportado
    
    # User Agent
    user_agent = Column(Text, nullable=True)
    
    # Localização geográfica
    location = Column(JSON, nullable=True)
    
    # === TEMPO ===
    
    # Duração da operação (em milissegundos)
    duration_ms = Column(Integer, nullable=True)
    
    # Timestamp da ação
    timestamp = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    
    # === ERRO ===
    
    # Mensagem de erro
    error_message = Column(Text, nullable=True)
    
    # Stack trace
    error_stack = Column(Text, nullable=True)
    
    # Código do erro
    error_code = Column(String(50), nullable=True)
    
    # === TAGS ===
    
    # Tags para categorização
    tags = Column(JSON, nullable=True)
    
    # === METADADOS ===
    
    # Metadados adicionais
    metadata = Column(JSON, nullable=True)
    
    # Relacionamentos
    user = relationship('User', foreign_keys=[user_id])
    
    def __init__(self, **kwargs):
        super(AuditLog, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.timestamp:
            self.timestamp = datetime.now(pytz.UTC)
            
    @property
    def action_display(self) -> str:
        """Retorna a ação formatada"""
        action_names = {
            AuditAction.CREATE: "Criar",
            AuditAction.READ: "Ler",
            AuditAction.UPDATE: "Atualizar",
            AuditAction.DELETE: "Deletar",
            AuditAction.LOGIN: "Login",
            AuditAction.LOGOUT: "Logout",
            AuditAction.LOGIN_FAILED: "Login Falhou",
            AuditAction.PASSWORD_CHANGE: "Mudança de Senha",
            AuditAction.PASSWORD_RESET: "Reset de Senha",
            AuditAction.PERMISSION_GRANTED: "Permissão Concedida",
            AuditAction.PERMISSION_REVOKED: "Permissão Revogada",
            AuditAction.EXPORT: "Exportar",
            AuditAction.IMPORT: "Importar",
            AuditAction.BACKUP: "Backup",
            AuditAction.RESTORE: "Restaurar",
            AuditAction.SYNC: "Sincronizar",
            AuditAction.SEND: "Enviar",
            AuditAction.RECEIVE: "Receber",
            AuditAction.APPROVE: "Aprovar",
            AuditAction.REJECT: "Rejeitar",
            AuditAction.CANCEL: "Cancelar",
            AuditAction.ACTIVATE: "Ativar",
            AuditAction.DEACTIVATE: "Desativar",
            AuditAction.ARCHIVE: "Arquivar",
            AuditAction.UNARCHIVE: "Desarquivar",
            AuditAction.PUBLISH: "Publicar",
            AuditAction.UNPUBLISH: "Despublicar",
            AuditAction.SHARE: "Compartilhar",
            AuditAction.UNSHARE: "Parar de Compartilhar",
            AuditAction.DOWNLOAD: "Download",
            AuditAction.UPLOAD: "Upload",
            AuditAction.PRINT: "Imprimir",
            AuditAction.EMAIL: "Email",
            AuditAction.SMS: "SMS",
            AuditAction.WHATSAPP: "WhatsApp",
            AuditAction.NOTIFICATION: "Notificação",
            AuditAction.INTEGRATION: "Integração",
            AuditAction.API_CALL: "Chamada de API",
            AuditAction.WEBHOOK: "Webhook",
            AuditAction.CUSTOM: "Personalizada"
        }
        return action_names.get(self.action, self.action.value)
        
    @property
    def level_display(self) -> str:
        """Retorna o nível formatado"""
        level_names = {
            AuditLevel.DEBUG: "Debug",
            AuditLevel.INFO: "Informação",
            AuditLevel.WARNING: "Aviso",
            AuditLevel.ERROR: "Erro",
            AuditLevel.CRITICAL: "Crítico"
        }
        return level_names.get(self.level, self.level.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            AuditStatus.SUCCESS: "Sucesso",
            AuditStatus.FAILED: "Falhou",
            AuditStatus.PENDING: "Pendente",
            AuditStatus.CANCELLED: "Cancelado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_error(self) -> bool:
        """Verifica se é um erro"""
        return self.level in [AuditLevel.ERROR, AuditLevel.CRITICAL] or self.status == AuditStatus.FAILED
        
    @property
    def is_security_related(self) -> bool:
        """Verifica se é relacionado à segurança"""
        security_actions = [
            AuditAction.LOGIN,
            AuditAction.LOGOUT,
            AuditAction.LOGIN_FAILED,
            AuditAction.PASSWORD_CHANGE,
            AuditAction.PASSWORD_RESET,
            AuditAction.PERMISSION_GRANTED,
            AuditAction.PERMISSION_REVOKED
        ]
        return self.action in security_actions
        
    def get_old_values(self) -> dict:
        """Retorna os valores antigos"""
        return self.old_values or {}
        
    def get_new_values(self) -> dict:
        """Retorna os valores novos"""
        return self.new_values or {}
        
    def get_additional_data(self) -> dict:
        """Retorna os dados adicionais"""
        return self.additional_data or {}
        
    def get_request_params(self) -> dict:
        """Retorna os parâmetros da requisição"""
        return self.request_params or {}
        
    def get_request_headers(self) -> dict:
        """Retorna os headers da requisição"""
        return self.request_headers or {}
        
    def get_response_headers(self) -> dict:
        """Retorna os headers da resposta"""
        return self.response_headers or {}
        
    def get_location(self) -> dict:
        """Retorna a localização"""
        return self.location or {}
        
    def get_tags(self) -> list:
        """Retorna as tags"""
        return self.tags or []
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_old_values(self, values: dict):
        """Define os valores antigos"""
        self.old_values = values
        
    def set_new_values(self, values: dict):
        """Define os valores novos"""
        self.new_values = values
        
    def set_additional_data(self, data: dict):
        """Define os dados adicionais"""
        self.additional_data = data
        
    def set_request_params(self, params: dict):
        """Define os parâmetros da requisição"""
        self.request_params = params
        
    def set_request_headers(self, headers: dict):
        """Define os headers da requisição"""
        # Filtrar headers sensíveis
        safe_headers = {}
        sensitive_headers = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
        
        for key, value in headers.items():
            if key.lower() in sensitive_headers:
                safe_headers[key] = '[REDACTED]'
            else:
                safe_headers[key] = value
                
        self.request_headers = safe_headers
        
    def set_response_headers(self, headers: dict):
        """Define os headers da resposta"""
        self.response_headers = headers
        
    def set_location(self, location: dict):
        """Define a localização"""
        self.location = location
        
    def set_tags(self, tags: list):
        """Define as tags"""
        self.tags = tags
        
    def add_tag(self, tag: str):
        """Adiciona uma tag"""
        tags = self.get_tags()
        if tag not in tags:
            tags.append(tag)
            self.set_tags(tags)
            
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def add_metadata(self, key: str, value: Any):
        """Adiciona metadado"""
        metadata = self.get_metadata()
        metadata[key] = value
        self.set_metadata(metadata)
        
    def set_error(self, message: str, stack: str = None, code: str = None):
        """Define erro"""
        self.error_message = message
        self.error_stack = stack
        self.error_code = code
        self.status = AuditStatus.FAILED
        if self.level == AuditLevel.INFO:
            self.level = AuditLevel.ERROR
            
    def set_duration(self, start_time: datetime):
        """Define a duração baseada no tempo de início"""
        if start_time:
            duration = datetime.now(pytz.UTC) - start_time
            self.duration_ms = int(duration.total_seconds() * 1000)
            
    def get_changes(self) -> dict:
        """Retorna as mudanças entre valores antigos e novos"""
        old = self.get_old_values()
        new = self.get_new_values()
        
        changes = {}
        
        # Campos alterados
        for key in set(old.keys()) | set(new.keys()):
            old_val = old.get(key)
            new_val = new.get(key)
            
            if old_val != new_val:
                changes[key] = {
                    'old': old_val,
                    'new': new_val
                }
                
        return changes
        
    @classmethod
    def create_log(
        cls,
        action: AuditAction,
        user_id: int = None,
        entity_type: str = None,
        entity_id: int = None,
        entity_name: str = None,
        old_values: dict = None,
        new_values: dict = None,
        additional_data: dict = None,
        action_description: str = None,
        level: AuditLevel = AuditLevel.INFO,
        status: AuditStatus = AuditStatus.SUCCESS,
        module: str = None,
        function: str = None,
        request_url: str = None,
        request_method: str = None,
        request_params: dict = None,
        request_headers: dict = None,
        request_body: str = None,
        response_status: int = None,
        response_headers: dict = None,
        response_body: str = None,
        session_id: str = None,
        access_token: str = None,
        ip_address: str = None,
        user_agent: str = None,
        location: dict = None,
        duration_ms: int = None,
        error_message: str = None,
        error_stack: str = None,
        error_code: str = None,
        tags: list = None,
        metadata: dict = None
    ):
        """Cria um novo log de auditoria"""
        log = cls(
            action=action,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            old_values=old_values,
            new_values=new_values,
            additional_data=additional_data,
            action_description=action_description,
            level=level,
            status=status,
            module=module,
            function=function,
            request_url=request_url,
            request_method=request_method,
            request_params=request_params,
            response_status=response_status,
            response_headers=response_headers,
            response_body=response_body,
            session_id=session_id,
            access_token=access_token,
            ip_address=ip_address,
            user_agent=user_agent,
            location=location,
            duration_ms=duration_ms,
            error_message=error_message,
            error_stack=error_stack,
            error_code=error_code,
            tags=tags,
            metadata=metadata
        )
        
        # Definir headers da requisição de forma segura
        if request_headers:
            log.set_request_headers(request_headers)
            
        return log
        
    @classmethod
    def get_by_user(cls, session, user_id: int, days: int = 30, limit: int = 100):
        """Busca logs por usuário"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            cls.user_id == user_id,
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_entity(cls, session, entity_type: str, entity_id: int, days: int = 30):
        """Busca logs por entidade"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            cls.entity_type == entity_type,
            cls.entity_id == entity_id,
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).all()
        
    @classmethod
    def get_by_action(cls, session, action: AuditAction, days: int = 7, limit: int = 100):
        """Busca logs por ação"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            cls.action == action,
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_security_logs(cls, session, days: int = 30, limit: int = 100):
        """Busca logs de segurança"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        security_actions = [
            AuditAction.LOGIN,
            AuditAction.LOGOUT,
            AuditAction.LOGIN_FAILED,
            AuditAction.PASSWORD_CHANGE,
            AuditAction.PASSWORD_RESET,
            AuditAction.PERMISSION_GRANTED,
            AuditAction.PERMISSION_REVOKED
        ]
        return session.query(cls).filter(
            cls.action.in_(security_actions),
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_errors(cls, session, days: int = 7, limit: int = 100):
        """Busca logs de erro"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            (cls.level.in_([AuditLevel.ERROR, AuditLevel.CRITICAL])) |
            (cls.status == AuditStatus.FAILED),
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_ip(cls, session, ip_address: str, days: int = 7):
        """Busca logs por IP"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            cls.ip_address == ip_address,
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).all()
        
    @classmethod
    def get_by_session(cls, session, session_id: str):
        """Busca logs por sessão"""
        return session.query(cls).filter(
            cls.session_id == session_id
        ).order_by(cls.timestamp.asc()).all()
        
    @classmethod
    def get_by_module(cls, session, module: str, days: int = 7, limit: int = 100):
        """Busca logs por módulo"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            cls.module == module,
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def get_by_tag(cls, session, tag: str, days: int = 7, limit: int = 100):
        """Busca logs por tag"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        return session.query(cls).filter(
            cls.tags.contains([tag]),
            cls.timestamp >= since
        ).order_by(cls.timestamp.desc()).limit(limit).all()
        
    @classmethod
    def cleanup_old_logs(cls, session, days: int = 90):
        """Remove logs antigos"""
        cutoff = datetime.now(pytz.UTC) - timedelta(days=days)
        deleted = session.query(cls).filter(
            cls.timestamp < cutoff
        ).delete()
        return deleted
        
    @classmethod
    def get_statistics(cls, session, days: int = 30) -> dict:
        """Retorna estatísticas dos logs"""
        since = datetime.now(pytz.UTC) - timedelta(days=days)
        
        # Total de logs
        total = session.query(cls).filter(cls.timestamp >= since).count()
        
        # Por status
        success = session.query(cls).filter(
            cls.timestamp >= since,
            cls.status == AuditStatus.SUCCESS
        ).count()
        
        failed = session.query(cls).filter(
            cls.timestamp >= since,
            cls.status == AuditStatus.FAILED
        ).count()
        
        # Por nível
        errors = session.query(cls).filter(
            cls.timestamp >= since,
            cls.level.in_([AuditLevel.ERROR, AuditLevel.CRITICAL])
        ).count()
        
        warnings = session.query(cls).filter(
            cls.timestamp >= since,
            cls.level == AuditLevel.WARNING
        ).count()
        
        # Usuários únicos
        unique_users = session.query(cls.user_id).filter(
            cls.timestamp >= since,
            cls.user_id.isnot(None)
        ).distinct().count()
        
        # IPs únicos
        unique_ips = session.query(cls.ip_address).filter(
            cls.timestamp >= since,
            cls.ip_address.isnot(None)
        ).distinct().count()
        
        return {
            'total_logs': total,
            'success_count': success,
            'failed_count': failed,
            'error_count': errors,
            'warning_count': warnings,
            'unique_users': unique_users,
            'unique_ips': unique_ips,
            'success_rate': round((success / total * 100) if total > 0 else 0, 2),
            'error_rate': round((errors / total * 100) if total > 0 else 0, 2)
        }
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'user_type': self.user_type,
            'action': self.action.value,
            'action_display': self.action_display,
            'action_description': self.action_description,
            'level': self.level.value,
            'level_display': self.level_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'entity_name': self.entity_name,
            'module': self.module,
            'function': self.function,
            'request_url': self.request_url,
            'request_method': self.request_method,
            'response_status': self.response_status,
            'session_id': self.session_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'duration_ms': self.duration_ms,
            'error_message': self.error_message,
            'error_code': self.error_code,
            'is_error': self.is_error,
            'is_security_related': self.is_security_related,
            'old_values': self.get_old_values(),
            'new_values': self.get_new_values(),
            'additional_data': self.get_additional_data(),
            'request_params': self.get_request_params(),
            'request_headers': self.get_request_headers(),
            'response_headers': self.get_response_headers(),
            'location': self.get_location(),
            'tags': self.get_tags(),
            'metadata': self.get_metadata(),
            'changes': self.get_changes(),
            'timestamp': self.timestamp.isoformat()
        }