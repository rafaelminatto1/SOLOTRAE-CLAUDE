# -*- coding: utf-8 -*-
"""
FisioFlow Backend - Versão Simplificada para Teste
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
import logging
from ai_routes import ai_bp
from payment_routes import payment_bp
from integrations_routes import integrations_bp

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar aplicação Flask
app = Flask(__name__)

# Configurações básicas
app.config['SECRET_KEY'] = 'fisioflow-secret-key-development'
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fisioflow_simple.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar extensões
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'])
db = SQLAlchemy(app)

# Modelo básico de teste
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }

# Criar tabelas
with app.app_context():
    db.create_all()
    logger.info("Banco de dados inicializado")

# Rotas básicas
@app.route('/')
def index():
    return jsonify({
        'message': 'FisioFlow API - Funcionando!',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'online',
        'endpoints': {
            'health': '/health',
            'auth': '/api/auth/*',
            'patients': '/api/patients/*',
            'appointments': '/api/appointments/*',
            'ai': '/api/ai/*',
            'payments': '/api/payments/*',
            'integrations': '/api/integrations/*'
        }
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': 'connected',
        'version': '1.0.0'
    })

# Rotas de autenticação
@app.route('/api/auth/test')
def auth_test():
    return jsonify({
        'message': 'Endpoint de autenticação funcionando',
        'status': 'success',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    return jsonify({
        'message': 'Login endpoint - em desenvolvimento',
        'status': 'success',
        'token': 'fake-jwt-token-for-development'
    })

# Rotas de pacientes
@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify({
        'message': 'Lista de pacientes',
        'status': 'success',
        'data': [patient.to_dict() for patient in patients],
        'total': len(patients)
    })

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.get_json()
    
    if not data or 'name' not in data or 'email' not in data:
        return jsonify({
            'message': 'Nome e email são obrigatórios',
            'status': 'error'
        }), 400
    
    try:
        patient = Patient(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', '')
        )
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Paciente criado com sucesso',
            'status': 'success',
            'data': patient.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': f'Erro ao criar paciente: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    return jsonify({
        'message': 'Paciente encontrado',
        'status': 'success',
        'data': patient.to_dict()
    })

# Rotas de agendamentos
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    return jsonify({
        'message': 'Lista de agendamentos - em desenvolvimento',
        'status': 'success',
        'data': [],
        'total': 0
    })

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    return jsonify({
        'message': 'Criar agendamento - em desenvolvimento',
        'status': 'success'
    })

# Rotas de exercícios
@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    return jsonify({
        'message': 'Lista de exercícios - em desenvolvimento',
        'status': 'success',
        'data': [],
        'total': 0
    })

# Registrar blueprints
app.register_blueprint(ai_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(integrations_bp)

# Rotas de relatórios
@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify({
        'message': 'Relatórios - em desenvolvimento',
        'status': 'success',
        'data': []
    })

# Tratamento de erros
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'message': 'Endpoint não encontrado',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'message': 'Erro interno do servidor',
        'status': 'error'
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Iniciando FisioFlow Backend na porta {port}")
    print(f"📍 Acesse: http://localhost:{port}")
    print(f"🔍 Health check: http://localhost:{port}/health")
    print(f"📚 API Docs: http://localhost:{port}/")
    
    app.run(host='0.0.0.0', port=port, debug=True)