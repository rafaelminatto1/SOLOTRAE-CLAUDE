# -*- coding: utf-8 -*-
"""
Model de Dashboard
Sistema FisioFlow - Dashboard e KPIs
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
from typing import Dict, Any, Optional, List
import uuid

class DashboardType(enum.Enum):
    """Enum para tipos de dashboard"""
    # Dashboards principais
    EXECUTIVE = "EXECUTIVE"  # Executivo
    ADMINISTRATIVE = "ADMINISTRATIVE"  # Administrativo
    CLINICAL = "CLINICAL"  # Clínico
    FINANCIAL = "FINANCIAL"  # Financeiro
    OPERATIONAL = "OPERATIONAL"  # Operacional
    
    # Dashboards específicos
    PATIENT_PORTAL = "PATIENT_PORTAL"  # Portal do paciente
    PARTNER_PORTAL = "PARTNER_PORTAL"  # Portal do parceiro
    MENTORSHIP = "MENTORSHIP"  # Mentoria
    ANALYTICS = "ANALYTICS"  # Analytics
    
    # Dashboards personalizados
    CUSTOM = "CUSTOM"  # Personalizado
    TEAM = "TEAM"  # Equipe
    DEPARTMENT = "DEPARTMENT"  # Departamento

class WidgetType(enum.Enum):
    """Enum para tipos de widget"""
    # Métricas simples
    METRIC = "METRIC"  # Métrica simples
    COUNTER = "COUNTER"  # Contador
    PERCENTAGE = "PERCENTAGE"  # Porcentagem
    CURRENCY = "CURRENCY"  # Moeda
    
    # Gráficos
    LINE_CHART = "LINE_CHART"  # Gráfico de linha
    BAR_CHART = "BAR_CHART"  # Gráfico de barras
    PIE_CHART = "PIE_CHART"  # Gráfico de pizza
    AREA_CHART = "AREA_CHART"  # Gráfico de área
    DONUT_CHART = "DONUT_CHART"  # Gráfico de rosca
    SCATTER_CHART = "SCATTER_CHART"  # Gráfico de dispersão
    
    # Tabelas e listas
    TABLE = "TABLE"  # Tabela
    LIST = "LIST"  # Lista
    RANKING = "RANKING"  # Ranking
    
    # Indicadores
    GAUGE = "GAUGE"  # Medidor
    PROGRESS_BAR = "PROGRESS_BAR"  # Barra de progresso
    STATUS_INDICATOR = "STATUS_INDICATOR"  # Indicador de status
    TREND_INDICATOR = "TREND_INDICATOR"  # Indicador de tendência
    
    # Calendários e tempo
    CALENDAR = "CALENDAR"  # Calendário
    TIMELINE = "TIMELINE"  # Linha do tempo
    SCHEDULE = "SCHEDULE"  # Agenda
    
    # Mapas e localização
    MAP = "MAP"  # Mapa
    HEATMAP = "HEATMAP"  # Mapa de calor
    
    # Outros
    TEXT = "TEXT"  # Texto
    IMAGE = "IMAGE"  # Imagem
    IFRAME = "IFRAME"  # IFrame
    CUSTOM_HTML = "CUSTOM_HTML"  # HTML personalizado

class RefreshInterval(enum.Enum):
    """Enum para intervalos de atualização"""
    REAL_TIME = "REAL_TIME"  # Tempo real
    EVERY_MINUTE = "EVERY_MINUTE"  # A cada minuto
    EVERY_5_MINUTES = "EVERY_5_MINUTES"  # A cada 5 minutos
    EVERY_15_MINUTES = "EVERY_15_MINUTES"  # A cada 15 minutos
    EVERY_30_MINUTES = "EVERY_30_MINUTES"  # A cada 30 minutos
    HOURLY = "HOURLY"  # A cada hora
    DAILY = "DAILY"  # Diário
    MANUAL = "MANUAL"  # Manual

class Dashboard(db.Model):
    """Model para dashboards"""
    
    __tablename__ = 'dashboards'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False, index=True)  # Nome
    description = Column(Text, nullable=True)  # Descrição
    type = Column(Enum(DashboardType), nullable=False, index=True)  # Tipo
    category = Column(String(100), nullable=True, index=True)  # Categoria
    
    # === CONFIGURAÇÃO ===
    
    # Layout
    layout_config = Column(JSON, nullable=True)  # Configuração do layout
    grid_columns = Column(Integer, default=12, nullable=False)  # Colunas da grade
    grid_rows = Column(Integer, default=10, nullable=False)  # Linhas da grade
    
    # Aparência
    theme = Column(String(50), default='default', nullable=False)  # Tema
    background_color = Column(String(20), nullable=True)  # Cor de fundo
    text_color = Column(String(20), nullable=True)  # Cor do texto
    
    # Configurações de atualização
    refresh_interval = Column(Enum(RefreshInterval), default=RefreshInterval.EVERY_15_MINUTES, nullable=False)
    auto_refresh = Column(Boolean, default=True, nullable=False)  # Atualização automática
    
    # === USUÁRIO E PERMISSÕES ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Permissões
    is_public = Column(Boolean, default=False, nullable=False)  # Público
    is_default = Column(Boolean, default=False, nullable=False)  # Padrão para o tipo
    allowed_roles = Column(JSON, nullable=True)  # Perfis permitidos
    allowed_users = Column(JSON, nullable=True)  # Usuários permitidos
    
    # === STATUS E CONTROLE ===
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_template = Column(Boolean, default=False, nullable=False)  # É template
    
    # Controle de cache
    cache_duration_minutes = Column(Integer, default=15, nullable=False)  # Duração do cache
    last_cached_at = Column(DateTime, nullable=True)  # Última vez em cache
    
    # === METADADOS ===
    
    # Configurações adicionais
    settings = Column(JSON, nullable=True)  # Configurações extras
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # Tags e categorização
    tags = Column(JSON, nullable=True)  # Tags
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    creator = relationship('User', foreign_keys=[created_by])
    widgets = relationship('DashboardWidget', back_populates='dashboard', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Dashboard, self).__init__(**kwargs)
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
            DashboardType.EXECUTIVE: "Executivo",
            DashboardType.ADMINISTRATIVE: "Administrativo",
            DashboardType.CLINICAL: "Clínico",
            DashboardType.FINANCIAL: "Financeiro",
            DashboardType.OPERATIONAL: "Operacional",
            DashboardType.PATIENT_PORTAL: "Portal do Paciente",
            DashboardType.PARTNER_PORTAL: "Portal do Parceiro",
            DashboardType.MENTORSHIP: "Mentoria",
            DashboardType.ANALYTICS: "Analytics",
            DashboardType.CUSTOM: "Personalizado",
            DashboardType.TEAM: "Equipe",
            DashboardType.DEPARTMENT: "Departamento"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def refresh_interval_display(self) -> str:
        """Retorna o intervalo de atualização formatado"""
        interval_names = {
            RefreshInterval.REAL_TIME: "Tempo Real",
            RefreshInterval.EVERY_MINUTE: "A cada minuto",
            RefreshInterval.EVERY_5_MINUTES: "A cada 5 minutos",
            RefreshInterval.EVERY_15_MINUTES: "A cada 15 minutos",
            RefreshInterval.EVERY_30_MINUTES: "A cada 30 minutos",
            RefreshInterval.HOURLY: "A cada hora",
            RefreshInterval.DAILY: "Diário",
            RefreshInterval.MANUAL: "Manual"
        }
        return interval_names.get(self.refresh_interval, self.refresh_interval.value)
        
    @property
    def needs_refresh(self) -> bool:
        """Verifica se precisa atualizar"""
        if not self.auto_refresh or self.refresh_interval == RefreshInterval.MANUAL:
            return False
            
        if not self.last_cached_at:
            return True
            
        now = datetime.now(pytz.UTC)
        cache_expires = self.last_cached_at.replace(tzinfo=pytz.UTC) + timedelta(minutes=self.cache_duration_minutes)
        
        return now >= cache_expires
        
    def get_layout_config(self) -> dict:
        """Retorna a configuração do layout"""
        return self.layout_config or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def get_tags(self) -> List[str]:
        """Retorna as tags"""
        return self.tags or []
        
    def get_allowed_roles(self) -> List[str]:
        """Retorna os perfis permitidos"""
        return self.allowed_roles or []
        
    def get_allowed_users(self) -> List[int]:
        """Retorna os usuários permitidos"""
        return self.allowed_users or []
        
    def set_layout_config(self, config: dict):
        """Define a configuração do layout"""
        self.layout_config = config
        
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
            
    def add_allowed_role(self, role: str):
        """Adiciona um perfil permitido"""
        roles = self.get_allowed_roles()
        if role not in roles:
            roles.append(role)
            self.allowed_roles = roles
            
    def remove_allowed_role(self, role: str):
        """Remove um perfil permitido"""
        roles = self.get_allowed_roles()
        if role in roles:
            roles.remove(role)
            self.allowed_roles = roles
            
    def add_allowed_user(self, user_id: int):
        """Adiciona um usuário permitido"""
        users = self.get_allowed_users()
        if user_id not in users:
            users.append(user_id)
            self.allowed_users = users
            
    def remove_allowed_user(self, user_id: int):
        """Remove um usuário permitido"""
        users = self.get_allowed_users()
        if user_id in users:
            users.remove(user_id)
            self.allowed_users = users
            
    def update_cache(self):
        """Atualiza o timestamp do cache"""
        self.last_cached_at = datetime.now(pytz.UTC)
        
    def can_user_access(self, user_id: int, user_role: str = None) -> bool:
        """Verifica se usuário pode acessar"""
        # Dashboard inativo
        if not self.is_active:
            return False
            
        # Criador sempre pode acessar
        if user_id == self.created_by:
            return True
            
        # Dashboard público
        if self.is_public:
            return True
            
        # Usuário específico permitido
        if user_id in self.get_allowed_users():
            return True
            
        # Perfil permitido
        if user_role and user_role in self.get_allowed_roles():
            return True
            
        return False
        
    @classmethod
    def create_dashboard(
        cls,
        name: str,
        dashboard_type: DashboardType,
        created_by: int,
        description: str = None,
        is_public: bool = False,
        **kwargs
    ) -> 'Dashboard':
        """Cria um novo dashboard"""
        
        dashboard = cls(
            name=name,
            description=description,
            type=dashboard_type,
            created_by=created_by,
            is_public=is_public,
            **kwargs
        )
        
        return dashboard
        
    @classmethod
    def get_by_user(cls, user_id: int, user_role: str = None):
        """Busca dashboards acessíveis por usuário"""
        query = cls.query.filter(cls.is_active == True)
        
        # Filtrar por permissões
        conditions = [
            cls.created_by == user_id,  # Criador
            cls.is_public == True  # Público
        ]
        
        if user_role:
            # Adicionar condição para perfil permitido
            # Nota: Esta consulta pode precisar ser otimizada dependendo do banco
            pass
            
        return query.order_by(cls.name.asc()).all()
        
    @classmethod
    def get_by_type(cls, dashboard_type: DashboardType, user_id: int = None):
        """Busca dashboards por tipo"""
        query = cls.query.filter(
            cls.type == dashboard_type,
            cls.is_active == True
        )
        
        if user_id:
            query = query.filter(
                (cls.created_by == user_id) | (cls.is_public == True)
            )
            
        return query.order_by(cls.name.asc()).all()
        
    @classmethod
    def get_default_dashboard(cls, dashboard_type: DashboardType):
        """Busca dashboard padrão por tipo"""
        return cls.query.filter(
            cls.type == dashboard_type,
            cls.is_default == True,
            cls.is_active == True
        ).first()
        
    @classmethod
    def get_templates(cls):
        """Busca templates de dashboard"""
        return cls.query.filter(
            cls.is_template == True,
            cls.is_active == True
        ).order_by(cls.name.asc()).all()
        
    def to_dict(self, include_widgets=False) -> dict:
        """Converte o dashboard para dicionário"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'category': self.category,
            'theme': self.theme,
            'background_color': self.background_color,
            'text_color': self.text_color,
            'grid_columns': self.grid_columns,
            'grid_rows': self.grid_rows,
            'refresh_interval': self.refresh_interval.value,
            'refresh_interval_display': self.refresh_interval_display,
            'auto_refresh': self.auto_refresh,
            'cache_duration_minutes': self.cache_duration_minutes,
            'needs_refresh': self.needs_refresh,
            'created_by': self.created_by,
            'is_public': self.is_public,
            'is_default': self.is_default,
            'is_active': self.is_active,
            'is_template': self.is_template,
            'layout_config': self.get_layout_config(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'tags': self.get_tags(),
            'allowed_roles': self.get_allowed_roles(),
            'allowed_users': self.get_allowed_users(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_cached_at': self.last_cached_at.isoformat() if self.last_cached_at else None
        }
        
        if include_widgets:
            data['widgets'] = [widget.to_dict() for widget in self.widgets]
            
        return data
        
    def __repr__(self):
        return f'<Dashboard {self.id} - {self.name} - {self.type.value}>'

class DashboardWidget(db.Model):
    """Model para widgets do dashboard"""
    
    __tablename__ = 'dashboard_widgets'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Dashboard pai
    dashboard_id = Column(Integer, ForeignKey('dashboards.id'), nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False)  # Nome
    title = Column(String(200), nullable=True)  # Título exibido
    description = Column(Text, nullable=True)  # Descrição
    type = Column(Enum(WidgetType), nullable=False, index=True)  # Tipo
    
    # === POSICIONAMENTO ===
    
    # Posição na grade
    grid_x = Column(Integer, nullable=False, default=0)  # Posição X
    grid_y = Column(Integer, nullable=False, default=0)  # Posição Y
    grid_width = Column(Integer, nullable=False, default=4)  # Largura
    grid_height = Column(Integer, nullable=False, default=3)  # Altura
    
    # Ordem de exibição
    display_order = Column(Integer, nullable=False, default=0, index=True)
    
    # === CONFIGURAÇÃO ===
    
    # Fonte de dados
    data_source = Column(String(200), nullable=True)  # Fonte dos dados
    query_config = Column(JSON, nullable=True)  # Configuração da consulta
    
    # Configurações visuais
    chart_config = Column(JSON, nullable=True)  # Configuração do gráfico
    style_config = Column(JSON, nullable=True)  # Configuração de estilo
    
    # Configurações de atualização
    refresh_interval = Column(Enum(RefreshInterval), nullable=True)  # Intervalo específico
    auto_refresh = Column(Boolean, default=True, nullable=False)  # Atualização automática
    
    # === DADOS ===
    
    # Dados em cache
    cached_data = Column(JSON, nullable=True)  # Dados em cache
    last_updated = Column(DateTime, nullable=True)  # Última atualização
    
    # Configurações de cache
    cache_duration_minutes = Column(Integer, default=15, nullable=False)  # Duração do cache
    
    # === STATUS ===
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_loading = Column(Boolean, default=False, nullable=False)  # Carregando
    
    # Erro
    has_error = Column(Boolean, default=False, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # === CONFIGURAÇÕES EXTRAS ===
    
    # Configurações adicionais
    settings = Column(JSON, nullable=True)  # Configurações extras
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    dashboard = relationship('Dashboard', back_populates='widgets')
    
    def __init__(self, **kwargs):
        super(DashboardWidget, self).__init__(**kwargs)
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
            # Métricas simples
            WidgetType.METRIC: "Métrica",
            WidgetType.COUNTER: "Contador",
            WidgetType.PERCENTAGE: "Porcentagem",
            WidgetType.CURRENCY: "Moeda",
            
            # Gráficos
            WidgetType.LINE_CHART: "Gráfico de Linha",
            WidgetType.BAR_CHART: "Gráfico de Barras",
            WidgetType.PIE_CHART: "Gráfico de Pizza",
            WidgetType.AREA_CHART: "Gráfico de Área",
            WidgetType.DONUT_CHART: "Gráfico de Rosca",
            WidgetType.SCATTER_CHART: "Gráfico de Dispersão",
            
            # Tabelas e listas
            WidgetType.TABLE: "Tabela",
            WidgetType.LIST: "Lista",
            WidgetType.RANKING: "Ranking",
            
            # Indicadores
            WidgetType.GAUGE: "Medidor",
            WidgetType.PROGRESS_BAR: "Barra de Progresso",
            WidgetType.STATUS_INDICATOR: "Indicador de Status",
            WidgetType.TREND_INDICATOR: "Indicador de Tendência",
            
            # Calendários e tempo
            WidgetType.CALENDAR: "Calendário",
            WidgetType.TIMELINE: "Linha do Tempo",
            WidgetType.SCHEDULE: "Agenda",
            
            # Mapas e localização
            WidgetType.MAP: "Mapa",
            WidgetType.HEATMAP: "Mapa de Calor",
            
            # Outros
            WidgetType.TEXT: "Texto",
            WidgetType.IMAGE: "Imagem",
            WidgetType.IFRAME: "IFrame",
            WidgetType.CUSTOM_HTML: "HTML Personalizado"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def needs_refresh(self) -> bool:
        """Verifica se precisa atualizar"""
        if not self.auto_refresh:
            return False
            
        # Usar intervalo específico ou do dashboard
        interval = self.refresh_interval or self.dashboard.refresh_interval
        
        if interval == RefreshInterval.MANUAL:
            return False
            
        if not self.last_updated:
            return True
            
        now = datetime.now(pytz.UTC)
        cache_expires = self.last_updated.replace(tzinfo=pytz.UTC) + timedelta(minutes=self.cache_duration_minutes)
        
        return now >= cache_expires
        
    def get_query_config(self) -> dict:
        """Retorna a configuração da consulta"""
        return self.query_config or {}
        
    def get_chart_config(self) -> dict:
        """Retorna a configuração do gráfico"""
        return self.chart_config or {}
        
    def get_style_config(self) -> dict:
        """Retorna a configuração de estilo"""
        return self.style_config or {}
        
    def get_cached_data(self) -> dict:
        """Retorna os dados em cache"""
        return self.cached_data or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_query_config(self, config: dict):
        """Define a configuração da consulta"""
        self.query_config = config
        
    def set_chart_config(self, config: dict):
        """Define a configuração do gráfico"""
        self.chart_config = config
        
    def set_style_config(self, config: dict):
        """Define a configuração de estilo"""
        self.style_config = config
        
    def set_cached_data(self, data: dict):
        """Define os dados em cache"""
        self.cached_data = data
        self.last_updated = datetime.now(pytz.UTC)
        self.has_error = False
        self.error_message = None
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def set_error(self, error_message: str):
        """Define um erro"""
        self.has_error = True
        self.error_message = error_message
        self.is_loading = False
        
    def clear_error(self):
        """Limpa o erro"""
        self.has_error = False
        self.error_message = None
        
    def start_loading(self):
        """Inicia o carregamento"""
        self.is_loading = True
        self.clear_error()
        
    def stop_loading(self):
        """Para o carregamento"""
        self.is_loading = False
        
    def move_to_position(self, x: int, y: int, width: int = None, height: int = None):
        """Move o widget para uma posição"""
        self.grid_x = x
        self.grid_y = y
        if width is not None:
            self.grid_width = width
        if height is not None:
            self.grid_height = height
            
    def resize(self, width: int, height: int):
        """Redimensiona o widget"""
        self.grid_width = width
        self.grid_height = height
        
    @classmethod
    def create_widget(
        cls,
        dashboard_id: int,
        name: str,
        widget_type: WidgetType,
        title: str = None,
        grid_x: int = 0,
        grid_y: int = 0,
        grid_width: int = 4,
        grid_height: int = 3,
        **kwargs
    ) -> 'DashboardWidget':
        """Cria um novo widget"""
        
        widget = cls(
            dashboard_id=dashboard_id,
            name=name,
            title=title or name,
            type=widget_type,
            grid_x=grid_x,
            grid_y=grid_y,
            grid_width=grid_width,
            grid_height=grid_height,
            **kwargs
        )
        
        return widget
        
    @classmethod
    def get_by_dashboard(cls, dashboard_id: int):
        """Busca widgets por dashboard"""
        return cls.query.filter(
            cls.dashboard_id == dashboard_id,
            cls.is_active == True
        ).order_by(cls.display_order.asc(), cls.created_at.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte o widget para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'dashboard_id': self.dashboard_id,
            'name': self.name,
            'title': self.title,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'grid_x': self.grid_x,
            'grid_y': self.grid_y,
            'grid_width': self.grid_width,
            'grid_height': self.grid_height,
            'display_order': self.display_order,
            'data_source': self.data_source,
            'refresh_interval': self.refresh_interval.value if self.refresh_interval else None,
            'auto_refresh': self.auto_refresh,
            'cache_duration_minutes': self.cache_duration_minutes,
            'needs_refresh': self.needs_refresh,
            'is_active': self.is_active,
            'is_loading': self.is_loading,
            'has_error': self.has_error,
            'error_message': self.error_message,
            'query_config': self.get_query_config(),
            'chart_config': self.get_chart_config(),
            'style_config': self.get_style_config(),
            'cached_data': self.get_cached_data(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
        
    def __repr__(self):
        return f'<DashboardWidget {self.id} - {self.name} - {self.type.value}>'