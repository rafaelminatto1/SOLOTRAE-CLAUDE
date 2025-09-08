import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Brain,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  Bot,
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  LoaderCircle,
} from 'lucide-react';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    confidence?: number;
    category?: 'diagnosis' | 'exercise' | 'treatment' | 'general';
    priority?: 'low' | 'medium' | 'high';
  };
}

interface AIAssistantPanelProps {
  patientId?: string;
  context?: 'dashboard' | 'patient' | 'exercise' | 'appointment';
  className?: string;
}

export default function AIAssistantPanel({ 
  patientId, 
  context = 'dashboard',
  className = '' 
}: AIAssistantPanelProps) {
  const { user, hasRole } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas baseada no contexto
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
      suggestions: getContextSuggestions(),
      metadata: {
        category: 'general',
        priority: 'low'
      }
    };
    setMessages([welcomeMessage]);
  }, [context, patientId]);

  const getWelcomeMessage = (): string => {
    const greeting = `Olá, ${user?.full_name?.split(' ')[0] || 'Dr(a)'}! `;
    
    switch (context) {
      case 'patient':
        return `${greeting}Estou aqui para ajudar com análises e sugestões para este paciente. Como posso auxiliar?`;
      case 'exercise':
        return `${greeting}Posso sugerir exercícios personalizados e adaptações baseadas em evidências científicas. O que precisa?`;
      case 'appointment':
        return `${greeting}Estou pronto para auxiliar durante a consulta com análises em tempo real. Como posso ajudar?`;
      default:
        return `${greeting}Seu assistente de IA está ativo! Posso ajudar com diagnósticos, sugestões de exercícios, análise de progresso e muito mais.`;
    }
  };

  const getContextSuggestions = (): string[] => {
    switch (context) {
      case 'patient':
        return [
          'Analisar histórico do paciente',
          'Sugerir exercícios personalizados',
          'Avaliar progresso do tratamento',
          'Identificar fatores de risco'
        ];
      case 'exercise':
        return [
          'Exercícios para lombalgias',
          'Reabilitação pós-cirúrgica',
          'Fortalecimento do core',
          'Exercícios para idosos'
        ];
      case 'appointment':
        return [
          'Preparar anamnese guiada',
          'Sugestões de testes funcionais',
          'Protocolos de avaliação',
          'Plano de tratamento inicial'
        ];
      default:
        return [
          'Análise do dashboard',
          'Tendências dos pacientes',
          'Otimização da agenda',
          'Relatórios personalizados'
        ];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simular resposta da IA (integrar com API real)
      const response = await simulateAIResponse(userMessage.content);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        metadata: response.metadata
      };

      setMessages(prev => [...prev, aiMessage]);

      // Text-to-speech se habilitado
      if (isSpeechEnabled) {
        speakText(response.content);
      }

    } catch (error) {
      console.error('Erro ao comunicar com IA:', error);
      
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date(),
        metadata: {
          category: 'general',
          priority: 'high'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (userInput: string) => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Análise de contexto e resposta inteligente
    const lowercaseInput = userInput.toLowerCase();
    
    if (lowercaseInput.includes('exercício') || lowercaseInput.includes('exercício')) {
      return {
        content: `Com base na sua consulta, identifiquei algumas abordagens eficazes:\n\n🎯 **Exercícios Recomendados:**\n• Fortalecimento isométrico do quadríceps\n• Mobilização articular ativa\n• Exercícios proprioceptivos\n\n📊 **Parâmetros Sugeridos:**\n• 3 séries de 12-15 repetições\n• Progressão gradual de carga\n• Monitoramento de dor (escala 0-3)\n\n🔍 **Evidência Científica:** Protocolos baseados em studies recentes mostram 85% de melhora em 6 semanas.`,
        suggestions: ['Ver protocolos detalhados', 'Adaptar para este paciente', 'Exportar prescrição'],
        metadata: {
          confidence: 0.92,
          category: 'exercise' as const,
          priority: 'medium' as const
        }
      };
    }

    if (lowercaseInput.includes('diagnóstico') || lowercaseInput.includes('dor')) {
      return {
        content: `🔍 **Análise Diagnóstica:**\n\nBaseado nos sintomas mencionados, consideremos as possibilidades:\n\n**Hipóteses Principais:**\n• Disfunção biomecânica (75% probabilidade)\n• Processo inflamatório leve (60% probabilidade)\n• Sobrecarga muscular (45% probabilidade)\n\n**Testes Recomendados:**\n• Teste de Thomas modificado\n• Avaliação da cadeia cinética\n• Análise da marcha\n\n⚠️ **Importante:** Esta análise é sugestiva e deve ser confirmada por avaliação clínica completa.`,
        suggestions: ['Solicitar exames complementares', 'Ver protocolos de avaliação', 'Histórico similar'],
        metadata: {
          confidence: 0.78,
          category: 'diagnosis' as const,
          priority: 'high' as const
        }
      };
    }

    if (lowercaseInput.includes('progresso') || lowercaseInput.includes('evolução')) {
      return {
        content: `📈 **Análise de Progresso:**\n\n**Indicadores Positivos:**\n✅ Redução de 60% na escala de dor\n✅ Melhora na amplitude de movimento (+15°)\n✅ Aumento da força muscular (grade 4/5)\n\n**Pontos de Atenção:**\n⚠️ Aderência ao tratamento: 75%\n⚠️ Exercícios domiciliares irregulares\n\n**Recomendações:**\n• Manter protocolo atual\n• Reforçar orientações domiciliares\n• Avaliação em 2 semanas`,
        suggestions: ['Gerar relatório completo', 'Ajustar protocolo', 'Agendar reavaliação'],
        metadata: {
          confidence: 0.89,
          category: 'treatment' as const,
          priority: 'medium' as const
        }
      };
    }

    // Resposta padrão
    return {
      content: `Entendi sua consulta sobre "${userInput}". Como seu assistente de IA, posso ajudar com análises detalhadas, sugestões baseadas em evidências e otimização de tratamentos.\n\n💡 **Como posso ser mais específico?**\n• Compartilhe mais detalhes sobre o caso\n• Mencione sintomas específicos\n• Descreva o contexto clínico\n\nEstou preparado para análises avançadas e sugestões personalizadas!`,
      suggestions: ['Análise de caso', 'Sugestões de exercícios', 'Protocolos de tratamento'],
      metadata: {
        confidence: 0.65,
        category: 'general' as const,
        priority: 'low' as const
      }
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[🎯📊🔍⚠️✅💡]/g, ''));
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + ' ' + transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }
  };

  const getMessageIcon = (message: AIMessage) => {
    if (message.type === 'user') return User;
    
    switch (message.metadata?.category) {
      case 'diagnosis': return AlertCircle;
      case 'exercise': return Target;
      case 'treatment': return TrendingUp;
      default: return Bot;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800/50';
    }
  };

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Brain className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <AnimatedContainer animation="scale-in" className={`${className}`}>
      <Card variant="elevated" className="h-[600px] flex flex-col max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                IA Assistente
                <Sparkles className="h-4 w-4 ml-2 text-yellow-500 animate-pulse" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Powered by Claude & GPT-4
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={isSpeechEnabled ? 'text-blue-600' : 'text-gray-400'}
            >
              {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const MessageIcon = getMessageIcon(message);
            return (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white ml-4'
                      : `border ${getPriorityColor(message.metadata?.priority)} mr-4`
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <MessageIcon className={`h-4 w-4 mt-1 flex-shrink-0 ${
                      message.type === 'user' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`text-sm ${
                        message.type === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {message.content.split('\n').map((line, index) => (
                          <div key={index} className={line.startsWith('**') ? 'font-semibold' : ''}>
                            {line}
                          </div>
                        ))}
                      </div>
                      
                      {message.metadata?.confidence && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Confiança: {Math.round(message.metadata.confidence * 100)}%
                        </div>
                      )}
                      
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mr-4">
                <div className="flex items-center space-x-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    IA analisando...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua pergunta sobre diagnóstico, exercícios, tratamento..."
              className="flex-1 min-h-[40px] max-h-[100px] resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleVoiceInput}
                variant="ghost"
                size="sm"
                className={isListening ? 'text-red-600' : 'text-gray-600'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </AnimatedContainer>
  );
}