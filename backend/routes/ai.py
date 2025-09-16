# -*- coding: utf-8 -*-
"""
Ai routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/', methods=['GET'])
def list_ai():
    """List ai"""
    return APIResponse.success({"message": "Ai endpoint - em desenvolvimento"})

@ai_bp.route('/', methods=['POST'])
def create_ai():
    """Create ai"""
    return APIResponse.success({"message": "Create ai endpoint - em desenvolvimento"})
