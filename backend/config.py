# -*- coding: utf-8 -*-
"""
Configuração - FisioFlow Backend

Este módulo contém todas as configurações da aplicação para diferentes
ambientes (desenvolvimento, produção, testes).

Configuração inclui:
- Configurações de banco de dados
- Chaves de segurança
- Configurações de email
- Configurações de upload
- Configurações de cache
- Configurações de logging
- Configurações de integrações
"""

import os
from datetime import timedelta
from pathlib import Path
from typing import Dict, Any, List

# Diretório base do projeto
BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    """
    Configuração base da aplicação
    """
    
    # Informações da aplicação
    APP_NAME = 'FisioFlow'
    VERSION = '1.0.0'
    DESCRIPTION = 'Sistema de Gestão para Clínicas de Fisioterapia'
    
    # Configurações básicas do Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'fisioflow-secret-key-change-in-production'
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # Configurações de sessão
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = 'fisioflow:'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Configurações de banco de dados
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{BASE_DIR}/fisioflow.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_RECORD_QUERIES = True
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0
    }
    
    # Configurações de Redis (Cache)
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = REDIS_URL
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Configurações de JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    
    # Configurações de email
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or MAIL_USERNAME
    MAIL_MAX_EMAILS = 100
    MAIL_SUPPRESS_SEND = False
    
    # Configurações de upload
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {
        'images': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
        'videos': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'},
        'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf'},
        'audio': {'mp3', 'wav', 'ogg', 'aac'}
    }
    
    # Configurações de segurança
    BCRYPT_LOG_ROUNDS = 12
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_NUMBERS = True
    PASSWORD_REQUIRE_SYMBOLS = True
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = REDIS_URL
    RATELIMIT_DEFAULT = '100 per hour'
    RATELIMIT_HEADERS_ENABLED = True
    
    # Configurações de CORS
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']
    CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With']
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    
    # Configurações de logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = BASE_DIR / 'logs' / 'fisioflow.log'
    LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5
    
    # Configurações de backup
    BACKUP_DIR = BASE_DIR / 'backups'
    BACKUP_RETENTION_DAYS = 30
    BACKUP_SCHEDULE = '0 2 * * *'  # Todo dia às 2h da manhã
    
    # Configurações de integrações
    
    # WhatsApp Business API
    WHATSAPP_API_URL = os.environ.get('WHATSAPP_API_URL')
    WHATSAPP_ACCESS_TOKEN = os.environ.get('WHATSAPP_ACCESS_TOKEN')
    WHATSAPP_PHONE_NUMBER_ID = os.environ.get('WHATSAPP_PHONE_NUMBER_ID')
    WHATSAPP_WEBHOOK_VERIFY_TOKEN = os.environ.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN')
    
    # Google Calendar
    GOOGLE_CALENDAR_CREDENTIALS_FILE = os.environ.get('GOOGLE_CALENDAR_CREDENTIALS_FILE')
    GOOGLE_CALENDAR_TOKEN_FILE = os.environ.get('GOOGLE_CALENDAR_TOKEN_FILE')
    GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar']
    
    # APIs externas
    VIACEP_API_URL = 'https://viacep.com.br/ws'
    CPF_VALIDATION_API_URL = os.environ.get('CPF_VALIDATION_API_URL')
    CNPJ_VALIDATION_API_URL = os.environ.get('CNPJ_VALIDATION_API_URL')
    CREFITO_VALIDATION_API_URL = os.environ.get('CREFITO_VALIDATION_API_URL')
    
    # Configurações de IA
    
    # OpenAI
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    OPENAI_MODEL = 'gpt-4'
    OPENAI_MAX_TOKENS = 2000
    OPENAI_TEMPERATURE = 0.7
    
    # Anthropic Claude
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    ANTHROPIC_MODEL = 'claude-3-sonnet-20240229'
    ANTHROPIC_MAX_TOKENS = 2000
    
    # Google Gemini
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = 'gemini-pro'
    
    # Perplexity
    PERPLEXITY_API_KEY = os.environ.get('PERPLEXITY_API_KEY')
    PERPLEXITY_MODEL = 'llama-3.1-sonar-large-128k-online'
    
    # Configurações de pagamento (para parcerias)
    STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    # PIX (para saques)
    PIX_API_URL = os.environ.get('PIX_API_URL')
    PIX_API_KEY = os.environ.get('PIX_API_KEY')
    PIX_CERTIFICATE_PATH = os.environ.get('PIX_CERTIFICATE_PATH')
    
    # Configurações de notificações push
    FCM_SERVER_KEY = os.environ.get('FCM_SERVER_KEY')
    FCM_SENDER_ID = os.environ.get('FCM_SENDER_ID')
    
    # Configurações de SMS
    SMS_PROVIDER = os.environ.get('SMS_PROVIDER', 'twilio')  # twilio, nexmo, etc.
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
    
    # Configurações de monitoramento
    SENTRY_DSN = os.environ.get('SENTRY_DSN')
    SENTRY_ENVIRONMENT = os.environ.get('SENTRY_ENVIRONMENT', 'development')
    
    # Configurações de performance
    SQLALCHEMY_POOL_SIZE = 10
    SQLALCHEMY_POOL_TIMEOUT = 20
    SQLALCHEMY_POOL_RECYCLE = 3600
    SQLALCHEMY_MAX_OVERFLOW = 20
    
    # Configurações de cache
    CACHE_REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
    CACHE_REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
    CACHE_REDIS_DB = int(os.environ.get('REDIS_DB', 0))
    CACHE_REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')
    
    # Configurações de celery (para tarefas assíncronas)
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL') or REDIS_URL
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND') or REDIS_URL
    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TIMEZONE = 'America/Sao_Paulo'
    CELERY_ENABLE_UTC = True
    
    # Configurações de timezone
    TIMEZONE = 'America/Sao_Paulo'
    
    # Configurações de paginação
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # Configurações de validação
    CPF_VALIDATION_ENABLED = True
    CNPJ_VALIDATION_ENABLED = True
    CREFITO_VALIDATION_ENABLED = True
    EMAIL_VALIDATION_ENABLED = True
    PHONE_VALIDATION_ENABLED = True
    
    # Configurações de LGPD
    DATA_RETENTION_DAYS = 2555  # 7 anos
    ANONYMIZATION_ENABLED = True
    CONSENT_REQUIRED = True
    DATA_EXPORT_ENABLED = True
    
    # Configurações de auditoria
    AUDIT_LOG_ENABLED = True
    AUDIT_LOG_RETENTION_DAYS = 2555  # 7 anos
    AUDIT_SENSITIVE_FIELDS = [
        'password', 'token', 'secret', 'key', 'cpf', 'rg',
        'credit_card', 'bank_account', 'pix_key'
    ]
    
    @staticmethod
    def init_app(app):
        """Inicializar configurações específicas da aplicação"""
        # Criar diretórios necessários
        directories = [
            Config.UPLOAD_FOLDER,
            Config.BACKUP_DIR,
            Config.LOG_FILE.parent
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

class DevelopmentConfig(Config):
    """
    Configuração para ambiente de desenvolvimento
    """
    
    DEBUG = True
    TESTING = False
    ENV = 'development'
    
    # Configurações de banco de dados para desenvolvimento
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        f'sqlite:///{BASE_DIR}/fisioflow_dev.db'
    
    # Configurações de email para desenvolvimento
    MAIL_SUPPRESS_SEND = True  # Não enviar emails reais
    MAIL_DEBUG = True
    
    # Configurações de cache para desenvolvimento
    CACHE_TYPE = 'simple'  # Cache em memória
    
    # Configurações de logging para desenvolvimento
    LOG_LEVEL = 'DEBUG'
    
    # Configurações de segurança relaxadas para desenvolvimento
    WTF_CSRF_ENABLED = False
    
    # Rate limiting relaxado para desenvolvimento
    RATELIMIT_ENABLED = False
    
    # Configurações de CORS para desenvolvimento
    CORS_ORIGINS = ['*']  # Permitir todas as origens
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Configurações específicas de desenvolvimento
        import logging
        logging.basicConfig(level=logging.DEBUG)

class ProductionConfig(Config):
    """
    Configuração para ambiente de produção
    """
    
    DEBUG = False
    TESTING = False
    ENV = 'production'
    
    # Configurações de banco de dados para produção
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user:password@localhost/fisioflow_prod'
    
    # Configurações de segurança para produção
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # Configurações de email para produção
    MAIL_SUPPRESS_SEND = False
    
    # Configurações de cache para produção
    CACHE_TYPE = 'redis'
    
    # Configurações de logging para produção
    LOG_LEVEL = 'INFO'
    
    # Configurações de CORS para produção
    CORS_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '').split(',')
    
    # Configurações de SSL
    SSL_REDIRECT = True
    SSL_DISABLE = False
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Configurações específicas de produção
        import logging
        from logging.handlers import RotatingFileHandler
        
        # Configurar logging para arquivo
        if not app.debug:
            file_handler = RotatingFileHandler(
                cls.LOG_FILE,
                maxBytes=cls.LOG_MAX_BYTES,
                backupCount=cls.LOG_BACKUP_COUNT
            )
            file_handler.setFormatter(logging.Formatter(cls.LOG_FORMAT))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            
            app.logger.setLevel(logging.INFO)
            app.logger.info('FisioFlow startup')
        
        # Configurar Sentry para monitoramento de erros
        if cls.SENTRY_DSN:
            import sentry_sdk
            from sentry_sdk.integrations.flask import FlaskIntegration
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
            
            sentry_sdk.init(
                dsn=cls.SENTRY_DSN,
                integrations=[
                    FlaskIntegration(),
                    SqlalchemyIntegration()
                ],
                environment=cls.SENTRY_ENVIRONMENT,
                traces_sample_rate=0.1
            )

class TestingConfig(Config):
    """
    Configuração para ambiente de testes
    """
    
    DEBUG = True
    TESTING = True
    ENV = 'testing'
    
    # Configurações de banco de dados para testes
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Configurações de email para testes
    MAIL_SUPPRESS_SEND = True
    
    # Configurações de cache para testes
    CACHE_TYPE = 'null'  # Sem cache
    
    # Configurações de segurança para testes
    WTF_CSRF_ENABLED = False
    
    # Rate limiting desabilitado para testes
    RATELIMIT_ENABLED = False
    
    # Configurações de JWT para testes
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=10)
    
    # Configurações de logging para testes
    LOG_LEVEL = 'WARNING'
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Configurações específicas de testes
        import logging
        logging.disable(logging.CRITICAL)

# Mapeamento de configurações
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

# Função para obter configuração atual
def get_config(config_name: str = None) -> Config:
    """
    Obter configuração baseada no nome
    
    Args:
        config_name: Nome da configuração
    
    Returns:
        Classe de configuração
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    return config.get(config_name, DevelopmentConfig)

# Configurações específicas por funcionalidade
class AIConfig:
    """
    Configurações específicas para IA
    """
    
    # Configurações de orquestração
    ORCHESTRATOR_STRATEGY = 'round_robin'  # round_robin, least_used, performance_based
    FALLBACK_ENABLED = True
    RETRY_ATTEMPTS = 3
    TIMEOUT_SECONDS = 30
    
    # Configurações de cache de respostas
    RESPONSE_CACHE_ENABLED = True
    RESPONSE_CACHE_TTL = 3600  # 1 hora
    
    # Configurações de rate limiting por provedor
    PROVIDER_RATE_LIMITS = {
        'openai': {'requests_per_minute': 60, 'tokens_per_minute': 90000},
        'anthropic': {'requests_per_minute': 50, 'tokens_per_minute': 80000},
        'gemini': {'requests_per_minute': 60, 'tokens_per_minute': 100000},
        'perplexity': {'requests_per_minute': 40, 'tokens_per_minute': 60000}
    }
    
    # Configurações de custo
    COST_TRACKING_ENABLED = True
    MONTHLY_BUDGET_LIMIT = 1000.00  # USD
    COST_ALERT_THRESHOLD = 0.8  # 80% do orçamento

class SecurityConfig:
    """
    Configurações específicas de segurança
    """
    
    # Configurações de criptografia
    ENCRYPTION_ALGORITHM = 'AES-256-GCM'
    ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY')
    
    # Configurações de hash
    HASH_ALGORITHM = 'SHA-256'
    SALT_ROUNDS = 12
    
    # Configurações de sessão
    SESSION_TIMEOUT = 3600  # 1 hora
    CONCURRENT_SESSIONS_LIMIT = 3
    
    # Configurações de tentativas de login
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 900  # 15 minutos
    
    # Configurações de 2FA
    TOTP_ISSUER = 'FisioFlow'
    TOTP_VALIDITY_WINDOW = 1
    BACKUP_CODES_COUNT = 10
    
    # Configurações de auditoria
    AUDIT_SENSITIVE_OPERATIONS = [
        'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PERMISSION_CHANGE',
        'DATA_EXPORT', 'DATA_DELETE', 'BACKUP_CREATE', 'BACKUP_RESTORE'
    ]

class IntegrationConfig:
    """
    Configurações específicas de integrações
    """
    
    # Timeouts para APIs externas
    API_TIMEOUT = 30
    API_RETRY_ATTEMPTS = 3
    API_RETRY_DELAY = 1  # segundos
    
    # Configurações de webhook
    WEBHOOK_TIMEOUT = 10
    WEBHOOK_RETRY_ATTEMPTS = 3
    WEBHOOK_SECRET_HEADER = 'X-Webhook-Secret'
    
    # Configurações de sincronização
    SYNC_BATCH_SIZE = 100
    SYNC_INTERVAL = 300  # 5 minutos
    
    # Configurações de cache para integrações
    INTEGRATION_CACHE_TTL = 1800  # 30 minutos