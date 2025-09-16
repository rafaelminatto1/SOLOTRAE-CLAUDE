# -*- coding: utf-8 -*-
"""
Patients routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')

@patients_bp.route('/', methods=['GET'])
def list_patients():
    """List patients"""
    return APIResponse.success({"message": "Patients endpoint - em desenvolvimento"})

@patients_bp.route('/', methods=['POST'])
def create_patients():
    """Create patients"""
    return APIResponse.success({"message": "Create patients endpoint - em desenvolvimento"})
