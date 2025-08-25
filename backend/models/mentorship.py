# -*- coding: utf-8 -*-
"""
Models de Mentoria

Este módulo contém os models relacionados ao sistema de mentoria:
- Mentorship: Programa de mentoria
- MentorshipSession: Sessões de mentoria
- ClinicalCase: Casos clínicos
- CompetencyEvaluation: Avaliações de competência
- Certificate: Certificados
"""

from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
import uuid
import pytz
import json

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum as SQLEnum, ForeignKey, JSON, Numeric, Float
from sqlalchemy.orm import relationship
from backend.database import db


# === ENUMS ===

class MentorshipStatus(Enum):
    """Status da mentoria"""
    PENDING = "pending"  # Pendente
    ACTIVE = "active"  # Ativa
    COMPLETED = "completed"  # Concluída
    SUSPENDED = "suspended"  # Suspensa
    CANCELLED = "cancelled"  # Cancelada


class MentorshipType(Enum):
    """Tipos de mentoria"""
    INTERNSHIP = "internship"  # Estágio
    RESIDENCY = "residency"  # Residência
    SPECIALIZATION = "specialization"  # Especialização
    CONTINUING_EDUCATION = "continuing_education"  # Educação continuada
    RESEARCH = "research"  # Pesquisa


class SessionType(Enum):
    """Tipos de sessão"""
    THEORETICAL = "theoretical"  # Teórica
    PRACTICAL = "practical"  # Prática
    CASE_STUDY = "case_study"  # Estudo de caso
    EVALUATION = "evaluation"  # Avaliação
    SUPERVISION = "supervision"  # Supervisão
    PRESENTATION = "presentation"  # Apresentação


class SessionStatus(Enum):
    """Status da sessão"""
    SCHEDULED = "scheduled"  # Agendada
    IN_PROGRESS = "in_progress"  # Em andamento
    COMPLETED = "completed"  # Concluída
    CANCELLED = "cancelled"  # Cancelada
    RESCHEDULED = "rescheduled"  # Reagendada


class CaseComplexity(Enum):
    """Complexidade do caso"""
    BASIC = "basic"  # Básico
    INTERMEDIATE = "intermediate"  # Intermediário
    ADVANCED = "advanced"  # Avançado
    EXPERT = "expert"  # Especialista


class CaseCategory(Enum):
    """Categorias de casos clínicos"""
    ORTHOPEDIC = "orthopedic"  # Ortopédico
    NEUROLOGICAL = "neurological"  # Neurológico
    CARDIOPULMONARY = "cardiopulmonary"  # Cardiopulmonar
    PEDIATRIC = "pediatric"  # Pediátrico
    GERIATRIC = "geriatric"  # Geriátrico
    SPORTS = "sports"  # Esportivo
    OCCUPATIONAL = "occupational"  # Ocupacional
    WOMEN_HEALTH = "women_health"  # Saúde da mulher
    CHRONIC_PAIN = "chronic_pain"  # Dor crônica
    POST_SURGICAL = "post_surgical"  # Pós-cirúrgico


class CompetencyArea(Enum):
    """Áreas de competência"""
    ASSESSMENT = "assessment"  # Avaliação
    DIAGNOSIS = "diagnosis"  # Diagnóstico
    TREATMENT_PLANNING = "treatment_planning"  # Planejamento do tratamento
    INTERVENTION = "intervention"  # Intervenção
    COMMUNICATION = "communication"  # Comunicação
    DOCUMENTATION = "documentation"  # Documentação
    ETHICS = "ethics"  # Ética
    RESEARCH = "research"  # Pesquisa
    EDUCATION = "education"  # Educação
    MANAGEMENT = "management"  # Gestão


class EvaluationStatus(Enum):
    """Status da avaliação"""
    PENDING = "pending"  # Pendente
    IN_PROGRESS = "in_progress"  # Em andamento
    COMPLETED = "completed"  # Concluída
    REVIEWED = "reviewed"  # Revisada


class CertificateStatus(Enum):
    """Status do certificado"""
    PENDING = "pending"  # Pendente
    ISSUED = "issued"  # Emitido
    REVOKED = "revoked"  # Revogado
    EXPIRED = "expirado"  # Expirado


# === MODELS ===

class Mentorship(db.Model):
    """Model para programas de mentoria"""
    
    __tablename__ = 'mentorships'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Mentor (fisioterapeuta)
    mentor_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Mentee (estagiário)
    mentee_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # === PROGRAMA ===
    
    # Informações básicas
    title = Column(String(200), nullable=False)  # Título
    description = Column(Text, nullable=True)  # Descrição
    
    # Tipo e status
    type = Column(SQLEnum(MentorshipType), nullable=False, index=True)
    status = Column(SQLEnum(MentorshipStatus), default=MentorshipStatus.PENDING, nullable=False, index=True)
    
    # === DURAÇÃO ===
    
    # Datas
    start_date = Column(DateTime, nullable=False, index=True)  # Data de início
    end_date = Column(DateTime, nullable=False, index=True)  # Data de fim
    
    # Duração em horas
    total_hours = Column(Integer, nullable=False)  # Total de horas
    completed_hours = Column(Integer, default=0, nullable=False)  # Horas concluídas
    
    # === OBJETIVOS ===
    
    # Objetivos
    objectives = Column(JSON, nullable=True)  # Objetivos
    
    # Competências
    competencies = Column(JSON, nullable=True)  # Competências a desenvolver
    
    # === PROGRESSO ===
    
    # Progresso geral
    progress_percentage = Column(Float, default=0.0, nullable=False)  # Percentual de progresso
    
    # Avaliação geral
    overall_grade = Column(Float, nullable=True)  # Nota geral
    
    # === CONFIGURAÇÕES ===
    
    # Configurações
    settings = Column(JSON, nullable=True)  # Configurações
    
    # === METADADOS ===
    
    # Observações
    notes = Column(Text, nullable=True)  # Observações
    
    # Metadados
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    mentor = relationship('User', foreign_keys=[mentor_id], back_populates='mentorships_as_mentor')
    mentee = relationship('User', foreign_keys=[mentee_id], back_populates='mentorships_as_mentee')
    creator = relationship('User', foreign_keys=[created_by])
    sessions = relationship('MentorshipSession', back_populates='mentorship', cascade='all, delete-orphan')
    evaluations = relationship('CompetencyEvaluation', back_populates='mentorship', cascade='all, delete-orphan')
    certificates = relationship('Certificate', back_populates='mentorship', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Mentorship, self).__init__(**kwargs)
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
            MentorshipStatus.PENDING: "Pendente",
            MentorshipStatus.ACTIVE: "Ativa",
            MentorshipStatus.COMPLETED: "Concluída",
            MentorshipStatus.SUSPENDED: "Suspensa",
            MentorshipStatus.CANCELLED: "Cancelada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def type_display(self) -> str:
        """Retorna o tipo formatado"""
        type_names = {
            MentorshipType.INTERNSHIP: "Estágio",
            MentorshipType.RESIDENCY: "Residência",
            MentorshipType.SPECIALIZATION: "Especialização",
            MentorshipType.CONTINUING_EDUCATION: "Educação Continuada",
            MentorshipType.RESEARCH: "Pesquisa"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def is_active(self) -> bool:
        """Verifica se a mentoria está ativa"""
        return self.status == MentorshipStatus.ACTIVE
        
    @property
    def is_completed(self) -> bool:
        """Verifica se a mentoria foi concluída"""
        return self.status == MentorshipStatus.COMPLETED
        
    @property
    def is_expired(self) -> bool:
        """Verifica se a mentoria expirou"""
        return datetime.now(pytz.UTC) > self.end_date
        
    @property
    def remaining_hours(self) -> int:
        """Retorna as horas restantes"""
        return max(0, self.total_hours - self.completed_hours)
        
    @property
    def hours_percentage(self) -> float:
        """Retorna o percentual de horas concluídas"""
        if self.total_hours == 0:
            return 0.0
        return (self.completed_hours / self.total_hours) * 100
        
    def get_objectives(self) -> list:
        """Retorna os objetivos"""
        return self.objectives or []
        
    def get_competencies(self) -> list:
        """Retorna as competências"""
        return self.competencies or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_objectives(self, objectives: list):
        """Define os objetivos"""
        self.objectives = objectives
        
    def set_competencies(self, competencies: list):
        """Define as competências"""
        self.competencies = competencies
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def add_hours(self, hours: int):
        """Adiciona horas concluídas"""
        self.completed_hours = min(self.total_hours, self.completed_hours + hours)
        self.update_progress()
        
    def update_progress(self):
        """Atualiza o progresso"""
        # Calcular progresso baseado em horas e avaliações
        hours_progress = self.hours_percentage
        
        # Considerar avaliações se existirem
        evaluations = [e for e in self.evaluations if e.status == EvaluationStatus.COMPLETED]
        if evaluations:
            avg_grade = sum(e.final_grade for e in evaluations if e.final_grade) / len(evaluations)
            self.progress_percentage = (hours_progress + avg_grade) / 2
        else:
            self.progress_percentage = hours_progress
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def activate(self):
        """Ativa a mentoria"""
        self.status = MentorshipStatus.ACTIVE
        self.updated_at = datetime.now(pytz.UTC)
        
    def complete(self):
        """Completa a mentoria"""
        self.status = MentorshipStatus.COMPLETED
        self.progress_percentage = 100.0
        self.updated_at = datetime.now(pytz.UTC)
        
    def suspend(self, reason: str = None):
        """Suspende a mentoria"""
        self.status = MentorshipStatus.SUSPENDED
        if reason:
            self.notes = reason
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel(self, reason: str = None):
        """Cancela a mentoria"""
        self.status = MentorshipStatus.CANCELLED
        if reason:
            self.notes = reason
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def create_mentorship(
        cls,
        mentor_id: int,
        mentee_id: int,
        title: str,
        type: MentorshipType,
        start_date: datetime,
        end_date: datetime,
        total_hours: int,
        created_by: int,
        description: str = None,
        objectives: list = None,
        competencies: list = None,
        **kwargs
    ) -> 'Mentorship':
        """Cria uma nova mentoria"""
        
        mentorship = cls(
            mentor_id=mentor_id,
            mentee_id=mentee_id,
            title=title,
            type=type,
            start_date=start_date,
            end_date=end_date,
            total_hours=total_hours,
            description=description,
            objectives=objectives,
            competencies=competencies,
            created_by=created_by,
            **kwargs
        )
        
        return mentorship
        
    @classmethod
    def get_by_mentor(cls, mentor_id: int):
        """Busca mentorias por mentor"""
        return cls.query.filter(
            cls.mentor_id == mentor_id
        ).order_by(cls.start_date.desc()).all()
        
    @classmethod
    def get_by_mentee(cls, mentee_id: int):
        """Busca mentorias por mentee"""
        return cls.query.filter(
            cls.mentee_id == mentee_id
        ).order_by(cls.start_date.desc()).all()
        
    @classmethod
    def get_active(cls):
        """Busca mentorias ativas"""
        return cls.query.filter(
            cls.status == MentorshipStatus.ACTIVE
        ).order_by(cls.start_date.asc()).all()
        
    @classmethod
    def get_expiring_soon(cls, days: int = 30):
        """Busca mentorias que expiram em breve"""
        cutoff_date = datetime.now(pytz.UTC) + timedelta(days=days)
        
        return cls.query.filter(
            cls.status == MentorshipStatus.ACTIVE,
            cls.end_date <= cutoff_date
        ).order_by(cls.end_date.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte a mentoria para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'mentor_id': self.mentor_id,
            'mentee_id': self.mentee_id,
            'title': self.title,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'total_hours': self.total_hours,
            'completed_hours': self.completed_hours,
            'remaining_hours': self.remaining_hours,
            'hours_percentage': self.hours_percentage,
            'progress_percentage': self.progress_percentage,
            'overall_grade': self.overall_grade,
            'objectives': self.get_objectives(),
            'competencies': self.get_competencies(),
            'is_active': self.is_active,
            'is_completed': self.is_completed,
            'is_expired': self.is_expired,
            'notes': self.notes,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<Mentorship {self.id} - {self.title} - {self.status.value}>'


class MentorshipSession(db.Model):
    """Model para sessões de mentoria"""
    
    __tablename__ = 'mentorship_sessions'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Mentoria
    mentorship_id = Column(Integer, ForeignKey('mentorships.id'), nullable=False, index=True)
    
    # Caso clínico (opcional)
    clinical_case_id = Column(Integer, ForeignKey('clinical_cases.id'), nullable=True, index=True)
    
    # === SESSÃO ===
    
    # Informações básicas
    title = Column(String(200), nullable=False)  # Título
    description = Column(Text, nullable=True)  # Descrição
    
    # Tipo e status
    type = Column(SQLEnum(SessionType), nullable=False, index=True)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.SCHEDULED, nullable=False, index=True)
    
    # === AGENDAMENTO ===
    
    # Data e duração
    scheduled_date = Column(DateTime, nullable=False, index=True)  # Data agendada
    duration_minutes = Column(Integer, default=60, nullable=False)  # Duração em minutos
    
    # === EXECUÇÃO ===
    
    # Datas de execução
    started_at = Column(DateTime, nullable=True)  # Início
    completed_at = Column(DateTime, nullable=True)  # Conclusão
    cancelled_at = Column(DateTime, nullable=True)  # Cancelamento
    
    # Duração real
    actual_duration = Column(Integer, nullable=True)  # Duração real em minutos
    
    # === CONTEÚDO ===
    
    # Objetivos
    objectives = Column(JSON, nullable=True)  # Objetivos da sessão
    
    # Conteúdo
    content = Column(Text, nullable=True)  # Conteúdo abordado
    
    # Atividades
    activities = Column(JSON, nullable=True)  # Atividades realizadas
    
    # Recursos
    resources = Column(JSON, nullable=True)  # Recursos utilizados
    
    # === AVALIAÇÃO ===
    
    # Notas
    mentor_notes = Column(Text, nullable=True)  # Notas do mentor
    mentee_notes = Column(Text, nullable=True)  # Notas do mentee
    
    # Avaliação
    mentor_rating = Column(Float, nullable=True)  # Avaliação do mentor
    mentee_rating = Column(Float, nullable=True)  # Avaliação do mentee
    
    # === ANEXOS ===
    
    # Arquivos
    attachments = Column(JSON, nullable=True)  # Anexos
    
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
    mentorship = relationship('Mentorship', back_populates='sessions')
    clinical_case = relationship('ClinicalCase', back_populates='sessions')
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(MentorshipSession, self).__init__(**kwargs)
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
            SessionType.THEORETICAL: "Teórica",
            SessionType.PRACTICAL: "Prática",
            SessionType.CASE_STUDY: "Estudo de Caso",
            SessionType.EVALUATION: "Avaliação",
            SessionType.SUPERVISION: "Supervisão",
            SessionType.PRESENTATION: "Apresentação"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            SessionStatus.SCHEDULED: "Agendada",
            SessionStatus.IN_PROGRESS: "Em Andamento",
            SessionStatus.COMPLETED: "Concluída",
            SessionStatus.CANCELLED: "Cancelada",
            SessionStatus.RESCHEDULED: "Reagendada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_completed(self) -> bool:
        """Verifica se a sessão foi concluída"""
        return self.status == SessionStatus.COMPLETED
        
    @property
    def is_in_progress(self) -> bool:
        """Verifica se a sessão está em andamento"""
        return self.status == SessionStatus.IN_PROGRESS
        
    @property
    def can_start(self) -> bool:
        """Verifica se a sessão pode ser iniciada"""
        return self.status == SessionStatus.SCHEDULED
        
    def get_objectives(self) -> list:
        """Retorna os objetivos"""
        return self.objectives or []
        
    def get_activities(self) -> list:
        """Retorna as atividades"""
        return self.activities or []
        
    def get_resources(self) -> list:
        """Retorna os recursos"""
        return self.resources or []
        
    def get_attachments(self) -> list:
        """Retorna os anexos"""
        return self.attachments or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def start_session(self):
        """Inicia a sessão"""
        if not self.can_start:
            return False
            
        self.status = SessionStatus.IN_PROGRESS
        self.started_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        return True
        
    def complete_session(self, mentor_notes: str = None, mentee_notes: str = None):
        """Completa a sessão"""
        self.status = SessionStatus.COMPLETED
        self.completed_at = datetime.now(pytz.UTC)
        
        if self.started_at:
            duration = datetime.now(pytz.UTC) - self.started_at
            self.actual_duration = int(duration.total_seconds() / 60)
            
        if mentor_notes:
            self.mentor_notes = mentor_notes
            
        if mentee_notes:
            self.mentee_notes = mentee_notes
            
        # Adicionar horas à mentoria
        if self.mentorship and self.actual_duration:
            hours = self.actual_duration / 60
            self.mentorship.add_hours(int(hours))
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel_session(self, reason: str = None):
        """Cancela a sessão"""
        self.status = SessionStatus.CANCELLED
        self.cancelled_at = datetime.now(pytz.UTC)
        
        if reason:
            self.mentor_notes = reason
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def reschedule(self, new_date: datetime):
        """Reagenda a sessão"""
        self.status = SessionStatus.RESCHEDULED
        self.scheduled_date = new_date
        self.updated_at = datetime.now(pytz.UTC)
        
    def add_attachment(self, attachment: dict):
        """Adiciona um anexo"""
        attachments = self.get_attachments()
        attachments.append(attachment)
        self.attachments = attachments
        
    @classmethod
    def get_by_mentorship(cls, mentorship_id: int):
        """Busca sessões por mentoria"""
        return cls.query.filter(
            cls.mentorship_id == mentorship_id
        ).order_by(cls.scheduled_date.desc()).all()
        
    @classmethod
    def get_scheduled_today(cls):
        """Busca sessões agendadas para hoje"""
        today = datetime.now(pytz.UTC).date()
        
        return cls.query.filter(
            cls.status == SessionStatus.SCHEDULED,
            cls.scheduled_date >= datetime.combine(today, datetime.min.time()),
            cls.scheduled_date < datetime.combine(today + timedelta(days=1), datetime.min.time())
        ).order_by(cls.scheduled_date.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte a sessão para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'mentorship_id': self.mentorship_id,
            'clinical_case_id': self.clinical_case_id,
            'title': self.title,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'scheduled_date': self.scheduled_date.isoformat(),
            'duration_minutes': self.duration_minutes,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'actual_duration': self.actual_duration,
            'objectives': self.get_objectives(),
            'content': self.content,
            'activities': self.get_activities(),
            'resources': self.get_resources(),
            'mentor_notes': self.mentor_notes,
            'mentee_notes': self.mentee_notes,
            'mentor_rating': self.mentor_rating,
            'mentee_rating': self.mentee_rating,
            'attachments': self.get_attachments(),
            'is_completed': self.is_completed,
            'is_in_progress': self.is_in_progress,
            'can_start': self.can_start,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<MentorshipSession {self.id} - {self.title} - {self.status.value}>'


class ClinicalCase(db.Model):
    """Model para casos clínicos"""
    
    __tablename__ = 'clinical_cases'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === CASO ===
    
    # Informações básicas
    title = Column(String(200), nullable=False)  # Título
    description = Column(Text, nullable=False)  # Descrição
    
    # Categoria e complexidade
    category = Column(SQLEnum(CaseCategory), nullable=False, index=True)
    complexity = Column(SQLEnum(CaseComplexity), nullable=False, index=True)
    
    # === PACIENTE ===
    
    # Dados do paciente (anonimizados)
    patient_age = Column(Integer, nullable=True)  # Idade
    patient_gender = Column(String(10), nullable=True)  # Gênero
    patient_condition = Column(String(200), nullable=True)  # Condição
    
    # === CONTEÚDO ===
    
    # História clínica
    clinical_history = Column(Text, nullable=True)  # História clínica
    
    # Exame físico
    physical_examination = Column(Text, nullable=True)  # Exame físico
    
    # Exames complementares
    complementary_exams = Column(JSON, nullable=True)  # Exames complementares
    
    # Diagnóstico
    diagnosis = Column(Text, nullable=True)  # Diagnóstico
    
    # Tratamento
    treatment_plan = Column(Text, nullable=True)  # Plano de tratamento
    
    # Evolução
    evolution = Column(Text, nullable=True)  # Evolução
    
    # === OBJETIVOS EDUCACIONAIS ===
    
    # Objetivos
    learning_objectives = Column(JSON, nullable=True)  # Objetivos de aprendizagem
    
    # Competências
    target_competencies = Column(JSON, nullable=True)  # Competências alvo
    
    # === RECURSOS ===
    
    # Imagens
    images = Column(JSON, nullable=True)  # Imagens
    
    # Vídeos
    videos = Column(JSON, nullable=True)  # Vídeos
    
    # Documentos
    documents = Column(JSON, nullable=True)  # Documentos
    
    # === STATUS ===
    
    # Ativo
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Público
    is_public = Column(Boolean, default=False, nullable=False)
    
    # === ESTATÍSTICAS ===
    
    # Uso
    usage_count = Column(Integer, default=0, nullable=False)  # Número de usos
    
    # Avaliação
    average_rating = Column(Float, nullable=True)  # Avaliação média
    
    # === CONFIGURAÇÕES ===
    
    # Tags
    tags = Column(JSON, nullable=True)  # Tags
    
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
    sessions = relationship('MentorshipSession', back_populates='clinical_case')
    
    def __init__(self, **kwargs):
        super(ClinicalCase, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @property
    def category_display(self) -> str:
        """Retorna a categoria formatada"""
        category_names = {
            CaseCategory.ORTHOPEDIC: "Ortopédico",
            CaseCategory.NEUROLOGICAL: "Neurológico",
            CaseCategory.CARDIOPULMONARY: "Cardiopulmonar",
            CaseCategory.PEDIATRIC: "Pediátrico",
            CaseCategory.GERIATRIC: "Geriátrico",
            CaseCategory.SPORTS: "Esportivo",
            CaseCategory.OCCUPATIONAL: "Ocupacional",
            CaseCategory.WOMEN_HEALTH: "Saúde da Mulher",
            CaseCategory.CHRONIC_PAIN: "Dor Crônica",
            CaseCategory.POST_SURGICAL: "Pós-cirúrgico"
        }
        return category_names.get(self.category, self.category.value)
        
    @property
    def complexity_display(self) -> str:
        """Retorna a complexidade formatada"""
        complexity_names = {
            CaseComplexity.BASIC: "Básico",
            CaseComplexity.INTERMEDIATE: "Intermediário",
            CaseComplexity.ADVANCED: "Avançado",
            CaseComplexity.EXPERT: "Especialista"
        }
        return complexity_names.get(self.complexity, self.complexity.value)
        
    def get_complementary_exams(self) -> list:
        """Retorna os exames complementares"""
        return self.complementary_exams or []
        
    def get_learning_objectives(self) -> list:
        """Retorna os objetivos de aprendizagem"""
        return self.learning_objectives or []
        
    def get_target_competencies(self) -> list:
        """Retorna as competências alvo"""
        return self.target_competencies or []
        
    def get_images(self) -> list:
        """Retorna as imagens"""
        return self.images or []
        
    def get_videos(self) -> list:
        """Retorna os vídeos"""
        return self.videos or []
        
    def get_documents(self) -> list:
        """Retorna os documentos"""
        return self.documents or []
        
    def get_tags(self) -> list:
        """Retorna as tags"""
        return self.tags or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def increment_usage(self):
        """Incrementa o contador de uso"""
        self.usage_count += 1
        self.updated_at = datetime.now(pytz.UTC)
        
    def update_rating(self, rating: float):
        """Atualiza a avaliação"""
        if self.average_rating is None:
            self.average_rating = rating
        else:
            # Média simples (pode ser melhorada com peso)
            self.average_rating = (self.average_rating + rating) / 2
            
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def get_by_category(cls, category: CaseCategory):
        """Busca casos por categoria"""
        return cls.query.filter(
            cls.category == category,
            cls.is_active == True
        ).order_by(cls.title.asc()).all()
        
    @classmethod
    def get_by_complexity(cls, complexity: CaseComplexity):
        """Busca casos por complexidade"""
        return cls.query.filter(
            cls.complexity == complexity,
            cls.is_active == True
        ).order_by(cls.title.asc()).all()
        
    @classmethod
    def get_public(cls):
        """Busca casos públicos"""
        return cls.query.filter(
            cls.is_public == True,
            cls.is_active == True
        ).order_by(cls.average_rating.desc().nullslast(), cls.usage_count.desc()).all()
        
    def to_dict(self) -> dict:
        """Converte o caso para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'title': self.title,
            'description': self.description,
            'category': self.category.value,
            'category_display': self.category_display,
            'complexity': self.complexity.value,
            'complexity_display': self.complexity_display,
            'patient_age': self.patient_age,
            'patient_gender': self.patient_gender,
            'patient_condition': self.patient_condition,
            'clinical_history': self.clinical_history,
            'physical_examination': self.physical_examination,
            'complementary_exams': self.get_complementary_exams(),
            'diagnosis': self.diagnosis,
            'treatment_plan': self.treatment_plan,
            'evolution': self.evolution,
            'learning_objectives': self.get_learning_objectives(),
            'target_competencies': self.get_target_competencies(),
            'images': self.get_images(),
            'videos': self.get_videos(),
            'documents': self.get_documents(),
            'is_active': self.is_active,
            'is_public': self.is_public,
            'usage_count': self.usage_count,
            'average_rating': self.average_rating,
            'tags': self.get_tags(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<ClinicalCase {self.id} - {self.title}>'


class CompetencyEvaluation(db.Model):
    """Model para avaliações de competência"""
    
    __tablename__ = 'competency_evaluations'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Mentoria
    mentorship_id = Column(Integer, ForeignKey('mentorships.id'), nullable=False, index=True)
    
    # Avaliador (mentor)
    evaluator_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Avaliado (mentee)
    evaluated_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # === AVALIAÇÃO ===
    
    # Informações básicas
    title = Column(String(200), nullable=False)  # Título
    description = Column(Text, nullable=True)  # Descrição
    
    # Área de competência
    competency_area = Column(SQLEnum(CompetencyArea), nullable=False, index=True)
    
    # Status
    status = Column(SQLEnum(EvaluationStatus), default=EvaluationStatus.PENDING, nullable=False, index=True)
    
    # === CRITÉRIOS ===
    
    # Critérios de avaliação
    criteria = Column(JSON, nullable=True)  # Critérios
    
    # Pesos
    weights = Column(JSON, nullable=True)  # Pesos dos critérios
    
    # === NOTAS ===
    
    # Notas por critério
    scores = Column(JSON, nullable=True)  # Notas
    
    # Nota final
    final_grade = Column(Float, nullable=True)  # Nota final
    
    # Nota mínima para aprovação
    passing_grade = Column(Float, default=7.0, nullable=False)  # Nota mínima
    
    # === FEEDBACK ===
    
    # Pontos fortes
    strengths = Column(Text, nullable=True)  # Pontos fortes
    
    # Áreas de melhoria
    improvement_areas = Column(Text, nullable=True)  # Áreas de melhoria
    
    # Recomendações
    recommendations = Column(Text, nullable=True)  # Recomendações
    
    # Comentários gerais
    general_comments = Column(Text, nullable=True)  # Comentários gerais
    
    # === DATAS ===
    
    # Data da avaliação
    evaluation_date = Column(DateTime, nullable=True, index=True)  # Data da avaliação
    
    # Data de conclusão
    completed_date = Column(DateTime, nullable=True)  # Data de conclusão
    
    # Data de revisão
    reviewed_date = Column(DateTime, nullable=True)  # Data de revisão
    
    # === ANEXOS ===
    
    # Evidências
    evidences = Column(JSON, nullable=True)  # Evidências
    
    # Anexos
    attachments = Column(JSON, nullable=True)  # Anexos
    
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
    mentorship = relationship('Mentorship', back_populates='evaluations')
    evaluator = relationship('User', foreign_keys=[evaluator_id])
    evaluated = relationship('User', foreign_keys=[evaluated_id])
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(CompetencyEvaluation, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @property
    def competency_area_display(self) -> str:
        """Retorna a área de competência formatada"""
        area_names = {
            CompetencyArea.ASSESSMENT: "Avaliação",
            CompetencyArea.DIAGNOSIS: "Diagnóstico",
            CompetencyArea.TREATMENT_PLANNING: "Planejamento do Tratamento",
            CompetencyArea.INTERVENTION: "Intervenção",
            CompetencyArea.COMMUNICATION: "Comunicação",
            CompetencyArea.DOCUMENTATION: "Documentação",
            CompetencyArea.ETHICS: "Ética",
            CompetencyArea.RESEARCH: "Pesquisa",
            CompetencyArea.EDUCATION: "Educação",
            CompetencyArea.MANAGEMENT: "Gestão"
        }
        return area_names.get(self.competency_area, self.competency_area.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            EvaluationStatus.PENDING: "Pendente",
            EvaluationStatus.IN_PROGRESS: "Em Andamento",
            EvaluationStatus.COMPLETED: "Concluída",
            EvaluationStatus.REVIEWED: "Revisada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_completed(self) -> bool:
        """Verifica se a avaliação foi concluída"""
        return self.status in [EvaluationStatus.COMPLETED, EvaluationStatus.REVIEWED]
        
    @property
    def is_approved(self) -> bool:
        """Verifica se foi aprovado"""
        return self.final_grade is not None and self.final_grade >= self.passing_grade
        
    @property
    def grade_percentage(self) -> float:
        """Retorna a nota em percentual"""
        if self.final_grade is None:
            return 0.0
        return (self.final_grade / 10.0) * 100
        
    def get_criteria(self) -> list:
        """Retorna os critérios"""
        return self.criteria or []
        
    def get_weights(self) -> dict:
        """Retorna os pesos"""
        return self.weights or {}
        
    def get_scores(self) -> dict:
        """Retorna as notas"""
        return self.scores or {}
        
    def get_evidences(self) -> list:
        """Retorna as evidências"""
        return self.evidences or []
        
    def get_attachments(self) -> list:
        """Retorna os anexos"""
        return self.attachments or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_score(self, criterion: str, score: float):
        """Define a nota de um critério"""
        scores = self.get_scores()
        scores[criterion] = score
        self.scores = scores
        self.calculate_final_grade()
        
    def calculate_final_grade(self):
        """Calcula a nota final"""
        scores = self.get_scores()
        weights = self.get_weights()
        
        if not scores:
            return
            
        if weights:
            # Média ponderada
            total_weight = sum(weights.values())
            if total_weight > 0:
                weighted_sum = sum(scores.get(criterion, 0) * weight for criterion, weight in weights.items())
                self.final_grade = weighted_sum / total_weight
        else:
            # Média simples
            self.final_grade = sum(scores.values()) / len(scores)
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def start_evaluation(self):
        """Inicia a avaliação"""
        self.status = EvaluationStatus.IN_PROGRESS
        self.evaluation_date = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def complete_evaluation(self):
        """Completa a avaliação"""
        self.status = EvaluationStatus.COMPLETED
        self.completed_date = datetime.now(pytz.UTC)
        self.calculate_final_grade()
        self.updated_at = datetime.now(pytz.UTC)
        
    def review_evaluation(self):
        """Marca como revisada"""
        self.status = EvaluationStatus.REVIEWED
        self.reviewed_date = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def get_by_mentorship(cls, mentorship_id: int):
        """Busca avaliações por mentoria"""
        return cls.query.filter(
            cls.mentorship_id == mentorship_id
        ).order_by(cls.evaluation_date.desc()).all()
        
    @classmethod
    def get_by_competency_area(cls, area: CompetencyArea):
        """Busca avaliações por área de competência"""
        return cls.query.filter(
            cls.competency_area == area
        ).order_by(cls.evaluation_date.desc()).all()
        
    @classmethod
    def get_pending(cls):
        """Busca avaliações pendentes"""
        return cls.query.filter(
            cls.status == EvaluationStatus.PENDING
        ).order_by(cls.created_at.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte a avaliação para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'mentorship_id': self.mentorship_id,
            'evaluator_id': self.evaluator_id,
            'evaluated_id': self.evaluated_id,
            'title': self.title,
            'description': self.description,
            'competency_area': self.competency_area.value,
            'competency_area_display': self.competency_area_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'criteria': self.get_criteria(),
            'weights': self.get_weights(),
            'scores': self.get_scores(),
            'final_grade': self.final_grade,
            'passing_grade': self.passing_grade,
            'grade_percentage': self.grade_percentage,
            'is_approved': self.is_approved,
            'strengths': self.strengths,
            'improvement_areas': self.improvement_areas,
            'recommendations': self.recommendations,
            'general_comments': self.general_comments,
            'evaluation_date': self.evaluation_date.isoformat() if self.evaluation_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'reviewed_date': self.reviewed_date.isoformat() if self.reviewed_date else None,
            'evidences': self.get_evidences(),
            'attachments': self.get_attachments(),
            'is_completed': self.is_completed,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<CompetencyEvaluation {self.id} - {self.title} - {self.status.value}>'


class Certificate(db.Model):
    """Model para certificados"""
    
    __tablename__ = 'certificates'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Código do certificado
    certificate_code = Column(String(50), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Mentoria
    mentorship_id = Column(Integer, ForeignKey('mentorships.id'), nullable=False, index=True)
    
    # Beneficiário (mentee)
    recipient_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Emissor (mentor ou instituição)
    issuer_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # === CERTIFICADO ===
    
    # Informações básicas
    title = Column(String(200), nullable=False)  # Título
    description = Column(Text, nullable=True)  # Descrição
    
    # Tipo de certificado
    certificate_type = Column(String(50), nullable=False, index=True)  # Tipo
    
    # Status
    status = Column(SQLEnum(CertificateStatus), default=CertificateStatus.PENDING, nullable=False, index=True)
    
    # === CONTEÚDO ===
    
    # Competências certificadas
    certified_competencies = Column(JSON, nullable=True)  # Competências
    
    # Horas certificadas
    certified_hours = Column(Integer, nullable=False)  # Horas
    
    # Nota final
    final_grade = Column(Float, nullable=True)  # Nota final
    
    # === VALIDADE ===
    
    # Data de emissão
    issued_date = Column(DateTime, nullable=True, index=True)  # Data de emissão
    
    # Data de validade
    valid_until = Column(DateTime, nullable=True, index=True)  # Validade
    
    # Data de revogação
    revoked_date = Column(DateTime, nullable=True)  # Revogação
    
    # Motivo da revogação
    revocation_reason = Column(Text, nullable=True)  # Motivo da revogação
    
    # === VERIFICAÇÃO ===
    
    # Hash de verificação
    verification_hash = Column(String(255), nullable=True, index=True)  # Hash
    
    # URL de verificação
    verification_url = Column(String(500), nullable=True)  # URL de verificação
    
    # === TEMPLATE ===
    
    # Template usado
    template_name = Column(String(100), nullable=True)  # Template
    
    # Dados do template
    template_data = Column(JSON, nullable=True)  # Dados do template
    
    # === ARQUIVO ===
    
    # Caminho do arquivo
    file_path = Column(String(500), nullable=True)  # Caminho do arquivo
    
    # URL do arquivo
    file_url = Column(String(500), nullable=True)  # URL do arquivo
    
    # Tamanho do arquivo
    file_size = Column(Integer, nullable=True)  # Tamanho
    
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
    mentorship = relationship('Mentorship', back_populates='certificates')
    recipient = relationship('User', foreign_keys=[recipient_id])
    issuer = relationship('User', foreign_keys=[issuer_id])
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(Certificate, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.certificate_code:
            self.certificate_code = self.generate_certificate_code()
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            CertificateStatus.PENDING: "Pendente",
            CertificateStatus.ISSUED: "Emitido",
            CertificateStatus.REVOKED: "Revogado",
            CertificateStatus.EXPIRED: "Expirado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_valid(self) -> bool:
        """Verifica se o certificado é válido"""
        if self.status != CertificateStatus.ISSUED:
            return False
            
        if self.valid_until and datetime.now(pytz.UTC) > self.valid_until:
            return False
            
        return True
        
    @property
    def is_expired(self) -> bool:
        """Verifica se o certificado expirou"""
        return self.valid_until and datetime.now(pytz.UTC) > self.valid_until
        
    @property
    def days_until_expiry(self) -> int:
        """Retorna os dias até a expiração"""
        if not self.valid_until:
            return None
            
        delta = self.valid_until - datetime.now(pytz.UTC)
        return max(0, delta.days)
        
    def get_certified_competencies(self) -> list:
        """Retorna as competências certificadas"""
        return self.certified_competencies or []
        
    def get_template_data(self) -> dict:
        """Retorna os dados do template"""
        return self.template_data or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def generate_certificate_code(self) -> str:
        """Gera um código único para o certificado"""
        import hashlib
        import time
        
        # Usar timestamp + uuid para gerar código único
        timestamp = str(int(time.time()))
        unique_string = f"{timestamp}-{uuid.uuid4()}"
        
        # Gerar hash
        hash_object = hashlib.md5(unique_string.encode())
        hash_hex = hash_object.hexdigest()
        
        # Retornar os primeiros 12 caracteres em maiúsculo
        return hash_hex[:12].upper()
        
    def generate_verification_hash(self) -> str:
        """Gera hash de verificação"""
        import hashlib
        
        # Dados para o hash
        data = f"{self.certificate_code}-{self.recipient_id}-{self.issued_date}-{self.certified_hours}"
        
        # Gerar hash SHA-256
        hash_object = hashlib.sha256(data.encode())
        return hash_object.hexdigest()
        
    def issue_certificate(self):
        """Emite o certificado"""
        self.status = CertificateStatus.ISSUED
        self.issued_date = datetime.now(pytz.UTC)
        self.verification_hash = self.generate_verification_hash()
        self.updated_at = datetime.now(pytz.UTC)
        
    def revoke_certificate(self, reason: str = None):
        """Revoga o certificado"""
        self.status = CertificateStatus.REVOKED
        self.revoked_date = datetime.now(pytz.UTC)
        if reason:
            self.revocation_reason = reason
        self.updated_at = datetime.now(pytz.UTC)
        
    def check_expiry(self):
        """Verifica e atualiza status de expiração"""
        if self.is_expired and self.status == CertificateStatus.ISSUED:
            self.status = CertificateStatus.EXPIRED
            self.updated_at = datetime.now(pytz.UTC)
            
    @classmethod
    def verify_certificate(cls, certificate_code: str, verification_hash: str = None):
        """Verifica um certificado"""
        certificate = cls.query.filter(
            cls.certificate_code == certificate_code
        ).first()
        
        if not certificate:
            return None
            
        # Verificar hash se fornecido
        if verification_hash and certificate.verification_hash != verification_hash:
            return None
            
        # Verificar expiração
        certificate.check_expiry()
        
        return certificate
        
    @classmethod
    def get_by_recipient(cls, recipient_id: int):
        """Busca certificados por beneficiário"""
        return cls.query.filter(
            cls.recipient_id == recipient_id
        ).order_by(cls.issued_date.desc()).all()
        
    @classmethod
    def get_expiring_soon(cls, days: int = 30):
        """Busca certificados que expiram em breve"""
        cutoff_date = datetime.now(pytz.UTC) + timedelta(days=days)
        
        return cls.query.filter(
            cls.status == CertificateStatus.ISSUED,
            cls.valid_until <= cutoff_date,
            cls.valid_until > datetime.now(pytz.UTC)
        ).order_by(cls.valid_until.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte o certificado para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'certificate_code': self.certificate_code,
            'mentorship_id': self.mentorship_id,
            'recipient_id': self.recipient_id,
            'issuer_id': self.issuer_id,
            'title': self.title,
            'description': self.description,
            'certificate_type': self.certificate_type,
            'status': self.status.value,
            'status_display': self.status_display,
            'certified_competencies': self.get_certified_competencies(),
            'certified_hours': self.certified_hours,
            'final_grade': self.final_grade,
            'issued_date': self.issued_date.isoformat() if self.issued_date else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'revoked_date': self.revoked_date.isoformat() if self.revoked_date else None,
            'revocation_reason': self.revocation_reason,
            'verification_hash': self.verification_hash,
            'verification_url': self.verification_url,
            'template_name': self.template_name,
            'template_data': self.get_template_data(),
            'file_path': self.file_path,
            'file_url': self.file_url,
            'file_size': self.file_size,
            'is_valid': self.is_valid,
            'is_expired': self.is_expired,
            'days_until_expiry': self.days_until_expiry,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<Certificate {self.id} - {self.certificate_code} - {self.status.value}>'