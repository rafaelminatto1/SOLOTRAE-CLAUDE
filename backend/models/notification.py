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

class NotificationType(enum.Enum):
    """Tipos de notificação"""
    APPOINTMENT_REMINDER = "appointment_reminder"  # Lembrete de consulta
    APPOINTMENT_CONFIRMATION = "appointment_confirmation"  # Confirmação de consulta
    APPOINTMENT_CANCELLATION = "appointment_cancellation"  # Cancelamento de consulta
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled"  # Reagendamento
    EXERCISE_ASSIGNED = "exercise_assigned"  # Exercício atribuído
    EXERCISE_REMINDER = "exercise_reminder"  # Lembrete de exercício
    TREATMENT_UPDATE = "treatment_update"  # Atualização de tratamento
    PAYMENT_REMINDER = "payment_reminder"  # Lembrete de pagamento
    PAYMENT_RECEIVED = "payment_received"  # Pagamento recebido
    REPORT_READY = "report_ready"  # Relatório pronto
    SYSTEM_ALERT = "system_alert"  # Alerta do sistema
    SECURITY_ALERT = "security_alert"  # Alerta de segurança
    BACKUP_COMPLETED = "backup_completed"  # Backup concluído
    INTEGRATION_ERROR = "integration_error"  # Erro de integração
    MENTORSHIP_UPDATE = "mentorship_update"  # Atualização de mentoria
    CERTIFICATE_ISSUED = "certificate_issued"  # Certificado emitido
    PARTNERSHIP_UPDATE = "partnership_update"  # Atualização de parceria
    CUSTOM = "custom"  # Personalizada

class NotificationChannel(enum.Enum):
    """Canais de notificação"""
    IN_APP = "in_app"  # No aplicativo
    EMAIL = "email"  # Email
    SMS = "sms"  # SMS
    WHATSAPP = "whatsapp"  # WhatsApp
    PUSH = "push"  # Push notification
    WEBHOOK = "webhook"  # Webhook

class NotificationStatus(enum.Enum):
    """Status da notificação"""
    PENDING = "pending"  # Pendente
    SENT = "sent"  # Enviada
    DELIVERED = "delivered"  # Entregue
    READ = "read"  # Lida
    FAILED = "failed"  # Falhou
    CANCELLED = "cancelled"  # Cancelada

class NotificationPriority(enum.Enum):
    """Prioridade da notificação"""
    LOW = "low"  # Baixa
    NORMAL = "normal"  # Normal
    HIGH = "high"  # Alta
    URGENT = "urgent"  # Urgente

# === MODELS ===

class Notification(Base):
    """Model para notificações"""
    __tablename__ = 'notifications'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Destinatário
    recipient_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Remetente (opcional)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    
    # === CONTEÚDO ===
    
    # Título
    title = Column(String(200), nullable=False)  # Título
    
    # Mensagem
    message = Column(Text, nullable=False)  # Mensagem
    
    # Tipo
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)  # Tipo
    
    # Canal
    channel = Column(SQLEnum(NotificationChannel), nullable=False, index=True)  # Canal
    
    # Prioridade
    priority = Column(SQLEnum(NotificationPriority), nullable=False, default=NotificationPriority.NORMAL, index=True)  # Prioridade
    
    # === STATUS ===
    
    # Status
    status = Column(SQLEnum(NotificationStatus), nullable=False, default=NotificationStatus.PENDING, index=True)  # Status
    
    # Lida
    is_read = Column(Boolean, default=False, nullable=False, index=True)  # Lida
    
    # === AGENDAMENTO ===
    
    # Agendada para
    scheduled_for = Column(DateTime, nullable=True, index=True)  # Agendada para
    
    # Enviada em
    sent_at = Column(DateTime, nullable=True, index=True)  # Enviada em
    
    # Entregue em
    delivered_at = Column(DateTime, nullable=True)  # Entregue em
    
    # Lida em
    read_at = Column(DateTime, nullable=True)  # Lida em
    
    # Expira em
    expires_at = Column(DateTime, nullable=True, index=True)  # Expira em
    
    # === TENTATIVAS ===
    
    # Tentativas
    attempts = Column(Integer, default=0, nullable=False)  # Tentativas
    
    # Máximo de tentativas
    max_attempts = Column(Integer, default=3, nullable=False)  # Máximo de tentativas
    
    # Próxima tentativa
    next_attempt = Column(DateTime, nullable=True, index=True)  # Próxima tentativa
    
    # === DADOS ESPECÍFICOS DO CANAL ===
    
    # Dados do canal
    channel_data = Column(JSON, nullable=True)  # Dados específicos do canal
    
    # ID externo
    external_id = Column(String(200), nullable=True, index=True)  # ID externo
    
    # === CONTEXTO ===
    
    # Entidade relacionada
    related_entity_type = Column(String(50), nullable=True, index=True)  # Tipo da entidade
    related_entity_id = Column(Integer, nullable=True, index=True)  # ID da entidade
    
    # Contexto
    context = Column(JSON, nullable=True)  # Contexto
    
    # === AÇÕES ===
    
    # Ações disponíveis
    actions = Column(JSON, nullable=True)  # Ações
    
    # URL de ação
    action_url = Column(String(500), nullable=True)  # URL de ação
    
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
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    recipient = relationship('User', foreign_keys=[recipient_id])
    sender = relationship('User', foreign_keys=[sender_id])
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(Notification, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @property
    def type_display(self) -> str:
        """Retorna o tipo formatado"""
        type_names = {
            NotificationType.APPOINTMENT_REMINDER: "Lembrete de Consulta",
            NotificationType.APPOINTMENT_CONFIRMATION: "Confirmação de Consulta",
            NotificationType.APPOINTMENT_CANCELLATION: "Cancelamento de Consulta",
            NotificationType.APPOINTMENT_RESCHEDULED: "Reagendamento",
            NotificationType.EXERCISE_ASSIGNED: "Exercício Atribuído",
            NotificationType.EXERCISE_REMINDER: "Lembrete de Exercício",
            NotificationType.TREATMENT_UPDATE: "Atualização de Tratamento",
            NotificationType.PAYMENT_REMINDER: "Lembrete de Pagamento",
            NotificationType.PAYMENT_RECEIVED: "Pagamento Recebido",
            NotificationType.REPORT_READY: "Relatório Pronto",
            NotificationType.SYSTEM_ALERT: "Alerta do Sistema",
            NotificationType.SECURITY_ALERT: "Alerta de Segurança",
            NotificationType.BACKUP_COMPLETED: "Backup Concluído",
            NotificationType.INTEGRATION_ERROR: "Erro de Integração",
            NotificationType.MENTORSHIP_UPDATE: "Atualização de Mentoria",
            NotificationType.CERTIFICATE_ISSUED: "Certificado Emitido",
            NotificationType.PARTNERSHIP_UPDATE: "Atualização de Parceria",
            NotificationType.CUSTOM: "Personalizada"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def channel_display(self) -> str:
        """Retorna o canal formatado"""
        channel_names = {
            NotificationChannel.IN_APP: "No Aplicativo",
            NotificationChannel.EMAIL: "Email",
            NotificationChannel.SMS: "SMS",
            NotificationChannel.WHATSAPP: "WhatsApp",
            NotificationChannel.PUSH: "Push Notification",
            NotificationChannel.WEBHOOK: "Webhook"
        }
        return channel_names.get(self.channel, self.channel.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            NotificationStatus.PENDING: "Pendente",
            NotificationStatus.SENT: "Enviada",
            NotificationStatus.DELIVERED: "Entregue",
            NotificationStatus.READ: "Lida",
            NotificationStatus.FAILED: "Falhou",
            NotificationStatus.CANCELLED: "Cancelada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def priority_display(self) -> str:
        """Retorna a prioridade formatada"""
        priority_names = {
            NotificationPriority.LOW: "Baixa",
            NotificationPriority.NORMAL: "Normal",
            NotificationPriority.HIGH: "Alta",
            NotificationPriority.URGENT: "Urgente"
        }
        return priority_names.get(self.priority, self.priority.value)
        
    @property
    def is_scheduled(self) -> bool:
        """Verifica se está agendada"""
        return self.scheduled_for is not None and self.scheduled_for > datetime.now(pytz.UTC)
        
    @property
    def is_expired(self) -> bool:
        """Verifica se expirou"""
        return self.expires_at is not None and self.expires_at <= datetime.now(pytz.UTC)
        
    @property
    def can_retry(self) -> bool:
        """Verifica se pode tentar novamente"""
        return self.attempts < self.max_attempts and not self.is_expired
        
    @property
    def is_ready_to_send(self) -> bool:
        """Verifica se está pronta para envio"""
        now = datetime.now(pytz.UTC)
        return (
            self.status == NotificationStatus.PENDING and
            (self.scheduled_for is None or self.scheduled_for <= now) and
            (self.next_attempt is None or self.next_attempt <= now) and
            not self.is_expired
        )
        
    def get_channel_data(self) -> dict:
        """Retorna os dados do canal"""
        return self.channel_data or {}
        
    def get_context(self) -> dict:
        """Retorna o contexto"""
        return self.context or {}
        
    def get_actions(self) -> list:
        """Retorna as ações"""
        return self.actions or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_channel_data(self, data: dict):
        """Define os dados do canal"""
        self.channel_data = data
        
    def set_context(self, context: dict):
        """Define o contexto"""
        self.context = context
        
    def set_actions(self, actions: list):
        """Define as ações"""
        self.actions = actions
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def mark_as_sent(self, external_id: str = None):
        """Marca como enviada"""
        self.status = NotificationStatus.SENT
        self.sent_at = datetime.now(pytz.UTC)
        if external_id:
            self.external_id = external_id
        self.updated_at = datetime.now(pytz.UTC)
        
    def mark_as_delivered(self):
        """Marca como entregue"""
        self.status = NotificationStatus.DELIVERED
        self.delivered_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def mark_as_read(self):
        """Marca como lida"""
        self.status = NotificationStatus.READ
        self.is_read = True
        self.read_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def mark_as_failed(self, error_message: str = None):
        """Marca como falhou"""
        self.status = NotificationStatus.FAILED
        self.attempts += 1
        if error_message:
            self.last_error = error_message
            self.last_error_at = datetime.now(pytz.UTC)
            
        # Agendar próxima tentativa se possível
        if self.can_retry:
            delay_minutes = min(2 ** self.attempts, 60)  # Backoff exponencial
            self.next_attempt = datetime.now(pytz.UTC) + timedelta(minutes=delay_minutes)
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel(self, reason: str = None):
        """Cancela a notificação"""
        self.status = NotificationStatus.CANCELLED
        if reason:
            self.last_error = reason
            self.last_error_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def schedule(self, scheduled_for: datetime):
        """Agenda a notificação"""
        self.scheduled_for = scheduled_for
        self.updated_at = datetime.now(pytz.UTC)
        
    def set_expiration(self, expires_at: datetime):
        """Define expiração"""
        self.expires_at = expires_at
        self.updated_at = datetime.now(pytz.UTC)
        
    def relate_to_entity(self, entity_type: str, entity_id: int):
        """Relaciona com uma entidade"""
        self.related_entity_type = entity_type
        self.related_entity_id = entity_id
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def create_notification(
        cls,
        recipient_id: int,
        title: str,
        message: str,
        notification_type: NotificationType,
        channel: NotificationChannel,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        sender_id: int = None,
        scheduled_for: datetime = None,
        expires_at: datetime = None,
        channel_data: dict = None,
        context: dict = None,
        actions: list = None,
        action_url: str = None,
        related_entity_type: str = None,
        related_entity_id: int = None,
        settings: dict = None,
        metadata: dict = None,
        created_by: int = None
    ):
        """Cria uma nova notificação"""
        return cls(
            recipient_id=recipient_id,
            sender_id=sender_id,
            title=title,
            message=message,
            type=notification_type,
            channel=channel,
            priority=priority,
            scheduled_for=scheduled_for,
            expires_at=expires_at,
            channel_data=channel_data,
            context=context,
            actions=actions,
            action_url=action_url,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            settings=settings,
            metadata=metadata,
            created_by=created_by
        )
        
    @classmethod
    def get_by_recipient(cls, session, recipient_id: int, unread_only: bool = False, limit: int = 50):
        """Busca notificações por destinatário"""
        query = session.query(cls).filter(cls.recipient_id == recipient_id)
        
        if unread_only:
            query = query.filter(cls.is_read == False)
            
        return query.order_by(cls.created_at.desc()).limit(limit).all()
        
    @classmethod
    def get_pending(cls, session, channel: NotificationChannel = None):
        """Busca notificações pendentes"""
        now = datetime.now(pytz.UTC)
        query = session.query(cls).filter(
            cls.status == NotificationStatus.PENDING,
            cls.is_expired == False
        )
        
        # Filtrar por agendamento
        query = query.filter(
            (cls.scheduled_for.is_(None)) |
            (cls.scheduled_for <= now)
        )
        
        # Filtrar por próxima tentativa
        query = query.filter(
            (cls.next_attempt.is_(None)) |
            (cls.next_attempt <= now)
        )
        
        if channel:
            query = query.filter(cls.channel == channel)
            
        return query.order_by(cls.priority.desc(), cls.created_at.asc()).all()
        
    @classmethod
    def get_failed_retryable(cls, session, channel: NotificationChannel = None):
        """Busca notificações que falharam mas podem ser tentadas novamente"""
        now = datetime.now(pytz.UTC)
        query = session.query(cls).filter(
            cls.status == NotificationStatus.FAILED,
            cls.attempts < cls.max_attempts,
            cls.is_expired == False,
            (cls.next_attempt.is_(None)) | (cls.next_attempt <= now)
        )
        
        if channel:
            query = query.filter(cls.channel == channel)
            
        return query.order_by(cls.priority.desc(), cls.next_attempt.asc()).all()
        
    @classmethod
    def get_by_type(cls, session, notification_type: NotificationType, hours: int = 24):
        """Busca notificações por tipo"""
        since = datetime.now(pytz.UTC) - timedelta(hours=hours)
        return session.query(cls).filter(
            cls.type == notification_type,
            cls.created_at >= since
        ).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_by_entity(cls, session, entity_type: str, entity_id: int):
        """Busca notificações por entidade relacionada"""
        return session.query(cls).filter(
            cls.related_entity_type == entity_type,
            cls.related_entity_id == entity_id
        ).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_expired(cls, session, hours: int = 24):
        """Busca notificações expiradas"""
        now = datetime.now(pytz.UTC)
        since = now - timedelta(hours=hours)
        return session.query(cls).filter(
            cls.expires_at <= now,
            cls.expires_at >= since
        ).order_by(cls.expires_at.desc()).all()
        
    @classmethod
    def count_unread(cls, session, recipient_id: int) -> int:
        """Conta notificações não lidas"""
        return session.query(cls).filter(
            cls.recipient_id == recipient_id,
            cls.is_read == False
        ).count()
        
    @classmethod
    def mark_all_as_read(cls, session, recipient_id: int):
        """Marca todas como lidas"""
        now = datetime.now(pytz.UTC)
        session.query(cls).filter(
            cls.recipient_id == recipient_id,
            cls.is_read == False
        ).update({
            'is_read': True,
            'read_at': now,
            'updated_at': now
        })
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'recipient_id': self.recipient_id,
            'sender_id': self.sender_id,
            'title': self.title,
            'message': self.message,
            'type': self.type.value,
            'type_display': self.type_display,
            'channel': self.channel.value,
            'channel_display': self.channel_display,
            'priority': self.priority.value,
            'priority_display': self.priority_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'is_read': self.is_read,
            'scheduled_for': self.scheduled_for.isoformat() if self.scheduled_for else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'attempts': self.attempts,
            'max_attempts': self.max_attempts,
            'next_attempt': self.next_attempt.isoformat() if self.next_attempt else None,
            'external_id': self.external_id,
            'related_entity_type': self.related_entity_type,
            'related_entity_id': self.related_entity_id,
            'action_url': self.action_url,
            'last_error': self.last_error,
            'last_error_at': self.last_error_at.isoformat() if self.last_error_at else None,
            'is_scheduled': self.is_scheduled,
            'is_expired': self.is_expired,
            'can_retry': self.can_retry,
            'is_ready_to_send': self.is_ready_to_send,
            'channel_data': self.get_channel_data(),
            'context': self.get_context(),
            'actions': self.get_actions(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class NotificationTemplate(Base):
    """Model para templates de notificação"""
    __tablename__ = 'notification_templates'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Nome
    name = Column(String(200), nullable=False, index=True)  # Nome
    
    # Código
    code = Column(String(50), unique=True, nullable=False, index=True)  # Código único
    
    # Descrição
    description = Column(Text, nullable=True)  # Descrição
    
    # === CONFIGURAÇÃO ===
    
    # Tipo
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)  # Tipo
    
    # Canal
    channel = Column(SQLEnum(NotificationChannel), nullable=False, index=True)  # Canal
    
    # Prioridade padrão
    default_priority = Column(SQLEnum(NotificationPriority), nullable=False, default=NotificationPriority.NORMAL)  # Prioridade
    
    # === TEMPLATE ===
    
    # Template do título
    title_template = Column(String(500), nullable=False)  # Template do título
    
    # Template da mensagem
    message_template = Column(Text, nullable=False)  # Template da mensagem
    
    # Variáveis
    variables = Column(JSON, nullable=True)  # Variáveis disponíveis
    
    # === CONFIGURAÇÕES ===
    
    # Configurações padrão
    default_settings = Column(JSON, nullable=True)  # Configurações padrão
    
    # Dados padrão do canal
    default_channel_data = Column(JSON, nullable=True)  # Dados padrão do canal
    
    # === CONTROLE ===
    
    # Ativo
    is_active = Column(Boolean, default=True, nullable=False)  # Ativo
    
    # Sistema
    is_system = Column(Boolean, default=False, nullable=False)  # Template do sistema
    
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
    
    def __init__(self, **kwargs):
        super(NotificationTemplate, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    def get_variables(self) -> list:
        """Retorna as variáveis"""
        return self.variables or []
        
    def get_default_settings(self) -> dict:
        """Retorna as configurações padrão"""
        return self.default_settings or {}
        
    def get_default_channel_data(self) -> dict:
        """Retorna os dados padrão do canal"""
        return self.default_channel_data or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_variables(self, variables: list):
        """Define as variáveis"""
        self.variables = variables
        
    def set_default_settings(self, settings: dict):
        """Define as configurações padrão"""
        self.default_settings = settings
        
    def set_default_channel_data(self, data: dict):
        """Define os dados padrão do canal"""
        self.default_channel_data = data
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def render(self, variables: dict = None) -> tuple:
        """Renderiza o template"""
        vars_dict = variables or {}
        
        # Renderizar título
        title = self.title_template
        for key, value in vars_dict.items():
            title = title.replace(f'{{{key}}}', str(value))
            
        # Renderizar mensagem
        message = self.message_template
        for key, value in vars_dict.items():
            message = message.replace(f'{{{key}}}', str(value))
            
        return title, message
        
    def activate(self):
        """Ativa o template"""
        self.is_active = True
        self.updated_at = datetime.now(pytz.UTC)
        
    def deactivate(self):
        """Desativa o template"""
        self.is_active = False
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def get_by_code(cls, session, code: str):
        """Busca template por código"""
        return session.query(cls).filter(
            cls.code == code,
            cls.is_active == True
        ).first()
        
    @classmethod
    def get_by_type(cls, session, notification_type: NotificationType, channel: NotificationChannel = None):
        """Busca templates por tipo"""
        query = session.query(cls).filter(
            cls.type == notification_type,
            cls.is_active == True
        )
        
        if channel:
            query = query.filter(cls.channel == channel)
            
        return query.order_by(cls.name.asc()).all()
        
    @classmethod
    def get_system_templates(cls, session):
        """Busca templates do sistema"""
        return session.query(cls).filter(
            cls.is_system == True,
            cls.is_active == True
        ).order_by(cls.name.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'type': self.type.value,
            'channel': self.channel.value,
            'default_priority': self.default_priority.value,
            'title_template': self.title_template,
            'message_template': self.message_template,
            'variables': self.get_variables(),
            'default_settings': self.get_default_settings(),
            'default_channel_data': self.get_default_channel_data(),
            'is_active': self.is_active,
            'is_system': self.is_system,
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }