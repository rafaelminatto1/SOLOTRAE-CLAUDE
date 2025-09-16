# -*- coding: utf-8 -*-
"""
Database - FisioFlow Backend
"""

from flask_sqlalchemy import SQLAlchemy
import logging

logger = logging.getLogger(__name__)
db = SQLAlchemy()

def init_db(app=None):
    """Inicializar banco de dados"""
    if app:
    db.init_app(app)
    with app.app_context():
        db.create_all()
            logger.info("Banco de dados inicializado")

def get_db_session():
    """Obter sessão do banco"""
    return db.session

# Modelo básico de teste
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    def __repr__(self):
        return f'<User {self.email}>'
