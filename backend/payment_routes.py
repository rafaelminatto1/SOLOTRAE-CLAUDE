# -*- coding: utf-8 -*-
"""
Payment Routes - Rotas para sistema de pagamentos
"""

from flask import Blueprint, request, jsonify
from payment_service import payment_service
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payment_bp.route('/methods', methods=['GET'])
def get_payment_methods():
    """Obter métodos de pagamento disponíveis"""
    try:
        methods = payment_service.get_payment_methods()
        
        return jsonify({
            "success": True,
            "data": {
                "methods": methods,
                "total": len(methods)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter métodos de pagamento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/pix', methods=['POST'])
def create_pix_payment():
    """Criar pagamento PIX"""
    try:
        data = request.get_json()
        
        patient_id = data.get('patient_id')
        amount = data.get('amount')
        description = data.get('description', 'Consulta Fisioterapia')
        appointment_id = data.get('appointment_id')
        
        if not patient_id or not amount:
            return jsonify({
                "success": False,
                "message": "patient_id e amount são obrigatórios"
            }), 400
        
        if amount <= 0:
            return jsonify({
                "success": False,
                "message": "Valor deve ser maior que zero"
            }), 400
        
        result = payment_service.create_pix_payment(
            patient_id=patient_id,
            amount=float(amount),
            description=description,
            appointment_id=appointment_id
        )
        
        if "error" in result:
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 400
        
        return jsonify({
            "success": True,
            "data": result
        }), 201
        
    except Exception as e:
        logger.error(f"Erro ao criar pagamento PIX: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/card', methods=['POST'])
def create_card_payment():
    """Criar pagamento com cartão"""
    try:
        data = request.get_json()
        
        patient_id = data.get('patient_id')
        amount = data.get('amount')
        description = data.get('description', 'Consulta Fisioterapia')
        card_data = data.get('card_data', {})
        payment_type = data.get('payment_type', 'credit_card')
        appointment_id = data.get('appointment_id')
        
        if not patient_id or not amount:
            return jsonify({
                "success": False,
                "message": "patient_id e amount são obrigatórios"
            }), 400
        
        if amount <= 0:
            return jsonify({
                "success": False,
                "message": "Valor deve ser maior que zero"
            }), 400
        
        if payment_type not in ['credit_card', 'debit_card']:
            return jsonify({
                "success": False,
                "message": "Tipo de pagamento inválido"
            }), 400
        
        result = payment_service.create_card_payment(
            patient_id=patient_id,
            amount=float(amount),
            description=description,
            card_data=card_data,
            payment_type=payment_type,
            appointment_id=appointment_id
        )
        
        if "error" in result:
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 400
        
        return jsonify({
            "success": True,
            "data": result
        }), 201
        
    except Exception as e:
        logger.error(f"Erro ao criar pagamento com cartão: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/boleto', methods=['POST'])
def create_boleto_payment():
    """Criar pagamento por boleto"""
    try:
        data = request.get_json()
        
        patient_id = data.get('patient_id')
        amount = data.get('amount')
        description = data.get('description', 'Consulta Fisioterapia')
        payer_info = data.get('payer_info', {})
        appointment_id = data.get('appointment_id')
        
        if not patient_id or not amount:
            return jsonify({
                "success": False,
                "message": "patient_id e amount são obrigatórios"
            }), 400
        
        if amount <= 0:
            return jsonify({
                "success": False,
                "message": "Valor deve ser maior que zero"
            }), 400
        
        result = payment_service.create_boleto_payment(
            patient_id=patient_id,
            amount=float(amount),
            description=description,
            payer_info=payer_info,
            appointment_id=appointment_id
        )
        
        if "error" in result:
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 400
        
        return jsonify({
            "success": True,
            "data": result
        }), 201
        
    except Exception as e:
        logger.error(f"Erro ao criar boleto: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/status/<transaction_id>', methods=['GET'])
def get_payment_status(transaction_id):
    """Verificar status do pagamento"""
    try:
        result = payment_service.get_payment_status(transaction_id)
        
        if "error" in result:
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 404
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao verificar status do pagamento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/fees', methods=['POST'])
def calculate_fees():
    """Calcular taxas de pagamento"""
    try:
        data = request.get_json()
        
        amount = data.get('amount')
        method = data.get('method')
        
        if not amount or not method:
            return jsonify({
                "success": False,
                "message": "amount e method são obrigatórios"
            }), 400
        
        if amount <= 0:
            return jsonify({
                "success": False,
                "message": "Valor deve ser maior que zero"
            }), 400
        
        result = payment_service.calculate_fees(float(amount), method)
        
        if "error" in result:
            return jsonify({
                "success": False,
                "message": result["error"]
            }), 400
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao calcular taxas: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/webhook/mercadopago', methods=['POST'])
def mercadopago_webhook():
    """Webhook do Mercado Pago"""
    try:
        data = request.get_json()
        
        result = payment_service.process_webhook('mercadopago', data)
        
        logger.info(f"Webhook Mercado Pago processado: {result}")
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no webhook Mercado Pago: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    """Webhook do Stripe"""
    try:
        data = request.get_json()
        
        result = payment_service.process_webhook('stripe', data)
        
        logger.info(f"Webhook Stripe processado: {result}")
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no webhook Stripe: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/stats', methods=['GET'])
def get_payment_stats():
    """Obter estatísticas de pagamentos"""
    try:
        stats = payment_service.get_payment_stats()
        
        return jsonify({
            "success": True,
            "data": stats
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de pagamentos: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/transactions', methods=['GET'])
def list_transactions():
    """Listar transações de pagamento"""
    try:
        # Parâmetros de consulta
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        method = request.args.get('method')
        patient_id = request.args.get('patient_id')
        
        # Simulação de transações
        transactions = [
            {
                "id": "pix_abc123",
                "patient_id": "pat_001",
                "patient_name": "João Silva",
                "amount": 150.00,
                "method": "pix",
                "status": "approved",
                "created_at": "2024-09-15T10:30:00Z",
                "updated_at": "2024-09-15T10:31:00Z",
                "description": "Consulta Fisioterapia"
            },
            {
                "id": "card_def456",
                "patient_id": "pat_002",
                "patient_name": "Maria Santos",
                "amount": 200.00,
                "method": "credit_card",
                "status": "approved",
                "created_at": "2024-09-15T14:15:00Z",
                "updated_at": "2024-09-15T14:16:00Z",
                "description": "Sessão de Fisioterapia"
            },
            {
                "id": "boleto_ghi789",
                "patient_id": "pat_003",
                "patient_name": "Pedro Costa",
                "amount": 300.00,
                "method": "boleto",
                "status": "pending",
                "created_at": "2024-09-15T16:20:00Z",
                "updated_at": "2024-09-15T16:20:00Z",
                "description": "Pacote 4 sessões"
            }
        ]
        
        # Filtrar por status se especificado
        if status:
            transactions = [t for t in transactions if t['status'] == status]
        
        # Filtrar por método se especificado
        if method:
            transactions = [t for t in transactions if t['method'] == method]
        
        # Filtrar por paciente se especificado
        if patient_id:
            transactions = [t for t in transactions if t['patient_id'] == patient_id]
        
        # Paginação simulada
        total = len(transactions)
        start = (page - 1) * per_page
        end = start + per_page
        transactions = transactions[start:end]
        
        return jsonify({
            "success": True,
            "data": {
                "transactions": transactions,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": (total + per_page - 1) // per_page
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar transações: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@payment_bp.route('/cancel/<transaction_id>', methods=['POST'])
def cancel_payment():
    """Cancelar pagamento"""
    try:
        transaction_id = request.view_args['transaction_id']
        data = request.get_json()
        reason = data.get('reason', 'Cancelado pelo usuário')
        
        # Simulação de cancelamento
        result = {
            "transaction_id": transaction_id,
            "status": "cancelled",
            "cancelled_at": datetime.now().isoformat(),
            "reason": reason,
            "simulation_mode": True
        }
        
        return jsonify({
            "success": True,
            "message": "Pagamento cancelado com sucesso",
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao cancelar pagamento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500
