# -*- coding: utf-8 -*-
"""
Módulo de Utilitários - FisioFlow Backend

Este módulo contém funções e classes utilitárias reutilizáveis
usadas em todo o sistema FisioFlow.

Incluídos:
- Logger configurado
- Gerenciador de segurança
- Formatadores de resposta
- Validadores
- Helpers diversos
"""

from .logger import setup_logger, get_logger
from .security import SecurityManager, encrypt_data, decrypt_data, hash_password, verify_password
from .response import APIResponse
from .validators import validate_cpf, validate_email, validate_phone, validate_crefito
from .helpers import generate_uuid, format_currency, format_phone, sanitize_filename

__all__ = [
    # Logger
    'setup_logger',
    'get_logger',
    
    # Security
    'SecurityManager',
    'encrypt_data',
    'decrypt_data', 
    'hash_password',
    'verify_password',
    
    # Response
    'APIResponse',
    
    # Validators
    'validate_cpf',
    'validate_email',
    'validate_phone',
    'validate_crefito',
    
    # Helpers
    'generate_uuid',
    'format_currency',
    'format_phone',
    'sanitize_filename'
]