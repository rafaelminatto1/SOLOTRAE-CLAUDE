# -*- coding: utf-8 -*-
"""
Módulo de Models do FisioFlow

Este módulo contém todos os modelos de dados do sistema FisioFlow,
incluindo modelos para usuários, pacientes, agendamentos, exercícios,
parcerias, relatórios, integrações, notificações e auditoria.

Todos os modelos seguem as melhores práticas do SQLAlchemy e incluem:
- Validações de dados
- Relacionamentos apropriados
- Métodos de conveniência
- Suporte a serialização
- Campos de auditoria
"""

from .user import User, UserProfile, UserPreferences
from .patient import Patient, PatientDocument, MedicalHistory, PatientContact
from .appointment import Appointment, AppointmentRecurrence, AppointmentNote
from .exercise import Exercise, ExerciseCategory, ExerciseVideo, ExercisePrescription, ExerciseExecution
from .partnership import Partnership, Voucher, VoucherUsage, PartnershipEarning, PartnershipWithdrawal
from .mentorship import Mentorship, ClinicalCase, CompetencyEvaluation, Certificate
from .report import Report, ReportTemplate
from .integration import Integration, IntegrationLog
from .notification import Notification, NotificationTemplate
from .audit import AuditLog

__all__ = [
    # User models
    'User',
    'UserProfile', 
    'UserPreferences',
    
    # Patient models
    'Patient',
    'PatientDocument',
    'MedicalHistory',
    'PatientContact',
    
    # Appointment models
    'Appointment',
    'AppointmentRecurrence',
    'AppointmentNote',
    
    # Exercise models
    'Exercise',
    'ExerciseCategory',
    'ExerciseVideo',
    'ExercisePrescription',
    'ExerciseExecution',
    
    # Partnership models
    'Partnership',
    'Voucher',
    'VoucherUsage',
    'PartnershipEarning',
    'PartnershipWithdrawal',
    
    # Mentorship models
    'Mentorship',
    'ClinicalCase',
    'CompetencyEvaluation',
    'Certificate',
    
    # Report models
    'Report',
    'ReportTemplate',
    
    # Integration models
    'Integration',
    'IntegrationLog',
    
    # Notification models
    'Notification',
    'NotificationTemplate',
    
    # Audit models
    'AuditLog'
]