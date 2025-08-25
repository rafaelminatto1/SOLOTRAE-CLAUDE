# -*- coding: utf-8 -*-
"""
Model de Transação Financeira
Sistema FisioFlow - Sistema Financeiro
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import db
import enum
import pytz
from decimal import Decimal

class TransactionType(enum.Enum):
    """Enum para tipos de transação"""
    INCOME = "INCOME"  # Receita
    EXPENSE = "EXPENSE"  # Despesa
    TRANSFER = "TRANSFER"  # Transferência
    REFUND = "REFUND"  # Reembolso
    COMMISSION = "COMMISSION"  # Comissão
    WITHDRAWAL = "WITHDRAWAL"  # Saque
    DEPOSIT = "DEPOSIT"  # Depósito

class TransactionCategory(enum.Enum):
    """Enum para categorias de transação"""
    # Receitas
    CONSULTATION = "CONSULTATION"  # Consultas
    VOUCHER_SALE = "VOUCHER_SALE"  # Venda de vouchers
    INSURANCE = "INSURANCE"  # Convênios
    SUBSCRIPTION = "SUBSCRIPTION"  # Assinaturas
    OTHER_INCOME = "OTHER_INCOME"  # Outras receitas
    
    # Despesas
    RENT = "RENT"  # Aluguel
    UTILITIES = "UTILITIES"  # Utilidades (luz, água, internet)
    EQUIPMENT = "EQUIPMENT"  # Equipamentos
    SUPPLIES = "SUPPLIES"  # Materiais
    MARKETING = "MARKETING"  # Marketing
    SOFTWARE = "SOFTWARE"  # Software/Licenças
    PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES"  # Serviços profissionais
    TAXES = "TAXES"  # Impostos
    INSURANCE_EXPENSE = "INSURANCE_EXPENSE"  # Seguros
    TRAINING = "TRAINING"  # Treinamentos
    TRAVEL = "TRAVEL"  # Viagens
    OFFICE_SUPPLIES = "OFFICE_SUPPLIES"  # Material de escritório
    MAINTENANCE = "MAINTENANCE"  # Manutenção
    OTHER_EXPENSE = "OTHER_EXPENSE"  # Outras despesas
    
    # Comissões e parcerias
    PARTNER_COMMISSION = "PARTNER_COMMISSION"  # Comissão de parceiro
    PLATFORM_FEE = "PLATFORM_FEE"  # Taxa da plataforma
    PAYMENT_GATEWAY_FEE = "PAYMENT_GATEWAY_FEE"  # Taxa do gateway
    
    # Transferências
    BANK_TRANSFER = "BANK_TRANSFER"  # Transferência bancária
    PIX_TRANSFER = "PIX_TRANSFER"  # PIX
    CASH_TRANSFER = "CASH_TRANSFER"  # Dinheiro

class TransactionStatus(enum.Enum):
    """Enum para status da transação"""
    PENDING = "PENDING"  # Pendente
    PROCESSING = "PROCESSING"  # Processando
    COMPLETED = "COMPLETED"  # Concluída
    FAILED = "FAILED"  # Falhou
    CANCELLED = "CANCELLED"  # Cancelada
    REFUNDED = "REFUNDED"  # Reembolsada
    DISPUTED = "DISPUTED"  # Contestada

class PaymentMethod(enum.Enum):
    """Enum para métodos de pagamento"""
    CASH = "CASH"  # Dinheiro
    CREDIT_CARD = "CREDIT_CARD"  # Cartão de crédito
    DEBIT_CARD = "DEBIT_CARD"  # Cartão de débito
    PIX = "PIX"  # PIX
    BANK_TRANSFER = "BANK_TRANSFER"  # Transferência bancária
    CHECK = "CHECK"  # Cheque
    VOUCHER = "VOUCHER"  # Voucher
    INSURANCE = "INSURANCE"  # Convênio
    OTHER = "OTHER"  # Outros

class FinancialTransaction(db.Model):
    """Model para transações financeiras"""
    
    __tablename__ = 'financial_transactions'
    
    # Campos básicos
    id = Column(Integer, primary_key=True)
    transaction_code = Column(String(50), nullable=False, unique=True, index=True)  # Código único
    
    # Tipo e categoria
    transaction_type = Column(Enum(TransactionType), nullable=False, index=True)
    category = Column(Enum(TransactionCategory), nullable=False, index=True)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False, index=True)
    
    # === VALORES ===
    
    # Valores principais
    gross_amount = Column(Float, nullable=False)  # Valor bruto
    discount_amount = Column(Float, default=0.0, nullable=False)  # Desconto
    tax_amount = Column(Float, default=0.0, nullable=False)  # Impostos
    fee_amount = Column(Float, default=0.0, nullable=False)  # Taxas
    net_amount = Column(Float, nullable=False)  # Valor líquido
    
    # Detalhamento de taxas
    platform_fee = Column(Float, default=0.0, nullable=False)  # Taxa da plataforma (10%)
    gateway_fee = Column(Float, default=0.0, nullable=False)  # Taxa do gateway (3%)
    partner_commission = Column(Float, default=0.0, nullable=False)  # Comissão do parceiro
    
    # === INFORMAÇÕES DE PAGAMENTO ===
    
    # Método e dados
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_provider = Column(String(100), nullable=True)  # Provedor (Stripe, PagSeguro, etc.)
    payment_reference = Column(String(200), nullable=True)  # Referência externa
    payment_gateway_id = Column(String(200), nullable=True)  # ID no gateway
    
    # Dados do cartão (últimos 4 dígitos)
    card_last_digits = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)  # Visa, Mastercard, etc.
    
    # Dados PIX
    pix_key = Column(String(200), nullable=True)  # Chave PIX
    pix_end_to_end_id = Column(String(200), nullable=True)  # ID end-to-end
    
    # === RELACIONAMENTOS ===
    
    # Entidades relacionadas
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)  # Profissional
    partner_id = Column(Integer, ForeignKey('partners.id'), nullable=True, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True, index=True)
    voucher_id = Column(Integer, ForeignKey('vouchers.id'), nullable=True, index=True)
    
    # === DATAS ===
    
    # Datas da transação
    transaction_date = Column(DateTime, nullable=False, index=True)  # Data da transação
    due_date = Column(DateTime, nullable=True)  # Data de vencimento
    payment_date = Column(DateTime, nullable=True)  # Data do pagamento
    settlement_date = Column(DateTime, nullable=True)  # Data de liquidação
    
    # === DESCRIÇÕES E OBSERVAÇÕES ===
    
    # Descrições
    description = Column(String(500), nullable=False)  # Descrição
    notes = Column(Text, nullable=True)  # Observações
    internal_notes = Column(Text, nullable=True)  # Notas internas
    
    # Dados do recibo
    receipt_number = Column(String(50), nullable=True)  # Número do recibo
    invoice_number = Column(String(50), nullable=True)  # Número da nota fiscal
    
    # === DADOS CONTÁBEIS ===
    
    # Competência
    competence_month = Column(Integer, nullable=False, index=True)  # Mês de competência
    competence_year = Column(Integer, nullable=False, index=True)  # Ano de competência
    
    # Centro de custo
    cost_center = Column(String(100), nullable=True)  # Centro de custo
    account_code = Column(String(50), nullable=True)  # Código da conta contábil
    
    # === DADOS DE PARCELAMENTO ===
    
    # Parcelamento
    installment_number = Column(Integer, default=1, nullable=False)  # Número da parcela
    total_installments = Column(Integer, default=1, nullable=False)  # Total de parcelas
    parent_transaction_id = Column(Integer, ForeignKey('financial_transactions.id'), nullable=True)  # Transação pai
    
    # === DADOS DE RECONCILIAÇÃO ===
    
    # Reconciliação bancária
    bank_statement_date = Column(DateTime, nullable=True)  # Data do extrato
    bank_reference = Column(String(200), nullable=True)  # Referência bancária
    is_reconciled = Column(Boolean, default=False, nullable=False)  # Reconciliado
    reconciled_at = Column(DateTime, nullable=True)  # Data da reconciliação
    reconciled_by = Column(Integer, ForeignKey('users.id'), nullable=True)  # Reconciliado por
    
    # === DADOS FISCAIS ===
    
    # Impostos
    tax_details = Column(JSON, nullable=True)  # Detalhes dos impostos (JSON)
    tax_regime = Column(String(50), nullable=True)  # Regime tributário
    
    # Retenções
    withholding_tax = Column(Float, default=0.0, nullable=False)  # Imposto retido
    iss_amount = Column(Float, default=0.0, nullable=False)  # ISS
    irrf_amount = Column(Float, default=0.0, nullable=False)  # IRRF
    
    # === DADOS DE CANCELAMENTO/REEMBOLSO ===
    
    # Cancelamento
    cancelled_at = Column(DateTime, nullable=True)  # Data do cancelamento
    cancelled_by = Column(Integer, ForeignKey('users.id'), nullable=True)  # Cancelado por
    cancellation_reason = Column(Text, nullable=True)  # Motivo do cancelamento
    
    # Reembolso
    refunded_at = Column(DateTime, nullable=True)  # Data do reembolso
    refunded_by = Column(Integer, ForeignKey('users.id'), nullable=True)  # Reembolsado por
    refund_reason = Column(Text, nullable=True)  # Motivo do reembolso
    refund_amount = Column(Float, nullable=True)  # Valor reembolsado
    
    # === METADADOS ===
    
    # Dados adicionais
    metadata = Column(JSON, nullable=True)  # Metadados adicionais (JSON)
    tags = Column(JSON, nullable=True)  # Tags para categorização
    
    # Origem
    source = Column(String(50), default='manual', nullable=False)  # Origem (manual, api, import)
    source_reference = Column(String(200), nullable=True)  # Referência da origem
    
    # === CAMPOS DE AUDITORIA ===
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(pytz.UTC), onupdate=lambda: datetime.now(pytz.UTC), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    updated_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Relacionamentos
    patient = relationship('Patient')
    user = relationship('User', foreign_keys=[user_id])
    partner = relationship('Partner')
    appointment = relationship('Appointment')
    voucher = relationship('Voucher')
    parent_transaction = relationship('FinancialTransaction', remote_side=[id])
    child_transactions = relationship('FinancialTransaction', remote_side=[parent_transaction_id])
    creator = relationship('User', foreign_keys=[created_by])
    updater = relationship('User', foreign_keys=[updated_by])
    canceller = relationship('User', foreign_keys=[cancelled_by])
    refunder = relationship('User', foreign_keys=[refunded_by])
    reconciler = relationship('User', foreign_keys=[reconciled_by])
    
    def __init__(self, **kwargs):
        super(FinancialTransaction, self).__init__(**kwargs)
        if not self.transaction_code:
            self.transaction_code = self.generate_transaction_code()
        if not self.transaction_date:
            self.transaction_date = datetime.now(pytz.UTC)
        if not self.competence_month:
            self.competence_month = self.transaction_date.month
        if not self.competence_year:
            self.competence_year = self.transaction_date.year
        if not self.net_amount:
            self.calculate_net_amount()
            
    def generate_transaction_code(self) -> str:
        """Gera código único para a transação"""
        import secrets
        import string
        
        # Prefixo baseado no tipo
        prefixes = {
            TransactionType.INCOME: 'REC',
            TransactionType.EXPENSE: 'DES',
            TransactionType.TRANSFER: 'TRF',
            TransactionType.REFUND: 'REF',
            TransactionType.COMMISSION: 'COM',
            TransactionType.WITHDRAWAL: 'SAQ',
            TransactionType.DEPOSIT: 'DEP'
        }
        
        prefix = prefixes.get(self.transaction_type, 'TXN')
        timestamp = datetime.now().strftime('%Y%m%d')
        random_part = ''.join(secrets.choice(string.digits) for _ in range(6))
        
        return f"{prefix}{timestamp}{random_part}"
        
    def calculate_net_amount(self):
        """Calcula o valor líquido"""
        if self.transaction_type == TransactionType.INCOME:
            # Para receitas: bruto - descontos - taxas - impostos
            self.net_amount = (
                self.gross_amount - 
                self.discount_amount - 
                self.fee_amount - 
                self.tax_amount - 
                self.platform_fee - 
                self.gateway_fee - 
                self.withholding_tax
            )
        else:
            # Para despesas: valor bruto (já é o valor final)
            self.net_amount = self.gross_amount
            
    def calculate_fees(self, platform_rate: float = 0.10, gateway_rate: float = 0.03):
        """Calcula as taxas da plataforma e gateway"""
        if self.transaction_type == TransactionType.INCOME:
            self.platform_fee = self.gross_amount * platform_rate
            self.gateway_fee = self.gross_amount * gateway_rate
            self.fee_amount = self.platform_fee + self.gateway_fee
            self.calculate_net_amount()
            
    def calculate_partner_commission(self, commission_rate: float = 0.80):
        """Calcula a comissão do parceiro (80-85% do líquido)"""
        if self.partner_id and self.transaction_type == TransactionType.INCOME:
            # Comissão baseada no valor após taxas da plataforma
            amount_after_fees = self.gross_amount - self.platform_fee - self.gateway_fee
            self.partner_commission = amount_after_fees * commission_rate
            
    @property
    def transaction_type_display(self) -> str:
        """Retorna o tipo da transação formatado"""
        type_names = {
            TransactionType.INCOME: "Receita",
            TransactionType.EXPENSE: "Despesa",
            TransactionType.TRANSFER: "Transferência",
            TransactionType.REFUND: "Reembolso",
            TransactionType.COMMISSION: "Comissão",
            TransactionType.WITHDRAWAL: "Saque",
            TransactionType.DEPOSIT: "Depósito"
        }
        return type_names.get(self.transaction_type, self.transaction_type.value)
        
    @property
    def category_display(self) -> str:
        """Retorna a categoria formatada"""
        category_names = {
            # Receitas
            TransactionCategory.CONSULTATION: "Consultas",
            TransactionCategory.VOUCHER_SALE: "Venda de Vouchers",
            TransactionCategory.INSURANCE: "Convênios",
            TransactionCategory.SUBSCRIPTION: "Assinaturas",
            TransactionCategory.OTHER_INCOME: "Outras Receitas",
            
            # Despesas
            TransactionCategory.RENT: "Aluguel",
            TransactionCategory.UTILITIES: "Utilidades",
            TransactionCategory.EQUIPMENT: "Equipamentos",
            TransactionCategory.SUPPLIES: "Materiais",
            TransactionCategory.MARKETING: "Marketing",
            TransactionCategory.SOFTWARE: "Software",
            TransactionCategory.PROFESSIONAL_SERVICES: "Serviços Profissionais",
            TransactionCategory.TAXES: "Impostos",
            TransactionCategory.INSURANCE_EXPENSE: "Seguros",
            TransactionCategory.TRAINING: "Treinamentos",
            TransactionCategory.TRAVEL: "Viagens",
            TransactionCategory.OFFICE_SUPPLIES: "Material de Escritório",
            TransactionCategory.MAINTENANCE: "Manutenção",
            TransactionCategory.OTHER_EXPENSE: "Outras Despesas",
            
            # Comissões
            TransactionCategory.PARTNER_COMMISSION: "Comissão de Parceiro",
            TransactionCategory.PLATFORM_FEE: "Taxa da Plataforma",
            TransactionCategory.PAYMENT_GATEWAY_FEE: "Taxa do Gateway",
            
            # Transferências
            TransactionCategory.BANK_TRANSFER: "Transferência Bancária",
            TransactionCategory.PIX_TRANSFER: "PIX",
            TransactionCategory.CASH_TRANSFER: "Dinheiro"
        }
        return category_names.get(self.category, self.category.value)
        
    @property
    def status_display(self) -> str:
        """Retorna o status formatado"""
        status_names = {
            TransactionStatus.PENDING: "Pendente",
            TransactionStatus.PROCESSING: "Processando",
            TransactionStatus.COMPLETED: "Concluída",
            TransactionStatus.FAILED: "Falhou",
            TransactionStatus.CANCELLED: "Cancelada",
            TransactionStatus.REFUNDED: "Reembolsada",
            TransactionStatus.DISPUTED: "Contestada"
        }
        return status_names.get(self.status, self.status.value)
        
    @property
    def payment_method_display(self) -> str:
        """Retorna o método de pagamento formatado"""
        method_names = {
            PaymentMethod.CASH: "Dinheiro",
            PaymentMethod.CREDIT_CARD: "Cartão de Crédito",
            PaymentMethod.DEBIT_CARD: "Cartão de Débito",
            PaymentMethod.PIX: "PIX",
            PaymentMethod.BANK_TRANSFER: "Transferência Bancária",
            PaymentMethod.CHECK: "Cheque",
            PaymentMethod.VOUCHER: "Voucher",
            PaymentMethod.INSURANCE: "Convênio",
            PaymentMethod.OTHER: "Outros"
        }
        return method_names.get(self.payment_method, self.payment_method.value)
        
    @property
    def is_income(self) -> bool:
        """Verifica se é uma receita"""
        return self.transaction_type == TransactionType.INCOME
        
    @property
    def is_expense(self) -> bool:
        """Verifica se é uma despesa"""
        return self.transaction_type == TransactionType.EXPENSE
        
    @property
    def is_completed(self) -> bool:
        """Verifica se a transação foi concluída"""
        return self.status == TransactionStatus.COMPLETED
        
    @property
    def is_pending(self) -> bool:
        """Verifica se a transação está pendente"""
        return self.status == TransactionStatus.PENDING
        
    @property
    def effective_amount(self) -> float:
        """Retorna o valor efetivo (positivo para receitas, negativo para despesas)"""
        if self.is_income:
            return self.net_amount
        else:
            return -self.net_amount
            
    @property
    def installment_description(self) -> str:
        """Retorna a descrição do parcelamento"""
        if self.total_installments > 1:
            return f"{self.installment_number}/{self.total_installments}"
        return "À vista"
        
    def get_tax_details(self) -> dict:
        """Retorna os detalhes dos impostos"""
        return self.tax_details or {}
        
    def add_tax_detail(self, tax_type: str, amount: float, rate: float = None):
        """Adiciona detalhe de imposto"""
        details = self.get_tax_details()
        details[tax_type] = {
            'amount': amount,
            'rate': rate,
            'added_at': datetime.now().isoformat()
        }
        self.tax_details = details
        
    def get_metadata(self) -> dict:
        """Retorna os metadados"""
        return self.metadata or {}
        
    def add_metadata(self, key: str, value):
        """Adiciona metadado"""
        metadata = self.get_metadata()
        metadata[key] = value
        self.metadata = metadata
        
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
            
    def complete(self, payment_date: datetime = None):
        """Marca a transação como concluída"""
        self.status = TransactionStatus.COMPLETED
        self.payment_date = payment_date or datetime.now(pytz.UTC)
        
    def cancel(self, reason: str = None, cancelled_by: int = None):
        """Cancela a transação"""
        self.status = TransactionStatus.CANCELLED
        self.cancelled_at = datetime.now(pytz.UTC)
        self.cancellation_reason = reason
        self.cancelled_by = cancelled_by
        
    def refund(self, amount: float = None, reason: str = None, refunded_by: int = None):
        """Processa reembolso"""
        self.status = TransactionStatus.REFUNDED
        self.refunded_at = datetime.now(pytz.UTC)
        self.refund_amount = amount or self.net_amount
        self.refund_reason = reason
        self.refunded_by = refunded_by
        
    def reconcile(self, bank_reference: str = None, reconciled_by: int = None):
        """Marca como reconciliado"""
        self.is_reconciled = True
        self.reconciled_at = datetime.now(pytz.UTC)
        self.bank_reference = bank_reference
        self.reconciled_by = reconciled_by
        
    def create_installments(self, total_installments: int) -> list:
        """Cria parcelas da transação"""
        if total_installments <= 1:
            return []
            
        installments = []
        installment_amount = self.gross_amount / total_installments
        
        for i in range(1, total_installments + 1):
            installment = FinancialTransaction(
                transaction_type=self.transaction_type,
                category=self.category,
                gross_amount=installment_amount,
                payment_method=self.payment_method,
                description=f"{self.description} - Parcela {i}/{total_installments}",
                patient_id=self.patient_id,
                user_id=self.user_id,
                partner_id=self.partner_id,
                appointment_id=self.appointment_id,
                voucher_id=self.voucher_id,
                installment_number=i,
                total_installments=total_installments,
                parent_transaction_id=self.id,
                due_date=self.due_date + timedelta(days=30 * (i - 1)) if self.due_date else None,
                competence_month=self.competence_month,
                competence_year=self.competence_year
            )
            installment.calculate_net_amount()
            installments.append(installment)
            
        return installments
        
    @classmethod
    def get_by_period(cls, start_date: datetime, end_date: datetime, transaction_type: TransactionType = None):
        """Busca transações por período"""
        query = cls.query.filter(
            cls.transaction_date >= start_date,
            cls.transaction_date <= end_date
        )
        
        if transaction_type:
            query = query.filter(cls.transaction_type == transaction_type)
            
        return query.order_by(cls.transaction_date.desc()).all()
        
    @classmethod
    def get_by_competence(cls, month: int, year: int, transaction_type: TransactionType = None):
        """Busca transações por competência"""
        query = cls.query.filter(
            cls.competence_month == month,
            cls.competence_year == year
        )
        
        if transaction_type:
            query = query.filter(cls.transaction_type == transaction_type)
            
        return query.order_by(cls.transaction_date.desc()).all()
        
    @classmethod
    def get_by_patient(cls, patient_id: int):
        """Busca transações de um paciente"""
        return cls.query.filter_by(patient_id=patient_id).order_by(cls.transaction_date.desc()).all()
        
    @classmethod
    def get_by_partner(cls, partner_id: int):
        """Busca transações de um parceiro"""
        return cls.query.filter_by(partner_id=partner_id).order_by(cls.transaction_date.desc()).all()
        
    @classmethod
    def get_pending_reconciliation(cls):
        """Busca transações pendentes de reconciliação"""
        return cls.query.filter(
            cls.status == TransactionStatus.COMPLETED,
            cls.is_reconciled == False
        ).order_by(cls.transaction_date.desc()).all()
        
    @classmethod
    def calculate_revenue_by_period(cls, start_date: datetime, end_date: datetime) -> dict:
        """Calcula receita por período"""
        transactions = cls.get_by_period(start_date, end_date, TransactionType.INCOME)
        
        total_gross = sum(t.gross_amount for t in transactions if t.is_completed)
        total_net = sum(t.net_amount for t in transactions if t.is_completed)
        total_fees = sum(t.fee_amount for t in transactions if t.is_completed)
        total_taxes = sum(t.tax_amount for t in transactions if t.is_completed)
        
        return {
            'total_gross': total_gross,
            'total_net': total_net,
            'total_fees': total_fees,
            'total_taxes': total_taxes,
            'transaction_count': len([t for t in transactions if t.is_completed])
        }
        
    @classmethod
    def calculate_expenses_by_period(cls, start_date: datetime, end_date: datetime) -> dict:
        """Calcula despesas por período"""
        transactions = cls.get_by_period(start_date, end_date, TransactionType.EXPENSE)
        
        total_amount = sum(t.gross_amount for t in transactions if t.is_completed)
        
        # Agrupar por categoria
        by_category = {}
        for transaction in transactions:
            if transaction.is_completed:
                category = transaction.category.value
                if category not in by_category:
                    by_category[category] = 0
                by_category[category] += transaction.gross_amount
                
        return {
            'total_amount': total_amount,
            'by_category': by_category,
            'transaction_count': len([t for t in transactions if t.is_completed])
        }
        
    @classmethod
    def calculate_cash_flow(cls, start_date: datetime, end_date: datetime) -> dict:
        """Calcula fluxo de caixa"""
        revenue = cls.calculate_revenue_by_period(start_date, end_date)
        expenses = cls.calculate_expenses_by_period(start_date, end_date)
        
        net_cash_flow = revenue['total_net'] - expenses['total_amount']
        
        return {
            'revenue': revenue,
            'expenses': expenses,
            'net_cash_flow': net_cash_flow,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }
        
    def to_dict(self, include_sensitive=False) -> dict:
        """Converte a transação para dicionário"""
        data = {
            'id': self.id,
            'transaction_code': self.transaction_code,
            'transaction_type': self.transaction_type.value,
            'transaction_type_display': self.transaction_type_display,
            'category': self.category.value,
            'category_display': self.category_display,
            'status': self.status.value,
            'status_display': self.status_display,
            'gross_amount': self.gross_amount,
            'discount_amount': self.discount_amount,
            'tax_amount': self.tax_amount,
            'fee_amount': self.fee_amount,
            'net_amount': self.net_amount,
            'effective_amount': self.effective_amount,
            'payment_method': self.payment_method.value,
            'payment_method_display': self.payment_method_display,
            'description': self.description,
            'transaction_date': self.transaction_date.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'competence_month': self.competence_month,
            'competence_year': self.competence_year,
            'installment_description': self.installment_description,
            'is_reconciled': self.is_reconciled,
            'tags': self.get_tags(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            # Incluir dados sensíveis
            sensitive_fields = [
                'patient_id', 'user_id', 'partner_id', 'appointment_id', 'voucher_id',
                'platform_fee', 'gateway_fee', 'partner_commission', 'payment_provider',
                'payment_reference', 'payment_gateway_id', 'card_last_digits', 'card_brand',
                'pix_key', 'pix_end_to_end_id', 'notes', 'internal_notes', 'receipt_number',
                'invoice_number', 'cost_center', 'account_code', 'installment_number',
                'total_installments', 'parent_transaction_id', 'bank_statement_date',
                'bank_reference', 'reconciled_at', 'reconciled_by', 'withholding_tax',
                'iss_amount', 'irrf_amount', 'cancelled_at', 'cancelled_by',
                'cancellation_reason', 'refunded_at', 'refunded_by', 'refund_reason',
                'refund_amount', 'source', 'source_reference', 'created_by', 'updated_by'
            ]
            
            for field in sensitive_fields:
                value = getattr(self, field)
                if isinstance(value, datetime):
                    data[field] = value.isoformat() if value else None
                else:
                    data[field] = value
                    
            data['tax_details'] = self.get_tax_details()
            data['metadata'] = self.get_metadata()
            
        return data
        
    def __repr__(self):
        return f'<FinancialTransaction {self.transaction_code} - {self.transaction_type.value} - R$ {self.net_amount}>'