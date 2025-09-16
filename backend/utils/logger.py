# -*- coding: utf-8 -*-
"""
Logger utilities
"""

import logging
import sys

def setup_logging():
    """Configurar logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

def get_logger(name):
    """Obter logger"""
    return logging.getLogger(name)
