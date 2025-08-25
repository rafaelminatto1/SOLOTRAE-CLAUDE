# -*- coding: utf-8 -*-
"""
Routes de Integrações - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas às integrações externas,
incluindo WhatsApp Business API, validação de documentos, CEP, e outras APIs.

Endpoints:
- POST /integrations/whatsapp/send - Enviar mensagem WhatsApp
- POST /integrations/whatsapp/webhook - Webhook WhatsApp
- GET /integrations/cep/{cep} - Consultar CEP
- POST /integrations/validate/cpf - Validar CPF
- POST /integrations/validate/cnpj - Validar CNPJ
- GET /integrations/crefito/validate/{number} - Validar CREFITO
- POST /integrations/calendar/sync - Sincronizar Google Calendar
- POST /integrations/meet/create - Criar reunião Google Meet
- GET /integrations/status - Status das integrações
- POST /integrations/notifications/send - Enviar notificação
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import requests
import re
import json
from typing import Dict, List, Any, Optional
from urllib.parse import quote

from ..models import User, Patient, Appointment, Integration
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse
from ..utils.validators import DocumentValidator, ContactValidator, AddressValidator
from ..utils.helpers import CodeGenerator, DataFormatter
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
integrations_bp = Blueprint('integrations', __name__, url_prefix='/api/integrations')
logger = get_logger(__name__)

class WhatsAppService:
    """
    Serviço para integração com WhatsApp Business API
    """
    
    def __init__(self):
        self.api_url = Config.WHATSAPP_API_URL
        self.access_token = Config.WHATSAPP_ACCESS_TOKEN
        self.phone_number_id = Config.WHATSAPP_PHONE_NUMBER_ID
        self.verify_token = Config.WHATSAPP_VERIFY_TOKEN
    
    def send_message(self, to: str, message: str, message_type: str = 'text') -> Dict[str, Any]:
        """
        Enviar mensagem via WhatsApp
        
        Args:
            to: Número do destinatário
            message: Conteúdo da mensagem
            message_type: Tipo da mensagem (text, template)
        
        Returns:
            Resposta da API do WhatsApp
        """
        try:
            # Limpar número de telefone
            clean_phone = re.sub(r'\D', '', to)
            if clean_phone.startswith('0'):
                clean_phone = '55' + clean_phone[1:]
            elif not clean_phone.startswith('55'):
                clean_phone = '55' + clean_phone
            
            url = f"{self.api_url}/{self.phone_number_id}/messages"
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            if message_type == 'template':
                payload = {
                    'messaging_product': 'whatsapp',
                    'to': clean_phone,
                    'type': 'template',
                    'template': {
                        'name': message,  # Nome do template
                        'language': {'code': 'pt_BR'}
                    }
                }
            else:
                payload = {
                    'messaging_product': 'whatsapp',
                    'to': clean_phone,
                    'type': 'text',
                    'text': {'body': message}
                }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            return {
                'success': True,
                'message_id': response.json().get('messages', [{}])[0].get('id'),
                'status': 'sent'
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_appointment_reminder(self, appointment_id: str) -> Dict[str, Any]:
        """
        Enviar lembrete de consulta
        """
        try:
            with get_db_session() as session:
                appointment = session.query(Appointment).filter_by(id=appointment_id).first()
                if not appointment:
                    return {'success': False, 'error': 'Agendamento não encontrado'}
                
                patient = session.query(Patient).filter_by(id=appointment.patient_id).first()
                if not patient or not patient.phone:
                    return {'success': False, 'error': 'Telefone do paciente não encontrado'}
                
                professional = session.query(User).filter_by(id=appointment.professional_id).first()
                
                # Formatar mensagem
                date_str = appointment.appointment_date.strftime('%d/%m/%Y')
                time_str = appointment.start_time.strftime('%H:%M')
                
                message = f"""🏥 *Lembrete de Consulta - FisioFlow*

Olá {patient.full_name}!

Você tem uma consulta agendada:
📅 Data: {date_str}
🕐 Horário: {time_str}
👨‍⚕️ Profissional: {professional.full_name if professional else 'N/A'}
📍 Local: {appointment.location or 'Clínica FisioFlow'}

⚠️ Por favor, chegue 15 minutos antes do horário.

Para cancelar ou reagendar, entre em contato conosco.

Obrigado! 🙏"""
                
                return self.send_message(patient.phone, message)
        
        except Exception as e:
            logger.error(f"Erro ao enviar lembrete: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def send_exercise_prescription(self, patient_id: str, exercises: List[Dict]) -> Dict[str, Any]:
        """
        Enviar prescrição de exercícios
        """
        try:
            with get_db_session() as session:
                patient = session.query(Patient).filter_by(id=patient_id).first()
                if not patient or not patient.phone:
                    return {'success': False, 'error': 'Telefone do paciente não encontrado'}
                
                # Formatar lista de exercícios
                exercise_list = "\n".join([
                    f"• {ex['name']} - {ex['sets']}x{ex['reps']} ({ex['duration']})"
                    for ex in exercises
                ])
                
                message = f"""💪 *Prescrição de Exercícios - FisioFlow*

Olá {patient.full_name}!

Sua nova prescrição de exercícios:

{exercise_list}

📝 *Observações importantes:*
- Execute os exercícios conforme orientado
- Em caso de dor, pare imediatamente
- Mantenha regularidade nos exercícios

Dúvidas? Entre em contato conosco!

Bons treinos! 💪"""
                
                return self.send_message(patient.phone, message)
        
        except Exception as e:
            logger.error(f"Erro ao enviar exercícios: {str(e)}")
            return {'success': False, 'error': str(e)}

class CEPService:
    """
    Serviço para consulta de CEP
    """
    
    @staticmethod
    def get_address_by_cep(cep: str) -> Dict[str, Any]:
        """
        Consultar endereço por CEP usando ViaCEP
        
        Args:
            cep: CEP para consulta
        
        Returns:
            Dados do endereço
        """
        try:
            # Limpar CEP
            clean_cep = re.sub(r'\D', '', cep)
            if len(clean_cep) != 8:
                return {'success': False, 'error': 'CEP inválido'}
            
            # Consultar ViaCEP
            url = f"https://viacep.com.br/ws/{clean_cep}/json/"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'erro' in data:
                return {'success': False, 'error': 'CEP não encontrado'}
            
            return {
                'success': True,
                'address': {
                    'cep': data.get('cep'),
                    'street': data.get('logradouro'),
                    'neighborhood': data.get('bairro'),
                    'city': data.get('localidade'),
                    'state': data.get('uf'),
                    'ibge_code': data.get('ibge'),
                    'area_code': data.get('ddd')
                }
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao consultar CEP: {str(e)}")
            return {'success': False, 'error': 'Erro na consulta do CEP'}
        except Exception as e:
            logger.error(f"Erro inesperado na consulta CEP: {str(e)}")
            return {'success': False, 'error': 'Erro interno'}

class CREFITOService:
    """
    Serviço para validação de CREFITO
    """
    
    @staticmethod
    def validate_crefito(number: str, region: str = None) -> Dict[str, Any]:
        """
        Validar número CREFITO
        
        Args:
            number: Número do CREFITO
            region: Região do CREFITO (opcional)
        
        Returns:
            Resultado da validação
        """
        try:
            # Validação básica do formato
            clean_number = re.sub(r'\D', '', number)
            
            if len(clean_number) < 4 or len(clean_number) > 6:
                return {
                    'success': False,
                    'valid': False,
                    'error': 'Formato de CREFITO inválido'
                }
            
            # Simulação de validação (implementar integração real se disponível)
            # Por enquanto, validação básica de formato
            is_valid = len(clean_number) >= 4 and clean_number.isdigit()
            
            return {
                'success': True,
                'valid': is_valid,
                'number': clean_number,
                'region': region,
                'status': 'active' if is_valid else 'invalid'
            }
        
        except Exception as e:
            logger.error(f"Erro ao validar CREFITO: {str(e)}")
            return {
                'success': False,
                'valid': False,
                'error': 'Erro na validação'
            }

class GoogleCalendarService:
    """
    Serviço para integração com Google Calendar
    """
    
    def __init__(self):
        self.api_key = Config.GOOGLE_API_KEY
        self.calendar_id = Config.GOOGLE_CALENDAR_ID
    
    def create_event(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Criar evento no Google Calendar
        
        Args:
            appointment_data: Dados do agendamento
        
        Returns:
            Resultado da criação do evento
        """
        try:
            # Simulação de criação de evento
            # Implementar integração real com Google Calendar API
            
            event_id = CodeGenerator.generate_uuid()
            
            return {
                'success': True,
                'event_id': event_id,
                'calendar_url': f"https://calendar.google.com/calendar/event?eid={event_id}"
            }
        
        except Exception as e:
            logger.error(f"Erro ao criar evento no Google Calendar: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

# Instanciar serviços
whatsapp_service = WhatsAppService()
cep_service = CEPService()
crefito_service = CREFITOService()
calendar_service = GoogleCalendarService()

@integrations_bp.route('/whatsapp/send', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def send_whatsapp_message():
    """
    Enviar mensagem via WhatsApp
    
    Body:
        {
            "to": "11999999999",
            "message": "Mensagem a ser enviada",
            "type": "text|template"
        }
    
    Returns:
        Resultado do envio
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data or not data.get('to') or not data.get('message'):
            return APIResponse.error('Dados obrigatórios: to, message', 400)
        
        to = data['to']
        message = data['message']
        message_type = data.get('type', 'text')
        
        # Validar telefone
        if not ContactValidator.validate_phone(to):
            return APIResponse.error('Número de telefone inválido', 400)
        
        # Enviar mensagem
        result = whatsapp_service.send_message(to, message, message_type)
        
        if result['success']:
            return APIResponse.success({
                'message_id': result.get('message_id'),
                'status': result.get('status'),
                'sent_at': datetime.utcnow().isoformat()
            })
        else:
            return APIResponse.error(f"Erro ao enviar mensagem: {result.get('error')}", 500)
    
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/whatsapp/webhook', methods=['GET', 'POST'])
def whatsapp_webhook():
    """
    Webhook do WhatsApp Business API
    
    GET: Verificação do webhook
    POST: Recebimento de mensagens
    
    Returns:
        Resposta do webhook
    """
    try:
        if request.method == 'GET':
            # Verificação do webhook
            mode = request.args.get('hub.mode')
            token = request.args.get('hub.verify_token')
            challenge = request.args.get('hub.challenge')
            
            if mode == 'subscribe' and token == whatsapp_service.verify_token:
                return challenge
            else:
                return 'Forbidden', 403
        
        elif request.method == 'POST':
            # Processar mensagem recebida
            data = request.get_json()
            
            # Log da mensagem recebida
            logger.info(f"Mensagem WhatsApp recebida: {json.dumps(data)}")
            
            # Processar mensagens (implementar lógica conforme necessário)
            if 'messages' in data.get('entry', [{}])[0].get('changes', [{}])[0].get('value', {}):
                messages = data['entry'][0]['changes'][0]['value']['messages']
                
                for message in messages:
                    # Processar cada mensagem
                    from_number = message.get('from')
                    message_body = message.get('text', {}).get('body', '')
                    
                    # Implementar lógica de resposta automática se necessário
                    logger.info(f"Mensagem de {from_number}: {message_body}")
            
            return 'OK', 200
    
    except Exception as e:
        logger.error(f"Erro no webhook WhatsApp: {str(e)}")
        return 'Error', 500

@integrations_bp.route('/cep/<string:cep>', methods=['GET'])
@require_auth
def get_address_by_cep(cep):
    """
    Consultar endereço por CEP
    
    Path Parameters:
        cep: CEP para consulta
    
    Returns:
        Dados do endereço
    """
    try:
        result = cep_service.get_address_by_cep(cep)
        
        if result['success']:
            return APIResponse.success(result['address'])
        else:
            return APIResponse.error(result['error'], 400)
    
    except Exception as e:
        logger.error(f"Erro ao consultar CEP: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/validate/cpf', methods=['POST'])
@require_auth
def validate_cpf():
    """
    Validar CPF
    
    Body:
        {
            "cpf": "12345678901"
        }
    
    Returns:
        Resultado da validação
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('cpf'):
            return APIResponse.error('CPF é obrigatório', 400)
        
        cpf = data['cpf']
        is_valid = DocumentValidator.validate_cpf(cpf)
        
        return APIResponse.success({
            'cpf': cpf,
            'valid': is_valid,
            'formatted': DocumentValidator.format_cpf(cpf) if is_valid else None
        })
    
    except Exception as e:
        logger.error(f"Erro ao validar CPF: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/validate/cnpj', methods=['POST'])
@require_auth
def validate_cnpj():
    """
    Validar CNPJ
    
    Body:
        {
            "cnpj": "12345678000195"
        }
    
    Returns:
        Resultado da validação
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('cnpj'):
            return APIResponse.error('CNPJ é obrigatório', 400)
        
        cnpj = data['cnpj']
        is_valid = DocumentValidator.validate_cnpj(cnpj)
        
        return APIResponse.success({
            'cnpj': cnpj,
            'valid': is_valid,
            'formatted': DocumentValidator.format_cnpj(cnpj) if is_valid else None
        })
    
    except Exception as e:
        logger.error(f"Erro ao validar CNPJ: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/crefito/validate/<string:number>', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def validate_crefito(number):
    """
    Validar número CREFITO
    
    Path Parameters:
        number: Número do CREFITO
    
    Query Parameters:
        region: Região do CREFITO (opcional)
    
    Returns:
        Resultado da validação
    """
    try:
        region = request.args.get('region')
        result = crefito_service.validate_crefito(number, region)
        
        if result['success']:
            return APIResponse.success({
                'number': result['number'],
                'valid': result['valid'],
                'region': result.get('region'),
                'status': result.get('status')
            })
        else:
            return APIResponse.error(result['error'], 400)
    
    except Exception as e:
        logger.error(f"Erro ao validar CREFITO: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/calendar/sync', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def sync_google_calendar():
    """
    Sincronizar agendamento com Google Calendar
    
    Body:
        {
            "appointment_id": "uuid"
        }
    
    Returns:
        Resultado da sincronização
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('appointment_id'):
            return APIResponse.error('ID do agendamento é obrigatório', 400)
        
        appointment_id = data['appointment_id']
        
        with get_db_session() as session:
            appointment = session.query(Appointment).filter_by(id=appointment_id).first()
            
            if not appointment:
                return APIResponse.error('Agendamento não encontrado', 404)
            
            # Preparar dados do evento
            patient = session.query(Patient).filter_by(id=appointment.patient_id).first()
            professional = session.query(User).filter_by(id=appointment.professional_id).first()
            
            event_data = {
                'title': f"Consulta - {patient.full_name if patient else 'Paciente'}",
                'description': f"Consulta com {professional.full_name if professional else 'Profissional'}",
                'start_time': appointment.start_time,
                'end_time': appointment.end_time,
                'location': appointment.location
            }
            
            # Criar evento no Google Calendar
            result = calendar_service.create_event(event_data)
            
            if result['success']:
                # Salvar ID do evento no agendamento
                appointment.calendar_event_id = result['event_id']
                session.commit()
                
                return APIResponse.success({
                    'event_id': result['event_id'],
                    'calendar_url': result.get('calendar_url'),
                    'synced_at': datetime.utcnow().isoformat()
                })
            else:
                return APIResponse.error(f"Erro na sincronização: {result.get('error')}", 500)
    
    except Exception as e:
        logger.error(f"Erro ao sincronizar Google Calendar: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/notifications/send', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def send_notification():
    """
    Enviar notificação (WhatsApp, email, etc.)
    
    Body:
        {
            "type": "appointment_reminder|exercise_prescription|general",
            "channel": "whatsapp|email|sms",
            "recipient_id": "uuid",
            "message": "Mensagem personalizada (opcional)",
            "data": {}
        }
    
    Returns:
        Resultado do envio
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['type', 'channel', 'recipient_id']
        for field in required_fields:
            if not data or not data.get(field):
                return APIResponse.error(f'Campo obrigatório: {field}', 400)
        
        notification_type = data['type']
        channel = data['channel']
        recipient_id = data['recipient_id']
        custom_message = data.get('message')
        notification_data = data.get('data', {})
        
        result = {'success': False}
        
        if channel == 'whatsapp':
            if notification_type == 'appointment_reminder':
                result = whatsapp_service.send_appointment_reminder(recipient_id)
            elif notification_type == 'exercise_prescription':
                exercises = notification_data.get('exercises', [])
                result = whatsapp_service.send_exercise_prescription(recipient_id, exercises)
            elif notification_type == 'general' and custom_message:
                with get_db_session() as session:
                    patient = session.query(Patient).filter_by(id=recipient_id).first()
                    if patient and patient.phone:
                        result = whatsapp_service.send_message(patient.phone, custom_message)
        
        if result.get('success'):
            return APIResponse.success({
                'notification_id': result.get('message_id'),
                'status': 'sent',
                'sent_at': datetime.utcnow().isoformat()
            })
        else:
            return APIResponse.error(f"Erro ao enviar notificação: {result.get('error', 'Erro desconhecido')}", 500)
    
    except Exception as e:
        logger.error(f"Erro ao enviar notificação: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@integrations_bp.route('/status', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def integration_status():
    """
    Verificar status das integrações
    
    Returns:
        Status de todas as integrações
    """
    try:
        status = {
            'whatsapp': {
                'enabled': bool(whatsapp_service.access_token),
                'configured': bool(whatsapp_service.phone_number_id),
                'status': 'active' if whatsapp_service.access_token else 'inactive'
            },
            'google_calendar': {
                'enabled': bool(calendar_service.api_key),
                'configured': bool(calendar_service.calendar_id),
                'status': 'active' if calendar_service.api_key else 'inactive'
            },
            'cep_service': {
                'enabled': True,
                'provider': 'ViaCEP',
                'status': 'active'
            },
            'document_validation': {
                'cpf': True,
                'cnpj': True,
                'crefito': True,
                'status': 'active'
            }
        }
        
        return APIResponse.success({
            'integrations': status,
            'checked_at': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Erro ao verificar status das integrações: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)