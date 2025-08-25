# -*- coding: utf-8 -*-
"""
Routes - FisioFlow Backend

Este módulo organiza todos os blueprints das rotas da API,
fornecendo um ponto central para registro de todas as rotas
do sistema de fisioterapia.

Bluprints disponíveis:
- auth: Autenticação e autorização
- users: Gestão de usuários
- patients: Gestão de pacientes
- appointments: Sistema de agendamento
- exercises: Biblioteca de exercícios
- partnerships: Sistema de parcerias
- mentorship: Módulo de mentoria
- reports: Relatórios e analytics
- integrations: Integrações externas
- notifications: Sistema de notificações
- ai: Sistema de IA
- admin: Painel administrativo
"""

from flask import Blueprint

# Importar todos os blueprints
from .auth import auth_bp
from .users import users_bp
from .patients import patients_bp
from .appointments import appointments_bp
from .exercises import exercises_bp
from .partnerships import partnerships_bp
from .mentorship import mentorship_bp
from .reports import reports_bp
from .integrations import integrations_bp
from .notifications import notifications_bp
from .ai import ai_bp
from .admin import admin_bp

# Lista de todos os blueprints para registro automático
ALL_BLUEPRINTS = [
    auth_bp,
    users_bp,
    patients_bp,
    appointments_bp,
    exercises_bp,
    partnerships_bp,
    mentorship_bp,
    reports_bp,
    integrations_bp,
    notifications_bp,
    ai_bp,
    admin_bp
]

def register_blueprints(app):
    """
    Registra todos os blueprints na aplicação Flask
    
    Args:
        app: Instância da aplicação Flask
    """
    for blueprint in ALL_BLUEPRINTS:
        app.register_blueprint(blueprint)

__all__ = [
    'ALL_BLUEPRINTS',
    'register_blueprints',
    'auth_bp',
    'users_bp',
    'patients_bp',
    'appointments_bp',
    'exercises_bp',
    'partnerships_bp',
    'mentorship_bp',
    'reports_bp',
    'integrations_bp',
    'notifications_bp',
    'ai_bp',
    'admin_bp'
]