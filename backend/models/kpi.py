# -*- coding: utf-8 -*-
"""
Model de KPI
Sistema FisioFlow - KPIs e Métricas de Performance
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, JSON, ForeignKey, Float, Numeric
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
from typing import Dict, Any, Optional, List
import uuid
from decimal import Decimal

class KPIType(enum.Enum):
    """Enum para tipos de KPI"""
    # Financeiros
    REVENUE = "REVENUE"  # Receita
    PROFIT = "PROFIT"  # Lucro
    COST = "COST"  # Custo
    MARGIN = "MARGIN"  # Margem
    CASH_FLOW = "CASH_FLOW"  # Fluxo de caixa
    
    # Operacionais
    APPOINTMENTS = "APPOINTMENTS"  # Consultas
    OCCUPANCY_RATE = "OCCUPANCY_RATE"  # Taxa de ocupação
    NO_SHOW_RATE = "NO_SHOW_RATE"  # Taxa de no-show
    CANCELLATION_RATE = "CANCELLATION_RATE"  # Taxa de cancelamento
    UTILIZATION_RATE = "UTILIZATION_RATE"  # Taxa de utilização
    
    # Pacientes
    ACTIVE_PATIENTS = "ACTIVE_PATIENTS"  # Pacientes ativos
    NEW_PATIENTS = "NEW_PATIENTS"  # Novos pacientes
    RETURNING_PATIENTS = "RETURNING_PATIENTS"  # Pacientes retornando
    PATIENT_SATISFACTION = "PATIENT_SATISFACTION"  # Satisfação do paciente
    PATIENT_RETENTION = "PATIENT_RETENTION"  # Retenção de pacientes
    
    # Clínicos
    TREATMENT_EFFECTIVENESS = "TREATMENT_EFFECTIVENESS"  # Efetividade do tratamento
    RECOVERY_TIME = "RECOVERY_TIME"  # Tempo de recuperação
    PROTOCOL_ADHERENCE = "PROTOCOL_ADHERENCE"  # Aderência ao protocolo
    EXERCISE_COMPLETION = "EXERCISE_COMPLETION"  # Conclusão de exercícios
    
    # Equipe
    STAFF_PRODUCTIVITY = "STAFF_PRODUCTIVITY"  # Produtividade da equipe
    STAFF_UTILIZATION = "STAFF_UTILIZATION"  # Utilização da equipe
    STAFF_SATISFACTION = "STAFF_SATISFACTION"  # Satisfação da equipe
    
    # Parcerias
    PARTNER_REVENUE = "PARTNER_REVENUE"  # Receita de parceiros
    PARTNER_SATISFACTION = "PARTNER_SATISFACTION"  # Satisfação de parceiros
    VOUCHER_USAGE = "VOUCHER_USAGE"  # Uso de vouchers
    
    # Sistema
    SYSTEM_UPTIME = "SYSTEM_UPTIME"  # Tempo de atividade do sistema
    RESPONSE_TIME = "RESPONSE_TIME"  # Tempo de resposta
    ERROR_RATE = "ERROR_RATE"  # Taxa de erro
    
    # Customizados
    CUSTOM = "CUSTOM"  # Personalizado

class KPICategory(enum.Enum):
    """Enum para categorias de KPI"""
    FINANCIAL = "FINANCIAL"  # Financeiro
    OPERATIONAL = "OPERATIONAL"  # Operacional
    CLINICAL = "CLINICAL"  # Clínico
    PATIENT = "PATIENT"  # Paciente
    STAFF = "STAFF"  # Equipe
    PARTNER = "PARTNER"  # Parceiro
    SYSTEM = "SYSTEM"  # Sistema
    QUALITY = "QUALITY"  # Qualidade
    SATISFACTION = "SATISFACTION"  # Satisfação
    CUSTOM = "CUSTOM"  # Personalizado

class KPIFrequency(enum.Enum):
    """Enum para frequência de cálculo"""
    REAL_TIME = "REAL_TIME"  # Tempo real
    HOURLY = "HOURLY"  # Por hora
    DAILY = "DAILY"  # Diário
    WEEKLY = "WEEKLY"  # Semanal
    MONTHLY = "MONTHLY"  # Mensal
    QUARTERLY = "QUARTERLY"  # Trimestral
    YEARLY = "YEARLY"  # Anual
    ON_DEMAND = "ON_DEMAND"  # Sob demanda

class KPITrend(enum.Enum):
    """Enum para tendência do KPI"""
    UP = "UP"  # Subindo
    DOWN = "DOWN"  # Descendo
    STABLE = "STABLE"  # Estável
    VOLATILE = "VOLATILE"  # Volátil
    UNKNOWN = "UNKNOWN"  # Desconhecido

class KPIStatus(enum.Enum):
    """Enum para status do KPI"""
    EXCELLENT = "EXCELLENT"  # Excelente
    GOOD = "GOOD"  # Bom
    WARNING = "WARNING"  # Atenção
    CRITICAL = "CRITICAL"  # Crítico
    UNKNOWN = "UNKNOWN"  # Desconhecido

class KPI(db.Model):
    """Model para KPIs"""
    
    __tablename__ = 'kpis'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False, index=True)  # Nome
    code = Column(String(50), unique=True, nullable=False, index=True)  # Código único
    description = Column(Text, nullable=True)  # Descrição
    type = Column(Enum(KPIType), nullable=False, index=True)  # Tipo
    category = Column(Enum(KPICategory), nullable=False, index=True)  # Categoria
    
    # === CONFIGURAÇÃO ===
    
    # Unidade e formato
    unit = Column(String(20), nullable=True)  # Unidade (%, R$, etc.)
    format_type = Column(String(20), default='number', nullable=False)  # Tipo de formato
    decimal_places = Column(Integer, default=2, nullable=False)  # Casas decimais
    
    # Frequência de cálculo
    frequency = Column(Enum(KPIFrequency), nullable=False, index=True)  # Frequência
    
    # Configuração de cálculo
    calculation_method = Column(String(100), nullable=True)  # Método de cálculo
    calculation_config = Column(JSON, nullable=True)  # Configuração do cálculo
    
    # === METAS E LIMITES ===
    
    # Metas
    target_value = Column(Numeric(15, 4), nullable=True)  # Valor meta
    min_acceptable = Column(Numeric(15, 4), nullable=True)  # Mínimo aceitável
    max_acceptable = Column(Numeric(15, 4), nullable=True)  # Máximo aceitável
    
    # Limites de alerta
    warning_threshold_low = Column(Numeric(15, 4), nullable=True)  # Limite baixo de atenção
    warning_threshold_high = Column(Numeric(15, 4), nullable=True)  # Limite alto de atenção
    critical_threshold_low = Column(Numeric(15, 4), nullable=True)  # Limite baixo crítico
    critical_threshold_high = Column(Numeric(15, 4), nullable=True)  # Limite alto crítico
    
    # === VALOR ATUAL ===
    
    # Valor atual
    current_value = Column(Numeric(15, 4), nullable=True)  # Valor atual
    previous_value = Column(Numeric(15, 4), nullable=True)  # Valor anterior
    
    # Status e tendência
    status = Column(Enum(KPIStatus), default=KPIStatus.UNKNOWN, nullable=False, index=True)
    trend = Column(Enum(KPITrend), default=KPITrend.UNKNOWN, nullable=False)
    
    # Variação
    absolute_change = Column(Numeric(15, 4), nullable=True)  # Mudança absoluta
    percentage_change = Column(Numeric(8, 4), nullable=True)  # Mudança percentual
    
    # === PERÍODO ===
    
    # Período de referência
    period_start = Column(DateTime, nullable=True, index=True)  # Início do período
    period_end = Column(DateTime, nullable=True, index=True)  # Fim do período
    
    # Última atualização
    last_calculated_at = Column(DateTime, nullable=True, index=True)  # Última vez calculado
    next_calculation_at = Column(DateTime, nullable=True, index=True)  # Próximo cálculo
    
    # === CONFIGURAÇÕES ===
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_public = Column(Boolean, default=False, nullable=False)  # Público
    
    # Alertas
    enable_alerts = Column(Boolean, default=True, nullable=False)  # Habilitar alertas
    alert_recipients = Column(JSON, nullable=True)  # Destinatários de alerta
    
    # === DADOS HISTÓRICOS ===
    
    # Estatísticas
    historical_average = Column(Numeric(15, 4), nullable=True)  # Média histórica
    historical_min = Column(Numeric(15, 4), nullable=True)  # Mínimo histórico
    historical_max = Column(Numeric(15, 4), nullable=True)  # Máximo histórico
    
    # === METADADOS ===
    
    # Configurações adicionais
    settings = Column(JSON, nullable=True)  # Configurações extras
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # Tags
    tags = Column(JSON, nullable=True)  # Tags
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    creator = relationship('User', foreign_keys=[created_by])
    historical_values = relationship('KPIHistoricalValue', back_populates='kpi', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(KPI, self).__init__(**kwargs)
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
            # Financeiros
            KPIType.REVENUE: "Receita",
            KPIType.PROFIT: "Lucro",
            KPIType.COST: "Custo",
            KPIType.MARGIN: "Margem",
            KPIType.CASH_FLOW: "Fluxo de Caixa",
            
            # Operacionais
            KPIType.APPOINTMENTS: "Consultas",
            KPIType.OCCUPANCY_RATE: "Taxa de Ocupação",
            KPIType.NO_SHOW_RATE: "Taxa de No-Show",
            KPIType.CANCELLATION_RATE: "Taxa de Cancelamento",
            KPIType.UTILIZATION_RATE: "Taxa de Utilização",
            
            # Pacientes
            KPIType.ACTIVE_PATIENTS: "Pacientes Ativos",
            KPIType.NEW_PATIENTS: "Novos Pacientes",
            KPIType.RETURNING_PATIENTS: "Pacientes Retornando",
            KPIType.PATIENT_SATISFACTION: "Satisfação do Paciente",
            KPIType.PATIENT_RETENTION: "Retenção de Pacientes",
            
            # Clínicos
            KPIType.TREATMENT_EFFECTIVENESS: "Efetividade do Tratamento",
            KPIType.RECOVERY_TIME: "Tempo de Recuperação",
            KPIType.PROTOCOL_ADHERENCE: "Aderência ao Protocolo",
            KPIType.EXERCISE_COMPLETION: "Conclusão de Exercícios",
            
            # Equipe
            KPIType.STAFF_PRODUCTIVITY: "Produtividade da Equipe",
            KPIType.STAFF_UTILIZATION: "Utilização da Equipe",
            KPIType.STAFF_SATISFACTION: "Satisfação da Equipe",
            
            # Parcerias
            KPIType.PARTNER_REVENUE: "Receita de Parceiros",
            KPIType.PARTNER_SATISFACTION: "Satisfação de Parceiros",
            KPIType.VOUCHER_USAGE: "Uso de Vouchers",
            
            # Sistema
            KPIType.SYSTEM_UPTIME: "Tempo de Atividade",
            KPIType.RESPONSE_TIME: "Tempo de Resposta",
            KPIType.ERROR_RATE: "Taxa de Erro",
            
            KPIType.CUSTOM: "Personalizado"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def category_display(self) -> str:
        """Retorna a categoria formatada"""
        category_names = {
            KPICategory.FINANCIAL: "Financeiro",
            KPICategory.OPERATIONAL: "Operacional",
            KPICategory.CLINICAL: "Clínico",
            KPICategory.PATIENT: "Paciente",
            KPICategory.STAFF: "Equipe",
            KPICategory.PARTNER: "Parceiro",
            KPICategory.SYSTEM: "Sistema",
            KPICategory.QUALITY: "Qualidade",
            KPICategory.SATISFACTION: "Satisfação",
            KPICategory.CUSTOM: "Personalizado"
        }
        return category_names.get(self.category, self.category.value)
        
    @property
    def frequency_display(self) -> str:
        """Retorna a frequência formatada"""
        frequency_names = {
            KPIFrequency.REAL_TIME: "Tempo Real",
            KPIFrequency.HOURLY: "Por Hora",
            KPIFrequency.DAILY: "Diário",
            KPIFrequency.WEEKLY: "Semanal",
            KPIFrequency.MONTHLY: "Mensal",
            KPIFrequency.QUARTERLY: "Trimestral",
            KPIFrequency.YEARLY: "Anual",
            KPIFrequency.ON_DEMAND: "Sob Demanda"
        }
        return frequency_names.get(self.frequency, self.frequency.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            KPIStatus.EXCELLENT: "Excelente",
            KPIStatus.GOOD: "Bom",
            KPIStatus.WARNING: "Atenção",
            KPIStatus.CRITICAL: "Crítico",
            KPIStatus.UNKNOWN: "Desconhecido"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def trend_display(self) -> str:
        """Retorna a tendência formatada"""
        trend_names = {
            KPITrend.UP: "Subindo",
            KPITrend.DOWN: "Descendo",
            KPITrend.STABLE: "Estável",
            KPITrend.VOLATILE: "Volátil",
            KPITrend.UNKNOWN: "Desconhecido"
        }
        return trend_names.get(self.trend, self.trend.value)
        
    @property
    def formatted_value(self) -> str:
        """Retorna o valor formatado"""
        if self.current_value is None:
            return "N/A"
            
        value = float(self.current_value)
        
        if self.format_type == 'currency':
            return f"R$ {value:,.{self.decimal_places}f}"
        elif self.format_type == 'percentage':
            return f"{value:.{self.decimal_places}f}%"
        elif self.format_type == 'number':
            return f"{value:,.{self.decimal_places}f}"
        else:
            return str(value)
            
    @property
    def formatted_change(self) -> str:
        """Retorna a mudança formatada"""
        if self.percentage_change is None:
            return "N/A"
            
        change = float(self.percentage_change)
        sign = "+" if change > 0 else ""
        return f"{sign}{change:.2f}%"
        
    @property
    def needs_calculation(self) -> bool:
        """Verifica se precisa calcular"""
        if not self.is_active:
            return False
            
        if self.frequency == KPIFrequency.ON_DEMAND:
            return False
            
        if not self.next_calculation_at:
            return True
            
        now = datetime.now(pytz.UTC)
        return now >= self.next_calculation_at.replace(tzinfo=pytz.UTC)
        
    @property
    def is_on_target(self) -> bool:
        """Verifica se está na meta"""
        if self.current_value is None or self.target_value is None:
            return False
            
        return abs(float(self.current_value) - float(self.target_value)) <= 0.01
        
    @property
    def target_achievement_percentage(self) -> Optional[float]:
        """Retorna a porcentagem de atingimento da meta"""
        if self.current_value is None or self.target_value is None or float(self.target_value) == 0:
            return None
            
        return (float(self.current_value) / float(self.target_value)) * 100
        
    def get_calculation_config(self) -> dict:
        """Retorna a configuração do cálculo"""
        return self.calculation_config or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def get_tags(self) -> List[str]:
        """Retorna as tags"""
        return self.tags or []
        
    def get_alert_recipients(self) -> List[str]:
        """Retorna os destinatários de alerta"""
        return self.alert_recipients or []
        
    def set_calculation_config(self, config: dict):
        """Define a configuração do cálculo"""
        self.calculation_config = config
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
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
            
    def add_alert_recipient(self, recipient: str):
        """Adiciona um destinatário de alerta"""
        recipients = self.get_alert_recipients()
        if recipient not in recipients:
            recipients.append(recipient)
            self.alert_recipients = recipients
            
    def remove_alert_recipient(self, recipient: str):
        """Remove um destinatário de alerta"""
        recipients = self.get_alert_recipients()
        if recipient in recipients:
            recipients.remove(recipient)
            self.alert_recipients = recipients
            
    def update_value(self, new_value: float, calculation_time: datetime = None):
        """Atualiza o valor do KPI"""
        if calculation_time is None:
            calculation_time = datetime.now(pytz.UTC)
            
        # Salvar valor anterior
        self.previous_value = self.current_value
        
        # Atualizar valor atual
        self.current_value = Decimal(str(new_value))
        
        # Calcular mudanças
        if self.previous_value is not None:
            self.absolute_change = self.current_value - self.previous_value
            
            if float(self.previous_value) != 0:
                self.percentage_change = (self.absolute_change / self.previous_value) * 100
            else:
                self.percentage_change = None
        else:
            self.absolute_change = None
            self.percentage_change = None
            
        # Atualizar status
        self._update_status()
        
        # Atualizar tendência
        self._update_trend()
        
        # Atualizar timestamps
        self.last_calculated_at = calculation_time
        self._calculate_next_calculation_time()
        
        # Salvar no histórico
        self._save_historical_value(new_value, calculation_time)
        
    def _update_status(self):
        """Atualiza o status baseado nos limites"""
        if self.current_value is None:
            self.status = KPIStatus.UNKNOWN
            return
            
        value = float(self.current_value)
        
        # Verificar limites críticos
        if self.critical_threshold_low is not None and value <= float(self.critical_threshold_low):
            self.status = KPIStatus.CRITICAL
            return
            
        if self.critical_threshold_high is not None and value >= float(self.critical_threshold_high):
            self.status = KPIStatus.CRITICAL
            return
            
        # Verificar limites de atenção
        if self.warning_threshold_low is not None and value <= float(self.warning_threshold_low):
            self.status = KPIStatus.WARNING
            return
            
        if self.warning_threshold_high is not None and value >= float(self.warning_threshold_high):
            self.status = KPIStatus.WARNING
            return
            
        # Verificar se está na meta
        if self.target_value is not None:
            target = float(self.target_value)
            if abs(value - target) <= target * 0.05:  # 5% de tolerância
                self.status = KPIStatus.EXCELLENT
            elif abs(value - target) <= target * 0.15:  # 15% de tolerância
                self.status = KPIStatus.GOOD
            else:
                self.status = KPIStatus.WARNING
        else:
            self.status = KPIStatus.GOOD
            
    def _update_trend(self):
        """Atualiza a tendência baseada no histórico"""
        if self.percentage_change is None:
            self.trend = KPITrend.UNKNOWN
            return
            
        change = float(self.percentage_change)
        
        if abs(change) < 1:  # Menos de 1% de mudança
            self.trend = KPITrend.STABLE
        elif change > 0:
            self.trend = KPITrend.UP
        else:
            self.trend = KPITrend.DOWN
            
        # TODO: Implementar lógica mais sofisticada para detectar volatilidade
        
    def _calculate_next_calculation_time(self):
        """Calcula o próximo horário de cálculo"""
        if self.frequency == KPIFrequency.ON_DEMAND:
            self.next_calculation_at = None
            return
            
        now = datetime.now(pytz.UTC)
        
        if self.frequency == KPIFrequency.REAL_TIME:
            self.next_calculation_at = now + timedelta(minutes=1)
        elif self.frequency == KPIFrequency.HOURLY:
            self.next_calculation_at = now + timedelta(hours=1)
        elif self.frequency == KPIFrequency.DAILY:
            self.next_calculation_at = now + timedelta(days=1)
        elif self.frequency == KPIFrequency.WEEKLY:
            self.next_calculation_at = now + timedelta(weeks=1)
        elif self.frequency == KPIFrequency.MONTHLY:
            self.next_calculation_at = now + timedelta(days=30)
        elif self.frequency == KPIFrequency.QUARTERLY:
            self.next_calculation_at = now + timedelta(days=90)
        elif self.frequency == KPIFrequency.YEARLY:
            self.next_calculation_at = now + timedelta(days=365)
        else:
            self.next_calculation_at = now + timedelta(hours=1)
            
    def _save_historical_value(self, value: float, calculation_time: datetime):
        """Salva o valor no histórico"""
        from backend.models.kpi import KPIHistoricalValue
        
        historical_value = KPIHistoricalValue(
            kpi_id=self.id,
            value=Decimal(str(value)),
            period_start=self.period_start,
            period_end=self.period_end,
            calculated_at=calculation_time
        )
        
        db.session.add(historical_value)
        
    def calculate_historical_stats(self):
        """Calcula estatísticas históricas"""
        historical_values = [float(hv.value) for hv in self.historical_values if hv.value is not None]
        
        if historical_values:
            self.historical_average = Decimal(str(sum(historical_values) / len(historical_values)))
            self.historical_min = Decimal(str(min(historical_values)))
            self.historical_max = Decimal(str(max(historical_values)))
        else:
            self.historical_average = None
            self.historical_min = None
            self.historical_max = None
            
    @classmethod
    def create_kpi(
        cls,
        name: str,
        code: str,
        kpi_type: KPIType,
        category: KPICategory,
        frequency: KPIFrequency,
        created_by: int,
        description: str = None,
        unit: str = None,
        target_value: float = None,
        **kwargs
    ) -> 'KPI':
        """Cria um novo KPI"""
        
        kpi = cls(
            name=name,
            code=code,
            description=description,
            type=kpi_type,
            category=category,
            frequency=frequency,
            unit=unit,
            target_value=Decimal(str(target_value)) if target_value is not None else None,
            created_by=created_by,
            **kwargs
        )
        
        return kpi
        
    @classmethod
    def get_by_category(cls, category: KPICategory):
        """Busca KPIs por categoria"""
        return cls.query.filter(
            cls.category == category,
            cls.is_active == True
        ).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_by_type(cls, kpi_type: KPIType):
        """Busca KPIs por tipo"""
        return cls.query.filter(
            cls.type == kpi_type,
            cls.is_active == True
        ).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_needing_calculation(cls):
        """Busca KPIs que precisam ser calculados"""
        now = datetime.now(pytz.UTC)
        
        return cls.query.filter(
            cls.is_active == True,
            cls.frequency != KPIFrequency.ON_DEMAND,
            (cls.next_calculation_at.is_(None)) | (cls.next_calculation_at <= now)
        ).all()
        
    @classmethod
    def get_critical_kpis(cls):
        """Busca KPIs em estado crítico"""
        return cls.query.filter(
            cls.status == KPIStatus.CRITICAL,
            cls.is_active == True
        ).order_by(cls.updated_at.desc()).all()
        
    @classmethod
    def get_dashboard_kpis(cls, category: KPICategory = None, limit: int = 10):
        """Busca KPIs para dashboard"""
        query = cls.query.filter(cls.is_active == True)
        
        if category:
            query = query.filter(cls.category == category)
            
        return query.order_by(
            cls.status.desc(),  # Críticos primeiro
            cls.updated_at.desc()
        ).limit(limit).all()
        
    def to_dict(self, include_historical=False) -> dict:
        """Converte o KPI para dicionário"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'category': self.category.value,
            'category_display': self.category_display,
            'frequency': self.frequency.value,
            'frequency_display': self.frequency_display,
            'unit': self.unit,
            'format_type': self.format_type,
            'decimal_places': self.decimal_places,
            'calculation_method': self.calculation_method,
            'target_value': float(self.target_value) if self.target_value else None,
            'min_acceptable': float(self.min_acceptable) if self.min_acceptable else None,
            'max_acceptable': float(self.max_acceptable) if self.max_acceptable else None,
            'warning_threshold_low': float(self.warning_threshold_low) if self.warning_threshold_low else None,
            'warning_threshold_high': float(self.warning_threshold_high) if self.warning_threshold_high else None,
            'critical_threshold_low': float(self.critical_threshold_low) if self.critical_threshold_low else None,
            'critical_threshold_high': float(self.critical_threshold_high) if self.critical_threshold_high else None,
            'current_value': float(self.current_value) if self.current_value else None,
            'previous_value': float(self.previous_value) if self.previous_value else None,
            'formatted_value': self.formatted_value,
            'status': self.status.value,
            'status_display': self.status_display,
            'trend': self.trend.value,
            'trend_display': self.trend_display,
            'absolute_change': float(self.absolute_change) if self.absolute_change else None,
            'percentage_change': float(self.percentage_change) if self.percentage_change else None,
            'formatted_change': self.formatted_change,
            'is_on_target': self.is_on_target,
            'target_achievement_percentage': self.target_achievement_percentage,
            'needs_calculation': self.needs_calculation,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'last_calculated_at': self.last_calculated_at.isoformat() if self.last_calculated_at else None,
            'next_calculation_at': self.next_calculation_at.isoformat() if self.next_calculation_at else None,
            'is_active': self.is_active,
            'is_public': self.is_public,
            'enable_alerts': self.enable_alerts,
            'historical_average': float(self.historical_average) if self.historical_average else None,
            'historical_min': float(self.historical_min) if self.historical_min else None,
            'historical_max': float(self.historical_max) if self.historical_max else None,
            'calculation_config': self.get_calculation_config(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'tags': self.get_tags(),
            'alert_recipients': self.get_alert_recipients(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_historical:
            data['historical_values'] = [hv.to_dict() for hv in self.historical_values]
            
        return data
        
    def __repr__(self):
        return f'<KPI {self.id} - {self.code} - {self.name}>'

class KPIHistoricalValue(db.Model):
    """Model para valores históricos de KPI"""
    
    __tablename__ = 'kpi_historical_values'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # KPI pai
    kpi_id = Column(Integer, ForeignKey('kpis.id'), nullable=False, index=True)
    
    # Valor
    value = Column(Numeric(15, 4), nullable=False)
    
    # Período
    period_start = Column(DateTime, nullable=True, index=True)
    period_end = Column(DateTime, nullable=True, index=True)
    
    # Timestamp
    calculated_at = Column(DateTime, nullable=False, index=True)
    
    # Metadados
    metadata = Column(JSON, nullable=True)
    
    # Relacionamentos
    kpi = relationship('KPI', back_populates='historical_values')
    
    def __init__(self, **kwargs):
        super(KPIHistoricalValue, self).__init__(**kwargs)
        if not self.calculated_at:
            self.calculated_at = datetime.now(pytz.UTC)
            
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def to_dict(self) -> dict:
        """Converte o valor histórico para dicionário"""
        return {
            'id': self.id,
            'kpi_id': self.kpi_id,
            'value': float(self.value),
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'calculated_at': self.calculated_at.isoformat(),
            'metadata': self.get_metadata()
        }
        
    def __repr__(self):
        return f'<KPIHistoricalValue {self.id} - KPI {self.kpi_id} - {self.value}>'