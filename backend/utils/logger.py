# -*- coding: utf-8 -*-
"""
Sistema de Logging Estruturado - FisioFlow Backend

Este módulo implementa um sistema de logging estruturado
com diferentes níveis e formatação para o FisioFlow.
"""

import os
import sys
import json
import logging
import logging.handlers
from datetime import datetime
from typing import Any, Dict, Optional, Union
from functools import wraps
import traceback
from flask import request, g
import structlog
from pythonjsonlogger import jsonlogger

# Configuração do structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

class CustomJSONFormatter(jsonlogger.JsonFormatter):
    """Formatador JSON customizado para logs"""
    
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        
        # Adicionar timestamp
        if not log_record.get('timestamp'):
            log_record['timestamp'] = datetime.utcnow().isoformat()
        
        # Adicionar nível do log
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname
        
        # Adicionar informações da requisição se disponível
        try:
            if request:
                log_record['request'] = {
                    'method': request.method,
                    'url': request.url,
                    'remote_addr': request.remote_addr,
                    'user_agent': request.headers.get('User-Agent'),
                    'request_id': getattr(g, 'request_id', None)
                }
                
                # Adicionar user_id se autenticado
                if hasattr(g, 'current_user') and g.current_user:
                    log_record['user_id'] = g.current_user.id
        except RuntimeError:
            # Fora do contexto da aplicação Flask
            pass

class FisioFlowLogger:
    """Logger principal do FisioFlow"""
    
    def __init__(self, name: str = 'fisioflow'):
        self.name = name
        self.logger = structlog.get_logger(name)
        self._setup_logging()
    
    def _setup_logging(self):
        """Configurar sistema de logging"""
        # Obter configurações do ambiente
        log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
        log_format = os.getenv('LOG_FORMAT', 'json')
        log_file = os.getenv('LOG_FILE', 'logs/fisioflow.log')
        
        # Criar diretório de logs se não existir
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Configurar logger raiz
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, log_level))
        
        # Remover handlers existentes
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, log_level))
        
        # Handler para arquivo
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(getattr(logging, log_level))
        
        # Configurar formatadores
        if log_format.lower() == 'json':
            formatter = CustomJSONFormatter(
                '%(timestamp)s %(level)s %(name)s %(message)s'
            )
        else:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)
        
        # Adicionar handlers
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)
        
        # Configurar loggers específicos
        self._configure_specific_loggers()
    
    def _configure_specific_loggers(self):
        """Configurar loggers específicos"""
        # Reduzir verbosidade de bibliotecas externas
        logging.getLogger('urllib3').setLevel(logging.WARNING)
        logging.getLogger('requests').setLevel(logging.WARNING)
        logging.getLogger('werkzeug').setLevel(logging.WARNING)
        logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    def debug(self, message: str, **kwargs):
        """Log de debug"""
        self.logger.debug(message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log de informação"""
        self.logger.info(message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log de aviso"""
        self.logger.warning(message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log de erro"""
        self.logger.error(message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log crítico"""
        self.logger.critical(message, **kwargs)
    
    def exception(self, message: str, **kwargs):
        """Log de exceção com traceback"""
        self.logger.exception(message, **kwargs)

# Instância global do logger
logger = FisioFlowLogger()

class AuditLogger:
    """Logger específico para auditoria"""
    
    def __init__(self):
        self.logger = structlog.get_logger('audit')
    
    def log_action(self, action: str, resource: str, resource_id: str, 
                   user_id: str, details: Dict[str, Any] = None):
        """Registrar ação de auditoria"""
        audit_data = {
            'action': action,
            'resource': resource,
            'resource_id': resource_id,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat(),
            'details': details or {}
        }
        
        # Adicionar informações da requisição
        try:
            if request:
                audit_data.update({
                    'ip_address': request.remote_addr,
                    'user_agent': request.headers.get('User-Agent'),
                    'request_id': getattr(g, 'request_id', None)
                })
        except RuntimeError:
            pass
        
        self.logger.info("Audit log", **audit_data)
    
    def log_login(self, user_id: str, success: bool, reason: str = None):
        """Registrar tentativa de login"""
        self.log_action(
            action='LOGIN',
            resource='user',
            resource_id=user_id,
            user_id=user_id,
            details={
                'success': success,
                'reason': reason
            }
        )
    
    def log_logout(self, user_id: str):
        """Registrar logout"""
        self.log_action(
            action='LOGOUT',
            resource='user',
            resource_id=user_id,
            user_id=user_id
        )
    
    def log_data_access(self, user_id: str, resource: str, resource_id: str, 
                       action: str = 'READ'):
        """Registrar acesso a dados"""
        self.log_action(
            action=f'DATA_{action.upper()}',
            resource=resource,
            resource_id=resource_id,
            user_id=user_id
        )
    
    def log_data_modification(self, user_id: str, resource: str, resource_id: str, 
                            old_values: Dict[str, Any], new_values: Dict[str, Any]):
        """Registrar modificação de dados"""
        self.log_action(
            action='DATA_MODIFY',
            resource=resource,
            resource_id=resource_id,
            user_id=user_id,
            details={
                'old_values': old_values,
                'new_values': new_values
            }
        )
    
    def log_data_deletion(self, user_id: str, resource: str, resource_id: str, 
                         data: Dict[str, Any]):
        """Registrar exclusão de dados"""
        self.log_action(
            action='DATA_DELETE',
            resource=resource,
            resource_id=resource_id,
            user_id=user_id,
            details={'deleted_data': data}
        )

# Instância global do audit logger
audit_logger = AuditLogger()

class PerformanceLogger:
    """Logger para métricas de performance"""
    
    def __init__(self):
        self.logger = structlog.get_logger('performance')
    
    def log_request_time(self, endpoint: str, method: str, duration: float, 
                        status_code: int, user_id: str = None):
        """Registrar tempo de requisição"""
        self.logger.info(
            "Request performance",
            endpoint=endpoint,
            method=method,
            duration_ms=round(duration * 1000, 2),
            status_code=status_code,
            user_id=user_id
        )
    
    def log_database_query(self, query: str, duration: float, rows_affected: int = None):
        """Registrar performance de query"""
        self.logger.info(
            "Database query performance",
            query_hash=hash(query),
            duration_ms=round(duration * 1000, 2),
            rows_affected=rows_affected
        )
    
    def log_external_api_call(self, service: str, endpoint: str, duration: float, 
                             status_code: int, success: bool):
        """Registrar chamada para API externa"""
        self.logger.info(
            "External API call",
            service=service,
            endpoint=endpoint,
            duration_ms=round(duration * 1000, 2),
            status_code=status_code,
            success=success
        )

# Instância global do performance logger
performance_logger = PerformanceLogger()

class SecurityLogger:
    """Logger para eventos de segurança"""
    
    def __init__(self):
        self.logger = structlog.get_logger('security')
    
    def log_security_event(self, event_type: str, severity: str, description: str, 
                          user_id: str = None, details: Dict[str, Any] = None):
        """Registrar evento de segurança"""
        security_data = {
            'event_type': event_type,
            'severity': severity,
            'description': description,
            'user_id': user_id,
            'details': details or {}
        }
        
        # Adicionar informações da requisição
        try:
            if request:
                security_data.update({
                    'ip_address': request.remote_addr,
                    'user_agent': request.headers.get('User-Agent'),
                    'request_id': getattr(g, 'request_id', None)
                })
        except RuntimeError:
            pass
        
        if severity.upper() in ['HIGH', 'CRITICAL']:
            self.logger.error("Security event", **security_data)
        else:
            self.logger.warning("Security event", **security_data)
    
    def log_failed_login(self, username: str, reason: str):
        """Registrar falha de login"""
        self.log_security_event(
            event_type='FAILED_LOGIN',
            severity='MEDIUM',
            description=f'Failed login attempt for user: {username}',
            details={'username': username, 'reason': reason}
        )
    
    def log_suspicious_activity(self, description: str, user_id: str = None, 
                               details: Dict[str, Any] = None):
        """Registrar atividade suspeita"""
        self.log_security_event(
            event_type='SUSPICIOUS_ACTIVITY',
            severity='HIGH',
            description=description,
            user_id=user_id,
            details=details
        )
    
    def log_rate_limit_exceeded(self, user_id: str = None, endpoint: str = None):
        """Registrar excesso de rate limit"""
        self.log_security_event(
            event_type='RATE_LIMIT_EXCEEDED',
            severity='MEDIUM',
            description='Rate limit exceeded',
            user_id=user_id,
            details={'endpoint': endpoint}
        )
    
    def log_unauthorized_access(self, resource: str, user_id: str = None):
        """Registrar acesso não autorizado"""
        self.log_security_event(
            event_type='UNAUTHORIZED_ACCESS',
            severity='HIGH',
            description=f'Unauthorized access attempt to: {resource}',
            user_id=user_id,
            details={'resource': resource}
        )

# Instância global do security logger
security_logger = SecurityLogger()

def log_function_call(func):
    """Decorator para logar chamadas de função"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.utcnow()
        
        try:
            logger.debug(
                f"Function call started: {func.__name__}",
                function=func.__name__,
                module=func.__module__,
                args_count=len(args),
                kwargs_keys=list(kwargs.keys())
            )
            
            result = func(*args, **kwargs)
            
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.debug(
                f"Function call completed: {func.__name__}",
                function=func.__name__,
                duration_ms=round(duration * 1000, 2),
                success=True
            )
            
            return result
            
        except Exception as e:
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.error(
                f"Function call failed: {func.__name__}",
                function=func.__name__,
                duration_ms=round(duration * 1000, 2),
                error=str(e),
                traceback=traceback.format_exc()
            )
            raise
    
    return wrapper

def log_api_request(func):
    """Decorator para logar requisições da API"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.utcnow()
        
        try:
            # Log da requisição
            logger.info(
                "API request started",
                endpoint=request.endpoint,
                method=request.method,
                url=request.url,
                remote_addr=request.remote_addr,
                user_agent=request.headers.get('User-Agent'),
                user_id=getattr(g, 'current_user', {}).get('id') if hasattr(g, 'current_user') else None
            )
            
            result = func(*args, **kwargs)
            
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Determinar status code
            status_code = 200
            if hasattr(result, 'status_code'):
                status_code = result.status_code
            elif isinstance(result, tuple) and len(result) > 1:
                status_code = result[1]
            
            # Log da resposta
            logger.info(
                "API request completed",
                endpoint=request.endpoint,
                method=request.method,
                status_code=status_code,
                duration_ms=round(duration * 1000, 2)
            )
            
            # Log de performance se demorou muito
            if duration > 2.0:  # Mais de 2 segundos
                performance_logger.log_request_time(
                    endpoint=request.endpoint,
                    method=request.method,
                    duration=duration,
                    status_code=status_code,
                    user_id=getattr(g, 'current_user', {}).get('id') if hasattr(g, 'current_user') else None
                )
            
            return result
            
        except Exception as e:
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            logger.error(
                "API request failed",
                endpoint=request.endpoint,
                method=request.method,
                error=str(e),
                duration_ms=round(duration * 1000, 2),
                traceback=traceback.format_exc()
            )
            
            raise
    
    return wrapper

def setup_request_logging(app):
    """Configurar logging de requisições para a aplicação Flask"""
    
    @app.before_request
    def before_request():
        g.request_start_time = datetime.utcnow()
        g.request_id = os.urandom(16).hex()
    
    @app.after_request
    def after_request(response):
        if hasattr(g, 'request_start_time'):
            duration = (datetime.utcnow() - g.request_start_time).total_seconds()
            
            # Log básico da requisição
            logger.info(
                "Request processed",
                method=request.method,
                url=request.url,
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2),
                request_id=g.request_id
            )
        
        return response
    
    return app

# Função para configurar logging da aplicação
def configure_app_logging(app):
    """Configurar logging para a aplicação Flask"""
    # Configurar logging de requisições
    setup_request_logging(app)
    
    # Configurar handler de erros
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.exception(
            "Unhandled exception",
            error=str(e),
            traceback=traceback.format_exc()
        )
        
        # Re-raise para que o Flask possa lidar com o erro
        raise e
    
    return app