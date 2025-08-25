# -*- coding: utf-8 -*-
"""
Model de Comunicação
Sistema FisioFlow - Sistema de Comunicação e Mensagens
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
from typing import Dict, Any, Optional, List
import uuid

class CommunicationType(enum.Enum):
    """Enum para tipos de comunicação"""
    # Mensagens diretas
    DIRECT_MESSAGE = "DIRECT_MESSAGE"  # Mensagem direta
    GROUP_MESSAGE = "GROUP_MESSAGE"  # Mensagem em grupo
    BROADCAST = "BROADCAST"  # Transmissão
    
    # Comunicação clínica
    CLINICAL_NOTE = "CLINICAL_NOTE"  # Nota clínica
    TREATMENT_UPDATE = "TREATMENT_UPDATE"  # Atualização de tratamento
    EXERCISE_FEEDBACK = "EXERCISE_FEEDBACK"  # Feedback de exercício
    PROGRESS_REPORT = "PROGRESS_REPORT"  # Relatório de progresso
    
    # Agendamentos
    APPOINTMENT_COMMUNICATION = "APPOINTMENT_COMMUNICATION"  # Comunicação sobre consulta
    SCHEDULE_CHANGE = "SCHEDULE_CHANGE"  # Mudança de horário
    REMINDER = "REMINDER"  # Lembrete
    
    # Sistema de parcerias
    PARTNER_COMMUNICATION = "PARTNER_COMMUNICATION"  # Comunicação com parceiro
    SESSION_FEEDBACK = "SESSION_FEEDBACK"  # Feedback de sessão
    PAYMENT_COMMUNICATION = "PAYMENT_COMMUNICATION"  # Comunicação sobre pagamento
    
    # Mentoria
    MENTORSHIP_MESSAGE = "MENTORSHIP_MESSAGE"  # Mensagem de mentoria
    EVALUATION_FEEDBACK = "EVALUATION_FEEDBACK"  # Feedback de avaliação
    LEARNING_MATERIAL = "LEARNING_MATERIAL"  # Material de aprendizado
    
    # Administrativo
    ADMIN_ANNOUNCEMENT = "ADMIN_ANNOUNCEMENT"  # Anúncio administrativo
    SYSTEM_MESSAGE = "SYSTEM_MESSAGE"  # Mensagem do sistema
    SUPPORT_MESSAGE = "SUPPORT_MESSAGE"  # Mensagem de suporte
    
    # Outros
    OTHER = "OTHER"  # Outros

class CommunicationChannel(enum.Enum):
    """Enum para canais de comunicação"""
    IN_APP = "IN_APP"  # No aplicativo
    EMAIL = "EMAIL"  # Email
    SMS = "SMS"  # SMS
    WHATSAPP = "WHATSAPP"  # WhatsApp
    PHONE_CALL = "PHONE_CALL"  # Ligação telefônica
    VIDEO_CALL = "VIDEO_CALL"  # Videochamada
    WEBHOOK = "WEBHOOK"  # Webhook

class CommunicationStatus(enum.Enum):
    """Enum para status da comunicação"""
    DRAFT = "DRAFT"  # Rascunho
    PENDING = "PENDING"  # Pendente
    SENT = "SENT"  # Enviada
    DELIVERED = "DELIVERED"  # Entregue
    READ = "READ"  # Lida
    REPLIED = "REPLIED"  # Respondida
    FAILED = "FAILED"  # Falhou
    CANCELLED = "CANCELLED"  # Cancelada

class CommunicationPriority(enum.Enum):
    """Enum para prioridade da comunicação"""
    LOW = "LOW"  # Baixa
    NORMAL = "NORMAL"  # Normal
    HIGH = "HIGH"  # Alta
    URGENT = "URGENT"  # Urgente

class Communication(db.Model):
    """Model para comunicações"""
    
    __tablename__ = 'communications'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Tipo e categoria
    type = Column(Enum(CommunicationType), nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)  # Categoria personalizada
    
    # Assunto e conteúdo
    subject = Column(String(500), nullable=True)  # Assunto
    content = Column(Text, nullable=False)  # Conteúdo principal
    summary = Column(String(1000), nullable=True)  # Resumo
    
    # === PARTICIPANTES ===
    
    # Remetente
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    sender_role = Column(String(50), nullable=True)  # Perfil do remetente
    
    # Destinatário principal
    recipient_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    recipient_role = Column(String(50), nullable=True)  # Perfil do destinatário
    
    # Destinatários adicionais (JSON)
    additional_recipients = Column(JSON, nullable=True)  # [{"user_id": 1, "role": "CC"}, ...]
    
    # Dados de contato (para casos de usuário deletado)
    sender_email = Column(String(255), nullable=True)
    sender_phone = Column(String(20), nullable=True)
    sender_name = Column(String(200), nullable=True)
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    recipient_name = Column(String(200), nullable=True)
    
    # === CONFIGURAÇÃO DE ENVIO ===
    
    # Canal de comunicação
    channel = Column(Enum(CommunicationChannel), nullable=False, index=True)
    priority = Column(Enum(CommunicationPriority), default=CommunicationPriority.NORMAL, nullable=False, index=True)
    
    # Agendamento
    scheduled_at = Column(DateTime, nullable=True, index=True)  # Quando enviar
    expires_at = Column(DateTime, nullable=True, index=True)  # Quando expira
    
    # Configurações especiais
    requires_confirmation = Column(Boolean, default=False, nullable=False)  # Requer confirmação
    is_confidential = Column(Boolean, default=False, nullable=False)  # Confidencial
    is_urgent = Column(Boolean, default=False, nullable=False)  # Urgente
    auto_delete_after_read = Column(Boolean, default=False, nullable=False)  # Auto-deletar após leitura
    
    # === CONTEÚDO RICO ===
    
    # Dados estruturados
    data = Column(JSON, nullable=True)  # Dados adicionais
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # Anexos
    attachments = Column(JSON, nullable=True)  # Lista de anexos
    
    # Template
    template_id = Column(String(100), nullable=True)  # ID do template
    template_variables = Column(JSON, nullable=True)  # Variáveis do template
    
    # Formatação
    content_type = Column(String(50), default='text/plain', nullable=False)  # text/plain, text/html, markdown
    language = Column(String(10), default='pt-BR', nullable=False)  # Idioma
    
    # === ENTIDADE RELACIONADA ===
    
    # Entidade que gerou a comunicação
    related_entity_type = Column(String(50), nullable=True, index=True)  # appointment, patient, etc.
    related_entity_id = Column(String(50), nullable=True, index=True)  # ID da entidade
    
    # Referência a comunicação pai (para threads)
    parent_communication_id = Column(Integer, ForeignKey('communications.id'), nullable=True, index=True)
    thread_id = Column(String(100), nullable=True, index=True)  # ID da thread
    
    # === STATUS E CONTROLE ===
    
    # Status geral
    status = Column(Enum(CommunicationStatus), default=CommunicationStatus.DRAFT, nullable=False, index=True)
    
    # Controle de leitura
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    read_by_recipient = Column(Boolean, default=False, nullable=False)
    
    # Controle de envio
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Tentativas de envio
    send_attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    last_attempt_at = Column(DateTime, nullable=True)
    
    # Erro
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    
    # === CONFIRMAÇÃO E RESPOSTA ===
    
    # Confirmação
    confirmation_required = Column(Boolean, default=False, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    confirmed_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Resposta
    response_required = Column(Boolean, default=False, nullable=False)
    response_deadline = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    
    # === MÉTRICAS ===
    
    # Interação
    click_count = Column(Integer, default=0, nullable=False)  # Quantas vezes foi clicada
    open_count = Column(Integer, default=0, nullable=False)  # Quantas vezes foi aberta
    
    # Tempo de resposta
    response_time_seconds = Column(Integer, nullable=True)  # Tempo para responder
    read_time_seconds = Column(Integer, nullable=True)  # Tempo para ler
    
    # Avaliação
    rating = Column(Float, nullable=True)  # Avaliação (1-5)
    feedback = Column(Text, nullable=True)  # Feedback
    
    # === INTEGRAÇÃO EXTERNA ===
    
    # IDs externos
    external_id = Column(String(200), nullable=True, index=True)  # ID no sistema externo
    external_reference = Column(String(500), nullable=True)  # Referência externa
    
    # Dados de integração
    integration_data = Column(JSON, nullable=True)  # Dados específicos da integração
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    sender = relationship('User', foreign_keys=[sender_id])
    recipient = relationship('User', foreign_keys=[recipient_id])
    confirmed_by_user = relationship('User', foreign_keys=[confirmed_by])
    parent_communication = relationship('Communication', remote_side=[id])
    child_communications = relationship('Communication', back_populates='parent_communication')
    
    def __init__(self, **kwargs):
        super(Communication, self).__init__(**kwargs)
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
            # Mensagens
            CommunicationType.DIRECT_MESSAGE: "Mensagem Direta",
            CommunicationType.GROUP_MESSAGE: "Mensagem em Grupo",
            CommunicationType.BROADCAST: "Transmissão",
            
            # Clínica
            CommunicationType.CLINICAL_NOTE: "Nota Clínica",
            CommunicationType.TREATMENT_UPDATE: "Atualização de Tratamento",
            CommunicationType.EXERCISE_FEEDBACK: "Feedback de Exercício",
            CommunicationType.PROGRESS_REPORT: "Relatório de Progresso",
            
            # Agendamentos
            CommunicationType.APPOINTMENT_COMMUNICATION: "Comunicação sobre Consulta",
            CommunicationType.SCHEDULE_CHANGE: "Mudança de Horário",
            CommunicationType.REMINDER: "Lembrete",
            
            # Parcerias
            CommunicationType.PARTNER_COMMUNICATION: "Comunicação com Parceiro",
            CommunicationType.SESSION_FEEDBACK: "Feedback de Sessão",
            CommunicationType.PAYMENT_COMMUNICATION: "Comunicação sobre Pagamento",
            
            # Mentoria
            CommunicationType.MENTORSHIP_MESSAGE: "Mensagem de Mentoria",
            CommunicationType.EVALUATION_FEEDBACK: "Feedback de Avaliação",
            CommunicationType.LEARNING_MATERIAL: "Material de Aprendizado",
            
            # Administrativo
            CommunicationType.ADMIN_ANNOUNCEMENT: "Anúncio Administrativo",
            CommunicationType.SYSTEM_MESSAGE: "Mensagem do Sistema",
            CommunicationType.SUPPORT_MESSAGE: "Mensagem de Suporte",
            
            CommunicationType.OTHER: "Outros"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def channel_display(self) -> str:
        """Retorna o canal formatado"""
        channel_names = {
            CommunicationChannel.IN_APP: "No Aplicativo",
            CommunicationChannel.EMAIL: "Email",
            CommunicationChannel.SMS: "SMS",
            CommunicationChannel.WHATSAPP: "WhatsApp",
            CommunicationChannel.PHONE_CALL: "Ligação Telefônica",
            CommunicationChannel.VIDEO_CALL: "Videochamada",
            CommunicationChannel.WEBHOOK: "Webhook"
        }
        return channel_names.get(self.channel, self.channel.value)
        
    @property
    def priority_display(self) -> str:
        """Retorna a prioridade formatada"""
        priority_names = {
            CommunicationPriority.LOW: "Baixa",
            CommunicationPriority.NORMAL: "Normal",
            CommunicationPriority.HIGH: "Alta",
            CommunicationPriority.URGENT: "Urgente"
        }
        return priority_names.get(self.priority, self.priority.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            CommunicationStatus.DRAFT: "Rascunho",
            CommunicationStatus.PENDING: "Pendente",
            CommunicationStatus.SENT: "Enviada",
            CommunicationStatus.DELIVERED: "Entregue",
            CommunicationStatus.read: "Lida",
            CommunicationStatus.REPLIED: "Respondida",
            CommunicationStatus.FAILED: "Falhou",
            CommunicationStatus.CANCELLED: "Cancelada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_expired(self) -> bool:
        """Verifica se a comunicação expirou"""
        if not self.expires_at:
            return False
        return datetime.now(pytz.UTC) > self.expires_at.replace(tzinfo=pytz.UTC)
        
    @property
    def is_scheduled(self) -> bool:
        """Verifica se a comunicação está agendada"""
        if not self.scheduled_at:
            return False
        return datetime.now(pytz.UTC) < self.scheduled_at.replace(tzinfo=pytz.UTC)
        
    @property
    def should_send(self) -> bool:
        """Verifica se a comunicação deve ser enviada"""
        if self.status not in [CommunicationStatus.DRAFT, CommunicationStatus.PENDING]:
            return False
        if self.is_expired:
            return False
        if self.scheduled_at and self.is_scheduled:
            return False
        return True
        
    @property
    def can_retry(self) -> bool:
        """Verifica se pode tentar enviar novamente"""
        return self.send_attempts < self.max_attempts and not self.is_expired
        
    @property
    def is_overdue(self) -> bool:
        """Verifica se a resposta está atrasada"""
        if not self.response_required or not self.response_deadline:
            return False
        if self.responded_at:
            return False
        return datetime.now(pytz.UTC) > self.response_deadline.replace(tzinfo=pytz.UTC)
        
    def get_data(self) -> dict:
        """Retorna os dados adicionais"""
        return self.data or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def get_attachments(self) -> List[dict]:
        """Retorna os anexos"""
        return self.attachments or []
        
    def get_additional_recipients(self) -> List[dict]:
        """Retorna os destinatários adicionais"""
        return self.additional_recipients or []
        
    def get_template_variables(self) -> dict:
        """Retorna as variáveis do template"""
        return self.template_variables or {}
        
    def get_integration_data(self) -> dict:
        """Retorna os dados de integração"""
        return self.integration_data or {}
        
    def set_data(self, data: dict):
        """Define os dados adicionais"""
        self.data = data
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def add_attachment(self, attachment: dict):
        """Adiciona um anexo"""
        attachments = self.get_attachments()
        attachments.append(attachment)
        self.attachments = attachments
        
    def remove_attachment(self, attachment_id: str):
        """Remove um anexo"""
        attachments = self.get_attachments()
        self.attachments = [a for a in attachments if a.get('id') != attachment_id]
        
    def add_recipient(self, user_id: int, role: str = 'CC'):
        """Adiciona um destinatário"""
        recipients = self.get_additional_recipients()
        recipients.append({'user_id': user_id, 'role': role})
        self.additional_recipients = recipients
        
    def remove_recipient(self, user_id: int):
        """Remove um destinatário"""
        recipients = self.get_additional_recipients()
        self.additional_recipients = [r for r in recipients if r.get('user_id') != user_id]
        
    def mark_as_read(self, user_id: int = None):
        """Marca como lida"""
        if user_id and user_id not in [self.sender_id, self.recipient_id]:
            # Verificar se é destinatário adicional
            additional_recipients = self.get_additional_recipients()
            if not any(r.get('user_id') == user_id for r in additional_recipients):
                return False
                
        self.is_read = True
        self.read_at = datetime.now(pytz.UTC)
        
        if user_id == self.recipient_id:
            self.read_by_recipient = True
            
        if self.status == CommunicationStatus.DELIVERED:
            self.status = CommunicationStatus.read
            
        # Calcular tempo de leitura
        if self.sent_at:
            delta = self.read_at - self.sent_at
            self.read_time_seconds = int(delta.total_seconds())
            
        return True
        
    def mark_as_clicked(self):
        """Registra um clique"""
        self.click_count += 1
        
        # Marcar como lida se ainda não foi
        if not self.is_read:
            self.mark_as_read()
            
    def mark_as_opened(self):
        """Registra uma abertura"""
        self.open_count += 1
        
        # Marcar como lida se ainda não foi
        if not self.is_read:
            self.mark_as_read()
            
    def mark_as_sent(self):
        """Marca como enviada"""
        self.status = CommunicationStatus.SENT
        self.sent_at = datetime.now(pytz.UTC)
        
    def mark_as_delivered(self):
        """Marca como entregue"""
        self.status = CommunicationStatus.DELIVERED
        self.delivered_at = datetime.now(pytz.UTC)
        
    def mark_as_failed(self, error_message: str, error_code: str = None):
        """Marca como falhou"""
        self.status = CommunicationStatus.FAILED
        self.error_message = error_message
        self.error_code = error_code
        self.last_attempt_at = datetime.now(pytz.UTC)
        
    def mark_as_replied(self):
        """Marca como respondida"""
        self.status = CommunicationStatus.REPLIED
        self.responded_at = datetime.now(pytz.UTC)
        
        # Calcular tempo de resposta
        if self.sent_at:
            delta = self.responded_at - self.sent_at
            self.response_time_seconds = int(delta.total_seconds())
            
    def confirm(self, confirmed_by: int):
        """Confirma a comunicação"""
        self.confirmed_at = datetime.now(pytz.UTC)
        self.confirmed_by = confirmed_by
        
    def increment_attempts(self):
        """Incrementa tentativas de envio"""
        self.send_attempts += 1
        self.last_attempt_at = datetime.now(pytz.UTC)
        
    def cancel(self, reason: str = None):
        """Cancela a comunicação"""
        self.status = CommunicationStatus.CANCELLED
        if reason:
            self.error_message = reason
            
    def schedule(self, scheduled_at: datetime):
        """Agenda a comunicação"""
        self.scheduled_at = scheduled_at
        self.status = CommunicationStatus.PENDING
        
    def extend_deadline(self, hours: int):
        """Estende o prazo de resposta"""
        if self.response_deadline:
            self.response_deadline += timedelta(hours=hours)
        else:
            self.response_deadline = datetime.now(pytz.UTC) + timedelta(hours=hours)
            
    def rate(self, rating: float, feedback: str = None):
        """Avalia a comunicação"""
        if 1 <= rating <= 5:
            self.rating = rating
            if feedback:
                self.feedback = feedback
                
    @classmethod
    def create_communication(
        cls,
        sender_id: int,
        communication_type: CommunicationType,
        content: str,
        channel: CommunicationChannel = CommunicationChannel.IN_APP,
        recipient_id: int = None,
        subject: str = None,
        priority: CommunicationPriority = CommunicationPriority.NORMAL,
        scheduled_at: datetime = None,
        expires_at: datetime = None,
        data: dict = None,
        attachments: List[dict] = None,
        related_entity_type: str = None,
        related_entity_id: str = None,
        parent_communication_id: int = None,
        template_id: str = None,
        template_variables: dict = None,
        **kwargs
    ) -> 'Communication':
        """Cria uma nova comunicação"""
        
        communication = cls(
            sender_id=sender_id,
            recipient_id=recipient_id,
            type=communication_type,
            subject=subject,
            content=content,
            channel=channel,
            priority=priority,
            scheduled_at=scheduled_at,
            expires_at=expires_at,
            related_entity_type=related_entity_type,
            related_entity_id=str(related_entity_id) if related_entity_id else None,
            parent_communication_id=parent_communication_id,
            template_id=template_id,
            **kwargs
        )
        
        if data:
            communication.set_data(data)
        if attachments:
            communication.attachments = attachments
        if template_variables:
            communication.template_variables = template_variables
            
        return communication
        
    @classmethod
    def get_by_user(cls, user_id: int, as_sender: bool = True, as_recipient: bool = True, limit: int = 50):
        """Busca comunicações por usuário"""
        conditions = []
        
        if as_sender:
            conditions.append(cls.sender_id == user_id)
        if as_recipient:
            conditions.append(cls.recipient_id == user_id)
            
        if not conditions:
            return []
            
        from sqlalchemy import or_
        query = cls.query.filter(or_(*conditions))
        
        return query.order_by(cls.created_at.desc()).limit(limit).all()
        
    @classmethod
    def get_conversation(cls, user1_id: int, user2_id: int, limit: int = 100):
        """Busca conversa entre dois usuários"""
        from sqlalchemy import or_, and_
        
        return cls.query.filter(
            or_(
                and_(cls.sender_id == user1_id, cls.recipient_id == user2_id),
                and_(cls.sender_id == user2_id, cls.recipient_id == user1_id)
            )
        ).order_by(cls.created_at.asc()).limit(limit).all()
        
    @classmethod
    def get_thread(cls, thread_id: str, limit: int = 100):
        """Busca comunicações de uma thread"""
        return cls.query.filter_by(thread_id=thread_id).order_by(cls.created_at.asc()).limit(limit).all()
        
    @classmethod
    def get_unread_by_user(cls, user_id: int):
        """Busca comunicações não lidas por usuário"""
        return cls.query.filter(
            cls.recipient_id == user_id,
            cls.is_read == False,
            cls.status.in_([CommunicationStatus.SENT, CommunicationStatus.DELIVERED])
        ).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_pending_communications(cls):
        """Busca comunicações pendentes para envio"""
        now = datetime.now(pytz.UTC)
        
        return cls.query.filter(
            cls.status.in_([CommunicationStatus.DRAFT, CommunicationStatus.PENDING]),
            cls.send_attempts < cls.max_attempts,
            (cls.scheduled_at.is_(None)) | (cls.scheduled_at <= now),
            (cls.expires_at.is_(None)) | (cls.expires_at > now)
        ).order_by(cls.priority.desc(), cls.created_at.asc()).all()
        
    @classmethod
    def get_failed_communications(cls, can_retry: bool = True):
        """Busca comunicações que falharam"""
        query = cls.query.filter_by(status=CommunicationStatus.FAILED)
        
        if can_retry:
            now = datetime.now(pytz.UTC)
            query = query.filter(
                cls.send_attempts < cls.max_attempts,
                (cls.expires_at.is_(None)) | (cls.expires_at > now)
            )
            
        return query.order_by(cls.last_attempt_at.desc()).all()
        
    @classmethod
    def get_overdue_responses(cls):
        """Busca comunicações com resposta atrasada"""
        now = datetime.now(pytz.UTC)
        
        return cls.query.filter(
            cls.response_required == True,
            cls.response_deadline.isnot(None),
            cls.response_deadline <= now,
            cls.responded_at.is_(None),
            cls.status != CommunicationStatus.CANCELLED
        ).order_by(cls.response_deadline.asc()).all()
        
    @classmethod
    def get_by_type(cls, communication_type: CommunicationType, limit: int = 100):
        """Busca comunicações por tipo"""
        return cls.query.filter_by(type=communication_type).order_by(cls.created_at.desc()).limit(limit).all()
        
    @classmethod
    def get_by_entity(cls, entity_type: str, entity_id: str, limit: int = 100):
        """Busca comunicações por entidade relacionada"""
        return cls.query.filter(
            cls.related_entity_type == entity_type,
            cls.related_entity_id == entity_id
        ).order_by(cls.created_at.desc()).limit(limit).all()
        
    @classmethod
    def get_by_channel(cls, channel: CommunicationChannel, limit: int = 100):
        """Busca comunicações por canal"""
        return cls.query.filter_by(channel=channel).order_by(cls.created_at.desc()).limit(limit).all()
        
    @classmethod
    def get_statistics(cls, user_id: int = None, start_date: datetime = None, end_date: datetime = None) -> dict:
        """Retorna estatísticas das comunicações"""
        query = cls.query
        
        if user_id:
            from sqlalchemy import or_
            query = query.filter(or_(cls.sender_id == user_id, cls.recipient_id == user_id))
        if start_date:
            query = query.filter(cls.created_at >= start_date)
        if end_date:
            query = query.filter(cls.created_at <= end_date)
            
        communications = query.all()
        
        # Estatísticas gerais
        total_communications = len(communications)
        sent_communications = len([c for c in communications if c.status == CommunicationStatus.SENT])
        read_communications = len([c for c in communications if c.is_read])
        replied_communications = len([c for c in communications if c.status == CommunicationStatus.REPLIED])
        failed_communications = len([c for c in communications if c.status == CommunicationStatus.FAILED])
        
        # Por tipo
        by_type = {}
        for communication in communications:
            type_name = communication.type.value
            by_type[type_name] = by_type.get(type_name, 0) + 1
            
        # Por canal
        by_channel = {}
        for communication in communications:
            channel = communication.channel.value
            by_channel[channel] = by_channel.get(channel, 0) + 1
            
        # Por prioridade
        by_priority = {}
        for communication in communications:
            priority = communication.priority.value
            by_priority[priority] = by_priority.get(priority, 0) + 1
            
        # Tempo médio de resposta
        response_times = [c.response_time_seconds for c in communications if c.response_time_seconds]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Tempo médio de leitura
        read_times = [c.read_time_seconds for c in communications if c.read_time_seconds]
        avg_read_time = sum(read_times) / len(read_times) if read_times else 0
        
        # Avaliação média
        ratings = [c.rating for c in communications if c.rating]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        
        return {
            'total_communications': total_communications,
            'sent_communications': sent_communications,
            'read_communications': read_communications,
            'replied_communications': replied_communications,
            'failed_communications': failed_communications,
            'delivery_rate': (sent_communications / total_communications * 100) if total_communications > 0 else 0,
            'read_rate': (read_communications / total_communications * 100) if total_communications > 0 else 0,
            'reply_rate': (replied_communications / total_communications * 100) if total_communications > 0 else 0,
            'by_type': by_type,
            'by_channel': by_channel,
            'by_priority': by_priority,
            'avg_response_time_seconds': avg_response_time,
            'avg_read_time_seconds': avg_read_time,
            'avg_rating': avg_rating,
            'period': {
                'start_date': start_date.isoformat() if start_date else None,
                'end_date': end_date.isoformat() if end_date else None
            }
        }
        
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte a comunicação para dicionário"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'type': self.type.value,
            'type_display': self.type_display,
            'category': self.category,
            'subject': self.subject,
            'content': self.content,
            'summary': self.summary,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'channel': self.channel.value,
            'channel_display': self.channel_display,
            'priority': self.priority.value,
            'priority_display': self.priority_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'is_read': self.is_read,
            'read_by_recipient': self.read_by_recipient,
            'is_expired': self.is_expired,
            'is_scheduled': self.is_scheduled,
            'should_send': self.should_send,
            'can_retry': self.can_retry,
            'is_overdue': self.is_overdue,
            'requires_confirmation': self.requires_confirmation,
            'is_confidential': self.is_confidential,
            'is_urgent': self.is_urgent,
            'confirmation_required': self.confirmation_required,
            'response_required': self.response_required,
            'related_entity_type': self.related_entity_type,
            'related_entity_id': self.related_entity_id,
            'parent_communication_id': self.parent_communication_id,
            'thread_id': self.thread_id,
            'data': self.get_data(),
            'attachments': self.get_attachments(),
            'additional_recipients': self.get_additional_recipients(),
            'content_type': self.content_type,
            'language': self.language,
            'click_count': self.click_count,
            'open_count': self.open_count,
            'send_attempts': self.send_attempts,
            'max_attempts': self.max_attempts,
            'rating': self.rating,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        # Timestamps opcionais
        optional_timestamps = [
            'scheduled_at', 'expires_at', 'read_at', 'sent_at', 'delivered_at',
            'last_attempt_at', 'confirmed_at', 'response_deadline', 'responded_at'
        ]
        
        for field in optional_timestamps:
            value = getattr(self, field)
            data[field] = value.isoformat() if value else None
            
        if include_sensitive:
            # Incluir dados sensíveis
            sensitive_fields = [
                'sender_email', 'sender_phone', 'sender_name',
                'recipient_email', 'recipient_phone', 'recipient_name',
                'sender_role', 'recipient_role', 'metadata',
                'template_id', 'template_variables', 'auto_delete_after_read',
                'response_time_seconds', 'read_time_seconds',
                'error_message', 'error_code', 'confirmed_by',
                'external_id', 'external_reference', 'integration_data'
            ]
            
            for field in sensitive_fields:
                value = getattr(self, field)
                if field in ['metadata', 'template_variables', 'integration_data']:
                    data[field] = value or {}
                else:
                    data[field] = value
                    
        return data
        
    def __repr__(self):
        return f'<Communication {self.id} - {self.type.value} - {self.subject or "No Subject"}>'