# -*- coding: utf-8 -*-
"""
Model de Consulta de IA
Sistema FisioFlow - Sistema de IA Híbrido
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class AIProvider(enum.Enum):
    """Enum para provedores de IA"""
    CHATGPT_PLUS = "CHATGPT_PLUS"
    CLAUDE_PRO = "CLAUDE_PRO"
    GEMINI_PRO = "GEMINI_PRO"
    PERPLEXITY_PRO = "PERPLEXITY_PRO"
    INTERNAL_KB = "INTERNAL_KB"  # Base de conhecimento interna

class ConsultationType(enum.Enum):
    """Enum para tipos de consulta"""
    DIAGNOSIS_SUPPORT = "DIAGNOSIS_SUPPORT"  # Suporte ao diagnóstico
    TREATMENT_PLAN = "TREATMENT_PLAN"  # Plano de tratamento
    EXERCISE_RECOMMENDATION = "EXERCISE_RECOMMENDATION"  # Recomendação de exercícios
    PROGNOSIS_ANALYSIS = "PROGNOSIS_ANALYSIS"  # Análise de prognóstico
    LITERATURE_REVIEW = "LITERATURE_REVIEW"  # Revisão de literatura
    CASE_ANALYSIS = "CASE_ANALYSIS"  # Análise de caso
    PROTOCOL_SUGGESTION = "PROTOCOL_SUGGESTION"  # Sugestão de protocolo
    CONTRAINDICATION_CHECK = "CONTRAINDICATION_CHECK"  # Verificação de contraindicações

class ConsultationStatus(enum.Enum):
    """Enum para status da consulta"""
    PENDING = "PENDING"  # Pendente
    PROCESSING = "PROCESSING"  # Processando
    COMPLETED = "COMPLETED"  # Concluída
    FAILED = "FAILED"  # Falhou
    CANCELLED = "CANCELLED"  # Cancelada

class ConfidenceLevel(enum.Enum):
    """Enum para nível de confiança"""
    VERY_HIGH = "VERY_HIGH"  # Muito alta (90-100%)
    HIGH = "HIGH"  # Alta (75-89%)
    MEDIUM = "MEDIUM"  # Média (50-74%)
    LOW = "LOW"  # Baixa (25-49%)
    VERY_LOW = "VERY_LOW"  # Muito baixa (0-24%)

class AIConsultation(db.Model):
    """Model para consultas de IA"""
    
    __tablename__ = 'ai_consultations'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=True, index=True)  # Pode ser nulo para consultas gerais
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)  # Usuário que fez a consulta
    medical_record_id = Column(Integer, ForeignKey('medical_records.id'), nullable=True, index=True)
    
    # Tipo e status da consulta
    consultation_type = Column(Enum(ConsultationType), nullable=False)
    status = Column(Enum(ConsultationStatus), default=ConsultationStatus.PENDING, nullable=False)
    
    # Provedor de IA utilizado
    ai_provider = Column(Enum(AIProvider), nullable=False)
    provider_model = Column(String(100), nullable=True)  # Modelo específico (ex: gpt-4, claude-3, etc.)
    
    # === ENTRADA (INPUT) ===
    
    # Pergunta/consulta do usuário
    user_query = Column(Text, nullable=False)  # Pergunta original
    query_context = Column(Text, nullable=True)  # Contexto adicional
    
    # Dados do paciente (se aplicável)
    patient_data = Column(JSON, nullable=True)  # Dados relevantes do paciente (JSON)
    clinical_data = Column(JSON, nullable=True)  # Dados clínicos (JSON)
    
    # Parâmetros da consulta
    consultation_parameters = Column(JSON, nullable=True)  # Parâmetros específicos (JSON)
    
    # === SAÍDA (OUTPUT) ===
    
    # Resposta da IA
    ai_response = Column(Text, nullable=True)  # Resposta completa da IA
    summary = Column(Text, nullable=True)  # Resumo da resposta
    key_points = Column(JSON, nullable=True)  # Pontos-chave (JSON array)
    
    # Recomendações
    recommendations = Column(JSON, nullable=True)  # Recomendações estruturadas (JSON)
    contraindications = Column(JSON, nullable=True)  # Contraindicações identificadas (JSON)
    precautions = Column(JSON, nullable=True)  # Precauções (JSON)
    
    # Exercícios recomendados (se aplicável)
    recommended_exercises = Column(JSON, nullable=True)  # IDs dos exercícios recomendados (JSON)
    exercise_parameters = Column(JSON, nullable=True)  # Parâmetros dos exercícios (JSON)
    
    # Referências e evidências
    references = Column(JSON, nullable=True)  # Referências bibliográficas (JSON)
    evidence_level = Column(String(20), nullable=True)  # Nível de evidência
    
    # === QUALIDADE E CONFIANÇA ===
    
    # Confiança da resposta
    confidence_level = Column(Enum(ConfidenceLevel), nullable=True)
    confidence_score = Column(Float, nullable=True)  # Score de confiança (0-100)
    
    # Validação
    is_validated = Column(Boolean, default=False, nullable=False)  # Validada por profissional
    validated_by = Column(Integer, ForeignKey('users.id'), nullable=True)  # Quem validou
    validation_notes = Column(Text, nullable=True)  # Notas da validação
    validation_date = Column(DateTime, nullable=True)  # Data da validação
    
    # Feedback
    user_rating = Column(Integer, nullable=True)  # Avaliação do usuário (1-5)
    user_feedback = Column(Text, nullable=True)  # Feedback do usuário
    is_helpful = Column(Boolean, nullable=True)  # Foi útil?
    
    # === MÉTRICAS E PERFORMANCE ===
    
    # Tempo de processamento
    processing_time = Column(Float, nullable=True)  # Tempo em segundos
    tokens_used = Column(Integer, nullable=True)  # Tokens utilizados
    cost_estimate = Column(Float, nullable=True)  # Custo estimado
    
    # Uso e aplicação
    was_applied = Column(Boolean, default=False, nullable=False)  # Foi aplicada na prática
    application_notes = Column(Text, nullable=True)  # Notas sobre aplicação
    outcome_notes = Column(Text, nullable=True)  # Resultado da aplicação
    
    # === CAMPOS DE CONTROLE ===
    
    # Prioridade
    priority = Column(String(20), default='medium', nullable=False)  # low, medium, high, urgent
    
    # Tags e categorização
    tags = Column(JSON, nullable=True)  # Tags para categorização (JSON array)
    specialty_area = Column(String(100), nullable=True)  # Área de especialidade
    
    # Erro (se houver)
    error_message = Column(Text, nullable=True)  # Mensagem de erro
    error_code = Column(String(50), nullable=True)  # Código do erro
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    completed_at = Column(DateTime, nullable=True)  # Data de conclusão
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='ai_consultations')
    user = relationship('User', foreign_keys=[user_id], back_populates='ai_consultations')
    validator = relationship('User', foreign_keys=[validated_by])
    medical_record = relationship('MedicalRecord')
    
    def __init__(self, **kwargs):
        super(AIConsultation, self).__init__(**kwargs)
        
    @property
    def consultation_type_display(self) -> str:
        """Retorna o tipo de consulta formatado"""
        type_names = {
            ConsultationType.DIAGNOSIS_SUPPORT: "Suporte ao Diagnóstico",
            ConsultationType.TREATMENT_PLAN: "Plano de Tratamento",
            ConsultationType.EXERCISE_RECOMMENDATION: "Recomendação de Exercícios",
            ConsultationType.PROGNOSIS_ANALYSIS: "Análise de Prognóstico",
            ConsultationType.LITERATURE_REVIEW: "Revisão de Literatura",
            ConsultationType.CASE_ANALYSIS: "Análise de Caso",
            ConsultationType.PROTOCOL_SUGGESTION: "Sugestão de Protocolo",
            ConsultationType.CONTRAINDICATION_CHECK: "Verificação de Contraindicações"
        }
        return type_names.get(self.consultation_type, self.consultation_type.value)
        
    @property
    def ai_provider_display(self) -> str:
        """Retorna o provedor de IA formatado"""
        provider_names = {
            AIProvider.CHATGPT_PLUS: "ChatGPT Plus",
            AIProvider.CLAUDE_PRO: "Claude Pro",
            AIProvider.GEMINI_PRO: "Gemini Pro",
            AIProvider.PERPLEXITY_PRO: "Perplexity Pro",
            AIProvider.INTERNAL_KB: "Base de Conhecimento Interna"
        }
        return provider_names.get(self.ai_provider, self.ai_provider.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            ConsultationStatus.PENDING: "Pendente",
            ConsultationStatus.PROCESSING: "Processando",
            ConsultationStatus.COMPLETED: "Concluída",
            ConsultationStatus.FAILED: "Falhou",
            ConsultationStatus.CANCELLED: "Cancelada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def confidence_level_display(self) -> str:
        """Retorna o nível de confiança formatado"""
        if not self.confidence_level:
            return ""
        confidence_names = {
            ConfidenceLevel.VERY_HIGH: "Muito Alta",
            ConfidenceLevel.HIGH: "Alta",
            ConfidenceLevel.MEDIUM: "Média",
            ConfidenceLevel.LOW: "Baixa",
            ConfidenceLevel.VERY_LOW: "Muito Baixa"
        }
        return confidence_names.get(self.confidence_level, self.confidence_level.value)
        
    def get_patient_data(self) -> dict:
        """Retorna os dados do paciente"""
        return self.patient_data or {}
        
    def set_patient_data(self, data: dict):
        """Define os dados do paciente"""
        self.patient_data = data
        
    def get_clinical_data(self) -> dict:
        """Retorna os dados clínicos"""
        return self.clinical_data or {}
        
    def set_clinical_data(self, data: dict):
        """Define os dados clínicos"""
        self.clinical_data = data
        
    def get_consultation_parameters(self) -> dict:
        """Retorna os parâmetros da consulta"""
        return self.consultation_parameters or {}
        
    def set_consultation_parameters(self, parameters: dict):
        """Define os parâmetros da consulta"""
        self.consultation_parameters = parameters
        
    def get_key_points(self) -> list:
        """Retorna os pontos-chave"""
        return self.key_points or []
        
    def add_key_point(self, point: str):
        """Adiciona um ponto-chave"""
        points = self.get_key_points()
        points.append(point)
        self.key_points = points
        
    def get_recommendations(self) -> list:
        """Retorna as recomendações"""
        return self.recommendations or []
        
    def add_recommendation(self, recommendation: str, priority: str = "medium", category: str = None):
        """Adiciona uma recomendação"""
        recommendations = self.get_recommendations()
        rec = {
            'text': recommendation,
            'priority': priority,
            'category': category,
            'timestamp': datetime.now().isoformat()
        }
        recommendations.append(rec)
        self.recommendations = recommendations
        
    def get_contraindications(self) -> list:
        """Retorna as contraindicações"""
        return self.contraindications or []
        
    def add_contraindication(self, contraindication: str, severity: str = "medium"):
        """Adiciona uma contraindicação"""
        contraindications = self.get_contraindications()
        contra = {
            'text': contraindication,
            'severity': severity,
            'timestamp': datetime.now().isoformat()
        }
        contraindications.append(contra)
        self.contraindications = contraindications
        
    def get_precautions(self) -> list:
        """Retorna as precauções"""
        return self.precautions or []
        
    def add_precaution(self, precaution: str, importance: str = "medium"):
        """Adiciona uma precaução"""
        precautions = self.get_precautions()
        prec = {
            'text': precaution,
            'importance': importance,
            'timestamp': datetime.now().isoformat()
        }
        precautions.append(prec)
        self.precautions = precautions
        
    def get_recommended_exercises(self) -> list:
        """Retorna os exercícios recomendados"""
        return self.recommended_exercises or []
        
    def add_recommended_exercise(self, exercise_id: int, parameters: dict = None, notes: str = None):
        """Adiciona um exercício recomendado"""
        exercises = self.get_recommended_exercises()
        exercise = {
            'exercise_id': exercise_id,
            'parameters': parameters or {},
            'notes': notes,
            'timestamp': datetime.now().isoformat()
        }
        exercises.append(exercise)
        self.recommended_exercises = exercises
        
    def get_references(self) -> list:
        """Retorna as referências"""
        return self.references or []
        
    def add_reference(self, title: str, authors: str = None, journal: str = None, 
                     year: int = None, doi: str = None, url: str = None):
        """Adiciona uma referência"""
        references = self.get_references()
        ref = {
            'title': title,
            'authors': authors,
            'journal': journal,
            'year': year,
            'doi': doi,
            'url': url,
            'timestamp': datetime.now().isoformat()
        }
        references.append(ref)
        self.references = references
        
    def get_tags(self) -> list:
        """Retorna as tags"""
        return self.tags or []
        
    def add_tag(self, tag: str):
        """Adiciona uma tag"""
        tags = self.get_tags()
        if tag not in tags:
            tags.append(tag)
            self.tags = tags
            
    def remove_tag(self, tag: str):
        """Remove uma tag"""
        tags = self.get_tags()
        if tag in tags:
            tags.remove(tag)
            self.tags = tags
            
    def start_processing(self):
        """Inicia o processamento"""
        self.status = ConsultationStatus.PROCESSING
        self.updated_at = datetime.now(pytz.UTC)
        
    def complete_consultation(self, ai_response: str, processing_time: float = None):
        """Completa a consulta"""
        self.status = ConsultationStatus.COMPLETED
        self.ai_response = ai_response
        self.completed_at = datetime.now(pytz.UTC)
        if processing_time:
            self.processing_time = processing_time
            
    def fail_consultation(self, error_message: str, error_code: str = None):
        """Marca a consulta como falhada"""
        self.status = ConsultationStatus.FAILED
        self.error_message = error_message
        self.error_code = error_code
        self.completed_at = datetime.now(pytz.UTC)
        
    def cancel_consultation(self, reason: str = None):
        """Cancela a consulta"""
        self.status = ConsultationStatus.CANCELLED
        if reason:
            self.error_message = f"Cancelada: {reason}"
        self.completed_at = datetime.now(pytz.UTC)
        
    def validate_consultation(self, validator_id: int, notes: str = None):
        """Valida a consulta"""
        self.is_validated = True
        self.validated_by = validator_id
        self.validation_notes = notes
        self.validation_date = datetime.now(pytz.UTC)
        
    def rate_consultation(self, rating: int, feedback: str = None, is_helpful: bool = None):
        """Avalia a consulta"""
        if 1 <= rating <= 5:
            self.user_rating = rating
        self.user_feedback = feedback
        if is_helpful is not None:
            self.is_helpful = is_helpful
            
    def mark_as_applied(self, notes: str = None):
        """Marca como aplicada na prática"""
        self.was_applied = True
        self.application_notes = notes
        
    def add_outcome(self, outcome: str):
        """Adiciona resultado da aplicação"""
        if self.outcome_notes:
            self.outcome_notes += f"\n\n{outcome}"
        else:
            self.outcome_notes = outcome
            
    def calculate_effectiveness_score(self) -> float:
        """Calcula score de efetividade"""
        score = 0
        factors = 0
        
        # Rating do usuário (peso 40%)
        if self.user_rating:
            score += (self.user_rating / 5) * 40
            factors += 40
            
        # Foi útil (peso 30%)
        if self.is_helpful is not None:
            score += (1 if self.is_helpful else 0) * 30
            factors += 30
            
        # Foi aplicada (peso 20%)
        if self.was_applied:
            score += 20
        factors += 20
        
        # Validação (peso 10%)
        if self.is_validated:
            score += 10
        factors += 10
        
        return score / factors if factors > 0 else 0
        
    @classmethod
    def get_by_patient(cls, patient_id: int, consultation_type: ConsultationType = None, limit: int = None):
        """Retorna consultas de um paciente"""
        query = cls.query.filter_by(patient_id=patient_id)
        if consultation_type:
            query = query.filter_by(consultation_type=consultation_type)
        query = query.order_by(cls.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
        
    @classmethod
    def get_by_user(cls, user_id: int, limit: int = None):
        """Retorna consultas de um usuário"""
        query = cls.query.filter_by(user_id=user_id).order_by(cls.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
        
    @classmethod
    def get_pending(cls):
        """Retorna consultas pendentes"""
        return cls.query.filter_by(status=ConsultationStatus.PENDING).order_by(cls.created_at.asc()).all()
        
    @classmethod
    def get_by_provider(cls, ai_provider: AIProvider, limit: int = None):
        """Retorna consultas por provedor"""
        query = cls.query.filter_by(ai_provider=ai_provider).order_by(cls.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
        
    @classmethod
    def get_requiring_validation(cls):
        """Retorna consultas que precisam de validação"""
        return cls.query.filter_by(
            status=ConsultationStatus.COMPLETED,
            is_validated=False
        ).order_by(cls.completed_at.desc()).all()
        
    def to_dict(self, include_detailed=False) -> dict:
        """Converte a consulta para dicionário"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'user_id': self.user_id,
            'medical_record_id': self.medical_record_id,
            'consultation_type': self.consultation_type.value,
            'consultation_type_display': self.consultation_type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'ai_provider': self.ai_provider.value,
            'ai_provider_display': self.ai_provider_display,
            'provider_model': self.provider_model,
            'user_query': self.user_query,
            'summary': self.summary,
            'confidence_level': self.confidence_level.value if self.confidence_level else None,
            'confidence_level_display': self.confidence_level_display,
            'confidence_score': self.confidence_score,
            'is_validated': self.is_validated,
            'user_rating': self.user_rating,
            'is_helpful': self.is_helpful,
            'was_applied': self.was_applied,
            'priority': self.priority,
            'effectiveness_score': self.calculate_effectiveness_score(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
        
        if include_detailed:
            # Incluir todos os campos detalhados
            detailed_fields = [
                'query_context', 'ai_response', 'evidence_level', 'validation_notes',
                'validation_date', 'user_feedback', 'processing_time', 'tokens_used',
                'cost_estimate', 'application_notes', 'outcome_notes', 'specialty_area',
                'error_message', 'error_code', 'validated_by'
            ]
            
            for field in detailed_fields:
                value = getattr(self, field)
                if isinstance(value, datetime):
                    data[field] = value.isoformat() if value else None
                else:
                    data[field] = value
                    
            # Campos JSON
            data.update({
                'patient_data': self.get_patient_data(),
                'clinical_data': self.get_clinical_data(),
                'consultation_parameters': self.get_consultation_parameters(),
                'key_points': self.get_key_points(),
                'recommendations': self.get_recommendations(),
                'contraindications': self.get_contraindications(),
                'precautions': self.get_precautions(),
                'recommended_exercises': self.get_recommended_exercises(),
                'references': self.get_references(),
                'tags': self.get_tags()
            })
            
        return data
        
    def __repr__(self):
        return f'<AIConsultation {self.consultation_type.value} - {self.ai_provider.value} - {self.status.value}>'