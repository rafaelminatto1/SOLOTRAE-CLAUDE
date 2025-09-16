# -*- coding: utf-8 -*-
"""
Reports routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/', methods=['GET'])
def list_reports():
    """List reports"""
    return APIResponse.success({"message": "Reports endpoint - em desenvolvimento"})

@reports_bp.route('/', methods=['POST'])
def create_reports():
    """Create reports"""
    return APIResponse.success({"message": "Create reports endpoint - em desenvolvimento"})
