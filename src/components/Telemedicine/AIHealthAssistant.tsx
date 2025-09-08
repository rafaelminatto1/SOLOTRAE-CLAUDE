import React, { useState } from 'react';
import { Brain, MessageSquare, Mic, MicOff, Volume2, VolumeX, Zap, FileText, Camera, Stethoscope, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface AIConversation {
  id: string;
  patientId: string;
  sessionStart: Date;
  messages: AIMessage[];
  currentSymptoms: string[];
  suggestedTests: Test[];
  riskAssessment: RiskAssessment;
  triage: TriageLevel;
  recommendations: Recommendation[];
  followUpScheduled: boolean;
  confidence: number;
  language: string;
  voiceEnabled: boolean;
}

interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image' | 'vital_data';
  confidence?: number;
  medicalContext?: MedicalContext;
  translation?: Translation;
}

interface MedicalContext {
  symptoms: string[];
  anatomy: string[];
  conditions: string[];
  medications: string[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

interface Translation {
  originalLanguage: string;
  translatedText: string;
  medicalTermsExplained: TermExplanation[];
}

interface TermExplanation {
  term: string;
  definition: string;
  synonyms: string[];
}

interface Test {
  name: string;
  type: 'blood' | 'urine' | 'imaging' | 'physical' | 'psychological';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
  estimatedCost: number;
  estimatedTime: string;
  canBePerformedRemotely: boolean;
}

interface RiskAssessment {
  overall: 'low' | 'moderate' | 'high' | 'critical';
  factors: RiskFactor[];
  redFlags: string[];
  urgencyScore: number;
  recommendedAction: 'self_care' | 'schedule_appointment' | 'urgent_care' | 'emergency';
}

interface RiskFactor {
  factor: string;
  impact: 'low' | 'moderate' | 'high';
  present: boolean;
  description: string;
}

interface TriageLevel {
  level: 1 | 2 | 3 | 4 | 5;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  description: string;
  responseTime: string;
  actions: string[];
}

interface Recommendation {
  id: string;
  type: 'lifestyle' | 'medication' | 'appointment' | 'monitoring' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  timeframe: string;
  evidence: string[];
  resources: Resource[];
}

interface Resource {
  type: 'article' | 'video' | 'app' | 'contact' | 'location';
  title: string;
  url?: string;
  description: string;
}

interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

const mockConversation: AIConversation = {
  id: 'ai_session_001',
  patientId: 'p123',
  sessionStart: new Date(),
  messages: [
    {
      id: 'm1',
      sender: 'ai',
      content: 'Olá! Sou sua assistente de saúde com IA. Como posso ajudá-lo hoje? Por favor, descreva seus sintomas ou preocupações de saúde.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'text',
      confidence: 1.0
    },
    {
      id: 'm2',
      sender: 'user',
      content: 'Olá, tenho sentido dores no peito e falta de ar há 2 dias. Estou preocupado.',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      type: 'text',
      medicalContext: {
        symptoms: ['chest_pain', 'shortness_of_breath'],
        anatomy: ['chest', 'lungs', 'heart'],
        conditions: ['angina', 'myocardial_infarction', 'anxiety'],
        medications: [],
        severity: 'high'
      }
    },
    {
      id: 'm3',
      sender: 'ai',
      content: 'Entendo sua preocupação. Dor no peito e falta de ar podem ser sintomas importantes. Vou fazer algumas perguntas para melhor avaliar sua situação:\n\n1. A dor é constante ou vem e vai?\n2. Piora com esforço físico?\n3. Você tem histórico cardíaco familiar?\n4. Está tomando alguma medicação?\n\nBaseado nos sintomas relatados, recomendo buscar atendimento médico urgente.',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'text',
      confidence: 0.92,
      medicalContext: {
        symptoms: ['chest_pain', 'shortness_of_breath'],
        anatomy: ['heart', 'coronary_arteries'],
        conditions: ['acute_coronary_syndrome', 'unstable_angina'],
        medications: [],
        severity: 'high'
      }
    }
  ],
  currentSymptoms: ['chest_pain', 'shortness_of_breath'],
  suggestedTests: [
    {
      name: 'Eletrocardiograma (ECG)',
      type: 'physical',
      priority: 'urgent',
      reasoning: 'Avaliar atividade elétrica cardíaca e descartar infarto',
      estimatedCost: 80,
      estimatedTime: '15 minutos',
      canBePerformedRemotely: false
    },
    {
      name: 'Troponina cardíaca',
      type: 'blood',
      priority: 'urgent',
      reasoning: 'Marcador de lesão do músculo cardíaco',
      estimatedCost: 150,
      estimatedTime: '2 horas',
      canBePerformedRemotely: false
    },
    {
      name: 'Radiografia de tórax',
      type: 'imaging',
      priority: 'high',
      reasoning: 'Avaliar pulmões e coração',
      estimatedCost: 120,
      estimatedTime: '30 minutos',
      canBePerformedRemotely: false
    }
  ],
  riskAssessment: {
    overall: 'high',
    urgencyScore: 8.5,
    recommendedAction: 'emergency',
    factors: [
      {
        factor: 'Dor no peito',
        impact: 'high',
        present: true,
        description: 'Sintoma cardinal de síndrome coronariana aguda'
      },
      {
        factor: 'Falta de ar',
        impact: 'high',
        present: true,
        description: 'Pode indicar comprometimento cardíaco ou pulmonar'
      },
      {
        factor: 'Duração dos sintomas',
        impact: 'moderate',
        present: true,
        description: 'Sintomas persistentes por 2 dias'
      }
    ],
    redFlags: [
      'Dor no peito associada à dispneia',
      'Sintomas persistentes por mais de 48h',
      'Possível síndrome coronariana aguda'
    ]
  },
  triage: {
    level: 2,
    color: 'orange',
    description: 'Urgente - Avaliação médica imediata necessária',
    responseTime: '15 minutos',
    actions: [
      'Buscar atendimento de emergência imediatamente',
      'Não dirigir - chamar ambulância ou acompanhante',
      'Evitar esforço físico',
      'Manter-se calmo e em repouso'
    ]
  },
  recommendations: [
    {
      id: 'r1',
      type: 'emergency',
      priority: 'urgent',
      title: 'Busque atendimento médico imediatamente',
      description: 'Seus sintomas podem indicar uma emergência cardíaca. É fundamental que procure atendimento médico urgente.',
      timeframe: 'Agora',
      evidence: ['Diretriz da Sociedade Brasileira de Cardiologia', 'Protocolo de Síndrome Coronariana Aguda'],
      resources: [
        {
          type: 'contact',
          title: 'SAMU - Emergência Médica',
          description: 'Ligue 192 para atendimento de emergência',
          url: 'tel:192'
        },
        {
          type: 'location',
          title: 'Hospital mais próximo',
          description: 'Encontre o hospital de emergência mais próximo',
          url: '/find-hospital'
        }
      ]
    },
    {
      id: 'r2',
      type: 'monitoring',
      priority: 'high',
      title: 'Monitore seus sintomas',
      description: 'Anote qualquer mudança nos sintomas e compartilhe com a equipe médica.',
      timeframe: 'Contínuo',
      evidence: ['Protocolo de monitoramento de sintomas cardíacos'],
      resources: [
        {
          type: 'app',
          title: 'Monitor de Sintomas',
          description: 'App para registrar sintomas em tempo real',
          url: '/symptom-tracker'
        }
      ]
    }
  ],
  followUpScheduled: false,
  confidence: 0.89,
  language: 'pt-BR',
  voiceEnabled: true
};

export default function AIHealthAssistant() {
  const [conversation] = useState<AIConversation>(mockConversation);
  const [isListening, setIsListening] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    language: 'pt-BR',
    voice: 'female',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  });
  const [newMessage, setNewMessage] = useState('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTriageColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assistente de Saúde IA
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Análise inteligente de sintomas e triagem médica
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getRiskColor(conversation.riskAssessment.overall)}`}>
            {getPriorityIcon(conversation.riskAssessment.overall)}
            <span className="font-medium capitalize">{conversation.riskAssessment.overall}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 dark:border-dark-600 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversa com IA
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVoiceSettings(true)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    Confiança: {Math.round(conversation.confidence * 100)}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {conversation.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString('pt-BR')}</span>
                        {message.confidence && (
                          <span>{Math.round(message.confidence * 100)}% confiança</span>
                        )}
                      </div>
                      
                      {message.medicalContext && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="flex flex-wrap gap-1">
                            {message.medicalContext.symptoms.map(symptom => (
                              <span key={symptom} className="px-2 py-1 bg-white/20 rounded text-xs">
                                {symptom.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Descreva seus sintomas..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setIsListening(!isListening)}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Triage Status */}
          <Card className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${getTriageColor(conversation.triage.level)}`} />
                Triagem - Nível {conversation.triage.level}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {conversation.triage.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  Tempo de resposta: {conversation.triage.responseTime}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Ações Recomendadas:
                </h4>
                <ul className="space-y-1">
                  {conversation.triage.actions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-dark-400 flex items-start gap-2">
                      <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Avaliação de Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-dark-400">Score de Urgência</span>
                <span className="font-bold text-lg">{conversation.riskAssessment.urgencyScore}/10</span>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Fatores de Risco:
                </h4>
                <div className="space-y-2">
                  {conversation.riskAssessment.factors.filter(f => f.present).map(factor => (
                    <div key={factor.factor} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        factor.impact === 'high' ? 'bg-red-500' :
                        factor.impact === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {factor.factor}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">
                          {factor.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {conversation.riskAssessment.redFlags.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    Sinais de Alerta:
                  </h4>
                  <ul className="space-y-1">
                    {conversation.riskAssessment.redFlags.map((flag, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-400">
                        • {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggested Tests */}
          <Card className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Exames Sugeridos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversation.suggestedTests.map(test => (
                <div key={test.name} className="border border-gray-200 dark:border-dark-600 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {test.name}
                    </h4>
                    {getPriorityIcon(test.priority)}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-dark-400 mb-2">
                    {test.reasoning}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-400">
                    <span>R$ {test.estimatedCost}</span>
                    <span>{test.estimatedTime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recomendações Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {conversation.recommendations.map(rec => (
              <div key={rec.id} className="border border-gray-200 dark:border-dark-600 rounded p-4">
                <div className="flex items-start gap-3 mb-3">
                  {getPriorityIcon(rec.priority)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-dark-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-dark-400">
                    Prazo: {rec.timeframe}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRiskColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                
                {rec.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Recursos:
                    </h4>
                    <div className="space-y-1">
                      {rec.resources.map((resource, index) => (
                        <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                          {resource.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configurações de Voz
              </h3>
              <Button variant="outline" onClick={() => setShowVoiceSettings(false)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                  Habilitar Voz
                </label>
                <input
                  type="checkbox"
                  checked={voiceSettings.enabled}
                  onChange={(e) => setVoiceSettings({...voiceSettings, enabled: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Idioma
                </label>
                <select 
                  value={voiceSettings.language}
                  onChange={(e) => setVoiceSettings({...voiceSettings, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Velocidade: {voiceSettings.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings({...voiceSettings, speed: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={() => setShowVoiceSettings(false)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}