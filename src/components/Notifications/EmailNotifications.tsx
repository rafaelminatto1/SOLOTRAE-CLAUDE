import React, { useState } from 'react';
import { Mail, Send, Eye, Calendar, Users, Settings, CheckCircle, Clock, AlertCircle, BarChart3, FileText, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'appointment' | 'exercise' | 'payment' | 'marketing' | 'welcome' | 'reminder';
  htmlContent: string;
  textContent: string;
  variables: string[];
  isActive: boolean;
  lastUsed?: Date;
  usageCount: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  scheduledDate?: Date;
  sentDate?: Date;
  createdAt: Date;
}

interface EmailMetrics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Confirmação de Consulta',
    subject: 'Confirmação de Consulta - {{date}} às {{time}}',
    category: 'appointment',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá {{patient_name}},</h2>
        <p>Confirmamos sua consulta para <strong>{{date}} às {{time}}</strong> com {{doctor_name}}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes da Consulta:</h3>
          <p><strong>Data:</strong> {{date}}</p>
          <p><strong>Horário:</strong> {{time}}</p>
          <p><strong>Profissional:</strong> {{doctor_name}}</p>
          <p><strong>Local:</strong> {{location}}</p>
        </div>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
      </div>
    `,
    textContent: 'Olá {{patient_name}}, confirmamos sua consulta para {{date}} às {{time}} com {{doctor_name}}.',
    variables: ['patient_name', 'date', 'time', 'doctor_name', 'location'],
    isActive: true,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    usageCount: 142
  },
  {
    id: '2',
    name: 'Lembrete de Exercícios',
    subject: 'Não esqueça dos seus exercícios de hoje!',
    category: 'exercise',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá {{patient_name}},</h2>
        <p>Lembramos que você tem exercícios programados para hoje.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{app_url}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acessar Exercícios</a>
        </div>
        <p>Mantenha a regularidade para melhores resultados!</p>
      </div>
    `,
    textContent: 'Olá {{patient_name}}, lembramos que você tem exercícios programados para hoje. Acesse: {{app_url}}',
    variables: ['patient_name', 'app_url'],
    isActive: true,
    lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
    usageCount: 89
  },
  {
    id: '3',
    name: 'Cobrança Pendente',
    subject: 'Pagamento Pendente - {{amount}}',
    category: 'payment',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Prezado(a) {{patient_name}},</h2>
        <p>Identificamos um pagamento pendente em sua conta.</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes do Pagamento:</h3>
          <p><strong>Valor:</strong> {{amount}}</p>
          <p><strong>Vencimento:</strong> {{due_date}}</p>
          <p><strong>Descrição:</strong> {{description}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{payment_url}}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Pagar Agora</a>
        </div>
      </div>
    `,
    textContent: 'Prezado(a) {{patient_name}}, identificamos um pagamento pendente de {{amount}}. Pague em: {{payment_url}}',
    variables: ['patient_name', 'amount', 'due_date', 'description', 'payment_url'],
    isActive: true,
    lastUsed: new Date(Date.now() - 12 * 60 * 60 * 1000),
    usageCount: 34
  },
  {
    id: '4',
    name: 'Boas-vindas',
    subject: 'Bem-vindo(a) à FisioFlow!',
    category: 'welcome',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6;">Bem-vindo(a) à FisioFlow!</h1>
        </div>
        <h2>Olá {{patient_name}},</h2>
        <p>Estamos felizes em tê-lo(a) conosco! Sua jornada de recuperação começa agora.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Próximos passos:</h3>
          <ul>
            <li>Complete seu perfil no aplicativo</li>
            <li>Agende sua primeira consulta</li>
            <li>Conheça nossa equipe</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{app_url}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acessar Plataforma</a>
        </div>
      </div>
    `,
    textContent: 'Bem-vindo(a) à FisioFlow, {{patient_name}}! Acesse nossa plataforma: {{app_url}}',
    variables: ['patient_name', 'app_url'],
    isActive: true,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    usageCount: 67
  }
];

const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Newsletter Janeiro 2025',
    subject: 'Dicas de Saúde para o Novo Ano',
    templateId: '4',
    status: 'sent',
    recipients: 450,
    sent: 450,
    delivered: 445,
    opened: 267,
    clicked: 89,
    bounced: 5,
    unsubscribed: 3,
    sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Lembretes de Consulta - Semana',
    subject: 'Sua consulta é amanhã',
    templateId: '1',
    status: 'sending',
    recipients: 85,
    sent: 60,
    delivered: 58,
    opened: 32,
    clicked: 12,
    bounced: 2,
    unsubscribed: 0,
    scheduledDate: new Date(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Campanha Exercícios - Motivacional',
    subject: 'Continue firme com seus exercícios!',
    templateId: '2',
    status: 'scheduled',
    recipients: 320,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  }
];

const mockMetrics: EmailMetrics = {
  totalSent: 12450,
  deliveryRate: 97.8,
  openRate: 24.5,
  clickRate: 8.2,
  bounceRate: 2.2,
  unsubscribeRate: 0.5
};

export default function EmailNotifications() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics' | 'settings'>('campaigns');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'sending':
        return <Clock className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'exercise':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'payment':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'marketing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'welcome':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reminder':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const CampaignsTab = () => (
    <div className="space-y-6">
      {/* Create Campaign Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Campanhas de Email
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Send className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {mockCampaigns.map(campaign => (
          <Card key={campaign.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <p className="text-gray-600 dark:text-dark-400 mt-1">{campaign.subject}</p>
                </div>
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-6 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Destinatários</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.recipients.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Enviados</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {campaign.sent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Entregues</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {campaign.delivered.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Abertos</p>
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {campaign.opened.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Clicks</p>
                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    {campaign.clicked.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Abertura</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              {campaign.sent > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-dark-400">Taxa de Entrega</span>
                    <span className="font-medium">{((campaign.delivered / campaign.sent) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(campaign.delivered / campaign.sent) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-dark-400 mb-4">
                <span>
                  {campaign.sentDate ? `Enviado em ${formatDate(campaign.sentDate)}` :
                   campaign.scheduledDate ? `Agendado para ${formatDate(campaign.scheduledDate)}` :
                   `Criado em ${formatDate(campaign.createdAt)}`}
                </span>
                <span>Template: {mockTemplates.find(t => t.id === campaign.templateId)?.name}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
                {campaign.status === 'draft' && (
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Send className="w-4 h-4 mr-1" />
                    Enviar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-6">
      {/* Create Template Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Templates de Email
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <FileText className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockTemplates.map(template => (
          <Card key={template.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {template.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-dark-400 mt-1 text-sm">
                    {template.subject}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-dark-400">
                  <span>Usado {template.usageCount} vezes</span>
                  <span>
                    {template.lastUsed ? `Última vez: ${formatDate(template.lastUsed)}` : 'Nunca usado'}
                  </span>
                </div>

                {template.variables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                      Variáveis:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map(variable => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600 dark:text-dark-400">
                      {template.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visualizar Template: {selectedTemplate.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('html')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      previewMode === 'html'
                        ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-dark-400'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setPreviewMode('text')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      previewMode === 'text'
                        ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-dark-400'
                    }`}
                  >
                    Texto
                  </button>
                </div>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-dark-400 mb-2">Assunto:</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedTemplate.subject}</p>
              </div>
              
              <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 bg-gray-50 dark:bg-dark-700">
                {previewMode === 'html' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                    className="prose dark:prose-invert max-w-none"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                    {selectedTemplate.textContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Analytics de Email
      </h2>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.totalSent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Emails Enviados</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.deliveryRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Entrega</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.openRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Abertura</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.clickRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Clique</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.bounceRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Rejeição</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.unsubscribeRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Descadastro</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Performance dos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-dark-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-600">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 dark:text-dark-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-dark-400">Gráfico de Performance</p>
              <p className="text-sm text-gray-400 dark:text-dark-500">Dados dos últimos 30 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Configurações de Email
      </h2>

      {/* SMTP Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Configurações SMTP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Servidor SMTP
              </label>
              <input
                type="text"
                placeholder="smtp.exemplo.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Porta
              </label>
              <input
                type="number"
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Usuário
              </label>
              <input
                type="email"
                placeholder="contato@fisioflow.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input type="checkbox" id="tls" className="rounded" />
            <label htmlFor="tls" className="text-sm text-gray-700 dark:text-dark-300">
              Usar TLS/SSL
            </label>
          </div>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Configurações Padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Email de Remetente Padrão
            </label>
            <input
              type="email"
              placeholder="contato@fisioflow.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Nome do Remetente
            </label>
            <input
              type="text"
              placeholder="FisioFlow"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Email de Resposta
            </label>
            <input
              type="email"
              placeholder="noreply@fisioflow.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <Button variant="outline">
            Salvar Padrões
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Marketing
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gerencie campanhas e templates de email
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'campaigns', label: 'Campanhas', icon: Send },
          { id: 'templates', label: 'Templates', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Configurações', icon: Settings }
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
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </AnimatedContainer>
  );
}