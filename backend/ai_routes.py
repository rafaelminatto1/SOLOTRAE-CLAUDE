# -*- coding: utf-8 -*-
"""
AI Routes - Rotas para sistema de IA
"""

from flask import Blueprint, request, jsonify
from ai_service import fisio_ai
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/chat', methods=['POST'])
def ai_chat():
    """Endpoint para chat com IA"""
    try:
        data = request.get_json()
        
        message = data.get('message')
        consultation_type = data.get('consultation_type', 'GENERAL_CONSULTATION')
        patient_id = data.get('patient_id')
        context = data.get('context', {})
        
        if not message:
            return jsonify({
                "success": False,
                "message": "Mensagem é obrigatória"
            }), 400
        
        # Simular contexto do paciente (em produção, buscar do banco)
        patient_context = None
        if patient_id:
            patient_context = {
                "id": patient_id,
                "age": 35,
                "conditions": ["lombalgia crônica"],
                "last_session": "2024-09-10"
            }
        
        # Processar com IA (como é síncrono, vamos simular async)
        try:
            # Em produção, usar: response = await fisio_ai.chat_completion(...)
            response = fisio_ai._simulate_ai_response(message, consultation_type)
        except Exception as e:
            logger.error(f"Erro no processamento IA: {e}")
            response = fisio_ai._simulate_ai_response(message, consultation_type, str(e))
        
        return jsonify({
            "success": True,
            "data": response
        }), 200
        
    except Exception as e:
        logger.error(f"Erro no endpoint de chat: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/analyze-patient', methods=['POST'])
def analyze_patient():
    """Analisar paciente com IA"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({
                "success": False,
                "message": "ID do paciente é obrigatório"
            }), 400
        
        # Simular dados do paciente (em produção, buscar do banco)
        patient_data = {
            "id": patient_id,
            "name": "João Silva",
            "age": 45,
            "conditions": ["lombalgia", "diabetes"],
            "last_appointment": "2024-09-10",
            "medications": ["ibuprofeno"]
        }
        
        analysis = fisio_ai.analyze_patient(patient_data)
        
        return jsonify({
            "success": True,
            "data": analysis
        }), 200
        
    except Exception as e:
        logger.error(f"Erro na análise do paciente: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/suggest-exercises', methods=['POST'])
def suggest_exercises():
    """Sugerir exercícios com IA"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        condition = data.get('condition', 'lombalgia')
        
        if not patient_id:
            return jsonify({
                "success": False,
                "message": "ID do paciente é obrigatório"
            }), 400
        
        suggestions = fisio_ai.suggest_exercises(patient_id, condition)
        
        return jsonify({
            "success": True,
            "data": suggestions
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao sugerir exercícios: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/generate-report', methods=['POST'])
def generate_report():
    """Gerar relatório com IA"""
    try:
        data = request.get_json()
        report_type = data.get('report_type', 'patient_summary')
        patient_id = data.get('patient_id')
        
        # Simular geração de relatório
        report = {
            "report_id": f"RPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": report_type,
            "patient_id": patient_id,
            "generated_at": datetime.utcnow().isoformat(),
            "content": {
                "summary": "Paciente apresenta evolução satisfatória no tratamento de lombalgia crônica.",
                "recommendations": [
                    "Continuar exercícios de fortalecimento do core",
                    "Manter frequência de 3x por semana",
                    "Reavaliação em 30 dias"
                ],
                "next_steps": "Progressão para exercícios de maior complexidade",
                "prognosis": "Favorável com adesão ao tratamento"
            }
        }
        
        return jsonify({
            "success": True,
            "data": report
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao gerar relatório: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/providers-status', methods=['GET'])
def providers_status():
    """Status dos provedores de IA"""
    try:
        status = fisio_ai.get_provider_status()
        
        return jsonify({
            "success": True,
            "data": status
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter status dos provedores: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/providers/status', methods=['GET'])
def providers_status_alt():
    """Status dos provedores de IA (rota alternativa)"""
    return providers_status()

@ai_bp.route('/consultations', methods=['GET'])
def list_consultations():
    """Listar consultas de IA"""
    try:
        # Simular lista de consultas
        consultations = [
            {
                "id": "cons_001",
                "consultation_type": "GENERAL_CONSULTATION",
                "patient_id": "pat_001",
                "patient_name": "João Silva",
                "created_at": "2024-09-15T10:30:00Z",
                "status": "completed",
                "tokens_used": 150,
                "provider": "simulation"
            },
            {
                "id": "cons_002",
                "consultation_type": "EXERCISE_RECOMMENDATION",
                "patient_id": "pat_002",
                "patient_name": "Maria Santos",
                "created_at": "2024-09-15T14:15:00Z",
                "status": "completed",
                "tokens_used": 230,
                "provider": "simulation"
            }
        ]
        
        return jsonify({
            "success": True,
            "data": {"consultations": consultations}
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar consultas: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/usage-stats', methods=['GET'])
def usage_stats():
    """Estatísticas de uso da IA"""
    try:
        stats = fisio_ai.get_usage_stats()
        
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

@ai_bp.route('/knowledge', methods=['GET'])
def knowledge_base():
    """Base de conhecimento da IA"""
    try:
        knowledge = {
            "total_articles": 1250,
            "categories": [
                {"name": "Lombalgia", "articles": 180},
                {"name": "Cervicalgia", "articles": 145},
                {"name": "Exercícios Terapêuticos", "articles": 220},
                {"name": "Reabilitação Ortopédica", "articles": 190},
                {"name": "Neurologia", "articles": 165}
            ],
            "last_updated": datetime.utcnow().isoformat(),
            "version": "2.1.0"
        }
        
        return jsonify({
            "success": True,
            "data": knowledge
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao acessar base de conhecimento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/knowledge/search', methods=['POST'])
def search_knowledge():
    """Buscar na base de conhecimento"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        # Simular busca
        results = [
            {
                "title": f"Artigo sobre {query}",
                "summary": f"Informações relevantes sobre {query} em fisioterapia",
                "relevance": 0.95,
                "source": "Journal of Physiotherapy",
                "year": 2023
            },
            {
                "title": f"Protocolo de {query}",
                "summary": f"Protocolo clínico para tratamento de {query}",
                "relevance": 0.87,
                "source": "Clinical Guidelines",
                "year": 2024
            }
        ]
        
        return jsonify({
            "success": True,
            "data": {
                "query": query,
                "results": results,
                "total": len(results)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Erro na busca de conhecimento: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

@ai_bp.route('/feedback', methods=['POST'])
def ai_feedback():
    """Feedback sobre respostas da IA"""
    try:
        data = request.get_json()
        consultation_id = data.get('consultation_id')
        rating = data.get('rating')  # 1-5
        comment = data.get('comment', '')
        
        # Simular salvamento do feedback
        feedback_record = {
            "id": f"fb_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "consultation_id": consultation_id,
            "rating": rating,
            "comment": comment,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return jsonify({
            "success": True,
            "message": "Feedback registrado com sucesso",
            "data": feedback_record
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao registrar feedback: {e}")
        return jsonify({
            "success": False,
            "message": f"Erro interno: {str(e)}"
        }), 500

# Inicializar serviço de IA quando o blueprint for registrado
def initialize_ai():
    """Inicializar IA"""
    fisio_ai.initialize_client()
    logger.info("Serviço de IA inicializado")

# Inicializar IA imediatamente
initialize_ai()
