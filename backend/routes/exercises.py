# -*- coding: utf-8 -*-
"""
Routes de Exercícios - FisioFlow Backend

Este módulo implementa todas as rotas relacionadas à biblioteca de exercícios,
incluindo CRUD de exercícios, categorias, prescrições e vídeos.

Endpoints:
- GET /exercises - Listar exercícios
- POST /exercises - Criar novo exercício
- GET /exercises/{id} - Obter exercício específico
- PUT /exercises/{id} - Atualizar exercício
- DELETE /exercises/{id} - Excluir exercício
- GET /exercises/categories - Listar categorias
- POST /exercises/categories - Criar categoria
- GET /exercises/search - Buscar exercícios
- POST /exercises/{id}/video - Upload de vídeo
- GET /exercises/{id}/video - Obter vídeo
- POST /exercises/prescriptions - Criar prescrição
- GET /exercises/prescriptions - Listar prescrições
- PUT /exercises/prescriptions/{id} - Atualizar prescrição
- DELETE /exercises/prescriptions/{id} - Excluir prescrição
- GET /exercises/stats - Estatísticas
"""

from flask import Blueprint, request, jsonify, current_app, send_file
from sqlalchemy import or_, and_, func, desc, asc, text
from datetime import datetime, timedelta
import os
import uuid
from werkzeug.utils import secure_filename

from ..models import Exercise, ExerciseCategory, ExercisePrescription, Patient, User, AuditLog
from ..database import get_db_session
from ..utils.security import require_auth, require_role
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import DataValidator
from ..utils.helpers import FileHelper, CodeGenerator
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
exercises_bp = Blueprint('exercises', __name__, url_prefix='/api/exercises')
logger = get_logger(__name__)

# Configurações de upload
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'}
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024    # 5MB

@exercises_bp.route('', methods=['GET'])
@require_auth
def list_exercises():
    """
    Listar exercícios com filtros e paginação
    
    Query Parameters:
        page: Página (padrão: 1)
        per_page: Itens por página (padrão: 20)
        category_id: Filtrar por categoria
        difficulty: Filtrar por dificuldade
        body_part: Filtrar por parte do corpo
        equipment: Filtrar por equipamento
        search: Termo de busca
        is_active: Filtrar por status ativo
        sort_by: Campo para ordenação
        sort_order: Ordem (asc/desc)
    
    Returns:
        Lista paginada de exercícios
    """
    try:
        # Obter parâmetros
        pagination = PaginationHelper.get_pagination_params(request)
        category_id = request.args.get('category_id')
        difficulty = request.args.get('difficulty')
        body_part = request.args.get('body_part')
        equipment = request.args.get('equipment')
        search_term = request.args.get('search')
        is_active = request.args.get('is_active')
        
        with get_db_session() as session:
            # Query base com join da categoria
            query = session.query(Exercise).join(
                ExerciseCategory, Exercise.category_id == ExerciseCategory.id
            )
            
            # Filtro de categoria
            if category_id:
                query = query.filter(Exercise.category_id == category_id)
            
            # Filtro de dificuldade
            if difficulty:
                try:
                    difficulty_enum = Exercise.DifficultyLevel(difficulty.upper())
                    query = query.filter(Exercise.difficulty == difficulty_enum)
                except ValueError:
                    pass
            
            # Filtro de parte do corpo
            if body_part:
                try:
                    body_part_enum = Exercise.BodyPart(body_part.upper())
                    query = query.filter(Exercise.body_part == body_part_enum)
                except ValueError:
                    pass
            
            # Filtro de equipamento
            if equipment:
                try:
                    equipment_enum = Exercise.Equipment(equipment.upper())
                    query = query.filter(Exercise.equipment == equipment_enum)
                except ValueError:
                    pass
            
            # Filtro de busca
            if search_term:
                search_filter = or_(
                    Exercise.name.ilike(f'%{search_term}%'),
                    Exercise.description.ilike(f'%{search_term}%'),
                    Exercise.instructions.ilike(f'%{search_term}%'),
                    ExerciseCategory.name.ilike(f'%{search_term}%')
                )
                query = query.filter(search_filter)
            
            # Filtro de status ativo
            if is_active is not None:
                active_bool = is_active.lower() in ['true', '1', 'yes']
                query = query.filter(Exercise.is_active == active_bool)
            
            # Ordenação
            sort_by = request.args.get('sort_by', 'name')
            sort_order = request.args.get('sort_order', 'asc')
            
            if hasattr(Exercise, sort_by):
                order_column = getattr(Exercise, sort_by)
                if sort_order.lower() == 'desc':
                    query = query.order_by(order_column.desc())
                else:
                    query = query.order_by(order_column.asc())
            else:
                query = query.order_by(Exercise.name.asc())
            
            # Paginação
            total = query.count()
            exercises = query.offset(
                (pagination['page'] - 1) * pagination['per_page']
            ).limit(pagination['per_page']).all()
            
            # Serializar dados
            exercises_data = []
            for exercise in exercises:
                exercise_dict = exercise.to_dict()
                exercise_dict['category'] = {
                    'id': str(exercise.category.id),
                    'name': exercise.category.name,
                    'description': exercise.category.description
                }
                exercises_data.append(exercise_dict)
            
            return APIResponse.paginated(
                data=exercises_data,
                page=pagination['page'],
                per_page=pagination['per_page'],
                total=total
            )
    
    except Exception as e:
        logger.error(f"Erro ao listar exercícios: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def create_exercise():
    """
    Criar novo exercício
    
    Body:
        name: Nome do exercício
        description: Descrição
        instructions: Instruções de execução
        category_id: ID da categoria
        difficulty: Nível de dificuldade
        body_part: Parte do corpo
        equipment: Equipamento necessário
        duration_seconds: Duração em segundos (opcional)
        repetitions: Número de repetições (opcional)
        sets: Número de séries (opcional)
        rest_seconds: Tempo de descanso (opcional)
        precautions: Precauções (opcional)
        benefits: Benefícios (opcional)
        is_active: Status ativo (padrão: true)
    
    Returns:
        Dados do exercício criado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        required_fields = [
            'name', 'description', 'instructions', 'category_id',
            'difficulty', 'body_part', 'equipment'
        ]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return APIResponse.error(
                f"Campos obrigatórios: {', '.join(missing_fields)}",
                400
            )
        
        # Validar enums
        try:
            difficulty = Exercise.DifficultyLevel(data['difficulty'].upper())
            body_part = Exercise.BodyPart(data['body_part'].upper())
            equipment = Exercise.Equipment(data['equipment'].upper())
        except ValueError as e:
            return APIResponse.error(f'Valor inválido: {str(e)}', 400)
        
        with get_db_session() as session:
            # Verificar se categoria existe
            category = session.query(ExerciseCategory).filter_by(
                id=data['category_id'],
                is_active=True
            ).first()
            
            if not category:
                return APIResponse.error('Categoria não encontrada', 404)
            
            # Verificar se nome já existe
            existing_exercise = session.query(Exercise).filter_by(
                name=data['name']
            ).first()
            
            if existing_exercise:
                return APIResponse.error('Exercício com este nome já existe', 409)
            
            # Gerar código do exercício
            exercise_code = CodeGenerator.generate_short_id()
            
            # Criar exercício
            exercise = Exercise(
                exercise_code=exercise_code,
                name=data['name'],
                description=data['description'],
                instructions=data['instructions'],
                category_id=data['category_id'],
                difficulty=difficulty,
                body_part=body_part,
                equipment=equipment,
                duration_seconds=data.get('duration_seconds'),
                repetitions=data.get('repetitions'),
                sets=data.get('sets'),
                rest_seconds=data.get('rest_seconds'),
                precautions=data.get('precautions'),
                benefits=data.get('benefits'),
                is_active=data.get('is_active', True),
                created_by=current_user.id
            )
            
            session.add(exercise)
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='EXERCISE_CREATED',
                description=f'Exercício criado: {exercise.name}',
                level='INFO',
                entity_type='Exercise',
                entity_id=str(exercise.id),
                new_data=exercise.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Adicionar dados da categoria ao retorno
            exercise_dict = exercise.to_dict()
            exercise_dict['category'] = {
                'id': str(category.id),
                'name': category.name,
                'description': category.description
            }
            
            return APIResponse.success(exercise_dict, 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar exercício: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/<uuid:exercise_id>', methods=['GET'])
@require_auth
def get_exercise(exercise_id):
    """
    Obter exercício específico
    
    Path Parameters:
        exercise_id: ID do exercício
    
    Returns:
        Dados completos do exercício
    """
    try:
        with get_db_session() as session:
            exercise = session.query(Exercise).filter_by(
                id=exercise_id
            ).first()
            
            if not exercise:
                return APIResponse.not_found('Exercício não encontrado')
            
            # Serializar dados
            exercise_dict = exercise.to_dict()
            exercise_dict['category'] = exercise.category.to_dict()
            
            # Adicionar informações de arquivos se existirem
            if exercise.video_url:
                exercise_dict['has_video'] = True
                exercise_dict['video_info'] = {
                    'url': exercise.video_url,
                    'filename': exercise.video_filename,
                    'size': exercise.video_size
                }
            
            if exercise.thumbnail_url:
                exercise_dict['has_thumbnail'] = True
                exercise_dict['thumbnail_info'] = {
                    'url': exercise.thumbnail_url,
                    'filename': exercise.thumbnail_filename
                }
            
            return APIResponse.success(exercise_dict)
    
    except Exception as e:
        logger.error(f"Erro ao obter exercício: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/<uuid:exercise_id>', methods=['PUT'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def update_exercise(exercise_id):
    """
    Atualizar exercício
    
    Path Parameters:
        exercise_id: ID do exercício
    
    Body:
        Campos do exercício para atualizar
    
    Returns:
        Dados do exercício atualizado
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        if not data:
            return APIResponse.error('Dados não fornecidos', 400)
        
        with get_db_session() as session:
            exercise = session.query(Exercise).filter_by(
                id=exercise_id
            ).first()
            
            if not exercise:
                return APIResponse.not_found('Exercício não encontrado')
            
            # Dados anteriores para auditoria
            old_data = exercise.to_dict()
            
            # Atualizar campos
            if 'name' in data:
                # Verificar se nome já existe (excluindo o próprio exercício)
                existing_exercise = session.query(Exercise).filter(
                    and_(
                        Exercise.name == data['name'],
                        Exercise.id != exercise_id
                    )
                ).first()
                
                if existing_exercise:
                    return APIResponse.error('Exercício com este nome já existe', 409)
                
                exercise.name = data['name']
            
            if 'description' in data:
                exercise.description = data['description']
            
            if 'instructions' in data:
                exercise.instructions = data['instructions']
            
            if 'category_id' in data:
                # Verificar se categoria existe
                category = session.query(ExerciseCategory).filter_by(
                    id=data['category_id'],
                    is_active=True
                ).first()
                
                if not category:
                    return APIResponse.error('Categoria não encontrada', 404)
                
                exercise.category_id = data['category_id']
            
            if 'difficulty' in data:
                try:
                    exercise.difficulty = Exercise.DifficultyLevel(data['difficulty'].upper())
                except ValueError:
                    return APIResponse.error('Nível de dificuldade inválido', 400)
            
            if 'body_part' in data:
                try:
                    exercise.body_part = Exercise.BodyPart(data['body_part'].upper())
                except ValueError:
                    return APIResponse.error('Parte do corpo inválida', 400)
            
            if 'equipment' in data:
                try:
                    exercise.equipment = Exercise.Equipment(data['equipment'].upper())
                except ValueError:
                    return APIResponse.error('Equipamento inválido', 400)
            
            # Campos opcionais
            optional_fields = [
                'duration_seconds', 'repetitions', 'sets', 'rest_seconds',
                'precautions', 'benefits', 'is_active'
            ]
            
            for field in optional_fields:
                if field in data:
                    setattr(exercise, field, data[field])
            
            exercise.updated_at = datetime.utcnow()
            exercise.updated_by = current_user.id
            session.commit()
            
            # Log atualização
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='EXERCISE_UPDATED',
                description=f'Exercício atualizado: {exercise.name}',
                level='INFO',
                entity_type='Exercise',
                entity_id=str(exercise.id),
                old_data=old_data,
                new_data=exercise.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Retornar dados atualizados
            exercise_dict = exercise.to_dict()
            exercise_dict['category'] = exercise.category.to_dict()
            
            return APIResponse.success(exercise_dict)
    
    except Exception as e:
        logger.error(f"Erro ao atualizar exercício: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/<uuid:exercise_id>', methods=['DELETE'])
@require_auth
@require_role([User.UserRole.ADMIN])
def delete_exercise(exercise_id):
    """
    Excluir exercício (soft delete)
    
    Path Parameters:
        exercise_id: ID do exercício
    
    Returns:
        Confirmação de exclusão
    """
    try:
        current_user = request.current_user
        
        with get_db_session() as session:
            exercise = session.query(Exercise).filter_by(
                id=exercise_id
            ).first()
            
            if not exercise:
                return APIResponse.not_found('Exercício não encontrado')
            
            # Verificar se exercício está sendo usado em prescrições ativas
            active_prescriptions = session.query(ExercisePrescription).filter(
                and_(
                    ExercisePrescription.exercise_id == exercise_id,
                    ExercisePrescription.is_active == True
                )
            ).count()
            
            if active_prescriptions > 0:
                return APIResponse.error(
                    'Exercício não pode ser excluído pois está sendo usado em prescrições ativas',
                    400
                )
            
            # Soft delete
            exercise.is_active = False
            exercise.deleted_at = datetime.utcnow()
            exercise.deleted_by = current_user.id
            exercise.updated_at = datetime.utcnow()
            exercise.updated_by = current_user.id
            session.commit()
            
            # Log exclusão
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='EXERCISE_DELETED',
                description=f'Exercício excluído: {exercise.name}',
                level='WARNING',
                entity_type='Exercise',
                entity_id=str(exercise.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success({
                'message': 'Exercício excluído com sucesso',
                'exercise_name': exercise.name
            })
    
    except Exception as e:
        logger.error(f"Erro ao excluir exercício: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/categories', methods=['GET'])
@require_auth
def list_categories():
    """
    Listar categorias de exercícios
    
    Query Parameters:
        is_active: Filtrar por status ativo (padrão: true)
    
    Returns:
        Lista de categorias
    """
    try:
        is_active = request.args.get('is_active', 'true')
        active_bool = is_active.lower() in ['true', '1', 'yes']
        
        with get_db_session() as session:
            query = session.query(ExerciseCategory)
            
            if is_active is not None:
                query = query.filter(ExerciseCategory.is_active == active_bool)
            
            categories = query.order_by(ExerciseCategory.name.asc()).all()
            
            # Adicionar contagem de exercícios por categoria
            categories_data = []
            for category in categories:
                category_dict = category.to_dict()
                
                # Contar exercícios ativos na categoria
                exercise_count = session.query(Exercise).filter(
                    and_(
                        Exercise.category_id == category.id,
                        Exercise.is_active == True
                    )
                ).count()
                
                category_dict['exercise_count'] = exercise_count
                categories_data.append(category_dict)
            
            return APIResponse.success(categories_data)
    
    except Exception as e:
        logger.error(f"Erro ao listar categorias: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/categories', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN])
def create_category():
    """
    Criar nova categoria de exercícios
    
    Body:
        name: Nome da categoria
        description: Descrição
        color: Cor da categoria (hex)
        icon: Ícone da categoria
        is_active: Status ativo (padrão: true)
    
    Returns:
        Dados da categoria criada
    """
    try:
        data = request.get_json()
        current_user = request.current_user
        
        # Validar campos obrigatórios
        if not data.get('name'):
            return APIResponse.error('Nome é obrigatório', 400)
        
        with get_db_session() as session:
            # Verificar se nome já existe
            existing_category = session.query(ExerciseCategory).filter_by(
                name=data['name']
            ).first()
            
            if existing_category:
                return APIResponse.error('Categoria com este nome já existe', 409)
            
            # Criar categoria
            category = ExerciseCategory(
                name=data['name'],
                description=data.get('description'),
                color=data.get('color'),
                icon=data.get('icon'),
                is_active=data.get('is_active', True),
                created_by=current_user.id
            )
            
            session.add(category)
            session.commit()
            
            # Log criação
            AuditLog.create_log(
                session=session,
                user_id=current_user.id,
                action_type='EXERCISE_CATEGORY_CREATED',
                description=f'Categoria criada: {category.name}',
                level='INFO',
                entity_type='ExerciseCategory',
                entity_id=str(category.id),
                new_data=category.to_dict(),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            return APIResponse.success(category.to_dict(), 201)
    
    except Exception as e:
        logger.error(f"Erro ao criar categoria: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/search', methods=['GET'])
@require_auth
def search_exercises():
    """
    Buscar exercícios
    
    Query Parameters:
        q: Termo de busca
        category: Categoria
        difficulty: Dificuldade
        body_part: Parte do corpo
        equipment: Equipamento
        limit: Limite de resultados (padrão: 10)
    
    Returns:
        Lista de exercícios encontrados
    """
    try:
        search_term = request.args.get('q', '').strip()
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        body_part = request.args.get('body_part')
        equipment = request.args.get('equipment')
        limit = int(request.args.get('limit', 10))
        
        if not search_term and not any([category, difficulty, body_part, equipment]):
            return APIResponse.error('Pelo menos um critério de busca é necessário', 400)
        
        with get_db_session() as session:
            query = session.query(Exercise).join(
                ExerciseCategory, Exercise.category_id == ExerciseCategory.id
            ).filter(Exercise.is_active == True)
            
            # Filtro de busca textual
            if search_term:
                search_filter = or_(
                    Exercise.name.ilike(f'%{search_term}%'),
                    Exercise.description.ilike(f'%{search_term}%'),
                    Exercise.instructions.ilike(f'%{search_term}%'),
                    ExerciseCategory.name.ilike(f'%{search_term}%')
                )
                query = query.filter(search_filter)
            
            # Filtros específicos
            if category:
                query = query.filter(ExerciseCategory.name.ilike(f'%{category}%'))
            
            if difficulty:
                try:
                    difficulty_enum = Exercise.DifficultyLevel(difficulty.upper())
                    query = query.filter(Exercise.difficulty == difficulty_enum)
                except ValueError:
                    pass
            
            if body_part:
                try:
                    body_part_enum = Exercise.BodyPart(body_part.upper())
                    query = query.filter(Exercise.body_part == body_part_enum)
                except ValueError:
                    pass
            
            if equipment:
                try:
                    equipment_enum = Exercise.Equipment(equipment.upper())
                    query = query.filter(Exercise.equipment == equipment_enum)
                except ValueError:
                    pass
            
            # Ordenar por relevância (nome primeiro, depois descrição)
            if search_term:
                query = query.order_by(
                    Exercise.name.ilike(f'%{search_term}%').desc(),
                    Exercise.name.asc()
                )
            else:
                query = query.order_by(Exercise.name.asc())
            
            exercises = query.limit(limit).all()
            
            # Serializar dados
            exercises_data = []
            for exercise in exercises:
                exercise_dict = exercise.to_dict()
                exercise_dict['category'] = {
                    'id': str(exercise.category.id),
                    'name': exercise.category.name
                }
                exercises_data.append(exercise_dict)
            
            return APIResponse.success({
                'exercises': exercises_data,
                'total_found': len(exercises_data),
                'search_term': search_term
            })
    
    except Exception as e:
        logger.error(f"Erro na busca de exercícios: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@exercises_bp.route('/stats', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def get_exercise_stats():
    """
    Obter estatísticas de exercícios
    
    Returns:
        Estatísticas dos exercícios
    """
    try:
        with get_db_session() as session:
            # Total de exercícios
            total_exercises = session.query(Exercise).filter(
                Exercise.is_active == True
            ).count()
            
            # Exercícios por categoria
            category_stats = session.query(
                ExerciseCategory.name,
                func.count(Exercise.id).label('count')
            ).join(
                Exercise, ExerciseCategory.id == Exercise.category_id
            ).filter(
                Exercise.is_active == True
            ).group_by(ExerciseCategory.name).all()
            
            # Exercícios por dificuldade
            difficulty_stats = session.query(
                Exercise.difficulty,
                func.count(Exercise.id).label('count')
            ).filter(
                Exercise.is_active == True
            ).group_by(Exercise.difficulty).all()
            
            # Exercícios por parte do corpo
            body_part_stats = session.query(
                Exercise.body_part,
                func.count(Exercise.id).label('count')
            ).filter(
                Exercise.is_active == True
            ).group_by(Exercise.body_part).all()
            
            # Exercícios por equipamento
            equipment_stats = session.query(
                Exercise.equipment,
                func.count(Exercise.id).label('count')
            ).filter(
                Exercise.is_active == True
            ).group_by(Exercise.equipment).all()
            
            # Exercícios com vídeo
            exercises_with_video = session.query(Exercise).filter(
                and_(
                    Exercise.is_active == True,
                    Exercise.video_url.isnot(None)
                )
            ).count()
            
            # Exercícios mais prescritos (últimos 30 dias)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            most_prescribed = session.query(
                Exercise.name,
                func.count(ExercisePrescription.id).label('prescription_count')
            ).join(
                ExercisePrescription, Exercise.id == ExercisePrescription.exercise_id
            ).filter(
                and_(
                    Exercise.is_active == True,
                    ExercisePrescription.created_at >= thirty_days_ago
                )
            ).group_by(
                Exercise.id, Exercise.name
            ).order_by(
                func.count(ExercisePrescription.id).desc()
            ).limit(10).all()
            
            return APIResponse.success({
                'total_exercises': total_exercises,
                'by_category': {
                    category: count for category, count in category_stats
                },
                'by_difficulty': {
                    difficulty.value: count for difficulty, count in difficulty_stats
                },
                'by_body_part': {
                    body_part.value: count for body_part, count in body_part_stats
                },
                'by_equipment': {
                    equipment.value: count for equipment, count in equipment_stats
                },
                'exercises_with_video': exercises_with_video,
                'video_coverage_percentage': round(
                    (exercises_with_video / total_exercises * 100) if total_exercises > 0 else 0, 2
                ),
                'most_prescribed': [
                    {'name': name, 'count': count} for name, count in most_prescribed
                ]
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

# Funções auxiliares para upload de arquivos

def _allowed_file(filename, allowed_extensions):
    """
    Verificar se arquivo tem extensão permitida
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def _save_uploaded_file(file, upload_folder, max_size):
    """
    Salvar arquivo enviado
    
    Args:
        file: Arquivo enviado
        upload_folder: Pasta de destino
        max_size: Tamanho máximo em bytes
    
    Returns:
        Dict com informações do arquivo salvo
    """
    try:
        # Verificar tamanho
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > max_size:
            return {
                'success': False,
                'error': f'Arquivo muito grande. Máximo: {max_size // (1024*1024)}MB'
            }
        
        # Gerar nome único
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        # Criar pasta se não existir
        os.makedirs(upload_folder, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        return {
            'success': True,
            'filename': unique_filename,
            'original_filename': filename,
            'file_path': file_path,
            'file_size': file_size
        }
    
    except Exception as e:
        logger.error(f"Erro ao salvar arquivo: {str(e)}")
        return {
            'success': False,
            'error': 'Erro ao salvar arquivo'
        }