# -*- coding: utf-8 -*-
"""
Models Complementares - FisioFlow Backend

Este módulo contém os models complementares do sistema que não foram
incluídos no arquivo database.py devido ao limite de tamanho.

Models incluídos:
- Prescription (prescrições)
- Partnership (parcerias)
- Voucher (vouchers)
- Notification (notificações)
- AuditLog (logs de auditoria)
- E outros models auxiliares
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Time,
    Numeric, JSON, LargeBinary, Enum, ForeignKey, Index, UniqueConstraint,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import db, TimestampMixin, SoftDeleteMixin
from database import (
    VoucherType, VoucherStatus, NotificationType, NotificationPriority,
    AuditAction, PaymentStatus, WithdrawalStatus
)
import uuid
import json

class Prescription(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para prescrições de exercícios"""
    __tablename__ = 'prescriptions'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamentos
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    professional_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True)
    
    # Informações da prescrição
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    
    # Configurações
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    frequency_per_week = Column(Integer, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_date = Column(Date, nullable=True)
    
    # Observações
    notes = Column(Text, nullable=True)
    patient_feedback = Column(Text, nullable=True)
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='prescriptions')
    professional = relationship('User', back_populates='prescriptions')
    appointment = relationship('Appointment')
    exercises = relationship('PrescriptionExercise', back_populates='prescription')
    
    # Índices
    __table_args__ = (
        Index('idx_prescription_patient', 'patient_id'),
        Index('idx_prescription_professional', 'professional_id'),
        Index('idx_prescription_active', 'is_active'),
        Index('idx_prescription_start_date', 'start_date'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'patient_id': self.patient_id,
            'professional_id': self.professional_id,
            'appointment_id': self.appointment_id,
            'title': self.title,
            'description': self.description,
            'objectives': self.objectives,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'frequency_per_week': self.frequency_per_week,
            'is_active': self.is_active,
            'is_completed': self.is_completed,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'notes': self.notes,
            'patient_feedback': self.patient_feedback,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class PrescriptionExercise(db.Model, TimestampMixin):
    """Model para exercícios em prescrições"""
    __tablename__ = 'prescription_exercises'
    
    id = Column(Integer, primary_key=True)
    
    # Relacionamentos
    prescription_id = Column(Integer, ForeignKey('prescriptions.id'), nullable=False)
    exercise_id = Column(Integer, ForeignKey('exercises.id'), nullable=False)
    
    # Configurações específicas
    sets = Column(Integer, nullable=True)
    repetitions = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)
    
    # Ordem na prescrição
    order_index = Column(Integer, nullable=False, default=0)
    
    # Observações específicas
    notes = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relacionamentos
    prescription = relationship('Prescription', back_populates='exercises')
    exercise = relationship('Exercise', back_populates='prescription_exercises')
    
    # Índices
    __table_args__ = (
        Index('idx_prescription_exercise_prescription', 'prescription_id'),
        Index('idx_prescription_exercise_exercise', 'exercise_id'),
        Index('idx_prescription_exercise_order', 'order_index'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'prescription_id': self.prescription_id,
            'exercise_id': self.exercise_id,
            'sets': self.sets,
            'repetitions': self.repetitions,
            'duration_seconds': self.duration_seconds,
            'rest_seconds': self.rest_seconds,
            'weight_kg': float(self.weight_kg) if self.weight_kg else None,
            'order_index': self.order_index,
            'notes': self.notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Partnership(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para parcerias (educadoras físicas)"""
    __tablename__ = 'partnerships'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamento com usuário
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Informações da parceria
    business_name = Column(String(200), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=True)
    cpf = Column(String(14), unique=True, nullable=True)
    
    # Informações de contato
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    
    # Endereço
    address_street = Column(String(200), nullable=True)
    address_number = Column(String(10), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zipcode = Column(String(10), nullable=True)
    
    # Configurações financeiras
    commission_percentage = Column(Numeric(5, 2), default=Decimal('80.00'), nullable=False)
    platform_fee_percentage = Column(Numeric(5, 2), default=Decimal('10.00'), nullable=False)
    gateway_fee_percentage = Column(Numeric(5, 2), default=Decimal('3.00'), nullable=False)
    tax_percentage = Column(Numeric(5, 2), default=Decimal('7.00'), nullable=False)
    
    # Informações bancárias
    bank_name = Column(String(100), nullable=True)
    bank_code = Column(String(10), nullable=True)
    agency = Column(String(20), nullable=True)
    account_number = Column(String(20), nullable=True)
    account_type = Column(String(20), nullable=True)
    pix_key = Column(String(100), nullable=True)
    pix_key_type = Column(String(20), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_date = Column(DateTime, nullable=True)
    
    # Estatísticas
    total_earnings = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)
    total_sessions = Column(Integer, default=0, nullable=False)
    total_clients = Column(Integer, default=0, nullable=False)
    
    # Relacionamentos
    user = relationship('User', back_populates='partnerships')
    vouchers = relationship('Voucher', back_populates='partnership')
    sessions = relationship('PartnershipSession', back_populates='partnership')
    withdrawals = relationship('PartnershipWithdrawal', back_populates='partnership')
    
    # Índices
    __table_args__ = (
        Index('idx_partnership_user', 'user_id'),
        Index('idx_partnership_cnpj', 'cnpj'),
        Index('idx_partnership_cpf', 'cpf'),
        Index('idx_partnership_active', 'is_active'),
        Index('idx_partnership_verified', 'is_verified'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'user_id': self.user_id,
            'business_name': self.business_name,
            'cnpj': self.cnpj,
            'cpf': self.cpf,
            'email': self.email,
            'phone': self.phone,
            'commission_percentage': float(self.commission_percentage),
            'platform_fee_percentage': float(self.platform_fee_percentage),
            'gateway_fee_percentage': float(self.gateway_fee_percentage),
            'tax_percentage': float(self.tax_percentage),
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'total_earnings': float(self.total_earnings),
            'total_sessions': self.total_sessions,
            'total_clients': self.total_clients,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Voucher(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para vouchers de treino"""
    __tablename__ = 'vouchers'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamentos
    partnership_id = Column(Integer, ForeignKey('partnerships.id'), nullable=False)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    
    # Informações do voucher
    code = Column(String(20), unique=True, nullable=False, index=True)
    voucher_type = Column(Enum(VoucherType), nullable=False)
    status = Column(Enum(VoucherStatus), nullable=False, default=VoucherStatus.ATIVO)
    
    # Configurações
    sessions_total = Column(Integer, nullable=False)
    sessions_used = Column(Integer, default=0, nullable=False)
    
    # Valores
    price = Column(Numeric(10, 2), nullable=False)
    commission_amount = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), nullable=False)
    gateway_fee = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), nullable=False)
    net_amount = Column(Numeric(10, 2), nullable=False)
    
    # Datas
    purchase_date = Column(DateTime, nullable=False, default=func.now())
    expiry_date = Column(Date, nullable=True)
    first_use_date = Column(DateTime, nullable=True)
    last_use_date = Column(DateTime, nullable=True)
    
    # Relacionamentos
    partnership = relationship('Partnership', back_populates='vouchers')
    patient = relationship('Patient', back_populates='vouchers')
    sessions = relationship('PartnershipSession', back_populates='voucher')
    
    # Índices
    __table_args__ = (
        Index('idx_voucher_code', 'code'),
        Index('idx_voucher_partnership', 'partnership_id'),
        Index('idx_voucher_patient', 'patient_id'),
        Index('idx_voucher_status', 'status'),
        Index('idx_voucher_type', 'voucher_type'),
        Index('idx_voucher_expiry', 'expiry_date'),
    )
    
    @property
    def sessions_remaining(self) -> int:
        """Sessões restantes"""
        return self.sessions_total - self.sessions_used
    
    @property
    def is_expired(self) -> bool:
        """Verificar se está expirado"""
        if self.expiry_date:
            return datetime.now().date() > self.expiry_date
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'partnership_id': self.partnership_id,
            'patient_id': self.patient_id,
            'code': self.code,
            'voucher_type': self.voucher_type.value,
            'status': self.status.value,
            'sessions_total': self.sessions_total,
            'sessions_used': self.sessions_used,
            'sessions_remaining': self.sessions_remaining,
            'price': float(self.price),
            'commission_amount': float(self.commission_amount),
            'platform_fee': float(self.platform_fee),
            'gateway_fee': float(self.gateway_fee),
            'tax_amount': float(self.tax_amount),
            'net_amount': float(self.net_amount),
            'purchase_date': self.purchase_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'first_use_date': self.first_use_date.isoformat() if self.first_use_date else None,
            'last_use_date': self.last_use_date.isoformat() if self.last_use_date else None,
            'is_expired': self.is_expired,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class PartnershipSession(db.Model, TimestampMixin):
    """Model para sessões de treino com parceiros"""
    __tablename__ = 'partnership_sessions'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamentos
    partnership_id = Column(Integer, ForeignKey('partnerships.id'), nullable=False)
    voucher_id = Column(Integer, ForeignKey('vouchers.id'), nullable=False)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    
    # Informações da sessão
    session_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    # Descrição
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Avaliação
    patient_rating = Column(Integer, nullable=True)  # 1-5
    patient_feedback = Column(Text, nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=True, nullable=False)
    
    # Relacionamentos
    partnership = relationship('Partnership', back_populates='sessions')
    voucher = relationship('Voucher', back_populates='sessions')
    patient = relationship('Patient')
    
    # Índices
    __table_args__ = (
        Index('idx_session_partnership', 'partnership_id'),
        Index('idx_session_voucher', 'voucher_id'),
        Index('idx_session_patient', 'patient_id'),
        Index('idx_session_date', 'session_date'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'partnership_id': self.partnership_id,
            'voucher_id': self.voucher_id,
            'patient_id': self.patient_id,
            'session_date': self.session_date.isoformat(),
            'duration_minutes': self.duration_minutes,
            'description': self.description,
            'notes': self.notes,
            'patient_rating': self.patient_rating,
            'patient_feedback': self.patient_feedback,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class PartnershipWithdrawal(db.Model, TimestampMixin):
    """Model para saques de parceiros"""
    __tablename__ = 'partnership_withdrawals'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamento
    partnership_id = Column(Integer, ForeignKey('partnerships.id'), nullable=False)
    
    # Informações do saque
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(WithdrawalStatus), nullable=False, default=WithdrawalStatus.SOLICITADO)
    
    # Datas
    requested_date = Column(DateTime, nullable=False, default=func.now())
    processed_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    
    # Informações bancárias
    bank_name = Column(String(100), nullable=False)
    bank_code = Column(String(10), nullable=True)
    agency = Column(String(20), nullable=True)
    account_number = Column(String(20), nullable=True)
    pix_key = Column(String(100), nullable=True)
    pix_key_type = Column(String(20), nullable=True)
    
    # Observações
    notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Relacionamento
    partnership = relationship('Partnership', back_populates='withdrawals')
    
    # Índices
    __table_args__ = (
        Index('idx_withdrawal_partnership', 'partnership_id'),
        Index('idx_withdrawal_status', 'status'),
        Index('idx_withdrawal_requested_date', 'requested_date'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'partnership_id': self.partnership_id,
            'amount': float(self.amount),
            'status': self.status.value,
            'requested_date': self.requested_date.isoformat(),
            'processed_date': self.processed_date.isoformat() if self.processed_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'bank_name': self.bank_name,
            'pix_key': self.pix_key,
            'pix_key_type': self.pix_key_type,
            'notes': self.notes,
            'rejection_reason': self.rejection_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Notification(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para notificações"""
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamento
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Informações da notificação
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    priority = Column(Enum(NotificationPriority), nullable=False, default=NotificationPriority.MEDIA)
    
    # Status
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime, nullable=True)
    
    # Metadados
    metadata = Column(JSON, nullable=True)
    action_url = Column(String(500), nullable=True)
    
    # Relacionamento
    user = relationship('User', back_populates='notifications')
    
    # Índices
    __table_args__ = (
        Index('idx_notification_user', 'user_id'),
        Index('idx_notification_type', 'notification_type'),
        Index('idx_notification_priority', 'priority'),
        Index('idx_notification_read', 'is_read'),
        Index('idx_notification_created', 'created_at'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type.value,
            'priority': self.priority.value,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'metadata': self.metadata,
            'action_url': self.action_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AuditLog(db.Model, TimestampMixin):
    """Model para logs de auditoria"""
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamento
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Informações da ação
    action = Column(Enum(AuditAction), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    
    # Detalhes
    description = Column(Text, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    
    # Contexto
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(100), nullable=True)
    
    # Relacionamento
    user = relationship('User', back_populates='audit_logs')
    
    # Índices
    __table_args__ = (
        Index('idx_audit_user', 'user_id'),
        Index('idx_audit_action', 'action'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_created', 'created_at'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'user_id': self.user_id,
            'action': self.action.value,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'description': self.description,
            'old_values': self.old_values,
            'new_values': self.new_values,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'session_id': self.session_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Models auxiliares
class Specialty(db.Model, TimestampMixin):
    """Model para especialidades médicas"""
    __tablename__ = 'specialties'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relacionamento
    users = relationship('User', secondary='user_specialties', back_populates='specialties')

class BodyPart(db.Model, TimestampMixin):
    """Model para partes do corpo"""
    __tablename__ = 'body_parts'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relacionamento
    exercises = relationship('Exercise', secondary='exercise_body_parts', back_populates='body_parts')

class Equipment(db.Model, TimestampMixin):
    """Model para equipamentos"""
    __tablename__ = 'equipments'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relacionamento
    exercises = relationship('Exercise', secondary='exercise_equipments', back_populates='equipments')

class MedicalCondition(db.Model, TimestampMixin):
    """Model para condições médicas"""
    __tablename__ = 'medical_conditions'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icd_code = Column(String(10), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relacionamento
    patients = relationship('Patient', secondary='patient_conditions', back_populates='conditions')

class MedicalRecord(db.Model, TimestampMixin):
    """Model para prontuários médicos"""
    __tablename__ = 'medical_records'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamentos
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=False)
    professional_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Informações do atendimento
    chief_complaint = Column(Text, nullable=True)
    history_present_illness = Column(Text, nullable=True)
    physical_examination = Column(Text, nullable=True)
    assessment = Column(Text, nullable=True)
    plan = Column(Text, nullable=True)
    
    # Sinais vitais
    blood_pressure = Column(String(20), nullable=True)
    heart_rate = Column(Integer, nullable=True)
    temperature = Column(Numeric(4, 1), nullable=True)
    weight = Column(Numeric(5, 2), nullable=True)
    height = Column(Numeric(5, 2), nullable=True)
    
    # Observações
    notes = Column(Text, nullable=True)
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='medical_records')
    appointment = relationship('Appointment', back_populates='medical_record')
    professional = relationship('User')
    
    # Índices
    __table_args__ = (
        Index('idx_medical_record_patient', 'patient_id'),
        Index('idx_medical_record_appointment', 'appointment_id'),
        Index('idx_medical_record_professional', 'professional_id'),
    )

class AIUsage(db.Model, TimestampMixin):
    """Model para uso de IA"""
    __tablename__ = 'ai_usage'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamento
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Informações do uso
    provider = Column(String(50), nullable=False)  # openai, anthropic, gemini, perplexity
    model = Column(String(100), nullable=False)
    task_type = Column(String(50), nullable=False)  # chat, analysis, suggestion
    
    # Métricas
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    cost_usd = Column(Numeric(10, 4), nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    
    # Status
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Relacionamento
    user = relationship('User', back_populates='ai_usage')
    
    # Índices
    __table_args__ = (
        Index('idx_ai_usage_user', 'user_id'),
        Index('idx_ai_usage_provider', 'provider'),
        Index('idx_ai_usage_task_type', 'task_type'),
        Index('idx_ai_usage_created', 'created_at'),
    )

# Função para criar dados iniciais
def create_initial_data():
    """Criar dados iniciais do sistema"""
    
    # Especialidades
    specialties = [
        'Fisioterapia Ortopédica',
        'Fisioterapia Neurológica',
        'Fisioterapia Respiratória',
        'Fisioterapia Pediátrica',
        'Fisioterapia Geriátrica',
        'Fisioterapia Esportiva',
        'Fisioterapia do Trabalho',
        'Fisioterapia Aquática'
    ]
    
    for specialty_name in specialties:
        if not Specialty.query.filter_by(name=specialty_name).first():
            specialty = Specialty(name=specialty_name)
            db.session.add(specialty)
    
    # Partes do corpo
    body_parts = [
        'Cervical', 'Ombro', 'Braço', 'Antebraço', 'Punho', 'Mão',
        'Tórax', 'Abdômen', 'Lombar', 'Quadril', 'Coxa', 'Joelho',
        'Perna', 'Tornozelo', 'Pé'
    ]
    
    for body_part_name in body_parts:
        if not BodyPart.query.filter_by(name=body_part_name).first():
            body_part = BodyPart(name=body_part_name)
            db.session.add(body_part)
    
    # Equipamentos
    equipments = [
        'Sem equipamento', 'Halteres', 'Elástico', 'Bola suíça',
        'Bastão', 'Colchonete', 'Theraband', 'Bosu',
        'Rolo de liberação', 'Peso livre', 'Máquina'
    ]
    
    for equipment_name in equipments:
        if not Equipment.query.filter_by(name=equipment_name).first():
            equipment = Equipment(name=equipment_name)
            db.session.add(equipment)
    
    # Condições médicas comuns
    conditions = [
        {'name': 'Lombalgia', 'icd_code': 'M54.5'},
        {'name': 'Cervicalgia', 'icd_code': 'M54.2'},
        {'name': 'Artrose de joelho', 'icd_code': 'M17'},
        {'name': 'Tendinite do ombro', 'icd_code': 'M75'},
        {'name': 'Hérnia de disco', 'icd_code': 'M51'},
        {'name': 'Fibromialgia', 'icd_code': 'M79.3'},
        {'name': 'Artrite reumatoide', 'icd_code': 'M06'},
        {'name': 'Osteoporose', 'icd_code': 'M81'}
    ]
    
    for condition_data in conditions:
        if not MedicalCondition.query.filter_by(name=condition_data['name']).first():
            condition = MedicalCondition(
                name=condition_data['name'],
                icd_code=condition_data['icd_code']
            )
            db.session.add(condition)
    
    db.session.commit()
    print("Dados iniciais criados com sucesso")