import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { useApiPost, useApiGet } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  Brain,
  Send,
  Loader2,
  MessageSquare,
  User,
  Bot,
  FileText,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Copy,
  Download,
  RefreshCw,
  Settings,
  Zap,
  Shield
} from 'lucide-react';

// Tipos baseados no backend
interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  consultation_type?: string;
  provider?: string;
  tokens_used?: number;
}

interface AIConsultation {
  id: string;
  consultation_type: string;
  status: string;
  question: string;
  ai_response?: string;
  summary?: string;
  key_points?: string[];
  recommendations?: string[];
  contraindications?: string[];
  precautions?: string[];
  provider_used: string;
  confidence_score?: number;
  tokens_used: number;
  response_time: number;
  created_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface AIProvider {
  name: string;
  status: 'active' | 'inactive' | 'error';
  response_time: number;
  success_rate: number;
  tokens_available: number;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [consultationType, setConsultationType] = useState('GENERAL_CONSULTATION');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<AIConsultation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { mutate: sendMessage } = useApiPost('/ai/chat');
  const { data: consultationsData, refetch: refetchConsultations } = useApiGet<{ consultations: AIConsultation[] }>('/ai/consultations');
  const { data: providersData, refetch: refetchProviders } = useApiGet<{ providers: AIProvider[] }>('/ai/providers/status');
  const { data: patientsData } = useApiGet<{ patients: Array<{ id: string; first_name: string; last_name: string; }> }>('/patients');

  const consultations = consultationsData?.consultations || [];
  const providers = providersData?.providers || [];
  const patients = patientsData?.patients || [];

  const consultationTypes = [
    { value: 'GENERAL_CONSULTATION', label: 'Consulta Geral' },
    { value: 'DIAGNOSIS_SUPPORT', label: 'Suporte ao Diagnóstico' },
    { value: 'TREATMENT_PLAN', label: 'Plano de Tratamento' },
    { value: 'EXERCISE_RECOMMENDATION', label: 'Recomendação de Exercícios' },
    { value: 'PROGNOSIS_ANALYSIS', label: 'Análise de Prognóstico' },
    { value: 'LITERATURE_REVIEW', label: 'Revisão de Literatura' },
    { value: 'CASE_ANALYSIS', label: 'Análise de Caso' },
    { value: 'PROTOCOL_SUGGESTION', label: 'Sugestão de Protocolo' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getProviderColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: inputMessage,
        consultation_type: consultationType,
        patient_id: selectedPatientId || undefined,
        context: {
          previous_messages: messages.slice(-5) // Últimas 5 mensagens para contexto
        }
      });

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        consultation_type: consultationType,
        provider: response.data.provider,
        tokens_used: response.data.tokens_used
      };

      setMessages(prev => [...prev, assistantMessage]);
      refetchConsultations();
      toast.success('Resposta recebida com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat limpo!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IA Assistente</h1>
                <p className="text-sm text-gray-600">Sistema híbrido de inteligência artificial</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProviders(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Provedores
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configurações */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Consulta
                  </label>
                  <Select
                  value={consultationType}
                  onValueChange={setConsultationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente (Opcional)
                  </label>
                  <Select
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Selecione um paciente</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                {/* Status dos Provedores */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Status dos Provedores</h4>
                  <div className="space-y-2">
                    {providers.slice(0, 3).map((provider) => (
                      <div key={provider.name} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{provider.name}</span>
                        <Badge className={getProviderColor(provider.status)}>
                          {provider.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bem-vindo ao IA Assistente</h3>
                    <p className="text-gray-600 mb-6">Faça uma pergunta para começar a conversa</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {[
                        'Como tratar dor lombar crônica?',
                        'Exercícios para reabilitação de joelho',
                        'Protocolo para tendinite do ombro',
                        'Avaliação postural completa'
                      ].map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage(suggestion)}
                          className="text-left justify-start"
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-start space-x-3">
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Bot className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                            <div
                              className={`inline-block p-4 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              {message.role === 'assistant' && (
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    {message.provider && (
                                      <Badge variant="outline" className="text-xs">
                                        {message.provider}
                                      </Badge>
                                    )}
                                    {message.tokens_used && (
                                      <span>{message.tokens_used} tokens</span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(message.content)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {message.timestamp.toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-gray-600">Processando sua solicitação...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta ou solicitação..."
                    className="flex-1 min-h-[60px] max-h-32 resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Histórico */}
      {showHistory && (
        <Modal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          title="Histórico de Consultas"
          size="lg"
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedConsultation(consultation)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(consultation.status)
                  }`}>
                    {getStatusIcon(consultation.status)}
                    <span className="ml-1">{consultation.status}</span>
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(consultation.created_at)}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{consultation.consultation_type}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{consultation.question}</p>
                {consultation.patient && (
                  <p className="text-xs text-gray-500 mt-2">
                    Paciente: {consultation.patient.first_name} {consultation.patient.last_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal de Provedores */}
      {showProviders && (
        <Modal
          isOpen={showProviders}
          onClose={() => setShowProviders(false)}
          title="Status dos Provedores de IA"
          size="lg"
        >
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <Badge className={getProviderColor(provider.status)}>
                    {provider.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tempo de Resposta:</span>
                    <p className="font-medium">{provider.response_time}ms</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Taxa de Sucesso:</span>
                    <p className="font-medium">{provider.success_rate}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tokens Disponíveis:</span>
                    <p className="font-medium">{provider.tokens_available.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => refetchProviders()}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Status
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal de Detalhes da Consulta */}
      {selectedConsultation && (
        <Modal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          title="Detalhes da Consulta"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <p className="text-gray-900">{selectedConsultation.consultation_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Badge className={getStatusColor(selectedConsultation.status)}>
                  {selectedConsultation.status}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Provedor</label>
                <p className="text-gray-900">{selectedConsultation.provider_used}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tokens Usados</label>
                <p className="text-gray-900">{selectedConsultation.tokens_used}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pergunta</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900">{selectedConsultation.question}</p>
              </div>
            </div>

            {selectedConsultation.ai_response && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resposta</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedConsultation.ai_response}</p>
                </div>
              </div>
            )}

            {selectedConsultation.key_points && selectedConsultation.key_points.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pontos-Chave</label>
                <ul className="list-disc list-inside space-y-1">
                  {selectedConsultation.key_points.map((point, index) => (
                    <li key={index} className="text-gray-900">{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedConsultation.recommendations && selectedConsultation.recommendations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recomendações</label>
                <ul className="list-disc list-inside space-y-1">
                  {selectedConsultation.recommendations.map((rec, index) => (
                    <li key={index} className="text-green-800">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedConsultation.contraindications && selectedConsultation.contraindications.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraindicações</label>
                <ul className="list-disc list-inside space-y-1">
                  {selectedConsultation.contraindications.map((contra, index) => (
                    <li key={index} className="text-red-800">{contra}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(selectedConsultation.ai_response || '')}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Resposta
              </Button>
              <Button
                variant="primary"
                onClick={() => setSelectedConsultation(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AIAssistant;