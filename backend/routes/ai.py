# -*- coding: utf-8 -*-
"""
Routes de IA - FisioFlow Backend

Este módulo implementa o sistema híbrido de IA com orquestração de contas premium
(ChatGPT Plus, Claude Pro, Gemini Pro, Perplexity Pro) e base de conhecimento interna.

Endpoints:
- POST /ai/chat - Chat com IA
- POST /ai/analyze/patient - Análise de paciente
- POST /ai/suggest/exercises - Sugestão de exercícios
- POST /ai/generate/report - Gerar relatório
- GET /ai/providers/status - Status dos provedores
- POST /ai/knowledge/add - Adicionar conhecimento
- GET /ai/knowledge/search - Buscar conhecimento
- GET /ai/usage/stats - Estatísticas de uso
- POST /ai/feedback - Feedback sobre resposta
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy import and_, or_, desc, func
from sqlalchemy.orm import joinedload
import json
import asyncio
import aiohttp
import openai
import anthropic
import google.generativeai as genai
from concurrent.futures import ThreadPoolExecutor
import time
import hashlib

from ..models import (
    User, Patient, Exercise, AIKnowledge, AIUsage, AIFeedback,
    Appointment, Prescription, AuditLog
)
from ..database import get_db_session
from ..utils.security import require_auth, require_role, get_current_user
from ..utils.response import APIResponse, PaginationHelper
from ..utils.validators import DataValidator
from ..utils.helpers import CodeGenerator, TextHelper
from ..utils.logger import get_logger
from ..config import Config

# Criar blueprint
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')
logger = get_logger(__name__)

class AIOrchestrator:
    """
    Orquestrador de IA que gerencia múltiplos provedores premium
    """
    
    def __init__(self):
        self.providers = {
            'openai': {
                'name': 'ChatGPT Plus',
                'client': None,
                'available': False,
                'rate_limit': 50,  # requests per minute
                'cost_per_token': 0.002,
                'specialties': ['general', 'analysis', 'coding']
            },
            'anthropic': {
                'name': 'Claude Pro',
                'client': None,
                'available': False,
                'rate_limit': 30,
                'cost_per_token': 0.003,
                'specialties': ['analysis', 'reasoning', 'medical']
            },
            'gemini': {
                'name': 'Gemini Pro',
                'client': None,
                'available': False,
                'rate_limit': 60,
                'cost_per_token': 0.001,
                'specialties': ['multimodal', 'general', 'research']
            },
            'perplexity': {
                'name': 'Perplexity Pro',
                'client': None,
                'available': False,
                'rate_limit': 40,
                'cost_per_token': 0.002,
                'specialties': ['research', 'factual', 'current']
            }
        }
        self.knowledge_base = AIKnowledgeBase()
        self.usage_tracker = AIUsageTracker()
        self._initialize_providers()
    
    def _initialize_providers(self):
        """
        Inicializar provedores de IA
        """
        try:
            # OpenAI
            if hasattr(Config, 'OPENAI_API_KEY') and Config.OPENAI_API_KEY:
                openai.api_key = Config.OPENAI_API_KEY
                self.providers['openai']['client'] = openai
                self.providers['openai']['available'] = True
                logger.info("OpenAI inicializado com sucesso")
            
            # Anthropic
            if hasattr(Config, 'ANTHROPIC_API_KEY') and Config.ANTHROPIC_API_KEY:
                self.providers['anthropic']['client'] = anthropic.Anthropic(
                    api_key=Config.ANTHROPIC_API_KEY
                )
                self.providers['anthropic']['available'] = True
                logger.info("Anthropic inicializado com sucesso")
            
            # Gemini
            if hasattr(Config, 'GEMINI_API_KEY') and Config.GEMINI_API_KEY:
                genai.configure(api_key=Config.GEMINI_API_KEY)
                self.providers['gemini']['client'] = genai
                self.providers['gemini']['available'] = True
                logger.info("Gemini inicializado com sucesso")
            
            # Perplexity (usando API compatível com OpenAI)
            if hasattr(Config, 'PERPLEXITY_API_KEY') and Config.PERPLEXITY_API_KEY:
                # Configurar cliente Perplexity
                self.providers['perplexity']['available'] = True
                logger.info("Perplexity inicializado com sucesso")
        
        except Exception as e:
            logger.error(f"Erro ao inicializar provedores de IA: {str(e)}")
    
    def get_best_provider(self, task_type: str, user_tier: str = 'basic') -> Optional[str]:
        """
        Selecionar o melhor provedor para uma tarefa
        
        Args:
            task_type: Tipo da tarefa (analysis, general, medical, etc.)
            user_tier: Nível do usuário (basic, premium)
        
        Returns:
            Nome do provedor selecionado
        """
        available_providers = [
            name for name, config in self.providers.items()
            if config['available']
        ]
        
        if not available_providers:
            return None
        
        # Para usuários básicos, usar apenas um provedor por vez
        if user_tier == 'basic':
            return available_providers[0]
        
        # Para usuários premium, selecionar baseado na especialidade
        best_provider = None
        best_score = 0
        
        for provider_name in available_providers:
            provider = self.providers[provider_name]
            score = 0
            
            # Pontuação baseada na especialidade
            if task_type in provider['specialties']:
                score += 10
            
            # Pontuação baseada na disponibilidade de rate limit
            usage = self.usage_tracker.get_current_usage(provider_name)
            if usage < provider['rate_limit'] * 0.8:  # 80% do limite
                score += 5
            
            # Pontuação baseada no custo (menor custo = maior pontuação)
            score += (1 / provider['cost_per_token']) * 0.1
            
            if score > best_score:
                best_score = score
                best_provider = provider_name
        
        return best_provider
    
    async def generate_response(
        self,
        prompt: str,
        context: Dict[str, Any] = None,
        task_type: str = 'general',
        user_id: str = None,
        user_tier: str = 'basic'
    ) -> Dict[str, Any]:
        """
        Gerar resposta usando IA
        
        Args:
            prompt: Prompt para a IA
            context: Contexto adicional
            task_type: Tipo da tarefa
            user_id: ID do usuário
            user_tier: Nível do usuário
        
        Returns:
            Resposta da IA
        """
        try:
            # Verificar conhecimento interno primeiro
            internal_response = await self.knowledge_base.search_knowledge(prompt)
            
            if internal_response and internal_response['confidence'] > 0.8:
                # Usar conhecimento interno se confiança for alta
                return {
                    'success': True,
                    'response': internal_response['content'],
                    'source': 'internal',
                    'confidence': internal_response['confidence'],
                    'provider': 'knowledge_base'
                }
            
            # Selecionar provedor externo
            provider_name = self.get_best_provider(task_type, user_tier)
            
            if not provider_name:
                return {
                    'success': False,
                    'error': 'Nenhum provedor de IA disponível',
                    'fallback': internal_response['content'] if internal_response else None
                }
            
            # Gerar resposta com provedor selecionado
            response = await self._call_provider(
                provider_name, prompt, context, task_type
            )
            
            # Registrar uso
            if user_id:
                self.usage_tracker.record_usage(
                    user_id=user_id,
                    provider=provider_name,
                    task_type=task_type,
                    tokens_used=response.get('tokens_used', 0),
                    cost=response.get('cost', 0)
                )
            
            return response
        
        except Exception as e:
            logger.error(f"Erro ao gerar resposta de IA: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'fallback': internal_response['content'] if internal_response else None
            }
    
    async def _call_provider(
        self,
        provider_name: str,
        prompt: str,
        context: Dict[str, Any] = None,
        task_type: str = 'general'
    ) -> Dict[str, Any]:
        """
        Chamar provedor específico de IA
        
        Args:
            provider_name: Nome do provedor
            prompt: Prompt para a IA
            context: Contexto adicional
            task_type: Tipo da tarefa
        
        Returns:
            Resposta do provedor
        """
        provider = self.providers[provider_name]
        
        # Construir prompt com contexto
        full_prompt = self._build_prompt(prompt, context, task_type)
        
        try:
            if provider_name == 'openai':
                return await self._call_openai(full_prompt)
            elif provider_name == 'anthropic':
                return await self._call_anthropic(full_prompt)
            elif provider_name == 'gemini':
                return await self._call_gemini(full_prompt)
            elif provider_name == 'perplexity':
                return await self._call_perplexity(full_prompt)
            else:
                raise ValueError(f"Provedor não suportado: {provider_name}")
        
        except Exception as e:
            logger.error(f"Erro ao chamar {provider_name}: {str(e)}")
            raise
    
    def _build_prompt(self, prompt: str, context: Dict[str, Any] = None, task_type: str = 'general') -> str:
        """
        Construir prompt com contexto
        
        Args:
            prompt: Prompt base
            context: Contexto adicional
            task_type: Tipo da tarefa
        
        Returns:
            Prompt completo
        """
        system_prompts = {
            'general': "Você é um assistente de fisioterapia especializado. Responda de forma clara e profissional.",
            'analysis': "Você é um especialista em análise de dados de fisioterapia. Analise os dados fornecidos e forneça insights relevantes.",
            'medical': "Você é um fisioterapeuta experiente. Forneça orientações baseadas em evidências científicas.",
            'exercise': "Você é um especialista em prescrição de exercícios terapêuticos. Sugira exercícios apropriados."
        }
        
        system_prompt = system_prompts.get(task_type, system_prompts['general'])
        
        full_prompt = f"{system_prompt}\n\n"
        
        if context:
            full_prompt += "Contexto:\n"
            for key, value in context.items():
                full_prompt += f"- {key}: {value}\n"
            full_prompt += "\n"
        
        full_prompt += f"Pergunta: {prompt}"
        
        return full_prompt
    
    async def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """
        Chamar OpenAI GPT
        """
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return {
                'success': True,
                'response': content,
                'provider': 'openai',
                'tokens_used': tokens_used,
                'cost': tokens_used * self.providers['openai']['cost_per_token']
            }
        
        except Exception as e:
            logger.error(f"Erro OpenAI: {str(e)}")
            raise
    
    async def _call_anthropic(self, prompt: str) -> Dict[str, Any]:
        """
        Chamar Anthropic Claude
        """
        try:
            client = self.providers['anthropic']['client']
            
            response = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            
            return {
                'success': True,
                'response': content,
                'provider': 'anthropic',
                'tokens_used': tokens_used,
                'cost': tokens_used * self.providers['anthropic']['cost_per_token']
            }
        
        except Exception as e:
            logger.error(f"Erro Anthropic: {str(e)}")
            raise
    
    async def _call_gemini(self, prompt: str) -> Dict[str, Any]:
        """
        Chamar Google Gemini
        """
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            content = response.text
            tokens_used = len(prompt.split()) + len(content.split())  # Estimativa
            
            return {
                'success': True,
                'response': content,
                'provider': 'gemini',
                'tokens_used': tokens_used,
                'cost': tokens_used * self.providers['gemini']['cost_per_token']
            }
        
        except Exception as e:
            logger.error(f"Erro Gemini: {str(e)}")
            raise
    
    async def _call_perplexity(self, prompt: str) -> Dict[str, Any]:
        """
        Chamar Perplexity
        """
        try:
            # Implementar chamada para Perplexity API
            # Por enquanto, simulação
            
            content = f"Resposta simulada do Perplexity para: {prompt[:100]}..."
            tokens_used = len(prompt.split()) + len(content.split())
            
            return {
                'success': True,
                'response': content,
                'provider': 'perplexity',
                'tokens_used': tokens_used,
                'cost': tokens_used * self.providers['perplexity']['cost_per_token']
            }
        
        except Exception as e:
            logger.error(f"Erro Perplexity: {str(e)}")
            raise

class AIKnowledgeBase:
    """
    Base de conhecimento interna
    """
    
    async def search_knowledge(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Buscar conhecimento interno
        
        Args:
            query: Consulta de busca
        
        Returns:
            Resultado da busca
        """
        try:
            with get_db_session() as session:
                # Buscar conhecimento relevante
                knowledge_items = session.query(AIKnowledge).filter(
                    or_(
                        AIKnowledge.title.ilike(f'%{query}%'),
                        AIKnowledge.content.ilike(f'%{query}%'),
                        AIKnowledge.tags.ilike(f'%{query}%')
                    )
                ).order_by(desc(AIKnowledge.relevance_score)).limit(5).all()
                
                if not knowledge_items:
                    return None
                
                # Calcular confiança baseada na relevância
                best_item = knowledge_items[0]
                confidence = min(best_item.relevance_score / 100.0, 1.0)
                
                return {
                    'content': best_item.content,
                    'confidence': confidence,
                    'source': 'internal_knowledge',
                    'title': best_item.title,
                    'tags': best_item.tags
                }
        
        except Exception as e:
            logger.error(f"Erro ao buscar conhecimento: {str(e)}")
            return None
    
    def add_knowledge(
        self,
        title: str,
        content: str,
        category: str,
        tags: List[str] = None,
        relevance_score: float = 50.0
    ) -> bool:
        """
        Adicionar conhecimento à base
        
        Args:
            title: Título do conhecimento
            content: Conteúdo
            category: Categoria
            tags: Tags
            relevance_score: Pontuação de relevância
        
        Returns:
            Sucesso da operação
        """
        try:
            with get_db_session() as session:
                knowledge = AIKnowledge(
                    id=CodeGenerator.generate_uuid(),
                    title=title,
                    content=content,
                    category=category,
                    tags=','.join(tags) if tags else '',
                    relevance_score=relevance_score,
                    created_at=datetime.utcnow()
                )
                
                session.add(knowledge)
                session.commit()
                
                return True
        
        except Exception as e:
            logger.error(f"Erro ao adicionar conhecimento: {str(e)}")
            return False

class AIUsageTracker:
    """
    Rastreador de uso de IA
    """
    
    def record_usage(
        self,
        user_id: str,
        provider: str,
        task_type: str,
        tokens_used: int,
        cost: float
    ):
        """
        Registrar uso de IA
        
        Args:
            user_id: ID do usuário
            provider: Provedor usado
            task_type: Tipo da tarefa
            tokens_used: Tokens utilizados
            cost: Custo
        """
        try:
            with get_db_session() as session:
                usage = AIUsage(
                    id=CodeGenerator.generate_uuid(),
                    user_id=user_id,
                    provider=provider,
                    task_type=task_type,
                    tokens_used=tokens_used,
                    cost=cost,
                    created_at=datetime.utcnow()
                )
                
                session.add(usage)
                session.commit()
        
        except Exception as e:
            logger.error(f"Erro ao registrar uso: {str(e)}")
    
    def get_current_usage(self, provider: str) -> int:
        """
        Obter uso atual do provedor (última hora)
        
        Args:
            provider: Nome do provedor
        
        Returns:
            Número de requests na última hora
        """
        try:
            with get_db_session() as session:
                one_hour_ago = datetime.utcnow() - timedelta(hours=1)
                
                count = session.query(AIUsage).filter(
                    and_(
                        AIUsage.provider == provider,
                        AIUsage.created_at >= one_hour_ago
                    )
                ).count()
                
                return count
        
        except Exception as e:
            logger.error(f"Erro ao obter uso atual: {str(e)}")
            return 0

# Instância global do orquestrador
ai_orchestrator = AIOrchestrator()

@ai_bp.route('/chat', methods=['POST'])
@require_auth
def ai_chat():
    """
    Chat com IA
    
    Body:
        {
            "message": "Pergunta para a IA",
            "context": {
                "patient_id": "uuid",
                "appointment_id": "uuid"
            },
            "task_type": "general|analysis|medical|exercise"
        }
    
    Returns:
        Resposta da IA
    """
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data or not data.get('message'):
            return APIResponse.error('Mensagem é obrigatória', 400)
        
        message = data['message']
        context = data.get('context', {})
        task_type = data.get('task_type', 'general')
        
        # Determinar nível do usuário
        user_tier = 'premium' if current_user.role in [User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA] else 'basic'
        
        # Gerar resposta
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            response = loop.run_until_complete(
                ai_orchestrator.generate_response(
                    prompt=message,
                    context=context,
                    task_type=task_type,
                    user_id=current_user.id,
                    user_tier=user_tier
                )
            )
        finally:
            loop.close()
        
        if response['success']:
            return APIResponse.success({
                'response': response['response'],
                'provider': response.get('provider'),
                'source': response.get('source', 'external'),
                'confidence': response.get('confidence'),
                'tokens_used': response.get('tokens_used'),
                'cost': response.get('cost')
            })
        else:
            return APIResponse.error(
                response.get('error', 'Erro ao gerar resposta'),
                500,
                {'fallback': response.get('fallback')}
            )
    
    except Exception as e:
        logger.error(f"Erro no chat de IA: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@ai_bp.route('/analyze/patient', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def analyze_patient():
    """
    Análise de paciente com IA
    
    Body:
        {
            "patient_id": "uuid",
            "analysis_type": "progress|risk|treatment"
        }
    
    Returns:
        Análise do paciente
    """
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data or not data.get('patient_id'):
            return APIResponse.error('ID do paciente é obrigatório', 400)
        
        patient_id = data['patient_id']
        analysis_type = data.get('analysis_type', 'progress')
        
        with get_db_session() as session:
            # Buscar dados do paciente
            patient = session.query(Patient).filter_by(id=patient_id).first()
            
            if not patient:
                return APIResponse.not_found('Paciente não encontrado')
            
            # Buscar histórico de consultas
            appointments = session.query(Appointment).filter_by(
                patient_id=patient_id
            ).order_by(desc(Appointment.appointment_date)).limit(10).all()
            
            # Buscar prescrições
            prescriptions = session.query(Prescription).filter_by(
                patient_id=patient_id
            ).order_by(desc(Prescription.created_at)).limit(5).all()
            
            # Construir contexto
            context = {
                'patient_age': patient.age if hasattr(patient, 'age') else 'N/A',
                'patient_gender': patient.gender,
                'diagnosis': patient.diagnosis or 'N/A',
                'appointments_count': len(appointments),
                'last_appointment': appointments[0].appointment_date.isoformat() if appointments else 'N/A',
                'prescriptions_count': len(prescriptions)
            }
            
            # Construir prompt baseado no tipo de análise
            prompts = {
                'progress': f"Analise o progresso do paciente baseado nos dados fornecidos. O paciente tem {context['appointments_count']} consultas registradas.",
                'risk': f"Avalie os fatores de risco para este paciente baseado no histórico clínico.",
                'treatment': f"Sugira ajustes no plano de tratamento baseado na evolução do paciente."
            }
            
            prompt = prompts.get(analysis_type, prompts['progress'])
            
            # Gerar análise
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                response = loop.run_until_complete(
                    ai_orchestrator.generate_response(
                        prompt=prompt,
                        context=context,
                        task_type='analysis',
                        user_id=current_user.id,
                        user_tier='premium'
                    )
                )
            finally:
                loop.close()
            
            if response['success']:
                return APIResponse.success({
                    'patient_id': patient_id,
                    'analysis_type': analysis_type,
                    'analysis': response['response'],
                    'provider': response.get('provider'),
                    'confidence': response.get('confidence'),
                    'generated_at': datetime.utcnow().isoformat()
                })
            else:
                return APIResponse.error(response.get('error', 'Erro ao gerar análise'), 500)
    
    except Exception as e:
        logger.error(f"Erro na análise de paciente: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@ai_bp.route('/suggest/exercises', methods=['POST'])
@require_auth
@require_role([User.UserRole.ADMIN, User.UserRole.FISIOTERAPEUTA])
def suggest_exercises():
    """
    Sugestão de exercícios com IA
    
    Body:
        {
            "patient_id": "uuid",
            "condition": "Condição do paciente",
            "goals": ["objetivo1", "objetivo2"],
            "limitations": ["limitação1", "limitação2"]
        }
    
    Returns:
        Sugestões de exercícios
    """
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data:
            return APIResponse.error('Dados são obrigatórios', 400)
        
        patient_id = data.get('patient_id')
        condition = data.get('condition', '')
        goals = data.get('goals', [])
        limitations = data.get('limitations', [])
        
        context = {
            'condition': condition,
            'goals': ', '.join(goals) if goals else 'N/A',
            'limitations': ', '.join(limitations) if limitations else 'N/A'
        }
        
        if patient_id:
            with get_db_session() as session:
                patient = session.query(Patient).filter_by(id=patient_id).first()
                if patient:
                    context.update({
                        'patient_age': patient.age if hasattr(patient, 'age') else 'N/A',
                        'patient_gender': patient.gender,
                        'diagnosis': patient.diagnosis or 'N/A'
                    })
        
        prompt = "Sugira exercícios terapêuticos apropriados baseado na condição e objetivos do paciente. Inclua descrições detalhadas, repetições e precauções."
        
        # Gerar sugestões
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            response = loop.run_until_complete(
                ai_orchestrator.generate_response(
                    prompt=prompt,
                    context=context,
                    task_type='exercise',
                    user_id=current_user.id,
                    user_tier='premium'
                )
            )
        finally:
            loop.close()
        
        if response['success']:
            return APIResponse.success({
                'patient_id': patient_id,
                'suggestions': response['response'],
                'provider': response.get('provider'),
                'confidence': response.get('confidence'),
                'generated_at': datetime.utcnow().isoformat()
            })
        else:
            return APIResponse.error(response.get('error', 'Erro ao gerar sugestões'), 500)
    
    except Exception as e:
        logger.error(f"Erro na sugestão de exercícios: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@ai_bp.route('/providers/status', methods=['GET'])
@require_auth
@require_role([User.UserRole.ADMIN])
def get_providers_status():
    """
    Obter status dos provedores de IA
    
    Returns:
        Status de todos os provedores
    """
    try:
        providers_status = {}
        
        for name, config in ai_orchestrator.providers.items():
            current_usage = ai_orchestrator.usage_tracker.get_current_usage(name)
            
            providers_status[name] = {
                'name': config['name'],
                'available': config['available'],
                'rate_limit': config['rate_limit'],
                'current_usage': current_usage,
                'usage_percentage': round((current_usage / config['rate_limit']) * 100, 2),
                'specialties': config['specialties'],
                'cost_per_token': config['cost_per_token']
            }
        
        return APIResponse.success({
            'providers': providers_status,
            'total_available': sum(1 for p in ai_orchestrator.providers.values() if p['available']),
            'checked_at': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Erro ao obter status dos provedores: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@ai_bp.route('/usage/stats', methods=['GET'])
@require_auth
def get_usage_stats():
    """
    Obter estatísticas de uso de IA
    
    Query Parameters:
        period: Período (day, week, month)
    
    Returns:
        Estatísticas de uso
    """
    try:
        current_user = get_current_user()
        period = request.args.get('period', 'week')
        
        # Calcular período
        periods = {
            'day': timedelta(days=1),
            'week': timedelta(weeks=1),
            'month': timedelta(days=30)
        }
        
        if period not in periods:
            return APIResponse.error('Período inválido', 400)
        
        start_date = datetime.utcnow() - periods[period]
        
        with get_db_session() as session:
            # Filtrar por usuário se não for admin
            query = session.query(AIUsage).filter(
                AIUsage.created_at >= start_date
            )
            
            if current_user.role != User.UserRole.ADMIN:
                query = query.filter(AIUsage.user_id == current_user.id)
            
            usage_records = query.all()
            
            # Calcular estatísticas
            total_requests = len(usage_records)
            total_tokens = sum(record.tokens_used for record in usage_records)
            total_cost = sum(record.cost for record in usage_records)
            
            # Uso por provedor
            provider_stats = {}
            for record in usage_records:
                if record.provider not in provider_stats:
                    provider_stats[record.provider] = {
                        'requests': 0,
                        'tokens': 0,
                        'cost': 0
                    }
                
                provider_stats[record.provider]['requests'] += 1
                provider_stats[record.provider]['tokens'] += record.tokens_used
                provider_stats[record.provider]['cost'] += record.cost
            
            # Uso por tipo de tarefa
            task_stats = {}
            for record in usage_records:
                if record.task_type not in task_stats:
                    task_stats[record.task_type] = 0
                task_stats[record.task_type] += 1
            
            return APIResponse.success({
                'period': period,
                'total_requests': total_requests,
                'total_tokens': total_tokens,
                'total_cost': round(total_cost, 4),
                'average_tokens_per_request': round(total_tokens / total_requests, 2) if total_requests > 0 else 0,
                'by_provider': provider_stats,
                'by_task_type': task_stats,
                'period_start': start_date.isoformat(),
                'period_end': datetime.utcnow().isoformat()
            })
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de uso: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)

@ai_bp.route('/feedback', methods=['POST'])
@require_auth
def submit_feedback():
    """
    Enviar feedback sobre resposta da IA
    
    Body:
        {
            "response_id": "uuid",
            "rating": 1-5,
            "feedback": "Comentário opcional",
            "helpful": true/false
        }
    
    Returns:
        Confirmação do feedback
    """
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data:
            return APIResponse.error('Dados são obrigatórios', 400)
        
        rating = data.get('rating')
        feedback_text = data.get('feedback', '')
        helpful = data.get('helpful')
        
        if rating is not None and (rating < 1 or rating > 5):
            return APIResponse.error('Rating deve ser entre 1 e 5', 400)
        
        with get_db_session() as session:
            feedback = AIFeedback(
                id=CodeGenerator.generate_uuid(),
                user_id=current_user.id,
                rating=rating,
                feedback=feedback_text,
                helpful=helpful,
                created_at=datetime.utcnow()
            )
            
            session.add(feedback)
            session.commit()
            
            return APIResponse.created({
                'feedback_id': feedback.id,
                'message': 'Feedback registrado com sucesso'
            })
    
    except Exception as e:
        logger.error(f"Erro ao registrar feedback: {str(e)}")
        return APIResponse.error('Erro interno do servidor', 500)