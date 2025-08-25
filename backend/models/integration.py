from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
import pytz
import uuid
import enum
from typing import Dict, List, Any, Optional

Base = declarative_base()

# === ENUMS ===

class IntegrationType(enum.Enum):
    """Tipos de integração"""
    WHATSAPP = "whatsapp"  # WhatsApp Business API
    GOOGLE_CALENDAR = "google_calendar"  # Google Calendar
    GOOGLE_MEET = "google_meet"  # Google Meet
    ZOOM = "zoom"  # Zoom
    EMAIL = "email"  # Email (SMTP)
    SMS = "sms"  # SMS
    PAYMENT_GATEWAY = "payment_gateway"  # Gateway de pagamento
    CEP_API = "cep_api"  # API de CEP
    CPF_VALIDATION = "cpf_validation"  # Validação de CPF
    CREFITO = "crefito"  # CREFITO/COFFITO
    WEBHOOK = "webhook"  # Webhook genérico
    API_EXTERNAL = "api_external"  # API externa
    CLOUD_STORAGE = "cloud_storage"  # Armazenamento em nuvem
    BACKUP_SERVICE = "backup_service"  # Serviço de backup
    ANALYTICS = "analytics"  # Analytics
    MONITORING = "monitoring"  # Monitoramento

class IntegrationStatus(enum.Enum):
    """Status da integração"""
    INACTIVE = "inactive"  # Inativa
    ACTIVE = "active"  # Ativa
    ERROR = "error"  # Erro
    TESTING = "testing"  # Testando
    CONFIGURING = "configuring"  # Configurando
    SUSPENDED = "suspended"  # Suspensa

class WebhookMethod(enum.Enum):
    """Métodos HTTP para webhooks"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"

class IntegrationEvent(enum.Enum):
    """Eventos de integração"""
    APPOINTMENT_CREATED = "appointment_created"  # Agendamento criado
    APPOINTMENT_UPDATED = "appointment_updated"  # Agendamento atualizado
    APPOINTMENT_CANCELLED = "appointment_cancelled"  # Agendamento cancelado
    APPOINTMENT_REMINDER = "appointment_reminder"  # Lembrete de agendamento
    PATIENT_CREATED = "patient_created"  # Paciente criado
    PATIENT_UPDATED = "patient_updated"  # Paciente atualizado
    TREATMENT_COMPLETED = "treatment_completed"  # Tratamento concluído
    PAYMENT_RECEIVED = "payment_received"  # Pagamento recebido
    EXERCISE_ASSIGNED = "exercise_assigned"  # Exercício atribuído
    MESSAGE_RECEIVED = "message_received"  # Mensagem recebida
    NOTIFICATION_SENT = "notification_sent"  # Notificação enviada
    REPORT_GENERATED = "report_generated"  # Relatório gerado
    BACKUP_COMPLETED = "backup_completed"  # Backup concluído
    ERROR_OCCURRED = "error_occurred"  # Erro ocorrido

# === MODELS ===

class Integration(Base):
    """Model para integrações"""
    __tablename__ = 'integrations'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False, index=True)  # Nome
    code = Column(String(50), unique=True, nullable=False, index=True)  # Código único
    description = Column(Text, nullable=True)  # Descrição
    
    # === CONFIGURAÇÃO ===
    
    # Tipo
    type = Column(SQLEnum(IntegrationType), nullable=False, index=True)  # Tipo
    
    # Status
    status = Column(SQLEnum(IntegrationStatus), nullable=False, default=IntegrationStatus.INACTIVE, index=True)  # Status
    
    # Versão
    version = Column(String(20), nullable=True)  # Versão da API
    
    # === CONEXÃO ===
    
    # URL base
    base_url = Column(String(500), nullable=True)  # URL base da API
    
    # Endpoint
    endpoint = Column(String(500), nullable=True)  # Endpoint específico
    
    # Método HTTP
    method = Column(SQLEnum(WebhookMethod), nullable=True, default=WebhookMethod.POST)  # Método HTTP
    
    # === AUTENTICAÇÃO ===
    
    # Tipo de autenticação
    auth_type = Column(String(50), nullable=True)  # Tipo (bearer, basic, api_key, oauth)
    
    # Credenciais (criptografadas)
    credentials = Column(JSON, nullable=True)  # Credenciais
    
    # Headers
    headers = Column(JSON, nullable=True)  # Headers HTTP
    
    # === CONFIGURAÇÕES ===
    
    # Configurações específicas
    config = Column(JSON, nullable=True)  # Configurações
    
    # Parâmetros
    parameters = Column(JSON, nullable=True)  # Parâmetros
    
    # Eventos suportados
    supported_events = Column(JSON, nullable=True)  # Eventos suportados
    
    # === CONTROLE ===
    
    # Ativo
    is_active = Column(Boolean, default=False, nullable=False)  # Ativo
    
    # Teste
    is_test_mode = Column(Boolean, default=True, nullable=False)  # Modo de teste
    
    # === MONITORAMENTO ===
    
    # Última verificação
    last_check = Column(DateTime, nullable=True)  # Última verificação
    
    # Última sincronização
    last_sync = Column(DateTime, nullable=True)  # Última sincronização
    
    # Próxima verificação
    next_check = Column(DateTime, nullable=True)  # Próxima verificação
    
    # === ESTATÍSTICAS ===
    
    # Total de chamadas
    total_calls = Column(Integer, default=0, nullable=False)  # Total de chamadas
    
    # Chamadas com sucesso
    successful_calls = Column(Integer, default=0, nullable=False)  # Chamadas com sucesso
    
    # Chamadas com erro
    failed_calls = Column(Integer, default=0, nullable=False)  # Chamadas com erro
    
    # Tempo médio de resposta
    avg_response_time = Column(Float, nullable=True)  # Tempo médio em ms
    
    # === ERRO ===
    
    # Último erro
    last_error = Column(Text, nullable=True)  # Último erro
    
    # Data do último erro
    last_error_at = Column(DateTime, nullable=True)  # Data do último erro
    
    # === CONFIGURAÇÕES ===
    
    # Configurações
    settings = Column(JSON, nullable=True)  # Configurações
    
    # === METADADOS ===
    
    # Metadados
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    creator = relationship('User', foreign_keys=[created_by])
    logs = relationship('IntegrationLog', back_populates='integration', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Integration, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            IntegrationStatus.INACTIVE: "Inativa",
            IntegrationStatus.ACTIVE: "Ativa",
            IntegrationStatus.ERROR: "Erro",
            IntegrationStatus.TESTING: "Testando",
            IntegrationStatus.CONFIGURING: "Configurando",
            IntegrationStatus.SUSPENDED: "Suspensa"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def type_display(self) -> str:
        """Retorna o tipo formatado"""
        type_names = {
            IntegrationType.WHATSAPP: "WhatsApp Business",
            IntegrationType.GOOGLE_CALENDAR: "Google Calendar",
            IntegrationType.GOOGLE_MEET: "Google Meet",
            IntegrationType.ZOOM: "Zoom",
            IntegrationType.EMAIL: "Email",
            IntegrationType.SMS: "SMS",
            IntegrationType.PAYMENT_GATEWAY: "Gateway de Pagamento",
            IntegrationType.CEP_API: "API de CEP",
            IntegrationType.CPF_VALIDATION: "Validação de CPF",
            IntegrationType.CREFITO: "CREFITO/COFFITO",
            IntegrationType.WEBHOOK: "Webhook",
            IntegrationType.API_EXTERNAL: "API Externa",
            IntegrationType.CLOUD_STORAGE: "Armazenamento em Nuvem",
            IntegrationType.BACKUP_SERVICE: "Serviço de Backup",
            IntegrationType.ANALYTICS: "Analytics",
            IntegrationType.MONITORING: "Monitoramento"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def is_healthy(self) -> bool:
        """Verifica se a integração está saudável"""
        return self.status == IntegrationStatus.ACTIVE and not self.last_error
        
    @property
    def success_rate(self) -> float:
        """Retorna a taxa de sucesso"""
        if self.total_calls == 0:
            return 0.0
        return (self.successful_calls / self.total_calls) * 100
        
    @property
    def error_rate(self) -> float:
        """Retorna a taxa de erro"""
        if self.total_calls == 0:
            return 0.0
        return (self.failed_calls / self.total_calls) * 100
        
    def get_credentials(self) -> dict:
        """Retorna as credenciais"""
        return self.credentials or {}
        
    def get_headers(self) -> dict:
        """Retorna os headers"""
        return self.headers or {}
        
    def get_config(self) -> dict:
        """Retorna as configurações"""
        return self.config or {}
        
    def get_parameters(self) -> dict:
        """Retorna os parâmetros"""
        return self.parameters or {}
        
    def get_supported_events(self) -> list:
        """Retorna os eventos suportados"""
        return self.supported_events or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_credentials(self, credentials: dict):
        """Define as credenciais"""
        self.credentials = credentials
        
    def set_headers(self, headers: dict):
        """Define os headers"""
        self.headers = headers
        
    def set_config(self, config: dict):
        """Define as configurações"""
        self.config = config
        
    def set_parameters(self, parameters: dict):
        """Define os parâmetros"""
        self.parameters = parameters
        
    def set_supported_events(self, events: list):
        """Define os eventos suportados"""
        self.supported_events = events
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def activate(self):
        """Ativa a integração"""
        self.is_active = True
        self.status = IntegrationStatus.ACTIVE
        self.updated_at = datetime.now(pytz.UTC)
        
    def deactivate(self):
        """Desativa a integração"""
        self.is_active = False
        self.status = IntegrationStatus.INACTIVE
        self.updated_at = datetime.now(pytz.UTC)
        
    def suspend(self, reason: str = None):
        """Suspende a integração"""
        self.status = IntegrationStatus.SUSPENDED
        if reason:
            self.last_error = reason
            self.last_error_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def set_error(self, error_message: str):
        """Define um erro"""
        self.status = IntegrationStatus.ERROR
        self.last_error = error_message
        self.last_error_at = datetime.now(pytz.UTC)
        self.failed_calls += 1
        self.total_calls += 1
        self.updated_at = datetime.now(pytz.UTC)
        
    def clear_error(self):
        """Limpa o erro"""
        self.last_error = None
        self.last_error_at = None
        if self.is_active:
            self.status = IntegrationStatus.ACTIVE
        self.updated_at = datetime.now(pytz.UTC)
        
    def record_success(self, response_time: float = None):
        """Registra uma chamada com sucesso"""
        self.successful_calls += 1
        self.total_calls += 1
        self.last_sync = datetime.now(pytz.UTC)
        
        # Atualizar tempo médio de resposta
        if response_time:
            if self.avg_response_time:
                self.avg_response_time = (self.avg_response_time + response_time) / 2
            else:
                self.avg_response_time = response_time
                
        self.updated_at = datetime.now(pytz.UTC)
        
    def schedule_check(self, minutes: int = 60):
        """Agenda próxima verificação"""
        self.next_check = datetime.now(pytz.UTC) + timedelta(minutes=minutes)
        
    def update_check(self):
        """Atualiza última verificação"""
        self.last_check = datetime.now(pytz.UTC)
        
    def supports_event(self, event: IntegrationEvent) -> bool:
        """Verifica se suporta um evento"""
        events = self.get_supported_events()
        return event.value in events
        
    @classmethod
    def get_by_code(cls, session, code: str):
        """Busca integração por código"""
        return session.query(cls).filter(cls.code == code).first()
        
    @classmethod
    def get_by_type(cls, session, integration_type: IntegrationType):
        """Busca integrações por tipo"""
        return session.query(cls).filter(cls.type == integration_type).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_active(cls, session):
        """Busca integrações ativas"""
        return session.query(cls).filter(
            cls.is_active == True,
            cls.status == IntegrationStatus.ACTIVE
        ).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_with_errors(cls, session):
        """Busca integrações com erro"""
        return session.query(cls).filter(cls.status == IntegrationStatus.ERROR).order_by(cls.last_error_at.desc()).all()
        
    @classmethod
    def get_due_for_check(cls, session):
        """Busca integrações que precisam ser verificadas"""
        now = datetime.now(pytz.UTC)
        return session.query(cls).filter(
            cls.is_active == True,
            cls.next_check <= now
        ).order_by(cls.next_check.asc()).all()
        
    @classmethod
    def get_by_event(cls, session, event: IntegrationEvent):
        """Busca integrações que suportam um evento"""
        return session.query(cls).filter(
            cls.is_active == True,
            cls.status == IntegrationStatus.ACTIVE,
            cls.supported_events.contains([event.value])
        ).all()
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'version': self.version,
            'base_url': self.base_url,
            'endpoint': self.endpoint,
            'method': self.method.value if self.method else None,
            'auth_type': self.auth_type,
            'is_active': self.is_active,
            'is_test_mode': self.is_test_mode,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'last_sync': self.last_sync.isoformat() if self.last_sync else None,
            'next_check': self.next_check.isoformat() if self.next_check else None,
            'total_calls': self.total_calls,
            'successful_calls': self.successful_calls,
            'failed_calls': self.failed_calls,
            'success_rate': self.success_rate,
            'error_rate': self.error_rate,
            'avg_response_time': self.avg_response_time,
            'last_error': self.last_error,
            'last_error_at': self.last_error_at.isoformat() if self.last_error_at else None,
            'is_healthy': self.is_healthy,
            'supported_events': self.get_supported_events(),
            'config': self.get_config(),
            'parameters': self.get_parameters(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class IntegrationLog(Base):
    """Model para logs de integração"""
    __tablename__ = 'integration_logs'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Integração
    integration_id = Column(Integer, ForeignKey('integrations.id'), nullable=False, index=True)
    
    # === EXECUÇÃO ===
    
    # Evento
    event = Column(SQLEnum(IntegrationEvent), nullable=True, index=True)  # Evento
    
    # Método HTTP
    method = Column(String(10), nullable=True)  # Método HTTP
    
    # URL
    url = Column(String(1000), nullable=True)  # URL chamada
    
    # === REQUEST ===
    
    # Headers da requisição
    request_headers = Column(JSON, nullable=True)  # Headers
    
    # Payload da requisição
    request_payload = Column(JSON, nullable=True)  # Payload
    
    # === RESPONSE ===
    
    # Status HTTP
    response_status = Column(Integer, nullable=True)  # Status HTTP
    
    # Headers da resposta
    response_headers = Column(JSON, nullable=True)  # Headers
    
    # Payload da resposta
    response_payload = Column(JSON, nullable=True)  # Payload
    
    # === TIMING ===
    
    # Tempo de resposta
    response_time = Column(Float, nullable=True)  # Tempo em ms
    
    # Timeout
    timeout = Column(Boolean, default=False, nullable=False)  # Timeout
    
    # === RESULTADO ===
    
    # Sucesso
    success = Column(Boolean, nullable=False, index=True)  # Sucesso
    
    # Erro
    error_message = Column(Text, nullable=True)  # Mensagem de erro
    
    # Stack trace
    stack_trace = Column(Text, nullable=True)  # Stack trace
    
    # === CONTEXTO ===
    
    # Contexto
    context = Column(JSON, nullable=True)  # Contexto da chamada
    
    # === METADADOS ===
    
    # Metadados
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    
    # Relacionamentos
    integration = relationship('Integration', back_populates='logs')
    
    def __init__(self, **kwargs):
        super(IntegrationLog, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
            
    def get_request_headers(self) -> dict:
        """Retorna os headers da requisição"""
        return self.request_headers or {}
        
    def get_request_payload(self) -> dict:
        """Retorna o payload da requisição"""
        return self.request_payload or {}
        
    def get_response_headers(self) -> dict:
        """Retorna os headers da resposta"""
        return self.response_headers or {}
        
    def get_response_payload(self) -> dict:
        """Retorna o payload da resposta"""
        return self.response_payload or {}
        
    def get_context(self) -> dict:
        """Retorna o contexto"""
        return self.context or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    @classmethod
    def create_log(
        cls,
        integration_id: int,
        success: bool,
        event: IntegrationEvent = None,
        method: str = None,
        url: str = None,
        request_headers: dict = None,
        request_payload: dict = None,
        response_status: int = None,
        response_headers: dict = None,
        response_payload: dict = None,
        response_time: float = None,
        timeout: bool = False,
        error_message: str = None,
        stack_trace: str = None,
        context: dict = None,
        metadata: dict = None
    ):
        """Cria um novo log"""
        return cls(
            integration_id=integration_id,
            event=event,
            method=method,
            url=url,
            request_headers=request_headers,
            request_payload=request_payload,
            response_status=response_status,
            response_headers=response_headers,
            response_payload=response_payload,
            response_time=response_time,
            timeout=timeout,
            success=success,
            error_message=error_message,
            stack_trace=stack_trace,
            context=context,
            metadata=metadata
        )
        
    @classmethod
    def get_by_integration(cls, session, integration_id: int, limit: int = 100):
        """Busca logs por integração"""
        return session.query(cls).filter(
            cls.integration_id == integration_id
        ).order_by(cls.created_at.desc()).limit(limit).all()
        
    @classmethod
    def get_errors(cls, session, integration_id: int = None, hours: int = 24):
        """Busca logs de erro"""
        since = datetime.now(pytz.UTC) - timedelta(hours=hours)
        query = session.query(cls).filter(
            cls.success == False,
            cls.created_at >= since
        )
        
        if integration_id:
            query = query.filter(cls.integration_id == integration_id)
            
        return query.order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_by_event(cls, session, event: IntegrationEvent, hours: int = 24):
        """Busca logs por evento"""
        since = datetime.now(pytz.UTC) - timedelta(hours=hours)
        return session.query(cls).filter(
            cls.event == event,
            cls.created_at >= since
        ).order_by(cls.created_at.desc()).all()
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'integration_id': self.integration_id,
            'event': self.event.value if self.event else None,
            'method': self.method,
            'url': self.url,
            'request_headers': self.get_request_headers(),
            'request_payload': self.get_request_payload(),
            'response_status': self.response_status,
            'response_headers': self.get_response_headers(),
            'response_payload': self.get_response_payload(),
            'response_time': self.response_time,
            'timeout': self.timeout,
            'success': self.success,
            'error_message': self.error_message,
            'stack_trace': self.stack_trace,
            'context': self.get_context(),
            'metadata': self.get_metadata(),
            'created_at': self.created_at.isoformat()
        }