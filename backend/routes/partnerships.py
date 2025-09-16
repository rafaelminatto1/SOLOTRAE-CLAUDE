# -*- coding: utf-8 -*-
"""
Partnerships routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

partnerships_bp = Blueprint('partnerships', __name__, url_prefix='/api/partnerships')

@partnerships_bp.route('/', methods=['GET'])
def list_partnerships():
    """List partnerships"""
    return APIResponse.success({"message": "Partnerships endpoint - em desenvolvimento"})

@partnerships_bp.route('/', methods=['POST'])
def create_partnerships():
    """Create partnerships"""
    return APIResponse.success({"message": "Create partnerships endpoint - em desenvolvimento"})
