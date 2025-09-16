# -*- coding: utf-8 -*-
"""
Appointments routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

@appointments_bp.route('/', methods=['GET'])
def list_appointments():
    """List appointments"""
    return APIResponse.success({"message": "Appointments endpoint - em desenvolvimento"})

@appointments_bp.route('/', methods=['POST'])
def create_appointments():
    """Create appointments"""
    return APIResponse.success({"message": "Create appointments endpoint - em desenvolvimento"})
