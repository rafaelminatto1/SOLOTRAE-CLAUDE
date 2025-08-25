# -*- coding: utf-8 -*-
"""
Model de Exercício
Sistema FisioFlow - Gestão de Clínica de Fisioterapia
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz

class ExerciseCategory(enum.Enum):
    """Enum para categorias de exercícios"""
    CERVICAL = "CERVICAL"
    MEMBROS_SUPERIORES = "MEMBROS_SUPERIORES"
    TRONCO = "TRONCO"
    MEMBROS_INFERIORES = "MEMBROS_INFERIORES"
    MOBILIZACAO_NEURAL = "MOBILIZACAO_NEURAL"
    MOBILIDADE_GERAL = "MOBILIDADE_GERAL"

class DifficultyLevel(enum.Enum):
    """Enum para nível de dificuldade"""
    INICIANTE = "INICIANTE"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    ESPECIALISTA = "ESPECIALISTA"

class ExerciseType(enum.Enum):
    """Enum para tipo de exercício"""
    ALONGAMENTO = "ALONGAMENTO"
    FORTALECIMENTO = "FORTALECIMENTO"
    MOBILIDADE = "MOBILIDADE"
    COORDENACAO = "COORDENACAO"
    EQUILIBRIO = "EQUILIBRIO"
    RESPIRATORIO = "RESPIRATORIO"
    PROPRIOCEPCAO = "PROPRIOCEPCAO"
    RELAXAMENTO = "RELAXAMENTO"

class Exercise(db.Model):
    """Model para exercícios"""
    
    __tablename__ = 'exercises'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(Enum(ExerciseCategory), nullable=False, index=True)
    exercise_type = Column(Enum(ExerciseType), nullable=False)
    difficulty_level = Column(Enum(DifficultyLevel), nullable=False)
    
    # Descrição e instruções
    description = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    precautions = Column(Text, nullable=True)
    contraindications = Column(Text, nullable=True)
    
    # Parâmetros do exercício
    default_sets = Column(Integer, default=3, nullable=False)
    default_repetitions = Column(Integer, default=10, nullable=False)
    default_hold_time = Column(Integer, nullable=True)  # tempo de sustentação em segundos
    default_rest_time = Column(Integer, default=30, nullable=False)  # tempo de descanso em segundos
    estimated_duration = Column(Integer, nullable=False)  # duração estimada em minutos
    
    # Mídia
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    image_urls = Column(Text, nullable=True)  # JSON array de URLs de imagens
    
    # Equipamentos necessários
    equipment_needed = Column(Text, nullable=True)  # JSON array de equipamentos
    
    # Músculos trabalhados
    primary_muscles = Column(Text, nullable=True)  # JSON array de músculos principais
    secondary_muscles = Column(Text, nullable=True)  # JSON array de músculos secundários
    
    # Indicações clínicas
    clinical_indications = Column(Text, nullable=True)  # JSON array de indicações
    pathologies = Column(Text, nullable=True)  # JSON array de patologias
    
    # Progressão
    progression_exercises = Column(Text, nullable=True)  # JSON array de IDs de exercícios de progressão
    regression_exercises = Column(Text, nullable=True)  # JSON array de IDs de exercícios de regressão
    
    # Variações
    variations = Column(Text, nullable=True)  # JSON array de variações do exercício
    
    # Métricas e avaliação
    effectiveness_rating = Column(Float, default=0.0, nullable=False)  # avaliação de efetividade (0-5)
    usage_count = Column(Integer, default=0, nullable=False)  # quantas vezes foi prescrito
    
    # Status e controle
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)  # exercício em destaque
    requires_supervision = Column(Boolean, default=False, nullable=False)
    
    # Tags para busca
    tags = Column(Text, nullable=True)  # JSON array de tags
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    prescriptions = relationship('PrescriptionExercise', back_populates='exercise')
    
    def __init__(self, **kwargs):
        super(Exercise, self).__init__(**kwargs)
        
    @property
    def category_display(self) -> str:
        """Retorna o nome da categoria formatado"""
        category_names = {
            ExerciseCategory.CERVICAL: "Cervical",
            ExerciseCategory.MEMBROS_SUPERIORES: "Membros Superiores",
            ExerciseCategory.TRONCO: "Tronco",
            ExerciseCategory.MEMBROS_INFERIORES: "Membros Inferiores",
            ExerciseCategory.MOBILIZACAO_NEURAL: "Mobilização Neural",
            ExerciseCategory.MOBILIDADE_GERAL: "Mobilidade Geral"
        }
        return category_names.get(self.category, self.category.value)
        
    @property
    def difficulty_display(self) -> str:
        """Retorna o nível de dificuldade formatado"""
        difficulty_names = {
            DifficultyLevel.INICIANTE: "Iniciante",
            DifficultyLevel.INTERMEDIARIO: "Intermediário",
            DifficultyLevel.AVANCADO: "Avançado",
            DifficultyLevel.ESPECIALISTA: "Especialista"
        }
        return difficulty_names.get(self.difficulty_level, self.difficulty_level.value)
        
    @property
    def type_display(self) -> str:
        """Retorna o tipo de exercício formatado"""
        type_names = {
            ExerciseType.ALONGAMENTO: "Alongamento",
            ExerciseType.FORTALECIMENTO: "Fortalecimento",
            ExerciseType.MOBILIDADE: "Mobilidade",
            ExerciseType.COORDENACAO: "Coordenação",
            ExerciseType.EQUILIBRIO: "Equilíbrio",
            ExerciseType.RESPIRATORIO: "Respiratório",
            ExerciseType.PROPRIOCEPCAO: "Propriocepção",
            ExerciseType.RELAXAMENTO: "Relaxamento"
        }
        return type_names.get(self.exercise_type, self.exercise_type.value)
        
    def get_equipment_list(self) -> list:
        """Retorna lista de equipamentos necessários"""
        import json
        try:
            return json.loads(self.equipment_needed) if self.equipment_needed else []
        except:
            return []
            
    def get_primary_muscles_list(self) -> list:
        """Retorna lista de músculos principais"""
        import json
        try:
            return json.loads(self.primary_muscles) if self.primary_muscles else []
        except:
            return []
            
    def get_secondary_muscles_list(self) -> list:
        """Retorna lista de músculos secundários"""
        import json
        try:
            return json.loads(self.secondary_muscles) if self.secondary_muscles else []
        except:
            return []
            
    def get_clinical_indications_list(self) -> list:
        """Retorna lista de indicações clínicas"""
        import json
        try:
            return json.loads(self.clinical_indications) if self.clinical_indications else []
        except:
            return []
            
    def get_pathologies_list(self) -> list:
        """Retorna lista de patologias"""
        import json
        try:
            return json.loads(self.pathologies) if self.pathologies else []
        except:
            return []
            
    def get_tags_list(self) -> list:
        """Retorna lista de tags"""
        import json
        try:
            return json.loads(self.tags) if self.tags else []
        except:
            return []
            
    def get_image_urls_list(self) -> list:
        """Retorna lista de URLs de imagens"""
        import json
        try:
            return json.loads(self.image_urls) if self.image_urls else []
        except:
            return []
            
    def get_variations_list(self) -> list:
        """Retorna lista de variações"""
        import json
        try:
            return json.loads(self.variations) if self.variations else []
        except:
            return []
            
    def get_progression_exercises(self) -> list:
        """Retorna exercícios de progressão"""
        import json
        try:
            exercise_ids = json.loads(self.progression_exercises) if self.progression_exercises else []
            return Exercise.query.filter(Exercise.id.in_(exercise_ids)).all()
        except:
            return []
            
    def get_regression_exercises(self) -> list:
        """Retorna exercícios de regressão"""
        import json
        try:
            exercise_ids = json.loads(self.regression_exercises) if self.regression_exercises else []
            return Exercise.query.filter(Exercise.id.in_(exercise_ids)).all()
        except:
            return []
            
    def increment_usage(self):
        """Incrementa o contador de uso"""
        self.usage_count += 1
        
    def update_effectiveness_rating(self, new_rating: float):
        """Atualiza a avaliação de efetividade"""
        if 0 <= new_rating <= 5:
            self.effectiveness_rating = new_rating
            
    def is_suitable_for_pathology(self, pathology: str) -> bool:
        """Verifica se o exercício é adequado para uma patologia"""
        pathologies = self.get_pathologies_list()
        return pathology.lower() in [p.lower() for p in pathologies]
        
    def has_contraindication(self, condition: str) -> bool:
        """Verifica se há contraindicação para uma condição"""
        if not self.contraindications:
            return False
        return condition.lower() in self.contraindications.lower()
        
    def search_by_keywords(self, keywords: list) -> bool:
        """Verifica se o exercício corresponde às palavras-chave"""
        searchable_text = f"{self.name} {self.description} {self.instructions}".lower()
        tags = self.get_tags_list()
        searchable_text += " " + " ".join(tags).lower()
        
        return any(keyword.lower() in searchable_text for keyword in keywords)
        
    @classmethod
    def get_by_category(cls, category: ExerciseCategory, active_only=True):
        """Retorna exercícios por categoria"""
        query = cls.query.filter_by(category=category)
        if active_only:
            query = query.filter_by(is_active=True)
        return query.all()
        
    @classmethod
    def get_featured(cls):
        """Retorna exercícios em destaque"""
        return cls.query.filter_by(is_featured=True, is_active=True).all()
        
    @classmethod
    def search(cls, query: str, category: ExerciseCategory = None, difficulty: DifficultyLevel = None, exercise_type: ExerciseType = None):
        """Busca exercícios por critérios"""
        filters = [cls.is_active == True]
        
        if query:
            keywords = query.split()
            # Busca por nome, descrição ou tags
            search_filter = db.or_(
                cls.name.ilike(f"%{query}%"),
                cls.description.ilike(f"%{query}%"),
                cls.tags.ilike(f"%{query}%")
            )
            filters.append(search_filter)
            
        if category:
            filters.append(cls.category == category)
            
        if difficulty:
            filters.append(cls.difficulty_level == difficulty)
            
        if exercise_type:
            filters.append(cls.exercise_type == exercise_type)
            
        return cls.query.filter(db.and_(*filters)).order_by(cls.effectiveness_rating.desc()).all()
        
    def to_dict(self, include_detailed=False) -> dict:
        """Converte o exercício para dicionário"""
        data = {
            'id': self.id,
            'name': self.name,
            'category': self.category.value,
            'category_display': self.category_display,
            'exercise_type': self.exercise_type.value,
            'type_display': self.type_display,
            'difficulty_level': self.difficulty_level.value,
            'difficulty_display': self.difficulty_display,
            'description': self.description,
            'instructions': self.instructions,
            'default_sets': self.default_sets,
            'default_repetitions': self.default_repetitions,
            'default_hold_time': self.default_hold_time,
            'default_rest_time': self.default_rest_time,
            'estimated_duration': self.estimated_duration,
            'video_url': self.video_url,
            'thumbnail_url': self.thumbnail_url,
            'equipment_needed': self.get_equipment_list(),
            'primary_muscles': self.get_primary_muscles_list(),
            'secondary_muscles': self.get_secondary_muscles_list(),
            'effectiveness_rating': self.effectiveness_rating,
            'usage_count': self.usage_count,
            'is_featured': self.is_featured,
            'requires_supervision': self.requires_supervision,
            'tags': self.get_tags_list()
        }
        
        if include_detailed:
            data.update({
                'precautions': self.precautions,
                'contraindications': self.contraindications,
                'clinical_indications': self.get_clinical_indications_list(),
                'pathologies': self.get_pathologies_list(),
                'image_urls': self.get_image_urls_list(),
                'variations': self.get_variations_list(),
                'progression_exercises': [ex.to_dict() for ex in self.get_progression_exercises()],
                'regression_exercises': [ex.to_dict() for ex in self.get_regression_exercises()],
                'created_at': self.created_at.isoformat(),
                'updated_at': self.updated_at.isoformat()
            })
            
        return data
        
    def __repr__(self):
        return f'<Exercise {self.name} ({self.category.value})>'