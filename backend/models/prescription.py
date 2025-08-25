# -*- coding: utf-8 -*-
"""
Model de Prescrição de Exercícios
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class PrescriptionStatus(enum.Enum):
    """Enum para status da prescrição"""
    ATIVA = "ATIVA"
    PAUSADA = "PAUSADA"
    CONCLUIDA = "CONCLUIDA"
    CANCELADA = "CANCELADA"
    EXPIRADA = "EXPIRADA"

class PrescriptionFrequency(enum.Enum):
    """Enum para frequência da prescrição"""
    DIARIA = "DIARIA"
    DIAS_ALTERNADOS = "DIAS_ALTERNADOS"
    TRES_VEZES_SEMANA = "TRES_VEZES_SEMANA"
    DUAS_VEZES_SEMANA = "DUAS_VEZES_SEMANA"
    UMA_VEZ_SEMANA = "UMA_VEZ_SEMANA"
    PERSONALIZADA = "PERSONALIZADA"

class Prescription(db.Model):
    """Model para prescrições de exercícios"""
    
    __tablename__ = 'prescriptions'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False, index=True)
    physiotherapist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Informações da prescrição
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    clinical_objective = Column(Text, nullable=False)  # objetivo clínico
    
    # Período de validade
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    duration_weeks = Column(Integer, nullable=True)  # duração em semanas
    
    # Frequência e horários
    frequency = Column(Enum(PrescriptionFrequency), nullable=False)
    custom_frequency_days = Column(String(20), nullable=True)  # ex: "1,3,5" para seg, qua, sex
    preferred_times = Column(Text, nullable=True)  # JSON array de horários preferenciais
    
    # Status e controle
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.ATIVA, nullable=False)
    is_home_program = Column(Boolean, default=True, nullable=False)  # programa domiciliar
    requires_supervision = Column(Boolean, default=False, nullable=False)
    
    # Observações e orientações
    general_instructions = Column(Text, nullable=True)
    precautions = Column(Text, nullable=True)
    progression_notes = Column(Text, nullable=True)
    
    # Métricas de adesão
    total_sessions_planned = Column(Integer, default=0, nullable=False)
    total_sessions_completed = Column(Integer, default=0, nullable=False)
    adherence_percentage = Column(Float, default=0.0, nullable=False)
    
    # Avaliação de efetividade
    patient_feedback_rating = Column(Float, nullable=True)  # avaliação do paciente (1-5)
    physiotherapist_rating = Column(Float, nullable=True)  # avaliação do fisioterapeuta (1-5)
    effectiveness_notes = Column(Text, nullable=True)
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)  # último acesso do paciente
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='prescriptions')
    physiotherapist = relationship('User', foreign_keys=[physiotherapist_id])
    exercises = relationship('PrescriptionExercise', back_populates='prescription', cascade='all, delete-orphan')
    sessions = relationship('PrescriptionSession', back_populates='prescription', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Prescription, self).__init__(**kwargs)
        if not self.start_date:
            self.start_date = datetime.now(pytz.UTC)
        if self.duration_weeks and not self.end_date:
            self.end_date = self.start_date + timedelta(weeks=self.duration_weeks)
            
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            PrescriptionStatus.ATIVA: "Ativa",
            PrescriptionStatus.PAUSADA: "Pausada",
            PrescriptionStatus.CONCLUIDA: "Concluída",
            PrescriptionStatus.CANCELADA: "Cancelada",
            PrescriptionStatus.EXPIRADA: "Expirada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def frequency_display(self) -> str:
        """Retorna a frequência formatada"""
        frequency_names = {
            PrescriptionFrequency.DIARIA: "Diária",
            PrescriptionFrequency.DIAS_ALTERNADOS: "Dias Alternados",
            PrescriptionFrequency.TRES_VEZES_SEMANA: "3x por Semana",
            PrescriptionFrequency.DUAS_VEZES_SEMANA: "2x por Semana",
            PrescriptionFrequency.UMA_VEZ_SEMANA: "1x por Semana",
            PrescriptionFrequency.PERSONALIZADA: "Personalizada"
        }
        return frequency_names.get(self.frequency, self.frequency.value)
        
    @property
    def is_active(self) -> bool:
        """Verifica se a prescrição está ativa"""
        if self.status != PrescriptionStatus.ATIVA:
            return False
            
        now = datetime.now(pytz.UTC)
        if self.end_date and now > self.end_date:
            return False
            
        return True
        
    @property
    def is_expired(self) -> bool:
        """Verifica se a prescrição expirou"""
        if not self.end_date:
            return False
        return datetime.now(pytz.UTC) > self.end_date
        
    @property
    def days_remaining(self) -> int:
        """Retorna quantos dias restam da prescrição"""
        if not self.end_date:
            return -1
        delta = self.end_date - datetime.now(pytz.UTC)
        return max(0, delta.days)
        
    @property
    def total_exercises(self) -> int:
        """Retorna o total de exercícios na prescrição"""
        return len(self.exercises)
        
    @property
    def estimated_duration_minutes(self) -> int:
        """Retorna a duração estimada total em minutos"""
        total_duration = 0
        for prescription_exercise in self.exercises:
            if prescription_exercise.exercise:
                # Duração do exercício * número de séries + tempo de descanso
                exercise_duration = prescription_exercise.exercise.estimated_duration
                sets = prescription_exercise.sets or prescription_exercise.exercise.default_sets
                rest_time = (prescription_exercise.rest_time or prescription_exercise.exercise.default_rest_time) / 60  # converter para minutos
                total_duration += (exercise_duration * sets) + (rest_time * (sets - 1))
        return int(total_duration)
        
    def get_preferred_times_list(self) -> list:
        """Retorna lista de horários preferenciais"""
        import json
        try:
            return json.loads(self.preferred_times) if self.preferred_times else []
        except:
            return []
            
    def get_custom_frequency_days_list(self) -> list:
        """Retorna lista de dias da semana personalizados"""
        if not self.custom_frequency_days:
            return []
        try:
            return [int(day) for day in self.custom_frequency_days.split(',')]
        except:
            return []
            
    def calculate_adherence(self):
        """Calcula a porcentagem de adesão"""
        if self.total_sessions_planned == 0:
            self.adherence_percentage = 0.0
        else:
            self.adherence_percentage = (self.total_sessions_completed / self.total_sessions_planned) * 100
            
    def update_last_access(self):
        """Atualiza o último acesso do paciente"""
        self.last_accessed_at = datetime.now(pytz.UTC)
        
    def pause(self, reason: str = None):
        """Pausa a prescrição"""
        self.status = PrescriptionStatus.PAUSADA
        if reason:
            self.progression_notes = f"{self.progression_notes or ''}\n[{datetime.now().strftime('%d/%m/%Y')}] Prescrição pausada: {reason}"
            
    def resume(self):
        """Resume a prescrição pausada"""
        if self.status == PrescriptionStatus.PAUSADA:
            self.status = PrescriptionStatus.ATIVA
            self.progression_notes = f"{self.progression_notes or ''}\n[{datetime.now().strftime('%d/%m/%Y')}] Prescrição retomada"
            
    def complete(self, notes: str = None):
        """Marca a prescrição como concluída"""
        self.status = PrescriptionStatus.CONCLUIDA
        if notes:
            self.effectiveness_notes = notes
        self.progression_notes = f"{self.progression_notes or ''}\n[{datetime.now().strftime('%d/%m/%Y')}] Prescrição concluída"
        
    def cancel(self, reason: str = None):
        """Cancela a prescrição"""
        self.status = PrescriptionStatus.CANCELADA
        if reason:
            self.progression_notes = f"{self.progression_notes or ''}\n[{datetime.now().strftime('%d/%m/%Y')}] Prescrição cancelada: {reason}"
            
    def check_expiration(self):
        """Verifica e atualiza status de expiração"""
        if self.is_expired and self.status == PrescriptionStatus.ATIVA:
            self.status = PrescriptionStatus.EXPIRADA
            
    def extend_duration(self, additional_weeks: int):
        """Estende a duração da prescrição"""
        if self.end_date:
            self.end_date += timedelta(weeks=additional_weeks)
        else:
            self.end_date = datetime.now(pytz.UTC) + timedelta(weeks=additional_weeks)
        
        if self.duration_weeks:
            self.duration_weeks += additional_weeks
            
        # Se estava expirada, reativar
        if self.status == PrescriptionStatus.EXPIRADA:
            self.status = PrescriptionStatus.ATIVA
            
    def add_exercise(self, exercise_id: int, **kwargs):
        """Adiciona um exercício à prescrição"""
        prescription_exercise = PrescriptionExercise(
            prescription_id=self.id,
            exercise_id=exercise_id,
            **kwargs
        )
        self.exercises.append(prescription_exercise)
        return prescription_exercise
        
    def remove_exercise(self, exercise_id: int):
        """Remove um exercício da prescrição"""
        prescription_exercise = next(
            (pe for pe in self.exercises if pe.exercise_id == exercise_id), 
            None
        )
        if prescription_exercise:
            self.exercises.remove(prescription_exercise)
            
    def get_exercises_by_category(self):
        """Retorna exercícios agrupados por categoria"""
        from collections import defaultdict
        exercises_by_category = defaultdict(list)
        
        for prescription_exercise in self.exercises:
            if prescription_exercise.exercise:
                category = prescription_exercise.exercise.category
                exercises_by_category[category].append(prescription_exercise)
                
        return dict(exercises_by_category)
        
    @classmethod
    def get_active_by_patient(cls, patient_id: int):
        """Retorna prescrições ativas de um paciente"""
        return cls.query.filter_by(
            patient_id=patient_id,
            status=PrescriptionStatus.ATIVA
        ).all()
        
    @classmethod
    def get_by_physiotherapist(cls, physiotherapist_id: int, status: PrescriptionStatus = None):
        """Retorna prescrições de um fisioterapeuta"""
        query = cls.query.filter_by(physiotherapist_id=physiotherapist_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(cls.created_at.desc()).all()
        
    def to_dict(self, include_exercises=False, include_sessions=False) -> dict:
        """Converte a prescrição para dicionário"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'physiotherapist_id': self.physiotherapist_id,
            'title': self.title,
            'description': self.description,
            'clinical_objective': self.clinical_objective,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'duration_weeks': self.duration_weeks,
            'frequency': self.frequency.value,
            'frequency_display': self.frequency_display,
            'custom_frequency_days': self.get_custom_frequency_days_list(),
            'preferred_times': self.get_preferred_times_list(),
            'status': self.status.value,
            'status_display': self.status_display,
            'is_home_program': self.is_home_program,
            'requires_supervision': self.requires_supervision,
            'general_instructions': self.general_instructions,
            'precautions': self.precautions,
            'progression_notes': self.progression_notes,
            'total_sessions_planned': self.total_sessions_planned,
            'total_sessions_completed': self.total_sessions_completed,
            'adherence_percentage': self.adherence_percentage,
            'patient_feedback_rating': self.patient_feedback_rating,
            'physiotherapist_rating': self.physiotherapist_rating,
            'effectiveness_notes': self.effectiveness_notes,
            'is_active': self.is_active,
            'is_expired': self.is_expired,
            'days_remaining': self.days_remaining,
            'total_exercises': self.total_exercises,
            'estimated_duration_minutes': self.estimated_duration_minutes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_accessed_at': self.last_accessed_at.isoformat() if self.last_accessed_at else None
        }
        
        if include_exercises:
            data['exercises'] = [pe.to_dict() for pe in self.exercises]
            data['exercises_by_category'] = {
                category.value: [pe.to_dict() for pe in exercises]
                for category, exercises in self.get_exercises_by_category().items()
            }
            
        if include_sessions:
            data['sessions'] = [session.to_dict() for session in self.sessions]
            
        return data
        
    def __repr__(self):
        return f'<Prescription {self.title} - Patient {self.patient_id}>'


class PrescriptionExercise(db.Model):
    """Model para exercícios dentro de uma prescrição"""
    
    __tablename__ = 'prescription_exercises'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    prescription_id = Column(Integer, ForeignKey('prescriptions.id'), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey('exercises.id'), nullable=False, index=True)
    
    # Parâmetros personalizados (sobrescreve os padrões do exercício)
    sets = Column(Integer, nullable=True)
    repetitions = Column(Integer, nullable=True)
    hold_time = Column(Integer, nullable=True)  # tempo de sustentação em segundos
    rest_time = Column(Integer, nullable=True)  # tempo de descanso em segundos
    
    # Ordem na prescrição
    order_index = Column(Integer, default=0, nullable=False)
    
    # Instruções específicas
    custom_instructions = Column(Text, nullable=True)
    modifications = Column(Text, nullable=True)  # modificações específicas para o paciente
    
    # Progressão
    progression_notes = Column(Text, nullable=True)
    difficulty_adjustment = Column(String(50), nullable=True)  # "easier", "harder", "maintain"
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    prescription = relationship('Prescription', back_populates='exercises')
    exercise = relationship('Exercise', back_populates='prescriptions')
    
    def __init__(self, **kwargs):
        super(PrescriptionExercise, self).__init__(**kwargs)
        
    @property
    def effective_sets(self) -> int:
        """Retorna o número de séries efetivo (personalizado ou padrão)"""
        return self.sets or (self.exercise.default_sets if self.exercise else 3)
        
    @property
    def effective_repetitions(self) -> int:
        """Retorna o número de repetições efetivo (personalizado ou padrão)"""
        return self.repetitions or (self.exercise.default_repetitions if self.exercise else 10)
        
    @property
    def effective_hold_time(self) -> int:
        """Retorna o tempo de sustentação efetivo (personalizado ou padrão)"""
        return self.hold_time or (self.exercise.default_hold_time if self.exercise else 0)
        
    @property
    def effective_rest_time(self) -> int:
        """Retorna o tempo de descanso efetivo (personalizado ou padrão)"""
        return self.rest_time or (self.exercise.default_rest_time if self.exercise else 30)
        
    def update_progression(self, notes: str, difficulty: str = None):
        """Atualiza as notas de progressão"""
        timestamp = datetime.now().strftime('%d/%m/%Y')
        self.progression_notes = f"{self.progression_notes or ''}\n[{timestamp}] {notes}"
        if difficulty:
            self.difficulty_adjustment = difficulty
            
    def adjust_difficulty(self, adjustment: str, notes: str = None):
        """Ajusta a dificuldade do exercício"""
        self.difficulty_adjustment = adjustment
        if notes:
            self.update_progression(f"Dificuldade ajustada para '{adjustment}': {notes}")
            
    def customize_parameters(self, sets: int = None, repetitions: int = None, hold_time: int = None, rest_time: int = None):
        """Personaliza os parâmetros do exercício"""
        if sets is not None:
            self.sets = sets
        if repetitions is not None:
            self.repetitions = repetitions
        if hold_time is not None:
            self.hold_time = hold_time
        if rest_time is not None:
            self.rest_time = rest_time
            
    def to_dict(self, include_exercise_details=True) -> dict:
        """Converte o exercício da prescrição para dicionário"""
        data = {
            'id': self.id,
            'prescription_id': self.prescription_id,
            'exercise_id': self.exercise_id,
            'sets': self.effective_sets,
            'repetitions': self.effective_repetitions,
            'hold_time': self.effective_hold_time,
            'rest_time': self.effective_rest_time,
            'order_index': self.order_index,
            'custom_instructions': self.custom_instructions,
            'modifications': self.modifications,
            'progression_notes': self.progression_notes,
            'difficulty_adjustment': self.difficulty_adjustment,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_exercise_details and self.exercise:
            data['exercise'] = self.exercise.to_dict()
            
        return data
        
    def __repr__(self):
        return f'<PrescriptionExercise {self.exercise_id} in Prescription {self.prescription_id}>'


class PrescriptionSession(db.Model):
    """Model para sessões de execução da prescrição"""
    
    __tablename__ = 'prescription_sessions'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    prescription_id = Column(Integer, ForeignKey('prescriptions.id'), nullable=False, index=True)
    
    # Data e duração da sessão
    session_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    
    # Avaliação da sessão
    patient_rating = Column(Float, nullable=True)  # avaliação do paciente (1-5)
    difficulty_rating = Column(Float, nullable=True)  # dificuldade percebida (1-5)
    pain_level_before = Column(Integer, nullable=True)  # dor antes (0-10)
    pain_level_after = Column(Integer, nullable=True)  # dor depois (0-10)
    
    # Observações
    patient_notes = Column(Text, nullable=True)
    physiotherapist_notes = Column(Text, nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_percentage = Column(Float, default=0.0, nullable=False)
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    prescription = relationship('Prescription', back_populates='sessions')
    
    def __init__(self, **kwargs):
        super(PrescriptionSession, self).__init__(**kwargs)
        if not self.session_date:
            self.session_date = datetime.now(pytz.UTC)
            
    def complete_session(self, duration: int = None, rating: float = None, notes: str = None):
        """Marca a sessão como concluída"""
        self.is_completed = True
        self.completion_percentage = 100.0
        if duration:
            self.duration_minutes = duration
        if rating:
            self.patient_rating = rating
        if notes:
            self.patient_notes = notes
            
    def to_dict(self) -> dict:
        """Converte a sessão para dicionário"""
        return {
            'id': self.id,
            'prescription_id': self.prescription_id,
            'session_date': self.session_date.isoformat(),
            'duration_minutes': self.duration_minutes,
            'patient_rating': self.patient_rating,
            'difficulty_rating': self.difficulty_rating,
            'pain_level_before': self.pain_level_before,
            'pain_level_after': self.pain_level_after,
            'patient_notes': self.patient_notes,
            'physiotherapist_notes': self.physiotherapist_notes,
            'is_completed': self.is_completed,
            'completion_percentage': self.completion_percentage,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<PrescriptionSession {self.id} - {self.session_date.strftime("%d/%m/%Y")}>'