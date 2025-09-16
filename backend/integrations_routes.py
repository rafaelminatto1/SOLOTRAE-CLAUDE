# -*- coding: utf-8 -*-
"""
Integrations Routes - Rotas para sistema de integrações
"""

from flask import Blueprint, request, jsonify
from integrations_service import integrations_service
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

integrations_bp = Blueprint('integrations', __name__, url_prefix='/api/integrations')

# === WHATSAPP ===

@integrations_bp.route('/whatsapp/send', methods=['POST'])
def send_whatsapp():
    """Enviar mensagem WhatsApp"""
    try:
        data = request.get_json()
        
        to = data.get('to')
        message = data.get('message')
        template = data.get('template')
        variables = data.get('variables', {})
        
        if not to or not message:
            return jsonify({
                "success": False,
                "message": "to e message são obrigatórios"
            }), 400
        
        result = integrations_service.send_whatsapp_message(
            to=to,
            message=message,
            template=template,
            variables=variables
        )
        
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
        logger.error(f"Erro ao enviar WhatsApp: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/whatsapp/templates', methods=['GET'])
def get_whatsapp_templates():
    """Obter templates de WhatsApp"""
    try:
        templates = integrations_service.get_whatsapp_templates()
        
        return jsonify({
            "success": True,
            "data": templates
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter templates WhatsApp: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/whatsapp/appointment-confirmation', methods=['POST'])
def send_appointment_confirmation():
    """Enviar confirmação de agendamento via WhatsApp"""
    try:
        data = request.get_json()
        
        patient_phone = data.get('patient_phone')
        patient_name = data.get('patient_name')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        location = data.get('location', 'Clínica FisioFlow')
        
        if not all([patient_phone, patient_name, appointment_date, appointment_time]):
            return jsonify({
                "success": False,
                "message": "patient_phone, patient_name, appointment_date e appointment_time são obrigatórios"
            }), 400
        
        result = integrations_service.send_appointment_confirmation(
            patient_phone=patient_phone,
            patient_name=patient_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            location=location
        )
        
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
        logger.error(f"Erro ao enviar confirmação de agendamento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/whatsapp/payment-confirmation', methods=['POST'])
def send_payment_confirmation():
    """Enviar confirmação de pagamento via WhatsApp"""
    try:
        data = request.get_json()
        
        patient_phone = data.get('patient_phone')
        amount = data.get('amount')
        method = data.get('method')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        
        if not all([patient_phone, amount, method, appointment_date, appointment_time]):
            return jsonify({
                "success": False,
                "message": "Todos os campos são obrigatórios"
            }), 400
        
        result = integrations_service.send_payment_confirmation(
            patient_phone=patient_phone,
            amount=float(amount),
            method=method,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        )
        
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
        logger.error(f"Erro ao enviar confirmação de pagamento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

# === GOOGLE CALENDAR ===

@integrations_bp.route('/google/calendar/event', methods=['POST'])
def create_calendar_event():
    """Criar evento no Google Calendar"""
    try:
        data = request.get_json()
        
        summary = data.get('summary')
        description = data.get('description', '')
        start_datetime = data.get('start_datetime')
        end_datetime = data.get('end_datetime')
        attendees = data.get('attendees', [])
        location = data.get('location')
        
        if not all([summary, start_datetime, end_datetime]):
            return jsonify({
                "success": False,
                "message": "summary, start_datetime e end_datetime são obrigatórios"
            }), 400
        
        # Converter strings para datetime
        try:
            start_dt = datetime.fromisoformat(start_datetime.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_datetime.replace('Z', '+00:00'))
        except ValueError as e:
            return jsonify({
                "success": False,
                "message": f"Formato de data inválido: {e}"
            }), 400
        
        result = integrations_service.create_calendar_event(
            summary=summary,
            description=description,
            start_datetime=start_dt,
            end_datetime=end_dt,
            attendees=attendees,
            location=location
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
        logger.error(f"Erro ao criar evento no calendário: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/google/calendar/sync', methods=['POST'])
def sync_appointments():
    """Sincronizar agendamentos com Google Calendar"""
    try:
        data = request.get_json()
        appointments = data.get('appointments', [])
        
        if not appointments:
            return jsonify({
                "success": False,
                "message": "Lista de agendamentos é obrigatória"
            }), 400
        
        result = integrations_service.sync_appointments_to_calendar(appointments)
        
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
        logger.error(f"Erro ao sincronizar agendamentos: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

# === NOTIFICAÇÕES AUTOMÁTICAS ===

@integrations_bp.route('/notifications/schedule-reminders', methods=['POST'])
def schedule_reminders():
    """Agendar lembretes automáticos"""
    try:
        data = request.get_json()
        appointment = data.get('appointment')
        
        if not appointment:
            return jsonify({
                "success": False,
                "message": "Dados do agendamento são obrigatórios"
            }), 400
        
        result = integrations_service.schedule_appointment_reminders(appointment)
        
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
        logger.error(f"Erro ao agendar lembretes: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/notifications/send-reminder', methods=['POST'])
def send_reminder():
    """Enviar lembrete imediato"""
    try:
        data = request.get_json()
        
        patient_phone = data.get('patient_phone')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        location = data.get('location', 'Clínica FisioFlow')
        
        if not all([patient_phone, appointment_date, appointment_time]):
            return jsonify({
                "success": False,
                "message": "patient_phone, appointment_date e appointment_time são obrigatórios"
            }), 400
        
        result = integrations_service.send_appointment_reminder(
            patient_phone=patient_phone,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            location=location
        )
        
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
        logger.error(f"Erro ao enviar lembrete: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/notifications/exercise-reminder', methods=['POST'])
def send_exercise_reminder():
    """Enviar lembrete de exercícios"""
    try:
        data = request.get_json()
        
        patient_phone = data.get('patient_phone')
        patient_name = data.get('patient_name')
        app_link = data.get('app_link', 'https://app.fisioflow.com')
        
        if not all([patient_phone, patient_name]):
            return jsonify({
                "success": False,
                "message": "patient_phone e patient_name são obrigatórios"
            }), 400
        
        result = integrations_service.send_exercise_reminder(
            patient_phone=patient_phone,
            patient_name=patient_name,
            app_link=app_link
        )
        
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
        logger.error(f"Erro ao enviar lembrete de exercícios: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

# === ESTATÍSTICAS E TESTES ===

@integrations_bp.route('/stats', methods=['GET'])
def get_integration_stats():
    """Obter estatísticas das integrações"""
    try:
        stats = integrations_service.get_integration_stats()
        
        return jsonify({
            "success": True,
            "data": stats
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/test', methods=['POST'])
def test_integrations():
    """Testar todas as integrações"""
    try:
        results = integrations_service.test_integrations()
        
        return jsonify({
            "success": True,
            "data": results
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao testar integrações: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

# === CONFIGURAÇÕES ===

@integrations_bp.route('/config', methods=['GET'])
def get_integration_config():
    """Obter configurações das integrações"""
    try:
        config = {
            "whatsapp": {
                "enabled": bool(integrations_service.twilio_client),
                "provider": "Twilio",
                "from_number": integrations_service.whatsapp_from,
                "templates_count": len(integrations_service.whatsapp_templates)
            },
            "google_calendar": {
                "enabled": bool(integrations_service.google_calendar_service),
                "provider": "Google Calendar API",
                "scopes": integrations_service.google_scopes
            },
            "notifications": {
                "reminder_intervals": ["24h", "2h"],
                "supported_types": ["whatsapp", "email", "sms"]
            },
            "last_updated": datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "data": config
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter configurações: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@integrations_bp.route('/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Webhook para receber respostas do WhatsApp"""
    try:
        data = request.get_json()
        
        # Processar webhook do WhatsApp/Twilio
        # Em produção, validar assinatura do webhook
        
        logger.info(f"Webhook WhatsApp recebido: {data}")
        
        # Processar resposta automática se necessário
        message_body = data.get('Body', '').lower()
        from_number = data.get('From', '')
        
        response_sent = False
        
        # Respostas automáticas básicas
        if 'sim' in message_body or 'confirmo' in message_body:
            # Confirmar presença
            result = integrations_service.send_whatsapp_message(
                to=from_number,
                message="Presença confirmada! Obrigado. Nos vemos na consulta."
            )
            response_sent = True
        elif 'não' in message_body or 'cancelar' in message_body:
            # Cancelamento
            result = integrations_service.send_whatsapp_message(
                to=from_number,
                message="Entendido. Entre em contato conosco para reagendar: (11) 99999-9999"
            )
            response_sent = True
        elif 'ajuda' in message_body or 'help' in message_body:
            # Ajuda
            result = integrations_service.send_whatsapp_message(
                to=from_number,
                message="Como posso ajudar?\n- Digite SIM para confirmar consulta\n- Digite NÃO para cancelar\n- Digite REAGENDAR para remarcar"
            )
            response_sent = True
        
        return jsonify({
            "success": True,
            "data": {
                "message_processed": True,
                "response_sent": response_sent,
                "from": from_number,
                "message": message_body
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no webhook WhatsApp: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500
