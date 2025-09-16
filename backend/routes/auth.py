# -*- coding: utf-8 -*-
"""
Auth routes
"""

from flask import Blueprint, jsonify
from ..utils.response import APIResponse

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    return APIResponse.success({"message": "Login endpoint - em desenvolvimento"})

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register endpoint"""
    return APIResponse.success({"message": "Register endpoint - em desenvolvimento"})

@auth_bp.route('/profile', methods=['GET'])
def profile():
    """Profile endpoint"""
    return APIResponse.success({"message": "Profile endpoint - em desenvolvimento"})
