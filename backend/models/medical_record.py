# -*- coding: utf-8 -*-
"""
Model de Prontuário Médico
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
Conforme padrões COFFITO
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class RecordType(enum.Enum):
    """Enum para tipos de registro"""
    AVALIACAO_INICIAL = "AVALIACAO_INICIAL"
    EVOLUCAO = "EVOLUCAO"
    REAVALIACAO = "REAVALIACAO"
    ALTA = "ALTA"
    INTERCORRENCIA = "INTERCORRENCIA"
    ORIENTACAO = "ORIENTACAO"

class PainScale(enum.Enum):
    """Enum para escalas de dor"""
    EVA = "EVA"  # Escala Visual Analógica
    FACES = "FACES"  # Escala de Faces
    NUMERICA = "NUMERICA"  # Escala Numérica
    VERBAL = "VERBAL"  # Escala Verbal

class FunctionalStatus(enum.Enum):
    """Enum para status funcional"""
    INDEPENDENTE = "INDEPENDENTE"
    DEPENDENCIA_LEVE = "DEPENDENCIA_LEVE"
    DEPENDENCIA_MODERADA = "DEPENDENCIA_MODERADA"
    DEPENDENCIA_SEVERA = "DEPENDENCIA_SEVERA"
    DEPENDENCIA_TOTAL = "DEPENDENCIA_TOTAL"

class MedicalRecord(db.Model):
    """Model para prontuários médicos conforme COFFITO"""
    
    __tablename__ = 'medical_records'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False, index=True)
    physiotherapist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True, index=True)
    
    # Tipo e data do registro
    record_type = Column(Enum(RecordType), nullable=False)
    record_date = Column(DateTime, nullable=False)
    
    # === DADOS DA AVALIAÇÃO INICIAL ===
    
    # Anamnese
    chief_complaint = Column(Text, nullable=True)  # queixa principal
    current_illness_history = Column(Text, nullable=True)  # história da doença atual
    past_medical_history = Column(Text, nullable=True)  # antecedentes pessoais
    family_history = Column(Text, nullable=True)  # antecedentes familiares
    social_history = Column(Text, nullable=True)  # história social
    medications = Column(Text, nullable=True)  # medicamentos em uso
    allergies = Column(Text, nullable=True)  # alergias
    
    # Exame físico geral
    general_appearance = Column(Text, nullable=True)  # aspecto geral
    vital_signs = Column(Text, nullable=True)  # sinais vitais (JSON)
    weight = Column(Float, nullable=True)  # peso em kg
    height = Column(Float, nullable=True)  # altura em cm
    bmi = Column(Float, nullable=True)  # IMC
    
    # Avaliação da dor
    pain_scale_type = Column(Enum(PainScale), nullable=True)
    pain_intensity = Column(Integer, nullable=True)  # 0-10
    pain_location = Column(Text, nullable=True)  # localização da dor
    pain_characteristics = Column(Text, nullable=True)  # características da dor
    pain_triggers = Column(Text, nullable=True)  # fatores desencadeantes
    pain_relief_factors = Column(Text, nullable=True)  # fatores de alívio
    
    # Exame físico específico
    posture_analysis = Column(Text, nullable=True)  # análise postural
    gait_analysis = Column(Text, nullable=True)  # análise da marcha
    range_of_motion = Column(Text, nullable=True)  # amplitude de movimento (JSON)
    muscle_strength = Column(Text, nullable=True)  # força muscular (JSON)
    muscle_tone = Column(Text, nullable=True)  # tônus muscular
    reflexes = Column(Text, nullable=True)  # reflexos
    sensitivity = Column(Text, nullable=True)  # sensibilidade
    coordination = Column(Text, nullable=True)  # coordenação
    balance = Column(Text, nullable=True)  # equilíbrio
    
    # Testes especiais
    special_tests = Column(Text, nullable=True)  # testes especiais realizados (JSON)
    
    # Exames complementares
    imaging_exams = Column(Text, nullable=True)  # exames de imagem (JSON)
    laboratory_exams = Column(Text, nullable=True)  # exames laboratoriais (JSON)
    other_exams = Column(Text, nullable=True)  # outros exames (JSON)
    
    # Avaliação funcional
    functional_status = Column(Enum(FunctionalStatus), nullable=True)
    functional_scales = Column(Text, nullable=True)  # escalas funcionais aplicadas (JSON)
    activities_daily_living = Column(Text, nullable=True)  # atividades de vida diária
    work_activities = Column(Text, nullable=True)  # atividades laborais
    sports_activities = Column(Text, nullable=True)  # atividades esportivas
    
    # === DIAGNÓSTICO FISIOTERAPÊUTICO ===
    
    # Diagnóstico
    primary_diagnosis = Column(Text, nullable=True)  # diagnóstico principal
    secondary_diagnoses = Column(Text, nullable=True)  # diagnósticos secundários
    icd_codes = Column(Text, nullable=True)  # códigos CID (JSON)
    
    # Problemas identificados
    problems_list = Column(Text, nullable=True)  # lista de problemas (JSON)
    
    # === PLANO TERAPÊUTICO ===
    
    # Objetivos
    short_term_goals = Column(Text, nullable=True)  # objetivos a curto prazo
    long_term_goals = Column(Text, nullable=True)  # objetivos a longo prazo
    
    # Plano de tratamento
    treatment_plan = Column(Text, nullable=True)  # plano de tratamento
    treatment_frequency = Column(String(100), nullable=True)  # frequência do tratamento
    estimated_duration = Column(String(100), nullable=True)  # duração estimada
    
    # Técnicas e recursos
    techniques_used = Column(Text, nullable=True)  # técnicas utilizadas (JSON)
    equipment_used = Column(Text, nullable=True)  # equipamentos utilizados (JSON)
    
    # === EVOLUÇÃO ===
    
    # Evolução do quadro
    evolution_notes = Column(Text, nullable=True)  # notas de evolução
    patient_response = Column(Text, nullable=True)  # resposta do paciente
    adherence_notes = Column(Text, nullable=True)  # adesão ao tratamento
    
    # Reavaliação
    reassessment_findings = Column(Text, nullable=True)  # achados da reavaliação
    goals_achievement = Column(Text, nullable=True)  # alcance dos objetivos
    plan_modifications = Column(Text, nullable=True)  # modificações no plano
    
    # === ALTA ===
    
    # Condições de alta
    discharge_reason = Column(Text, nullable=True)  # motivo da alta
    discharge_condition = Column(Text, nullable=True)  # condições na alta
    final_assessment = Column(Text, nullable=True)  # avaliação final
    home_program = Column(Text, nullable=True)  # programa domiciliar
    follow_up_recommendations = Column(Text, nullable=True)  # recomendações de seguimento
    
    # === CAMPOS DE CONTROLE ===
    
    # Assinatura digital
    digital_signature = Column(Text, nullable=True)  # assinatura digital do fisioterapeuta
    crefito_number = Column(String(20), nullable=True)  # número do CREFITO
    
    # Status do registro
    is_finalized = Column(Boolean, default=False, nullable=False)  # registro finalizado
    is_locked = Column(Boolean, default=False, nullable=False)  # registro bloqueado para edição
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    finalized_at = Column(DateTime, nullable=True)  # data de finalização
    
    # Relacionamentos
    patient = relationship('Patient', back_populates='medical_records')
    physiotherapist = relationship('User', foreign_keys=[physiotherapist_id])
    appointment = relationship('Appointment', back_populates='medical_record')
    attachments = relationship('MedicalRecordAttachment', back_populates='medical_record', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(MedicalRecord, self).__init__(**kwargs)
        if not self.record_date:
            self.record_date = datetime.now(pytz.UTC)
        if self.weight and self.height:
            self.calculate_bmi()
            
    @property
    def record_type_display(self) -> str:
        """Retorna o tipo de registro formatado"""
        type_names = {
            RecordType.AVALIACAO_INICIAL: "Avaliação Inicial",
            RecordType.EVOLUCAO: "Evolução",
            RecordType.REAVALIACAO: "Reavaliação",
            RecordType.ALTA: "Alta",
            RecordType.INTERCORRENCIA: "Intercorrência",
            RecordType.ORIENTACAO: "Orientação"
        }
        return type_names.get(self.record_type, self.record_type.value)
        
    @property
    def pain_scale_display(self) -> str:
        """Retorna a escala de dor formatada"""
        if not self.pain_scale_type:
            return ""
        scale_names = {
            PainScale.EVA: "Escala Visual Analógica",
            PainScale.FACES: "Escala de Faces",
            PainScale.NUMERICA: "Escala Numérica",
            PainScale.VERBAL: "Escala Verbal"
        }
        return scale_names.get(self.pain_scale_type, self.pain_scale_type.value)
        
    @property
    def functional_status_display(self) -> str:
        """Retorna o status funcional formatado"""
        if not self.functional_status:
            return ""
        status_names = {
            FunctionalStatus.INDEPENDENTE: "Independente",
            FunctionalStatus.DEPENDENCIA_LEVE: "Dependência Leve",
            FunctionalStatus.DEPENDENCIA_MODERADA: "Dependência Moderada",
            FunctionalStatus.DEPENDENCIA_SEVERA: "Dependência Severa",
            FunctionalStatus.DEPENDENCIA_TOTAL: "Dependência Total"
        }
        return status_names.get(self.functional_status, self.functional_status.value)
        
    def calculate_bmi(self):
        """Calcula o IMC"""
        if self.weight and self.height:
            height_m = self.height / 100  # converter cm para metros
            self.bmi = round(self.weight / (height_m ** 2), 2)
            
    def get_vital_signs(self) -> dict:
        """Retorna os sinais vitais"""
        import json
        try:
            return json.loads(self.vital_signs) if self.vital_signs else {}
        except:
            return {}
            
    def set_vital_signs(self, vital_signs: dict):
        """Define os sinais vitais"""
        import json
        self.vital_signs = json.dumps(vital_signs)
        
    def get_range_of_motion(self) -> dict:
        """Retorna a amplitude de movimento"""
        import json
        try:
            return json.loads(self.range_of_motion) if self.range_of_motion else {}
        except:
            return {}
            
    def set_range_of_motion(self, rom_data: dict):
        """Define a amplitude de movimento"""
        import json
        self.range_of_motion = json.dumps(rom_data)
        
    def get_muscle_strength(self) -> dict:
        """Retorna a força muscular"""
        import json
        try:
            return json.loads(self.muscle_strength) if self.muscle_strength else {}
        except:
            return {}
            
    def set_muscle_strength(self, strength_data: dict):
        """Define a força muscular"""
        import json
        self.muscle_strength = json.dumps(strength_data)
        
    def get_special_tests(self) -> list:
        """Retorna os testes especiais"""
        import json
        try:
            return json.loads(self.special_tests) if self.special_tests else []
        except:
            return []
            
    def add_special_test(self, test_name: str, result: str, notes: str = None):
        """Adiciona um teste especial"""
        import json
        tests = self.get_special_tests()
        test = {
            'name': test_name,
            'result': result,
            'notes': notes,
            'date': datetime.now().isoformat()
        }
        tests.append(test)
        self.special_tests = json.dumps(tests)
        
    def get_imaging_exams(self) -> list:
        """Retorna os exames de imagem"""
        import json
        try:
            return json.loads(self.imaging_exams) if self.imaging_exams else []
        except:
            return []
            
    def add_imaging_exam(self, exam_type: str, date: str, result: str, file_url: str = None):
        """Adiciona um exame de imagem"""
        import json
        exams = self.get_imaging_exams()
        exam = {
            'type': exam_type,
            'date': date,
            'result': result,
            'file_url': file_url
        }
        exams.append(exam)
        self.imaging_exams = json.dumps(exams)
        
    def get_problems_list(self) -> list:
        """Retorna a lista de problemas"""
        import json
        try:
            return json.loads(self.problems_list) if self.problems_list else []
        except:
            return []
            
    def add_problem(self, problem: str, priority: str = "medium"):
        """Adiciona um problema à lista"""
        import json
        problems = self.get_problems_list()
        problem_item = {
            'description': problem,
            'priority': priority,
            'identified_date': datetime.now().isoformat(),
            'status': 'active'
        }
        problems.append(problem_item)
        self.problems_list = json.dumps(problems)
        
    def get_techniques_used(self) -> list:
        """Retorna as técnicas utilizadas"""
        import json
        try:
            return json.loads(self.techniques_used) if self.techniques_used else []
        except:
            return []
            
    def add_technique(self, technique: str, description: str = None):
        """Adiciona uma técnica utilizada"""
        import json
        techniques = self.get_techniques_used()
        technique_item = {
            'name': technique,
            'description': description,
            'date': datetime.now().isoformat()
        }
        techniques.append(technique_item)
        self.techniques_used = json.dumps(techniques)
        
    def finalize_record(self, crefito_number: str = None):
        """Finaliza o registro"""
        self.is_finalized = True
        self.finalized_at = datetime.now(pytz.UTC)
        if crefito_number:
            self.crefito_number = crefito_number
        # Aqui seria implementada a assinatura digital
        
    def lock_record(self):
        """Bloqueia o registro para edição"""
        self.is_locked = True
        
    def unlock_record(self):
        """Desbloqueia o registro para edição"""
        if not self.is_finalized:
            self.is_locked = False
            
    def can_edit(self) -> bool:
        """Verifica se o registro pode ser editado"""
        return not self.is_locked and not self.is_finalized
        
    def add_evolution_note(self, note: str):
        """Adiciona uma nota de evolução"""
        timestamp = datetime.now().strftime('%d/%m/%Y %H:%M')
        evolution_text = f"[{timestamp}] {note}"
        
        if self.evolution_notes:
            self.evolution_notes += f"\n\n{evolution_text}"
        else:
            self.evolution_notes = evolution_text
            
    @classmethod
    def get_by_patient(cls, patient_id: int, record_type: RecordType = None):
        """Retorna registros de um paciente"""
        query = cls.query.filter_by(patient_id=patient_id)
        if record_type:
            query = query.filter_by(record_type=record_type)
        return query.order_by(cls.record_date.desc()).all()
        
    @classmethod
    def get_initial_assessment(cls, patient_id: int):
        """Retorna a avaliação inicial de um paciente"""
        return cls.query.filter_by(
            patient_id=patient_id,
            record_type=RecordType.AVALIACAO_INICIAL
        ).first()
        
    @classmethod
    def get_latest_evolution(cls, patient_id: int):
        """Retorna a última evolução de um paciente"""
        return cls.query.filter_by(
            patient_id=patient_id,
            record_type=RecordType.EVOLUCAO
        ).order_by(cls.record_date.desc()).first()
        
    def to_dict(self, include_detailed=False) -> dict:
        """Converte o registro para dicionário"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'physiotherapist_id': self.physiotherapist_id,
            'appointment_id': self.appointment_id,
            'record_type': self.record_type.value,
            'record_type_display': self.record_type_display,
            'record_date': self.record_date.isoformat(),
            'is_finalized': self.is_finalized,
            'is_locked': self.is_locked,
            'can_edit': self.can_edit(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'finalized_at': self.finalized_at.isoformat() if self.finalized_at else None
        }
        
        # Campos básicos sempre incluídos
        basic_fields = [
            'chief_complaint', 'current_illness_history', 'primary_diagnosis',
            'evolution_notes', 'treatment_plan', 'pain_intensity', 'pain_location'
        ]
        
        for field in basic_fields:
            data[field] = getattr(self, field)
            
        if include_detailed:
            # Incluir todos os campos detalhados
            detailed_fields = [
                'past_medical_history', 'family_history', 'social_history',
                'medications', 'allergies', 'general_appearance', 'weight',
                'height', 'bmi', 'pain_scale_type', 'pain_characteristics',
                'pain_triggers', 'pain_relief_factors', 'posture_analysis',
                'gait_analysis', 'muscle_tone', 'reflexes', 'sensitivity',
                'coordination', 'balance', 'functional_status',
                'activities_daily_living', 'work_activities', 'sports_activities',
                'secondary_diagnoses', 'short_term_goals', 'long_term_goals',
                'treatment_frequency', 'estimated_duration', 'patient_response',
                'adherence_notes', 'reassessment_findings', 'goals_achievement',
                'plan_modifications', 'discharge_reason', 'discharge_condition',
                'final_assessment', 'home_program', 'follow_up_recommendations',
                'crefito_number'
            ]
            
            for field in detailed_fields:
                data[field] = getattr(self, field)
                
            # Campos JSON
            data.update({
                'vital_signs': self.get_vital_signs(),
                'range_of_motion': self.get_range_of_motion(),
                'muscle_strength': self.get_muscle_strength(),
                'special_tests': self.get_special_tests(),
                'imaging_exams': self.get_imaging_exams(),
                'problems_list': self.get_problems_list(),
                'techniques_used': self.get_techniques_used(),
                'pain_scale_display': self.pain_scale_display,
                'functional_status_display': self.functional_status_display
            })
            
        return data
        
    def __repr__(self):
        return f'<MedicalRecord {self.record_type.value} - Patient {self.patient_id} - {self.record_date.strftime("%d/%m/%Y")}>'


class MedicalRecordAttachment(db.Model):
    """Model para anexos do prontuário"""
    
    __tablename__ = 'medical_record_attachments'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    medical_record_id = Column(Integer, ForeignKey('medical_records.id'), nullable=False, index=True)
    
    # Informações do arquivo
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # tamanho em bytes
    mime_type = Column(String(100), nullable=False)
    
    # Descrição e categoria
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)  # "exame", "foto", "documento", etc.
    
    # Campos de auditoria
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    medical_record = relationship('MedicalRecord', back_populates='attachments')
    uploader = relationship('User', foreign_keys=[uploaded_by])
    
    def to_dict(self) -> dict:
        """Converte o anexo para dicionário"""
        return {
            'id': self.id,
            'medical_record_id': self.medical_record_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'description': self.description,
            'category': self.category,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat()
        }
        
    def __repr__(self):
        return f'<MedicalRecordAttachment {self.filename}>'