# -*- coding: utf-8 -*-
"""
Admin routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/', methods=['GET'])
def list_admin():
    """List admin"""
    return APIResponse.success({"message": "Admin endpoint - em desenvolvimento"})

@admin_bp.route('/', methods=['POST'])
def create_admin():
    """Create admin"""
    return APIResponse.success({"message": "Create admin endpoint - em desenvolvimento"})
