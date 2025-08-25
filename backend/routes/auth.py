# -*- coding: utf-8 -*-
"""
Routes de Autenticação - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas à autenticação,
incluindo login, registro, 2FA, recuperação de senha e validação
de tokens JWT.

Endpoints:
- POST /auth/login - Login de usuário
- POST /auth/register - Registro de novo usuário
- POST /auth/logout - Logout de usuário
- POST /auth/refresh - Renovar token JWT
- POST /auth/forgot-password - Solicitar recuperação de senha
- POST /auth/reset-password - Redefinir senha
- POST /auth/verify-email - Verificar e-mail
- POST /auth/resend-verification - Reenviar verificação
- POST /auth/enable-2fa - Habilitar 2FA
- POST /auth/verify-2fa - Verificar código 2FA
- POST /auth/disable-2fa - Desabilitar 2FA
- GET /auth/me - Obter dados do usuário logado
- POST /auth/change-password - Alterar senha
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import pyotp
import qrcode
from io import BytesIO
import base64

from ..models import User, AuditLog
from ..database import get_db_session
from ..utils.security import (
    SecurityManager, generate_jwt_token, verify_jwt_token,
    require_auth, validate_password_strength
)
from ..utils.response import APIResponse
from ..utils.validators import ContactValidator, DocumentValidator
from ..utils.helpers import CodeGenerator
from ..utils.logger import get_logger

# Criar blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
logger = get_logger(__name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint de login de usuário
    
    Body:
        email: E-mail do usuário
        password: Senha do usuário
        remember_me: Manter logado (opcional)
        totp_code: Código 2FA (se habilitado)
    
    Returns:
        Token JWT e dados do usuário
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data or not data.get('email') or not data.get('password'):
            return APIResponse.error('E-mail e senha são obrigatórios', 400)
        
        email = data['email'].lower().strip()
        password = data['password']
        remember_me = data.get('remember_me', False)
        totp_code = data.get('totp_code')
        
        # Validar formato do e-mail
        email_validation = ContactValidator.validate_email(email)
        if not email_validation['valid']:
            return APIResponse.error(email_validation['error'], 400)
        
        with get_db_session() as session:
            # Buscar usuário
            user = session.query(User).filter_by(
                email=email_validation['normalized']
            ).first()
            
            if not user:
                # Log tentativa de login inválida
                AuditLog.create_log(
                    session=session,
                    action_type='LOGIN_FAILED',
                    description=f'Tentativa de login com e-mail inexistente: {email}',
                    level='WARNING',
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                return APIResponse.error('Credenciais inválidas', 401)
            
            # Verificar se usuário está ativo
            if not user.is_active:
                AuditLog.create_log(
                    session=session,
                    user_id=user.id,
                    action_type='LOGIN_FAILED',
                    description='Tentativa de login com usuário inativo',
                    level='WARNING',
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                return APIResponse.error('Usuário inativo', 401)
            
            # Verificar senha
            if not check_password_hash(user.password_hash, password):
                # Incrementar tentativas de login
                user.failed_login_attempts += 1
                user.last_failed_login = datetime.utcnow()
                
                # Bloquear usuário após muitas tentativas
                if user.failed_login_attempts >= 5:
                    user.is_locked = True
                    user.locked_until = datetime.utcnow() + timedelta(minutes=30)
                
                session.commit()
                
                AuditLog.create_log(
                    session=session,
                    user_id=user.id,
                    action_type='LOGIN_FAILED',
                    description='Senha incorreta',
                    level='WARNING',
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                
                return APIResponse.error('Credenciais inválidas', 401)
            
            # Verificar se usuário está bloqueado
            if user.is_locked:
                if user.locked_until and datetime.utcnow() < user.locked_until:
                    return APIResponse.error(
                        f'Usuário bloqueado até {user.locked_until.strftime("%H:%M")}',
                        401
                    )
                else:
                    # Desbloquear usuário
                    user.is_locked = False
                    user.locked_until = None
            
            # Verificar 2FA se habilitado
            if user.two_factor_enabled:
                if not totp_code:
                    return APIResponse.error('Código 2FA é obrigatório', 400)
                
                # Verificar código TOTP
                totp = pyotp.TOTP(user.two_factor_secret)
                if not totp.verify(totp_code, valid_window=1):
                    AuditLog.create_log(
                        session=session,
                        user_id=user.id,
                        action_type='LOGIN_FAILED',
                        description='Código 2FA inválido',
                        level='WARNING',
                        ip_address=request.remote_addr,
                        user_agent=request.headers.get('User-Agent')
                    )
                    return APIResponse.error('Código 2FA inválido', 401)
            
            # Login bem-sucedido
            user.failed_login_attempts = 0
            user.last_login = datetime.utcnow()
            user.login_count += 1
            
            # Gerar token JWT
            token_expiry = timedelta(days=7 if remember_me else hours=8)
            token = generate_jwt_token({
                'user_id': str(user.id),
                'email': user.email,
                'role': user.role.value,
                'exp': datetime.utcnow() + token_expiry
            })
            
            session.commit()
            
            # Log login bem-sucedido
            AuditLog.create_log(
                session=session,
                user_id=user.id,
                action_type='LOGIN_SUCCESS',
                description='Login realizado com sucesso',
                level='INFO',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({
                'token': token,
                'user': user.to_dict(),
                'expires_in': int(token_expiry.total_seconds())
            })
    
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Endpoint de registro de novo usuário
    
    Body:
        name: Nome completo
        email: E-mail
        password: Senha
        confirm_password: Confirmação da senha
        phone: Telefone
        cpf: CPF (para fisioterapeutas)
        crefito: CREFITO (para fisioterapeutas)
        role: Tipo de usuário (opcional, padrão: PACIENTE)
    
    Returns:
        Dados do usuário criado
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['name', 'email', 'password', 'confirm_password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Validar confirmação de senha
        if data['password'] != data['confirm_password']:
            return APIResponse.error('Senhas não coincidem', 400)
        
        # Validar força da senha
        password_validation = validate_password_strength(data['password'])
        if not password_validation['valid']:
            return APIResponse.error(password_validation['message'], 400)
        
        # Validar e-mail
        email_validation = ContactValidator.validate_email(data['email'])
        if not email_validation['valid']:
            return APIResponse.error(email_validation['error'], 400)
        
        # Validar telefone se fornecido
        if data.get('phone'):
            phone_validation = ContactValidator.validate_phone(data['phone'])
            if not phone_validation['valid']:
                return APIResponse.error(phone_validation['error'], 400)
        
        with get_db_session() as session:
            # Verificar se e-mail já existe
            existing_user = session.query(User).filter_by(
                email=email_validation['normalized']
            ).first()
            
            if existing_user:
                return APIResponse.error('E-mail já cadastrado', 409)
            
            # Validar CPF se fornecido
            if data.get('cpf'):
                cpf_validation = DocumentValidator.validate_cpf(data['cpf'])
                if not cpf_validation['valid']:
                    return APIResponse.error(cpf_validation['error'], 400)
                
                # Verificar se CPF já existe
                existing_cpf = session.query(User).filter_by(
                    cpf=cpf_validation['formatted']
                ).first()
                
                if existing_cpf:
                    return APIResponse.error('CPF já cadastrado', 409)
            
            # Validar CREFITO se fornecido
            if data.get('crefito'):
                crefito_validation = DocumentValidator.validate_crefito(data['crefito'])
                if not crefito_validation['valid']:
                    return APIResponse.error(crefito_validation['error'], 400)
                
                # Verificar se CREFITO já existe
                existing_crefito = session.query(User).filter_by(
                    crefito=crefito_validation['formatted']
                ).first()
                
                if existing_crefito:
                    return APIResponse.error('CREFITO já cadastrado', 409)
            
            # Criar novo usuário
            user = User(
                name=data['name'].strip(),
                email=email_validation['normalized'],
                password_hash=generate_password_hash(data['password']),
                phone=phone_validation['formatted'] if data.get('phone') else None,
                cpf=cpf_validation['formatted'] if data.get('cpf') else None,
                crefito=crefito_validation['formatted'] if data.get('crefito') else None,
                role=User.UserRole(data.get('role', 'PACIENTE')),
                is_active=True,
                email_verified=False,
                verification_token=CodeGenerator.generate_secure_token()
            )
            
            session.add(user)
            session.commit()
            
            # Log registro
            AuditLog.create_log(
                session=session,
                user_id=user.id,
                action_type='USER_CREATED',
                description=f'Usuário registrado: {user.email}',
                level='INFO',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # TODO: Enviar e-mail de verificação
            
            return APIResponse.success({
                'user': user.to_dict(),
                'message': 'Usuário criado com sucesso. Verifique seu e-mail.'
            }, 201)
    
    except Exception as e:
        logger.error(f"Erro no registro: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """
    Endpoint de logout
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        Confirmação de logout
    """
    try:
        user = request.current_user
        
        with get_db_session() as session:
            # Log logout
            AuditLog.create_log(
                session=session,
                user_id=user.id,
                action_type='LOGOUT',
                description='Logout realizado',
                level='INFO',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
        
        # TODO: Invalidar token (implementar blacklist)
        
        return APIResponse.success({'message': 'Logout realizado com sucesso'})
    
    except Exception as e:
        logger.error(f"Erro no logout: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/refresh', methods=['POST'])
@require_auth
def refresh_token():
    """
    Endpoint para renovar token JWT
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        Novo token JWT
    """
    try:
        user = request.current_user
        
        # Gerar novo token
        token = generate_jwt_token({
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role.value,
            'exp': datetime.utcnow() + timedelta(hours=8)
        })
        
        return APIResponse.success({
            'token': token,
            'expires_in': 8 * 3600  # 8 horas em segundos
        })
    
    except Exception as e:
        logger.error(f"Erro na renovação do token: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """
    Endpoint para obter dados do usuário logado
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        Dados do usuário
    """
    try:
        user = request.current_user
        return APIResponse.success({'user': user.to_dict()})
    
    except Exception as e:
        logger.error(f"Erro ao obter usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/enable-2fa', methods=['POST'])
@require_auth
def enable_2fa():
    """
    Endpoint para habilitar 2FA
    
    Headers:
        Authorization: Bearer <token>
    
    Returns:
        QR Code e chave secreta para configurar 2FA
    """
    try:
        user = request.current_user
        
        if user.two_factor_enabled:
            return APIResponse.error('2FA já está habilitado', 400)
        
        # Gerar chave secreta
        secret = pyotp.random_base32()
        
        # Gerar QR Code
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name='FisioFlow'
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_code = base64.b64encode(buffer.getvalue()).decode()
        
        with get_db_session() as session:
            # Salvar chave secreta temporariamente
            db_user = session.query(User).filter_by(id=user.id).first()
            db_user.two_factor_secret = secret
            session.commit()
        
        return APIResponse.success({
            'secret': secret,
            'qr_code': f'data:image/png;base64,{qr_code}',
            'message': 'Configure o 2FA no seu app e confirme com um código'
        })
    
    except Exception as e:
        logger.error(f"Erro ao habilitar 2FA: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/verify-2fa', methods=['POST'])
@require_auth
def verify_2fa():
    """
    Endpoint para verificar e confirmar 2FA
    
    Headers:
        Authorization: Bearer <token>
    
    Body:
        code: Código TOTP do app
    
    Returns:
        Confirmação de ativação do 2FA
    """
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data or not data.get('code'):
            return APIResponse.error('Código é obrigatório', 400)
        
        if not user.two_factor_secret:
            return APIResponse.error('2FA não foi iniciado', 400)
        
        # Verificar código
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(data['code'], valid_window=1):
            return APIResponse.error('Código inválido', 400)
        
        with get_db_session() as session:
            # Ativar 2FA
            db_user = session.query(User).filter_by(id=user.id).first()
            db_user.two_factor_enabled = True
            session.commit()
            
            # Log ativação 2FA
            AuditLog.create_log(
                session=session,
                user_id=user.id,
                action_type='2FA_ENABLED',
                description='2FA habilitado',
                level='INFO',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
        
        return APIResponse.success({
            'message': '2FA ativado com sucesso'
        })
    
    except Exception as e:
        logger.error(f"Erro ao verificar 2FA: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/disable-2fa', methods=['POST'])
@require_auth
def disable_2fa():
    """
    Endpoint para desabilitar 2FA
    
    Headers:
        Authorization: Bearer <token>
    
    Body:
        password: Senha atual
        code: Código TOTP atual
    
    Returns:
        Confirmação de desativação do 2FA
    """
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data or not data.get('password') or not data.get('code'):
            return APIResponse.error('Senha e código são obrigatórios', 400)
        
        if not user.two_factor_enabled:
            return APIResponse.error('2FA não está habilitado', 400)
        
        # Verificar senha
        if not check_password_hash(user.password_hash, data['password']):
            return APIResponse.error('Senha incorreta', 401)
        
        # Verificar código 2FA
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(data['code'], valid_window=1):
            return APIResponse.error('Código 2FA inválido', 401)
        
        with get_db_session() as session:
            # Desativar 2FA
            db_user = session.query(User).filter_by(id=user.id).first()
            db_user.two_factor_enabled = False
            db_user.two_factor_secret = None
            session.commit()
            
            # Log desativação 2FA
            AuditLog.create_log(
                session=session,
                user_id=user.id,
                action_type='2FA_DISABLED',
                description='2FA desabilitado',
                level='WARNING',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
        
        return APIResponse.success({
            'message': '2FA desativado com sucesso'
        })
    
    except Exception as e:
        logger.error(f"Erro ao desabilitar 2FA: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    """
    Endpoint para alterar senha
    
    Headers:
        Authorization: Bearer <token>
    
    Body:
        current_password: Senha atual
        new_password: Nova senha
        confirm_password: Confirmação da nova senha
    
    Returns:
        Confirmação de alteração
    """
    try:
        user = request.current_user
        data = request.get_json()
        
        required_fields = ['current_password', 'new_password', 'confirm_password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Verificar senha atual
        if not check_password_hash(user.password_hash, data['current_password']):
            return APIResponse.error('Senha atual incorreta', 401)
        
        # Validar confirmação
        if data['new_password'] != data['confirm_password']:
            return APIResponse.error('Senhas não coincidem', 400)
        
        # Validar força da nova senha
        password_validation = validate_password_strength(data['new_password'])
        if not password_validation['valid']:
            return APIResponse.error(password_validation['message'], 400)
        
        with get_db_session() as session:
            # Alterar senha
            db_user = session.query(User).filter_by(id=user.id).first()
            db_user.password_hash = generate_password_hash(data['new_password'])
            db_user.password_changed_at = datetime.utcnow()
            session.commit()
            
            # Log alteração de senha
            AuditLog.create_log(
                session=session,
                user_id=user.id,
                action_type='PASSWORD_CHANGED',
                description='Senha alterada',
                level='INFO',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
        
        return APIResponse.success({
            'message': 'Senha alterada com sucesso'
        })
    
    except Exception as e:
        logger.error(f"Erro ao alterar senha: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)