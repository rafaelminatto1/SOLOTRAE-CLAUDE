# -*- coding: utf-8 -*-
"""
Database - FisioFlow Backend

Este módulo contém a configuração e inicialização do banco de dados,
incluindo todos os models e relacionamentos do sistema.

Models incluídos:
- User (usuários do sistema)
- Patient (pacientes)
- Appointment (agendamentos)
- Exercise (exercícios)
- Prescription (prescrições)
- Partnership (parcerias)
- Voucher (vouchers)
- Notification (notificações)
- AuditLog (logs de auditoria)
- E muitos outros...
"""

import os
import enum
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session, relationship
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Time,
    Numeric, JSON, LargeBinary, Enum, ForeignKey, Index, UniqueConstraint,
    CheckConstraint, Table
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import uuid
import json
from cryptography.fernet import Fernet

# Inicialização do SQLAlchemy
db = SQLAlchemy()

# Base para todos os models
Base = declarative_base()

# Enums para o sistema
class UserRole(enum.Enum):
    """Roles de usuários no sistema"""
    ADMIN = "ADMIN"
    FISIOTERAPEUTA = "FISIOTERAPEUTA"
    ESTAGIARIO = "ESTAGIARIO"
    PACIENTE = "PACIENTE"
    PARCEIRO = "PARCEIRO"

class AppointmentStatus(enum.Enum):
    """Status de agendamentos"""
    AGENDADO = "AGENDADO"
    CONFIRMADO = "CONFIRMADO"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"
    NAO_COMPARECEU = "NAO_COMPARECEU"
    REAGENDADO = "REAGENDADO"

class AppointmentType(enum.Enum):
    """Tipos de agendamento"""
    CONSULTA = "CONSULTA"
    RETORNO = "RETORNO"
    AVALIACAO = "AVALIACAO"
    SESSAO = "SESSAO"
    TELECONSULTA = "TELECONSULTA"

class ExerciseCategory(enum.Enum):
    """Categorias de exercícios"""
    CERVICAL = "CERVICAL"
    MEMBROS_SUPERIORES = "MEMBROS_SUPERIORES"
    TRONCO = "TRONCO"
    MEMBROS_INFERIORES = "MEMBROS_INFERIORES"
    MOBILIZACAO_NEURAL = "MOBILIZACAO_NEURAL"
    MOBILIDADE_GERAL = "MOBILIDADE_GERAL"

class ExerciseDifficulty(enum.Enum):
    """Níveis de dificuldade dos exercícios"""
    INICIANTE = "INICIANTE"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"

class VoucherType(enum.Enum):
    """Tipos de voucher"""
    AVULSO = "AVULSO"
    MENSAL = "MENSAL"
    PACOTE = "PACOTE"

class VoucherStatus(enum.Enum):
    """Status do voucher"""
    ATIVO = "ATIVO"
    USADO = "USADO"
    EXPIRADO = "EXPIRADO"
    CANCELADO = "CANCELADO"

class NotificationType(enum.Enum):
    """Tipos de notificação"""
    SISTEMA = "SISTEMA"
    AGENDAMENTO = "AGENDAMENTO"
    EXERCICIO = "EXERCICIO"
    FINANCEIRO = "FINANCEIRO"
    MARKETING = "MARKETING"

class NotificationPriority(enum.Enum):
    """Prioridades de notificação"""
    BAIXA = "BAIXA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"
    URGENTE = "URGENTE"

class AuditAction(enum.Enum):
    """Ações de auditoria"""
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EXPORT = "EXPORT"
    IMPORT = "IMPORT"

class PaymentStatus(enum.Enum):
    """Status de pagamento"""
    PENDENTE = "PENDENTE"
    PAGO = "PAGO"
    CANCELADO = "CANCELADO"
    ESTORNADO = "ESTORNADO"

class WithdrawalStatus(enum.Enum):
    """Status de saque"""
    SOLICITADO = "SOLICITADO"
    PROCESSANDO = "PROCESSANDO"
    CONCLUIDO = "CONCLUIDO"
    REJEITADO = "REJEITADO"

# Tabelas de associação (many-to-many)
user_specialties = Table(
    'user_specialties',
    db.Model.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('specialty_id', Integer, ForeignKey('specialties.id'), primary_key=True)
)

exercise_body_parts = Table(
    'exercise_body_parts',
    db.Model.metadata,
    Column('exercise_id', Integer, ForeignKey('exercises.id'), primary_key=True),
    Column('body_part_id', Integer, ForeignKey('body_parts.id'), primary_key=True)
)

exercise_equipments = Table(
    'exercise_equipments',
    db.Model.metadata,
    Column('exercise_id', Integer, ForeignKey('exercises.id'), primary_key=True),
    Column('equipment_id', Integer, ForeignKey('equipments.id'), primary_key=True)
)

patient_conditions = Table(
    'patient_conditions',
    db.Model.metadata,
    Column('patient_id', Integer, ForeignKey('patients.id'), primary_key=True),
    Column('condition_id', Integer, ForeignKey('medical_conditions.id'), primary_key=True)
)

# Mixin para campos comuns
class TimestampMixin:
    """Mixin para campos de timestamp"""
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    """Mixin para soft delete"""
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

# Models principais
class User(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para usuários do sistema"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Informações básicas
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    full_name = Column(String(200), nullable=False)
    
    # Informações profissionais
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FISIOTERAPEUTA)
    crefito = Column(String(20), unique=True, nullable=True)
    crefito_verified = Column(Boolean, default=False, nullable=False)
    
    # Informações de contato
    phone = Column(String(20), nullable=True)
    phone_verified = Column(Boolean, default=False, nullable=False)
    
    # Informações de perfil
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)
    
    # Configurações de conta
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    
    # Configurações de segurança
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    two_factor_secret = Column(String(32), nullable=True)
    backup_codes = Column(JSON, nullable=True)
    last_login = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    
    # Configurações de notificação
    notification_preferences = Column(JSON, nullable=True, default=lambda: {
        'email': True,
        'push': True,
        'sms': False,
        'appointments': True,
        'exercises': True,
        'marketing': False,
        'system': True
    })
    
    # Configurações de privacidade
    privacy_settings = Column(JSON, nullable=True, default=lambda: {
        'data_sharing': False,
        'analytics': True,
        'marketing_emails': False,
        'profile_visibility': 'private'
    })
    
    # Relacionamentos
    specialties = relationship('Specialty', secondary=user_specialties, back_populates='users')
    appointments_as_professional = relationship('Appointment', foreign_keys='Appointment.professional_id', back_populates='professional')
    prescriptions = relationship('Prescription', back_populates='professional')
    partnerships = relationship('Partnership', back_populates='user')
    notifications = relationship('Notification', back_populates='user')
    audit_logs = relationship('AuditLog', back_populates='user')
    ai_usage = relationship('AIUsage', back_populates='user')
    
    # Índices
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_role', 'role'),
        Index('idx_user_crefito', 'crefito'),
        Index('idx_user_active', 'is_active'),
    )
    
    def set_password(self, password: str) -> None:
        """Definir senha com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """Verificar senha"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Converter para dicionário"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'role': self.role.value,
            'crefito': self.crefito,
            'crefito_verified': self.crefito_verified,
            'phone': self.phone,
            'phone_verified': self.phone_verified,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'experience_years': self.experience_years,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'email_verified': self.email_verified,
            'two_factor_enabled': self.two_factor_enabled,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data.update({
                'notification_preferences': self.notification_preferences,
                'privacy_settings': self.privacy_settings
            })
        
        return data

class Patient(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para pacientes"""
    __tablename__ = 'patients'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Informações pessoais
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    full_name = Column(String(200), nullable=False)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    rg = Column(String(20), nullable=True)
    birth_date = Column(Date, nullable=False)
    gender = Column(String(10), nullable=True)
    
    # Informações de contato
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=False)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    
    # Endereço
    address_street = Column(String(200), nullable=True)
    address_number = Column(String(10), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zipcode = Column(String(10), nullable=True)
    
    # Informações médicas
    medical_history = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    previous_surgeries = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    
    # Informações profissionais
    occupation = Column(String(100), nullable=True)
    work_activities = Column(Text, nullable=True)
    physical_activities = Column(Text, nullable=True)
    
    # Configurações
    is_active = Column(Boolean, default=True, nullable=False)
    consent_data_processing = Column(Boolean, default=False, nullable=False)
    consent_marketing = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime, nullable=True)
    
    # Informações de acesso (se tiver conta)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Relacionamentos
    user = relationship('User', backref='patient_profile')
    appointments = relationship('Appointment', back_populates='patient')
    prescriptions = relationship('Prescription', back_populates='patient')
    medical_records = relationship('MedicalRecord', back_populates='patient')
    conditions = relationship('MedicalCondition', secondary=patient_conditions, back_populates='patients')
    vouchers = relationship('Voucher', back_populates='patient')
    
    # Índices
    __table_args__ = (
        Index('idx_patient_cpf', 'cpf'),
        Index('idx_patient_email', 'email'),
        Index('idx_patient_phone', 'phone'),
        Index('idx_patient_active', 'is_active'),
        Index('idx_patient_birth_date', 'birth_date'),
    )
    
    def calculate_age(self) -> int:
        """Calcular idade do paciente"""
        today = datetime.now().date()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Converter para dicionário"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'birth_date': self.birth_date.isoformat(),
            'age': self.calculate_age(),
            'gender': self.gender,
            'phone': self.phone,
            'email': self.email,
            'occupation': self.occupation,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data.update({
                'cpf': self.cpf,
                'rg': self.rg,
                'emergency_contact': self.emergency_contact,
                'emergency_phone': self.emergency_phone,
                'address_street': self.address_street,
                'address_number': self.address_number,
                'address_complement': self.address_complement,
                'address_neighborhood': self.address_neighborhood,
                'address_city': self.address_city,
                'address_state': self.address_state,
                'address_zipcode': self.address_zipcode,
                'medical_history': self.medical_history,
                'current_medications': self.current_medications,
                'allergies': self.allergies,
                'previous_surgeries': self.previous_surgeries,
                'family_history': self.family_history,
                'work_activities': self.work_activities,
                'physical_activities': self.physical_activities,
                'consent_data_processing': self.consent_data_processing,
                'consent_marketing': self.consent_marketing,
                'consent_date': self.consent_date.isoformat() if self.consent_date else None
            })
        
        return data

class Appointment(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para agendamentos"""
    __tablename__ = 'appointments'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Relacionamentos
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    professional_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Informações do agendamento
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, default=60, nullable=False)
    
    # Tipo e status
    appointment_type = Column(Enum(AppointmentType), nullable=False, default=AppointmentType.CONSULTA)
    status = Column(Enum(AppointmentStatus), nullable=False, default=AppointmentStatus.AGENDADO)
    
    # Informações adicionais
    title = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Informações de valor
    price = Column(Numeric(10, 2), nullable=True)
    payment_status = Column(Enum(PaymentStatus), nullable=True)
    payment_method = Column(String(50), nullable=True)
    
    # Configurações
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_pattern = Column(JSON, nullable=True)
    parent_appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True)
    
    # Teleconsulta
    is_teleconsultation = Column(Boolean, default=False, nullable=False)
    meeting_url = Column(String(500), nullable=True)
    meeting_id = Column(String(100), nullable=True)
    
    # Confirmação e check-in
    confirmed_at = Column(DateTime, nullable=True)
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    
    # Cancelamento
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='appointments')
    professional = relationship('User', foreign_keys=[professional_id], back_populates='appointments_as_professional')
    cancelled_by = relationship('User', foreign_keys=[cancelled_by_id])
    parent_appointment = relationship('Appointment', remote_side=[id])
    child_appointments = relationship('Appointment', remote_side=[parent_appointment_id])
    medical_record = relationship('MedicalRecord', back_populates='appointment', uselist=False)
    
    # Índices
    __table_args__ = (
        Index('idx_appointment_date', 'appointment_date'),
        Index('idx_appointment_time', 'appointment_time'),
        Index('idx_appointment_patient', 'patient_id'),
        Index('idx_appointment_professional', 'professional_id'),
        Index('idx_appointment_status', 'status'),
        Index('idx_appointment_type', 'appointment_type'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'patient_id': self.patient_id,
            'professional_id': self.professional_id,
            'appointment_date': self.appointment_date.isoformat(),
            'appointment_time': self.appointment_time.isoformat(),
            'duration_minutes': self.duration_minutes,
            'appointment_type': self.appointment_type.value,
            'status': self.status.value,
            'title': self.title,
            'description': self.description,
            'notes': self.notes,
            'price': float(self.price) if self.price else None,
            'payment_status': self.payment_status.value if self.payment_status else None,
            'payment_method': self.payment_method,
            'is_recurring': self.is_recurring,
            'is_teleconsultation': self.is_teleconsultation,
            'meeting_url': self.meeting_url,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None,
            'checked_out_at': self.checked_out_at.isoformat() if self.checked_out_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'cancellation_reason': self.cancellation_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Exercise(db.Model, TimestampMixin, SoftDeleteMixin):
    """Model para exercícios"""
    __tablename__ = 'exercises'
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Informações básicas
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    
    # Categorização
    category = Column(Enum(ExerciseCategory), nullable=False, index=True)
    difficulty = Column(Enum(ExerciseDifficulty), nullable=False, default=ExerciseDifficulty.INICIANTE)
    
    # Mídia
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    
    # Configurações
    duration_seconds = Column(Integer, nullable=True)
    repetitions = Column(Integer, nullable=True)
    sets = Column(Integer, nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    
    # Metadados
    calories_burned = Column(Integer, nullable=True)
    muscle_groups = Column(JSON, nullable=True)
    contraindications = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    
    # Estatísticas
    usage_count = Column(Integer, default=0, nullable=False)
    rating_average = Column(Numeric(3, 2), nullable=True)
    rating_count = Column(Integer, default=0, nullable=False)
    
    # Relacionamentos
    body_parts = relationship('BodyPart', secondary=exercise_body_parts, back_populates='exercises')
    equipments = relationship('Equipment', secondary=exercise_equipments, back_populates='exercises')
    prescription_exercises = relationship('PrescriptionExercise', back_populates='exercise')
    
    # Índices
    __table_args__ = (
        Index('idx_exercise_name', 'name'),
        Index('idx_exercise_category', 'category'),
        Index('idx_exercise_difficulty', 'difficulty'),
        Index('idx_exercise_active', 'is_active'),
        Index('idx_exercise_featured', 'is_featured'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'description': self.description,
            'instructions': self.instructions,
            'category': self.category.value,
            'difficulty': self.difficulty.value,
            'image_url': self.image_url,
            'video_url': self.video_url,
            'thumbnail_url': self.thumbnail_url,
            'duration_seconds': self.duration_seconds,
            'repetitions': self.repetitions,
            'sets': self.sets,
            'rest_seconds': self.rest_seconds,
            'calories_burned': self.calories_burned,
            'muscle_groups': self.muscle_groups,
            'contraindications': self.contraindications,
            'benefits': self.benefits,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'usage_count': self.usage_count,
            'rating_average': float(self.rating_average) if self.rating_average else None,
            'rating_count': self.rating_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Continuação dos models...
# (Devido ao limite de caracteres, vou continuar em outro arquivo)

# Função para inicializar o banco de dados
def init_database(app):
    """Inicializar banco de dados"""
    db.init_app(app)
    
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Executar seeds se necessário
        if app.config.get('ENV') == 'development':
            seed_database()

def seed_database():
    """Popular banco com dados iniciais"""
    # Verificar se já existem dados
    if User.query.first():
        return
    
    # Criar usuário admin
    admin = User(
        email='admin@fisioflow.com',
        first_name='Admin',
        last_name='Sistema',
        full_name='Admin Sistema',
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
        email_verified=True
    )
    admin.set_password('admin123')
    
    db.session.add(admin)
    db.session.commit()
    
    print("Banco de dados populado com dados iniciais")