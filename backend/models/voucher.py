# -*- coding: utf-8 -*-
"""
Model de Voucher
Sistema FisioFlow - Sistema de Parcerias (Vouchers)
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
import secrets
import string

class VoucherType(enum.Enum):
    """Enum para tipos de voucher"""
    SINGLE = "SINGLE"  # Avulso (1 sessão)
    PACKAGE = "PACKAGE"  # Pacote (múltiplas sessões)
    MONTHLY = "MONTHLY"  # Mensal (ilimitado por 30 dias)
    WEEKLY = "WEEKLY"  # Semanal (ilimitado por 7 dias)
    TRIAL = "TRIAL"  # Experimental

class VoucherStatus(enum.Enum):
    """Enum para status do voucher"""
    PENDING = "PENDING"  # Pendente pagamento
    ACTIVE = "ACTIVE"  # Ativo
    USED = "USED"  # Usado (para vouchers de sessão única)
    EXPIRED = "EXPIRED"  # Expirado
    CANCELLED = "CANCELLED"  # Cancelado
    REFUNDED = "REFUNDED"  # Reembolsado

class VoucherUsageStatus(enum.Enum):
    """Enum para status de uso do voucher"""
    SCHEDULED = "SCHEDULED"  # Agendado
    COMPLETED = "COMPLETED"  # Concluído
    CANCELLED = "CANCELLED"  # Cancelado
    NO_SHOW = "NO_SHOW"  # Faltou

class Voucher(db.Model):
    """Model para vouchers de treinos"""
    
    __tablename__ = 'vouchers'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    code = Column(String(20), nullable=False, unique=True, index=True)  # Código único
    
    # Relacionamentos
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey('partners.id'), nullable=False, index=True)
    purchased_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)  # Quem comprou
    
    # Tipo e configuração
    voucher_type = Column(Enum(VoucherType), nullable=False)
    status = Column(Enum(VoucherStatus), default=VoucherStatus.PENDING, nullable=False)
    
    # === CONFIGURAÇÕES DO VOUCHER ===
    
    # Sessões
    total_sessions = Column(Integer, default=1, nullable=False)  # Total de sessões
    used_sessions = Column(Integer, default=0, nullable=False)  # Sessões utilizadas
    remaining_sessions = Column(Integer, default=1, nullable=False)  # Sessões restantes
    
    # Validade
    valid_from = Column(DateTime, nullable=False)  # Válido a partir de
    valid_until = Column(DateTime, nullable=False)  # Válido até
    
    # Valores
    original_price = Column(Float, nullable=False)  # Preço original
    discount_amount = Column(Float, default=0.0, nullable=False)  # Desconto aplicado
    final_price = Column(Float, nullable=False)  # Preço final
    
    # === CONFIGURAÇÕES DE USO ===
    
    # Restrições
    session_duration = Column(Integer, default=60, nullable=False)  # Duração da sessão (minutos)
    service_types = Column(JSON, nullable=True)  # Tipos de serviço permitidos (JSON)
    location_restrictions = Column(JSON, nullable=True)  # Restrições de local (JSON)
    
    # Agendamento
    advance_booking_hours = Column(Integer, default=24, nullable=False)  # Horas de antecedência para agendamento
    cancellation_hours = Column(Integer, default=12, nullable=False)  # Horas de antecedência para cancelamento
    
    # === INFORMAÇÕES DE COMPRA ===
    
    # Pagamento
    payment_method = Column(String(50), nullable=True)  # Método de pagamento
    payment_status = Column(String(20), default='pending', nullable=False)  # Status do pagamento
    payment_date = Column(DateTime, nullable=True)  # Data do pagamento
    payment_reference = Column(String(100), nullable=True)  # Referência do pagamento
    
    # Origem da compra
    purchase_channel = Column(String(50), default='web', nullable=False)  # Canal de compra (web, mobile, presencial)
    referral_code = Column(String(20), nullable=True)  # Código de indicação
    
    # === HISTÓRICO DE USO ===
    
    # Primeira e última utilização
    first_use_date = Column(DateTime, nullable=True)  # Data da primeira utilização
    last_use_date = Column(DateTime, nullable=True)  # Data da última utilização
    
    # Estatísticas
    total_no_shows = Column(Integer, default=0, nullable=False)  # Total de faltas
    total_cancellations = Column(Integer, default=0, nullable=False)  # Total de cancelamentos
    
    # === CONFIGURAÇÕES ESPECIAIS ===
    
    # Transferibilidade
    is_transferable = Column(Boolean, default=False, nullable=False)  # Pode ser transferido
    transferred_to = Column(Integer, ForeignKey('patients.id'), nullable=True)  # Transferido para
    transfer_date = Column(DateTime, nullable=True)  # Data da transferência
    transfer_reason = Column(Text, nullable=True)  # Motivo da transferência
    
    # Renovação automática
    auto_renewal = Column(Boolean, default=False, nullable=False)  # Renovação automática
    renewal_discount = Column(Float, default=0.0, nullable=False)  # Desconto na renovação
    
    # === OBSERVAÇÕES E NOTAS ===
    
    # Observações
    notes = Column(Text, nullable=True)  # Observações gerais
    special_instructions = Column(Text, nullable=True)  # Instruções especiais
    internal_notes = Column(Text, nullable=True)  # Notas internas
    
    # Motivo de cancelamento/reembolso
    cancellation_reason = Column(Text, nullable=True)  # Motivo do cancelamento
    refund_reason = Column(Text, nullable=True)  # Motivo do reembolso
    refund_amount = Column(Float, nullable=True)  # Valor reembolsado
    refund_date = Column(DateTime, nullable=True)  # Data do reembolso
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    activated_at = Column(DateTime, nullable=True)  # Data de ativação
    expired_at = Column(DateTime, nullable=True)  # Data de expiração
    
    # Relacionamentos
    patient = relationship('Patient', foreign_keys=[patient_id])
    partner = relationship('Partner', back_populates='vouchers')
    purchaser = relationship('User', foreign_keys=[purchased_by])
    transferred_patient = relationship('Patient', foreign_keys=[transferred_to])
    voucher_usages = relationship('VoucherUsage', back_populates='voucher', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Voucher, self).__init__(**kwargs)
        if not self.code:
            self.code = self.generate_unique_code()
        if not self.valid_from:
            self.valid_from = datetime.now(pytz.UTC)
        if not self.valid_until:
            self.valid_until = self.calculate_expiry_date()
        if not self.remaining_sessions:
            self.remaining_sessions = self.total_sessions
            
    @staticmethod
    def generate_unique_code(length: int = 12) -> str:
        """Gera um código único para o voucher"""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(characters) for _ in range(length))
            # Verificar se o código já existe
            if not Voucher.query.filter_by(code=code).first():
                return code
                
    def calculate_expiry_date(self) -> datetime:
        """Calcula a data de expiração baseada no tipo"""
        base_date = self.valid_from or datetime.now(pytz.UTC)
        
        if self.voucher_type == VoucherType.SINGLE:
            return base_date + timedelta(days=90)  # 3 meses
        elif self.voucher_type == VoucherType.PACKAGE:
            return base_date + timedelta(days=180)  # 6 meses
        elif self.voucher_type == VoucherType.MONTHLY:
            return base_date + timedelta(days=30)  # 1 mês
        elif self.voucher_type == VoucherType.WEEKLY:
            return base_date + timedelta(days=7)  # 1 semana
        elif self.voucher_type == VoucherType.TRIAL:
            return base_date + timedelta(days=14)  # 2 semanas
        else:
            return base_date + timedelta(days=90)  # Padrão
            
    @property
    def voucher_type_display(self) -> str:
        """Retorna o tipo do voucher formatado"""
        type_names = {
            VoucherType.SINGLE: "Sessão Avulsa",
            VoucherType.PACKAGE: "Pacote",
            VoucherType.MONTHLY: "Mensal",
            VoucherType.WEEKLY: "Semanal",
            VoucherType.TRIAL: "Experimental"
        }
        return type_names.get(self.voucher_type, self.voucher_type.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            VoucherStatus.PENDING: "Pendente Pagamento",
            VoucherStatus.ACTIVE: "Ativo",
            VoucherStatus.USED: "Utilizado",
            VoucherStatus.EXPIRED: "Expirado",
            VoucherStatus.CANCELLED: "Cancelado",
            VoucherStatus.REFUNDED: "Reembolsado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_active(self) -> bool:
        """Verifica se o voucher está ativo"""
        return (
            self.status == VoucherStatus.ACTIVE and
            self.remaining_sessions > 0 and
            datetime.now(pytz.UTC) <= self.valid_until
        )
        
    @property
    def is_expired(self) -> bool:
        """Verifica se o voucher está expirado"""
        return datetime.now(pytz.UTC) > self.valid_until
        
    @property
    def days_until_expiry(self) -> int:
        """Retorna quantos dias faltam para expirar"""
        if self.is_expired:
            return 0
        delta = self.valid_until - datetime.now(pytz.UTC)
        return delta.days
        
    @property
    def usage_percentage(self) -> float:
        """Retorna a porcentagem de uso"""
        if self.total_sessions == 0:
            return 0
        return (self.used_sessions / self.total_sessions) * 100
        
    @property
    def discount_percentage(self) -> float:
        """Retorna a porcentagem de desconto"""
        if self.original_price == 0:
            return 0
        return (self.discount_amount / self.original_price) * 100
        
    def get_service_types(self) -> list:
        """Retorna os tipos de serviço permitidos"""
        return self.service_types or []
        
    def add_service_type(self, service_type: str):
        """Adiciona um tipo de serviço permitido"""
        types = self.get_service_types()
        if service_type not in types:
            types.append(service_type)
            self.service_types = types
            
    def get_location_restrictions(self) -> list:
        """Retorna as restrições de local"""
        return self.location_restrictions or []
        
    def add_location_restriction(self, location: str, restriction_type: str = "allowed"):
        """Adiciona uma restrição de local"""
        restrictions = self.get_location_restrictions()
        restriction = {
            'location': location,
            'type': restriction_type,  # allowed, forbidden
            'added_at': datetime.now().isoformat()
        }
        restrictions.append(restriction)
        self.location_restrictions = restrictions
        
    def activate(self):
        """Ativa o voucher"""
        self.status = VoucherStatus.ACTIVE
        self.activated_at = datetime.now(pytz.UTC)
        self.payment_status = 'completed'
        if not self.payment_date:
            self.payment_date = datetime.now(pytz.UTC)
            
    def use_session(self, usage_notes: str = None) -> bool:
        """Usa uma sessão do voucher"""
        if not self.is_active:
            return False
            
        if self.remaining_sessions <= 0:
            return False
            
        self.used_sessions += 1
        self.remaining_sessions -= 1
        self.last_use_date = datetime.now(pytz.UTC)
        
        if not self.first_use_date:
            self.first_use_date = datetime.now(pytz.UTC)
            
        # Se for voucher de sessão única e foi usado, marcar como usado
        if self.voucher_type == VoucherType.SINGLE and self.remaining_sessions == 0:
            self.status = VoucherStatus.USED
            
        return True
        
    def cancel_session_usage(self, reason: str = None):
        """Cancela o uso de uma sessão (devolve a sessão)"""
        if self.used_sessions > 0:
            self.used_sessions -= 1
            self.remaining_sessions += 1
            self.total_cancellations += 1
            
            if reason:
                if self.internal_notes:
                    self.internal_notes += f"\n\nCancelamento: {reason}"
                else:
                    self.internal_notes = f"Cancelamento: {reason}"
                    
            # Se estava marcado como usado, voltar para ativo
            if self.status == VoucherStatus.USED and self.remaining_sessions > 0:
                self.status = VoucherStatus.ACTIVE
                
    def register_no_show(self):
        """Registra uma falta (não devolve a sessão)"""
        self.total_no_shows += 1
        
    def extend_validity(self, days: int, reason: str = None):
        """Estende a validade do voucher"""
        self.valid_until += timedelta(days=days)
        
        if reason:
            if self.internal_notes:
                self.internal_notes += f"\n\nExtensão de {days} dias: {reason}"
            else:
                self.internal_notes = f"Extensão de {days} dias: {reason}"
                
    def transfer_to_patient(self, new_patient_id: int, reason: str = None):
        """Transfere o voucher para outro paciente"""
        if not self.is_transferable:
            return False
            
        self.transferred_to = new_patient_id
        self.transfer_date = datetime.now(pytz.UTC)
        self.transfer_reason = reason
        
        # Atualizar o patient_id
        old_patient_id = self.patient_id
        self.patient_id = new_patient_id
        
        if self.internal_notes:
            self.internal_notes += f"\n\nTransferido do paciente {old_patient_id} para {new_patient_id}"
        else:
            self.internal_notes = f"Transferido do paciente {old_patient_id} para {new_patient_id}"
            
        return True
        
    def cancel(self, reason: str = None):
        """Cancela o voucher"""
        self.status = VoucherStatus.CANCELLED
        self.cancellation_reason = reason
        self.expired_at = datetime.now(pytz.UTC)
        
    def refund(self, amount: float = None, reason: str = None):
        """Processa reembolso do voucher"""
        self.status = VoucherStatus.REFUNDED
        self.refund_amount = amount or self.final_price
        self.refund_reason = reason
        self.refund_date = datetime.now(pytz.UTC)
        
    def check_expiry(self):
        """Verifica e atualiza status de expiração"""
        if self.is_expired and self.status == VoucherStatus.ACTIVE:
            self.status = VoucherStatus.EXPIRED
            self.expired_at = datetime.now(pytz.UTC)
            
    def can_be_used_for_service(self, service_type: str, location: str = None) -> bool:
        """Verifica se o voucher pode ser usado para um serviço específico"""
        if not self.is_active:
            return False
            
        # Verificar tipo de serviço
        allowed_services = self.get_service_types()
        if allowed_services and service_type not in allowed_services:
            return False
            
        # Verificar restrições de local
        if location:
            restrictions = self.get_location_restrictions()
            for restriction in restrictions:
                if restriction['location'] == location:
                    if restriction['type'] == 'forbidden':
                        return False
                    elif restriction['type'] == 'allowed':
                        return True
                        
        return True
        
    def calculate_refund_amount(self, refund_type: str = "proportional") -> float:
        """Calcula o valor de reembolso"""
        if refund_type == "full":
            return self.final_price
        elif refund_type == "proportional":
            # Reembolso proporcional às sessões não utilizadas
            if self.total_sessions == 0:
                return 0
            unused_percentage = self.remaining_sessions / self.total_sessions
            return self.final_price * unused_percentage
        elif refund_type == "none":
            return 0
        else:
            return 0
            
    @classmethod
    def get_by_code(cls, code: str):
        """Busca voucher por código"""
        return cls.query.filter_by(code=code).first()
        
    @classmethod
    def get_active_by_patient(cls, patient_id: int):
        """Retorna vouchers ativos de um paciente"""
        return cls.query.filter_by(
            patient_id=patient_id,
            status=VoucherStatus.ACTIVE
        ).filter(
            cls.remaining_sessions > 0,
            cls.valid_until > datetime.now(pytz.UTC)
        ).all()
        
    @classmethod
    def get_by_partner(cls, partner_id: int, status: VoucherStatus = None):
        """Retorna vouchers de um parceiro"""
        query = cls.query.filter_by(partner_id=partner_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_expiring_soon(cls, days: int = 7):
        """Retorna vouchers que expiram em X dias"""
        expiry_date = datetime.now(pytz.UTC) + timedelta(days=days)
        return cls.query.filter(
            cls.status == VoucherStatus.ACTIVE,
            cls.valid_until <= expiry_date,
            cls.remaining_sessions > 0
        ).all()
        
    @classmethod
    def get_expired(cls):
        """Retorna vouchers expirados que ainda estão marcados como ativos"""
        return cls.query.filter(
            cls.status == VoucherStatus.ACTIVE,
            cls.valid_until < datetime.now(pytz.UTC)
        ).all()
        
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte o voucher para dicionário"""
        data = {
            'id': self.id,
            'code': self.code,
            'patient_id': self.patient_id,
            'partner_id': self.partner_id,
            'voucher_type': self.voucher_type.value,
            'voucher_type_display': self.voucher_type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'total_sessions': self.total_sessions,
            'used_sessions': self.used_sessions,
            'remaining_sessions': self.remaining_sessions,
            'valid_from': self.valid_from.isoformat(),
            'valid_until': self.valid_until.isoformat(),
            'original_price': self.original_price,
            'discount_amount': self.discount_amount,
            'final_price': self.final_price,
            'session_duration': self.session_duration,
            'is_active': self.is_active,
            'is_expired': self.is_expired,
            'days_until_expiry': self.days_until_expiry,
            'usage_percentage': self.usage_percentage,
            'discount_percentage': self.discount_percentage,
            'is_transferable': self.is_transferable,
            'payment_status': self.payment_status,
            'service_types': self.get_service_types(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            # Incluir dados sensíveis
            sensitive_fields = [
                'purchased_by', 'payment_method', 'payment_date', 'payment_reference',
                'purchase_channel', 'referral_code', 'first_use_date', 'last_use_date',
                'total_no_shows', 'total_cancellations', 'transferred_to', 'transfer_date',
                'transfer_reason', 'auto_renewal', 'renewal_discount', 'notes',
                'special_instructions', 'internal_notes', 'cancellation_reason',
                'refund_reason', 'refund_amount', 'refund_date', 'activated_at', 'expired_at'
            ]
            
            for field in sensitive_fields:
                value = getattr(self, field)
                if isinstance(value, datetime):
                    data[field] = value.isoformat() if value else None
                else:
                    data[field] = value
                    
            data['location_restrictions'] = self.get_location_restrictions()
            
        return data
        
    def __repr__(self):
        return f'<Voucher {self.code} - {self.voucher_type.value} - {self.status.value}>'


class VoucherUsage(db.Model):
    """Model para registrar o uso de vouchers"""
    
    __tablename__ = 'voucher_usages'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    voucher_id = Column(Integer, ForeignKey('vouchers.id'), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True, index=True)
    
    # Status do uso
    status = Column(Enum(VoucherUsageStatus), default=VoucherUsageStatus.SCHEDULED, nullable=False)
    
    # Data e hora
    scheduled_date = Column(DateTime, nullable=False)  # Data agendada
    actual_date = Column(DateTime, nullable=True)  # Data real de uso
    duration = Column(Integer, nullable=True)  # Duração real (minutos)
    
    # Localização
    service_location = Column(String(200), nullable=True)  # Local do serviço
    service_type = Column(String(100), nullable=True)  # Tipo de serviço
    
    # Avaliação
    patient_rating = Column(Integer, nullable=True)  # Avaliação do paciente (1-5)
    partner_rating = Column(Integer, nullable=True)  # Avaliação do parceiro (1-5)
    patient_feedback = Column(Text, nullable=True)  # Feedback do paciente
    partner_feedback = Column(Text, nullable=True)  # Feedback do parceiro
    
    # Observações
    notes = Column(Text, nullable=True)  # Observações
    cancellation_reason = Column(Text, nullable=True)  # Motivo do cancelamento
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    voucher = relationship('Voucher', back_populates='voucher_usages')
    appointment = relationship('Appointment')
    
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            VoucherUsageStatus.SCHEDULED: "Agendado",
            VoucherUsageStatus.COMPLETED: "Concluído",
            VoucherUsageStatus.CANCELLED: "Cancelado",
            VoucherUsageStatus.NO_SHOW: "Faltou"
        }
        return status_names.get(self.status, self.status.value)
        
    def complete_usage(self, duration: int = None, notes: str = None):
        """Marca o uso como concluído"""
        self.status = VoucherUsageStatus.COMPLETED
        self.actual_date = datetime.now(pytz.UTC)
        if duration:
            self.duration = duration
        if notes:
            self.notes = notes
            
    def cancel_usage(self, reason: str = None):
        """Cancela o uso"""
        self.status = VoucherUsageStatus.CANCELLED
        self.cancellation_reason = reason
        
    def mark_no_show(self):
        """Marca como falta"""
        self.status = VoucherUsageStatus.NO_SHOW
        self.actual_date = datetime.now(pytz.UTC)
        
    def to_dict(self) -> dict:
        """Converte o uso para dicionário"""
        return {
            'id': self.id,
            'voucher_id': self.voucher_id,
            'appointment_id': self.appointment_id,
            'status': self.status.value,
            'status_display': self.status_display,
            'scheduled_date': self.scheduled_date.isoformat(),
            'actual_date': self.actual_date.isoformat() if self.actual_date else None,
            'duration': self.duration,
            'service_location': self.service_location,
            'service_type': self.service_type,
            'patient_rating': self.patient_rating,
            'partner_rating': self.partner_rating,
            'patient_feedback': self.patient_feedback,
            'partner_feedback': self.partner_feedback,
            'notes': self.notes,
            'cancellation_reason': self.cancellation_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<VoucherUsage {self.voucher_id} - {self.status.value}>'