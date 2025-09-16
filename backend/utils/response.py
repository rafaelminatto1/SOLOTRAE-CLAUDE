# -*- coding: utf-8 -*-
"""
Response utilities
"""

from flask import jsonify
from typing import Any, Dict, Optional

class APIResponse:
    @staticmethod
    def success(data: Any = None, message: str = "Success", status_code: int = 200):
        """Resposta de sucesso"""
        response = {
            "success": True,
            "message": message,
            "data": data
        }
        return jsonify(response), status_code
    
    @staticmethod
    def error(message: str = "Error", status_code: int = 400, errors: Optional[Dict] = None):
        """Resposta de erro"""
        response = {
            "success": False,
            "message": message
        }
        if errors:
            response["errors"] = errors
        return jsonify(response), status_code
