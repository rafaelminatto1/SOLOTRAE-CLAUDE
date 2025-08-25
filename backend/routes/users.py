# -*- coding: utf-8 -*-
"""
Routes de Usuários - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas ao gerenciamento
de usuários, incluindo CRUD, perfis, busca e administração.

Endpoints:
- GET /users - Listar usuários (com filtros e paginação)
- POST /users - Criar novo usuário (admin)
- GET /users/{id} - Obter usuário específico
- PUT /users/{id} - Atualizar usuário
- DELETE /users/{id} - Excluir usuário (soft delete)
- GET /users/{id}/profile - Obter perfil completo
- PUT /users/{id}/profile - Atualizar perfil
- POST /users/{id}/avatar - Upload de avatar
- GET /users/search - Buscar usuários
- POST /users/{id}/activate - Ativar usuário
- POST /users/{id}/deactivate - Desativar usuário
- GET /users/stats - Estatísticas de usuários
"""

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_, and_, func
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename

from ..models import User, AuditLog
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import ContactValidator, DocumentValidator, DataValidator
from ..utils.helpers import FileHelper, CodeGenerator
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
users_bp = Blueprint('users', __name__, url_prefix='/api/users')
logger = get_logger(__name__)

@users_bp.route('', methods=['GET'])
@require_auth
def list_users():
    """
    Listar usuários com filtros e paginação
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20, máx: 100)
        role: Filtrar por tipo de usuário
        active: Filtrar por status ativo (true/false)
        search: Buscar por nome ou e-mail
        sort_by: Campo para ordenação (name, email, created_at)
        sort_order: Ordem (asc/desc)
    
    Returns:
        Lista paginada de usuários
    """
    try:
        current_user = request.current_user
        
        # Verificar permissões
        if current_user.role not in [User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA]:
            return APIResponse.forbidden('Acesso negado')
        
        # Obter parâmetros de paginação e filtros
        pagination = PaginationHelper.get_pagination_params(request)
        
        role_filter = request.args.get('role')
        active_filter = request.args.get('active')
        search_term = request.args.get('search', '').strip()
        
        with get_db_session() as session:
            # Construir query base
            query = session.query(User)
            
            # Aplicar filtros
            if role_filter:
                try:
                    role_enum = User.UserRole(role_filter.upper())
                    query = query.filter(User.role == role_enum)
                except ValueError:
                    return APIResponse.error('Tipo de usuário inválido', 400)
            
            if active_filter is not None:
                is_active = active_filter.lower() == 'true'
                query = query.filter(User.is_active == is_active)
            
            if search_term:
                search_pattern = f'%{search_term}%'
                query = query.filter(
                    or_(
                        User.name.ilike(search_pattern),
                        User.email.ilike(search_pattern),
                        User.cpf.ilike(search_pattern)
                    )
                )
            
            # Aplicar ordenação
            sort_by = request.args.get('sort_by', 'created_at')
            sort_order = request.args.get('sort_order', 'desc')
            
            if hasattr(User, sort_by):
                order_column = getattr(User, sort_by)
                if sort_order.lower() == 'desc':
                    query = query.order_by(order_column.desc())
                else:
                    query = query.order_by(order_column.asc())
            
            # Aplicar paginação
            total = query.count()
            users = query.offset(
                (pagination['page'] - 1) * pagination['per_page']
            ).limit(pagination['per_page']).all()
            
            # Serializar usuários
            users_data = [user.to_dict() for user in users]
            
            return APIResponse.paginated(
                data=users_data,
                page=pagination['page'],
                per_page=pagination['per_page'],
                total=total
            )
    
    except Exception as e:
        logger.error(f"Erro ao listar usuários: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@users_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN])
def create_user():
    """
    Criar novo usuário (apenas admin)
    
    Body:
        name: Nome completo
        email: E-mail
        password: Senha
        phone: Telefone (opcional)
        cpf: CPF (opcional)
        crefito: CREFITO (opcional)
        role: Tipo de usuário
        is_active: Status ativo (opcional, padrão: true)
    
    Returns:
        Dados do usuário criado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar dados obrigatórios
        required_fields = ['name', 'email', 'password', 'role']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Validar e-mail
        email_validation = ContactValidator.validate_email(data['email'])
        if not email_validation['valid']:
            return APIResponse.error(email_validation['error'], 400)
        
        # Validar telefone se fornecido
        phone_validation = None
        if data.get('phone'):
            phone_validation = ContactValidator.validate_phone(data['phone'])
            if not phone_validation['valid']:
                return APIResponse.error(phone_validation['error'], 400)
        
        # Validar CPF se fornecido
        cpf_validation = None
        if data.get('cpf'):
            cpf_validation = DocumentValidator.validate_cpf(data['cpf'])
            if not cpf_validation['valid']:
                return APIResponse.error(cpf_validation['error'], 400)
        
        # Validar CREFITO se fornecido
        crefito_validation = None
        if data.get('crefito'):
            crefito_validation = DocumentValidator.validate_crefito(data['crefito'])
            if not crefito_validation['valid']:
                return APIResponse.error(crefito_validation['error'], 400)
        
        # Validar role
        try:
            role_enum = User.UserRole(data['role'].upper())
        except ValueError:
            return APIResponse.error('Tipo de usuário inválido', 400)
        
        with get_db_session() as session:
            # Verificar se e-mail já existe
            existing_user = session.query(User).filter_by(
                email=email_validation['normalized']
            ).first()
            
            if existing_user:
                return APIResponse.error('E-mail já cadastrado', 409)
            
            # Verificar CPF se fornecido
            if cpf_validation:
                existing_cpf = session.query(User).filter_by(
                    cpf=cpf_validation['formatted']
                ).first()
                
                if existing_cpf:
                    return APIResponse.error('CPF já cadastrado', 409)
            
            # Verificar CREFITO se fornecido
            if crefito_validation:
                existing_crefito = session.query(User).filter_by(
                    crefito=crefito_validation['formatted']
                ).first()
                
                if existing_crefito:
                    return APIResponse.error('CREFITO já cadastrado', 409)
            
            # Criar usuário
            user = User(
                name=data['name'].strip(),
                email=email_validation['normalized'],
                password_hash=generate_password_hash(data['password']),
                phone=phone_validation['formatted'] if phone_validation else None,
                cpf=cpf_validation['formatted'] if cpf_validation else None,
                crefito=crefito_validation['formatted'] if crefito_validation else None,
                role=role_enum,
                is_active=data.get('is_active', True),
                email_verified=True,  # Admin pode criar usuários já verificados
                created_by=current_user.id
            )
            
            session.add(user)
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='USER_CREATED',
                description=f'Usuário criado pelo admin: {user.email}',
                level='INFO',
                entity_type='User',
                entity_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success(user.to_dict(), 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@users_bp.route('/<uuid:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    """
    Obter usuário específico
    
    Path Parameters:
        user_id: ID do usuário
    
    Returns:
        Dados do usuário
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            
            if not user:
                return APIResponse.not_found('Usuário não encontrado')
            
            # Verificar permissões
            if (current_user.id != user.id and 
                current_user.role not in [User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA]):
                return APIResponse.forbidden('Acesso negado')
            
            return APIResponse.success(user.to_dict())
    
    except Exception as e:
        logger.error(f"Erro ao obter usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@users_bp.route('/<uuid:user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """
    Atualizar usuário
    
    Path Parameters:
        user_id: ID do usuário
    
    Body:
        name: Nome completo (opcional)
        email: E-mail (opcional)
        phone: Telefone (opcional)
        cpf: CPF (opcional)
        crefito: CREFITO (opcional)
        is_active: Status ativo (apenas admin)
    
    Returns:
        Dados do usuário atualizado
    """
    try:
        current_user = request.current_user
        data = request.get_json()
        
        if not data:
            return APIResponse.error('Dados não fornecidos', 400)
        
        with get_db_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            
            if not user:
                return APIResponse.not_found('Usuário não encontrado')
            
            # Verificar permissões
            if (current_user.id != user.id and 
                current_user.role != User.UserRole.ADMIN):
                return APIResponse.forbidden('Acesso negado')
            
            # Dados anteriores para auditoria
            old_data = user.to_dict()
            
            # Atualizar campos permitidos
            if 'name' in data:
                user.name = data['name'].strip()
            
            if 'email' in data:
                email_validation = ContactValidator.validate_email(data['email'])
                if not email_validation['valid']:
                    return APIResponse.error(email_validation['error'], 400)
                
                # Verificar se e-mail já existe
                existing_user = session.query(User).filter(
                    and_(
                        User.email == email_validation['normalized'],
                        User.id != user.id
                    )
                ).first()
                
                if existing_user:
                    return APIResponse.error('E-mail já cadastrado', 409)
                
                user.email = email_validation['normalized']
                user.email_verified = False  # Requer nova verificação
            
            if 'phone' in data:
                if data['phone']:
                    phone_validation = ContactValidator.validate_phone(data['phone'])
                    if not phone_validation['valid']:
                        return APIResponse.error(phone_validation['error'], 400)
                    user.phone = phone_validation['formatted']
                else:
                    user.phone = None
            
            if 'cpf' in data:
                if data['cpf']:
                    cpf_validation = DocumentValidator.validate_cpf(data['cpf'])
                    if not cpf_validation['valid']:
                        return APIResponse.error(cpf_validation['error'], 400)
                    
                    # Verificar se CPF já existe
                    existing_cpf = session.query(User).filter(
                        and_(
                            User.cpf == cpf_validation['formatted'],
                            User.id != user.id
                        )
                    ).first()
                    
                    if existing_cpf:
                        return APIResponse.error('CPF já cadastrado', 409)
                    
                    user.cpf = cpf_validation['formatted']
                else:
                    user.cpf = None
            
            if 'crefito' in data:
                if data['crefito']:
                    crefito_validation = DocumentValidator.validate_crefito(data['crefito'])
                    if not crefito_validation['valid']:
                        return APIResponse.error(crefito_validation['error'], 400)
                    
                    # Verificar se CREFITO já existe
                    existing_crefito = session.query(User).filter(
                        and_(
                            User.crefito == crefito_validation['formatted'],
                            User.id != user.id
                        )
                    ).first()
                    
                    if existing_crefito:
                        return APIResponse.error('CREFITO já cadastrado', 409)
                    
                    user.crefito = crefito_validation['formatted']
                else:
                    user.crefito = None
            
            # Apenas admin pode alterar status
            if 'is_active' in data and current_user.role == User.UserRole.ADMIN:
                user.is_active = bool(data['is_active'])
            
            user.updated_at = datetime.utcnow()
            session.commit()
            
            # Log atualização
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='USER_UPDATED',
                description=f'Usuário atualizado: {user.email}',
                level='INFO',
                entity_type='User',
                entity_id=str(user.id),
                old_data=old_data,
                new_data=user.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success(user.to_dict())
    
    except Exception as e:
        logger.error(f"Erro ao atualizar usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@users_bp.route('/<uuid:user_id>', methods=['DELETE'])
@require_auth
@require_role([User.UserRole.ADMIN])
def delete_user(user_id):
    """
    Excluir usuário (soft delete)
    
    Path Parameters:
        user_id: ID do usuário
    
    Returns:
        Confirmação de exclusão
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            
            if not user:
                return APIResponse.not_found('Usuário não encontrado')
            
            if user.id == current_user.id:
                return APIResponse.error('Não é possível excluir seu próprio usuário', 400)
            
            # Soft delete
            user.is_active = False
            user.deleted_at = datetime.utcnow()
            user.deleted_by = current_user.id
            session.commit()
            
            # Log exclusão
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='USER_DELETED',
                description=f'Usuário excluído: {user.email}',
                level='WARNING',
                entity_type='User',
                entity_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({'message': 'Usuário excluído com sucesso'})
    
    except Exception as e:
        logger.error(f"Erro ao excluir usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@users_bp.route('/search', methods=['GET'])
@require_auth
def search_users():
    """
    Buscar usuários
    
    Query Parameters:
        q: Termo de busca
        role: Filtrar por tipo
        limit: Limite de resultados (padrão: 10)
    
    Returns:
        Lista de usuários encontrados
    """
    try:
        current_user = request.current_user
        
        # Verificar permissões
        if current_user.role not in [User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA]:
            return APIResponse.forbidden('Acesso negado')
        
        search_term = request.args.get('q', '').strip()
        role_filter = request.args.get('role')
        limit = min(int(request.args.get('limit', 10)), 50)
        
        if not search_term:
            return APIResponse.error('Termo de busca é obrigatório', 400)
        
        with get_db_session() as session:
            query = session.query(User).filter(User.is_active == True)
            
            # Aplicar busca
            search_pattern = f'%{search_term}%'
            query = query.filter(
                or_(
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.cpf.ilike(search_pattern)
                )
            )
            
            # Filtrar por role se especificado
            if role_filter:
                try:
                    role_enum = User.UserRole(role_filter.upper())
                    query = query.filter(User.role == role_enum)
                except ValueError:
                    pass
            
            users = query.limit(limit).all()
            
            return APIResponse.success({
                'users': [user.to_dict() for user in users],
                'total': len(users)
            })
    
    except Exception as e:
        logger.error(f"Erro na busca de usuários: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@users_bp.route('/stats', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def get_user_stats():
    """
    Obter estatísticas de usuários
    
    Returns:
        Estatísticas dos usuários
    """
    try:
        with get_db_session() as session:
            # Contadores por role
            role_stats = session.query(
                User.role,
                func.count(User.id).label('count')
            ).filter(User.is_active == True).group_by(User.role).all()
            
            # Usuários ativos/inativos
            active_count = session.query(User).filter(User.is_active == True).count()
            inactive_count = session.query(User).filter(User.is_active == False).count()
            
            # Novos usuários (últimos 30 dias)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            new_users = session.query(User).filter(
                User.created_at >= thirty_days_ago
            ).count()
            
            # Usuários com 2FA habilitado
            two_fa_enabled = session.query(User).filter(
                User.two_factor_enabled == True
            ).count()
            
            return APIResponse.success({
                'total_users': active_count + inactive_count,
                'active_users': active_count,
                'inactive_users': inactive_count,
                'new_users_30_days': new_users,
                'two_fa_enabled': two_fa_enabled,
                'by_role': {
                    role.value: count for role, count in role_stats
                }
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)