# -*- coding: utf-8 -*-
"""
Model de Usuário
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database import db
import enum
import pytz

class UserRole(enum.Enum):
    """Enum para os perfis de usuário"""
    ADMIN = "ADMIN"  # Proprietário/Administrador
    FISIOTERAPEUTA = "FISIOTERAPEUTA"  # Fisioterapeuta
    ESTAGIARIO = "ESTAGIARIO"  # Estagiário
    PACIENTE = "PACIENTE"  # Paciente
    PARCEIRO = "PARCEIRO"  # Parceiro (Educadora Física)

class User(db.Model):
    """Model para usuários do sistema"""
    
    __tablename__ = 'users'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PACIENTE)
    
    # Campos de controle
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Autenticação 2FA
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    two_factor_secret = Column(String(32), nullable=True)
    backup_codes = Column(Text, nullable=True)  # JSON array de códigos de backup
    
    # Dados profissionais (para fisioterapeutas e estagiários)
    crefito_number = Column(String(20), nullable=True, unique=True)
    crefito_verified = Column(Boolean, default=False, nullable=False)
    specialization = Column(String(200), nullable=True)
    
    # Dados pessoais
    cpf = Column(String(14), nullable=True, unique=True)
    birth_date = Column(DateTime, nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    
    # Configurações de perfil
    avatar_url = Column(String(255), nullable=True)
    timezone = Column(String(50), default='America/Sao_Paulo', nullable=False)
    language = Column(String(5), default='pt-BR', nullable=False)
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    last_login = Column(DateTime, nullable=True)
    last_password_change = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Campos LGPD
    consent_date = Column(DateTime, nullable=True)
    consent_version = Column(String(10), nullable=True)
    data_retention_until = Column(DateTime, nullable=True)
    
    # Relacionamentos
    # Pacientes (se for fisioterapeuta)
    patients = relationship('Patient', back_populates='physiotherapist', foreign_keys='Patient.physiotherapist_id')
    
    # Consultas agendadas
    appointments_as_professional = relationship('Appointment', back_populates='professional', foreign_keys='Appointment.professional_id')
    appointments_as_patient = relationship('Appointment', back_populates='patient', foreign_keys='Appointment.patient_id')
    
    # Prescrições criadas
    prescriptions = relationship('Prescription', back_populates='created_by')
    
    # Consultas de IA
    ai_consultations = relationship('AIConsultation', back_populates='user')
    
    # Logs de auditoria
    audit_logs = relationship('AuditLog', back_populates='user')
    
    # Mentoria (se for estagiário)
    mentorships_as_student = relationship('Mentorship', back_populates='student', foreign_keys='Mentorship.student_id')
    mentorships_as_mentor = relationship('Mentorship', back_populates='mentor', foreign_keys='Mentorship.mentor_id')
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        
    def set_password(self, password: str) -> None:
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)
        self.last_password_change = datetime.now(pytz.UTC)
        
    def check_password(self, password: str) -> bool:
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
        
    def is_admin(self) -> bool:
        """Verifica se o usuário é administrador"""
        return self.role == UserRole.ADMIN
        
    def is_physiotherapist(self) -> bool:
        """Verifica se o usuário é fisioterapeuta"""
        return self.role == UserRole.FISIOTERAPEUTA
        
    def is_intern(self) -> bool:
        """Verifica se o usuário é estagiário"""
        return self.role == UserRole.ESTAGIARIO
        
    def is_patient(self) -> bool:
        """Verifica se o usuário é paciente"""
        return self.role == UserRole.PACIENTE
        
    def is_partner(self) -> bool:
        """Verifica se o usuário é parceiro"""
        return self.role == UserRole.PARCEIRO
        
    def can_access_patient(self, patient_id: int) -> bool:
        """Verifica se o usuário pode acessar um paciente específico"""
        if self.is_admin():
            return True
            
        if self.is_physiotherapist():
            # Fisioterapeuta pode acessar seus pacientes
            from backend.models.patient import Patient
            patient = Patient.query.get(patient_id)
            return patient and patient.physiotherapist_id == self.id
            
        if self.is_intern():
            # Estagiário pode acessar pacientes sob supervisão
            from backend.models.mentorship import Mentorship
            from backend.models.patient import Patient
            
            patient = Patient.query.get(patient_id)
            if not patient:
                return False
                
            # Verificar se há mentoria ativa com o fisioterapeuta responsável
            mentorship = Mentorship.query.filter_by(
                student_id=self.id,
                mentor_id=patient.physiotherapist_id,
                is_active=True
            ).first()
            
            return mentorship is not None
            
        if self.is_patient():
            # Paciente só pode acessar seus próprios dados
            from backend.models.patient import Patient
            patient = Patient.query.filter_by(user_id=self.id).first()
            return patient and patient.id == patient_id
            
        return False
        
    def get_permissions(self) -> list:
        """Retorna as permissões do usuário baseadas no seu perfil"""
        permissions = []
        
        if self.is_admin():
            permissions = [
                'admin.full_access',
                'users.manage',
                'patients.manage',
                'appointments.manage',
                'exercises.manage',
                'financial.manage',
                'reports.view',
                'system.configure'
            ]
        elif self.is_physiotherapist():
            permissions = [
                'patients.manage',
                'appointments.manage',
                'prescriptions.create',
                'medical_records.manage',
                'ai.consult',
                'reports.view_own'
            ]
        elif self.is_intern():
            permissions = [
                'patients.view_assigned',
                'appointments.view_assigned',
                'prescriptions.view',
                'medical_records.view_assigned',
                'mentorship.access'
            ]
        elif self.is_patient():
            permissions = [
                'profile.manage',
                'appointments.view_own',
                'prescriptions.view_own',
                'exercises.execute',
                'evolution.track'
            ]
        elif self.is_partner():
            permissions = [
                'vouchers.manage',
                'financial.view_own',
                'reports.view_own',
                'clients.view_assigned'
            ]
            
        return permissions
        
    def update_last_login(self) -> None:
        """Atualiza o timestamp do último login"""
        self.last_login = datetime.now(pytz.UTC)
        
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte o usuário para dicionário"""
        data = {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role.value,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'phone': self.phone,
            'two_factor_enabled': self.two_factor_enabled,
            'crefito_number': self.crefito_number,
            'crefito_verified': self.crefito_verified,
            'specialization': self.specialization,
            'avatar_url': self.avatar_url,
            'timezone': self.timezone,
            'language': self.language,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'permissions': self.get_permissions()
        }
        
        if include_sensitive:
            data.update({
                'cpf': self.cpf,
                'birth_date': self.birth_date.isoformat() if self.birth_date else None,
                'address': self.address,
                'emergency_contact': self.emergency_contact,
                'emergency_phone': self.emergency_phone
            })
            
        return data
        
    def __repr__(self):
        return f'<User {self.email} ({self.role.value})>'