# -*- coding: utf-8 -*-
"""
Routes de Parcerias - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas ao sistema de parcerias
com educadoras físicas, incluindo gestão de vouchers, comissões e pagamentos.

Endpoints:
- GET /partnerships - Listar parcerias
- POST /partnerships - Criar nova parceria
- GET /partnerships/{id} - Obter parceria específica
- PUT /partnerships/{id} - Atualizar parceria
- DELETE /partnerships/{id} - Excluir parceria
- GET /partnerships/{id}/dashboard - Dashboard do parceiro
- GET /partnerships/{id}/clients - Clientes do parceiro
- POST /partnerships/{id}/sessions - Registrar atendimento
- GET /partnerships/{id}/sessions - Listar atendimentos
- GET /partnerships/{id}/earnings - Relatório de ganhos
- POST /partnerships/{id}/withdrawals - Solicitar saque
- GET /partnerships/{id}/withdrawals - Listar saques
- POST /vouchers - Criar voucher
- GET /vouchers - Listar vouchers
- POST /vouchers/{code}/redeem - Resgatar voucher
- GET /vouchers/{code}/validate - Validar voucher
- GET /vouchers/stats - Estatísticas de vouchers
"""

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_, and_, func, desc, asc, text
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

from ..models import (
    Partnership, Voucher, PartnershipSession, PartnershipWithdrawal,
    Patient, User, AuditLog
)
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import DataValidator, ContactValidator
from ..utils.helpers import CodeGenerator, DataFormatter
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
partnerships_bp = Blueprint('partnerships', __name__, url_prefix='/api/partnerships')
logger = get_logger(__name__)

# Configurações do sistema de comissões
PLATFORM_FEE_PERCENTAGE = Decimal('10.0')  # 10% para plataforma
GATEWAY_FEE_PERCENTAGE = Decimal('3.0')    # 3% para gateway
TAX_PERCENTAGE = Decimal('2.0')            # 2% impostos
PARTNER_PERCENTAGE = Decimal('85.0')       # 85% para parceiro

@partnerships_bp.route('', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def list_partnerships():
    """
    Listar parcerias com filtros e paginação
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20)
        status: Filtrar por status
        search: Termo de busca
        sort_by: Campo para ordenação
        sort_order: Ordem (asc/desc)
    
    Returns:
        Lista paginada de parcerias
    """
    try:
        # Obter parâmetros
        pagination = PaginationHelper.get_pagination_params(request)
        status = request.args.get('status')
        search_term = request.args.get('search')
        
        with get_db_session() as session:
            # Query base
            query = session.query(Partnership)
            
            # Filtro de status
            if status:
                try:
                    status_enum = Partnership.PartnershipStatus(status.upper())
                    query = query.filter(Partnership.status == status_enum)
                except ValueError:
                    pass
            
            # Filtro de busca
            if search_term:
                search_filter = or_(
                    Partnership.partner_name.ilike(f'%{search_term}%'),
                    Partnership.partner_email.ilike(f'%{search_term}%'),
                    Partnership.partner_phone.ilike(f'%{search_term}%'),
                    Partnership.business_name.ilike(f'%{search_term}%')
                )
                query = query.filter(search_filter)
            
            # Ordenação
            sort_by = request.args.get('sort_by', 'created_at')
            sort_order = request.args.get('sort_order', 'desc')
            
            if hasattr(Partnership, sort_by):
                order_column = getattr(Partnership, sort_by)
                if sort_order.lower() == 'desc':
                    query = query.order_by(order_column.desc())
                else:
                    query = query.order_by(order_column.asc())
            else:
                query = query.order_by(Partnership.created_at.desc())
            
            # Paginação
            total = query.count()
            partnerships = query.offset(
                (pagination['page'] - 1) * pagination['per_page']
            ).limit(pagination['per_page']).all()
            
            # Serializar dados com estatísticas
            partnerships_data = []
            for partnership in partnerships:
                partnership_dict = partnership.to_dict()
                
                # Adicionar estatísticas básicas
                total_vouchers = session.query(Voucher).filter_by(
                    partnership_id=partnership.id
                ).count()
                
                active_vouchers = session.query(Voucher).filter(
                    and_(
                        Voucher.partnership_id == partnership.id,
                        Voucher.status == Voucher.VoucherStatus.ACTIVE
                    )
                ).count()
                
                total_sessions = session.query(PartnershipSession).filter_by(
                    partnership_id=partnership.id
                ).count()
                
                partnership_dict.update({
                    'total_vouchers': total_vouchers,
                    'active_vouchers': active_vouchers,
                    'total_sessions': total_sessions
                })
                
                partnerships_data.append(partnership_dict)
            
            return APIResponse.paginated(
                data=partnerships_data,
                page=pagination['page'],
                per_page=pagination['per_page'],
                total=total
            )
    
    except Exception as e:
        logger.error(f"Erro ao listar parcerias: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@partnerships_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN])
def create_partnership():
    """
    Criar nova parceria
    
    Body:
        partner_name: Nome do parceiro
        partner_email: E-mail do parceiro
        partner_phone: Telefone do parceiro
        partner_cpf: CPF do parceiro
        business_name: Nome do negócio (opcional)
        business_cnpj: CNPJ do negócio (opcional)
        specialties: Especialidades (array)
        commission_percentage: Percentual de comissão personalizado (opcional)
        pix_key: Chave PIX para pagamentos
        bank_account: Dados bancários (opcional)
        contract_start_date: Data de início do contrato
        contract_end_date: Data de fim do contrato (opcional)
        notes: Observações (opcional)
    
    Returns:
        Dados da parceria criada
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        required_fields = [
            'partner_name', 'partner_email', 'partner_phone',
            'partner_cpf', 'pix_key', 'contract_start_date'
        ]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Validar e-mail
        if not ContactValidator.validate_email(data['partner_email']):
            return APIResponse.error('E-mail inválido', 400)
        
        # Validar telefone
        if not ContactValidator.validate_phone(data['partner_phone']):
            return APIResponse.error('Telefone inválido', 400)
        
        # Validar CPF
        if not DataValidator.validate_cpf(data['partner_cpf']):
            return APIResponse.error('CPF inválido', 400)
        
        # Validar CNPJ se fornecido
        if data.get('business_cnpj'):
            if not DataValidator.validate_cnpj(data['business_cnpj']):
                return APIResponse.error('CNPJ inválido', 400)
        
        with get_db_session() as session:
            # Verificar se CPF já existe
            existing_partnership = session.query(Partnership).filter_by(
                partner_cpf=data['partner_cpf']
            ).first()
            
            if existing_partnership:
                return APIResponse.error('Parceria com este CPF já existe', 409)
            
            # Verificar se e-mail já existe
            existing_email = session.query(Partnership).filter_by(
                partner_email=data['partner_email']
            ).first()
            
            if existing_email:
                return APIResponse.error('Parceria com este e-mail já existe', 409)
            
            # Gerar código da parceria
            partnership_code = CodeGenerator.generate_short_id()
            
            # Criar parceria
            partnership = Partnership(
                partnership_code=partnership_code,
                partner_name=data['partner_name'],
                partner_email=data['partner_email'],
                partner_phone=data['partner_phone'],
                partner_cpf=data['partner_cpf'],
                business_name=data.get('business_name'),
                business_cnpj=data.get('business_cnpj'),
                specialties=data.get('specialties', []),
                commission_percentage=data.get('commission_percentage', PARTNER_PERCENTAGE),
                pix_key=data['pix_key'],
                bank_account=data.get('bank_account'),
                contract_start_date=datetime.fromisoformat(data['contract_start_date']),
                contract_end_date=datetime.fromisoformat(data['contract_end_date']) if data.get('contract_end_date') else None,
                notes=data.get('notes'),
                status=Partnership.PartnershipStatus.ACTIVE,
                created_by=current_user.id
            )
            
            session.add(partnership)
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='PARTNERSHIP_CREATED',
                description=f'Parceria criada: {partnership.partner_name}',
                level='INFO',
                entity_type='Partnership',
                entity_id=str(partnership.id),
                new_data=partnership.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success(partnership.to_dict(), 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar parceria: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@partnerships_bp.route('/<uuid:partnership_id>', methods=['GET'])
@require_auth
def get_partnership(partnership_id):
    """
    Obter parceria específica
    
    Path Parameters:
        partnership_id: ID da parceria
    
    Returns:
        Dados completos da parceria
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            partnership = session.query(Partnership).filter_by(
                id=partnership_id
            ).first()
            
            if not partnership:
                return APIResponse.not_found('Parceria não encontrada')
            
            # Verificar permissões
            if (current_user.role not in [User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA] and
                partnership.partner_email != current_user.email):
                return APIResponse.forbidden('Acesso negado')
            
            # Serializar dados com estatísticas detalhadas
            partnership_dict = partnership.to_dict()
            
            # Estatísticas de vouchers
            voucher_stats = session.query(
                Voucher.status,
                func.count(Voucher.id).label('count'),
                func.sum(Voucher.value).label('total_value')
            ).filter_by(
                partnership_id=partnership.id
            ).group_by(Voucher.status).all()
            
            partnership_dict['voucher_stats'] = {
                status.value: {
                    'count': count,
                    'total_value': float(total_value or 0)
                } for status, count, total_value in voucher_stats
            }
            
            # Estatísticas de sessões
            total_sessions = session.query(PartnershipSession).filter_by(
                partnership_id=partnership.id
            ).count()
            
            sessions_this_month = session.query(PartnershipSession).filter(
                and_(
                    PartnershipSession.partnership_id == partnership.id,
                    PartnershipSession.session_date >= datetime.utcnow().replace(day=1)
                )
            ).count()
            
            partnership_dict['session_stats'] = {
                'total_sessions': total_sessions,
                'sessions_this_month': sessions_this_month
            }
            
            # Ganhos totais
            total_earnings = session.query(
                func.sum(PartnershipSession.partner_amount)
            ).filter_by(
                partnership_id=partnership.id
            ).scalar() or Decimal('0')
            
            partnership_dict['total_earnings'] = float(total_earnings)
            
            return APIResponse.success(partnership_dict)
    
    except Exception as e:
        logger.error(f"Erro ao obter parceria: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@partnerships_bp.route('/<uuid:partnership_id>/dashboard', methods=['GET'])
@require_auth
def get_partnership_dashboard(partnership_id):
    """
    Dashboard do parceiro
    
    Path Parameters:
        partnership_id: ID da parceria
    
    Returns:
        Dados do dashboard financeiro
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            partnership = session.query(Partnership).filter_by(
                id=partnership_id
            ).first()
            
            if not partnership:
                return APIResponse.not_found('Parceria não encontrada')
            
            # Verificar permissões
            if (current_user.role not in [User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA] and
                partnership.partner_email != current_user.email):
                return APIResponse.forbidden('Acesso negado')
            
            # Período para análise
            today = datetime.utcnow().date()
            start_of_month = today.replace(day=1)
            start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
            
            # Receitas do mês atual
            current_month_sessions = session.query(
                func.count(PartnershipSession.id).label('session_count'),
                func.sum(PartnershipSession.total_amount).label('gross_revenue'),
                func.sum(PartnershipSession.partner_amount).label('net_revenue')
            ).filter(
                and_(
                    PartnershipSession.partnership_id == partnership.id,
                    PartnershipSession.session_date >= start_of_month
                )
            ).first()
            
            # Receitas do mês anterior
            last_month_sessions = session.query(
                func.count(PartnershipSession.id).label('session_count'),
                func.sum(PartnershipSession.total_amount).label('gross_revenue'),
                func.sum(PartnershipSession.partner_amount).label('net_revenue')
            ).filter(
                and_(
                    PartnershipSession.partnership_id == partnership.id,
                    PartnershipSession.session_date >= start_of_last_month,
                    PartnershipSession.session_date < start_of_month
                )
            ).first()
            
            # Clientes ativos (com sessões nos últimos 30 dias)
            thirty_days_ago = today - timedelta(days=30)
            active_clients = session.query(
                func.count(func.distinct(PartnershipSession.patient_id))
            ).filter(
                and_(
                    PartnershipSession.partnership_id == partnership.id,
                    PartnershipSession.session_date >= thirty_days_ago
                )
            ).scalar() or 0
            
            # Vouchers ativos
            active_vouchers = session.query(Voucher).filter(
                and_(
                    Voucher.partnership_id == partnership.id,
                    Voucher.status == Voucher.VoucherStatus.ACTIVE
                )
            ).count()
            
            # Saldo disponível para saque
            total_earned = session.query(
                func.sum(PartnershipSession.partner_amount)
            ).filter_by(
                partnership_id=partnership.id
            ).scalar() or Decimal('0')
            
            total_withdrawn = session.query(
                func.sum(PartnershipWithdrawal.amount)
            ).filter(
                and_(
                    PartnershipWithdrawal.partnership_id == partnership.id,
                    PartnershipWithdrawal.status == PartnershipWithdrawal.WithdrawalStatus.COMPLETED
                )
            ).scalar() or Decimal('0')
            
            available_balance = total_earned - total_withdrawn
            
            # Últimas sessões
            recent_sessions = session.query(PartnershipSession).filter_by(
                partnership_id=partnership.id
            ).order_by(
                PartnershipSession.session_date.desc()
            ).limit(10).all()
            
            # Serializar sessões recentes
            recent_sessions_data = []
            for session_obj in recent_sessions:
                session_dict = session_obj.to_dict()
                
                # Adicionar dados do paciente
                patient = session.query(Patient).filter_by(
                    id=session_obj.patient_id
                ).first()
                
                if patient:
                    session_dict['patient'] = {
                        'id': str(patient.id),
                        'name': patient.full_name,
                        'phone': patient.phone
                    }
                
                recent_sessions_data.append(session_dict)
            
            return APIResponse.success({
                'partnership': {
                    'id': str(partnership.id),
                    'partner_name': partnership.partner_name,
                    'business_name': partnership.business_name,
                    'commission_percentage': float(partnership.commission_percentage)
                },
                'current_month': {
                    'sessions': current_month_sessions.session_count or 0,
                    'gross_revenue': float(current_month_sessions.gross_revenue or 0),
                    'net_revenue': float(current_month_sessions.net_revenue or 0)
                },
                'last_month': {
                    'sessions': last_month_sessions.session_count or 0,
                    'gross_revenue': float(last_month_sessions.gross_revenue or 0),
                    'net_revenue': float(last_month_sessions.net_revenue or 0)
                },
                'active_clients': active_clients,
                'active_vouchers': active_vouchers,
                'financial': {
                    'total_earned': float(total_earned),
                    'total_withdrawn': float(total_withdrawn),
                    'available_balance': float(available_balance)
                },
                'recent_sessions': recent_sessions_data
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter dashboard da parceria: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@partnerships_bp.route('/<uuid:partnership_id>/sessions', methods=['POST'])
@require_auth
def create_partnership_session(partnership_id):
    """
    Registrar atendimento da parceria
    
    Path Parameters:
        partnership_id: ID da parceria
    
    Body:
        patient_id: ID do paciente
        voucher_code: Código do voucher (opcional)
        session_date: Data da sessão
        duration_minutes: Duração em minutos
        session_type: Tipo de sessão
        notes: Observações (opcional)
        exercises_performed: Exercícios realizados (opcional)
    
    Returns:
        Dados da sessão criada
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        required_fields = ['patient_id', 'session_date', 'duration_minutes', 'session_type']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        with get_db_session() as session:
            # Verificar se parceria existe
            partnership = session.query(Partnership).filter_by(
                id=partnership_id,
                status=Partnership.PartnershipStatus.ACTIVE
            ).first()
            
            if not partnership:
                return APIResponse.not_found('Parceria não encontrada ou inativa')
            
            # Verificar se paciente existe
            patient = session.query(Patient).filter_by(
                id=data['patient_id']
            ).first()
            
            if not patient:
                return APIResponse.not_found('Paciente não encontrado')
            
            # Verificar voucher se fornecido
            voucher = None
            if data.get('voucher_code'):
                voucher = session.query(Voucher).filter_by(
                    code=data['voucher_code'],
                    partnership_id=partnership_id,
                    status=Voucher.VoucherStatus.ACTIVE
                ).first()
                
                if not voucher:
                    return APIResponse.error('Voucher não encontrado ou inválido', 400)
                
                if voucher.patient_id != data['patient_id']:
                    return APIResponse.error('Voucher não pertence a este paciente', 400)
                
                if voucher.sessions_used >= voucher.sessions_total:
                    return APIResponse.error('Voucher já foi totalmente utilizado', 400)
            
            # Calcular valores
            base_value = Decimal('80.00')  # Valor base por sessão
            total_amount = base_value
            
            # Calcular comissões
            platform_fee = total_amount * (PLATFORM_FEE_PERCENTAGE / 100)
            gateway_fee = total_amount * (GATEWAY_FEE_PERCENTAGE / 100)
            tax_fee = total_amount * (TAX_PERCENTAGE / 100)
            partner_amount = total_amount - platform_fee - gateway_fee - tax_fee
            
            # Criar sessão
            partnership_session = PartnershipSession(
                partnership_id=partnership_id,
                patient_id=data['patient_id'],
                voucher_id=voucher.id if voucher else None,
                session_date=datetime.fromisoformat(data['session_date']),
                duration_minutes=data['duration_minutes'],
                session_type=data['session_type'],
                total_amount=total_amount,
                platform_fee=platform_fee,
                gateway_fee=gateway_fee,
                tax_fee=tax_fee,
                partner_amount=partner_amount,
                notes=data.get('notes'),
                exercises_performed=data.get('exercises_performed', []),
                created_by=current_user.id
            )
            
            session.add(partnership_session)
            
            # Atualizar voucher se usado
            if voucher:
                voucher.sessions_used += 1
                voucher.last_used_at = datetime.utcnow()
                
                if voucher.sessions_used >= voucher.sessions_total:
                    voucher.status = Voucher.VoucherStatus.USED
            
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='PARTNERSHIP_SESSION_CREATED',
                description=f'Sessão registrada para parceria: {partnership.partner_name}',
                level='INFO',
                entity_type='PartnershipSession',
                entity_id=str(partnership_session.id),
                new_data=partnership_session.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Retornar dados da sessão
            session_dict = partnership_session.to_dict()
            session_dict['patient'] = {
                'id': str(patient.id),
                'name': patient.full_name,
                'phone': patient.phone
            }
            
            if voucher:
                session_dict['voucher'] = {
                    'code': voucher.code,
                    'sessions_remaining': voucher.sessions_total - voucher.sessions_used
                }
            
            return APIResponse.success(session_dict, 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar sessão da parceria: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

# Rotas de Vouchers

vouchers_bp = Blueprint('vouchers', __name__, url_prefix='/api/vouchers')

@vouchers_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def create_voucher():
    """
    Criar novo voucher
    
    Body:
        partnership_id: ID da parceria
        patient_id: ID do paciente
        voucher_type: Tipo do voucher
        sessions_total: Total de sessões
        value: Valor do voucher
        expiry_date: Data de expiração
        notes: Observações (opcional)
    
    Returns:
        Dados do voucher criado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        required_fields = [
            'partnership_id', 'patient_id', 'voucher_type',
            'sessions_total', 'value', 'expiry_date'
        ]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        with get_db_session() as session:
            # Verificar se parceria existe
            partnership = session.query(Partnership).filter_by(
                id=data['partnership_id'],
                status=Partnership.PartnershipStatus.ACTIVE
            ).first()
            
            if not partnership:
                return APIResponse.not_found('Parceria não encontrada ou inativa')
            
            # Verificar se paciente existe
            patient = session.query(Patient).filter_by(
                id=data['patient_id']
            ).first()
            
            if not patient:
                return APIResponse.not_found('Paciente não encontrado')
            
            # Gerar código único do voucher
            voucher_code = CodeGenerator.generate_voucher_code()
            
            # Verificar se código já existe (muito improvável)
            while session.query(Voucher).filter_by(code=voucher_code).first():
                voucher_code = CodeGenerator.generate_voucher_code()
            
            # Validar tipo de voucher
            try:
                voucher_type = Voucher.VoucherType(data['voucher_type'].upper())
            except ValueError:
                return APIResponse.error('Tipo de voucher inválido', 400)
            
            # Criar voucher
            voucher = Voucher(
                code=voucher_code,
                partnership_id=data['partnership_id'],
                patient_id=data['patient_id'],
                voucher_type=voucher_type,
                sessions_total=data['sessions_total'],
                sessions_used=0,
                value=Decimal(str(data['value'])),
                expiry_date=datetime.fromisoformat(data['expiry_date']),
                notes=data.get('notes'),
                status=Voucher.VoucherStatus.ACTIVE,
                created_by=current_user.id
            )
            
            session.add(voucher)
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='VOUCHER_CREATED',
                description=f'Voucher criado: {voucher.code}',
                level='INFO',
                entity_type='Voucher',
                entity_id=str(voucher.id),
                new_data=voucher.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Retornar dados do voucher
            voucher_dict = voucher.to_dict()
            voucher_dict['partnership'] = {
                'id': str(partnership.id),
                'partner_name': partnership.partner_name,
                'business_name': partnership.business_name
            }
            voucher_dict['patient'] = {
                'id': str(patient.id),
                'name': patient.full_name,
                'phone': patient.phone
            }
            
            return APIResponse.success(voucher_dict, 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar voucher: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@vouchers_bp.route('/<string:voucher_code>/validate', methods=['GET'])
@require_auth
def validate_voucher(voucher_code):
    """
    Validar voucher
    
    Path Parameters:
        voucher_code: Código do voucher
    
    Returns:
        Status de validade do voucher
    """
    try:
        with get_db_session() as session:
            voucher = session.query(Voucher).filter_by(
                code=voucher_code.upper()
            ).first()
            
            if not voucher:
                return APIResponse.error('Voucher não encontrado', 404)
            
            # Verificar status
            is_valid = True
            reasons = []
            
            if voucher.status != Voucher.VoucherStatus.ACTIVE:
                is_valid = False
                reasons.append(f'Status: {voucher.status.value}')
            
            if voucher.expiry_date < datetime.utcnow():
                is_valid = False
                reasons.append('Voucher expirado')
            
            if voucher.sessions_used >= voucher.sessions_total:
                is_valid = False
                reasons.append('Todas as sessões já foram utilizadas')
            
            # Verificar se parceria está ativa
            partnership = session.query(Partnership).filter_by(
                id=voucher.partnership_id
            ).first()
            
            if not partnership or partnership.status != Partnership.PartnershipStatus.ACTIVE:
                is_valid = False
                reasons.append('Parceria inativa')
            
            return APIResponse.success({
                'voucher_code': voucher.code,
                'is_valid': is_valid,
                'reasons': reasons if not is_valid else [],
                'sessions_remaining': voucher.sessions_total - voucher.sessions_used,
                'expiry_date': voucher.expiry_date.isoformat(),
                'partnership': {
                    'partner_name': partnership.partner_name if partnership else None,
                    'business_name': partnership.business_name if partnership else None
                } if partnership else None
            })
    
    except Exception as e:
        logger.error(f"Erro ao validar voucher: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

# Registrar blueprints
def register_partnership_blueprints(app):
    """
    Registrar blueprints de parcerias
    """
    app.register_blueprint(partnerships_bp)
    app.register_blueprint(vouchers_bp)