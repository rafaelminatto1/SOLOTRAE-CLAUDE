# -*- coding: utf-8 -*-
"""
Routes de Administração - FisioFlow Backend

Este módulo implementa funcionalidades administrativas para gerenciamento
do sistema, usuários, configurações, logs de auditoria e monitoramento.

Endpoints:
- GET /admin/dashboard - Dashboard administrativo
- GET /admin/users - Gerenciar usuários
- POST /admin/users/{id}/activate - Ativar usuário
- POST /admin/users/{id}/deactivate - Desativar usuário
- GET /admin/audit-logs - Logs de auditoria
- GET /admin/system/status - Status do sistema
- GET /admin/system/config - Configurações do sistema
- PUT /admin/system/config - Atualizar configurações
- GET /admin/backup - Fazer backup
- POST /admin/backup/restore - Restaurar backup
- GET /admin/analytics - Análises avançadas
- POST /admin/maintenance - Modo manutenção
"""

from flask import Blueprint, request, jsonify, current_app, send_file
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy import and_, or_, desc, func, text
from sqlalchemy.orm import joinedload
import json
import os
import zipfile
import tempfile
import psutil
import subprocess
from pathlib import Path

from ..models import (
    User, Patient, Appointment, Exercise, Partnership, Voucher,
    AIUsage, AuditLog, SystemConfig, BackupLog
)
from ..database import get_db_session, get_db_engine
from ..utils.security import require_auth, require_role, get_current_user
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import DataValidator
from ..utils.helpers import CodeGenerator, DateTimeHelper, FileHelper
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')
logger = get_logger(__name__)

class SystemMonitor:
    """
    Monitor do sistema para coleta de métricas
    """
    
    @staticmethod
    def get_system_metrics() -> Dict[str, Any]:
        """
        Obter métricas do sistema
        
        Returns:
            Métricas do sistema
        """
        try:
            # Métricas de CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Métricas de memória
            memory = psutil.virtual_memory()
            
            # Métricas de disco
            disk = psutil.disk_usage('/')
            
            # Métricas de rede
            network = psutil.net_io_counters()
            
            # Processos
            process_count = len(psutil.pids())
            
            return {
                'cpu': {
                    'usage_percent': cpu_percent,
                    'count': cpu_count
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'used': memory.used,
                    'percent': memory.percent
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': (disk.used / disk.total) * 100
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv
                },
                'processes': process_count,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Erro ao obter métricas do sistema: {str(e)}")
            return {}
    
    @staticmethod
    def get_database_metrics() -> Dict[str, Any]:
        """
        Obter métricas do banco de dados
        
        Returns:
            Métricas do banco de dados
        """
        try:
            with get_db_session() as session:
                # Contagem de registros por tabela
                tables_count = {
                    'users': session.query(User).count(),
                    'patients': session.query(Patient).count(),
                    'appointments': session.query(Appointment).count(),
                    'exercises': session.query(Exercise).count(),
                    'partnerships': session.query(Partnership).count(),
                    'vouchers': session.query(Voucher).count(),
                    'audit_logs': session.query(AuditLog).count()
                }
                
                # Tamanho do banco (PostgreSQL)
                try:
                    result = session.execute(text(
                        "SELECT pg_size_pretty(pg_database_size(current_database()))"
                    )).scalar()
                    database_size = result
                except:
                    database_size = "N/A"
                
                # Conexões ativas
                try:
                    active_connections = session.execute(text(
                        "SELECT count(*) FROM pg_stat_activity WHERE state = 'active'"
                    )).scalar()
                except:
                    active_connections = 0
                
                return {
                    'tables_count': tables_count,
                    'database_size': database_size,
                    'active_connections': active_connections,
                    'timestamp': datetime.utcnow().isoformat()
                }
        
        except Exception as e:
            logger.error(f"Erro ao obter métricas do banco: {str(e)}")
            return {}

class BackupManager:
    """
    Gerenciador de backup do sistema
    """
    
    def __init__(self):
        self.backup_dir = Path(Config.BACKUP_DIR if hasattr(Config, 'BACKUP_DIR') else './backups')
        self.backup_dir.mkdir(exist_ok=True)
    
    def create_backup(self, include_files: bool = True) -> Dict[str, Any]:
        """
        Criar backup do sistema
        
        Args:
            include_files: Incluir arquivos de upload
        
        Returns:
            Informações do backup
        """
        try:
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            backup_name = f"fisioflow_backup_{timestamp}"
            backup_path = self.backup_dir / f"{backup_name}.zip"
            
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Backup do banco de dados
                db_backup_path = self._backup_database()
                if db_backup_path:
                    zipf.write(db_backup_path, 'database.sql')
                    os.remove(db_backup_path)  # Remover arquivo temporário
                
                # Backup de arquivos se solicitado
                if include_files:
                    self._backup_files(zipf)
                
                # Backup de configurações
                self._backup_config(zipf)
            
            # Registrar backup
            backup_size = backup_path.stat().st_size
            self._log_backup(backup_name, backup_size, True)
            
            return {
                'success': True,
                'backup_name': backup_name,
                'backup_path': str(backup_path),
                'size': backup_size,
                'created_at': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Erro ao criar backup: {str(e)}")
            self._log_backup(f"backup_{timestamp}", 0, False, str(e))
            return {
                'success': False,
                'error': str(e)
            }
    
    def _backup_database(self) -> Optional[str]:
        """
        Fazer backup do banco de dados
        
        Returns:
            Caminho do arquivo de backup
        """
        try:
            # Criar arquivo temporário
            temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False)
            temp_file.close()
            
            # Comando pg_dump (PostgreSQL)
            if hasattr(Config, 'DATABASE_URL') and 'postgresql' in Config.DATABASE_URL:
                cmd = [
                    'pg_dump',
                    '--no-password',
                    '--clean',
                    '--if-exists',
                    Config.DATABASE_URL,
                    '-f', temp_file.name
                ]
                
                subprocess.run(cmd, check=True, capture_output=True)
                return temp_file.name
            
            # Para SQLite, copiar arquivo diretamente
            elif hasattr(Config, 'DATABASE_URL') and 'sqlite' in Config.DATABASE_URL:
                import shutil
                db_path = Config.DATABASE_URL.replace('sqlite:///', '')
                shutil.copy2(db_path, temp_file.name)
                return temp_file.name
            
            return None
        
        except Exception as e:
            logger.error(f"Erro no backup do banco: {str(e)}")
            return None
    
    def _backup_files(self, zipf: zipfile.ZipFile):
        """
        Fazer backup de arquivos
        
        Args:
            zipf: Arquivo ZIP
        """
        try:
            # Diretórios para backup
            dirs_to_backup = [
                'uploads',
                'static',
                'templates'
            ]
            
            for dir_name in dirs_to_backup:
                dir_path = Path(dir_name)
                if dir_path.exists():
                    for file_path in dir_path.rglob('*'):
                        if file_path.is_file():
                            arcname = str(file_path.relative_to('.'))
                            zipf.write(file_path, arcname)
        
        except Exception as e:
            logger.error(f"Erro no backup de arquivos: {str(e)}")
    
    def _backup_config(self, zipf: zipfile.ZipFile):
        """
        Fazer backup de configurações
        
        Args:
            zipf: Arquivo ZIP
        """
        try:
            # Backup de configurações do sistema
            with get_db_session() as session:
                configs = session.query(SystemConfig).all()
                
                config_data = {
                    config.key: {
                        'value': config.value,
                        'description': config.description,
                        'updated_at': config.updated_at.isoformat() if config.updated_at else None
                    }
                    for config in configs
                }
                
                # Salvar em arquivo temporário
                temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
                json.dump(config_data, temp_file, indent=2, ensure_ascii=False)
                temp_file.close()
                
                zipf.write(temp_file.name, 'system_config.json')
                os.remove(temp_file.name)
        
        except Exception as e:
            logger.error(f"Erro no backup de configurações: {str(e)}")
    
    def _log_backup(self, name: str, size: int, success: bool, error: str = None):
        """
        Registrar log de backup
        
        Args:
            name: Nome do backup
            size: Tamanho do backup
            success: Sucesso da operação
            error: Mensagem de erro
        """
        try:
            with get_db_session() as session:
                backup_log = BackupLog(
                    id=CodeGenerator.generate_uuid(),
                    name=name,
                    size=size,
                    success=success,
                    error_message=error,
                    created_at=datetime.utcnow()
                )
                
                session.add(backup_log)
                session.commit()
        
        except Exception as e:
            logger.error(f"Erro ao registrar log de backup: {str(e)}")
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """
        Listar backups disponíveis
        
        Returns:
            Lista de backups
        """
        try:
            backups = []
            
            for backup_file in self.backup_dir.glob('*.zip'):
                stat = backup_file.stat()
                
                backups.append({
                    'name': backup_file.stem,
                    'filename': backup_file.name,
                    'size': stat.st_size,
                    'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'path': str(backup_file)
                })
            
            # Ordenar por data de criação (mais recente primeiro)
            backups.sort(key=lambda x: x['created_at'], reverse=True)
            
            return backups
        
        except Exception as e:
            logger.error(f"Erro ao listar backups: {str(e)}")
            return []

# Instâncias globais
system_monitor = SystemMonitor()
backup_manager = BackupManager()

@admin_bp.route('/dashboard', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def admin_dashboard():
    """
    Dashboard administrativo
    
    Returns:
        Dados do dashboard administrativo
    """
    try:
        with get_db_session() as session:
            # KPIs principais
            total_users = session.query(User).count()
            active_users = session.query(User).filter_by(is_active=True).count()
            total_patients = session.query(Patient).count()
            active_patients = session.query(Patient).filter_by(is_active=True).count()
            
            # Estatísticas de agendamentos
            today = datetime.utcnow().date()
            appointments_today = session.query(Appointment).filter(
                func.date(Appointment.appointment_date) == today
            ).count()
            
            # Últimos 30 dias
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            new_users_30d = session.query(User).filter(
                User.created_at >= thirty_days_ago
            ).count()
            
            new_patients_30d = session.query(Patient).filter(
                Patient.created_at >= thirty_days_ago
            ).count()
            
            # Uso de IA
            ai_usage_30d = session.query(AIUsage).filter(
                AIUsage.created_at >= thirty_days_ago
            ).count()
            
            # Parcerias ativas
            active_partnerships = session.query(Partnership).filter_by(
                status='active'
            ).count()
            
            # Logs de auditoria recentes
            recent_audit_logs = session.query(AuditLog).order_by(
                desc(AuditLog.created_at)
            ).limit(10).all()
            
            # Métricas do sistema
            system_metrics = system_monitor.get_system_metrics()
            db_metrics = system_monitor.get_database_metrics()
            
            return APIResponse.success({
                'kpis': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'total_patients': total_patients,
                    'active_patients': active_patients,
                    'appointments_today': appointments_today,
                    'new_users_30d': new_users_30d,
                    'new_patients_30d': new_patients_30d,
                    'ai_usage_30d': ai_usage_30d,
                    'active_partnerships': active_partnerships
                },
                'recent_activity': [
                    {
                        'id': log.id,
                        'action': log.action,
                        'table_name': log.table_name,
                        'user_id': log.user_id,
                        'created_at': log.created_at.isoformat()
                    }
                    for log in recent_audit_logs
                ],
                'system_metrics': system_metrics,
                'database_metrics': db_metrics,
                'generated_at': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro no dashboard administrativo: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/users', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def manage_users():
    """
    Gerenciar usuários
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20)
        search: Termo de busca
        role: Filtro por função
        status: Filtro por status (active, inactive)
        sort: Campo de ordenação
        order: Ordem (asc, desc)
    
    Returns:
        Lista de usuários com paginação
    """
    try:
        # Parâmetros de consulta
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        search = request.args.get('search', '').strip()
        role_filter = request.args.get('role')
        status_filter = request.args.get('status')
        sort_field = request.args.get('sort', 'created_at')
        sort_order = request.args.get('order', 'desc')
        
        with get_db_session() as session:
            # Query base
            query = session.query(User)
            
            # Filtros
            if search:
                query = query.filter(
                    or_(
                        User.name.ilike(f'%{search}%'),
                        User.email.ilike(f'%{search}%'),
                        User.phone.ilike(f'%{search}%')
                    )
                )
            
            if role_filter:
                query = query.filter(User.role == role_filter)
            
            if status_filter == 'active':
                query = query.filter(User.is_active == True)
            elif status_filter == 'inactive':
                query = query.filter(User.is_active == False)
            
            # Ordenação
            if hasattr(User, sort_field):
                order_column = getattr(User, sort_field)
                if sort_order == 'desc':
                    query = query.order_by(desc(order_column))
                else:
                    query = query.order_by(order_column)
            
            # Paginação
            total = query.count()
            users = query.offset((page - 1) * per_page).limit(per_page).all()
            
            # Serializar usuários
            users_data = []
            for user in users:
                users_data.append({
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'phone': user.phone,
                    'role': user.role.value,
                    'is_active': user.is_active,
                    'email_verified': user.email_verified,
                    'two_factor_enabled': user.two_factor_enabled,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'created_at': user.created_at.isoformat(),
                    'updated_at': user.updated_at.isoformat() if user.updated_at else None
                })
            
            pagination = PaginationHelper.create_pagination_info(
                page, per_page, total
            )
            
            return APIResponse.success({
                'users': users_data,
                'pagination': pagination
            })
    
    except Exception as e:
        logger.error(f"Erro ao gerenciar usuários: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/users/<user_id>/activate', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN])
def activate_user(user_id):
    """
    Ativar usuário
    
    Args:
        user_id: ID do usuário
    
    Returns:
        Confirmação da ativação
    """
    try:
        current_user = get_current_user()
        
        with get_db_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            
            if not user:
                return APIResponse.not_found('Usuário não encontrado')
            
            if user.is_active:
                return APIResponse.error('Usuário já está ativo', 400)
            
            user.is_active = True
            user.updated_at = datetime.utcnow()
            
            session.commit()
            
            # Log de auditoria
            AuditLog.log_action(
                session=session,
                user_id=current_user.id,
                action='ACTIVATE_USER',
                table_name='users',
                record_id=user_id,
                changes={'is_active': True}
            )
            
            logger.info(f"Usuário {user_id} ativado por {current_user.id}")
            
            return APIResponse.success({
                'message': 'Usuário ativado com sucesso',
                'user_id': user_id
            })
    
    except Exception as e:
        logger.error(f"Erro ao ativar usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/users/<user_id>/deactivate', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN])
def deactivate_user(user_id):
    """
    Desativar usuário
    
    Args:
        user_id: ID do usuário
    
    Returns:
        Confirmação da desativação
    """
    try:
        current_user = get_current_user()
        
        # Não permitir desativar a si mesmo
        if user_id == current_user.id:
            return APIResponse.error('Não é possível desativar sua própria conta', 400)
        
        with get_db_session() as session:
            user = session.query(User).filter_by(id=user_id).first()
            
            if not user:
                return APIResponse.not_found('Usuário não encontrado')
            
            if not user.is_active:
                return APIResponse.error('Usuário já está inativo', 400)
            
            user.is_active = False
            user.updated_at = datetime.utcnow()
            
            session.commit()
            
            # Log de auditoria
            AuditLog.log_action(
                session=session,
                user_id=current_user.id,
                action='DEACTIVATE_USER',
                table_name='users',
                record_id=user_id,
                changes={'is_active': False}
            )
            
            logger.info(f"Usuário {user_id} desativado por {current_user.id}")
            
            return APIResponse.success({
                'message': 'Usuário desativado com sucesso',
                'user_id': user_id
            })
    
    except Exception as e:
        logger.error(f"Erro ao desativar usuário: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/audit-logs', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def get_audit_logs():
    """
    Obter logs de auditoria
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 50)
        action: Filtro por ação
        table_name: Filtro por tabela
        user_id: Filtro por usuário
        start_date: Data inicial (ISO format)
        end_date: Data final (ISO format)
    
    Returns:
        Logs de auditoria com paginação
    """
    try:
        # Parâmetros de consulta
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 200)
        action_filter = request.args.get('action')
        table_filter = request.args.get('table_name')
        user_filter = request.args.get('user_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        with get_db_session() as session:
            # Query base
            query = session.query(AuditLog).options(
                joinedload(AuditLog.user)
            )
            
            # Filtros
            if action_filter:
                query = query.filter(AuditLog.action == action_filter)
            
            if table_filter:
                query = query.filter(AuditLog.table_name == table_filter)
            
            if user_filter:
                query = query.filter(AuditLog.user_id == user_filter)
            
            if start_date:
                try:
                    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                    query = query.filter(AuditLog.created_at >= start_dt)
                except ValueError:
                    return APIResponse.error('Formato de data inicial inválido', 400)
            
            if end_date:
                try:
                    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    query = query.filter(AuditLog.created_at <= end_dt)
                except ValueError:
                    return APIResponse.error('Formato de data final inválido', 400)
            
            # Ordenação por data (mais recente primeiro)
            query = query.order_by(desc(AuditLog.created_at))
            
            # Paginação
            total = query.count()
            logs = query.offset((page - 1) * per_page).limit(per_page).all()
            
            # Serializar logs
            logs_data = []
            for log in logs:
                logs_data.append({
                    'id': log.id,
                    'action': log.action,
                    'table_name': log.table_name,
                    'record_id': log.record_id,
                    'user_id': log.user_id,
                    'user_name': log.user.name if log.user else 'Sistema',
                    'changes': log.changes,
                    'ip_address': log.ip_address,
                    'user_agent': log.user_agent,
                    'created_at': log.created_at.isoformat()
                })
            
            pagination = PaginationHelper.create_pagination_info(
                page, per_page, total
            )
            
            return APIResponse.success({
                'logs': logs_data,
                'pagination': pagination
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter logs de auditoria: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/system/status', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def get_system_status():
    """
    Obter status do sistema
    
    Returns:
        Status detalhado do sistema
    """
    try:
        # Métricas do sistema
        system_metrics = system_monitor.get_system_metrics()
        db_metrics = system_monitor.get_database_metrics()
        
        # Status dos serviços
        services_status = {
            'database': True,  # Se chegou até aqui, o banco está funcionando
            'redis': False,    # Implementar verificação do Redis
            'email': False,    # Implementar verificação do email
            'storage': True    # Implementar verificação do storage
        }
        
        # Verificar espaço em disco
        disk_usage = system_metrics.get('disk', {})
        disk_warning = disk_usage.get('percent', 0) > 80
        
        # Verificar uso de memória
        memory_usage = system_metrics.get('memory', {})
        memory_warning = memory_usage.get('percent', 0) > 85
        
        # Status geral
        overall_status = 'healthy'
        warnings = []
        
        if disk_warning:
            warnings.append('Espaço em disco baixo')
            overall_status = 'warning'
        
        if memory_warning:
            warnings.append('Uso de memória alto')
            overall_status = 'warning'
        
        if not all(services_status.values()):
            warnings.append('Alguns serviços estão indisponíveis')
            overall_status = 'warning'
        
        return APIResponse.success({
            'status': overall_status,
            'warnings': warnings,
            'system_metrics': system_metrics,
            'database_metrics': db_metrics,
            'services': services_status,
            'uptime': psutil.boot_time(),
            'checked_at': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Erro ao obter status do sistema: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/backup', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def create_backup():
    """
    Criar backup do sistema
    
    Query Parameters:
        include_files: Incluir arquivos (true/false)
    
    Returns:
        Informações do backup criado
    """
    try:
        include_files = request.args.get('include_files', 'true').lower() == 'true'
        
        # Criar backup
        result = backup_manager.create_backup(include_files=include_files)
        
        if result['success']:
            return APIResponse.success(result)
        else:
            return APIResponse.error(result['error'], 500)
    
    except Exception as e:
        logger.error(f"Erro ao criar backup: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/backup/list', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def list_backups():
    """
    Listar backups disponíveis
    
    Returns:
        Lista de backups
    """
    try:
        backups = backup_manager.list_backups()
        
        return APIResponse.success({
            'backups': backups,
            'total': len(backups)
        })
    
    except Exception as e:
        logger.error(f"Erro ao listar backups: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@admin_bp.route('/analytics', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def get_analytics():
    """
    Obter análises avançadas
    
    Query Parameters:
        period: Período de análise (week, month, quarter, year)
    
    Returns:
        Dados de análise
    """
    try:
        period = request.args.get('period', 'month')
        
        # Calcular período
        periods = {
            'week': timedelta(weeks=1),
            'month': timedelta(days=30),
            'quarter': timedelta(days=90),
            'year': timedelta(days=365)
        }
        
        if period not in periods:
            return APIResponse.error('Período inválido', 400)
        
        start_date = datetime.utcnow() - periods[period]
        
        with get_db_session() as session:
            # Crescimento de usuários
            users_growth = session.query(
                func.date(User.created_at).label('date'),
                func.count(User.id).label('count')
            ).filter(
                User.created_at >= start_date
            ).group_by(
                func.date(User.created_at)
            ).order_by('date').all()
            
            # Crescimento de pacientes
            patients_growth = session.query(
                func.date(Patient.created_at).label('date'),
                func.count(Patient.id).label('count')
            ).filter(
                Patient.created_at >= start_date
            ).group_by(
                func.date(Patient.created_at)
            ).order_by('date').all()
            
            # Agendamentos por status
            appointments_by_status = session.query(
                Appointment.status,
                func.count(Appointment.id).label('count')
            ).filter(
                Appointment.created_at >= start_date
            ).group_by(
                Appointment.status
            ).all()
            
            # Uso de IA por tipo
            ai_usage_by_type = session.query(
                AIUsage.task_type,
                func.count(AIUsage.id).label('count'),
                func.sum(AIUsage.tokens_used).label('total_tokens'),
                func.sum(AIUsage.cost).label('total_cost')
            ).filter(
                AIUsage.created_at >= start_date
            ).group_by(
                AIUsage.task_type
            ).all()
            
            return APIResponse.success({
                'period': period,
                'start_date': start_date.isoformat(),
                'end_date': datetime.utcnow().isoformat(),
                'users_growth': [
                    {'date': str(row.date), 'count': row.count}
                    for row in users_growth
                ],
                'patients_growth': [
                    {'date': str(row.date), 'count': row.count}
                    for row in patients_growth
                ],
                'appointments_by_status': [
                    {'status': row.status.value, 'count': row.count}
                    for row in appointments_by_status
                ],
                'ai_usage_by_type': [
                    {
                        'task_type': row.task_type,
                        'count': row.count,
                        'total_tokens': row.total_tokens,
                        'total_cost': float(row.total_cost) if row.total_cost else 0
                    }
                    for row in ai_usage_by_type
                ]
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter análises: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)