# -*- coding: utf-8 -*-
"""
Aplicação Principal - FisioFlow Backend

Este módulo configura e inicializa a aplicação Flask com todos os blueprints,
middlewares, configurações de segurança e integrações necessárias.

Funcionalidades:
- Configuração da aplicação Flask
- Registro de blueprints
- Configuração de CORS
- Middleware de segurança
- Tratamento de erros
- Logging estruturado
- Inicialização do banco de dados
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import logging
from typing import Dict, Any
import traceback
import time

# Importar configurações
from .config import Config, DevelopmentConfig, ProductionConfig, TestingConfig

# Importar database
from .database import init_db, get_db_session

# Importar blueprints
from .routes.auth import auth_bp
from .routes.patients import patients_bp
from .routes.appointments import appointments_bp
from .routes.exercises import exercises_bp
from .routes.partnerships import partnerships_bp
from .routes.reports import reports_bp
from .routes.integrations import integrations_bp
from .routes.notifications import notifications_bp
from .routes.ai import ai_bp
from .routes.admin import admin_bp

# Importar utilitários
from .utils.response import APIResponse
from .utils.security import SecurityMiddleware
from .utils.logger import setup_logging, get_logger
from .utils.helpers import DateTimeHelper

# Configurar logging
setup_logging()
logger = get_logger(__name__)

def create_app(config_name: str = None) -> Flask:
    """
    Factory function para criar a aplicação Flask
    
    Args:
        config_name: Nome da configuração (development, production, testing)
    
    Returns:
        Instância da aplicação Flask configurada
    """
    app = Flask(__name__)
    
    # Configurar aplicação
    configure_app(app, config_name)
    
    # Configurar CORS
    configure_cors(app)
    
    # Configurar middlewares
    configure_middlewares(app)
    
    # Registrar blueprints
    register_blueprints(app)
    
    # Configurar tratamento de erros
    configure_error_handlers(app)
    
    # Configurar hooks de request
    configure_request_hooks(app)
    
    # Inicializar banco de dados
    with app.app_context():
        init_db()
    
    logger.info(f"Aplicação FisioFlow iniciada em modo {app.config['ENV']}")
    
    return app

def configure_app(app: Flask, config_name: str = None):
    """
    Configurar aplicação Flask
    
    Args:
        app: Instância da aplicação Flask
        config_name: Nome da configuração
    """
    # Determinar configuração
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    config_mapping = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig
    }
    
    config_class = config_mapping.get(config_name, DevelopmentConfig)
    app.config.from_object(config_class)
    
    # Configurações adicionais
    app.config['JSON_AS_ASCII'] = False
    app.config['JSON_SORT_KEYS'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    
    logger.info(f"Aplicação configurada com {config_class.__name__}")

def configure_cors(app: Flask):
    """
    Configurar CORS
    
    Args:
        app: Instância da aplicação Flask
    """
    # Configuração de CORS baseada no ambiente
    if app.config['ENV'] == 'development':
        # Desenvolvimento: permitir todas as origens
        CORS(app, 
             origins=['http://localhost:3000', 'http://localhost:5173'],
             supports_credentials=True,
             allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
    else:
        # Produção: apenas origens específicas
        allowed_origins = app.config.get('ALLOWED_ORIGINS', []).split(',')
        CORS(app,
             origins=allowed_origins,
             supports_credentials=True,
             allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
    
    logger.info("CORS configurado")

def configure_middlewares(app: Flask):
    """
    Configurar middlewares
    
    Args:
        app: Instância da aplicação Flask
    """
    # Middleware de segurança
    security_middleware = SecurityMiddleware(app)
    
    @app.before_request
    def security_middleware_handler():
        """Handler do middleware de segurança"""
        return security_middleware.process_request()
    
    @app.before_request
    def log_request():
        """Log de requisições"""
        g.start_time = time.time()
        
        # Log da requisição (exceto para health check)
        if request.endpoint != 'health_check':
            logger.info(
                f"Request: {request.method} {request.path}",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'remote_addr': request.remote_addr,
                    'user_agent': request.headers.get('User-Agent', ''),
                    'content_length': request.content_length
                }
            )
    
    @app.after_request
    def log_response(response):
        """Log de respostas"""
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            
            # Log da resposta (exceto para health check)
            if request.endpoint != 'health_check':
                logger.info(
                    f"Response: {response.status_code} - {duration:.3f}s",
                    extra={
                        'status_code': response.status_code,
                        'duration': duration,
                        'content_length': response.content_length
                    }
                )
        
        return response
    
    logger.info("Middlewares configurados")

def register_blueprints(app: Flask):
    """
    Registrar blueprints
    
    Args:
        app: Instância da aplicação Flask
    """
    # Lista de blueprints
    blueprints = [
        (auth_bp, 'Autenticação'),
        (patients_bp, 'Pacientes'),
        (appointments_bp, 'Agendamentos'),
        (exercises_bp, 'Exercícios'),
        (partnerships_bp, 'Parcerias'),
        (reports_bp, 'Relatórios'),
        (integrations_bp, 'Integrações'),
        (notifications_bp, 'Notificações'),
        (ai_bp, 'Inteligência Artificial'),
        (admin_bp, 'Administração')
    ]
    
    # Registrar cada blueprint
    for blueprint, name in blueprints:
        app.register_blueprint(blueprint)
        logger.info(f"Blueprint {name} registrado")
    
    # Rota de health check
    @app.route('/health')
    def health_check():
        """Endpoint de verificação de saúde"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': app.config.get('VERSION', '1.0.0'),
            'environment': app.config['ENV']
        })
    
    # Rota raiz
    @app.route('/')
    def index():
        """Endpoint raiz"""
        return jsonify({
            'message': 'FisioFlow API',
            'version': app.config.get('VERSION', '1.0.0'),
            'environment': app.config['ENV'],
            'timestamp': datetime.utcnow().isoformat(),
            'endpoints': {
                'auth': '/api/auth',
                'patients': '/api/patients',
                'appointments': '/api/appointments',
                'exercises': '/api/exercises',
                'partnerships': '/api/partnerships',
                'reports': '/api/reports',
                'integrations': '/api/integrations',
                'notifications': '/api/notifications',
                'ai': '/api/ai',
                'admin': '/api/admin'
            }
        })
    
    logger.info("Blueprints registrados")

def configure_error_handlers(app: Flask):
    """
    Configurar tratamento de erros
    
    Args:
        app: Instância da aplicação Flask
    """
    @app.errorhandler(400)
    def bad_request(error):
        """Tratamento de erro 400"""
        logger.warning(f"Bad Request: {error}")
        return APIResponse.error('Requisição inválida', 400)
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Tratamento de erro 401"""
        logger.warning(f"Unauthorized: {error}")
        return APIResponse.error('Não autorizado', 401)
    
    @app.errorhandler(403)
    def forbidden(error):
        """Tratamento de erro 403"""
        logger.warning(f"Forbidden: {error}")
        return APIResponse.error('Acesso negado', 403)
    
    @app.errorhandler(404)
    def not_found(error):
        """Tratamento de erro 404"""
        logger.warning(f"Not Found: {request.path}")
        return APIResponse.error('Recurso não encontrado', 404)
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Tratamento de erro 405"""
        logger.warning(f"Method Not Allowed: {request.method} {request.path}")
        return APIResponse.error('Método não permitido', 405)
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        """Tratamento de erro 413"""
        logger.warning(f"Request Entity Too Large: {error}")
        return APIResponse.error('Arquivo muito grande', 413)
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Tratamento de erro 429"""
        logger.warning(f"Rate Limit Exceeded: {error}")
        return APIResponse.error('Muitas requisições. Tente novamente mais tarde.', 429)
    
    @app.errorhandler(500)
    def internal_server_error(error):
        """Tratamento de erro 500"""
        logger.error(f"Internal Server Error: {error}")
        logger.error(traceback.format_exc())
        
        if app.config['DEBUG']:
            return APIResponse.error(f'Erro interno do servidor: {str(error)}', 500)
        else:
            return APIResponse.error('Erro interno do servidor', 500)
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Tratamento de exceções não capturadas"""
        logger.error(f"Unhandled Exception: {error}")
        logger.error(traceback.format_exc())
        
        if app.config['DEBUG']:
            return APIResponse.error(f'Erro não tratado: {str(error)}', 500)
        else:
            return APIResponse.error('Erro interno do servidor', 500)
    
    logger.info("Tratamento de erros configurado")

def configure_request_hooks(app: Flask):
    """
    Configurar hooks de request
    
    Args:
        app: Instância da aplicação Flask
    """
    @app.before_request
    def before_request():
        """Hook executado antes de cada request"""
        # Adicionar timestamp da requisição
        g.request_start_time = datetime.utcnow()
        
        # Verificar manutenção (apenas para rotas da API)
        if request.path.startswith('/api/') and request.endpoint != 'health_check':
            # Verificar se o sistema está em manutenção
            maintenance_mode = app.config.get('MAINTENANCE_MODE', False)
            if maintenance_mode:
                return APIResponse.error(
                    'Sistema em manutenção. Tente novamente mais tarde.',
                    503
                )
    
    @app.after_request
    def after_request(response):
        """Hook executado após cada request"""
        # Adicionar headers de segurança
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Adicionar header de tempo de resposta
        if hasattr(g, 'request_start_time'):
            duration = datetime.utcnow() - g.request_start_time
            response.headers['X-Response-Time'] = f"{duration.total_seconds():.3f}s"
        
        return response
    
    @app.teardown_appcontext
    def close_db(error):
        """Fechar conexão com banco de dados"""
        # O SQLAlchemy gerencia as conexões automaticamente
        pass
    
    logger.info("Hooks de request configurados")

# Instância da aplicação para desenvolvimento
app = create_app()

if __name__ == '__main__':
    # Configurações para execução direta
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Iniciando servidor na porta {port}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )