# -*- coding: utf-8 -*-
"""
Utilitários de Segurança - FisioFlow Backend

Este módulo contém funções e classes para garantir a segurança
da aplicação, incluindo criptografia, validação, autenticação
e proteção contra ataques.
"""

import hashlib
import secrets
import re
import base64
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
from functools import wraps
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from flask import request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
import pyotp
import qrcode
import io
from PIL import Image

class SecurityManager:
    """Gerenciador de segurança da aplicação"""
    
    def __init__(self):
        self.encryption_key = None
        self._initialize_encryption()
    
    def _initialize_encryption(self):
        """Inicializar chave de criptografia"""
        try:
            # Usar chave do ambiente ou gerar uma nova
            key_string = current_app.config.get('ENCRYPTION_KEY')
            if key_string:
                self.encryption_key = key_string.encode()
            else:
                # Gerar chave baseada na SECRET_KEY
                secret_key = current_app.config['SECRET_KEY'].encode()
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=b'fisioflow_salt',
                    iterations=100000,
                )
                self.encryption_key = base64.urlsafe_b64encode(kdf.derive(secret_key))
        except Exception as e:
            # Fallback para desenvolvimento
            self.encryption_key = Fernet.generate_key()
    
    def encrypt_data(self, data: str) -> str:
        """Criptografar dados sensíveis"""
        try:
            f = Fernet(self.encryption_key)
            encrypted_data = f.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            raise ValueError(f"Erro ao criptografar dados: {str(e)}")
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Descriptografar dados sensíveis"""
        try:
            f = Fernet(self.encryption_key)
            decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = f.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            raise ValueError(f"Erro ao descriptografar dados: {str(e)}")
    
    def hash_password(self, password: str) -> str:
        """Hash de senha com salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return f"{salt}:{password_hash.hex()}"
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verificar senha"""
        try:
            salt, stored_hash = hashed_password.split(':')
            password_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                100000
            )
            return hmac.compare_digest(stored_hash, password_hash.hex())
        except Exception:
            return False
    
    def generate_token(self, length: int = 32) -> str:
        """Gerar token seguro"""
        return secrets.token_urlsafe(length)
    
    def generate_otp_secret(self) -> str:
        """Gerar segredo para OTP"""
        return pyotp.random_base32()
    
    def generate_qr_code(self, user_email: str, secret: str) -> bytes:
        """Gerar QR code para 2FA"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name="FisioFlow"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        return img_buffer.getvalue()
    
    def verify_otp(self, secret: str, token: str) -> bool:
        """Verificar token OTP"""
        try:
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=1)
        except Exception:
            return False

class InputValidator:
    """Validador de entrada de dados"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validar formato de email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validar formato de telefone brasileiro"""
        # Remove caracteres não numéricos
        phone_clean = re.sub(r'\D', '', phone)
        
        # Verifica se tem 10 ou 11 dígitos
        if len(phone_clean) not in [10, 11]:
            return False
        
        # Verifica se começa com código de área válido
        area_code = phone_clean[:2]
        valid_area_codes = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19',  # SP
            '21', '22', '24',  # RJ
            '27', '28',  # ES
            '31', '32', '33', '34', '35', '37', '38',  # MG
            '41', '42', '43', '44', '45', '46',  # PR
            '47', '48', '49',  # SC
            '51', '53', '54', '55',  # RS
            '61',  # DF
            '62', '64',  # GO
            '63',  # TO
            '65', '66',  # MT
            '67',  # MS
            '68',  # AC
            '69',  # RO
            '71', '73', '74', '75', '77',  # BA
            '79',  # SE
            '81', '87',  # PE
            '82',  # AL
            '83',  # PB
            '84',  # RN
            '85', '88',  # CE
            '86', '89',  # PI
            '91', '93', '94',  # PA
            '92', '97',  # AM
            '95',  # RR
            '96',  # AP
            '98', '99'  # MA
        ]
        
        return area_code in valid_area_codes
    
    @staticmethod
    def validate_cpf(cpf: str) -> bool:
        """Validar CPF"""
        # Remove caracteres não numéricos
        cpf_clean = re.sub(r'\D', '', cpf)
        
        # Verifica se tem 11 dígitos
        if len(cpf_clean) != 11:
            return False
        
        # Verifica se todos os dígitos são iguais
        if cpf_clean == cpf_clean[0] * 11:
            return False
        
        # Calcula primeiro dígito verificador
        sum1 = sum(int(cpf_clean[i]) * (10 - i) for i in range(9))
        digit1 = 11 - (sum1 % 11)
        if digit1 >= 10:
            digit1 = 0
        
        # Calcula segundo dígito verificador
        sum2 = sum(int(cpf_clean[i]) * (11 - i) for i in range(10))
        digit2 = 11 - (sum2 % 11)
        if digit2 >= 10:
            digit2 = 0
        
        # Verifica se os dígitos calculados conferem
        return cpf_clean[-2:] == f"{digit1}{digit2}"
    
    @staticmethod
    def validate_cnpj(cnpj: str) -> bool:
        """Validar CNPJ"""
        # Remove caracteres não numéricos
        cnpj_clean = re.sub(r'\D', '', cnpj)
        
        # Verifica se tem 14 dígitos
        if len(cnpj_clean) != 14:
            return False
        
        # Verifica se todos os dígitos são iguais
        if cnpj_clean == cnpj_clean[0] * 14:
            return False
        
        # Calcula primeiro dígito verificador
        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        sum1 = sum(int(cnpj_clean[i]) * weights1[i] for i in range(12))
        digit1 = 11 - (sum1 % 11)
        if digit1 >= 10:
            digit1 = 0
        
        # Calcula segundo dígito verificador
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        sum2 = sum(int(cnpj_clean[i]) * weights2[i] for i in range(13))
        digit2 = 11 - (sum2 % 11)
        if digit2 >= 10:
            digit2 = 0
        
        # Verifica se os dígitos calculados conferem
        return cnpj_clean[-2:] == f"{digit1}{digit2}"
    
    @staticmethod
    def validate_crefito(crefito: str) -> bool:
        """Validar número CREFITO (formato: CREFITO-X/XXXXXX)"""
        pattern = r'^CREFITO-\d{1,2}/\d{6}$'
        return bool(re.match(pattern, crefito.upper()))
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validar força da senha"""
        result = {
            'is_valid': True,
            'score': 0,
            'errors': [],
            'suggestions': []
        }
        
        # Verificações básicas
        if len(password) < 8:
            result['errors'].append('Senha deve ter pelo menos 8 caracteres')
            result['is_valid'] = False
        else:
            result['score'] += 1
        
        if not re.search(r'[a-z]', password):
            result['errors'].append('Senha deve conter pelo menos uma letra minúscula')
            result['is_valid'] = False
        else:
            result['score'] += 1
        
        if not re.search(r'[A-Z]', password):
            result['errors'].append('Senha deve conter pelo menos uma letra maiúscula')
            result['is_valid'] = False
        else:
            result['score'] += 1
        
        if not re.search(r'\d', password):
            result['errors'].append('Senha deve conter pelo menos um número')
            result['is_valid'] = False
        else:
            result['score'] += 1
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            result['suggestions'].append('Considere adicionar caracteres especiais para maior segurança')
        else:
            result['score'] += 1
        
        # Verificações avançadas
        if len(password) >= 12:
            result['score'] += 1
        
        # Verificar padrões comuns
        common_patterns = [
            r'123456', r'password', r'qwerty', r'abc123',
            r'admin', r'fisio', r'clinica'
        ]
        
        for pattern in common_patterns:
            if re.search(pattern, password.lower()):
                result['errors'].append('Senha contém padrões comuns')
                result['is_valid'] = False
                break
        
        return result
    
    @staticmethod
    def sanitize_input(input_str: str) -> str:
        """Sanitizar entrada de dados"""
        if not isinstance(input_str, str):
            return str(input_str)
        
        # Remove caracteres perigosos
        sanitized = re.sub(r'[<>"\'\/]', '', input_str)
        
        # Remove espaços extras
        sanitized = ' '.join(sanitized.split())
        
        return sanitized.strip()

class RateLimiter:
    """Limitador de taxa de requisições"""
    
    def __init__(self):
        self.requests = {}
        self.blocked_ips = {}
    
    def is_allowed(self, identifier: str, limit: int = 100, window: int = 3600) -> bool:
        """Verificar se requisição é permitida"""
        now = datetime.now()
        
        # Verificar se IP está bloqueado
        if identifier in self.blocked_ips:
            if now < self.blocked_ips[identifier]:
                return False
            else:
                del self.blocked_ips[identifier]
        
        # Limpar requisições antigas
        if identifier in self.requests:
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if now - req_time < timedelta(seconds=window)
            ]
        else:
            self.requests[identifier] = []
        
        # Verificar limite
        if len(self.requests[identifier]) >= limit:
            # Bloquear por 1 hora
            self.blocked_ips[identifier] = now + timedelta(hours=1)
            return False
        
        # Adicionar requisição atual
        self.requests[identifier].append(now)
        return True
    
    def block_ip(self, ip: str, duration_hours: int = 24):
        """Bloquear IP por período específico"""
        self.blocked_ips[ip] = datetime.now() + timedelta(hours=duration_hours)

class SecurityHeaders:
    """Gerenciador de cabeçalhos de segurança"""
    
    @staticmethod
    def add_security_headers(response):
        """Adicionar cabeçalhos de segurança"""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = (
            "geolocation=(), microphone=(), camera=()"
        )
        return response

# Decoradores de segurança
def require_auth(f):
    """Decorator para exigir autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Token de acesso inválido ou expirado',
                'error': str(e)
            }), 401
    return decorated_function

def require_role(allowed_roles: List[str]):
    """Decorator para exigir papel específico"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                
                # Importar aqui para evitar importação circular
                from database import User
                user = User.query.get(current_user_id)
                
                if not user or user.role.value not in allowed_roles:
                    return jsonify({
                        'success': False,
                        'message': 'Acesso negado. Permissões insuficientes.'
                    }), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': 'Erro de autorização',
                    'error': str(e)
                }), 401
        return decorated_function
    return decorator

def rate_limit(limit: int = 100, window: int = 3600):
    """Decorator para limitação de taxa"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Obter identificador (IP ou usuário)
            identifier = request.remote_addr
            
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                identifier = f"user_{user_id}"
            except:
                pass
            
            # Verificar rate limit
            rate_limiter = current_app.rate_limiter
            if not rate_limiter.is_allowed(identifier, limit, window):
                return jsonify({
                    'success': False,
                    'message': 'Muitas requisições. Tente novamente mais tarde.'
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_input(schema: Dict[str, Any]):
    """Decorator para validação de entrada"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                data = request.get_json()
                if not data:
                    return jsonify({
                        'success': False,
                        'message': 'Dados JSON são obrigatórios'
                    }), 400
                
                # Validar campos obrigatórios
                for field, rules in schema.items():
                    if rules.get('required', False) and field not in data:
                        return jsonify({
                            'success': False,
                            'message': f'Campo {field} é obrigatório'
                        }), 400
                    
                    if field in data:
                        value = data[field]
                        
                        # Validar tipo
                        if 'type' in rules and not isinstance(value, rules['type']):
                            return jsonify({
                                'success': False,
                                'message': f'Campo {field} deve ser do tipo {rules["type"].__name__}'
                            }), 400
                        
                        # Validar tamanho mínimo
                        if 'min_length' in rules and len(str(value)) < rules['min_length']:
                            return jsonify({
                                'success': False,
                                'message': f'Campo {field} deve ter pelo menos {rules["min_length"]} caracteres'
                            }), 400
                        
                        # Validar tamanho máximo
                        if 'max_length' in rules and len(str(value)) > rules['max_length']:
                            return jsonify({
                                'success': False,
                                'message': f'Campo {field} deve ter no máximo {rules["max_length"]} caracteres'
                            }), 400
                        
                        # Sanitizar entrada
                        if isinstance(value, str):
                            data[field] = InputValidator.sanitize_input(value)
                
                # Adicionar dados validados ao request
                request.validated_data = data
                
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': 'Erro na validação dos dados',
                    'error': str(e)
                }), 400
        return decorated_function
    return decorator

# Instância global do gerenciador de segurança
security_manager = SecurityManager()
input_validator = InputValidator()
rate_limiter = RateLimiter()
security_headers = SecurityHeaders()