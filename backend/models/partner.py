# -*- coding: utf-8 -*-
"""
Model de Parceiro (Educadora Física)
Sistema FisioFlow - Sistema de Parcerias
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
from decimal import Decimal

class PartnerStatus(enum.Enum):
    """Enum para status do parceiro"""
    PENDING = "PENDING"  # Pendente aprovação
    ACTIVE = "ACTIVE"  # Ativo
    INACTIVE = "INACTIVE"  # Inativo
    SUSPENDED = "SUSPENDED"  # Suspenso
    BLOCKED = "BLOCKED"  # Bloqueado

class PartnerSpecialty(enum.Enum):
    """Enum para especialidades do parceiro"""
    PERSONAL_TRAINER = "PERSONAL_TRAINER"  # Personal Trainer
    PILATES = "PILATES"  # Pilates
    FUNCTIONAL_TRAINING = "FUNCTIONAL_TRAINING"  # Treinamento Funcional
    STRENGTH_TRAINING = "STRENGTH_TRAINING"  # Musculação
    CARDIO_TRAINING = "CARDIO_TRAINING"  # Treinamento Cardiovascular
    REHABILITATION = "REHABILITATION"  # Reabilitação
    SPORTS_TRAINING = "SPORTS_TRAINING"  # Treinamento Esportivo
    GROUP_CLASSES = "GROUP_CLASSES"  # Aulas em Grupo
    AQUATIC_THERAPY = "AQUATIC_THERAPY"  # Hidroterapia
    ELDERLY_FITNESS = "ELDERLY_FITNESS"  # Fitness para Idosos

class Partner(db.Model):
    """Model para parceiros (educadoras físicas)"""
    
    __tablename__ = 'partners'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True, index=True)
    
    # Status e aprovação
    status = Column(Enum(PartnerStatus), default=PartnerStatus.PENDING, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # === DADOS PROFISSIONAIS ===
    
    # Registro profissional
    cref_number = Column(String(20), nullable=False, unique=True, index=True)  # Número do CREF
    cref_state = Column(String(2), nullable=False)  # Estado do CREF
    cref_expiry = Column(DateTime, nullable=True)  # Validade do CREF
    
    # Especialidades
    specialties = Column(JSON, nullable=True)  # Lista de especialidades (JSON)
    certifications = Column(JSON, nullable=True)  # Certificações (JSON)
    experience_years = Column(Integer, nullable=True)  # Anos de experiência
    
    # Formação
    education = Column(JSON, nullable=True)  # Formação acadêmica (JSON)
    additional_courses = Column(JSON, nullable=True)  # Cursos complementares (JSON)
    
    # === DADOS COMERCIAIS ===
    
    # Comissões e valores
    commission_rate = Column(Float, default=0.80, nullable=False)  # Taxa de comissão (80-85%)
    platform_fee = Column(Float, default=0.10, nullable=False)  # Taxa da plataforma (10%)
    gateway_fee = Column(Float, default=0.03, nullable=False)  # Taxa do gateway (3%)
    tax_rate = Column(Float, default=0.07, nullable=False)  # Taxa de impostos (7%)
    
    # Valores de serviços
    hourly_rate = Column(Float, nullable=True)  # Valor por hora
    session_rate = Column(Float, nullable=True)  # Valor por sessão
    package_rates = Column(JSON, nullable=True)  # Valores de pacotes (JSON)
    
    # === DADOS BANCÁRIOS ===
    
    # PIX
    pix_key = Column(String(100), nullable=True)  # Chave PIX
    pix_key_type = Column(String(20), nullable=True)  # Tipo da chave (CPF, email, telefone, aleatória)
    
    # Dados bancários tradicionais
    bank_code = Column(String(10), nullable=True)  # Código do banco
    bank_name = Column(String(100), nullable=True)  # Nome do banco
    agency = Column(String(20), nullable=True)  # Agência
    account_number = Column(String(30), nullable=True)  # Número da conta
    account_type = Column(String(20), nullable=True)  # Tipo da conta (corrente, poupança)
    
    # === CONFIGURAÇÕES DE TRABALHO ===
    
    # Disponibilidade
    availability = Column(JSON, nullable=True)  # Horários disponíveis (JSON)
    max_clients_per_day = Column(Integer, default=8, nullable=False)  # Máximo de clientes por dia
    session_duration = Column(Integer, default=60, nullable=False)  # Duração da sessão (minutos)
    
    # Localização
    service_areas = Column(JSON, nullable=True)  # Áreas de atendimento (JSON)
    home_service = Column(Boolean, default=True, nullable=False)  # Atende em domicílio
    clinic_service = Column(Boolean, default=False, nullable=False)  # Atende na clínica
    online_service = Column(Boolean, default=False, nullable=False)  # Atende online
    
    # === MÉTRICAS E PERFORMANCE ===
    
    # Estatísticas
    total_sessions = Column(Integer, default=0, nullable=False)  # Total de sessões
    total_clients = Column(Integer, default=0, nullable=False)  # Total de clientes
    total_earnings = Column(Float, default=0.0, nullable=False)  # Total de ganhos
    current_month_earnings = Column(Float, default=0.0, nullable=False)  # Ganhos do mês atual
    
    # Avaliações
    average_rating = Column(Float, default=0.0, nullable=False)  # Avaliação média
    total_ratings = Column(Integer, default=0, nullable=False)  # Total de avaliações
    
    # Performance
    completion_rate = Column(Float, default=0.0, nullable=False)  # Taxa de conclusão
    punctuality_rate = Column(Float, default=0.0, nullable=False)  # Taxa de pontualidade
    client_retention_rate = Column(Float, default=0.0, nullable=False)  # Taxa de retenção
    
    # === CONFIGURAÇÕES ===
    
    # Notificações
    email_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=True, nullable=False)
    whatsapp_notifications = Column(Boolean, default=True, nullable=False)
    
    # Preferências
    auto_accept_bookings = Column(Boolean, default=False, nullable=False)  # Aceitar agendamentos automaticamente
    require_advance_payment = Column(Boolean, default=True, nullable=False)  # Exigir pagamento antecipado
    cancellation_policy = Column(Text, nullable=True)  # Política de cancelamento
    
    # === DOCUMENTOS E VERIFICAÇÃO ===
    
    # Documentos
    documents = Column(JSON, nullable=True)  # Documentos enviados (JSON)
    verification_status = Column(String(20), default='pending', nullable=False)  # Status de verificação
    verification_notes = Column(Text, nullable=True)  # Notas da verificação
    
    # === CAMPOS DE CONTROLE ===
    
    # Observações
    notes = Column(Text, nullable=True)  # Observações internas
    public_bio = Column(Text, nullable=True)  # Biografia pública
    
    # Última atividade
    last_activity = Column(DateTime, nullable=True)  # Última atividade
    last_login = Column(DateTime, nullable=True)  # Último login
    
    # Campos de auditoria
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    user = relationship('User', foreign_keys=[user_id], back_populates='partner_profile')
    approver = relationship('User', foreign_keys=[approved_by])
    vouchers = relationship('Voucher', back_populates='partner')
    financial_transactions = relationship('FinancialTransaction', back_populates='partner')
    
    def __init__(self, **kwargs):
        super(Partner, self).__init__(**kwargs)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            PartnerStatus.PENDING: "Pendente Aprovação",
            PartnerStatus.ACTIVE: "Ativo",
            PartnerStatus.INACTIVE: "Inativo",
            PartnerStatus.SUSPENDED: "Suspenso",
            PartnerStatus.BLOCKED: "Bloqueado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def cref_display(self) -> str:
        """Retorna o CREF formatado"""
        return f"CREF {self.cref_number}-{self.cref_state}"
        
    @property
    def is_active(self) -> bool:
        """Verifica se o parceiro está ativo"""
        return self.status == PartnerStatus.ACTIVE
        
    @property
    def is_verified(self) -> bool:
        """Verifica se o parceiro está verificado"""
        return self.verification_status == 'verified'
        
    @property
    def cref_is_valid(self) -> bool:
        """Verifica se o CREF está válido"""
        if not self.cref_expiry:
            return True  # Se não tem data de expiração, considera válido
        return self.cref_expiry > datetime.now(pytz.UTC)
        
    def get_specialties(self) -> list:
        """Retorna as especialidades"""
        return self.specialties or []
        
    def add_specialty(self, specialty: str):
        """Adiciona uma especialidade"""
        specialties = self.get_specialties()
        if specialty not in specialties:
            specialties.append(specialty)
            self.specialties = specialties
            
    def remove_specialty(self, specialty: str):
        """Remove uma especialidade"""
        specialties = self.get_specialties()
        if specialty in specialties:
            specialties.remove(specialty)
            self.specialties = specialties
            
    def get_certifications(self) -> list:
        """Retorna as certificações"""
        return self.certifications or []
        
    def add_certification(self, name: str, institution: str, date: str = None, expiry: str = None):
        """Adiciona uma certificação"""
        certifications = self.get_certifications()
        cert = {
            'name': name,
            'institution': institution,
            'date': date,
            'expiry': expiry,
            'added_at': datetime.now().isoformat()
        }
        certifications.append(cert)
        self.certifications = certifications
        
    def get_education(self) -> list:
        """Retorna a formação acadêmica"""
        return self.education or []
        
    def add_education(self, degree: str, institution: str, year: int = None, status: str = "completed"):
        """Adiciona formação acadêmica"""
        education = self.get_education()
        edu = {
            'degree': degree,
            'institution': institution,
            'year': year,
            'status': status,
            'added_at': datetime.now().isoformat()
        }
        education.append(edu)
        self.education = education
        
    def get_package_rates(self) -> dict:
        """Retorna os valores de pacotes"""
        return self.package_rates or {}
        
    def set_package_rate(self, package_type: str, sessions: int, price: float, validity_days: int = 30):
        """Define valor de pacote"""
        rates = self.get_package_rates()
        rates[package_type] = {
            'sessions': sessions,
            'price': price,
            'validity_days': validity_days,
            'price_per_session': price / sessions,
            'updated_at': datetime.now().isoformat()
        }
        self.package_rates = rates
        
    def get_availability(self) -> dict:
        """Retorna a disponibilidade"""
        return self.availability or {}
        
    def set_availability(self, day: str, start_time: str, end_time: str, available: bool = True):
        """Define disponibilidade para um dia"""
        availability = self.get_availability()
        availability[day] = {
            'start_time': start_time,
            'end_time': end_time,
            'available': available,
            'updated_at': datetime.now().isoformat()
        }
        self.availability = availability
        
    def get_service_areas(self) -> list:
        """Retorna as áreas de atendimento"""
        return self.service_areas or []
        
    def add_service_area(self, area: str, additional_fee: float = 0.0):
        """Adiciona área de atendimento"""
        areas = self.get_service_areas()
        area_data = {
            'name': area,
            'additional_fee': additional_fee,
            'added_at': datetime.now().isoformat()
        }
        areas.append(area_data)
        self.service_areas = areas
        
    def get_documents(self) -> list:
        """Retorna os documentos"""
        return self.documents or []
        
    def add_document(self, document_type: str, file_path: str, description: str = None):
        """Adiciona um documento"""
        documents = self.get_documents()
        doc = {
            'type': document_type,
            'file_path': file_path,
            'description': description,
            'uploaded_at': datetime.now().isoformat(),
            'verified': False
        }
        documents.append(doc)
        self.documents = documents
        
    def calculate_net_earnings(self, gross_amount: float) -> dict:
        """Calcula ganhos líquidos"""
        platform_fee_amount = gross_amount * self.platform_fee
        gateway_fee_amount = gross_amount * self.gateway_fee
        tax_amount = gross_amount * self.tax_rate
        
        total_deductions = platform_fee_amount + gateway_fee_amount + tax_amount
        net_amount = gross_amount - total_deductions
        
        return {
            'gross_amount': gross_amount,
            'platform_fee': platform_fee_amount,
            'gateway_fee': gateway_fee_amount,
            'tax_amount': tax_amount,
            'total_deductions': total_deductions,
            'net_amount': net_amount,
            'commission_rate': self.commission_rate
        }
        
    def update_earnings(self, amount: float):
        """Atualiza os ganhos"""
        self.total_earnings += amount
        self.current_month_earnings += amount
        
    def reset_monthly_earnings(self):
        """Reseta os ganhos mensais"""
        self.current_month_earnings = 0.0
        
    def update_rating(self, new_rating: float):
        """Atualiza a avaliação média"""
        total_points = self.average_rating * self.total_ratings
        self.total_ratings += 1
        self.average_rating = (total_points + new_rating) / self.total_ratings
        
    def update_completion_rate(self, completed: bool):
        """Atualiza a taxa de conclusão"""
        total_sessions = self.total_sessions
        if completed:
            completed_sessions = total_sessions * (self.completion_rate / 100) + 1
        else:
            completed_sessions = total_sessions * (self.completion_rate / 100)
            
        self.total_sessions += 1
        self.completion_rate = (completed_sessions / self.total_sessions) * 100
        
    def approve(self, approver_id: int, notes: str = None):
        """Aprova o parceiro"""
        self.status = PartnerStatus.ACTIVE
        self.approved_by = approver_id
        self.approved_at = datetime.now(pytz.UTC)
        if notes:
            self.notes = notes
            
    def suspend(self, reason: str = None):
        """Suspende o parceiro"""
        self.status = PartnerStatus.SUSPENDED
        if reason:
            if self.notes:
                self.notes += f"\n\nSuspenso: {reason}"
            else:
                self.notes = f"Suspenso: {reason}"
                
    def reactivate(self):
        """Reativa o parceiro"""
        self.status = PartnerStatus.ACTIVE
        
    def block(self, reason: str = None):
        """Bloqueia o parceiro"""
        self.status = PartnerStatus.BLOCKED
        if reason:
            if self.notes:
                self.notes += f"\n\nBloqueado: {reason}"
            else:
                self.notes = f"Bloqueado: {reason}"
                
    def verify_documents(self, status: str = 'verified', notes: str = None):
        """Verifica os documentos"""
        self.verification_status = status
        self.verification_notes = notes
        
    def update_last_activity(self):
        """Atualiza última atividade"""
        self.last_activity = datetime.now(pytz.UTC)
        
    def update_last_login(self):
        """Atualiza último login"""
        self.last_login = datetime.now(pytz.UTC)
        self.update_last_activity()
        
    def is_available_on_date(self, date: datetime, start_time: str, duration: int = None) -> bool:
        """Verifica se está disponível em uma data/hora"""
        day_name = date.strftime('%A').lower()
        availability = self.get_availability()
        
        if day_name not in availability:
            return False
            
        day_availability = availability[day_name]
        if not day_availability.get('available', False):
            return False
            
        # Verificar horário
        start_available = day_availability.get('start_time')
        end_available = day_availability.get('end_time')
        
        if not start_available or not end_available:
            return False
            
        # Aqui poderia adicionar lógica mais complexa para verificar conflitos
        # com agendamentos existentes
        
        return True
        
    def get_monthly_earnings_report(self, year: int, month: int) -> dict:
        """Retorna relatório de ganhos mensais"""
        # Aqui seria implementada a lógica para calcular ganhos mensais
        # baseado nas transações financeiras
        return {
            'year': year,
            'month': month,
            'gross_earnings': 0.0,
            'net_earnings': 0.0,
            'total_sessions': 0,
            'total_clients': 0,
            'average_session_value': 0.0
        }
        
    @classmethod
    def get_active_partners(cls):
        """Retorna parceiros ativos"""
        return cls.query.filter_by(status=PartnerStatus.ACTIVE).all()
        
    @classmethod
    def get_pending_approval(cls):
        """Retorna parceiros pendentes de aprovação"""
        return cls.query.filter_by(status=PartnerStatus.PENDING).order_by(cls.created_at.asc()).all()
        
    @classmethod
    def get_by_specialty(cls, specialty: str):
        """Retorna parceiros por especialidade"""
        return cls.query.filter(
            cls.specialties.contains([specialty]),
            cls.status == PartnerStatus.ACTIVE
        ).all()
        
    @classmethod
    def get_by_service_area(cls, area: str):
        """Retorna parceiros por área de atendimento"""
        return cls.query.filter(
            cls.service_areas.contains([{'name': area}]),
            cls.status == PartnerStatus.ACTIVE
        ).all()
        
    @classmethod
    def search_partners(cls, query: str = None, specialty: str = None, area: str = None, 
                       min_rating: float = None, max_rate: float = None):
        """Busca parceiros com filtros"""
        filters = [cls.status == PartnerStatus.ACTIVE]
        
        if specialty:
            filters.append(cls.specialties.contains([specialty]))
            
        if area:
            filters.append(cls.service_areas.contains([{'name': area}]))
            
        if min_rating:
            filters.append(cls.average_rating >= min_rating)
            
        if max_rate:
            filters.append(cls.hourly_rate <= max_rate)
            
        query_obj = cls.query.filter(*filters)
        
        if query:
            # Busca por nome do usuário ou biografia
            query_obj = query_obj.join(cls.user).filter(
                db.or_(
                    cls.user.full_name.ilike(f'%{query}%'),
                    cls.public_bio.ilike(f'%{query}%')
                )
            )
            
        return query_obj.order_by(cls.average_rating.desc()).all()
        
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte o parceiro para dicionário"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status.value,
            'status_display': self.status_display,
            'cref_number': self.cref_number,
            'cref_state': self.cref_state,
            'cref_display': self.cref_display,
            'cref_is_valid': self.cref_is_valid,
            'experience_years': self.experience_years,
            'hourly_rate': self.hourly_rate,
            'session_rate': self.session_rate,
            'average_rating': self.average_rating,
            'total_ratings': self.total_ratings,
            'completion_rate': self.completion_rate,
            'total_sessions': self.total_sessions,
            'total_clients': self.total_clients,
            'home_service': self.home_service,
            'clinic_service': self.clinic_service,
            'online_service': self.online_service,
            'session_duration': self.session_duration,
            'max_clients_per_day': self.max_clients_per_day,
            'public_bio': self.public_bio,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'verification_status': self.verification_status,
            'specialties': self.get_specialties(),
            'certifications': self.get_certifications(),
            'education': self.get_education(),
            'package_rates': self.get_package_rates(),
            'availability': self.get_availability(),
            'service_areas': self.get_service_areas(),
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            # Incluir dados sensíveis (apenas para o próprio parceiro ou admin)
            sensitive_fields = [
                'commission_rate', 'platform_fee', 'gateway_fee', 'tax_rate',
                'total_earnings', 'current_month_earnings', 'pix_key', 'pix_key_type',
                'bank_code', 'bank_name', 'agency', 'account_number', 'account_type',
                'email_notifications', 'sms_notifications', 'whatsapp_notifications',
                'auto_accept_bookings', 'require_advance_payment', 'cancellation_policy',
                'notes', 'verification_notes', 'last_login'
            ]
            
            for field in sensitive_fields:
                value = getattr(self, field)
                if isinstance(value, datetime):
                    data[field] = value.isoformat() if value else None
                else:
                    data[field] = value
                    
            data['documents'] = self.get_documents()
            
        return data
        
    def __repr__(self):
        return f'<Partner {self.cref_display} - {self.status.value}>'