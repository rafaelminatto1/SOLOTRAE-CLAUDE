# -*- coding: utf-8 -*-
"""
Routes de Pacientes - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas ao gerenciamento
de pacientes, incluindo CRUD, prontuários, histórico médico e documentos.

Endpoints:
- GET /patients - Listar pacientes
- POST /patients - Criar novo paciente
- GET /patients/{id} - Obter paciente específico
- PUT /patients/{id} - Atualizar paciente
- DELETE /patients/{id} - Excluir paciente
- GET /patients/{id}/medical-history - Histórico médico
- POST /patients/{id}/medical-history - Adicionar entrada no histórico
- PUT /patients/{id}/medical-history/{entry_id} - Atualizar entrada
- DELETE /patients/{id}/medical-history/{entry_id} - Remover entrada
- GET /patients/{id}/documents - Listar documentos
- POST /patients/{id}/documents - Upload de documento
- DELETE /patients/{id}/documents/{doc_id} - Remover documento
- GET /patients/{id}/timeline - Timeline do paciente
- GET /patients/search - Buscar pacientes
- GET /patients/stats - Estatísticas
"""

from flask import Blueprint, request, jsonify, current_app, send_file
from sqlalchemy import or_, and_, func, desc
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from ..models import Patient, User, AuditLog
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import (
    ContactValidator, DocumentValidator, AddressValidator,
    MedicalValidator, DataValidator
)
from ..utils.helpers import FileHelper, CodeGenerator, DateTimeHelper
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
patients_bp = Blueprint('patients', __name__, url_prefix='/api/patients')
logger = get_logger(__name__)

@patients_bp.route('', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def list_patients():
    """
    Listar pacientes com filtros e paginação
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20)
        search: Buscar por nome, CPF ou e-mail
        status: Filtrar por status (ativo/inativo)
        gender: Filtrar por gênero
        age_min: Idade mínima
        age_max: Idade máxima
        sort_by: Campo para ordenação
        sort_order: Ordem (asc/desc)
    
    Returns:
        Lista paginada de pacientes
    """
    try:
        current_user = request.current_user
        
        # Obter parâmetros
        pagination = PaginationHelper.get_pagination_params(request)
        search_term = request.args.get('search', '').strip()
        status_filter = request.args.get('status')
        gender_filter = request.args.get('gender')
        age_min = request.args.get('age_min', type=int)
        age_max = request.args.get('age_max', type=int)
        
        with get_db_session() as session:
            # Query base
            query = session.query(Patient)
            
            # Filtro de busca
            if search_term:
                search_pattern = f'%{search_term}%'
                query = query.filter(
                    or_(
                        Patient.name.ilike(search_pattern),
                        Patient.cpf.ilike(search_pattern),
                        Patient.email.ilike(search_pattern),
                        Patient.patient_number.ilike(search_pattern)
                    )
                )
            
            # Filtro de status
            if status_filter:
                is_active = status_filter.lower() == 'ativo'
                query = query.filter(Patient.is_active == is_active)
            
            # Filtro de gênero
            if gender_filter:
                try:
                    gender_enum = Patient.Gender(gender_filter.upper())
                    query = query.filter(Patient.gender == gender_enum)
                except ValueError:
                    pass
            
            # Filtro de idade
            if age_min is not None or age_max is not None:
                today = datetime.utcnow().date()
                
                if age_min is not None:
                    max_birth_date = today.replace(year=today.year - age_min)
                    query = query.filter(Patient.birth_date <= max_birth_date)
                
                if age_max is not None:
                    min_birth_date = today.replace(year=today.year - age_max - 1)
                    query = query.filter(Patient.birth_date > min_birth_date)
            
            # Ordenação
            sort_by = request.args.get('sort_by', 'created_at')
            sort_order = request.args.get('sort_order', 'desc')
            
            if hasattr(Patient, sort_by):
                order_column = getattr(Patient, sort_by)
                if sort_order.lower() == 'desc':
                    query = query.order_by(order_column.desc())
                else:
                    query = query.order_by(order_column.asc())
            
            # Paginação
            total = query.count()
            patients = query.offset(
                (pagination['page'] - 1) * pagination['per_page']
            ).limit(pagination['per_page']).all()
            
            # Serializar dados
            patients_data = []
            for patient in patients:
                patient_dict = patient.to_dict()
                # Adicionar idade calculada
                if patient.birth_date:
                    patient_dict['age'] = DateTimeHelper.calculate_age(patient.birth_date)
                patients_data.append(patient_dict)
            
            return APIResponse.paginated(
                data=patients_data,
                page=pagination['page'],
                per_page=pagination['per_page'],
                total=total
            )
    
    except Exception as e:
        logger.error(f"Erro ao listar pacientes: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@patients_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def create_patient():
    """
    Criar novo paciente
    
    Body:
        name: Nome completo
        cpf: CPF
        email: E-mail (opcional)
        phone: Telefone
        birth_date: Data de nascimento (YYYY-MM-DD)
        gender: Gênero (M/F/O)
        address: Endereço completo
        emergency_contact: Contato de emergência
        medical_history: Histórico médico inicial (opcional)
        observations: Observações (opcional)
    
    Returns:
        Dados do paciente criado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        required_fields = ['name', 'cpf', 'phone', 'birth_date', 'gender']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Validar CPF
        cpf_validation = DocumentValidator.validate_cpf(data['cpf'])
        if not cpf_validation['valid']:
            return APIResponse.error(cpf_validation['error'], 400)
        
        # Validar e-mail se fornecido
        email_validation = None
        if data.get('email'):
            email_validation = ContactValidator.validate_email(data['email'])
            if not email_validation['valid']:
                return APIResponse.error(email_validation['error'], 400)
        
        # Validar telefone
        phone_validation = ContactValidator.validate_phone(data['phone'])
        if not phone_validation['valid']:
            return APIResponse.error(phone_validation['error'], 400)
        
        # Validar data de nascimento
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            if birth_date > datetime.utcnow().date():
                return APIResponse.error('Data de nascimento não pode ser futura', 400)
        except ValueError:
            return APIResponse.error('Data de nascimento inválida (use YYYY-MM-DD)', 400)
        
        # Validar gênero
        try:
            gender_enum = Patient.Gender(data['gender'].upper())
        except ValueError:
            return APIResponse.error('Gênero inválido (M/F/O)', 400)
        
        # Validar endereço se fornecido
        address_data = data.get('address', {})
        if address_data.get('cep'):
            cep_validation = AddressValidator.validate_cep(address_data['cep'])
            if not cep_validation['valid']:
                return APIResponse.error(cep_validation['error'], 400)
        
        with get_db_session() as session:
            # Verificar se CPF já existe
            existing_patient = session.query(Patient).filter_by(
                cpf=cpf_validation['formatted']
            ).first()
            
            if existing_patient:
                return APIResponse.error('CPF já cadastrado', 409)
            
            # Verificar e-mail se fornecido
            if email_validation:
                existing_email = session.query(Patient).filter_by(
                    email=email_validation['normalized']
                ).first()
                
                if existing_email:
                    return APIResponse.error('E-mail já cadastrado', 409)
            
            # Gerar número do paciente
            patient_number = CodeGenerator.generate_patient_number()
            
            # Criar paciente
            patient = Patient(
                patient_number=patient_number,
                name=data['name'].strip(),
                cpf=cpf_validation['formatted'],
                email=email_validation['normalized'] if email_validation else None,
                phone=phone_validation['formatted'],
                birth_date=birth_date,
                gender=gender_enum,
                
                # Endereço
                address_street=address_data.get('street'),
                address_number=address_data.get('number'),
                address_complement=address_data.get('complement'),
                address_neighborhood=address_data.get('neighborhood'),
                address_city=address_data.get('city'),
                address_state=address_data.get('state'),
                address_cep=cep_validation['formatted'] if address_data.get('cep') else None,
                
                # Contato de emergência
                emergency_contact_name=data.get('emergency_contact', {}).get('name'),
                emergency_contact_phone=data.get('emergency_contact', {}).get('phone'),
                emergency_contact_relationship=data.get('emergency_contact', {}).get('relationship'),
                
                # Outros dados
                medical_history=data.get('medical_history'),
                observations=data.get('observations'),
                
                # Metadados
                created_by=current_user.id,
                is_active=True
            )
            
            session.add(patient)
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='PATIENT_CREATED',
                description=f'Paciente criado: {patient.name} ({patient.patient_number})',
                level='INFO',
                entity_type='Patient',
                entity_id=str(patient.id),
                new_data=patient.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Adicionar idade ao retorno
            patient_dict = patient.to_dict()
            patient_dict['age'] = DateTimeHelper.calculate_age(patient.birth_date)
            
            return APIResponse.success(patient_dict, 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar paciente: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@patients_bp.route('/<uuid:patient_id>', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def get_patient(patient_id):
    """
    Obter paciente específico
    
    Path Parameters:
        patient_id: ID do paciente
    
    Returns:
        Dados completos do paciente
    """
    try:
        with get_db_session() as session:
            patient = session.query(Patient).filter_by(id=patient_id).first()
            
            if not patient:
                return APIResponse.not_found('Paciente não encontrado')
            
            # Serializar dados
            patient_dict = patient.to_dict()
            
            # Adicionar informações calculadas
            if patient.birth_date:
                patient_dict['age'] = DateTimeHelper.calculate_age(patient.birth_date)
            
            # Adicionar estatísticas básicas
            # TODO: Adicionar contadores de consultas, exercícios, etc.
            
            return APIResponse.success(patient_dict)
    
    except Exception as e:
        logger.error(f"Erro ao obter paciente: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@patients_bp.route('/<uuid:patient_id>', methods=['PUT'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def update_patient(patient_id):
    """
    Atualizar paciente
    
    Path Parameters:
        patient_id: ID do paciente
    
    Body:
        Campos do paciente para atualizar
    
    Returns:
        Dados do paciente atualizado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        if not data:
            return APIResponse.error('Dados não fornecidos', 400)
        
        with get_db_session() as session:
            patient = session.query(Patient).filter_by(id=patient_id).first()
            
            if not patient:
                return APIResponse.not_found('Paciente não encontrado')
            
            # Dados anteriores para auditoria
            old_data = patient.to_dict()
            
            # Atualizar campos
            if 'name' in data:
                patient.name = data['name'].strip()
            
            if 'cpf' in data:
                cpf_validation = DocumentValidator.validate_cpf(data['cpf'])
                if not cpf_validation['valid']:
                    return APIResponse.error(cpf_validation['error'], 400)
                
                # Verificar se CPF já existe
                existing_patient = session.query(Patient).filter(
                    and_(
                        Patient.cpf == cpf_validation['formatted'],
                        Patient.id != patient.id
                    )
                ).first()
                
                if existing_patient:
                    return APIResponse.error('CPF já cadastrado', 409)
                
                patient.cpf = cpf_validation['formatted']
            
            if 'email' in data:
                if data['email']:
                    email_validation = ContactValidator.validate_email(data['email'])
                    if not email_validation['valid']:
                        return APIResponse.error(email_validation['error'], 400)
                    
                    # Verificar se e-mail já existe
                    existing_email = session.query(Patient).filter(
                        and_(
                            Patient.email == email_validation['normalized'],
                            Patient.id != patient.id
                        )
                    ).first()
                    
                    if existing_email:
                        return APIResponse.error('E-mail já cadastrado', 409)
                    
                    patient.email = email_validation['normalized']
                else:
                    patient.email = None
            
            if 'phone' in data:
                phone_validation = ContactValidator.validate_phone(data['phone'])
                if not phone_validation['valid']:
                    return APIResponse.error(phone_validation['error'], 400)
                patient.phone = phone_validation['formatted']
            
            if 'birth_date' in data:
                try:
                    birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
                    if birth_date > datetime.utcnow().date():
                        return APIResponse.error('Data de nascimento não pode ser futura', 400)
                    patient.birth_date = birth_date
                except ValueError:
                    return APIResponse.error('Data de nascimento inválida', 400)
            
            if 'gender' in data:
                try:
                    patient.gender = Patient.Gender(data['gender'].upper())
                except ValueError:
                    return APIResponse.error('Gênero inválido', 400)
            
            # Atualizar endereço
            if 'address' in data:
                address_data = data['address']
                patient.address_street = address_data.get('street')
                patient.address_number = address_data.get('number')
                patient.address_complement = address_data.get('complement')
                patient.address_neighborhood = address_data.get('neighborhood')
                patient.address_city = address_data.get('city')
                patient.address_state = address_data.get('state')
                
                if address_data.get('cep'):
                    cep_validation = AddressValidator.validate_cep(address_data['cep'])
                    if not cep_validation['valid']:
                        return APIResponse.error(cep_validation['error'], 400)
                    patient.address_cep = cep_validation['formatted']
            
            # Atualizar contato de emergência
            if 'emergency_contact' in data:
                emergency_data = data['emergency_contact']
                patient.emergency_contact_name = emergency_data.get('name')
                patient.emergency_contact_phone = emergency_data.get('phone')
                patient.emergency_contact_relationship = emergency_data.get('relationship')
            
            # Outros campos
            if 'medical_history' in data:
                patient.medical_history = data['medical_history']
            
            if 'observations' in data:
                patient.observations = data['observations']
            
            if 'is_active' in data:
                patient.is_active = bool(data['is_active'])
            
            patient.updated_at = datetime.utcnow()
            patient.updated_by = current_user.id
            session.commit()
            
            # Log atualização
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='PATIENT_UPDATED',
                description=f'Paciente atualizado: {patient.name}',
                level='INFO',
                entity_type='Patient',
                entity_id=str(patient.id),
                old_data=old_data,
                new_data=patient.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Retornar dados atualizados
            patient_dict = patient.to_dict()
            if patient.birth_date:
                patient_dict['age'] = DateTimeHelper.calculate_age(patient.birth_date)
            
            return APIResponse.success(patient_dict)
    
    except Exception as e:
        logger.error(f"Erro ao atualizar paciente: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@patients_bp.route('/<uuid:patient_id>', methods=['DELETE'])
@require_auth
@require_role([User.UserRole.ADMIN])
def delete_patient(patient_id):
    """
    Excluir paciente (soft delete)
    
    Path Parameters:
        patient_id: ID do paciente
    
    Returns:
        Confirmação de exclusão
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            patient = session.query(Patient).filter_by(id=patient_id).first()
            
            if not patient:
                return APIResponse.not_found('Paciente não encontrado')
            
            # Soft delete
            patient.is_active = False
            patient.deleted_at = datetime.utcnow()
            patient.deleted_by = current_user.id
            session.commit()
            
            # Log exclusão
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='PATIENT_DELETED',
                description=f'Paciente excluído: {patient.name}',
                level='WARNING',
                entity_type='Patient',
                entity_id=str(patient.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({'message': 'Paciente excluído com sucesso'})
    
    except Exception as e:
        logger.error(f"Erro ao excluir paciente: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@patients_bp.route('/search', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA, User.UserRole.ESTAGIARIO])
def search_patients():
    """
    Buscar pacientes
    
    Query Parameters:
        q: Termo de busca
        limit: Limite de resultados (padrão: 10)
    
    Returns:
        Lista de pacientes encontrados
    """
    try:
        search_term = request.args.get('q', '').strip()
        limit = min(int(request.args.get('limit', 10)), 50)
        
        if not search_term:
            return APIResponse.error('Termo de busca é obrigatório', 400)
        
        with get_db_session() as session:
            search_pattern = f'%{search_term}%'
            
            patients = session.query(Patient).filter(
                and_(
                    Patient.is_active == True,
                    or_(
                        Patient.name.ilike(search_pattern),
                        Patient.cpf.ilike(search_pattern),
                        Patient.email.ilike(search_pattern),
                        Patient.patient_number.ilike(search_pattern)
                    )
                )
            ).limit(limit).all()
            
            # Serializar resultados
            results = []
            for patient in patients:
                patient_dict = {
                    'id': str(patient.id),
                    'patient_number': patient.patient_number,
                    'name': patient.name,
                    'cpf': patient.cpf,
                    'email': patient.email,
                    'phone': patient.phone
                }
                
                if patient.birth_date:
                    patient_dict['age'] = DateTimeHelper.calculate_age(patient.birth_date)
                
                results.append(patient_dict)
            
            return APIResponse.success({
                'patients': results,
                'total': len(results)
            })
    
    except Exception as e:
        logger.error(f"Erro na busca de pacientes: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@patients_bp.route('/stats', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def get_patient_stats():
    """
    Obter estatísticas de pacientes
    
    Returns:
        Estatísticas dos pacientes
    """
    try:
        with get_db_session() as session:
            # Total de pacientes
            total_patients = session.query(Patient).filter(
                Patient.is_active == True
            ).count()
            
            # Pacientes por gênero
            gender_stats = session.query(
                Patient.gender,
                func.count(Patient.id).label('count')
            ).filter(Patient.is_active == True).group_by(Patient.gender).all()
            
            # Novos pacientes (últimos 30 dias)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            new_patients = session.query(Patient).filter(
                and_(
                    Patient.created_at >= thirty_days_ago,
                    Patient.is_active == True
                )
            ).count()
            
            # Faixas etárias
            today = datetime.utcnow().date()
            age_ranges = {
                '0-17': 0,
                '18-30': 0,
                '31-50': 0,
                '51-70': 0,
                '70+': 0
            }
            
            patients_with_birth_date = session.query(Patient).filter(
                and_(
                    Patient.birth_date.isnot(None),
                    Patient.is_active == True
                )
            ).all()
            
            for patient in patients_with_birth_date:
                age = DateTimeHelper.calculate_age(patient.birth_date)
                if age < 18:
                    age_ranges['0-17'] += 1
                elif age <= 30:
                    age_ranges['18-30'] += 1
                elif age <= 50:
                    age_ranges['31-50'] += 1
                elif age <= 70:
                    age_ranges['51-70'] += 1
                else:
                    age_ranges['70+'] += 1
            
            return APIResponse.success({
                'total_patients': total_patients,
                'new_patients_30_days': new_patients,
                'by_gender': {
                    gender.value if gender else 'Não informado': count 
                    for gender, count in gender_stats
                },
                'by_age_range': age_ranges
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)