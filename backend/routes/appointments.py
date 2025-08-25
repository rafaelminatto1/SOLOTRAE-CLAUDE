# -*- coding: utf-8 -*-
"""
Routes de Agendamentos - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas ao sistema de agendamento,
incluindo CRUD de consultas, calendário, recorrências e lista de espera.

Endpoints:
- GET /appointments - Listar agendamentos
- POST /appointments - Criar novo agendamento
- GET /appointments/{id} - Obter agendamento específico
- PUT /appointments/{id} - Atualizar agendamento
- DELETE /appointments/{id} - Cancelar agendamento
- POST /appointments/{id}/checkin - Check-in do paciente
- POST /appointments/{id}/checkout - Check-out do paciente
- GET /appointments/calendar - Visualização de calendário
- GET /appointments/availability - Verificar disponibilidade
- POST /appointments/recurring - Criar agendamentos recorrentes
- GET /appointments/waiting-list - Lista de espera
- POST /appointments/waiting-list - Adicionar à lista de espera
- DELETE /appointments/waiting-list/{id} - Remover da lista de espera
- GET /appointments/stats - Estatísticas
"""

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_, and_, func, desc, asc, text
from datetime import datetime, timedelta, time, date
from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY
import calendar

from ..models import Appointment, Patient, User, AuditLog
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import ScheduleValidator, DataValidator
from ..utils.helpers import DateTimeHelper, CodeGenerator
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')
logger = get_logger(__name__)

@appointments_bp.route('', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def list_appointments():
    """
    Listar agendamentos com filtros e paginação
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20)
        date_start: Data inicial (YYYY-MM-DD)
        date_end: Data final (YYYY-MM-DD)
        status: Filtrar por status
        therapist_id: Filtrar por fisioterapeuta
        patient_id: Filtrar por paciente
        type: Filtrar por tipo de consulta
        sort_by: Campo para ordenação
        sort_order: Ordem (asc/desc)
    
    Returns:
        Lista paginada de agendamentos
    """
    try:
        current_user = request.current_user
        
        # Obter parâmetros
        pagination = PaginationHelper.get_pagination_params(request)
        date_start = request.args.get('date_start')
        date_end = request.args.get('date_end')
        status_filter = request.args.get('status')
        therapist_id = request.args.get('therapist_id')
        patient_id = request.args.get('patient_id')
        type_filter = request.args.get('type')
        
        with get_db_session() as session:
            # Query base com joins
            query = session.query(Appointment).join(
                Patient, Appointment.patient_id == Patient.id
            ).join(
                User, Appointment.therapist_id == User.id
            )
            
            # Filtro de data
            if date_start:
                try:
                    start_date = datetime.strptime(date_start, '%Y-%m-%d').date()
                    query = query.filter(Appointment.appointment_date >= start_date)
                except ValueError:
                    return APIResponse.error('Data inicial inválida', 400)
            
            if date_end:
                try:
                    end_date = datetime.strptime(date_end, '%Y-%m-%d').date()
                    query = query.filter(Appointment.appointment_date <= end_date)
                except ValueError:
                    return APIResponse.error('Data final inválida', 400)
            
            # Filtro de status
            if status_filter:
                try:
                    status_enum = Appointment.AppointmentStatus(status_filter.upper())
                    query = query.filter(Appointment.status == status_enum)
                except ValueError:
                    pass
            
            # Filtro de fisioterapeuta
            if therapist_id:
                query = query.filter(Appointment.therapist_id == therapist_id)
            
            # Filtro de paciente
            if patient_id:
                query = query.filter(Appointment.patient_id == patient_id)
            
            # Filtro de tipo
            if type_filter:
                try:
                    type_enum = Appointment.AppointmentType(type_filter.upper())
                    query = query.filter(Appointment.appointment_type == type_enum)
                except ValueError:
                    pass
            
            # Ordenação
            sort_by = request.args.get('sort_by', 'appointment_date')
            sort_order = request.args.get('sort_order', 'asc')
            
            if sort_by == 'appointment_date':
                if sort_order.lower() == 'desc':
                    query = query.order_by(
                        Appointment.appointment_date.desc(),
                        Appointment.start_time.desc()
                    )
                else:
                    query = query.order_by(
                        Appointment.appointment_date.asc(),
                        Appointment.start_time.asc()
                    )
            elif hasattr(Appointment, sort_by):
                order_column = getattr(Appointment, sort_by)
                if sort_order.lower() == 'desc':
                    query = query.order_by(order_column.desc())
                else:
                    query = query.order_by(order_column.asc())
            
            # Paginação
            total = query.count()
            appointments = query.offset(
                (pagination['page'] - 1) * pagination['per_page']
            ).limit(pagination['per_page']).all()
            
            # Serializar dados
            appointments_data = []
            for appointment in appointments:
                appointment_dict = appointment.to_dict()
                
                # Adicionar dados do paciente e fisioterapeuta
                appointment_dict['patient'] = {
                    'id': str(appointment.patient.id),
                    'name': appointment.patient.name,
                    'patient_number': appointment.patient.patient_number
                }
                
                appointment_dict['therapist'] = {
                    'id': str(appointment.therapist.id),
                    'name': appointment.therapist.name,
                    'crefito': appointment.therapist.crefito
                }
                
                appointments_data.append(appointment_dict)
            
            return APIResponse.paginated(
                data=appointments_data,
                page=pagination['page'],
                per_page=pagination['per_page'],
                total=total
            )
    
    except Exception as e:
        logger.error(f"Erro ao listar agendamentos: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def create_appointment():
    """
    Criar novo agendamento
    
    Body:
        patient_id: ID do paciente
        therapist_id: ID do fisioterapeuta
        appointment_date: Data da consulta (YYYY-MM-DD)
        start_time: Hora de início (HH:MM)
        duration_minutes: Duração em minutos
        appointment_type: Tipo da consulta
        notes: Observações (opcional)
        is_recurring: Se é recorrente (opcional)
        recurrence_pattern: Padrão de recorrência (opcional)
        recurrence_end_date: Data fim da recorrência (opcional)
    
    Returns:
        Dados do agendamento criado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        required_fields = [
            'patient_id', 'therapist_id', 'appointment_date',
            'start_time', 'duration_minutes', 'appointment_type'
        ]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Validar data e hora
        date_validation = ScheduleValidator.validate_appointment_date(
            data['appointment_date']
        )
        if not date_validation['valid']:
            return APIResponse.error(date_validation['error'], 400)
        
        time_validation = ScheduleValidator.validate_appointment_time(
            data['start_time']
        )
        if not time_validation['valid']:
            return APIResponse.error(time_validation['error'], 400)
        
        duration_validation = ScheduleValidator.validate_duration(
            data['duration_minutes']
        )
        if not duration_validation['valid']:
            return APIResponse.error(duration_validation['error'], 400)
        
        # Validar tipo de consulta
        try:
            appointment_type = Appointment.AppointmentType(data['appointment_type'].upper())
        except ValueError:
            return APIResponse.error('Tipo de consulta inválido', 400)
        
        with get_db_session() as session:
            # Verificar se paciente existe
            patient = session.query(Patient).filter_by(
                id=data['patient_id'],
                is_active=True
            ).first()
            
            if not patient:
                return APIResponse.error('Paciente não encontrado', 404)
            
            # Verificar se fisioterapeuta existe
            therapist = session.query(User).filter_by(
                id=data['therapist_id'],
                is_active=True
            ).filter(
                User.role.in_([User.UserRole.FISIOTERAPEUTA, User.UserRole.ADMIN])
            ).first()
            
            if not therapist:
                return APIResponse.error('Fisioterapeuta não encontrado', 404)
            
            appointment_date = date_validation['date']
            start_time = time_validation['time']
            duration_minutes = duration_validation['duration']
            
            # Calcular hora de término
            start_datetime = datetime.combine(appointment_date, start_time)
            end_datetime = start_datetime + timedelta(minutes=duration_minutes)
            end_time = end_datetime.time()
            
            # Verificar disponibilidade
            availability_check = _check_availability(
                session, data['therapist_id'], appointment_date,
                start_time, end_time
            )
            
            if not availability_check['available']:
                return APIResponse.error(availability_check['error'], 409)
            
            # Gerar código do agendamento
            appointment_code = CodeGenerator.generate_appointment_code()
            
            # Criar agendamento
            appointment = Appointment(
                appointment_code=appointment_code,
                patient_id=data['patient_id'],
                therapist_id=data['therapist_id'],
                appointment_date=appointment_date,
                start_time=start_time,
                end_time=end_time,
                duration_minutes=duration_minutes,
                appointment_type=appointment_type,
                status=Appointment.AppointmentStatus.AGENDADO,
                notes=data.get('notes'),
                created_by=current_user.id
            )
            
            session.add(appointment)
            
            # Se é recorrente, criar agendamentos futuros
            if data.get('is_recurring') and data.get('recurrence_pattern'):
                recurring_appointments = _create_recurring_appointments(
                    session, appointment, data
                )
            
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='APPOINTMENT_CREATED',
                description=f'Agendamento criado: {appointment.appointment_code}',
                level='INFO',
                entity_type='Appointment',
                entity_id=str(appointment.id),
                new_data=appointment.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Adicionar dados relacionados ao retorno
            appointment_dict = appointment.to_dict()
            appointment_dict['patient'] = {
                'id': str(patient.id),
                'name': patient.name,
                'patient_number': patient.patient_number
            }
            appointment_dict['therapist'] = {
                'id': str(therapist.id),
                'name': therapist.name,
                'crefito': therapist.crefito
            }
            
            return APIResponse.success(appointment_dict, 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar agendamento: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/<uuid:appointment_id>', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def get_appointment(appointment_id):
    """
    Obter agendamento específico
    
    Path Parameters:
        appointment_id: ID do agendamento
    
    Returns:
        Dados completos do agendamento
    """
    try:
        with get_db_session() as session:
            appointment = session.query(Appointment).filter_by(
                id=appointment_id
            ).first()
            
            if not appointment:
                return APIResponse.not_found('Agendamento não encontrado')
            
            # Serializar dados
            appointment_dict = appointment.to_dict()
            
            # Adicionar dados relacionados
            appointment_dict['patient'] = appointment.patient.to_dict()
            appointment_dict['therapist'] = {
                'id': str(appointment.therapist.id),
                'name': appointment.therapist.name,
                'email': appointment.therapist.email,
                'crefito': appointment.therapist.crefito
            }
            
            return APIResponse.success(appointment_dict)
    
    except Exception as e:
        logger.error(f"Erro ao obter agendamento: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/<uuid:appointment_id>', methods=['PUT'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def update_appointment(appointment_id):
    """
    Atualizar agendamento
    
    Path Parameters:
        appointment_id: ID do agendamento
    
    Body:
        Campos do agendamento para atualizar
    
    Returns:
        Dados do agendamento atualizado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        if not data:
            return APIResponse.error('Dados não fornecidos', 400)
        
        with get_db_session() as session:
            appointment = session.query(Appointment).filter_by(
                id=appointment_id
            ).first()
            
            if not appointment:
                return APIResponse.not_found('Agendamento não encontrado')
            
            # Verificar se pode ser alterado
            if appointment.status in [
                Appointment.AppointmentStatus.CONCLUIDO,
                Appointment.AppointmentStatus.CANCELADO
            ]:
                return APIResponse.error(
                    'Agendamento não pode ser alterado',
                    400
                )
            
            # Dados anteriores para auditoria
            old_data = appointment.to_dict()
            
            # Atualizar campos
            if 'appointment_date' in data or 'start_time' in data or 'duration_minutes' in data:
                # Validar nova data/hora
                new_date = appointment.appointment_date
                new_start_time = appointment.start_time
                new_duration = appointment.duration_minutes
                
                if 'appointment_date' in data:
                    date_validation = ScheduleValidator.validate_appointment_date(
                        data['appointment_date']
                    )
                    if not date_validation['valid']:
                        return APIResponse.error(date_validation['error'], 400)
                    new_date = date_validation['date']
                
                if 'start_time' in data:
                    time_validation = ScheduleValidator.validate_appointment_time(
                        data['start_time']
                    )
                    if not time_validation['valid']:
                        return APIResponse.error(time_validation['error'], 400)
                    new_start_time = time_validation['time']
                
                if 'duration_minutes' in data:
                    duration_validation = ScheduleValidator.validate_duration(
                        data['duration_minutes']
                    )
                    if not duration_validation['valid']:
                        return APIResponse.error(duration_validation['error'], 400)
                    new_duration = duration_validation['duration']
                
                # Calcular nova hora de término
                start_datetime = datetime.combine(new_date, new_start_time)
                end_datetime = start_datetime + timedelta(minutes=new_duration)
                new_end_time = end_datetime.time()
                
                # Verificar disponibilidade (excluindo o próprio agendamento)
                availability_check = _check_availability(
                    session, appointment.therapist_id, new_date,
                    new_start_time, new_end_time, exclude_appointment_id=appointment.id
                )
                
                if not availability_check['available']:
                    return APIResponse.error(availability_check['error'], 409)
                
                # Atualizar campos de data/hora
                appointment.appointment_date = new_date
                appointment.start_time = new_start_time
                appointment.end_time = new_end_time
                appointment.duration_minutes = new_duration
            
            # Outros campos
            if 'appointment_type' in data:
                try:
                    appointment.appointment_type = Appointment.AppointmentType(
                        data['appointment_type'].upper()
                    )
                except ValueError:
                    return APIResponse.error('Tipo de consulta inválido', 400)
            
            if 'status' in data:
                try:
                    new_status = Appointment.AppointmentStatus(data['status'].upper())
                    appointment.status = new_status
                    
                    # Atualizar timestamps baseado no status
                    if new_status == Appointment.AppointmentStatus.EM_ANDAMENTO:
                        appointment.checked_in_at = datetime.utcnow()
                    elif new_status == Appointment.AppointmentStatus.CONCLUIDO:
                        appointment.checked_out_at = datetime.utcnow()
                    
                except ValueError:
                    return APIResponse.error('Status inválido', 400)
            
            if 'notes' in data:
                appointment.notes = data['notes']
            
            appointment.updated_at = datetime.utcnow()
            appointment.updated_by = current_user.id
            session.commit()
            
            # Log atualização
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='APPOINTMENT_UPDATED',
                description=f'Agendamento atualizado: {appointment.appointment_code}',
                level='INFO',
                entity_type='Appointment',
                entity_id=str(appointment.id),
                old_data=old_data,
                new_data=appointment.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Retornar dados atualizados
            appointment_dict = appointment.to_dict()
            appointment_dict['patient'] = {
                'id': str(appointment.patient.id),
                'name': appointment.patient.name,
                'patient_number': appointment.patient.patient_number
            }
            appointment_dict['therapist'] = {
                'id': str(appointment.therapist.id),
                'name': appointment.therapist.name,
                'crefito': appointment.therapist.crefito
            }
            
            return APIResponse.success(appointment_dict)
    
    except Exception as e:
        logger.error(f"Erro ao atualizar agendamento: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/<uuid:appointment_id>', methods=['DELETE'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def cancel_appointment(appointment_id):
    """
    Cancelar agendamento
    
    Path Parameters:
        appointment_id: ID do agendamento
    
    Body:
        cancellation_reason: Motivo do cancelamento (opcional)
    
    Returns:
        Confirmação de cancelamento
    """
    try:
        data = request.get_json() or {}
        current_user = request.current_user
        
        with get_db_session() as session:
            appointment = session.query(Appointment).filter_by(
                id=appointment_id
            ).first()
            
            if not appointment:
                return APIResponse.not_found('Agendamento não encontrado')
            
            if appointment.status == Appointment.AppointmentStatus.CANCELADO:
                return APIResponse.error('Agendamento já está cancelado', 400)
            
            if appointment.status == Appointment.AppointmentStatus.CONCLUIDO:
                return APIResponse.error('Agendamento já foi concluído', 400)
            
            # Cancelar agendamento
            appointment.status = Appointment.AppointmentStatus.CANCELADO
            appointment.cancellation_reason = data.get('cancellation_reason')
            appointment.cancelled_at = datetime.utcnow()
            appointment.cancelled_by = current_user.id
            appointment.updated_at = datetime.utcnow()
            appointment.updated_by = current_user.id
            session.commit()
            
            # Log cancelamento
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='APPOINTMENT_CANCELLED',
                description=f'Agendamento cancelado: {appointment.appointment_code}',
                level='WARNING',
                entity_type='Appointment',
                entity_id=str(appointment.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({
                'message': 'Agendamento cancelado com sucesso',
                'appointment_code': appointment.appointment_code
            })
    
    except Exception as e:
        logger.error(f"Erro ao cancelar agendamento: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/<uuid:appointment_id>/checkin', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def checkin_appointment(appointment_id):
    """
    Check-in do paciente
    
    Path Parameters:
        appointment_id: ID do agendamento
    
    Returns:
        Confirmação de check-in
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            appointment = session.query(Appointment).filter_by(
                id=appointment_id
            ).first()
            
            if not appointment:
                return APIResponse.not_found('Agendamento não encontrado')
            
            if appointment.status != Appointment.AppointmentStatus.AGENDADO:
                return APIResponse.error(
                    'Agendamento não está disponível para check-in',
                    400
                )
            
            # Realizar check-in
            appointment.status = Appointment.AppointmentStatus.EM_ANDAMENTO
            appointment.checked_in_at = datetime.utcnow()
            appointment.updated_at = datetime.utcnow()
            appointment.updated_by = current_user.id
            session.commit()
            
            # Log check-in
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='APPOINTMENT_CHECKIN',
                description=f'Check-in realizado: {appointment.appointment_code}',
                level='INFO',
                entity_type='Appointment',
                entity_id=str(appointment.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({
                'message': 'Check-in realizado com sucesso',
                'appointment_code': appointment.appointment_code,
                'checked_in_at': appointment.checked_in_at.isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro no check-in: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/<uuid:appointment_id>/checkout', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def checkout_appointment(appointment_id):
    """
    Check-out do paciente
    
    Path Parameters:
        appointment_id: ID do agendamento
    
    Body:
        session_notes: Notas da sessão (opcional)
        next_appointment: Dados para próximo agendamento (opcional)
    
    Returns:
        Confirmação de check-out
    """
    try:
        data = request.get_json() or {}
        current_user = request.current_user
        
        with get_db_session() as session:
            appointment = session.query(Appointment).filter_by(
                id=appointment_id
            ).first()
            
            if not appointment:
                return APIResponse.not_found('Agendamento não encontrado')
            
            if appointment.status != Appointment.AppointmentStatus.EM_ANDAMENTO:
                return APIResponse.error(
                    'Agendamento não está em andamento',
                    400
                )
            
            # Realizar check-out
            appointment.status = Appointment.AppointmentStatus.CONCLUIDO
            appointment.checked_out_at = datetime.utcnow()
            appointment.session_notes = data.get('session_notes')
            appointment.updated_at = datetime.utcnow()
            appointment.updated_by = current_user.id
            session.commit()
            
            # Log check-out
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='APPOINTMENT_CHECKOUT',
                description=f'Check-out realizado: {appointment.appointment_code}',
                level='INFO',
                entity_type='Appointment',
                entity_id=str(appointment.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({
                'message': 'Check-out realizado com sucesso',
                'appointment_code': appointment.appointment_code,
                'checked_out_at': appointment.checked_out_at.isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro no check-out: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/calendar', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def get_calendar():
    """
    Obter visualização de calendário
    
    Query Parameters:
        date: Data base (YYYY-MM-DD, padrão: hoje)
        view: Tipo de visualização (day/week/month, padrão: week)
        therapist_id: Filtrar por fisioterapeuta (opcional)
    
    Returns:
        Dados do calendário
    """
    try:
        # Obter parâmetros
        date_param = request.args.get('date')
        view_type = request.args.get('view', 'week')
        therapist_id = request.args.get('therapist_id')
        
        # Validar data
        if date_param:
            try:
                base_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return APIResponse.error('Data inválida', 400)
        else:
            base_date = datetime.utcnow().date()
        
        # Calcular período baseado na visualização
        if view_type == 'day':
            start_date = base_date
            end_date = base_date
        elif view_type == 'week':
            # Semana começa na segunda-feira
            start_date = base_date - timedelta(days=base_date.weekday())
            end_date = start_date + timedelta(days=6)
        elif view_type == 'month':
            # Primeiro e último dia do mês
            start_date = base_date.replace(day=1)
            next_month = start_date.replace(month=start_date.month + 1) if start_date.month < 12 else start_date.replace(year=start_date.year + 1, month=1)
            end_date = next_month - timedelta(days=1)
        else:
            return APIResponse.error('Tipo de visualização inválido', 400)
        
        with get_db_session() as session:
            # Query base
            query = session.query(Appointment).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date
                )
            )
            
            # Filtrar por fisioterapeuta se especificado
            if therapist_id:
                query = query.filter(Appointment.therapist_id == therapist_id)
            
            # Ordenar por data e hora
            appointments = query.order_by(
                Appointment.appointment_date.asc(),
                Appointment.start_time.asc()
            ).all()
            
            # Organizar dados por data
            calendar_data = {}
            current_date = start_date
            
            while current_date <= end_date:
                calendar_data[current_date.isoformat()] = {
                    'date': current_date.isoformat(),
                    'weekday': calendar.day_name[current_date.weekday()],
                    'appointments': []
                }
                current_date += timedelta(days=1)
            
            # Adicionar agendamentos
            for appointment in appointments:
                date_key = appointment.appointment_date.isoformat()
                if date_key in calendar_data:
                    appointment_dict = appointment.to_dict()
                    appointment_dict['patient'] = {
                        'id': str(appointment.patient.id),
                        'name': appointment.patient.name,
                        'patient_number': appointment.patient.patient_number
                    }
                    appointment_dict['therapist'] = {
                        'id': str(appointment.therapist.id),
                        'name': appointment.therapist.name,
                        'crefito': appointment.therapist.crefito
                    }
                    calendar_data[date_key]['appointments'].append(appointment_dict)
            
            return APIResponse.success({
                'view_type': view_type,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'calendar': list(calendar_data.values())
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter calendário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/availability', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def check_availability():
    """
    Verificar disponibilidade de horários
    
    Query Parameters:
        therapist_id: ID do fisioterapeuta
        date: Data (YYYY-MM-DD)
        duration: Duração em minutos (padrão: 60)
    
    Returns:
        Horários disponíveis
    """
    try:
        therapist_id = request.args.get('therapist_id')
        date_param = request.args.get('date')
        duration = int(request.args.get('duration', 60))
        
        if not therapist_id or not date_param:
            return APIResponse.error(
                'therapist_id e date são obrigatórios',
                400
            )
        
        # Validar data
        try:
            check_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return APIResponse.error('Data inválida', 400)
        
        with get_db_session() as session:
            # Verificar se fisioterapeuta existe
            therapist = session.query(User).filter_by(
                id=therapist_id,
                is_active=True
            ).first()
            
            if not therapist:
                return APIResponse.error('Fisioterapeuta não encontrado', 404)
            
            # Obter agendamentos do dia
            existing_appointments = session.query(Appointment).filter(
                and_(
                    Appointment.therapist_id == therapist_id,
                    Appointment.appointment_date == check_date,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.AGENDADO,
                        Appointment.AppointmentStatus.EM_ANDAMENTO
                    ])
                )
            ).order_by(Appointment.start_time.asc()).all()
            
            # Gerar slots disponíveis
            available_slots = _generate_available_slots(
                check_date, existing_appointments, duration
            )
            
            return APIResponse.success({
                'date': check_date.isoformat(),
                'therapist_id': therapist_id,
                'duration_minutes': duration,
                'available_slots': available_slots,
                'total_slots': len(available_slots)
            })
    
    except Exception as e:
        logger.error(f"Erro ao verificar disponibilidade: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@appointments_bp.route('/stats', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def get_appointment_stats():
    """
    Obter estatísticas de agendamentos
    
    Query Parameters:
        period: Período (today/week/month/year, padrão: month)
        therapist_id: Filtrar por fisioterapeuta (opcional)
    
    Returns:
        Estatísticas dos agendamentos
    """
    try:
        period = request.args.get('period', 'month')
        therapist_id = request.args.get('therapist_id')
        
        # Calcular período
        today = datetime.utcnow().date()
        
        if period == 'today':
            start_date = today
            end_date = today
        elif period == 'week':
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        elif period == 'month':
            start_date = today.replace(day=1)
            next_month = start_date.replace(month=start_date.month + 1) if start_date.month < 12 else start_date.replace(year=start_date.year + 1, month=1)
            end_date = next_month - timedelta(days=1)
        elif period == 'year':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(month=12, day=31)
        else:
            return APIResponse.error('Período inválido', 400)
        
        with get_db_session() as session:
            # Query base
            query = session.query(Appointment).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date
                )
            )
            
            # Filtrar por fisioterapeuta se especificado
            if therapist_id:
                query = query.filter(Appointment.therapist_id == therapist_id)
            
            # Total de agendamentos
            total_appointments = query.count()
            
            # Agendamentos por status
            status_stats = session.query(
                Appointment.status,
                func.count(Appointment.id).label('count')
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date
                )
            )
            
            if therapist_id:
                status_stats = status_stats.filter(
                    Appointment.therapist_id == therapist_id
                )
            
            status_stats = status_stats.group_by(Appointment.status).all()
            
            # Agendamentos por tipo
            type_stats = session.query(
                Appointment.appointment_type,
                func.count(Appointment.id).label('count')
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date
                )
            )
            
            if therapist_id:
                type_stats = type_stats.filter(
                    Appointment.therapist_id == therapist_id
                )
            
            type_stats = type_stats.group_by(Appointment.appointment_type).all()
            
            # Taxa de no-show
            no_show_count = query.filter(
                Appointment.status == Appointment.AppointmentStatus.NAO_COMPARECEU
            ).count()
            
            no_show_rate = (no_show_count / total_appointments * 100) if total_appointments > 0 else 0
            
            # Taxa de ocupação (agendamentos vs slots disponíveis)
            # Simplificado: assumindo 8 horas de trabalho por dia
            total_days = (end_date - start_date).days + 1
            total_possible_slots = total_days * 8  # 8 slots de 1 hora por dia
            occupancy_rate = (total_appointments / total_possible_slots * 100) if total_possible_slots > 0 else 0
            
            return APIResponse.success({
                'period': period,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_appointments': total_appointments,
                'by_status': {
                    status.value: count for status, count in status_stats
                },
                'by_type': {
                    appointment_type.value: count for appointment_type, count in type_stats
                },
                'no_show_rate': round(no_show_rate, 2),
                'occupancy_rate': round(occupancy_rate, 2)
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

# Funções auxiliares

def _check_availability(session, therapist_id, appointment_date, start_time, end_time, exclude_appointment_id=None):
    """
    Verificar se um horário está disponível
    
    Args:
        session: Sessão do banco de dados
        therapist_id: ID do fisioterapeuta
        appointment_date: Data do agendamento
        start_time: Hora de início
        end_time: Hora de término
        exclude_appointment_id: ID do agendamento a excluir da verificação
    
    Returns:
        Dict com disponibilidade e erro se houver
    """
    try:
        # Query para verificar conflitos
        query = session.query(Appointment).filter(
            and_(
                Appointment.therapist_id == therapist_id,
                Appointment.appointment_date == appointment_date,
                Appointment.status.in_([
                    Appointment.AppointmentStatus.AGENDADO,
                    Appointment.AppointmentStatus.EM_ANDAMENTO
                ]),
                or_(
                    # Novo agendamento começa durante um existente
                    and_(
                        Appointment.start_time <= start_time,
                        Appointment.end_time > start_time
                    ),
                    # Novo agendamento termina durante um existente
                    and_(
                        Appointment.start_time < end_time,
                        Appointment.end_time >= end_time
                    ),
                    # Novo agendamento engloba um existente
                    and_(
                        Appointment.start_time >= start_time,
                        Appointment.end_time <= end_time
                    )
                )
            )
        )
        
        # Excluir agendamento específico se fornecido
        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)
        
        conflicting_appointment = query.first()
        
        if conflicting_appointment:
            return {
                'available': False,
                'error': f'Horário conflita com agendamento {conflicting_appointment.appointment_code}'
            }
        
        return {'available': True}
    
    except Exception as e:
        logger.error(f"Erro ao verificar disponibilidade: {str(e)}")
        return {
            'available': False,
            'error': 'Erro ao verificar disponibilidade'
        }

def _generate_available_slots(check_date, existing_appointments, duration_minutes):
    """
    Gerar slots de tempo disponíveis
    
    Args:
        check_date: Data para verificar
        existing_appointments: Lista de agendamentos existentes
        duration_minutes: Duração do slot em minutos
    
    Returns:
        Lista de slots disponíveis
    """
    # Horário de funcionamento: 8:00 às 18:00
    work_start = time(8, 0)
    work_end = time(18, 0)
    
    # Gerar todos os slots possíveis
    slots = []
    current_time = datetime.combine(check_date, work_start)
    end_datetime = datetime.combine(check_date, work_end)
    
    while current_time + timedelta(minutes=duration_minutes) <= end_datetime:
        slot_start = current_time.time()
        slot_end = (current_time + timedelta(minutes=duration_minutes)).time()
        
        # Verificar se o slot conflita com algum agendamento existente
        is_available = True
        for appointment in existing_appointments:
            if (
                (appointment.start_time <= slot_start < appointment.end_time) or
                (appointment.start_time < slot_end <= appointment.end_time) or
                (slot_start <= appointment.start_time and slot_end >= appointment.end_time)
            ):
                is_available = False
                break
        
        if is_available:
            slots.append({
                'start_time': slot_start.strftime('%H:%M'),
                'end_time': slot_end.strftime('%H:%M'),
                'duration_minutes': duration_minutes
            })
        
        # Próximo slot (intervalos de 30 minutos)
        current_time += timedelta(minutes=30)
    
    return slots

def _create_recurring_appointments(session, base_appointment, data):
    """
    Criar agendamentos recorrentes
    
    Args:
        session: Sessão do banco de dados
        base_appointment: Agendamento base
        data: Dados da recorrência
    
    Returns:
        Lista de agendamentos criados
    """
    try:
        pattern = data.get('recurrence_pattern', 'WEEKLY')
        end_date_str = data.get('recurrence_end_date')
        
        if not end_date_str:
            return []
        
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        # Configurar regra de recorrência
        if pattern == 'DAILY':
            rule = rrule(DAILY, dtstart=base_appointment.appointment_date, until=end_date)
        elif pattern == 'WEEKLY':
            rule = rrule(WEEKLY, dtstart=base_appointment.appointment_date, until=end_date)
        elif pattern == 'MONTHLY':
            rule = rrule(MONTHLY, dtstart=base_appointment.appointment_date, until=end_date)
        else:
            return []
        
        created_appointments = []
        
        # Criar agendamentos (pular o primeiro que já foi criado)
        for occurrence_date in list(rule)[1:]:
            # Verificar disponibilidade
            availability = _check_availability(
                session,
                base_appointment.therapist_id,
                occurrence_date.date(),
                base_appointment.start_time,
                base_appointment.end_time
            )
            
            if availability['available']:
                recurring_appointment = Appointment(
                    appointment_code=CodeGenerator.generate_appointment_code(),
                    patient_id=base_appointment.patient_id,
                    therapist_id=base_appointment.therapist_id,
                    appointment_date=occurrence_date.date(),
                    start_time=base_appointment.start_time,
                    end_time=base_appointment.end_time,
                    duration_minutes=base_appointment.duration_minutes,
                    appointment_type=base_appointment.appointment_type,
                    status=Appointment.AppointmentStatus.AGENDADO,
                    notes=base_appointment.notes,
                    is_recurring=True,
                    recurrence_pattern=pattern,
                    parent_appointment_id=base_appointment.id,
                    created_by=base_appointment.created_by
                )
                
                session.add(recurring_appointment)
                created_appointments.append(recurring_appointment)
        
        return created_appointments
    
    except Exception as e:
        logger.error(f"Erro ao criar agendamentos recorrentes: {str(e)}")
        return []