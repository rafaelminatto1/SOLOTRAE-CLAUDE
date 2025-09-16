# -*- coding: utf-8 -*-
"""
Helper utilities
"""

from datetime import datetime

class DateTimeHelper:
    @staticmethod
    def now():
        """Retorna datetime atual"""
        return datetime.utcnow()
    
    @staticmethod
    def format_datetime(dt):
        """Formatar datetime"""
        return dt.isoformat() if dt else None
