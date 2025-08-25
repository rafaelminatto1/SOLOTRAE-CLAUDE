# -*- coding: utf-8 -*-
"""
Model de Paciente
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class Gender(enum.Enum):
    """Enum para gênero"""
    MASCULINO = "MASCULINO"
    FEMININO = "FEMININO"
    OUTRO = "OUTRO"
    NAO_INFORMADO = "NAO_INFORMADO"

class MaritalStatus(enum.Enum):
    """Enum para estado civil"""
    SOLTEIRO = "SOLTEIRO"
    CASADO = "CASADO"
    DIVORCIADO = "DIVORCIADO"
    VIUVO = "VIUVO"
    UNIAO_ESTAVEL = "UNIAO_ESTAVEL"

class PatientStatus(enum.Enum):
    """Enum para status do paciente"""
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    ALTA = "ALTA"
    TRANSFERIDO = "TRANSFERIDO"
    SUSPENSO = "SUSPENSO"

class Patient(db.Model):
    """Model para pacientes"""
    
    __tablename__ = 'patients'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Pode ser null se paciente não tem login
    physiotherapist_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Dados pessoais
    name = Column(String(100), nullable=False)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    rg = Column(String(20), nullable=True)
    birth_date = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    marital_status = Column(Enum(MaritalStatus), nullable=True)
    
    # Contato
    email = Column(String(120), nullable=True)
    phone = Column(String(20), nullable=False)
    whatsapp = Column(String(20), nullable=True)
    
    # Endereço
    address = Column(String(200), nullable=False)
    address_number = Column(String(10), nullable=True)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(2), nullable=False)
    zip_code = Column(String(10), nullable=False)
    
    # Contato de emergência
    emergency_contact_name = Column(String(100), nullable=False)
    emergency_contact_phone = Column(String(20), nullable=False)
    emergency_contact_relationship = Column(String(50), nullable=False)
    
    # Dados profissionais
    profession = Column(String(100), nullable=True)
    workplace = Column(String(200), nullable=True)
    
    # Dados médicos básicos
    height = Column(Float, nullable=True)  # em metros
    weight = Column(Float, nullable=True)  # em kg
    blood_type = Column(String(5), nullable=True)
    
    # Histórico médico
    medical_history = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    previous_surgeries = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    
    # Dados do convênio
    insurance_company = Column(String(100), nullable=True)
    insurance_number = Column(String(50), nullable=True)
    insurance_validity = Column(Date, nullable=True)
    
    # Status e controle
    status = Column(Enum(PatientStatus), default=PatientStatus.ATIVO, nullable=False)
    registration_date = Column(Date, default=date.today, nullable=False)
    last_appointment = Column(DateTime, nullable=True)
    next_appointment = Column(DateTime, nullable=True)
    
    # Observações gerais
    notes = Column(Text, nullable=True)
    
    # Configurações de comunicação
    whatsapp_notifications = Column(Boolean, default=True, nullable=False)
    email_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=False, nullable=False)
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Campos LGPD
    consent_date = Column(DateTime, nullable=True)
    consent_version = Column(String(10), nullable=True)
    data_retention_until = Column(DateTime, nullable=True)
    
    # Relacionamentos
    user = relationship('User', foreign_keys=[user_id], backref='patient_profile')
    physiotherapist = relationship('User', foreign_keys=[physiotherapist_id], back_populates='patients')
    
    # Consultas
    appointments = relationship('Appointment', back_populates='patient', cascade='all, delete-orphan')
    
    # Prontuários
    medical_records = relationship('MedicalRecord', back_populates='patient', cascade='all, delete-orphan')
    
    # Prescrições
    prescriptions = relationship('Prescription', back_populates='patient', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Patient, self).__init__(**kwargs)
        
    @property
    def age(self) -> int:
        """Calcula a idade do paciente"""
        if not self.birth_date:
            return 0
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        
    @property
    def full_address(self) -> str:
        """Retorna o endereço completo formatado"""
        address_parts = [self.address]
        
        if self.address_number:
            address_parts.append(f"nº {self.address_number}")
            
        if self.address_complement:
            address_parts.append(self.address_complement)
            
        address_parts.extend([
            self.neighborhood,
            f"{self.city}/{self.state}",
            f"CEP: {self.zip_code}"
        ])
        
        return ", ".join(address_parts)
        
    @property
    def bmi(self) -> float:
        """Calcula o IMC do paciente"""
        if not self.height or not self.weight or self.height <= 0:
            return 0.0
        return round(self.weight / (self.height ** 2), 2)
        
    @property
    def bmi_classification(self) -> str:
        """Retorna a classificação do IMC"""
        bmi = self.bmi
        if bmi == 0:
            return "Não calculado"
        elif bmi < 18.5:
            return "Abaixo do peso"
        elif bmi < 25:
            return "Peso normal"
        elif bmi < 30:
            return "Sobrepeso"
        elif bmi < 35:
            return "Obesidade grau I"
        elif bmi < 40:
            return "Obesidade grau II"
        else:
            return "Obesidade grau III"
            
    def get_active_prescriptions(self):
        """Retorna prescrições ativas do paciente"""
        from backend.models.prescription import Prescription
        return Prescription.query.filter_by(
            patient_id=self.id,
            is_active=True
        ).all()
        
    def get_recent_appointments(self, limit=5):
        """Retorna consultas recentes do paciente"""
        from backend.models.appointment import Appointment
        return Appointment.query.filter_by(
            patient_id=self.id
        ).order_by(Appointment.date_time.desc()).limit(limit).all()
        
    def get_next_appointment(self):
        """Retorna a próxima consulta agendada"""
        from backend.models.appointment import Appointment, AppointmentStatus
        return Appointment.query.filter(
            Appointment.patient_id == self.id,
            Appointment.date_time > datetime.now(pytz.UTC),
            Appointment.status == AppointmentStatus.AGENDADO
        ).order_by(Appointment.date_time.asc()).first()
        
    def update_last_appointment(self):
        """Atualiza a data da última consulta"""
        from backend.models.appointment import Appointment, AppointmentStatus
        last_apt = Appointment.query.filter(
            Appointment.patient_id == self.id,
            Appointment.status == AppointmentStatus.REALIZADO
        ).order_by(Appointment.date_time.desc()).first()
        
        if last_apt:
            self.last_appointment = last_apt.date_time
            
    def update_next_appointment(self):
        """Atualiza a data da próxima consulta"""
        next_apt = self.get_next_appointment()
        self.next_appointment = next_apt.date_time if next_apt else None
        
    def can_schedule_appointment(self) -> bool:
        """Verifica se o paciente pode agendar consultas"""
        return self.status in [PatientStatus.ATIVO]
        
    def deactivate(self, reason: str = None):
        """Desativa o paciente"""
        self.status = PatientStatus.INATIVO
        if reason:
            self.notes = f"{self.notes}\n\nDesativado em {datetime.now().strftime('%d/%m/%Y')}: {reason}" if self.notes else f"Desativado em {datetime.now().strftime('%d/%m/%Y')}: {reason}"
            
    def discharge(self, reason: str = None):
        """Dá alta ao paciente"""
        self.status = PatientStatus.ALTA
        if reason:
            self.notes = f"{self.notes}\n\nAlta em {datetime.now().strftime('%d/%m/%Y')}: {reason}" if self.notes else f"Alta em {datetime.now().strftime('%d/%m/%Y')}: {reason}"
            
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte o paciente para dicionário"""
        data = {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender.value,
            'phone': self.phone,
            'email': self.email,
            'status': self.status.value,
            'registration_date': self.registration_date.isoformat(),
            'last_appointment': self.last_appointment.isoformat() if self.last_appointment else None,
            'next_appointment': self.next_appointment.isoformat() if self.next_appointment else None,
            'physiotherapist_id': self.physiotherapist_id,
            'bmi': self.bmi,
            'bmi_classification': self.bmi_classification
        }
        
        if include_sensitive:
            data.update({
                'cpf': self.cpf,
                'rg': self.rg,
                'birth_date': self.birth_date.isoformat(),
                'marital_status': self.marital_status.value if self.marital_status else None,
                'whatsapp': self.whatsapp,
                'address': self.full_address,
                'emergency_contact_name': self.emergency_contact_name,
                'emergency_contact_phone': self.emergency_contact_phone,
                'emergency_contact_relationship': self.emergency_contact_relationship,
                'profession': self.profession,
                'workplace': self.workplace,
                'height': self.height,
                'weight': self.weight,
                'blood_type': self.blood_type,
                'medical_history': self.medical_history,
                'current_medications': self.current_medications,
                'allergies': self.allergies,
                'previous_surgeries': self.previous_surgeries,
                'family_history': self.family_history,
                'insurance_company': self.insurance_company,
                'insurance_number': self.insurance_number,
                'insurance_validity': self.insurance_validity.isoformat() if self.insurance_validity else None,
                'notes': self.notes,
                'whatsapp_notifications': self.whatsapp_notifications,
                'email_notifications': self.email_notifications,
                'sms_notifications': self.sms_notifications
            })
            
        return data
        
    def __repr__(self):
        return f'<Patient {self.name} (CPF: {self.cpf})>'