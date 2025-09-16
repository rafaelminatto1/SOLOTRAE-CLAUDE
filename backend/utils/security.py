# -*- coding: utf-8 -*-
"""
Security utilities
"""

from flask import request
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    def __init__(self, app):
        self.app = app
    
    def process_request(self):
        """Processar request de segurança"""
        # Por enquanto apenas log
        logger.debug(f"Security check: {request.method} {request.path}")
        return None
