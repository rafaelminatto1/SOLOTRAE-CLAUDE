import React, { useState } from 'react';
import { MessageCircle, Send, Phone, Check, CheckCheck, Clock, AlertCircle, Settings, User, Calendar, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface WhatsAppMessage {
  id: string;
  to: string;
  from: string;
  content: string;
  type: 'text' | 'appointment_reminder' | 'exercise_reminder' | 'payment_reminder' | 'custom';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  templateId?: string;
  variables?: Record<string, string>;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'appointment' | 'exercise' | 'payment' | 'marketing' | 'general';
  message: string;
  variables: string[];
  status: 'active' | 'pending' | 'rejected';
  language: string;
}

interface BulkCampaign {
  id: string;
  name: string;
  template: string;
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  status: 'draft' | 'sending' | 'completed' | 'paused';
  scheduledDate?: Date;
  createdAt: Date;
}

const mockMessages: WhatsAppMessage[] = [
  {
    id: '1',
    to: '+5511999999999',
    from: 'FisioFlow',
    content: 'Olá João! Lembramos que você tem uma consulta agendada para amanhã às 14:00 com Dr. Ana Silva. Confirme sua presença respondendo SIM.',
    type: 'appointment_reminder',
    status: 'read',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    templateId: 'appointment_reminder_24h'
  },
  {
    id: '2',
    to: '+5511888888888',
    from: 'FisioFlow',
    content: 'Oi Maria! Não esqueça de fazer seus exercícios de hoje. Acesse o app e marque como concluído. Qualquer dúvida, estamos aqui!',
    type: 'exercise_reminder',
    status: 'delivered',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    templateId: 'exercise_reminder_daily'
  },
  {
    id: '3',
    to: '+5511777777777',
    from: 'FisioFlow',
    content: 'Prezado Carlos, identificamos um pagamento pendente de R$ 150,00 referente à consulta do dia 05/01. Acesse nosso portal para quitar.',
    type: 'payment_reminder',
    status: 'sent',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    templateId: 'payment_reminder'
  },
  {
    id: '4',
    to: '+5511666666666',
    from: 'FisioFlow',
    content: 'Parabéns Ana! Você completou 7 dias consecutivos de exercícios! Continue assim e alcance seus objetivos de recuperação.',
    type: 'custom',
    status: 'read',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    templateId: 'achievement_streak'
  }
];

const mockTemplates: WhatsAppTemplate[] = [
  {
    id: 'appointment_reminder_24h',
    name: 'Lembrete de Consulta - 24h',
    category: 'appointment',
    message: 'Olá {{name}}! Lembramos que você tem uma consulta agendada para {{date}} às {{time}} com {{doctor}}. Confirme sua presença respondendo SIM.',
    variables: ['name', 'date', 'time', 'doctor'],
    status: 'active',
    language: 'pt_BR'
  },
  {
    id: 'exercise_reminder_daily',
    name: 'Lembrete Diário de Exercícios',
    category: 'exercise',
    message: 'Oi {{name}}! Não esqueça de fazer seus exercícios de hoje. Acesse o app e marque como concluído. Qualquer dúvida, estamos aqui!',
    variables: ['name'],
    status: 'active',
    language: 'pt_BR'
  },
  {
    id: 'payment_reminder',
    name: 'Lembrete de Pagamento',
    category: 'payment',
    message: 'Prezado {{name}}, identificamos um pagamento pendente de {{amount}} referente à {{description}}. Acesse nosso portal para quitar.',
    variables: ['name', 'amount', 'description'],
    status: 'active',
    language: 'pt_BR'
  },
  {
    id: 'achievement_streak',
    name: 'Conquista - Sequência de Exercícios',
    category: 'general',
    message: 'Parabéns {{name}}! Você completou {{days}} dias consecutivos de exercícios! Continue assim e alcance seus objetivos de recuperação.',
    variables: ['name', 'days'],
    status: 'active',
    language: 'pt_BR'
  },
  {
    id: 'welcome_new_patient',
    name: 'Boas-vindas Novo Paciente',
    category: 'general',
    message: 'Bem-vindo à FisioFlow, {{name}}! Estamos felizes em tê-lo conosco. Sua primeira consulta está agendada para {{date}} às {{time}}.',
    variables: ['name', 'date', 'time'],
    status: 'pending',
    language: 'pt_BR'
  }
];

const mockCampaigns: BulkCampaign[] = [
  {
    id: '1',
    name: 'Lembretes de Exercícios - Janeiro',
    template: 'exercise_reminder_daily',
    recipients: 150,
    sent: 150,
    delivered: 147,
    read: 89,
    failed: 3,
    status: 'completed',
    scheduledDate: new Date(2025, 0, 1, 9, 0),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Confirmação de Consultas - Semana 1',
    template: 'appointment_reminder_24h',
    recipients: 45,
    sent: 32,
    delivered: 30,
    read: 18,
    failed: 2,
    status: 'sending',
    scheduledDate: new Date(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Cobrança Pendências - Dezembro',
    template: 'payment_reminder',
    recipients: 23,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    status: 'draft',
    scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  }
];

export default function WhatsAppIntegration() {
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'campaigns' | 'settings'>('messages');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'read':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'sending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'exercise':
        return <Stethoscope className="w-4 h-4" />;
      case 'payment':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const MessagesTab = () => (
    <div className="space-y-6">
      {/* Send Message Form */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar Mensagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Número de Destino
              </label>
              <input
                type="tel"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Template
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Mensagem livre</option>
                {mockTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Mensagem
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              {newMessage.length}/1000 caracteres
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Enviar Agora
            </Button>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Mensagens Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMessages.map(message => (
              <div key={message.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.to}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1 capitalize">{message.status}</span>
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-dark-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-dark-300 text-sm mb-2">
                    {message.content}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400">
                    <span className="capitalize">{message.type.replace('_', ' ')}</span>
                    {message.templateId && (
                      <>
                        <span>•</span>
                        <span>{message.templateId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-6">
      {/* Template Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {mockTemplates.map(template => (
          <Card key={template.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  {template.name}
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                  {template.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Categoria
                  </label>
                  <span className="text-sm text-gray-600 dark:text-dark-400 capitalize">
                    {template.category}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Mensagem
                  </label>
                  <p className="text-sm text-gray-700 dark:text-dark-300 bg-gray-50 dark:bg-dark-700 p-3 rounded border-l-4 border-green-500">
                    {template.message}
                  </p>
                </div>
                
                {template.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                      Variáveis
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map(variable => (
                        <span key={variable} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Testar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Template */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Criar Novo Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const CampaignsTab = () => (
    <div className="space-y-6">
      {/* Campaigns List */}
      {mockCampaigns.map(campaign => (
        <Card key={campaign.id} className="border border-gray-200 dark:border-dark-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{campaign.name}</CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Destinatários</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.recipients}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Enviadas</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {campaign.sent}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Entregues</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {campaign.delivered}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Lidas</p>
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {campaign.read}
                  </p>
                </div>
              </div>
              
              {campaign.sent > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-400 mb-1">
                    <span>Taxa de Entrega</span>
                    <span>{((campaign.delivered / campaign.sent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(campaign.delivered / campaign.sent) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-dark-400">
                <span>Template: {campaign.template}</span>
                <span>
                  {campaign.scheduledDate && formatDate(campaign.scheduledDate)} • {formatDate(campaign.createdAt)}
                </span>
              </div>
              
              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button className="bg-green-500 hover:bg-green-600 text-white" size="sm">
                      Iniciar Campanha
                    </Button>
                  </>
                )}
                {campaign.status === 'sending' && (
                  <Button variant="outline" size="sm">
                    Pausar
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Create New Campaign */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Nova Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Send className="w-4 h-4 mr-2" />
            Criar Campanha
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Configurações da API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              API Token
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Número de Origem (WhatsApp Business)
            </label>
            <input
              type="tel"
              placeholder="+55 11 99999-9999"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-notifications" className="rounded" />
            <label htmlFor="auto-notifications" className="text-sm text-gray-700 dark:text-dark-300">
              Enviar notificações automáticas
            </label>
          </div>
          
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Conectado
            </span>
            <span className="text-gray-500 dark:text-dark-400">
              • Última sincronização: agora
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              WhatsApp Business
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Integração completa para comunicação com pacientes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Enviadas Hoje</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CheckCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Entrega</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">96.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Leitura</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">78.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Templates Ativos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockTemplates.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'messages', label: 'Mensagens', icon: MessageCircle },
          { id: 'templates', label: 'Templates', icon: Settings },
          { id: 'campaigns', label: 'Campanhas', icon: Send },
          { id: 'settings', label: 'Configurações', icon: Phone }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && <MessagesTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </AnimatedContainer>
  );
}