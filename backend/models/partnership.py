# -*- coding: utf-8 -*-
"""
Model de Partnership
Sistema FisioFlow - Sistema de Parcerias (Educadora Física)
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

class PartnershipType(enum.Enum):
    """Enum para tipos de parceria"""
    PERSONAL_TRAINER = "PERSONAL_TRAINER"  # Personal trainer
    NUTRITIONIST = "NUTRITIONIST"  # Nutricionista
    PSYCHOLOGIST = "PSYCHOLOGIST"  # Psicólogo
    MASSAGE_THERAPIST = "MASSAGE_THERAPIST"  # Massoterapeuta
    PILATES_INSTRUCTOR = "PILATES_INSTRUCTOR"  # Instrutor de Pilates
    YOGA_INSTRUCTOR = "YOGA_INSTRUCTOR"  # Instrutor de Yoga
    OTHER = "OTHER"  # Outro

class PartnershipStatus(enum.Enum):
    """Enum para status da parceria"""
    PENDING = "PENDING"  # Pendente
    ACTIVE = "ACTIVE"  # Ativa
    SUSPENDED = "SUSPENDED"  # Suspensa
    TERMINATED = "TERMINATED"  # Encerrada
    BLOCKED = "BLOCKED"  # Bloqueada

class VoucherType(enum.Enum):
    """Enum para tipos de voucher"""
    SINGLE = "SINGLE"  # Avulso
    MONTHLY = "MONTHLY"  # Mensal
    PACKAGE = "PACKAGE"  # Pacote
    UNLIMITED = "UNLIMITED"  # Ilimitado

class VoucherStatus(enum.Enum):
    """Enum para status do voucher"""
    ACTIVE = "ACTIVE"  # Ativo
    USED = "USED"  # Usado
    EXPIRED = "EXPIRED"  # Expirado
    CANCELLED = "CANCELLED"  # Cancelado
    REFUNDED = "REFUNDED"  # Reembolsado

class PaymentStatus(enum.Enum):
    """Enum para status de pagamento"""
    PENDING = "PENDING"  # Pendente
    PROCESSING = "PROCESSING"  # Processando
    PAID = "PAID"  # Pago
    FAILED = "FAILED"  # Falhou
    CANCELLED = "CANCELLED"  # Cancelado
    REFUNDED = "REFUNDED"  # Reembolsado

class WithdrawalStatus(enum.Enum):
    """Enum para status de saque"""
    PENDING = "PENDING"  # Pendente
    PROCESSING = "PROCESSING"  # Processando
    COMPLETED = "COMPLETED"  # Concluído
    FAILED = "FAILED"  # Falhou
    CANCELLED = "CANCELLED"  # Cancelado

class Partnership(db.Model):
    """Model para parcerias"""
    
    __tablename__ = 'partnerships'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False, index=True)  # Nome da parceria
    description = Column(Text, nullable=True)  # Descrição
    type = Column(Enum(PartnershipType), nullable=False, index=True)  # Tipo
    status = Column(Enum(PartnershipStatus), default=PartnershipStatus.PENDING, nullable=False, index=True)
    
    # === PARCEIRO ===
    
    # Usuário parceiro
    partner_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Informações profissionais
    professional_registration = Column(String(50), nullable=True)  # Registro profissional
    specialties = Column(JSON, nullable=True)  # Especialidades
    certifications = Column(JSON, nullable=True)  # Certificações
    
    # === CONFIGURAÇÃO FINANCEIRA ===
    
    # Comissões (em porcentagem)
    platform_commission = Column(Numeric(5, 2), default=Decimal('10.00'), nullable=False)  # Comissão da plataforma
    gateway_commission = Column(Numeric(5, 2), default=Decimal('3.00'), nullable=False)  # Comissão do gateway
    tax_percentage = Column(Numeric(5, 2), default=Decimal('5.00'), nullable=False)  # Impostos
    partner_percentage = Column(Numeric(5, 2), default=Decimal('82.00'), nullable=False)  # Percentual do parceiro
    
    # Configurações de pagamento
    minimum_withdrawal = Column(Numeric(10, 2), default=Decimal('50.00'), nullable=False)  # Saque mínimo
    withdrawal_fee = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)  # Taxa de saque
    
    # Dados bancários
    bank_account = Column(JSON, nullable=True)  # Dados da conta bancária
    pix_key = Column(String(200), nullable=True)  # Chave PIX
    
    # === CONFIGURAÇÕES DE SERVIÇO ===
    
    # Preços
    default_price = Column(Numeric(10, 2), nullable=True)  # Preço padrão
    price_per_session = Column(Numeric(10, 2), nullable=True)  # Preço por sessão
    monthly_price = Column(Numeric(10, 2), nullable=True)  # Preço mensal
    package_prices = Column(JSON, nullable=True)  # Preços de pacotes
    
    # Disponibilidade
    availability = Column(JSON, nullable=True)  # Disponibilidade
    max_clients = Column(Integer, nullable=True)  # Máximo de clientes
    session_duration = Column(Integer, default=60, nullable=False)  # Duração da sessão (minutos)
    
    # === ESTATÍSTICAS ===
    
    # Clientes
    total_clients = Column(Integer, default=0, nullable=False)  # Total de clientes
    active_clients = Column(Integer, default=0, nullable=False)  # Clientes ativos
    
    # Sessões
    total_sessions = Column(Integer, default=0, nullable=False)  # Total de sessões
    completed_sessions = Column(Integer, default=0, nullable=False)  # Sessões concluídas
    cancelled_sessions = Column(Integer, default=0, nullable=False)  # Sessões canceladas
    
    # Financeiro
    total_revenue = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)  # Receita total
    total_commission = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)  # Comissão total
    total_withdrawn = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)  # Total sacado
    pending_balance = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)  # Saldo pendente
    available_balance = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)  # Saldo disponível
    
    # Avaliações
    total_ratings = Column(Integer, default=0, nullable=False)  # Total de avaliações
    average_rating = Column(Numeric(3, 2), nullable=True)  # Avaliação média
    
    # === CONFIGURAÇÕES ===
    
    # Notificações
    notification_settings = Column(JSON, nullable=True)  # Configurações de notificação
    
    # Configurações gerais
    settings = Column(JSON, nullable=True)  # Configurações
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === DATAS IMPORTANTES ===
    
    # Contrato
    contract_start_date = Column(DateTime, nullable=True)  # Início do contrato
    contract_end_date = Column(DateTime, nullable=True)  # Fim do contrato
    
    # Última atividade
    last_activity_at = Column(DateTime, nullable=True, index=True)  # Última atividade
    last_session_at = Column(DateTime, nullable=True)  # Última sessão
    last_withdrawal_at = Column(DateTime, nullable=True)  # Último saque
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    partner = relationship('User', foreign_keys=[partner_id])
    creator = relationship('User', foreign_keys=[created_by])
    vouchers = relationship('Voucher', back_populates='partnership', cascade='all, delete-orphan')
    sessions = relationship('PartnershipSession', back_populates='partnership', cascade='all, delete-orphan')
    withdrawals = relationship('PartnershipWithdrawal', back_populates='partnership', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Partnership, self).__init__(**kwargs)
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
            PartnershipType.PERSONAL_TRAINER: "Personal Trainer",
            PartnershipType.NUTRITIONIST: "Nutricionista",
            PartnershipType.PSYCHOLOGIST: "Psicólogo",
            PartnershipType.MASSAGE_THERAPIST: "Massoterapeuta",
            PartnershipType.PILATES_INSTRUCTOR: "Instrutor de Pilates",
            PartnershipType.YOGA_INSTRUCTOR: "Instrutor de Yoga",
            PartnershipType.OTHER: "Outro"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            PartnershipStatus.PENDING: "Pendente",
            PartnershipStatus.ACTIVE: "Ativa",
            PartnershipStatus.SUSPENDED: "Suspensa",
            PartnershipStatus.TERMINATED: "Encerrada",
            PartnershipStatus.BLOCKED: "Bloqueada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_active(self) -> bool:
        """Verifica se a parceria está ativa"""
        return self.status == PartnershipStatus.ACTIVE
        
    @property
    def completion_rate(self) -> float:
        """Calcula a taxa de conclusão de sessões"""
        if self.total_sessions == 0:
            return 0.0
        return (self.completed_sessions / self.total_sessions) * 100
        
    @property
    def cancellation_rate(self) -> float:
        """Calcula a taxa de cancelamento de sessões"""
        if self.total_sessions == 0:
            return 0.0
        return (self.cancelled_sessions / self.total_sessions) * 100
        
    @property
    def net_percentage(self) -> Decimal:
        """Calcula o percentual líquido do parceiro"""
        total_deductions = self.platform_commission + self.gateway_commission + self.tax_percentage
        return Decimal('100.00') - total_deductions
        
    def get_specialties(self) -> List[str]:
        """Retorna as especialidades"""
        return self.specialties or []
        
    def get_certifications(self) -> List[dict]:
        """Retorna as certificações"""
        return self.certifications or []
        
    def get_bank_account(self) -> dict:
        """Retorna os dados da conta bancária"""
        return self.bank_account or {}
        
    def get_package_prices(self) -> dict:
        """Retorna os preços de pacotes"""
        return self.package_prices or {}
        
    def get_availability(self) -> dict:
        """Retorna a disponibilidade"""
        return self.availability or {}
        
    def get_notification_settings(self) -> dict:
        """Retorna as configurações de notificação"""
        return self.notification_settings or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_specialties(self, specialties: List[str]):
        """Define as especialidades"""
        self.specialties = specialties
        
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
            
    def set_certifications(self, certifications: List[dict]):
        """Define as certificações"""
        self.certifications = certifications
        
    def add_certification(self, certification: dict):
        """Adiciona uma certificação"""
        certifications = self.get_certifications()
        certifications.append(certification)
        self.certifications = certifications
        
    def set_bank_account(self, account_data: dict):
        """Define os dados da conta bancária"""
        self.bank_account = account_data
        
    def set_package_prices(self, prices: dict):
        """Define os preços de pacotes"""
        self.package_prices = prices
        
    def set_availability(self, availability: dict):
        """Define a disponibilidade"""
        self.availability = availability
        
    def set_notification_settings(self, settings: dict):
        """Define as configurações de notificação"""
        self.notification_settings = settings
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def calculate_commission(self, amount: Decimal) -> dict:
        """Calcula as comissões sobre um valor"""
        platform_fee = amount * (self.platform_commission / Decimal('100'))
        gateway_fee = amount * (self.gateway_commission / Decimal('100'))
        tax_fee = amount * (self.tax_percentage / Decimal('100'))
        
        total_fees = platform_fee + gateway_fee + tax_fee
        partner_amount = amount - total_fees
        
        return {
            'gross_amount': amount,
            'platform_fee': platform_fee,
            'gateway_fee': gateway_fee,
            'tax_fee': tax_fee,
            'total_fees': total_fees,
            'net_amount': partner_amount,
            'partner_percentage': self.net_percentage
        }
        
    def add_revenue(self, amount: Decimal):
        """Adiciona receita"""
        commission_data = self.calculate_commission(amount)
        
        self.total_revenue += amount
        self.total_commission += commission_data['total_fees']
        self.pending_balance += commission_data['net_amount']
        
        self.updated_at = datetime.now(pytz.UTC)
        
    def process_withdrawal(self, amount: Decimal) -> bool:
        """Processa um saque"""
        if amount > self.available_balance:
            return False
            
        if amount < self.minimum_withdrawal:
            return False
            
        self.available_balance -= amount
        self.total_withdrawn += amount
        self.last_withdrawal_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
        return True
        
    def move_pending_to_available(self, amount: Decimal = None):
        """Move saldo pendente para disponível"""
        if amount is None:
            amount = self.pending_balance
        else:
            amount = min(amount, self.pending_balance)
            
        self.pending_balance -= amount
        self.available_balance += amount
        self.updated_at = datetime.now(pytz.UTC)
        
    def update_rating(self, new_rating: float):
        """Atualiza a avaliação média"""
        if self.total_ratings == 0:
            self.average_rating = Decimal(str(new_rating))
        else:
            # Média ponderada
            total_points = float(self.average_rating) * self.total_ratings
            total_points += new_rating
            self.average_rating = Decimal(str(total_points / (self.total_ratings + 1)))
            
        self.total_ratings += 1
        self.updated_at = datetime.now(pytz.UTC)
        
    def activate(self):
        """Ativa a parceria"""
        self.status = PartnershipStatus.ACTIVE
        if not self.contract_start_date:
            self.contract_start_date = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def suspend(self):
        """Suspende a parceria"""
        self.status = PartnershipStatus.SUSPENDED
        self.updated_at = datetime.now(pytz.UTC)
        
    def terminate(self):
        """Encerra a parceria"""
        self.status = PartnershipStatus.TERMINATED
        self.contract_end_date = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def block(self):
        """Bloqueia a parceria"""
        self.status = PartnershipStatus.BLOCKED
        self.updated_at = datetime.now(pytz.UTC)
        
    def record_activity(self):
        """Registra atividade"""
        self.last_activity_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    @classmethod
    def create_partnership(
        cls,
        name: str,
        partner_id: int,
        partnership_type: PartnershipType,
        created_by: int,
        **kwargs
    ) -> 'Partnership':
        """Cria uma nova parceria"""
        
        partnership = cls(
            name=name,
            partner_id=partner_id,
            type=partnership_type,
            created_by=created_by,
            **kwargs
        )
        
        return partnership
        
    @classmethod
    def get_by_partner(cls, partner_id: int):
        """Busca parcerias por parceiro"""
        return cls.query.filter(
            cls.partner_id == partner_id
        ).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_active(cls):
        """Busca parcerias ativas"""
        return cls.query.filter(
            cls.status == PartnershipStatus.ACTIVE
        ).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_by_type(cls, partnership_type: PartnershipType):
        """Busca parcerias por tipo"""
        return cls.query.filter(
            cls.type == partnership_type,
            cls.status == PartnershipStatus.ACTIVE
        ).order_by(cls.name.asc()).all()
        
    @classmethod
    def get_pending_approval(cls):
        """Busca parcerias pendentes de aprovação"""
        return cls.query.filter(
            cls.status == PartnershipStatus.PENDING
        ).order_by(cls.created_at.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte a parceria para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'partner_id': self.partner_id,
            'professional_registration': self.professional_registration,
            'specialties': self.get_specialties(),
            'certifications': self.get_certifications(),
            'platform_commission': float(self.platform_commission),
            'gateway_commission': float(self.gateway_commission),
            'tax_percentage': float(self.tax_percentage),
            'partner_percentage': float(self.partner_percentage),
            'net_percentage': float(self.net_percentage),
            'minimum_withdrawal': float(self.minimum_withdrawal),
            'withdrawal_fee': float(self.withdrawal_fee),
            'bank_account': self.get_bank_account(),
            'pix_key': self.pix_key,
            'default_price': float(self.default_price) if self.default_price else None,
            'price_per_session': float(self.price_per_session) if self.price_per_session else None,
            'monthly_price': float(self.monthly_price) if self.monthly_price else None,
            'package_prices': self.get_package_prices(),
            'availability': self.get_availability(),
            'max_clients': self.max_clients,
            'session_duration': self.session_duration,
            'total_clients': self.total_clients,
            'active_clients': self.active_clients,
            'total_sessions': self.total_sessions,
            'completed_sessions': self.completed_sessions,
            'cancelled_sessions': self.cancelled_sessions,
            'completion_rate': self.completion_rate,
            'cancellation_rate': self.cancellation_rate,
            'total_revenue': float(self.total_revenue),
            'total_commission': float(self.total_commission),
            'total_withdrawn': float(self.total_withdrawn),
            'pending_balance': float(self.pending_balance),
            'available_balance': float(self.available_balance),
            'total_ratings': self.total_ratings,
            'average_rating': float(self.average_rating) if self.average_rating else None,
            'notification_settings': self.get_notification_settings(),
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'contract_start_date': self.contract_start_date.isoformat() if self.contract_start_date else None,
            'contract_end_date': self.contract_end_date.isoformat() if self.contract_end_date else None,
            'last_activity_at': self.last_activity_at.isoformat() if self.last_activity_at else None,
            'last_session_at': self.last_session_at.isoformat() if self.last_session_at else None,
            'last_withdrawal_at': self.last_withdrawal_at.isoformat() if self.last_withdrawal_at else None,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<Partnership {self.id} - {self.name} - {self.type.value}>'

class Voucher(db.Model):
    """Model para vouchers de parceria"""
    
    __tablename__ = 'vouchers'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # Código único do voucher
    code = Column(String(20), unique=True, nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False)  # Nome
    description = Column(Text, nullable=True)  # Descrição
    type = Column(Enum(VoucherType), nullable=False, index=True)  # Tipo
    status = Column(Enum(VoucherStatus), default=VoucherStatus.ACTIVE, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Parceria
    partnership_id = Column(Integer, ForeignKey('partnerships.id'), nullable=False, index=True)
    
    # Cliente
    patient_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # === CONFIGURAÇÃO ===
    
    # Valor
    price = Column(Numeric(10, 2), nullable=False)  # Preço
    discount = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)  # Desconto
    final_price = Column(Numeric(10, 2), nullable=False)  # Preço final
    
    # Sessões
    total_sessions = Column(Integer, default=1, nullable=False)  # Total de sessões
    used_sessions = Column(Integer, default=0, nullable=False)  # Sessões usadas
    remaining_sessions = Column(Integer, nullable=False)  # Sessões restantes
    
    # Validade
    valid_from = Column(DateTime, nullable=False, index=True)  # Válido a partir de
    valid_until = Column(DateTime, nullable=False, index=True)  # Válido até
    
    # === PAGAMENTO ===
    
    # Status do pagamento
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    payment_method = Column(String(50), nullable=True)  # Método de pagamento
    payment_id = Column(String(100), nullable=True)  # ID do pagamento
    payment_data = Column(JSON, nullable=True)  # Dados do pagamento
    
    # Datas de pagamento
    paid_at = Column(DateTime, nullable=True)  # Data do pagamento
    refunded_at = Column(DateTime, nullable=True)  # Data do reembolso
    
    # === CONFIGURAÇÕES ===
    
    # Restrições
    restrictions = Column(JSON, nullable=True)  # Restrições
    terms = Column(Text, nullable=True)  # Termos e condições
    
    # Configurações
    settings = Column(JSON, nullable=True)  # Configurações
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === DATAS IMPORTANTES ===
    
    # Primeira e última utilização
    first_used_at = Column(DateTime, nullable=True)  # Primeira utilização
    last_used_at = Column(DateTime, nullable=True)  # Última utilização
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    partnership = relationship('Partnership', back_populates='vouchers')
    patient = relationship('User', foreign_keys=[patient_id])
    creator = relationship('User', foreign_keys=[created_by])
    sessions = relationship('PartnershipSession', back_populates='voucher')
    
    def __init__(self, **kwargs):
        super(Voucher, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.code:
            self.code = self.generate_code()
        if not self.remaining_sessions:
            self.remaining_sessions = self.total_sessions
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @staticmethod
    def generate_code() -> str:
        """Gera um código único para o voucher"""
        import random
        import string
        
        # Gerar código de 8 caracteres
        chars = string.ascii_uppercase + string.digits
        code = ''.join(random.choice(chars) for _ in range(8))
        
        # Verificar se já existe
        while Voucher.query.filter_by(code=code).first():
            code = ''.join(random.choice(chars) for _ in range(8))
            
        return code
        
    @property
    def type_display(self) -> str:
        """Retorna o tipo formatado"""
        type_names = {
            VoucherType.SINGLE: "Avulso",
            VoucherType.MONTHLY: "Mensal",
            VoucherType.PACKAGE: "Pacote",
            VoucherType.UNLIMITED: "Ilimitado"
        }
        return type_names.get(self.type, self.type.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            VoucherStatus.ACTIVE: "Ativo",
            VoucherStatus.USED: "Usado",
            VoucherStatus.EXPIRED: "Expirado",
            VoucherStatus.CANCELLED: "Cancelado",
            VoucherStatus.REFUNDED: "Reembolsado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def payment_status_display(self) -> str:
        """Retorna o status de pagamento formatado"""
        status_names = {
            PaymentStatus.PENDING: "Pendente",
            PaymentStatus.PROCESSING: "Processando",
            PaymentStatus.PAID: "Pago",
            PaymentStatus.FAILED: "Falhou",
            PaymentStatus.CANCELLED: "Cancelado",
            PaymentStatus.REFUNDED: "Reembolsado"
        }
        return status_names.get(self.payment_status, self.payment_status.value)
        
    @property
    def is_valid(self) -> bool:
        """Verifica se o voucher está válido"""
        now = datetime.now(pytz.UTC)
        return (
            self.status == VoucherStatus.ACTIVE and
            self.payment_status == PaymentStatus.PAID and
            self.valid_from.replace(tzinfo=pytz.UTC) <= now <= self.valid_until.replace(tzinfo=pytz.UTC) and
            self.remaining_sessions > 0
        )
        
    @property
    def is_expired(self) -> bool:
        """Verifica se o voucher está expirado"""
        now = datetime.now(pytz.UTC)
        return now > self.valid_until.replace(tzinfo=pytz.UTC)
        
    @property
    def is_fully_used(self) -> bool:
        """Verifica se o voucher foi totalmente usado"""
        return self.remaining_sessions <= 0
        
    @property
    def usage_percentage(self) -> float:
        """Calcula o percentual de uso"""
        if self.total_sessions == 0:
            return 0.0
        return (self.used_sessions / self.total_sessions) * 100
        
    def get_restrictions(self) -> dict:
        """Retorna as restrições"""
        return self.restrictions or {}
        
    def get_payment_data(self) -> dict:
        """Retorna os dados do pagamento"""
        return self.payment_data or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_restrictions(self, restrictions: dict):
        """Define as restrições"""
        self.restrictions = restrictions
        
    def set_payment_data(self, payment_data: dict):
        """Define os dados do pagamento"""
        self.payment_data = payment_data
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def use_session(self) -> bool:
        """Usa uma sessão do voucher"""
        if not self.is_valid:
            return False
            
        if self.remaining_sessions <= 0:
            return False
            
        self.used_sessions += 1
        self.remaining_sessions -= 1
        self.last_used_at = datetime.now(pytz.UTC)
        
        if not self.first_used_at:
            self.first_used_at = self.last_used_at
            
        # Marcar como usado se não há mais sessões
        if self.remaining_sessions <= 0:
            self.status = VoucherStatus.USED
            
        self.updated_at = datetime.now(pytz.UTC)
        return True
        
    def refund_session(self) -> bool:
        """Reembolsa uma sessão do voucher"""
        if self.used_sessions <= 0:
            return False
            
        self.used_sessions -= 1
        self.remaining_sessions += 1
        
        # Reativar se estava marcado como usado
        if self.status == VoucherStatus.USED and self.remaining_sessions > 0:
            self.status = VoucherStatus.ACTIVE
            
        self.updated_at = datetime.now(pytz.UTC)
        return True
        
    def mark_as_paid(self, payment_id: str = None, payment_method: str = None):
        """Marca o voucher como pago"""
        self.payment_status = PaymentStatus.PAID
        self.paid_at = datetime.now(pytz.UTC)
        
        if payment_id:
            self.payment_id = payment_id
        if payment_method:
            self.payment_method = payment_method
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def mark_as_refunded(self):
        """Marca o voucher como reembolsado"""
        self.payment_status = PaymentStatus.REFUNDED
        self.status = VoucherStatus.REFUNDED
        self.refunded_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel(self):
        """Cancela o voucher"""
        self.status = VoucherStatus.CANCELLED
        self.payment_status = PaymentStatus.CANCELLED
        self.updated_at = datetime.now(pytz.UTC)
        
    def check_expiration(self):
        """Verifica e atualiza status de expiração"""
        if self.is_expired and self.status == VoucherStatus.ACTIVE:
            self.status = VoucherStatus.EXPIRED
            self.updated_at = datetime.now(pytz.UTC)
            
    @classmethod
    def create_voucher(
        cls,
        name: str,
        partnership_id: int,
        patient_id: int,
        voucher_type: VoucherType,
        price: Decimal,
        total_sessions: int,
        valid_until: datetime,
        created_by: int,
        **kwargs
    ) -> 'Voucher':
        """Cria um novo voucher"""
        
        voucher = cls(
            name=name,
            partnership_id=partnership_id,
            patient_id=patient_id,
            type=voucher_type,
            price=price,
            final_price=price - kwargs.get('discount', Decimal('0.00')),
            total_sessions=total_sessions,
            remaining_sessions=total_sessions,
            valid_from=kwargs.get('valid_from', datetime.now(pytz.UTC)),
            valid_until=valid_until,
            created_by=created_by,
            **{k: v for k, v in kwargs.items() if k not in ['discount', 'valid_from']}
        )
        
        return voucher
        
    @classmethod
    def get_by_code(cls, code: str):
        """Busca voucher por código"""
        return cls.query.filter_by(code=code).first()
        
    @classmethod
    def get_by_patient(cls, patient_id: int):
        """Busca vouchers por paciente"""
        return cls.query.filter(
            cls.patient_id == patient_id
        ).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_by_partnership(cls, partnership_id: int):
        """Busca vouchers por parceria"""
        return cls.query.filter(
            cls.partnership_id == partnership_id
        ).order_by(cls.created_at.desc()).all()
        
    @classmethod
    def get_active(cls):
        """Busca vouchers ativos"""
        return cls.query.filter(
            cls.status == VoucherStatus.ACTIVE,
            cls.payment_status == PaymentStatus.PAID
        ).all()
        
    @classmethod
    def get_expiring_soon(cls, days: int = 7):
        """Busca vouchers que expiram em breve"""
        cutoff_date = datetime.now(pytz.UTC) + timedelta(days=days)
        
        return cls.query.filter(
            cls.status == VoucherStatus.ACTIVE,
            cls.valid_until <= cutoff_date
        ).all()
        
    @classmethod
    def get_expired(cls):
        """Busca vouchers expirados"""
        now = datetime.now(pytz.UTC)
        
        return cls.query.filter(
            cls.status == VoucherStatus.ACTIVE,
            cls.valid_until < now
        ).all()
        
    def to_dict(self) -> dict:
        """Converte o voucher para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'type': self.type.value,
            'type_display': self.type_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'partnership_id': self.partnership_id,
            'patient_id': self.patient_id,
            'price': float(self.price),
            'discount': float(self.discount),
            'final_price': float(self.final_price),
            'total_sessions': self.total_sessions,
            'used_sessions': self.used_sessions,
            'remaining_sessions': self.remaining_sessions,
            'usage_percentage': self.usage_percentage,
            'valid_from': self.valid_from.isoformat(),
            'valid_until': self.valid_until.isoformat(),
            'payment_status': self.payment_status.value,
            'payment_status_display': self.payment_status_display,
            'payment_method': self.payment_method,
            'payment_id': self.payment_id,
            'payment_data': self.get_payment_data(),
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'refunded_at': self.refunded_at.isoformat() if self.refunded_at else None,
            'restrictions': self.get_restrictions(),
            'terms': self.terms,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'first_used_at': self.first_used_at.isoformat() if self.first_used_at else None,
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
            'is_valid': self.is_valid,
            'is_expired': self.is_expired,
            'is_fully_used': self.is_fully_used,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<Voucher {self.id} - {self.code} - {self.name}>'

class PartnershipSession(db.Model):
    """Model para sessões de parceria"""
    
    __tablename__ = 'partnership_sessions'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Parceria
    partnership_id = Column(Integer, ForeignKey('partnerships.id'), nullable=False, index=True)
    
    # Voucher
    voucher_id = Column(Integer, ForeignKey('vouchers.id'), nullable=True, index=True)
    
    # Cliente
    patient_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # === AGENDAMENTO ===
    
    # Data e hora
    scheduled_at = Column(DateTime, nullable=False, index=True)  # Agendado para
    duration = Column(Integer, default=60, nullable=False)  # Duração em minutos
    
    # Status
    status = Column(String(20), default='SCHEDULED', nullable=False, index=True)  # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    
    # === EXECUÇÃO ===
    
    # Datas de execução
    started_at = Column(DateTime, nullable=True)  # Início real
    completed_at = Column(DateTime, nullable=True)  # Conclusão
    cancelled_at = Column(DateTime, nullable=True)  # Cancelamento
    
    # Motivo do cancelamento
    cancellation_reason = Column(Text, nullable=True)  # Motivo do cancelamento
    
    # === CONTEÚDO ===
    
    # Descrição da sessão
    description = Column(Text, nullable=True)  # Descrição
    objectives = Column(JSON, nullable=True)  # Objetivos
    exercises = Column(JSON, nullable=True)  # Exercícios realizados
    
    # Observações
    notes = Column(Text, nullable=True)  # Observações
    private_notes = Column(Text, nullable=True)  # Observações privadas
    
    # === AVALIAÇÃO ===
    
    # Avaliação do paciente
    patient_rating = Column(Integer, nullable=True)  # Avaliação (1-5)
    patient_feedback = Column(Text, nullable=True)  # Feedback do paciente
    
    # Avaliação do parceiro
    partner_rating = Column(Integer, nullable=True)  # Avaliação (1-5)
    partner_feedback = Column(Text, nullable=True)  # Feedback do parceiro
    
    # === FINANCEIRO ===
    
    # Valor da sessão
    price = Column(Numeric(10, 2), nullable=False)  # Preço
    commission_data = Column(JSON, nullable=True)  # Dados da comissão
    
    # Status do pagamento
    payment_processed = Column(Boolean, default=False, nullable=False)  # Pagamento processado
    payment_processed_at = Column(DateTime, nullable=True)  # Data do processamento
    
    # === METADADOS ===
    
    # Configurações
    settings = Column(JSON, nullable=True)  # Configurações
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    partnership = relationship('Partnership', back_populates='sessions')
    voucher = relationship('Voucher', back_populates='sessions')
    patient = relationship('User', foreign_keys=[patient_id])
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(PartnershipSession, self).__init__(**kwargs)
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
            'SCHEDULED': 'Agendada',
            'COMPLETED': 'Concluída',
            'CANCELLED': 'Cancelada',
            'NO_SHOW': 'Faltou'
        }
        return status_names.get(self.status, self.status)
        
    @property
    def is_completed(self) -> bool:
        """Verifica se a sessão foi concluída"""
        return self.status == 'COMPLETED'
        
    @property
    def is_cancelled(self) -> bool:
        """Verifica se a sessão foi cancelada"""
        return self.status in ['CANCELLED', 'NO_SHOW']
        
    @property
    def actual_duration(self) -> Optional[int]:
        """Calcula a duração real da sessão em minutos"""
        if not self.started_at or not self.completed_at:
            return None
            
        delta = self.completed_at - self.started_at
        return int(delta.total_seconds() / 60)
        
    def get_objectives(self) -> List[str]:
        """Retorna os objetivos"""
        return self.objectives or []
        
    def get_exercises(self) -> List[dict]:
        """Retorna os exercícios"""
        return self.exercises or []
        
    def get_commission_data(self) -> dict:
        """Retorna os dados da comissão"""
        return self.commission_data or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_objectives(self, objectives: List[str]):
        """Define os objetivos"""
        self.objectives = objectives
        
    def set_exercises(self, exercises: List[dict]):
        """Define os exercícios"""
        self.exercises = exercises
        
    def set_commission_data(self, commission_data: dict):
        """Define os dados da comissão"""
        self.commission_data = commission_data
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def start_session(self):
        """Inicia a sessão"""
        self.started_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
    def complete_session(self, notes: str = None):
        """Completa a sessão"""
        self.status = 'COMPLETED'
        self.completed_at = datetime.now(pytz.UTC)
        
        if notes:
            self.notes = notes
            
        # Usar sessão do voucher se aplicável
        if self.voucher_id and self.voucher:
            self.voucher.use_session()
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel_session(self, reason: str = None, no_show: bool = False):
        """Cancela a sessão"""
        self.status = 'NO_SHOW' if no_show else 'CANCELLED'
        self.cancelled_at = datetime.now(pytz.UTC)
        
        if reason:
            self.cancellation_reason = reason
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def rate_session(self, rating: int, feedback: str = None, by_patient: bool = True):
        """Avalia a sessão"""
        if by_patient:
            self.patient_rating = rating
            if feedback:
                self.patient_feedback = feedback
        else:
            self.partner_rating = rating
            if feedback:
                self.partner_feedback = feedback
                
        self.updated_at = datetime.now(pytz.UTC)
        
    def process_payment(self):
        """Processa o pagamento da sessão"""
        if self.payment_processed or not self.is_completed:
            return False
            
        # Calcular comissão
        if self.partnership:
            commission_data = self.partnership.calculate_commission(self.price)
            self.set_commission_data(commission_data)
            
            # Adicionar receita à parceria
            self.partnership.add_revenue(self.price)
            
        self.payment_processed = True
        self.payment_processed_at = datetime.now(pytz.UTC)
        self.updated_at = datetime.now(pytz.UTC)
        
        return True
        
    @classmethod
    def create_session(
        cls,
        partnership_id: int,
        patient_id: int,
        scheduled_at: datetime,
        price: Decimal,
        created_by: int,
        voucher_id: int = None,
        **kwargs
    ) -> 'PartnershipSession':
        """Cria uma nova sessão"""
        
        session = cls(
            partnership_id=partnership_id,
            patient_id=patient_id,
            scheduled_at=scheduled_at,
            price=price,
            voucher_id=voucher_id,
            created_by=created_by,
            **kwargs
        )
        
        return session
        
    @classmethod
    def get_by_partnership(cls, partnership_id: int):
        """Busca sessões por parceria"""
        return cls.query.filter(
            cls.partnership_id == partnership_id
        ).order_by(cls.scheduled_at.desc()).all()
        
    @classmethod
    def get_by_patient(cls, patient_id: int):
        """Busca sessões por paciente"""
        return cls.query.filter(
            cls.patient_id == patient_id
        ).order_by(cls.scheduled_at.desc()).all()
        
    @classmethod
    def get_by_voucher(cls, voucher_id: int):
        """Busca sessões por voucher"""
        return cls.query.filter(
            cls.voucher_id == voucher_id
        ).order_by(cls.scheduled_at.desc()).all()
        
    @classmethod
    def get_scheduled(cls, date_from: datetime = None, date_to: datetime = None):
        """Busca sessões agendadas"""
        query = cls.query.filter(cls.status == 'SCHEDULED')
        
        if date_from:
            query = query.filter(cls.scheduled_at >= date_from)
        if date_to:
            query = query.filter(cls.scheduled_at <= date_to)
            
        return query.order_by(cls.scheduled_at.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte a sessão para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'partnership_id': self.partnership_id,
            'voucher_id': self.voucher_id,
            'patient_id': self.patient_id,
            'scheduled_at': self.scheduled_at.isoformat(),
            'duration': self.duration,
            'status': self.status,
            'status_display': self.status_display,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'cancellation_reason': self.cancellation_reason,
            'description': self.description,
            'objectives': self.get_objectives(),
            'exercises': self.get_exercises(),
            'notes': self.notes,
            'private_notes': self.private_notes,
            'patient_rating': self.patient_rating,
            'patient_feedback': self.patient_feedback,
            'partner_rating': self.partner_rating,
            'partner_feedback': self.partner_feedback,
            'price': float(self.price),
            'commission_data': self.get_commission_data(),
            'payment_processed': self.payment_processed,
            'payment_processed_at': self.payment_processed_at.isoformat() if self.payment_processed_at else None,
            'actual_duration': self.actual_duration,
            'is_completed': self.is_completed,
            'is_cancelled': self.is_cancelled,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<PartnershipSession {self.id} - {self.scheduled_at} - {self.status}>'

class PartnershipWithdrawal(db.Model):
    """Model para saques de parceria"""
    
    __tablename__ = 'partnership_withdrawals'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    
    # === IDENTIFICAÇÃO ===
    
    # Identificador único
    uuid = Column(String(36), unique=True, nullable=False, index=True)
    
    # === RELACIONAMENTOS ===
    
    # Parceria
    partnership_id = Column(Integer, ForeignKey('partnerships.id'), nullable=False, index=True)
    
    # === SAQUE ===
    
    # Valor
    amount = Column(Numeric(10, 2), nullable=False)  # Valor solicitado
    fee = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)  # Taxa
    net_amount = Column(Numeric(10, 2), nullable=False)  # Valor líquido
    
    # Status
    status = Column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING, nullable=False, index=True)
    
    # === DADOS BANCÁRIOS ===
    
    # Método de saque
    withdrawal_method = Column(String(20), default='PIX', nullable=False)  # PIX, BANK_TRANSFER
    
    # Dados do destino
    destination_data = Column(JSON, nullable=False)  # Dados do destino (PIX, conta bancária)
    
    # === PROCESSAMENTO ===
    
    # IDs externos
    external_id = Column(String(100), nullable=True)  # ID externo
    transaction_id = Column(String(100), nullable=True)  # ID da transação
    
    # Dados do processamento
    processing_data = Column(JSON, nullable=True)  # Dados do processamento
    
    # Motivo de falha
    failure_reason = Column(Text, nullable=True)  # Motivo da falha
    
    # === DATAS ===
    
    # Datas de processamento
    requested_at = Column(DateTime, nullable=False, index=True)  # Data da solicitação
    processed_at = Column(DateTime, nullable=True)  # Data do processamento
    completed_at = Column(DateTime, nullable=True)  # Data da conclusão
    failed_at = Column(DateTime, nullable=True)  # Data da falha
    cancelled_at = Column(DateTime, nullable=True)  # Data do cancelamento
    
    # === METADADOS ===
    
    # Observações
    notes = Column(Text, nullable=True)  # Observações
    
    # Configurações
    settings = Column(JSON, nullable=True)  # Configurações
    metadata = Column(JSON, nullable=True)  # Metadados
    
    # === CAMPOS DE AUDITORIA ===
    
    # Criador
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    
    # Relacionamentos
    partnership = relationship('Partnership', back_populates='withdrawals')
    creator = relationship('User', foreign_keys=[created_by])
    
    def __init__(self, **kwargs):
        super(PartnershipWithdrawal, self).__init__(**kwargs)
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        if not self.requested_at:
            self.requested_at = datetime.now(pytz.UTC)
        if not self.created_at:
            self.created_at = datetime.now(pytz.UTC)
        if not self.updated_at:
            self.updated_at = datetime.now(pytz.UTC)
            
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            WithdrawalStatus.PENDING: "Pendente",
            WithdrawalStatus.PROCESSING: "Processando",
            WithdrawalStatus.COMPLETED: "Concluído",
            WithdrawalStatus.FAILED: "Falhou",
            WithdrawalStatus.CANCELLED: "Cancelado"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def is_completed(self) -> bool:
        """Verifica se o saque foi concluído"""
        return self.status == WithdrawalStatus.COMPLETED
        
    @property
    def is_pending(self) -> bool:
        """Verifica se o saque está pendente"""
        return self.status == WithdrawalStatus.PENDING
        
    @property
    def can_cancel(self) -> bool:
        """Verifica se o saque pode ser cancelado"""
        return self.status in [WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]
        
    def get_destination_data(self) -> dict:
        """Retorna os dados do destino"""
        return self.destination_data or {}
        
    def get_processing_data(self) -> dict:
        """Retorna os dados do processamento"""
        return self.processing_data or {}
        
    def get_settings(self) -> dict:
        """Retorna as configurações"""
        return self.settings or {}
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def set_destination_data(self, destination_data: dict):
        """Define os dados do destino"""
        self.destination_data = destination_data
        
    def set_processing_data(self, processing_data: dict):
        """Define os dados do processamento"""
        self.processing_data = processing_data
        
    def set_settings(self, settings: dict):
        """Define as configurações"""
        self.settings = settings
        
    def set_metadata(self, metadata: dict):
        """Define os metadados"""
        self.metadata = metadata
        
    def start_processing(self, external_id: str = None):
        """Inicia o processamento do saque"""
        self.status = WithdrawalStatus.PROCESSING
        self.processed_at = datetime.now(pytz.UTC)
        
        if external_id:
            self.external_id = external_id
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def complete(self, transaction_id: str = None):
        """Completa o saque"""
        self.status = WithdrawalStatus.COMPLETED
        self.completed_at = datetime.now(pytz.UTC)
        
        if transaction_id:
            self.transaction_id = transaction_id
            
        # Processar saque na parceria
        if self.partnership:
            self.partnership.process_withdrawal(self.amount)
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def fail(self, reason: str = None):
        """Marca o saque como falhou"""
        self.status = WithdrawalStatus.FAILED
        self.failed_at = datetime.now(pytz.UTC)
        
        if reason:
            self.failure_reason = reason
            
        self.updated_at = datetime.now(pytz.UTC)
        
    def cancel(self, reason: str = None):
        """Cancela o saque"""
        if not self.can_cancel:
            return False
            
        self.status = WithdrawalStatus.CANCELLED
        self.cancelled_at = datetime.now(pytz.UTC)
        
        if reason:
            self.notes = reason
            
        self.updated_at = datetime.now(pytz.UTC)
        return True
        
    @classmethod
    def create_withdrawal(
        cls,
        partnership_id: int,
        amount: Decimal,
        withdrawal_method: str,
        destination_data: dict,
        created_by: int,
        fee: Decimal = None,
        **kwargs
    ) -> 'PartnershipWithdrawal':
        """Cria um novo saque"""
        
        if fee is None:
            fee = Decimal('0.00')
            
        net_amount = amount - fee
        
        withdrawal = cls(
            partnership_id=partnership_id,
            amount=amount,
            fee=fee,
            net_amount=net_amount,
            withdrawal_method=withdrawal_method,
            destination_data=destination_data,
            created_by=created_by,
            **kwargs
        )
        
        return withdrawal
        
    @classmethod
    def get_by_partnership(cls, partnership_id: int):
        """Busca saques por parceria"""
        return cls.query.filter(
            cls.partnership_id == partnership_id
        ).order_by(cls.requested_at.desc()).all()
        
    @classmethod
    def get_pending(cls):
        """Busca saques pendentes"""
        return cls.query.filter(
            cls.status == WithdrawalStatus.PENDING
        ).order_by(cls.requested_at.asc()).all()
        
    @classmethod
    def get_processing(cls):
        """Busca saques em processamento"""
        return cls.query.filter(
            cls.status == WithdrawalStatus.PROCESSING
        ).order_by(cls.processed_at.asc()).all()
        
    def to_dict(self) -> dict:
        """Converte o saque para dicionário"""
        return {
            'id': self.id,
            'uuid': self.uuid,
            'partnership_id': self.partnership_id,
            'amount': float(self.amount),
            'fee': float(self.fee),
            'net_amount': float(self.net_amount),
            'status': self.status.value,
            'status_display': self.status_display,
            'withdrawal_method': self.withdrawal_method,
            'destination_data': self.get_destination_data(),
            'external_id': self.external_id,
            'transaction_id': self.transaction_id,
            'processing_data': self.get_processing_data(),
            'failure_reason': self.failure_reason,
            'requested_at': self.requested_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'failed_at': self.failed_at.isoformat() if self.failed_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'notes': self.notes,
            'is_completed': self.is_completed,
            'is_pending': self.is_pending,
            'can_cancel': self.can_cancel,
            'settings': self.get_settings(),
            'metadata': self.get_metadata(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
    def __repr__(self):
        return f'<PartnershipWithdrawal {self.id} - {self.amount} - {self.status.value}>'