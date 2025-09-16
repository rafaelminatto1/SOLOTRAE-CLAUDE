# -*- coding: utf-8 -*-
"""
Integrations routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

integrations_bp = Blueprint('integrations', __name__, url_prefix='/api/integrations')

@integrations_bp.route('/', methods=['GET'])
def list_integrations():
    """List integrations"""
    return APIResponse.success({"message": "Integrations endpoint - em desenvolvimento"})

@integrations_bp.route('/', methods=['POST'])
def create_integrations():
    """Create integrations"""
    return APIResponse.success({"message": "Create integrations endpoint - em desenvolvimento"})
