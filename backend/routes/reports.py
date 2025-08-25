# -*- coding: utf-8 -*-
"""
Routes de Relatórios - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas à geração de relatórios
financeiros, de performance, análises de dados e dashboards administrativos.

Endpoints:
- GET /reports/financial - Relatório financeiro
- GET /reports/patients - Relatório de pacientes
- GET /reports/appointments - Relatório de agendamentos
- GET /reports/performance - Relatório de performance
- GET /reports/partnerships - Relatório de parcerias
- GET /reports/dashboard - Dashboard administrativo
- GET /reports/kpis - KPIs principais
- POST /reports/custom - Relatório customizado
- GET /reports/export/{report_id} - Exportar relatório
- GET /reports/compliance/lgpd - Relatório de compliance LGPD
"""

from flask import Blueprint, request, jsonify, current_app, send_file
from sqlalchemy import or_, and_, func, desc, asc, text, extract, case
from datetime import datetime, timedelta, date
from decimal import Decimal
import uuid
import io
import csv
import json
from typing import Dict, List, Any, Optional

from ..models import (
    User, Patient, Appointment, Exercise, Partnership, Voucher,
    PartnershipSession, AuditLog, Prescription, PrescriptionExercise
)
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse, PaginationHelper
from ..utils.helpers import DataFormatter, DateTimeHelper
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')
logger = get_logger(__name__)

class ReportGenerator:
    """
    Classe para geração de relatórios
    """
    
    @staticmethod
    def get_date_range(period: str) -> tuple:
        """
        Obter range de datas baseado no período
        
        Args:
            period: Período (today, week, month, quarter, year, custom)
        
        Returns:
            Tupla com data inicial e final
        """
        today = datetime.utcnow().date()
        
        if period == 'today':
            return today, today
        elif period == 'week':
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            return start, end
        elif period == 'month':
            start = today.replace(day=1)
            next_month = start.replace(month=start.month + 1) if start.month < 12 else start.replace(year=start.year + 1, month=1)
            end = next_month - timedelta(days=1)
            return start, end
        elif period == 'quarter':
            quarter = (today.month - 1) // 3 + 1
            start = today.replace(month=(quarter - 1) * 3 + 1, day=1)
            if quarter == 4:
                end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end = today.replace(month=quarter * 3 + 1, day=1) - timedelta(days=1)
            return start, end
        elif period == 'year':
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)
            return start, end
        else:
            # Default para último mês
            start = today.replace(day=1)
            end = today
            return start, end
    
    @staticmethod
    def calculate_growth_rate(current: float, previous: float) -> float:
        """
        Calcular taxa de crescimento
        """
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100

@reports_bp.route('/financial', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def financial_report():
    """
    Relatório financeiro
    
    Query Parameters:
        period: Período (today, week, month, quarter, year)
        start_date: Data inicial (formato: YYYY-MM-DD)
        end_date: Data final (formato: YYYY-MM-DD)
        include_partnerships: Incluir dados de parcerias (true/false)
    
    Returns:
        Relatório financeiro detalhado
    """
    try:
        # Obter parâmetros
        period = request.args.get('period', 'month')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        include_partnerships = request.args.get('include_partnerships', 'true').lower() == 'true'
        
        # Determinar range de datas
        if start_date_str and end_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            start_date, end_date = ReportGenerator.get_date_range(period)
        
        with get_db_session() as session:
            # Receitas de consultas
            consultation_revenue = session.query(
                func.count(Appointment.id).label('total_appointments'),
                func.sum(Appointment.price).label('total_revenue'),
                func.avg(Appointment.price).label('avg_price')
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).first()
            
            # Receitas por tipo de consulta
            revenue_by_type = session.query(
                Appointment.appointment_type,
                func.count(Appointment.id).label('count'),
                func.sum(Appointment.price).label('revenue')
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).group_by(Appointment.appointment_type).all()
            
            # Receitas por profissional
            revenue_by_professional = session.query(
                User.full_name,
                func.count(Appointment.id).label('appointments'),
                func.sum(Appointment.price).label('revenue')
            ).join(
                Appointment, User.id == Appointment.professional_id
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).group_by(User.id, User.full_name).all()
            
            # Receitas diárias
            daily_revenue = session.query(
                func.date(Appointment.appointment_date).label('date'),
                func.count(Appointment.id).label('appointments'),
                func.sum(Appointment.price).label('revenue')
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).group_by(
                func.date(Appointment.appointment_date)
            ).order_by(
                func.date(Appointment.appointment_date)
            ).all()
            
            # Dados de parcerias se solicitado
            partnership_data = {}
            if include_partnerships:
                partnership_revenue = session.query(
                    func.count(PartnershipSession.id).label('total_sessions'),
                    func.sum(PartnershipSession.total_amount).label('gross_revenue'),
                    func.sum(PartnershipSession.platform_fee).label('platform_fees'),
                    func.sum(PartnershipSession.partner_amount).label('partner_payments')
                ).filter(
                    and_(
                        PartnershipSession.session_date >= start_date,
                        PartnershipSession.session_date <= end_date
                    )
                ).first()
                
                partnership_by_partner = session.query(
                    Partnership.partner_name,
                    func.count(PartnershipSession.id).label('sessions'),
                    func.sum(PartnershipSession.total_amount).label('gross_revenue'),
                    func.sum(PartnershipSession.platform_fee).label('platform_fees')
                ).join(
                    PartnershipSession, Partnership.id == PartnershipSession.partnership_id
                ).filter(
                    and_(
                        PartnershipSession.session_date >= start_date,
                        PartnershipSession.session_date <= end_date
                    )
                ).group_by(
                    Partnership.id, Partnership.partner_name
                ).all()
                
                partnership_data = {
                    'summary': {
                        'total_sessions': partnership_revenue.total_sessions or 0,
                        'gross_revenue': float(partnership_revenue.gross_revenue or 0),
                        'platform_fees': float(partnership_revenue.platform_fees or 0),
                        'partner_payments': float(partnership_revenue.partner_payments or 0)
                    },
                    'by_partner': [
                        {
                            'partner_name': partner_name,
                            'sessions': sessions,
                            'gross_revenue': float(gross_revenue),
                            'platform_fees': float(platform_fees)
                        }
                        for partner_name, sessions, gross_revenue, platform_fees in partnership_by_partner
                    ]
                }
            
            # Período anterior para comparação
            days_diff = (end_date - start_date).days + 1
            prev_start_date = start_date - timedelta(days=days_diff)
            prev_end_date = start_date - timedelta(days=1)
            
            prev_consultation_revenue = session.query(
                func.count(Appointment.id).label('total_appointments'),
                func.sum(Appointment.price).label('total_revenue')
            ).filter(
                and_(
                    Appointment.appointment_date >= prev_start_date,
                    Appointment.appointment_date <= prev_end_date,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).first()
            
            # Calcular crescimento
            current_revenue = float(consultation_revenue.total_revenue or 0)
            prev_revenue = float(prev_consultation_revenue.total_revenue or 0)
            revenue_growth = ReportGenerator.calculate_growth_rate(current_revenue, prev_revenue)
            
            current_appointments = consultation_revenue.total_appointments or 0
            prev_appointments = prev_consultation_revenue.total_appointments or 0
            appointments_growth = ReportGenerator.calculate_growth_rate(current_appointments, prev_appointments)
            
            return APIResponse.success({
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days_diff
                },
                'consultations': {
                    'summary': {
                        'total_appointments': current_appointments,
                        'total_revenue': current_revenue,
                        'average_price': float(consultation_revenue.avg_price or 0),
                        'revenue_growth': revenue_growth,
                        'appointments_growth': appointments_growth
                    },
                    'by_type': [
                        {
                            'type': appointment_type.value if appointment_type else 'N/A',
                            'count': count,
                            'revenue': float(revenue)
                        }
                        for appointment_type, count, revenue in revenue_by_type
                    ],
                    'by_professional': [
                        {
                            'professional': full_name,
                            'appointments': appointments,
                            'revenue': float(revenue)
                        }
                        for full_name, appointments, revenue in revenue_by_professional
                    ],
                    'daily_trend': [
                        {
                            'date': date_obj.isoformat(),
                            'appointments': appointments,
                            'revenue': float(revenue)
                        }
                        for date_obj, appointments, revenue in daily_revenue
                    ]
                },
                'partnerships': partnership_data,
                'generated_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao gerar relatório financeiro: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@reports_bp.route('/dashboard', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def admin_dashboard():
    """
    Dashboard administrativo com KPIs principais
    
    Returns:
        KPIs e métricas principais do sistema
    """
    try:
        with get_db_session() as session:
            today = datetime.utcnow().date()
            start_of_month = today.replace(day=1)
            start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
            thirty_days_ago = today - timedelta(days=30)
            
            # KPIs Financeiros
            # Faturamento mensal
            current_month_revenue = session.query(
                func.sum(Appointment.price)
            ).filter(
                and_(
                    Appointment.appointment_date >= start_of_month,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).scalar() or Decimal('0')
            
            last_month_revenue = session.query(
                func.sum(Appointment.price)
            ).filter(
                and_(
                    Appointment.appointment_date >= start_of_last_month,
                    Appointment.appointment_date < start_of_month,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).scalar() or Decimal('0')
            
            revenue_growth = ReportGenerator.calculate_growth_rate(
                float(current_month_revenue), float(last_month_revenue)
            )
            
            # Pacientes ativos
            active_patients = session.query(
                func.count(func.distinct(Appointment.patient_id))
            ).filter(
                and_(
                    Appointment.appointment_date >= thirty_days_ago,
                    Appointment.status != Appointment.AppointmentStatus.CANCELLED
                )
            ).scalar() or 0
            
            total_patients = session.query(Patient).filter_by(is_active=True).count()
            
            # Novos pacientes no mês
            new_patients_month = session.query(Patient).filter(
                Patient.created_at >= start_of_month
            ).count()
            
            # Taxa de ocupação
            total_slots_month = session.query(Appointment).filter(
                Appointment.appointment_date >= start_of_month
            ).count()
            
            occupied_slots_month = session.query(Appointment).filter(
                and_(
                    Appointment.appointment_date >= start_of_month,
                    Appointment.status != Appointment.AppointmentStatus.CANCELLED
                )
            ).count()
            
            occupation_rate = (occupied_slots_month / total_slots_month * 100) if total_slots_month > 0 else 0
            
            # Taxa de no-show
            no_show_count = session.query(Appointment).filter(
                and_(
                    Appointment.appointment_date >= start_of_month,
                    Appointment.status == Appointment.AppointmentStatus.NO_SHOW
                )
            ).count()
            
            no_show_rate = (no_show_count / occupied_slots_month * 100) if occupied_slots_month > 0 else 0
            
            # Produtividade por profissional
            professional_productivity = session.query(
                User.full_name,
                func.count(Appointment.id).label('appointments'),
                func.sum(Appointment.price).label('revenue'),
                func.avg(Appointment.price).label('avg_price')
            ).join(
                Appointment, User.id == Appointment.professional_id
            ).filter(
                and_(
                    Appointment.appointment_date >= start_of_month,
                    Appointment.status.in_([
                        Appointment.AppointmentStatus.COMPLETED,
                        Appointment.AppointmentStatus.CONFIRMED
                    ])
                )
            ).group_by(
                User.id, User.full_name
            ).order_by(
                desc('revenue')
            ).all()
            
            # Agendamentos por status
            appointments_by_status = session.query(
                Appointment.status,
                func.count(Appointment.id).label('count')
            ).filter(
                Appointment.appointment_date >= start_of_month
            ).group_by(Appointment.status).all()
            
            # Top exercícios prescritos
            top_exercises = session.query(
                Exercise.name,
                func.count(PrescriptionExercise.id).label('prescriptions')
            ).join(
                PrescriptionExercise, Exercise.id == PrescriptionExercise.exercise_id
            ).join(
                Prescription, PrescriptionExercise.prescription_id == Prescription.id
            ).filter(
                Prescription.created_at >= start_of_month
            ).group_by(
                Exercise.id, Exercise.name
            ).order_by(
                desc('prescriptions')
            ).limit(10).all()
            
            # Dados de parcerias
            partnership_revenue = session.query(
                func.sum(PartnershipSession.platform_fee)
            ).filter(
                PartnershipSession.session_date >= start_of_month
            ).scalar() or Decimal('0')
            
            active_partnerships = session.query(Partnership).filter_by(
                status=Partnership.PartnershipStatus.ACTIVE
            ).count()
            
            # Vouchers ativos
            active_vouchers = session.query(Voucher).filter_by(
                status=Voucher.VoucherStatus.ACTIVE
            ).count()
            
            return APIResponse.success({
                'financial_kpis': {
                    'monthly_revenue': {
                        'current': float(current_month_revenue),
                        'previous': float(last_month_revenue),
                        'growth_rate': revenue_growth
                    },
                    'partnership_revenue': float(partnership_revenue)
                },
                'patient_kpis': {
                    'total_patients': total_patients,
                    'active_patients': active_patients,
                    'new_patients_month': new_patients_month,
                    'activity_rate': (active_patients / total_patients * 100) if total_patients > 0 else 0
                },
                'operational_kpis': {
                    'occupation_rate': occupation_rate,
                    'no_show_rate': no_show_rate,
                    'total_appointments_month': occupied_slots_month
                },
                'partnership_kpis': {
                    'active_partnerships': active_partnerships,
                    'active_vouchers': active_vouchers
                },
                'professional_productivity': [
                    {
                        'name': name,
                        'appointments': appointments,
                        'revenue': float(revenue),
                        'avg_price': float(avg_price)
                    }
                    for name, appointments, revenue, avg_price in professional_productivity
                ],
                'appointments_by_status': [
                    {
                        'status': status.value,
                        'count': count
                    }
                    for status, count in appointments_by_status
                ],
                'top_exercises': [
                    {
                        'name': name,
                        'prescriptions': prescriptions
                    }
                    for name, prescriptions in top_exercises
                ],
                'generated_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao gerar dashboard: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@reports_bp.route('/performance', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def performance_report():
    """
    Relatório de performance da equipe
    
    Query Parameters:
        period: Período (month, quarter, year)
        professional_id: ID do profissional específico (opcional)
    
    Returns:
        Relatório de performance detalhado
    """
    try:
        period = request.args.get('period', 'month')
        professional_id = request.args.get('professional_id')
        
        start_date, end_date = ReportGenerator.get_date_range(period)
        
        with get_db_session() as session:
            # Query base
            query = session.query(
                User.id,
                User.full_name,
                User.role,
                func.count(Appointment.id).label('total_appointments'),
                func.sum(
                    case(
                        (Appointment.status == Appointment.AppointmentStatus.COMPLETED, 1),
                        else_=0
                    )
                ).label('completed_appointments'),
                func.sum(
                    case(
                        (Appointment.status == Appointment.AppointmentStatus.CANCELLED, 1),
                        else_=0
                    )
                ).label('cancelled_appointments'),
                func.sum(
                    case(
                        (Appointment.status == Appointment.AppointmentStatus.NO_SHOW, 1),
                        else_=0
                    )
                ).label('no_show_appointments'),
                func.sum(Appointment.price).label('total_revenue'),
                func.avg(Appointment.price).label('avg_price'),
                func.count(func.distinct(Appointment.patient_id)).label('unique_patients')
            ).join(
                Appointment, User.id == Appointment.professional_id
            ).filter(
                and_(
                    Appointment.appointment_date >= start_date,
                    Appointment.appointment_date <= end_date,
                    User.role.in_([User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
                )
            )
            
            # Filtrar por profissional específico se fornecido
            if professional_id:
                query = query.filter(User.id == professional_id)
            
            performance_data = query.group_by(
                User.id, User.full_name, User.role
            ).order_by(
                desc('total_revenue')
            ).all()
            
            # Calcular métricas adicionais
            performance_report = []
            for data in performance_data:
                total_apps = data.total_appointments or 0
                completed_apps = data.completed_appointments or 0
                cancelled_apps = data.cancelled_appointments or 0
                no_show_apps = data.no_show_appointments or 0
                
                completion_rate = (completed_apps / total_apps * 100) if total_apps > 0 else 0
                cancellation_rate = (cancelled_apps / total_apps * 100) if total_apps > 0 else 0
                no_show_rate = (no_show_apps / total_apps * 100) if total_apps > 0 else 0
                
                # Prescrições criadas
                prescriptions_count = session.query(Prescription).filter(
                    and_(
                        Prescription.created_by == data.id,
                        Prescription.created_at >= start_date,
                        Prescription.created_at <= end_date
                    )
                ).count()
                
                performance_report.append({
                    'professional': {
                        'id': str(data.id),
                        'name': data.full_name,
                        'role': data.role.value
                    },
                    'appointments': {
                        'total': total_apps,
                        'completed': completed_apps,
                        'cancelled': cancelled_apps,
                        'no_show': no_show_apps,
                        'completion_rate': completion_rate,
                        'cancellation_rate': cancellation_rate,
                        'no_show_rate': no_show_rate
                    },
                    'financial': {
                        'total_revenue': float(data.total_revenue or 0),
                        'average_price': float(data.avg_price or 0)
                    },
                    'patients': {
                        'unique_patients': data.unique_patients or 0
                    },
                    'prescriptions': {
                        'total_created': prescriptions_count
                    }
                })
            
            # Estatísticas gerais da equipe
            team_stats = {
                'total_professionals': len(performance_report),
                'total_appointments': sum(p['appointments']['total'] for p in performance_report),
                'total_revenue': sum(p['financial']['total_revenue'] for p in performance_report),
                'avg_completion_rate': sum(p['appointments']['completion_rate'] for p in performance_report) / len(performance_report) if performance_report else 0,
                'avg_no_show_rate': sum(p['appointments']['no_show_rate'] for p in performance_report) / len(performance_report) if performance_report else 0
            }
            
            return APIResponse.success({
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'team_stats': team_stats,
                'individual_performance': performance_report,
                'generated_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao gerar relatório de performance: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@reports_bp.route('/compliance/lgpd', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def lgpd_compliance_report():
    """
    Relatório de compliance LGPD
    
    Returns:
        Relatório de conformidade com LGPD
    """
    try:
        with get_db_session() as session:
            # Logs de auditoria por tipo
            audit_logs_by_type = session.query(
                AuditLog.action_type,
                func.count(AuditLog.id).label('count')
            ).filter(
                AuditLog.created_at >= datetime.utcnow() - timedelta(days=30)
            ).group_by(AuditLog.action_type).all()
            
            # Acessos a dados sensíveis
            sensitive_data_access = session.query(
                AuditLog.user_id,
                User.full_name,
                func.count(AuditLog.id).label('access_count')
            ).join(
                User, AuditLog.user_id == User.id
            ).filter(
                and_(
                    AuditLog.action_type.in_([
                        'PATIENT_VIEWED', 'PATIENT_UPDATED', 'PATIENT_DELETED',
                        'PRESCRIPTION_VIEWED', 'PRESCRIPTION_CREATED'
                    ]),
                    AuditLog.created_at >= datetime.utcnow() - timedelta(days=30)
                )
            ).group_by(
                AuditLog.user_id, User.full_name
            ).order_by(
                desc('access_count')
            ).all()
            
            # Pacientes com consentimento
            patients_with_consent = session.query(Patient).filter(
                Patient.consent_data_processing == True
            ).count()
            
            total_patients = session.query(Patient).count()
            consent_rate = (patients_with_consent / total_patients * 100) if total_patients > 0 else 0
            
            # Solicitações de portabilidade/exclusão (simulado)
            data_requests = {
                'portability_requests': 0,  # Implementar quando necessário
                'deletion_requests': 0,     # Implementar quando necessário
                'pending_requests': 0       # Implementar quando necessário
            }
            
            return APIResponse.success({
                'compliance_overview': {
                    'consent_rate': consent_rate,
                    'patients_with_consent': patients_with_consent,
                    'total_patients': total_patients
                },
                'audit_activity': [
                    {
                        'action_type': action_type,
                        'count': count
                    }
                    for action_type, count in audit_logs_by_type
                ],
                'sensitive_data_access': [
                    {
                        'user_id': str(user_id),
                        'user_name': user_name,
                        'access_count': access_count
                    }
                    for user_id, user_name, access_count in sensitive_data_access
                ],
                'data_requests': data_requests,
                'generated_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao gerar relatório de compliance LGPD: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@reports_bp.route('/export/<string:report_type>', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def export_report(report_type):
    """
    Exportar relatório em CSV
    
    Path Parameters:
        report_type: Tipo do relatório (financial, performance, patients)
    
    Query Parameters:
        period: Período do relatório
        format: Formato de exportação (csv, json)
    
    Returns:
        Arquivo do relatório
    """
    try:
        period = request.args.get('period', 'month')
        export_format = request.args.get('format', 'csv')
        
        # Gerar dados baseado no tipo de relatório
        if report_type == 'financial':
            # Reutilizar lógica do relatório financeiro
            # Por simplicidade, retornando estrutura básica
            data = []
            headers = ['Data', 'Tipo', 'Profissional', 'Paciente', 'Valor']
        elif report_type == 'performance':
            data = []
            headers = ['Profissional', 'Consultas', 'Receita', 'Taxa Conclusão']
        else:
            return APIResponse.error('Tipo de relatório inválido', 400)
        
        if export_format == 'csv':
            # Criar arquivo CSV
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(headers)
            writer.writerows(data)
            
            # Preparar resposta
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'{report_type}_{period}_{datetime.utcnow().strftime("%Y%m%d")}.csv'
            )
        else:
            # Retornar JSON
            return APIResponse.success({
                'headers': headers,
                'data': data,
                'generated_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao exportar relatório: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)