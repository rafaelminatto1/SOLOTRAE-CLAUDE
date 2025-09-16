# -*- coding: utf-8 -*-
"""
Payment Service - Sistema de Pagamentos para FisioFlow
"""

import os
import json
import uuid
import mercadopago
import stripe
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class PaymentMethod:
    id: str
    name: str
    type: str  # 'pix', 'credit_card', 'debit_card', 'boleto'
    enabled: bool
    fee_percentage: float
    processing_time: str

@dataclass
class PaymentTransaction:
    id: str
    patient_id: str
    appointment_id: Optional[str]
    amount: float
    method: str
    status: str  # 'pending', 'approved', 'rejected', 'cancelled'
    created_at: datetime
    updated_at: datetime
    external_id: Optional[str] = None
    payment_url: Optional[str] = None
    qr_code: Optional[str] = None

class PaymentService:
    def __init__(self):
        self.mercadopago_client = None
        self.stripe_client = None
        
        # Configurações do Mercado Pago
        self.mp_access_token = os.getenv('MERCADOPAGO_ACCESS_TOKEN', 'TEST-demo-token')
        self.mp_public_key = os.getenv('MERCADOPAGO_PUBLIC_KEY', 'TEST-demo-public-key')
        
        # Configurações do Stripe
        self.stripe_secret_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_demo_key')
        self.stripe_public_key = os.getenv('STRIPE_PUBLIC_KEY', 'pk_test_demo_key')
        
        # Métodos de pagamento disponíveis
        self.payment_methods = [
            PaymentMethod(
                id='pix',
                name='PIX',
                type='pix',
                enabled=True,
                fee_percentage=0.99,
                processing_time='Instantâneo'
            ),
            PaymentMethod(
                id='credit_card',
                name='Cartão de Crédito',
                type='credit_card',
                enabled=True,
                fee_percentage=3.99,
                processing_time='1-2 dias úteis'
            ),
            PaymentMethod(
                id='debit_card',
                name='Cartão de Débito',
                type='debit_card',
                enabled=True,
                fee_percentage=2.99,
                processing_time='Instantâneo'
            ),
            PaymentMethod(
                id='boleto',
                name='Boleto Bancário',
                type='boleto',
                enabled=True,
                fee_percentage=3.49,
                processing_time='1-3 dias úteis'
            ),
            PaymentMethod(
                id='cash',
                name='Dinheiro',
                type='cash',
                enabled=True,
                fee_percentage=0.0,
                processing_time='Instantâneo'
            )
        ]
        
        self.initialize_clients()
    
    def initialize_clients(self):
        """Inicializar clientes de pagamento"""
        try:
            # Mercado Pago
            if self.mp_access_token and self.mp_access_token.startswith(('APP_', 'TEST-')):
                self.mercadopago_client = mercadopago.SDK(self.mp_access_token)
                logger.info("Cliente Mercado Pago inicializado")
            else:
                logger.warning("Token do Mercado Pago não configurado - usando modo simulação")
            
            # Stripe
            if self.stripe_secret_key and self.stripe_secret_key.startswith('sk_'):
                stripe.api_key = self.stripe_secret_key
                self.stripe_client = stripe
                logger.info("Cliente Stripe inicializado")
            else:
                logger.warning("Chave do Stripe não configurada - usando modo simulação")
                
        except Exception as e:
            logger.error(f"Erro ao inicializar clientes de pagamento: {e}")
    
    def get_payment_methods(self) -> List[Dict[str, Any]]:
        """Obter métodos de pagamento disponíveis"""
        return [
            {
                'id': method.id,
                'name': method.name,
                'type': method.type,
                'enabled': method.enabled,
                'fee_percentage': method.fee_percentage,
                'processing_time': method.processing_time,
                'icon': self._get_payment_icon(method.type)
            }
            for method in self.payment_methods if method.enabled
        ]
    
    def _get_payment_icon(self, payment_type: str) -> str:
        """Obter ícone do método de pagamento"""
        icons = {
            'pix': '🔄',
            'credit_card': '💳',
            'debit_card': '💳',
            'boleto': '📄',
            'cash': '💰'
        }
        return icons.get(payment_type, '💳')
    
    def create_pix_payment(
        self, 
        patient_id: str, 
        amount: float, 
        description: str,
        appointment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Criar pagamento PIX"""
        try:
            transaction_id = f"pix_{uuid.uuid4().hex[:8]}"
            
            if self.mercadopago_client:
                # Usar Mercado Pago real
                preference_data = {
                    "items": [
                        {
                            "title": description,
                            "quantity": 1,
                            "unit_price": amount
                        }
                    ],
                    "payment_methods": {
                        "excluded_payment_types": [
                            {"id": "credit_card"},
                            {"id": "debit_card"},
                            {"id": "ticket"}
                        ]
                    },
                    "external_reference": transaction_id,
                    "expires": True,
                    "expiration_date_from": datetime.now().isoformat(),
                    "expiration_date_to": (datetime.now() + timedelta(hours=24)).isoformat()
                }
                
                preference_response = self.mercadopago_client.preference().create(preference_data)
                
                if preference_response["status"] == 201:
                    preference = preference_response["response"]
                    return {
                        "transaction_id": transaction_id,
                        "status": "pending",
                        "payment_url": preference["init_point"],
                        "qr_code": preference.get("qr_code"),
                        "external_id": preference["id"],
                        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
                    }
            
            # Modo simulação
            return self._simulate_pix_payment(transaction_id, amount, description)
            
        except Exception as e:
            logger.error(f"Erro ao criar pagamento PIX: {e}")
            return {"error": str(e)}
    
    def _simulate_pix_payment(self, transaction_id: str, amount: float, description: str) -> Dict[str, Any]:
        """Simular pagamento PIX"""
        return {
            "transaction_id": transaction_id,
            "status": "pending",
            "payment_url": f"https://simulate-pix.fisioflow.com/pay/{transaction_id}",
            "qr_code": f"00020126580014BR.GOV.BCB.PIX0136{transaction_id}520400005303986540{amount:.2f}5802BR5913FISIOFLOW6009SAO PAULO62070503***6304",
            "qr_code_image": f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "external_id": f"mp_{transaction_id}",
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
            "instructions": [
                "Abra o app do seu banco",
                "Escolha a opção PIX",
                "Escaneie o QR Code ou cole o código",
                "Confirme o pagamento"
            ],
            "amount": amount,
            "description": description,
            "simulation_mode": True
        }
    
    def create_card_payment(
        self,
        patient_id: str,
        amount: float,
        description: str,
        card_data: Dict[str, Any],
        payment_type: str = 'credit_card',
        appointment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Criar pagamento com cartão"""
        try:
            transaction_id = f"card_{uuid.uuid4().hex[:8]}"
            
            if self.stripe_client and payment_type in ['credit_card', 'debit_card']:
                # Usar Stripe real
                intent = stripe.PaymentIntent.create(
                    amount=int(amount * 100),  # Stripe usa centavos
                    currency='brl',
                    payment_method_types=['card'],
                    description=description,
                    metadata={
                        'patient_id': patient_id,
                        'appointment_id': appointment_id or '',
                        'transaction_id': transaction_id
                    }
                )
                
                return {
                    "transaction_id": transaction_id,
                    "status": "pending",
                    "client_secret": intent.client_secret,
                    "external_id": intent.id,
                    "amount": amount,
                    "currency": "BRL"
                }
            
            # Modo simulação
            return self._simulate_card_payment(transaction_id, amount, description, payment_type)
            
        except Exception as e:
            logger.error(f"Erro ao criar pagamento com cartão: {e}")
            return {"error": str(e)}
    
    def _simulate_card_payment(self, transaction_id: str, amount: float, description: str, payment_type: str) -> Dict[str, Any]:
        """Simular pagamento com cartão"""
        return {
            "transaction_id": transaction_id,
            "status": "approved",  # Simulação sempre aprova
            "external_id": f"stripe_{transaction_id}",
            "amount": amount,
            "payment_type": payment_type,
            "description": description,
            "authorization_code": f"AUTH_{uuid.uuid4().hex[:6].upper()}",
            "last_four_digits": "1234",
            "brand": "visa",
            "installments": 1,
            "simulation_mode": True,
            "approved_at": datetime.now().isoformat()
        }
    
    def create_boleto_payment(
        self,
        patient_id: str,
        amount: float,
        description: str,
        payer_info: Dict[str, Any],
        appointment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Criar pagamento por boleto"""
        try:
            transaction_id = f"boleto_{uuid.uuid4().hex[:8]}"
            
            if self.mercadopago_client:
                # Usar Mercado Pago real para boleto
                payment_data = {
                    "transaction_amount": amount,
                    "description": description,
                    "payment_method_id": "bolbradesco",
                    "payer": {
                        "email": payer_info.get("email", "patient@fisioflow.com"),
                        "first_name": payer_info.get("first_name", "Paciente"),
                        "last_name": payer_info.get("last_name", "FisioFlow"),
                        "identification": {
                            "type": payer_info.get("doc_type", "CPF"),
                            "number": payer_info.get("doc_number", "12345678901")
                        }
                    },
                    "external_reference": transaction_id
                }
                
                payment_response = self.mercadopago_client.payment().create(payment_data)
                
                if payment_response["status"] == 201:
                    payment = payment_response["response"]
                    return {
                        "transaction_id": transaction_id,
                        "status": "pending",
                        "external_id": payment["id"],
                        "barcode": payment["barcode"]["content"],
                        "pdf_url": payment["transaction_details"]["external_resource_url"],
                        "due_date": payment["date_of_expiration"]
                    }
            
            # Modo simulação
            return self._simulate_boleto_payment(transaction_id, amount, description)
            
        except Exception as e:
            logger.error(f"Erro ao criar boleto: {e}")
            return {"error": str(e)}
    
    def _simulate_boleto_payment(self, transaction_id: str, amount: float, description: str) -> Dict[str, Any]:
        """Simular pagamento por boleto"""
        due_date = datetime.now() + timedelta(days=3)
        barcode = f"34191.79001.01234.567890.12345.678901.2.{int(amount*100):010d}"
        
        return {
            "transaction_id": transaction_id,
            "status": "pending",
            "external_id": f"boleto_{transaction_id}",
            "barcode": barcode,
            "barcode_number": barcode.replace(".", ""),
            "pdf_url": f"https://simulate-boleto.fisioflow.com/pdf/{transaction_id}",
            "due_date": due_date.isoformat(),
            "amount": amount,
            "description": description,
            "instructions": [
                "Pague o boleto em qualquer banco, lotérica ou app bancário",
                "O pagamento será processado em até 2 dias úteis",
                "Guarde o comprovante de pagamento"
            ],
            "simulation_mode": True
        }
    
    def get_payment_status(self, transaction_id: str) -> Dict[str, Any]:
        """Verificar status do pagamento"""
        try:
            # Em uma implementação real, consultaria o banco de dados
            # e/ou APIs dos provedores de pagamento
            
            # Simulação baseada no ID
            if transaction_id.startswith('pix_'):
                return {
                    "transaction_id": transaction_id,
                    "status": "approved" if len(transaction_id) % 2 == 0 else "pending",
                    "updated_at": datetime.now().isoformat(),
                    "simulation_mode": True
                }
            elif transaction_id.startswith('card_'):
                return {
                    "transaction_id": transaction_id,
                    "status": "approved",
                    "updated_at": datetime.now().isoformat(),
                    "simulation_mode": True
                }
            elif transaction_id.startswith('boleto_'):
                return {
                    "transaction_id": transaction_id,
                    "status": "pending",
                    "updated_at": datetime.now().isoformat(),
                    "simulation_mode": True
                }
            else:
                return {"error": "Transaction not found"}
                
        except Exception as e:
            logger.error(f"Erro ao verificar status do pagamento: {e}")
            return {"error": str(e)}
    
    def process_webhook(self, provider: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Processar webhook de pagamento"""
        try:
            if provider == 'mercadopago':
                return self._process_mercadopago_webhook(data)
            elif provider == 'stripe':
                return self._process_stripe_webhook(data)
            else:
                return {"error": "Unknown provider"}
                
        except Exception as e:
            logger.error(f"Erro ao processar webhook: {e}")
            return {"error": str(e)}
    
    def _process_mercadopago_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Processar webhook do Mercado Pago"""
        # Implementar lógica de webhook do MP
        return {"status": "processed", "provider": "mercadopago"}
    
    def _process_stripe_webhook(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Processar webhook do Stripe"""
        # Implementar lógica de webhook do Stripe
        return {"status": "processed", "provider": "stripe"}
    
    def calculate_fees(self, amount: float, method: str) -> Dict[str, Any]:
        """Calcular taxas de pagamento"""
        payment_method = next((pm for pm in self.payment_methods if pm.id == method), None)
        
        if not payment_method:
            return {"error": "Payment method not found"}
        
        fee_amount = amount * (payment_method.fee_percentage / 100)
        net_amount = amount - fee_amount
        
        return {
            "amount": amount,
            "fee_percentage": payment_method.fee_percentage,
            "fee_amount": round(fee_amount, 2),
            "net_amount": round(net_amount, 2),
            "method": method,
            "method_name": payment_method.name
        }
    
    def get_payment_stats(self) -> Dict[str, Any]:
        """Obter estatísticas de pagamentos"""
        # Simulação de estatísticas
        return {
            "total_transactions": 1247,
            "total_amount": 89650.50,
            "approved_transactions": 1189,
            "pending_transactions": 32,
            "rejected_transactions": 26,
            "approval_rate": 95.3,
            "methods_distribution": {
                "pix": 45.2,
                "credit_card": 32.1,
                "debit_card": 12.8,
                "boleto": 7.3,
                "cash": 2.6
            },
            "average_ticket": 71.93,
            "last_updated": datetime.now().isoformat()
        }

# Instância global do serviço de pagamentos
payment_service = PaymentService()
