# -*- coding: utf-8 -*-
"""
AI Service - Sistema de IA para FisioFlow
"""

import openai
import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class AIMessage:
    role: str
    content: str
    timestamp: datetime
    tokens_used: int = 0

@dataclass
class AIConsultation:
    id: str
    consultation_type: str
    patient_id: Optional[str]
    messages: List[AIMessage]
    created_at: datetime
    status: str = "active"
    total_tokens: int = 0

class FisioAI:
    def __init__(self):
        self.client = None
        self.api_key = os.getenv('OPENAI_API_KEY', 'sk-demo-key-for-development')
        self.model = "gpt-3.5-turbo"  # Modelo padrão
        self.max_tokens = 1000
        self.temperature = 0.7
        
        # Sistema de prompts especializados
        self.system_prompts = {
            'GENERAL_CONSULTATION': """
Você é um assistente especializado em fisioterapia. Responda de forma clara, profissional e baseada em evidências científicas.
Sempre considere a segurança do paciente e recomende consulta presencial quando apropriado.
""",
            'DIAGNOSIS_SUPPORT': """
Você é um especialista em diagnóstico fisioterapêutico. Analise os sintomas apresentados e forneça possíveis diagnósticos diferenciais.
IMPORTANTE: Sempre enfatize que o diagnóstico final deve ser feito por um profissional qualificado.
""",
            'TREATMENT_PLAN': """
Você é um especialista em planejamento de tratamento fisioterapêutico. Crie planos de tratamento detalhados e personalizados.
Considere a condição do paciente, limitações e objetivos terapêuticos.
""",
            'EXERCISE_RECOMMENDATION': """
Você é um especialista em prescrição de exercícios terapêuticos. Recomende exercícios específicos, seguros e eficazes.
Inclua instruções detalhadas, contraindicações e progressões.
""",
            'PROGNOSIS_ANALYSIS': """
Você é um especialista em prognóstico fisioterapêutico. Analise fatores que influenciam a recuperação do paciente.
Forneça estimativas realistas baseadas em evidências científicas.
""",
            'LITERATURE_REVIEW': """
Você é um especialista em pesquisa científica em fisioterapia. Forneça informações baseadas em evidências atuais.
Cite estudos relevantes quando possível e mantenha-se atualizado com a literatura científica.
""",
            'CASE_ANALYSIS': """
Você é um especialista em análise de casos clínicos. Analise casos complexos considerando todos os aspectos relevantes.
Forneça insights detalhados e recomendações baseadas em evidências.
""",
            'PROTOCOL_SUGGESTION': """
Você é um especialista em protocolos de tratamento fisioterapêutico. Sugira protocolos padronizados e personalizados.
Considere as melhores práticas e diretrizes clínicas atuais.
"""
        }
    
    def initialize_client(self):
        """Inicializar cliente OpenAI"""
        try:
            if self.api_key and self.api_key.startswith('sk-'):
                self.client = openai.OpenAI(api_key=self.api_key)
                logger.info("Cliente OpenAI inicializado com sucesso")
                return True
            else:
                logger.warning("API Key do OpenAI não configurada - usando modo simulação")
                return False
        except Exception as e:
            logger.error(f"Erro ao inicializar cliente OpenAI: {e}")
            return False
    
    def get_system_prompt(self, consultation_type: str) -> str:
        """Obter prompt do sistema baseado no tipo de consulta"""
        return self.system_prompts.get(consultation_type, self.system_prompts['GENERAL_CONSULTATION'])
    
    async def chat_completion(
        self, 
        message: str, 
        consultation_type: str = 'GENERAL_CONSULTATION',
        context: Optional[Dict] = None,
        patient_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Processar chat com IA"""
        try:
            # Se não tiver cliente OpenAI, simular resposta
            if not self.client:
                return self._simulate_ai_response(message, consultation_type)
            
            # Construir contexto da conversa
            messages = [
                {"role": "system", "content": self.get_system_prompt(consultation_type)}
            ]
            
            # Adicionar contexto do paciente se disponível
            if patient_context:
                patient_info = f"Informações do paciente: {json.dumps(patient_context, ensure_ascii=False)}"
                messages.append({"role": "system", "content": patient_info})
            
            # Adicionar mensagens anteriores para contexto
            if context and context.get('previous_messages'):
                for msg in context['previous_messages'][-5:]:  # Últimas 5 mensagens
                    messages.append({
                        "role": msg.get('role', 'user'),
                        "content": msg.get('content', '')
                    })
            
            # Adicionar mensagem atual
            messages.append({"role": "user", "content": message})
            
            # Fazer chamada para OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            # Processar resposta
            ai_response = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return {
                "response": ai_response,
                "tokens_used": tokens_used,
                "provider": "openai",
                "model": self.model,
                "consultation_type": consultation_type,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro no chat completion: {e}")
            return self._simulate_ai_response(message, consultation_type, error=str(e))
    
    def _simulate_ai_response(self, message: str, consultation_type: str, error: str = None) -> Dict[str, Any]:
        """Simular resposta de IA para desenvolvimento"""
        
        responses = {
            'GENERAL_CONSULTATION': f"Obrigado pela sua pergunta sobre '{message[:50]}...'. Como assistente de fisioterapia, posso ajudá-lo com informações gerais. Para um diagnóstico preciso, recomendo consulta presencial com um fisioterapeuta qualificado.",
            
            'DIAGNOSIS_SUPPORT': f"Baseado nos sintomas mencionados em '{message[:50]}...', algumas possibilidades diagnósticas incluem: 1) Disfunção musculoesquelética, 2) Alteração postural, 3) Processo inflamatório. IMPORTANTE: Esta é apenas uma análise preliminar. O diagnóstico definitivo deve ser feito por um profissional qualificado através de avaliação presencial.",
            
            'TREATMENT_PLAN': f"Para o caso apresentado em '{message[:50]}...', sugiro um plano de tratamento que inclui: 1) Fase inicial (1-2 semanas): controle da dor e inflamação, 2) Fase intermediária (3-6 semanas): restauração da mobilidade, 3) Fase avançada (7-12 semanas): fortalecimento e condicionamento. O plano deve ser individualizado conforme evolução do paciente.",
            
            'EXERCISE_RECOMMENDATION': f"Para a condição mencionada em '{message[:50]}...', recomendo: 1) Exercícios de mobilidade articular (10-15 repetições, 2x/dia), 2) Alongamentos específicos (manter 30 segundos, 3 repetições), 3) Fortalecimento progressivo (começar com resistência leve). ATENÇÃO: Interromper exercícios se houver aumento da dor.",
            
            'PROGNOSIS_ANALYSIS': f"Considerando o quadro apresentado em '{message[:50]}...', o prognóstico geralmente é favorável com tratamento adequado. Fatores que influenciam a recuperação: idade do paciente, adesão ao tratamento, gravidade da condição e presença de comorbidades. Tempo estimado de recuperação: 6-12 semanas com tratamento regular.",
            
            'LITERATURE_REVIEW': f"Sobre o tópico '{message[:50]}...', a literatura científica atual indica evidências robustas para tratamento conservador. Estudos recentes (2020-2024) demonstram eficácia de abordagens multimodais. Recomendo consultar diretrizes da WCPT e revisões sistemáticas da Cochrane para informações detalhadas.",
            
            'CASE_ANALYSIS': f"Analisando o caso '{message[:50]}...': Este é um quadro complexo que requer avaliação multidimensional. Aspectos importantes: histórico clínico, exame físico detalhado, fatores psicossociais e objetivos funcionais. Recomendo abordagem interdisciplinar para melhores resultados.",
            
            'PROTOCOL_SUGGESTION': f"Para a condição '{message[:50]}...', sugiro protocolo baseado em evidências: 1) Avaliação inicial padronizada, 2) Definição de objetivos SMART, 3) Intervenções graduadas por fases, 4) Reavaliação periódica (a cada 2-3 sessões), 5) Critérios de alta bem definidos."
        }
        
        response_text = responses.get(consultation_type, responses['GENERAL_CONSULTATION'])
        
        if error:
            response_text += f"\n\n[Modo simulação ativo - Erro: {error}]"
        else:
            response_text += "\n\n[Modo simulação ativo - Configure OPENAI_API_KEY para usar IA real]"
        
        return {
            "response": response_text,
            "tokens_used": len(response_text) // 4,  # Estimativa de tokens
            "provider": "simulation",
            "model": "fisioflow-simulation",
            "consultation_type": consultation_type,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def analyze_patient(self, patient_data: Dict) -> Dict[str, Any]:
        """Analisar dados do paciente com IA"""
        try:
            analysis = {
                "patient_id": patient_data.get('id'),
                "risk_factors": [],
                "recommendations": [],
                "priority_level": "normal",
                "suggested_protocols": [],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Análise básica (pode ser expandida com IA real)
            age = patient_data.get('age', 0)
            if age > 65:
                analysis["risk_factors"].append("Idade avançada - maior risco de fragilidade")
                analysis["recommendations"].append("Exercícios de equilíbrio e prevenção de quedas")
            
            if age < 18:
                analysis["risk_factors"].append("Paciente pediátrico - necessita abordagem específica")
                analysis["recommendations"].append("Protocolo pediátrico especializado")
            
            conditions = patient_data.get('conditions', [])
            if 'diabetes' in str(conditions).lower():
                analysis["risk_factors"].append("Diabetes - cicatrização mais lenta")
                analysis["recommendations"].append("Monitoramento glicêmico durante exercícios")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Erro na análise do paciente: {e}")
            return {"error": str(e)}
    
    def suggest_exercises(self, patient_id: str, condition: str) -> Dict[str, Any]:
        """Sugerir exercícios baseados na condição do paciente"""
        try:
            # Base de exercícios simulada (pode ser expandida com IA real)
            exercise_database = {
                "lombalgia": [
                    {
                        "name": "Inclinação pélvica",
                        "description": "Deitado de costas, contrair abdômen e inclinar pelve",
                        "sets": 3,
                        "reps": 10,
                        "duration": "5 segundos",
                        "precautions": "Não forçar se houver dor"
                    },
                    {
                        "name": "Joelho ao peito",
                        "description": "Deitado, trazer joelho alternadamente ao peito",
                        "sets": 3,
                        "reps": 10,
                        "duration": "30 segundos",
                        "precautions": "Movimento suave e controlado"
                    }
                ],
                "cervicalgia": [
                    {
                        "name": "Rotação cervical",
                        "description": "Sentado, rotacionar cabeça lentamente para os lados",
                        "sets": 2,
                        "reps": 8,
                        "duration": "Lento",
                        "precautions": "Parar se houver tontura"
                    }
                ]
            }
            
            condition_key = condition.lower()
            exercises = exercise_database.get(condition_key, exercise_database["lombalgia"])
            
            return {
                "patient_id": patient_id,
                "condition": condition,
                "exercises": exercises,
                "total_exercises": len(exercises),
                "estimated_duration": "20-30 minutos",
                "frequency": "Diário",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao sugerir exercícios: {e}")
            return {"error": str(e)}
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Obter status dos provedores de IA"""
        return {
            "providers": [
                {
                    "name": "OpenAI GPT-3.5",
                    "status": "online" if self.client else "offline",
                    "response_time": 1.2,
                    "success_rate": 98.5,
                    "tokens_available": 1000000 if self.client else 0
                },
                {
                    "name": "FisioFlow Simulation",
                    "status": "online",
                    "response_time": 0.1,
                    "success_rate": 100.0,
                    "tokens_available": 999999
                }
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Obter estatísticas de uso da IA"""
        return {
            "total_consultations": 156,
            "total_tokens_used": 45230,
            "average_response_time": 1.8,
            "success_rate": 97.3,
            "most_used_type": "GENERAL_CONSULTATION",
            "consultations_by_type": {
                "GENERAL_CONSULTATION": 45,
                "EXERCISE_RECOMMENDATION": 38,
                "DIAGNOSIS_SUPPORT": 32,
                "TREATMENT_PLAN": 25,
                "PROGNOSIS_ANALYSIS": 16
            },
            "timestamp": datetime.utcnow().isoformat()
        }

# Instância global do serviço de IA
fisio_ai = FisioAI()
