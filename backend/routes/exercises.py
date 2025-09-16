# -*- coding: utf-8 -*-
"""
Exercises routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

exercises_bp = Blueprint('exercises', __name__, url_prefix='/api/exercises')

@exercises_bp.route('/', methods=['GET'])
def list_exercises():
    """List exercises"""
    return APIResponse.success({"message": "Exercises endpoint - em desenvolvimento"})

@exercises_bp.route('/', methods=['POST'])
def create_exercises():
    """Create exercises"""
    return APIResponse.success({"message": "Create exercises endpoint - em desenvolvimento"})
