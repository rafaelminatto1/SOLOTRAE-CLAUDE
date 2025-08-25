# -*- coding: utf-8 -*-
"""
Model de Evolução do Paciente
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class EvolutionType(enum.Enum):
    """Enum para tipos de evolução"""
    SESSAO = "SESSAO"  # Evolução de sessão
    SEMANAL = "SEMANAL"  # Evolução semanal
    MENSAL = "MENSAL"  # Evolução mensal
    REAVALIACAO = "REAVALIACAO"  # Reavaliação
    INTERCORRENCIA = "INTERCORRENCIA"  # Intercorrência
    ALTA = "ALTA"  # Alta

class PainEvolution(enum.Enum):
    """Enum para evolução da dor"""
    MELHORA_SIGNIFICATIVA = "MELHORA_SIGNIFICATIVA"
    MELHORA_LEVE = "MELHORA_LEVE"
    INALTERADO = "INALTERADO"
    PIORA_LEVE = "PIORA_LEVE"
    PIORA_SIGNIFICATIVA = "PIORA_SIGNIFICATIVA"

class FunctionalEvolution(enum.Enum):
    """Enum para evolução funcional"""
    MELHORA_SIGNIFICATIVA = "MELHORA_SIGNIFICATIVA"
    MELHORA_LEVE = "MELHORA_LEVE"
    INALTERADO = "INALTERADO"
    PIORA_LEVE = "PIORA_LEVE"
    PIORA_SIGNIFICATIVA = "PIORA_SIGNIFICATIVA"

class PatientSatisfaction(enum.Enum):
    """Enum para satisfação do paciente"""
    MUITO_SATISFEITO = "MUITO_SATISFEITO"
    SATISFEITO = "SATISFEITO"
    NEUTRO = "NEUTRO"
    INSATISFEITO = "INSATISFEITO"
    MUITO_INSATISFEITO = "MUITO_INSATISFEITO"

class Evolution(db.Model):
    """Model para evolução do paciente"""
    
    __tablename__ = 'evolutions'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False, index=True)
    physiotherapist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True, index=True)
    prescription_id = Column(Integer, ForeignKey('prescriptions.id'), nullable=True, index=True)
    
    # Tipo e data da evolução
    evolution_type = Column(Enum(EvolutionType), nullable=False)
    evolution_date = Column(DateTime, nullable=False)
    session_number = Column(Integer, nullable=True)  # número da sessão
    
    # === AVALIAÇÃO SUBJETIVA ===
    
    # Queixas do paciente
    patient_complaints = Column(Text, nullable=True)  # queixas atuais
    pain_level_current = Column(Integer, nullable=True)  # nível de dor atual (0-10)
    pain_level_best = Column(Integer, nullable=True)  # melhor nível de dor na semana (0-10)
    pain_level_worst = Column(Integer, nullable=True)  # pior nível de dor na semana (0-10)
    pain_evolution = Column(Enum(PainEvolution), nullable=True)  # evolução da dor
    pain_description = Column(Text, nullable=True)  # descrição da dor
    
    # Função e atividades
    functional_evolution = Column(Enum(FunctionalEvolution), nullable=True)  # evolução funcional
    activities_performance = Column(Text, nullable=True)  # desempenho em atividades
    limitations_current = Column(Text, nullable=True)  # limitações atuais
    improvements_noted = Column(Text, nullable=True)  # melhorias observadas
    
    # Adesão ao tratamento
    treatment_adherence = Column(Integer, nullable=True)  # adesão ao tratamento (0-100%)
    home_exercises_adherence = Column(Integer, nullable=True)  # adesão aos exercícios domiciliares (0-100%)
    missed_sessions = Column(Integer, nullable=True)  # sessões perdidas
    adherence_barriers = Column(Text, nullable=True)  # barreiras à adesão
    
    # Satisfação do paciente
    patient_satisfaction = Column(Enum(PatientSatisfaction), nullable=True)
    satisfaction_comments = Column(Text, nullable=True)  # comentários sobre satisfação
    
    # === AVALIAÇÃO OBJETIVA ===
    
    # Exame físico
    posture_changes = Column(Text, nullable=True)  # mudanças posturais
    range_of_motion_changes = Column(Text, nullable=True)  # mudanças na ADM (JSON)
    strength_changes = Column(Text, nullable=True)  # mudanças na força (JSON)
    balance_changes = Column(Text, nullable=True)  # mudanças no equilíbrio
    coordination_changes = Column(Text, nullable=True)  # mudanças na coordenação
    
    # Testes funcionais
    functional_tests = Column(Text, nullable=True)  # testes funcionais realizados (JSON)
    test_results = Column(Text, nullable=True)  # resultados dos testes (JSON)
    
    # Medidas objetivas
    objective_measures = Column(Text, nullable=True)  # medidas objetivas (JSON)
    
    # === INTERVENÇÃO REALIZADA ===
    
    # Técnicas utilizadas
    techniques_applied = Column(Text, nullable=True)  # técnicas aplicadas (JSON)
    exercises_performed = Column(Text, nullable=True)  # exercícios realizados (JSON)
    equipment_used = Column(Text, nullable=True)  # equipamentos utilizados (JSON)
    
    # Parâmetros da sessão
    session_duration = Column(Integer, nullable=True)  # duração da sessão em minutos
    session_intensity = Column(String(20), nullable=True)  # intensidade (baixa, moderada, alta)
    
    # Resposta à intervenção
    immediate_response = Column(Text, nullable=True)  # resposta imediata
    adverse_reactions = Column(Text, nullable=True)  # reações adversas
    
    # === PLANO ===
    
    # Próximos passos
    next_session_plan = Column(Text, nullable=True)  # plano para próxima sessão
    treatment_modifications = Column(Text, nullable=True)  # modificações no tratamento
    goals_adjustments = Column(Text, nullable=True)  # ajustes nos objetivos
    
    # Recomendações
    home_program_changes = Column(Text, nullable=True)  # mudanças no programa domiciliar
    precautions = Column(Text, nullable=True)  # precauções
    recommendations = Column(Text, nullable=True)  # recomendações gerais
    
    # Frequência e duração
    frequency_recommendation = Column(String(100), nullable=True)  # recomendação de frequência
    estimated_sessions_remaining = Column(Integer, nullable=True)  # sessões estimadas restantes
    
    # === CAMPOS DE CONTROLE ===
    
    # Status
    is_significant = Column(Boolean, default=False, nullable=False)  # evolução significativa
    requires_attention = Column(Boolean, default=False, nullable=False)  # requer atenção
    
    # Comunicação
    family_communication = Column(Text, nullable=True)  # comunicação com família
    physician_communication = Column(Text, nullable=True)  # comunicação com médico
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='evolutions')
    physiotherapist = relationship('User', foreign_keys=[physiotherapist_id])
    appointment = relationship('Appointment', back_populates='evolution')
    prescription = relationship('Prescription', back_populates='evolutions')
    
    def __init__(self, **kwargs):
        super(Evolution, self).__init__(**kwargs)
        if not self.evolution_date:
            self.evolution_date = datetime.now(pytz.UTC)
            
    @property
    def evolution_type_display(self) -> str:
        """Retorna o tipo de evolução formatado"""
        type_names = {
            EvolutionType.SESSAO: "Evolução de Sessão",
            EvolutionType.SEMANAL: "Evolução Semanal",
            EvolutionType.MENSAL: "Evolução Mensal",
            EvolutionType.REAVALIACAO: "Reavaliação",
            EvolutionType.INTERCORRENCIA: "Intercorrência",
            EvolutionType.ALTA: "Alta"
        }
        return type_names.get(self.evolution_type, self.evolution_type.value)
        
    @property
    def pain_evolution_display(self) -> str:
        """Retorna a evolução da dor formatada"""
        if not self.pain_evolution:
            return ""
        evolution_names = {
            PainEvolution.MELHORA_SIGNIFICATIVA: "Melhora Significativa",
            PainEvolution.MELHORA_LEVE: "Melhora Leve",
            PainEvolution.INALTERADO: "Inalterado",
            PainEvolution.PIORA_LEVE: "Piora Leve",
            PainEvolution.PIORA_SIGNIFICATIVA: "Piora Significativa"
        }
        return evolution_names.get(self.pain_evolution, self.pain_evolution.value)
        
    @property
    def functional_evolution_display(self) -> str:
        """Retorna a evolução funcional formatada"""
        if not self.functional_evolution:
            return ""
        evolution_names = {
            FunctionalEvolution.MELHORA_SIGNIFICATIVA: "Melhora Significativa",
            FunctionalEvolution.MELHORA_LEVE: "Melhora Leve",
            FunctionalEvolution.INALTERADO: "Inalterado",
            FunctionalEvolution.PIORA_LEVE: "Piora Leve",
            FunctionalEvolution.PIORA_SIGNIFICATIVA: "Piora Significativa"
        }
        return evolution_names.get(self.functional_evolution, self.functional_evolution.value)
        
    @property
    def patient_satisfaction_display(self) -> str:
        """Retorna a satisfação do paciente formatada"""
        if not self.patient_satisfaction:
            return ""
        satisfaction_names = {
            PatientSatisfaction.MUITO_SATISFEITO: "Muito Satisfeito",
            PatientSatisfaction.SATISFEITO: "Satisfeito",
            PatientSatisfaction.NEUTRO: "Neutro",
            PatientSatisfaction.INSATISFEITO: "Insatisfeito",
            PatientSatisfaction.MUITO_INSATISFEITO: "Muito Insatisfeito"
        }
        return satisfaction_names.get(self.patient_satisfaction, self.patient_satisfaction.value)
        
    @property
    def pain_average(self) -> float:
        """Calcula a média de dor da semana"""
        pain_levels = []
        if self.pain_level_current is not None:
            pain_levels.append(self.pain_level_current)
        if self.pain_level_best is not None:
            pain_levels.append(self.pain_level_best)
        if self.pain_level_worst is not None:
            pain_levels.append(self.pain_level_worst)
            
        return sum(pain_levels) / len(pain_levels) if pain_levels else 0
        
    def get_range_of_motion_changes(self) -> dict:
        """Retorna as mudanças na amplitude de movimento"""
        import json
        try:
            return json.loads(self.range_of_motion_changes) if self.range_of_motion_changes else {}
        except:
            return {}
            
    def set_range_of_motion_changes(self, rom_changes: dict):
        """Define as mudanças na amplitude de movimento"""
        import json
        self.range_of_motion_changes = json.dumps(rom_changes)
        
    def get_strength_changes(self) -> dict:
        """Retorna as mudanças na força"""
        import json
        try:
            return json.loads(self.strength_changes) if self.strength_changes else {}
        except:
            return {}
            
    def set_strength_changes(self, strength_changes: dict):
        """Define as mudanças na força"""
        import json
        self.strength_changes = json.dumps(strength_changes)
        
    def get_functional_tests(self) -> list:
        """Retorna os testes funcionais"""
        import json
        try:
            return json.loads(self.functional_tests) if self.functional_tests else []
        except:
            return []
            
    def add_functional_test(self, test_name: str, result: str, notes: str = None):
        """Adiciona um teste funcional"""
        import json
        tests = self.get_functional_tests()
        test = {
            'name': test_name,
            'result': result,
            'notes': notes,
            'date': datetime.now().isoformat()
        }
        tests.append(test)
        self.functional_tests = json.dumps(tests)
        
    def get_test_results(self) -> dict:
        """Retorna os resultados dos testes"""
        import json
        try:
            return json.loads(self.test_results) if self.test_results else {}
        except:
            return {}
            
    def set_test_results(self, results: dict):
        """Define os resultados dos testes"""
        import json
        self.test_results = json.dumps(results)
        
    def get_objective_measures(self) -> dict:
        """Retorna as medidas objetivas"""
        import json
        try:
            return json.loads(self.objective_measures) if self.objective_measures else {}
        except:
            return {}
            
    def set_objective_measures(self, measures: dict):
        """Define as medidas objetivas"""
        import json
        self.objective_measures = json.dumps(measures)
        
    def get_techniques_applied(self) -> list:
        """Retorna as técnicas aplicadas"""
        import json
        try:
            return json.loads(self.techniques_applied) if self.techniques_applied else []
        except:
            return []
            
    def add_technique_applied(self, technique: str, parameters: dict = None, notes: str = None):
        """Adiciona uma técnica aplicada"""
        import json
        techniques = self.get_techniques_applied()
        technique_item = {
            'name': technique,
            'parameters': parameters or {},
            'notes': notes,
            'timestamp': datetime.now().isoformat()
        }
        techniques.append(technique_item)
        self.techniques_applied = json.dumps(techniques)
        
    def get_exercises_performed(self) -> list:
        """Retorna os exercícios realizados"""
        import json
        try:
            return json.loads(self.exercises_performed) if self.exercises_performed else []
        except:
            return []
            
    def add_exercise_performed(self, exercise_name: str, sets: int = None, reps: int = None, 
                              duration: int = None, notes: str = None):
        """Adiciona um exercício realizado"""
        import json
        exercises = self.get_exercises_performed()
        exercise = {
            'name': exercise_name,
            'sets': sets,
            'reps': reps,
            'duration': duration,
            'notes': notes,
            'timestamp': datetime.now().isoformat()
        }
        exercises.append(exercise)
        self.exercises_performed = json.dumps(exercises)
        
    def get_equipment_used(self) -> list:
        """Retorna os equipamentos utilizados"""
        import json
        try:
            return json.loads(self.equipment_used) if self.equipment_used else []
        except:
            return []
            
    def add_equipment_used(self, equipment: str, purpose: str = None):
        """Adiciona um equipamento utilizado"""
        import json
        equipment_list = self.get_equipment_used()
        equipment_item = {
            'name': equipment,
            'purpose': purpose,
            'timestamp': datetime.now().isoformat()
        }
        equipment_list.append(equipment_item)
        self.equipment_used = json.dumps(equipment_list)
        
    def calculate_progress_score(self) -> float:
        """Calcula um score de progresso baseado nas evoluções"""
        score = 0
        factors = 0
        
        # Evolução da dor (peso 30%)
        if self.pain_evolution:
            pain_scores = {
                PainEvolution.MELHORA_SIGNIFICATIVA: 10,
                PainEvolution.MELHORA_LEVE: 7,
                PainEvolution.INALTERADO: 5,
                PainEvolution.PIORA_LEVE: 3,
                PainEvolution.PIORA_SIGNIFICATIVA: 0
            }
            score += pain_scores.get(self.pain_evolution, 5) * 0.3
            factors += 0.3
            
        # Evolução funcional (peso 30%)
        if self.functional_evolution:
            func_scores = {
                FunctionalEvolution.MELHORA_SIGNIFICATIVA: 10,
                FunctionalEvolution.MELHORA_LEVE: 7,
                FunctionalEvolution.INALTERADO: 5,
                FunctionalEvolution.PIORA_LEVE: 3,
                FunctionalEvolution.PIORA_SIGNIFICATIVA: 0
            }
            score += func_scores.get(self.functional_evolution, 5) * 0.3
            factors += 0.3
            
        # Adesão ao tratamento (peso 20%)
        if self.treatment_adherence is not None:
            score += (self.treatment_adherence / 10) * 0.2
            factors += 0.2
            
        # Satisfação do paciente (peso 20%)
        if self.patient_satisfaction:
            satisfaction_scores = {
                PatientSatisfaction.MUITO_SATISFEITO: 10,
                PatientSatisfaction.SATISFEITO: 8,
                PatientSatisfaction.NEUTRO: 5,
                PatientSatisfaction.INSATISFEITO: 2,
                PatientSatisfaction.MUITO_INSATISFEITO: 0
            }
            score += satisfaction_scores.get(self.patient_satisfaction, 5) * 0.2
            factors += 0.2
            
        return score / factors if factors > 0 else 5.0
        
    def mark_as_significant(self, reason: str = None):
        """Marca a evolução como significativa"""
        self.is_significant = True
        if reason and self.improvements_noted:
            self.improvements_noted += f"\n\n[EVOLUÇÃO SIGNIFICATIVA] {reason}"
        elif reason:
            self.improvements_noted = f"[EVOLUÇÃO SIGNIFICATIVA] {reason}"
            
    def mark_requires_attention(self, reason: str = None):
        """Marca a evolução como requerendo atenção"""
        self.requires_attention = True
        if reason and self.adverse_reactions:
            self.adverse_reactions += f"\n\n[REQUER ATENÇÃO] {reason}"
        elif reason:
            self.adverse_reactions = f"[REQUER ATENÇÃO] {reason}"
            
    @classmethod
    def get_by_patient(cls, patient_id: int, evolution_type: EvolutionType = None, limit: int = None):
        """Retorna evoluções de um paciente"""
        query = cls.query.filter_by(patient_id=patient_id)
        if evolution_type:
            query = query.filter_by(evolution_type=evolution_type)
        query = query.order_by(cls.evolution_date.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
        
    @classmethod
    def get_latest_by_patient(cls, patient_id: int):
        """Retorna a última evolução de um paciente"""
        return cls.query.filter_by(patient_id=patient_id).order_by(cls.evolution_date.desc()).first()
        
    @classmethod
    def get_significant_evolutions(cls, patient_id: int = None):
        """Retorna evoluções significativas"""
        query = cls.query.filter_by(is_significant=True)
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        return query.order_by(cls.evolution_date.desc()).all()
        
    @classmethod
    def get_requiring_attention(cls, patient_id: int = None):
        """Retorna evoluções que requerem atenção"""
        query = cls.query.filter_by(requires_attention=True)
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        return query.order_by(cls.evolution_date.desc()).all()
        
    def to_dict(self, include_detailed=False) -> dict:
        """Converte a evolução para dicionário"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'physiotherapist_id': self.physiotherapist_id,
            'appointment_id': self.appointment_id,
            'prescription_id': self.prescription_id,
            'evolution_type': self.evolution_type.value,
            'evolution_type_display': self.evolution_type_display,
            'evolution_date': self.evolution_date.isoformat(),
            'session_number': self.session_number,
            'is_significant': self.is_significant,
            'requires_attention': self.requires_attention,
            'progress_score': self.calculate_progress_score(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        # Campos básicos sempre incluídos
        basic_fields = [
            'patient_complaints', 'pain_level_current', 'pain_evolution',
            'functional_evolution', 'treatment_adherence', 'patient_satisfaction',
            'immediate_response', 'next_session_plan'
        ]
        
        for field in basic_fields:
            value = getattr(self, field)
            if hasattr(value, 'value'):  # Enum
                data[field] = value.value
            else:
                data[field] = value
                
        # Campos de display
        data.update({
            'pain_evolution_display': self.pain_evolution_display,
            'functional_evolution_display': self.functional_evolution_display,
            'patient_satisfaction_display': self.patient_satisfaction_display,
            'pain_average': self.pain_average
        })
        
        if include_detailed:
            # Incluir todos os campos detalhados
            detailed_fields = [
                'pain_level_best', 'pain_level_worst', 'pain_description',
                'activities_performance', 'limitations_current', 'improvements_noted',
                'home_exercises_adherence', 'missed_sessions', 'adherence_barriers',
                'satisfaction_comments', 'posture_changes', 'balance_changes',
                'coordination_changes', 'session_duration', 'session_intensity',
                'adverse_reactions', 'treatment_modifications', 'goals_adjustments',
                'home_program_changes', 'precautions', 'recommendations',
                'frequency_recommendation', 'estimated_sessions_remaining',
                'family_communication', 'physician_communication'
            ]
            
            for field in detailed_fields:
                data[field] = getattr(self, field)
                
            # Campos JSON
            data.update({
                'range_of_motion_changes': self.get_range_of_motion_changes(),
                'strength_changes': self.get_strength_changes(),
                'functional_tests': self.get_functional_tests(),
                'test_results': self.get_test_results(),
                'objective_measures': self.get_objective_measures(),
                'techniques_applied': self.get_techniques_applied(),
                'exercises_performed': self.get_exercises_performed(),
                'equipment_used': self.get_equipment_used()
            })
            
        return data
        
    def __repr__(self):
        return f'<Evolution {self.evolution_type.value} - Patient {self.patient_id} - {self.evolution_date.strftime("%d/%m/%Y")}>'