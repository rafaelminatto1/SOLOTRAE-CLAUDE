from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
import pytz
import uuid
import enum
from typing import Dict, List, Any, Optional

Base = declarative_base()

# === ENUMS ===

class ReportType(enum.Enum):
    """Tipos de relatório"""
    FINANCIAL = "financial"  # Financeiro
    PATIENT_EVOLUTION = "patient_evolution"  # Evolução de pacientes
    TEAM_PERFORMANCE = "team_performance"  # Performance da equipe
    PROTOCOL_ANALYSIS = "protocol_analysis"  # Análise de protocolos
    LGPD_COMPLIANCE = "lgpd_compliance"  # Compliance LGPD
    APPOINTMENT_ANALYTICS = "appointment_analytics"  # Análise de agendamentos
    REVENUE_ANALYSIS = "revenue_analysis"  # Análise de receitas
    PATIENT_SATISFACTION = "patient_satisfaction"  # Satisfação do paciente
    TREATMENT_EFFECTIVENESS = "treatment_effectiveness"  # Efetividade de tratamentos
    PARTNERSHIP_PERFORMANCE = "partnership_performance"  # Performance de parcerias
    MENTORSHIP_PROGRESS = "mentorship_progress"  # Progresso de mentoria
    CUSTOM = "custom"  # Personalizado

class ReportStatus(enum.Enum):
    """Status do relatório"""
    PENDING = "pending"  # Pendente
    GENERATING = "generating"  # Gerando
    COMPLETED = "completed"  # Concluído
    FAILED = "failed"  # Falhou
    CANCELLED = "cancelled"  # Cancelado
    SCHEDULED = "scheduled"  # Agendado

class ReportFormat(enum.Enum):
    """Formato do relatório"""
    PDF = "pdf"  # PDF
    EXCEL = "excel"  # Excel
    CSV = "csv"  # CSV
    JSON = "json"  # JSON
    HTML = "html"  # HTML

class ReportFrequency(enum.Enum):
    """Frequência do relatório"""
    ONCE = "once"  # Uma vez
    DAILY = "daily"  # Diário
    WEEKLY = "weekly"  # Semanal
    MONTHLY = "monthly"  # Mensal
    QUARTERLY = "quarterly"  # Trimestral
    YEARLY = "yearly"  # Anual

# === MODELS ===

class Report(Base):
    """Model para relatórios"""
    __tablename__ = 'reports'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Informações básicas
    title = Column(String(200), nullable=False, index=True)  # Título
    description = Column(Text, nullable=True)  # Descrição
    
    # === CONFIGURAÇÃO ===
    
    # Tipo e formato
    type = Column(SQLEnum(ReportType), nullable=False, index=True)  # Tipo
    format = Column(SQLEnum(ReportFormat), nullable=False, default=ReportFormat.PDF)  # Formato
    
    # Status
    status = Column(SQLEnum(ReportStatus), nullable=False, default=ReportStatus.PENDING, index=True)  # Status
    
    # === RELACIONAMENTOS ===
    
    # Usuário que solicitou
    requested_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # === PARÂMETROS ===
    
    # Período
    start_date = Column(DateTime, nullable=True, index=True)  # Data início
    end_date = Column(DateTime, nullable=True, index=True)  # Data fim
    
    # Filtros
    filters = Column(JSON, nullable=True)  # Filtros aplicados
    
    # Parâmetros específicos
    parameters = Column(JSON, nullable=True)  # Parâmetros específicos
    
    # === AGENDAMENTO ===
    
    # Frequência
    frequency = Column(SQLEnum(ReportFrequency), nullable=False, default=ReportFrequency.ONCE)  # Frequência
    
    # Próxima execução
    next_execution = Column(DateTime, nullable=True, index=True)  # Próxima execução
    
    # Última execução
    last_execution = Column(DateTime, nullable=True)  # Última execução
    
    # Ativo
    is_active = Column(Boolean, default=True, nullable=False)  # Ativo
    
    # === EXECUÇÃO ===
    
    # Datas de execução
    started_at = Column(DateTime, nullable=True)  # Início da geração
    completed_at = Column(DateTime, nullable=True)  # Conclusão
    failed_at = Column(DateTime, nullable=True)  # Falha
    
    # Tempo de execução
    execution_time = Column(Float, nullable=True)  # Tempo em segundos
    
    # Erro
    error_message = Column(Text, nullable=True)  # Mensagem de erro
    
    # === RESULTADO ===
    
    # Dados do relatório
    data = Column(JSON, nullable=True)  # Dados gerados
    
    # Arquivo
    file_path = Column(String(500), nullable=True)  # Caminho do arquivo
    file_url = Column(String(500), nullable=True)  # URL do arquivo
    file_size = Column(Integer, nullable=True)  # Tamanho em bytes
    
    # Estatísticas
    total_records = Column(Integer, nullable=True)  # Total de registros
    
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
    requester = relationship('User', foreign_keys=[requested_by], back_populates='requested_reports')
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(Report, self).__init__(**kwargs)
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
            ReportStatus.PENDING: "Pendente",
            ReportStatus.GENERATING: "Gerando",
            ReportStatus.COMPLETED: "Concluído",
            ReportStatus.FAILED: "Falhou",
            ReportStatus.CANCELLED: "Cancelado",
            ReportStatus.SCHEDULED: "Agendado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def type_display(self) -> str:
        """Retorna o tipo formatado"""
        type_names = {
            ReportType.FINANCIAL: "Financeiro",
            ReportType.PATIENT_EVOLUTION: "Evolução de Pacientes",
            ReportType.TEAM_PERFORMANCE: "Performance da Equipe",
            ReportType.PROTOCOL_ANALYSIS: "Análise de Protocolos",
            ReportType.LGPD_COMPLIANCE: "Compliance LGPD",
            ReportType.APPOINTMENT_ANALYTICS: "Análise de Agendamentos",
            ReportType.REVENUE_ANALYSIS: "Análise de Receitas",
            ReportType.PATIENT_SATISFACTION: "Satisfação do Paciente",
            ReportType.TREATMENT_EFFECTIVENESS: "Efetividade de Tratamentos",
            ReportType.PARTNERSHIP_PERFORMANCE: "Performance de Parcerias",
            ReportType.MENTORSHIP_PROGRESS: "Progresso de Mentoria",
            ReportType.CUSTOM: "Personalizado"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def format_display(self) -> str:
        """Retorna o formato formatado"""
        format_names = {
            ReportFormat.PDF: "PDF",
            ReportFormat.EXCEL: "Excel",
            ReportFormat.CSV: "CSV",
            ReportFormat.JSON: "JSON",
            ReportFormat.HTML: "HTML"
        }
        return format_names.get(self.format, self.format.value)
        
    @property
    def frequency_display(self) -> str:
        """Retorna a frequência formatada"""
        frequency_names = {
            ReportFrequency.ONCE: "Uma vez",
            ReportFrequency.DAILY: "Diário",
            ReportFrequency.WEEKLY: "Semanal",
            ReportFrequency.MONTHLY: "Mensal",
            ReportFrequency.QUARTERLY: "Trimestral",
            ReportFrequency.YEARLY: "Anual"
        }
        return frequency_names.get(self.frequency, self.frequency.value)
        
    @property
    def is_completed(self) -> bool:
        """Verifica se o relatório foi concluído"""
        return self.status == ReportStatus.COMPLETED
        
    @property
    def is_failed(self) -> bool:
        """Verifica se o relatório falhou"""
        return self.status == ReportStatus.FAILED
        
    @property
    def is_scheduled(self) -> bool:
        """Verifica se o relatório está agendado"""
        return self.frequency != ReportFrequency.ONCE and self.is_active
        
    @property
    def is_due(self) -> bool:
        """Verifica se o relatório está pronto para execução"""
        if not self.next_execution:
            return False
        return datetime.now(pytz.UTC) >= self.next_execution
        
    def get_filters(self) -> dict:
        """Retorna os filtros"""
        return self.filters or {}
        
    def get_parameters(self) -> dict:
        """Retorna os parâmetros"""
        return self.parameters or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def get_data(self) -> dict:
        """Retorna os dados"""
        return self.data or {}
        
    def set_filters(self, filters: dict):
        """Define os filtros"""
        self.filters = filters
        
    def set_parameters(self, parameters: dict):
        """Define os parâmetros"""
        self.parameters = parameters
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def set_data(self, data: dict):
        """Define os dados"""
        self.data = data
        
    def start_generation(self):
        """Inicia a geração do relatório"""
        self.status = ReportStatus.GENERATING
        self.started_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def complete_generation(self, data: dict = None, file_path: str = None, file_url: str = None, file_size: int = None, total_records: int = None):
        """Completa a geração do relatório"""
        self.status = ReportStatus.COMPLETED
        self.completed_at = datetime.now(pytz.UTC)
        
        if data:
            self.data = data
        if file_path:
            self.file_path = file_path
        if file_url:
            self.file_url = file_url
        if file_size:
            self.file_size = file_size
        if total_records:
            self.total_records = total_records
            
        # Calcular tempo de execução
        if self.started_at:
            self.execution_time = (self.completed_at - self.started_at).total_seconds()
            
        # Agendar próxima execução se necessário
        if self.frequency != ReportFrequency.ONCE:
            self.schedule_next_execution()
            
        self.last_execution = self.completed_at
        self.updated_at = datetime.now(pytz.UTC)
        
    def fail_generation(self, error_message: str):
        """Falha na geração do relatório"""
        self.status = ReportStatus.FAILED
        self.failed_at = datetime.now(pytz.UTC)
        self.error_message = error_message
        
        # Calcular tempo de execução
        if self.started_at:
            self.execution_time = (self.failed_at - self.started_at).total_seconds()
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel_generation(self):
        """Cancela a geração do relatório"""
        self.status = ReportStatus.CANCELLED
        self.updated_at = datetime.now(pytz.UTC)
        
    def schedule_next_execution(self):
        """Agenda a próxima execução"""
        if self.frequency == ReportFrequency.ONCE:
            return
            
        base_date = self.last_execution or datetime.now(pytz.UTC)
        
        if self.frequency == ReportFrequency.DAILY:
            self.next_execution = base_date + timedelta(days=1)
        elif self.frequency == ReportFrequency.WEEKLY:
            self.next_execution = base_date + timedelta(weeks=1)
        elif self.frequency == ReportFrequency.MONTHLY:
            # Próximo mês
            if base_date.month == 12:
                self.next_execution = base_date.replace(year=base_date.year + 1, month=1)
            else:
                self.next_execution = base_date.replace(month=base_date.month + 1)
        elif self.frequency == ReportFrequency.QUARTERLY:
            # Próximo trimestre
            next_month = base_date.month + 3
            if next_month > 12:
                self.next_execution = base_date.replace(year=base_date.year + 1, month=next_month - 12)
            else:
                self.next_execution = base_date.replace(month=next_month)
        elif self.frequency == ReportFrequency.YEARLY:
            self.next_execution = base_date.replace(year=base_date.year + 1)
            
    def activate(self):
        """Ativa o relatório"""
        self.is_active = True
        if self.frequency != ReportFrequency.ONCE and not self.next_execution:
            self.schedule_next_execution()
        self.updated_at = datetime.now(pytz.UTC)
        
    def deactivate(self):
        """Desativa o relatório"""
        self.is_active = False
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def create_report(
        cls,
        title: str,
        type: ReportType,
        requested_by: int,
        created_by: int,
        description: str = None,
        format: ReportFormat = ReportFormat.PDF,
        frequency: ReportFrequency = ReportFrequency.ONCE,
        start_date: datetime = None,
        end_date: datetime = None,
        filters: dict = None,
        parameters: dict = None,
        settings: dict = None
    ):
        """Cria um novo relatório"""
        report = cls(
            title=title,
            description=description,
            type=type,
            format=format,
            frequency=frequency,
            requested_by=requested_by,
            created_by=created_by,
            start_date=start_date,
            end_date=end_date
        )
        
        if filters:
            report.set_filters(filters)
        if parameters:
            report.set_parameters(parameters)
        if settings:
            report.set_settings(settings)
            
        # Agendar primeira execução se necessário
        if frequency != ReportFrequency.ONCE:
            report.schedule_next_execution()
            
        return report
        
    @classmethod
    def get_by_user(cls, session, user_id: int):
        """Busca relatórios por usuário"""
        return session.query(cls).filter(cls.requested_by == user_id).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_by_type(cls, session, report_type: ReportType):
        """Busca relatórios por tipo"""
        return session.query(cls).filter(cls.type == report_type).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_pending(cls, session):
        """Busca relatórios pendentes"""
        return session.query(cls).filter(cls.status == ReportStatus.PENDING).order_by(cls.created_at.asc()).all()
        
    @classmethod
    def get_scheduled(cls, session):
        """Busca relatórios agendados"""
        return session.query(cls).filter(
            cls.frequency != ReportFrequency.ONCE,
            cls.is_active == True
        ).order_by(cls.next_execution.asc()).all()
        
    @classmethod
    def get_due_reports(cls, session):
        """Busca relatórios prontos para execução"""
        now = datetime.now(pytz.UTC)
        return session.query(cls).filter(
            cls.frequency != ReportFrequency.ONCE,
            cls.is_active == True,
            cls.next_execution <= now,
            cls.status != ReportStatus.GENERATING
        ).order_by(cls.next_execution.asc()).all()
        
    @classmethod
    def get_failed_reports(cls, session, hours: int = 24):
        """Busca relatórios que falharam nas últimas horas"""
        since = datetime.now(pytz.UTC) - timedelta(hours=hours)
        return session.query(cls).filter(
            cls.status == ReportStatus.FAILED,
            cls.failed_at >= since
        ).order_by(cls.failed_at.desc()).all()
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'title': self.title,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'format': self.format.value,
            'format_display': self.format_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'frequency': self.frequency.value,
            'frequency_display': self.frequency_display,
            'requested_by': self.requested_by,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'filters': self.get_filters(),
            'parameters': self.get_parameters(),
            'next_execution': self.next_execution.isoformat() if self.next_execution else None,
            'last_execution': self.last_execution.isoformat() if self.last_execution else None,
            'is_active': self.is_active,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'failed_at': self.failed_at.isoformat() if self.failed_at else None,
            'execution_time': self.execution_time,
            'error_message': self.error_message,
            'file_path': self.file_path,
            'file_url': self.file_url,
            'file_size': self.file_size,
            'total_records': self.total_records,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ReportTemplate(Base):
    """Model para templates de relatório"""
    __tablename__ = 'report_templates'
    
    # === IDENTIFICAÇÃO ===
    
    # ID primário
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # UUID único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False, index=True)  # Nome
    code = Column(String(50), unique=True, nullable=False, index=True)  # Código único
    description = Column(Text, nullable=True)  # Descrição
    
    # === CONFIGURAÇÃO ===
    
    # Tipo
    type = Column(SQLEnum(ReportType), nullable=False, index=True)  # Tipo
    
    # Template
    template_content = Column(JSON, nullable=False)  # Conteúdo do template
    
    # Configurações padrão
    default_format = Column(SQLEnum(ReportFormat), nullable=False, default=ReportFormat.PDF)  # Formato padrão
    default_parameters = Column(JSON, nullable=True)  # Parâmetros padrão
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)  # Ativo
    is_system = Column(Boolean, default=False, nullable=False)  # Template do sistema
    
    # === VARIÁVEIS ===
    
    # Variáveis disponíveis
    variables = Column(JSON, nullable=True)  # Variáveis do template
    
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
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(ReportTemplate, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    def get_variables(self) -> list:
        """Retorna as variáveis"""
        return self.variables or []
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def get_template_content(self) -> dict:
        """Retorna o conteúdo do template"""
        return self.template_content or {}
        
    def get_default_parameters(self) -> dict:
        """Retorna os parâmetros padrão"""
        return self.default_parameters or {}
        
    def set_variables(self, variables: list):
        """Define as variáveis"""
        self.variables = variables
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def set_template_content(self, content: dict):
        """Define o conteúdo do template"""
        self.template_content = content
        
    def set_default_parameters(self, parameters: dict):
        """Define os parâmetros padrão"""
        self.default_parameters = parameters
        
    def activate(self):
        """Ativa o template"""
        self.is_active = True
        self.updated_at = datetime.now(pytz.UTC)
        
    def deactivate(self):
        """Desativa o template"""
        self.is_active = False
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def get_by_code(cls, session, code: str):
        """Busca template por código"""
        return session.query(cls).filter(cls.code == code, cls.is_active == True).first()
        
    @classmethod
    def get_by_type(cls, session, report_type: ReportType):
        """Busca templates por tipo"""
        return session.query(cls).filter(cls.type == report_type, cls.is_active == True).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_system_templates(cls, session):
        """Busca templates do sistema"""
        return session.query(cls).filter(cls.is_system == True, cls.is_active == True).order_by(cls.name.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'type': self.type.value,
            'template_content': self.get_template_content(),
            'default_format': self.default_format.value,
            'default_parameters': self.get_default_parameters(),
            'is_active': self.is_active,
            'is_system': self.is_system,
            'variables': self.get_variables(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }