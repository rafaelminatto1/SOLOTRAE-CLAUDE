# -*- coding: utf-8 -*-
"""
Notifications routes
"""

from flask import Blueprint
from ..utils.response import APIResponse

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('/', methods=['GET'])
def list_notifications():
    """List notifications"""
    return APIResponse.success({"message": "Notifications endpoint - em desenvolvimento"})

@notifications_bp.route('/', methods=['POST'])
def create_notifications():
    """Create notifications"""
    return APIResponse.success({"message": "Create notifications endpoint - em desenvolvimento"})
