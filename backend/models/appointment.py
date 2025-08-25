# -*- coding: utf-8 -*-
"""
Model de Agendamento
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class AppointmentStatus(enum.Enum):
    """Enum para status da consulta"""
    AGENDADO = "AGENDADO"
    CONFIRMADO = "CONFIRMADO"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    REALIZADO = "REALIZADO"
    CANCELADO = "CANCELADO"
    NAO_COMPARECEU = "NAO_COMPARECEU"
    REAGENDADO = "REAGENDADO"

class AppointmentType(enum.Enum):
    """Enum para tipo de consulta"""
    AVALIACAO = "AVALIACAO"
    RETORNO = "RETORNO"
    SESSAO = "SESSAO"
    REAVALIACAO = "REAVALIACAO"
    TELECONSULTA = "TELECONSULTA"
    URGENCIA = "URGENCIA"

class RecurrenceType(enum.Enum):
    """Enum para tipo de recorrência"""
    NENHUMA = "NENHUMA"
    DIARIA = "DIARIA"
    SEMANAL = "SEMANAL"
    QUINZENAL = "QUINZENAL"
    MENSAL = "MENSAL"
    PERSONALIZADA = "PERSONALIZADA"

class Appointment(db.Model):
    """Model para agendamentos"""
    
    __tablename__ = 'appointments'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    professional_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Data e horário
    date_time = Column(DateTime, nullable=False, index=True)
    duration = Column(Integer, default=60, nullable=False)  # duração em minutos
    end_time = Column(DateTime, nullable=False)  # calculado automaticamente
    
    # Tipo e status
    appointment_type = Column(Enum(AppointmentType), nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.AGENDADO, nullable=False)
    
    # Informações da consulta
    title = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String(100), default="Clínica", nullable=False)
    room = Column(String(50), nullable=True)
    
    # Teleconsulta
    is_teleconsultation = Column(Boolean, default=False, nullable=False)
    meeting_url = Column(String(500), nullable=True)
    meeting_id = Column(String(100), nullable=True)
    meeting_password = Column(String(50), nullable=True)
    
    # Recorrência
    recurrence_type = Column(Enum(RecurrenceType), default=RecurrenceType.NENHUMA, nullable=False)
    recurrence_interval = Column(Integer, default=1, nullable=False)  # intervalo da recorrência
    recurrence_end_date = Column(DateTime, nullable=True)
    recurrence_count = Column(Integer, nullable=True)  # número de ocorrências
    parent_appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True)  # consulta pai da série
    
    # Confirmação e check-in
    confirmed_at = Column(DateTime, nullable=True)
    confirmed_by = Column(String(50), nullable=True)  # 'patient', 'professional', 'system'
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    
    # Lembretes
    reminder_sent_24h = Column(Boolean, default=False, nullable=False)
    reminder_sent_2h = Column(Boolean, default=False, nullable=False)
    reminder_sent_30min = Column(Boolean, default=False, nullable=False)
    
    # Cancelamento/Reagendamento
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    rescheduled_from = Column(Integer, ForeignKey('appointments.id'), nullable=True)
    rescheduled_to = Column(Integer, ForeignKey('appointments.id'), nullable=True)
    
    # Valores e pagamento
    price = Column(Float, nullable=True)
    paid = Column(Boolean, default=False, nullable=False)
    payment_method = Column(String(50), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    
    # Observações
    notes = Column(Text, nullable=True)
    private_notes = Column(Text, nullable=True)  # notas privadas do profissional
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='appointments')
    professional = relationship('User', foreign_keys=[professional_id], back_populates='appointments_as_professional')
    creator = relationship('User', foreign_keys=[created_by])
    cancelled_by_user = relationship('User', foreign_keys=[cancelled_by])
    
    # Relacionamentos de recorrência
    parent_appointment = relationship('Appointment', remote_side=[id], foreign_keys=[parent_appointment_id])
    child_appointments = relationship('Appointment', remote_side=[parent_appointment_id])
    
    # Relacionamentos de reagendamento
    rescheduled_from_appointment = relationship('Appointment', remote_side=[id], foreign_keys=[rescheduled_from])
    rescheduled_to_appointment = relationship('Appointment', remote_side=[id], foreign_keys=[rescheduled_to])
    
    def __init__(self, **kwargs):
        super(Appointment, self).__init__(**kwargs)
        # Calcular end_time automaticamente
        if self.date_time and self.duration:
            self.end_time = self.date_time + timedelta(minutes=self.duration)
            
    @property
    def is_past(self) -> bool:
        """Verifica se a consulta já passou"""
        return self.date_time < datetime.now(pytz.UTC)
        
    @property
    def is_today(self) -> bool:
        """Verifica se a consulta é hoje"""
        today = datetime.now(pytz.UTC).date()
        return self.date_time.date() == today
        
    @property
    def is_upcoming(self) -> bool:
        """Verifica se a consulta é futura"""
        return self.date_time > datetime.now(pytz.UTC)
        
    @property
    def time_until_appointment(self) -> timedelta:
        """Retorna o tempo até a consulta"""
        return self.date_time - datetime.now(pytz.UTC)
        
    @property
    def can_be_cancelled(self) -> bool:
        """Verifica se a consulta pode ser cancelada"""
        if self.status in [AppointmentStatus.CANCELADO, AppointmentStatus.REALIZADO, AppointmentStatus.NAO_COMPARECEU]:
            return False
        # Não pode cancelar consultas que já começaram ou passaram
        return self.date_time > datetime.now(pytz.UTC)
        
    @property
    def can_be_rescheduled(self) -> bool:
        """Verifica se a consulta pode ser reagendada"""
        return self.can_be_cancelled
        
    @property
    def can_check_in(self) -> bool:
        """Verifica se pode fazer check-in"""
        if self.status != AppointmentStatus.CONFIRMADO:
            return False
        # Pode fazer check-in até 15 minutos antes
        check_in_time = self.date_time - timedelta(minutes=15)
        return datetime.now(pytz.UTC) >= check_in_time and not self.is_past
        
    def confirm(self, confirmed_by: str = 'system') -> bool:
        """Confirma a consulta"""
        if self.status == AppointmentStatus.AGENDADO:
            self.status = AppointmentStatus.CONFIRMADO
            self.confirmed_at = datetime.now(pytz.UTC)
            self.confirmed_by = confirmed_by
            return True
        return False
        
    def check_in(self) -> bool:
        """Faz check-in na consulta"""
        if self.can_check_in:
            self.status = AppointmentStatus.EM_ANDAMENTO
            self.checked_in_at = datetime.now(pytz.UTC)
            return True
        return False
        
    def check_out(self) -> bool:
        """Faz check-out da consulta"""
        if self.status == AppointmentStatus.EM_ANDAMENTO:
            self.status = AppointmentStatus.REALIZADO
            self.checked_out_at = datetime.now(pytz.UTC)
            return True
        return False
        
    def cancel(self, cancelled_by_id: int, reason: str = None) -> bool:
        """Cancela a consulta"""
        if self.can_be_cancelled:
            self.status = AppointmentStatus.CANCELADO
            self.cancelled_at = datetime.now(pytz.UTC)
            self.cancelled_by = cancelled_by_id
            self.cancellation_reason = reason
            return True
        return False
        
    def mark_no_show(self) -> bool:
        """Marca como não compareceu"""
        if self.status in [AppointmentStatus.AGENDADO, AppointmentStatus.CONFIRMADO] and self.is_past:
            self.status = AppointmentStatus.NAO_COMPARECEU
            return True
        return False
        
    def reschedule(self, new_date_time: datetime, rescheduled_by_id: int) -> 'Appointment':
        """Reagenda a consulta criando uma nova"""
        if not self.can_be_rescheduled:
            return None
            
        # Criar nova consulta
        new_appointment = Appointment(
            patient_id=self.patient_id,
            professional_id=self.professional_id,
            date_time=new_date_time,
            duration=self.duration,
            appointment_type=self.appointment_type,
            title=self.title,
            description=self.description,
            location=self.location,
            room=self.room,
            is_teleconsultation=self.is_teleconsultation,
            price=self.price,
            notes=self.notes,
            created_by=rescheduled_by_id,
            rescheduled_from=self.id
        )
        
        # Marcar consulta atual como reagendada
        self.status = AppointmentStatus.REAGENDADO
        self.rescheduled_to = new_appointment.id
        
        return new_appointment
        
    def create_recurrence(self, end_date: datetime = None, count: int = None) -> list:
        """Cria consultas recorrentes"""
        if self.recurrence_type == RecurrenceType.NENHUMA:
            return []
            
        appointments = []
        current_date = self.date_time
        created_count = 0
        
        # Definir incremento baseado no tipo de recorrência
        if self.recurrence_type == RecurrenceType.DIARIA:
            delta = timedelta(days=self.recurrence_interval)
        elif self.recurrence_type == RecurrenceType.SEMANAL:
            delta = timedelta(weeks=self.recurrence_interval)
        elif self.recurrence_type == RecurrenceType.QUINZENAL:
            delta = timedelta(weeks=2 * self.recurrence_interval)
        elif self.recurrence_type == RecurrenceType.MENSAL:
            delta = timedelta(days=30 * self.recurrence_interval)  # Aproximação
        else:
            return []
            
        while True:
            current_date += delta
            
            # Verificar condições de parada
            if end_date and current_date > end_date:
                break
            if count and created_count >= count:
                break
                
            # Criar nova consulta
            new_appointment = Appointment(
                patient_id=self.patient_id,
                professional_id=self.professional_id,
                date_time=current_date,
                duration=self.duration,
                appointment_type=self.appointment_type,
                title=self.title,
                description=self.description,
                location=self.location,
                room=self.room,
                is_teleconsultation=self.is_teleconsultation,
                price=self.price,
                notes=self.notes,
                created_by=self.created_by,
                parent_appointment_id=self.id
            )
            
            appointments.append(new_appointment)
            created_count += 1
            
        return appointments
        
    def needs_reminder(self, reminder_type: str) -> bool:
        """Verifica se precisa enviar lembrete"""
        now = datetime.now(pytz.UTC)
        
        if reminder_type == '24h':
            return (not self.reminder_sent_24h and 
                   self.date_time - now <= timedelta(hours=24) and
                   self.date_time > now)
        elif reminder_type == '2h':
            return (not self.reminder_sent_2h and 
                   self.date_time - now <= timedelta(hours=2) and
                   self.date_time > now)
        elif reminder_type == '30min':
            return (not self.reminder_sent_30min and 
                   self.date_time - now <= timedelta(minutes=30) and
                   self.date_time > now)
                   
        return False
        
    def mark_reminder_sent(self, reminder_type: str):
        """Marca lembrete como enviado"""
        if reminder_type == '24h':
            self.reminder_sent_24h = True
        elif reminder_type == '2h':
            self.reminder_sent_2h = True
        elif reminder_type == '30min':
            self.reminder_sent_30min = True
            
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte a consulta para dicionário"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'professional_id': self.professional_id,
            'date_time': self.date_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'duration': self.duration,
            'appointment_type': self.appointment_type.value,
            'status': self.status.value,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'room': self.room,
            'is_teleconsultation': self.is_teleconsultation,
            'price': self.price,
            'paid': self.paid,
            'is_past': self.is_past,
            'is_today': self.is_today,
            'is_upcoming': self.is_upcoming,
            'can_be_cancelled': self.can_be_cancelled,
            'can_check_in': self.can_check_in
        }
        
        if include_sensitive:
            data.update({
                'meeting_url': self.meeting_url,
                'meeting_id': self.meeting_id,
                'meeting_password': self.meeting_password,
                'notes': self.notes,
                'private_notes': self.private_notes,
                'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
                'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None,
                'checked_out_at': self.checked_out_at.isoformat() if self.checked_out_at else None,
                'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
                'cancellation_reason': self.cancellation_reason,
                'payment_method': self.payment_method,
                'payment_date': self.payment_date.isoformat() if self.payment_date else None
            })
            
        return data
        
    def __repr__(self):
        return f'<Appointment {self.id} - {self.patient.name if self.patient else "Unknown"} on {self.date_time}>'