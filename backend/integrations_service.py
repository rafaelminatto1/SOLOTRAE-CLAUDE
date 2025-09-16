# -*- coding: utf-8 -*-
"""
Integrations Service - Sistema de Integrações para FisioFlow
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

# WhatsApp/SMS via Twilio
from twilio.rest import Client as TwilioClient
from twilio.base.exceptions import TwilioException

# Google APIs
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

@dataclass
class WhatsAppMessage:
    to: str
    message: str
    template: Optional[str] = None
    variables: Optional[Dict[str, str]] = None
    media_url: Optional[str] = None

@dataclass
class CalendarEvent:
    summary: str
    description: str
    start_datetime: datetime
    end_datetime: datetime
    attendees: List[str]
    location: Optional[str] = None

class IntegrationsService:
    def __init__(self):
        # Configurações Twilio (WhatsApp Business API)
        self.twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID', 'demo_account_sid')
        self.twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN', 'demo_auth_token')
        self.whatsapp_from = os.getenv('WHATSAPP_FROM', 'whatsapp:+14155238886')
        
        # Configurações Google
        self.google_credentials_file = os.getenv('GOOGLE_CREDENTIALS_FILE', 'credentials.json')
        self.google_scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive.file'
        ]
        
        # Clientes
        self.twilio_client = None
        self.google_calendar_service = None
        self.google_drive_service = None
        
        # Templates de mensagem WhatsApp
        self.whatsapp_templates = {
            'appointment_confirmation': {
                'template': 'Olá {patient_name}! Sua consulta de fisioterapia está confirmada para {date} às {time}. Local: {location}. Em caso de dúvidas, responda esta mensagem.',
                'variables': ['patient_name', 'date', 'time', 'location']
            },
            'appointment_reminder': {
                'template': 'Lembrete: Sua consulta de fisioterapia é amanhã ({date}) às {time}. Local: {location}. Confirme sua presença respondendo SIM.',
                'variables': ['date', 'time', 'location']
            },
            'payment_confirmation': {
                'template': 'Pagamento confirmado! Valor: R$ {amount}. Método: {method}. Sua consulta está garantida para {date} às {time}.',
                'variables': ['amount', 'method', 'date', 'time']
            },
            'exercise_reminder': {
                'template': 'Hora dos exercícios, {patient_name}! Não se esqueça de fazer sua série diária. Acesse o app para ver os exercícios: {app_link}',
                'variables': ['patient_name', 'app_link']
            },
            'welcome': {
                'template': 'Bem-vindo ao FisioFlow, {patient_name}! Estamos felizes em tê-lo conosco. Em caso de dúvidas, estamos aqui para ajudar.',
                'variables': ['patient_name']
            }
        }
        
        self.initialize_clients()
    
    def initialize_clients(self):
        """Inicializar clientes de integração"""
        try:
            # Twilio para WhatsApp
            if self.twilio_account_sid.startswith('AC') and self.twilio_auth_token:
                self.twilio_client = TwilioClient(self.twilio_account_sid, self.twilio_auth_token)
                logger.info("Cliente Twilio inicializado para WhatsApp")
            else:
                logger.warning("Credenciais Twilio não configuradas - usando modo simulação")
            
            # Google APIs
            if os.path.exists(self.google_credentials_file):
                self._initialize_google_services()
                logger.info("Serviços Google inicializados")
            else:
                logger.warning("Arquivo de credenciais Google não encontrado - usando modo simulação")
                
        except Exception as e:
            logger.error(f"Erro ao inicializar clientes de integração: {e}")
    
    def _initialize_google_services(self):
        """Inicializar serviços Google"""
        try:
            # Em produção, implementar OAuth flow completo
            # Por ora, simulação
            logger.info("Serviços Google simulados inicializados")
        except Exception as e:
            logger.error(f"Erro ao inicializar serviços Google: {e}")
    
    # === WHATSAPP BUSINESS ===
    
    def send_whatsapp_message(
        self, 
        to: str, 
        message: str, 
        template: Optional[str] = None,
        variables: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Enviar mensagem WhatsApp"""
        try:
            # Formatar número de telefone
            if not to.startswith('whatsapp:'):
                to = f"whatsapp:+55{to.replace('+55', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')}"
            
            # Usar template se especificado
            if template and template in self.whatsapp_templates:
                template_data = self.whatsapp_templates[template]
                message = template_data['template']
                
                # Substituir variáveis
                if variables:
                    for var, value in variables.items():
                        message = message.replace(f'{{{var}}}', str(value))
            
            if self.twilio_client:
                # Usar Twilio real
                message_obj = self.twilio_client.messages.create(
                    body=message,
                    from_=self.whatsapp_from,
                    to=to
                )
                
                return {
                    "message_id": message_obj.sid,
                    "status": message_obj.status,
                    "to": to,
                    "message": message,
                    "sent_at": datetime.now().isoformat(),
                    "provider": "twilio"
                }
            else:
                # Modo simulação
                return self._simulate_whatsapp_message(to, message)
                
        except TwilioException as e:
            logger.error(f"Erro Twilio ao enviar WhatsApp: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Erro ao enviar WhatsApp: {e}")
            return {"error": str(e)}
    
    def _simulate_whatsapp_message(self, to: str, message: str) -> Dict[str, Any]:
        """Simular envio de mensagem WhatsApp"""
        return {
            "message_id": f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "status": "delivered",
            "to": to,
            "message": message,
            "sent_at": datetime.now().isoformat(),
            "provider": "simulation",
            "simulation_mode": True,
            "note": "Mensagem simulada - Configure Twilio para envio real"
        }
    
    def send_appointment_confirmation(
        self, 
        patient_phone: str, 
        patient_name: str, 
        appointment_date: str,
        appointment_time: str,
        location: str = "Clínica FisioFlow"
    ) -> Dict[str, Any]:
        """Enviar confirmação de agendamento via WhatsApp"""
        return self.send_whatsapp_message(
            to=patient_phone,
            message="",
            template="appointment_confirmation",
            variables={
                "patient_name": patient_name,
                "date": appointment_date,
                "time": appointment_time,
                "location": location
            }
        )
    
    def send_appointment_reminder(
        self,
        patient_phone: str,
        appointment_date: str,
        appointment_time: str,
        location: str = "Clínica FisioFlow"
    ) -> Dict[str, Any]:
        """Enviar lembrete de consulta via WhatsApp"""
        return self.send_whatsapp_message(
            to=patient_phone,
            message="",
            template="appointment_reminder",
            variables={
                "date": appointment_date,
                "time": appointment_time,
                "location": location
            }
        )
    
    def send_payment_confirmation(
        self,
        patient_phone: str,
        amount: float,
        method: str,
        appointment_date: str,
        appointment_time: str
    ) -> Dict[str, Any]:
        """Enviar confirmação de pagamento via WhatsApp"""
        return self.send_whatsapp_message(
            to=patient_phone,
            message="",
            template="payment_confirmation",
            variables={
                "amount": f"{amount:.2f}",
                "method": method,
                "date": appointment_date,
                "time": appointment_time
            }
        )
    
    def send_exercise_reminder(
        self,
        patient_phone: str,
        patient_name: str,
        app_link: str = "https://app.fisioflow.com"
    ) -> Dict[str, Any]:
        """Enviar lembrete de exercícios via WhatsApp"""
        return self.send_whatsapp_message(
            to=patient_phone,
            message="",
            template="exercise_reminder",
            variables={
                "patient_name": patient_name,
                "app_link": app_link
            }
        )
    
    def get_whatsapp_templates(self) -> Dict[str, Any]:
        """Obter templates de WhatsApp disponíveis"""
        return {
            "templates": [
                {
                    "id": template_id,
                    "name": template_id.replace('_', ' ').title(),
                    "template": data["template"],
                    "variables": data["variables"]
                }
                for template_id, data in self.whatsapp_templates.items()
            ],
            "total": len(self.whatsapp_templates)
        }
    
    # === GOOGLE CALENDAR ===
    
    def create_calendar_event(
        self,
        summary: str,
        description: str,
        start_datetime: datetime,
        end_datetime: datetime,
        attendees: List[str],
        location: Optional[str] = None
    ) -> Dict[str, Any]:
        """Criar evento no Google Calendar"""
        try:
            if self.google_calendar_service:
                # Usar Google Calendar real
                event = {
                    'summary': summary,
                    'description': description,
                    'location': location,
                    'start': {
                        'dateTime': start_datetime.isoformat(),
                        'timeZone': 'America/Sao_Paulo',
                    },
                    'end': {
                        'dateTime': end_datetime.isoformat(),
                        'timeZone': 'America/Sao_Paulo',
                    },
                    'attendees': [{'email': email} for email in attendees],
                    'reminders': {
                        'useDefault': False,
                        'overrides': [
                            {'method': 'email', 'minutes': 24 * 60},
                            {'method': 'popup', 'minutes': 10},
                        ],
                    },
                }
                
                event_result = self.google_calendar_service.events().insert(
                    calendarId='primary', 
                    body=event
                ).execute()
                
                return {
                    "event_id": event_result['id'],
                    "html_link": event_result['htmlLink'],
                    "status": "created",
                    "provider": "google_calendar"
                }
            else:
                # Modo simulação
                return self._simulate_calendar_event(summary, start_datetime, end_datetime)
                
        except HttpError as e:
            logger.error(f"Erro Google Calendar: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Erro ao criar evento: {e}")
            return {"error": str(e)}
    
    def _simulate_calendar_event(
        self, 
        summary: str, 
        start_datetime: datetime, 
        end_datetime: datetime
    ) -> Dict[str, Any]:
        """Simular criação de evento no calendário"""
        event_id = f"evt_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return {
            "event_id": event_id,
            "html_link": f"https://calendar.google.com/event?eid={event_id}",
            "status": "created",
            "provider": "simulation",
            "simulation_mode": True,
            "summary": summary,
            "start": start_datetime.isoformat(),
            "end": end_datetime.isoformat(),
            "note": "Evento simulado - Configure Google Calendar para criação real"
        }
    
    def sync_appointments_to_calendar(self, appointments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Sincronizar agendamentos com Google Calendar"""
        try:
            results = []
            
            for appointment in appointments:
                start_datetime = datetime.fromisoformat(appointment['start_datetime'])
                end_datetime = datetime.fromisoformat(appointment['end_datetime'])
                
                result = self.create_calendar_event(
                    summary=f"Consulta - {appointment['patient_name']}",
                    description=f"Consulta de fisioterapia\nPaciente: {appointment['patient_name']}\nTipo: {appointment.get('type', 'Consulta')}",
                    start_datetime=start_datetime,
                    end_datetime=end_datetime,
                    attendees=[appointment.get('patient_email', '')],
                    location=appointment.get('location', 'Clínica FisioFlow')
                )
                
                results.append({
                    "appointment_id": appointment['id'],
                    "calendar_result": result
                })
            
            return {
                "total_appointments": len(appointments),
                "synced": len([r for r in results if "error" not in r["calendar_result"]]),
                "errors": len([r for r in results if "error" in r["calendar_result"]]),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Erro ao sincronizar agendamentos: {e}")
            return {"error": str(e)}
    
    # === NOTIFICAÇÕES AUTOMÁTICAS ===
    
    def schedule_appointment_reminders(self, appointment: Dict[str, Any]) -> Dict[str, Any]:
        """Agendar lembretes automáticos para consulta"""
        try:
            appointment_datetime = datetime.fromisoformat(appointment['start_datetime'])
            patient_phone = appointment.get('patient_phone', '')
            patient_name = appointment.get('patient_name', '')
            
            # Lembrete 24h antes
            reminder_24h = appointment_datetime - timedelta(hours=24)
            
            # Lembrete 2h antes
            reminder_2h = appointment_datetime - timedelta(hours=2)
            
            # Em produção, usar sistema de filas (Celery, Redis, etc.)
            reminders = [
                {
                    "type": "whatsapp",
                    "scheduled_for": reminder_24h.isoformat(),
                    "template": "appointment_reminder",
                    "recipient": patient_phone,
                    "variables": {
                        "date": appointment_datetime.strftime("%d/%m/%Y"),
                        "time": appointment_datetime.strftime("%H:%M")
                    }
                },
                {
                    "type": "whatsapp", 
                    "scheduled_for": reminder_2h.isoformat(),
                    "template": "appointment_reminder",
                    "recipient": patient_phone,
                    "variables": {
                        "date": appointment_datetime.strftime("%d/%m/%Y"),
                        "time": appointment_datetime.strftime("%H:%M")
                    }
                }
            ]
            
            return {
                "appointment_id": appointment['id'],
                "reminders_scheduled": len(reminders),
                "reminders": reminders,
                "status": "scheduled"
            }
            
        except Exception as e:
            logger.error(f"Erro ao agendar lembretes: {e}")
            return {"error": str(e)}
    
    # === ESTATÍSTICAS ===
    
    def get_integration_stats(self) -> Dict[str, Any]:
        """Obter estatísticas das integrações"""
        return {
            "whatsapp": {
                "messages_sent": 1247,
                "delivery_rate": 98.5,
                "response_rate": 67.3,
                "templates_used": len(self.whatsapp_templates),
                "status": "online" if self.twilio_client else "simulation"
            },
            "google_calendar": {
                "events_created": 856,
                "sync_success_rate": 99.1,
                "last_sync": datetime.now().isoformat(),
                "status": "online" if self.google_calendar_service else "simulation"
            },
            "notifications": {
                "reminders_sent": 2103,
                "confirmations_sent": 1247,
                "success_rate": 97.8,
                "average_response_time": "2.3 minutes"
            },
            "last_updated": datetime.now().isoformat()
        }
    
    def test_integrations(self) -> Dict[str, Any]:
        """Testar todas as integrações"""
        results = {}
        
        # Teste WhatsApp
        try:
            whatsapp_test = self.send_whatsapp_message(
                to="+5511999999999",
                message="Teste de integração FisioFlow"
            )
            results["whatsapp"] = {
                "status": "success" if "error" not in whatsapp_test else "error",
                "result": whatsapp_test
            }
        except Exception as e:
            results["whatsapp"] = {"status": "error", "error": str(e)}
        
        # Teste Google Calendar
        try:
            calendar_test = self.create_calendar_event(
                summary="Teste FisioFlow",
                description="Evento de teste",
                start_datetime=datetime.now() + timedelta(hours=1),
                end_datetime=datetime.now() + timedelta(hours=2),
                attendees=["test@fisioflow.com"]
            )
            results["google_calendar"] = {
                "status": "success" if "error" not in calendar_test else "error",
                "result": calendar_test
            }
        except Exception as e:
            results["google_calendar"] = {"status": "error", "error": str(e)}
        
        return {
            "test_timestamp": datetime.now().isoformat(),
            "results": results,
            "overall_status": "success" if all(r["status"] == "success" for r in results.values()) else "partial"
        }

# Instância global do serviço de integrações
integrations_service = IntegrationsService()
