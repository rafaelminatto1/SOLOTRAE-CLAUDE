# -*- coding: utf-8 -*-
"""
Routes de Notificações - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas ao sistema de notificações,
incluindo notificações push, email, SMS e gerenciamento de preferências.

Endpoints:
- GET /notifications - Listar notificações do usuário
- POST /notifications - Criar nova notificação
- PUT /notifications/{id}/read - Marcar notificação como lida
- DELETE /notifications/{id} - Excluir notificação
- GET /notifications/unread/count - Contar notificações não lidas
- POST /notifications/mark-all-read - Marcar todas como lidas
- GET /notifications/preferences - Obter preferências de notificação
- PUT /notifications/preferences - Atualizar preferências
- POST /notifications/send/bulk - Enviar notificações em massa
- GET /notifications/templates - Listar templates de notificação
- POST /notifications/templates - Criar template
- GET /notifications/stats - Estatísticas de notificações
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy import and_, or_, desc, func
from sqlalchemy.orm import joinedload

from ..models import (
    User, Patient, Appointment, Notification, NotificationPreference,
    NotificationTemplate, AuditLog
)
from ..database import get_db_session
from ..utils.security import require_auth, require_role, get_current_user
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import DataValidator
from ..utils.helpers import CodeGenerator, DateTimeHelper
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')
logger = get_logger(__name__)

class NotificationService:
    """
    Serviço para gerenciamento de notificações
    """
    
    @staticmethod
    def create_notification(
        user_id: str,
        title: str,
        message: str,
        notification_type: str = 'info',
        data: Dict[str, Any] = None,
        send_push: bool = True,
        send_email: bool = False,
        priority: str = 'normal'
    ) -> Dict[str, Any]:
        """
        Criar nova notificação
        
        Args:
            user_id: ID do usuário
            title: Título da notificação
            message: Mensagem da notificação
            notification_type: Tipo (info, warning, error, success)
            data: Dados adicionais
            send_push: Enviar push notification
            send_email: Enviar por email
            priority: Prioridade (low, normal, high, urgent)
        
        Returns:
            Dados da notificação criada
        """
        try:
            with get_db_session() as session:
                # Verificar se usuário existe
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    return {'success': False, 'error': 'Usuário não encontrado'}
                
                # Verificar preferências do usuário
                preferences = session.query(NotificationPreference).filter_by(
                    user_id=user_id
                ).first()
                
                if preferences:
                    # Respeitar preferências do usuário
                    if not preferences.push_enabled:
                        send_push = False
                    if not preferences.email_enabled:
                        send_email = False
                
                # Criar notificação
                notification = Notification(
                    id=CodeGenerator.generate_uuid(),
                    user_id=user_id,
                    title=title,
                    message=message,
                    type=notification_type,
                    data=data or {},
                    priority=priority,
                    is_read=False,
                    created_at=datetime.utcnow()
                )
                
                session.add(notification)
                session.commit()
                
                # Enviar push notification se habilitado
                if send_push:
                    NotificationService._send_push_notification(
                        user_id, title, message, data
                    )
                
                # Enviar email se habilitado
                if send_email and user.email:
                    NotificationService._send_email_notification(
                        user.email, title, message, data
                    )
                
                return {
                    'success': True,
                    'notification_id': notification.id,
                    'sent_push': send_push,
                    'sent_email': send_email
                }
        
        except Exception as e:
            logger.error(f"Erro ao criar notificação: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def _send_push_notification(
        user_id: str,
        title: str,
        message: str,
        data: Dict[str, Any] = None
    ):
        """
        Enviar push notification
        
        Args:
            user_id: ID do usuário
            title: Título da notificação
            message: Mensagem
            data: Dados adicionais
        """
        try:
            # Implementar integração com serviço de push notifications
            # (Firebase Cloud Messaging, OneSignal, etc.)
            
            # Por enquanto, apenas log
            logger.info(f"Push notification enviada para {user_id}: {title}")
            
            # TODO: Implementar envio real de push notification
            # payload = {
            #     'title': title,
            #     'body': message,
            #     'data': data or {},
            #     'user_id': user_id
            # }
            # push_service.send(payload)
        
        except Exception as e:
            logger.error(f"Erro ao enviar push notification: {str(e)}")
    
    @staticmethod
    def _send_email_notification(
        email: str,
        title: str,
        message: str,
        data: Dict[str, Any] = None
    ):
        """
        Enviar notificação por email
        
        Args:
            email: Email do destinatário
            title: Título
            message: Mensagem
            data: Dados adicionais
        """
        try:
            # Implementar integração com serviço de email
            # (SendGrid, AWS SES, etc.)
            
            # Por enquanto, apenas log
            logger.info(f"Email notification enviada para {email}: {title}")
            
            # TODO: Implementar envio real de email
            # email_service.send({
            #     'to': email,
            #     'subject': title,
            #     'body': message,
            #     'data': data or {}
            # })
        
        except Exception as e:
            logger.error(f"Erro ao enviar email notification: {str(e)}")
    
    @staticmethod
    def create_appointment_reminder(appointment_id: str) -> Dict[str, Any]:
        """
        Criar lembrete de consulta
        
        Args:
            appointment_id: ID do agendamento
        
        Returns:
            Resultado da criação
        """
        try:
            with get_db_session() as session:
                appointment = session.query(Appointment).filter_by(
                    id=appointment_id
                ).first()
                
                if not appointment:
                    return {'success': False, 'error': 'Agendamento não encontrado'}
                
                patient = session.query(Patient).filter_by(
                    id=appointment.patient_id
                ).first()
                
                professional = session.query(User).filter_by(
                    id=appointment.professional_id
                ).first()
                
                if not patient:
                    return {'success': False, 'error': 'Paciente não encontrado'}
                
                # Formatar data e hora
                date_str = appointment.appointment_date.strftime('%d/%m/%Y')
                time_str = appointment.start_time.strftime('%H:%M')
                
                title = "Lembrete de Consulta"
                message = f"Você tem uma consulta agendada para {date_str} às {time_str} com {professional.full_name if professional else 'profissional'}."
                
                # Criar notificação para o paciente (se tiver usuário)
                if patient.user_id:
                    return NotificationService.create_notification(
                        user_id=patient.user_id,
                        title=title,
                        message=message,
                        notification_type='info',
                        data={
                            'appointment_id': appointment_id,
                            'type': 'appointment_reminder',
                            'date': date_str,
                            'time': time_str
                        },
                        send_push=True,
                        send_email=True,
                        priority='high'
                    )
                
                return {'success': True, 'message': 'Paciente não possui usuário'}
        
        except Exception as e:
            logger.error(f"Erro ao criar lembrete: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def create_exercise_notification(patient_id: str, exercises: List[Dict]) -> Dict[str, Any]:
        """
        Criar notificação de exercícios prescritos
        
        Args:
            patient_id: ID do paciente
            exercises: Lista de exercícios
        
        Returns:
            Resultado da criação
        """
        try:
            with get_db_session() as session:
                patient = session.query(Patient).filter_by(id=patient_id).first()
                
                if not patient or not patient.user_id:
                    return {'success': False, 'error': 'Paciente ou usuário não encontrado'}
                
                exercise_count = len(exercises)
                title = "Novos Exercícios Prescritos"
                message = f"Você recebeu {exercise_count} novo(s) exercício(s) para realizar."
                
                return NotificationService.create_notification(
                    user_id=patient.user_id,
                    title=title,
                    message=message,
                    notification_type='success',
                    data={
                        'patient_id': patient_id,
                        'type': 'exercise_prescription',
                        'exercise_count': exercise_count,
                        'exercises': exercises
                    },
                    send_push=True,
                    send_email=False,
                    priority='normal'
                )
        
        except Exception as e:
            logger.error(f"Erro ao criar notificação de exercícios: {str(e)}")
            return {'success': False, 'error': str(e)}

@notifications_bp.route('', methods=['GET'])
@require_auth
def list_notifications():
    """
    Listar notificações do usuário
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20)
        type: Filtrar por tipo
        is_read: Filtrar por lidas/não lidas
        priority: Filtrar por prioridade
    
    Returns:
        Lista paginada de notificações
    """
    try:
        current_user = get_current_user()
        pagination = PaginationHelper.get_pagination_params(request)
        
        # Filtros
        notification_type = request.args.get('type')
        is_read = request.args.get('is_read')
        priority = request.args.get('priority')
        
        with get_db_session() as session:
            query = session.query(Notification).filter_by(user_id=current_user.id)
            
            # Aplicar filtros
            if notification_type:
                query = query.filter(Notification.type == notification_type)
            
            if is_read is not None:
                is_read_bool = is_read.lower() == 'true'
                query = query.filter(Notification.is_read == is_read_bool)
            
            if priority:
                query = query.filter(Notification.priority == priority)
            
            # Ordenar por data de criação (mais recentes primeiro)
            query = query.order_by(desc(Notification.created_at))
            
            # Aplicar paginação
            total = query.count()
            notifications = query.offset(pagination['offset']).limit(pagination['per_page']).all()
            
            # Serializar dados
            notifications_data = []
            for notification in notifications:
                notifications_data.append({
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.type,
                    'priority': notification.priority,
                    'is_read': notification.is_read,
                    'data': notification.data,
                    'created_at': notification.created_at.isoformat(),
                    'read_at': notification.read_at.isoformat() if notification.read_at else None
                })
            
            return APIResponse.paginated(
                data=notifications_data,
                total=total,
                page=pagination['page'],
                per_page=pagination['per_page']
            )
    
    except Exception as e:
        logger.error(f"Erro ao listar notificações: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def create_notification():
    """
    Criar nova notificação
    
    Body:
        {
            "user_id": "uuid",
            "title": "Título da notificação",
            "message": "Mensagem da notificação",
            "type": "info|warning|error|success",
            "priority": "low|normal|high|urgent",
            "data": {},
            "send_push": true,
            "send_email": false
        }
    
    Returns:
        Dados da notificação criada
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['user_id', 'title', 'message']
        for field in required_fields:
            if not data or not data.get(field):
                return APIResponse.error(f'Campo obrigatório: {field}', 400)
        
        user_id = data['user_id']
        title = data['title']
        message = data['message']
        notification_type = data.get('type', 'info')
        priority = data.get('priority', 'normal')
        notification_data = data.get('data', {})
        send_push = data.get('send_push', True)
        send_email = data.get('send_email', False)
        
        # Validar tipos
        valid_types = ['info', 'warning', 'error', 'success']
        if notification_type not in valid_types:
            return APIResponse.error(f'Tipo inválido. Use: {valid_types}', 400)
        
        valid_priorities = ['low', 'normal', 'high', 'urgent']
        if priority not in valid_priorities:
            return APIResponse.error(f'Prioridade inválida. Use: {valid_priorities}', 400)
        
        # Criar notificação
        result = NotificationService.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            data=notification_data,
            send_push=send_push,
            send_email=send_email,
            priority=priority
        )
        
        if result['success']:
            return APIResponse.created({
                'notification_id': result['notification_id'],
                'sent_push': result['sent_push'],
                'sent_email': result['sent_email']
            })
        else:
            return APIResponse.error(result['error'], 400)
    
    except Exception as e:
        logger.error(f"Erro ao criar notificação: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/<string:notification_id>/read', methods=['PUT'])
@require_auth
def mark_notification_read(notification_id):
    """
    Marcar notificação como lida
    
    Path Parameters:
        notification_id: ID da notificação
    
    Returns:
        Confirmação da operação
    """
    try:
        current_user = get_current_user()
        
        with get_db_session() as session:
            notification = session.query(Notification).filter_by(
                id=notification_id,
                user_id=current_user.id
            ).first()
            
            if not notification:
                return APIResponse.not_found('Notificação não encontrada')
            
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = datetime.utcnow()
                session.commit()
            
            return APIResponse.success({
                'notification_id': notification_id,
                'is_read': True,
                'read_at': notification.read_at.isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao marcar notificação como lida: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/<string:notification_id>', methods=['DELETE'])
@require_auth
def delete_notification(notification_id):
    """
    Excluir notificação
    
    Path Parameters:
        notification_id: ID da notificação
    
    Returns:
        Confirmação da exclusão
    """
    try:
        current_user = get_current_user()
        
        with get_db_session() as session:
            notification = session.query(Notification).filter_by(
                id=notification_id,
                user_id=current_user.id
            ).first()
            
            if not notification:
                return APIResponse.not_found('Notificação não encontrada')
            
            session.delete(notification)
            session.commit()
            
            return APIResponse.no_content()
    
    except Exception as e:
        logger.error(f"Erro ao excluir notificação: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/unread/count', methods=['GET'])
@require_auth
def get_unread_count():
    """
    Contar notificações não lidas
    
    Returns:
        Número de notificações não lidas
    """
    try:
        current_user = get_current_user()
        
        with get_db_session() as session:
            count = session.query(Notification).filter_by(
                user_id=current_user.id,
                is_read=False
            ).count()
            
            return APIResponse.success({
                'unread_count': count
            })
    
    except Exception as e:
        logger.error(f"Erro ao contar notificações não lidas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/mark-all-read', methods=['POST'])
@require_auth
def mark_all_read():
    """
    Marcar todas as notificações como lidas
    
    Returns:
        Confirmação da operação
    """
    try:
        current_user = get_current_user()
        
        with get_db_session() as session:
            updated_count = session.query(Notification).filter_by(
                user_id=current_user.id,
                is_read=False
            ).update({
                'is_read': True,
                'read_at': datetime.utcnow()
            })
            
            session.commit()
            
            return APIResponse.success({
                'updated_count': updated_count,
                'marked_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao marcar todas como lidas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/preferences', methods=['GET'])
@require_auth
def get_notification_preferences():
    """
    Obter preferências de notificação do usuário
    
    Returns:
        Preferências de notificação
    """
    try:
        current_user = get_current_user()
        
        with get_db_session() as session:
            preferences = session.query(NotificationPreference).filter_by(
                user_id=current_user.id
            ).first()
            
            if not preferences:
                # Criar preferências padrão
                preferences = NotificationPreference(
                    id=CodeGenerator.generate_uuid(),
                    user_id=current_user.id,
                    push_enabled=True,
                    email_enabled=True,
                    sms_enabled=False,
                    appointment_reminders=True,
                    exercise_notifications=True,
                    marketing_notifications=False,
                    system_notifications=True
                )
                session.add(preferences)
                session.commit()
            
            return APIResponse.success({
                'push_enabled': preferences.push_enabled,
                'email_enabled': preferences.email_enabled,
                'sms_enabled': preferences.sms_enabled,
                'appointment_reminders': preferences.appointment_reminders,
                'exercise_notifications': preferences.exercise_notifications,
                'marketing_notifications': preferences.marketing_notifications,
                'system_notifications': preferences.system_notifications,
                'updated_at': preferences.updated_at.isoformat() if preferences.updated_at else None
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter preferências: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/preferences', methods=['PUT'])
@require_auth
def update_notification_preferences():
    """
    Atualizar preferências de notificação
    
    Body:
        {
            "push_enabled": true,
            "email_enabled": true,
            "sms_enabled": false,
            "appointment_reminders": true,
            "exercise_notifications": true,
            "marketing_notifications": false,
            "system_notifications": true
        }
    
    Returns:
        Preferências atualizadas
    """
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data:
            return APIResponse.error('Dados são obrigatórios', 400)
        
        with get_db_session() as session:
            preferences = session.query(NotificationPreference).filter_by(
                user_id=current_user.id
            ).first()
            
            if not preferences:
                preferences = NotificationPreference(
                    id=CodeGenerator.generate_uuid(),
                    user_id=current_user.id
                )
                session.add(preferences)
            
            # Atualizar campos
            if 'push_enabled' in data:
                preferences.push_enabled = data['push_enabled']
            if 'email_enabled' in data:
                preferences.email_enabled = data['email_enabled']
            if 'sms_enabled' in data:
                preferences.sms_enabled = data['sms_enabled']
            if 'appointment_reminders' in data:
                preferences.appointment_reminders = data['appointment_reminders']
            if 'exercise_notifications' in data:
                preferences.exercise_notifications = data['exercise_notifications']
            if 'marketing_notifications' in data:
                preferences.marketing_notifications = data['marketing_notifications']
            if 'system_notifications' in data:
                preferences.system_notifications = data['system_notifications']
            
            preferences.updated_at = datetime.utcnow()
            session.commit()
            
            return APIResponse.success({
                'push_enabled': preferences.push_enabled,
                'email_enabled': preferences.email_enabled,
                'sms_enabled': preferences.sms_enabled,
                'appointment_reminders': preferences.appointment_reminders,
                'exercise_notifications': preferences.exercise_notifications,
                'marketing_notifications': preferences.marketing_notifications,
                'system_notifications': preferences.system_notifications,
                'updated_at': preferences.updated_at.isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao atualizar preferências: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/send/bulk', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN])
def send_bulk_notifications():
    """
    Enviar notificações em massa
    
    Body:
        {
            "user_ids": ["uuid1", "uuid2"],
            "title": "Título da notificação",
            "message": "Mensagem da notificação",
            "type": "info",
            "priority": "normal",
            "send_push": true,
            "send_email": false
        }
    
    Returns:
        Resultado do envio em massa
    """
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['user_ids', 'title', 'message']
        for field in required_fields:
            if not data or not data.get(field):
                return APIResponse.error(f'Campo obrigatório: {field}', 400)
        
        user_ids = data['user_ids']
        title = data['title']
        message = data['message']
        notification_type = data.get('type', 'info')
        priority = data.get('priority', 'normal')
        send_push = data.get('send_push', True)
        send_email = data.get('send_email', False)
        
        if not isinstance(user_ids, list) or len(user_ids) == 0:
            return APIResponse.error('user_ids deve ser uma lista não vazia', 400)
        
        # Enviar notificações
        results = []
        success_count = 0
        error_count = 0
        
        for user_id in user_ids:
            result = NotificationService.create_notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                send_push=send_push,
                send_email=send_email
            )
            
            results.append({
                'user_id': user_id,
                'success': result['success'],
                'error': result.get('error')
            })
            
            if result['success']:
                success_count += 1
            else:
                error_count += 1
        
        return APIResponse.success({
            'total_sent': len(user_ids),
            'success_count': success_count,
            'error_count': error_count,
            'results': results,
            'sent_at': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Erro ao enviar notificações em massa: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@notifications_bp.route('/stats', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def get_notification_stats():
    """
    Obter estatísticas de notificações
    
    Returns:
        Estatísticas de notificações
    """
    try:
        with get_db_session() as session:
            # Estatísticas gerais
            total_notifications = session.query(Notification).count()
            unread_notifications = session.query(Notification).filter_by(is_read=False).count()
            
            # Notificações por tipo
            type_stats = session.query(
                Notification.type,
                func.count(Notification.id).label('count')
            ).group_by(Notification.type).all()
            
            # Notificações por prioridade
            priority_stats = session.query(
                Notification.priority,
                func.count(Notification.id).label('count')
            ).group_by(Notification.priority).all()
            
            # Notificações dos últimos 30 dias
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_notifications = session.query(Notification).filter(
                Notification.created_at >= thirty_days_ago
            ).count()
            
            return APIResponse.success({
                'total_notifications': total_notifications,
                'unread_notifications': unread_notifications,
                'read_rate': round((total_notifications - unread_notifications) / total_notifications * 100, 2) if total_notifications > 0 else 0,
                'recent_notifications': recent_notifications,
                'by_type': {stat.type: stat.count for stat in type_stats},
                'by_priority': {stat.priority: stat.count for stat in priority_stats}
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)