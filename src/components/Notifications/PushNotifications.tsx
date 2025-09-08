import React, { useState } from 'react';
import { Bell, Smartphone, Send, Users, BarChart3, Settings, CheckCircle, Clock, AlertCircle, Target, Globe, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'clicked' | 'dismissed';
  recipients: number;
  delivered: number;
  clicked: number;
  dismissed: number;
}

interface PushCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  targetAudience: 'all' | 'patients' | 'staff' | 'specific';
  recipients: number;
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  scheduledDate?: Date;
  sentDate?: Date;
  createdAt: Date;
  tags?: string[];
}

interface PushMetrics {
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  totalDismissed: number;
  deliveryRate: number;
  clickRate: number;
  dismissalRate: number;
  averageClickTime: number;
}

interface DeviceInfo {
  id: string;
  userId: string;
  userName: string;
  deviceType: 'android' | 'ios' | 'web';
  deviceModel?: string;
  osVersion?: string;
  appVersion: string;
  registrationToken: string;
  isActive: boolean;
  lastSeen: Date;
  subscribedTopics: string[];
}

const mockNotifications: PushNotification[] = [
  {
    id: '1',
    title: 'Consulta Agendada',
    body: 'Sua consulta com Dr. Ana Silva foi confirmada para amanhã às 14:00',
    icon: 'calendar',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'clicked',
    recipients: 1,
    delivered: 1,
    clicked: 1,
    dismissed: 0,
    data: { type: 'appointment', appointmentId: '123' },
    actions: [
      { action: 'confirm', title: 'Confirmar' },
      { action: 'reschedule', title: 'Reagendar' }
    ]
  },
  {
    id: '2',
    title: 'Hora do Exercício!',
    body: 'Não esqueça de fazer seus exercícios diários. Você está no caminho certo!',
    icon: 'fitness',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'delivered',
    recipients: 150,
    delivered: 147,
    clicked: 89,
    dismissed: 23,
    data: { type: 'exercise_reminder' },
    actions: [
      { action: 'start', title: 'Iniciar Agora' },
      { action: 'later', title: 'Mais Tarde' }
    ]
  },
  {
    id: '3',
    title: 'Parabéns! 🎉',
    body: 'Você completou 7 dias consecutivos de exercícios! Continue assim!',
    icon: 'achievement',
    image: 'https://example.com/achievement-badge.png',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'clicked',
    recipients: 45,
    delivered: 44,
    clicked: 32,
    dismissed: 5,
    data: { type: 'achievement', streak: 7 },
    actions: [
      { action: 'share', title: 'Compartilhar' },
      { action: 'view', title: 'Ver Progresso' }
    ]
  },
  {
    id: '4',
    title: 'Pagamento Pendente',
    body: 'Você tem um pagamento pendente de R$ 150,00. Clique para quitar.',
    icon: 'payment',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    status: 'dismissed',
    recipients: 23,
    delivered: 23,
    clicked: 8,
    dismissed: 15,
    data: { type: 'payment', amount: 150, invoiceId: '456' },
    actions: [
      { action: 'pay', title: 'Pagar Agora' },
      { action: 'details', title: 'Ver Detalhes' }
    ]
  }
];

const mockCampaigns: PushCampaign[] = [
  {
    id: '1',
    name: 'Lembretes de Exercícios - Janeiro',
    title: 'Hora do Exercício!',
    body: 'Seus exercícios de hoje estão esperando por você. Mantenha a regularidade!',
    status: 'sent',
    targetAudience: 'patients',
    recipients: 320,
    sent: 320,
    delivered: 314,
    clicked: 156,
    dismissed: 67,
    sentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ['exercícios', 'lembretes', 'pacientes']
  },
  {
    id: '2',
    name: 'Confirmações de Consulta - Semana',
    title: 'Confirmação de Consulta',
    body: 'Confirme sua presença na consulta de amanhã. Responda SIM para confirmar.',
    status: 'sending',
    targetAudience: 'specific',
    recipients: 67,
    sent: 45,
    delivered: 44,
    clicked: 28,
    dismissed: 3,
    scheduledDate: new Date(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['consultas', 'confirmação']
  },
  {
    id: '3',
    name: 'Novidade na Clínica',
    title: 'Nova Funcionalidade Disponível! 🚀',
    body: 'Agora você pode agendar consultas diretamente pelo app. Experimente!',
    status: 'scheduled',
    targetAudience: 'all',
    recipients: 890,
    sent: 0,
    delivered: 0,
    clicked: 0,
    dismissed: 0,
    scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['novidades', 'funcionalidades']
  }
];

const mockMetrics: PushMetrics = {
  totalSent: 12567,
  totalDelivered: 12234,
  totalClicked: 3456,
  totalDismissed: 2891,
  deliveryRate: 97.4,
  clickRate: 28.2,
  dismissalRate: 23.6,
  averageClickTime: 15.3
};

const mockDevices: DeviceInfo[] = [
  {
    id: '1',
    userId: 'user_123',
    userName: 'João Silva',
    deviceType: 'android',
    deviceModel: 'Samsung Galaxy S21',
    osVersion: 'Android 12',
    appVersion: '1.2.3',
    registrationToken: 'fcm_token_abcd1234...',
    isActive: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    subscribedTopics: ['all_patients', 'exercise_reminders', 'appointment_confirmations']
  },
  {
    id: '2',
    userId: 'user_456',
    userName: 'Maria Santos',
    deviceType: 'ios',
    deviceModel: 'iPhone 13 Pro',
    osVersion: 'iOS 16.2',
    appVersion: '1.2.3',
    registrationToken: 'apns_token_efgh5678...',
    isActive: true,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
    subscribedTopics: ['all_patients', 'payment_reminders']
  },
  {
    id: '3',
    userId: 'user_789',
    userName: 'Carlos Lima',
    deviceType: 'web',
    osVersion: 'Chrome 118',
    appVersion: '1.2.2',
    registrationToken: 'web_push_token_ijkl9012...',
    isActive: false,
    lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    subscribedTopics: ['all_users', 'system_notifications']
  }
];

export default function PushNotifications() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'notifications' | 'devices' | 'analytics' | 'settings'>('campaigns');
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
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
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'clicked':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'sending':
        return <Clock className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'clicked':
        return <Target className="w-4 h-4" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'android':
        return '🤖';
      case 'ios':
        return '🍎';
      case 'web':
        return '🌐';
      default:
        return '📱';
    }
  };

  const CampaignsTab = () => (
    <div className="space-y-6">
      {/* Create Campaign Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Campanhas Push
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
                  <p className="text-gray-600 dark:text-dark-400 mt-1">{campaign.title}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">{campaign.body}</p>
                </div>
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4 mb-4">
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
                  <p className="text-sm text-gray-500 dark:text-dark-400">Clicados</p>
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {campaign.clicked.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Clique</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : 0}%
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
                <div>
                  <span className="capitalize">{campaign.targetAudience}</span>
                  {campaign.tags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span>
                  {campaign.sentDate ? `Enviado em ${formatDate(campaign.sentDate)}` :
                   campaign.scheduledDate ? `Agendado para ${formatDate(campaign.scheduledDate)}` :
                   `Criado em ${formatDate(campaign.createdAt)}`}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-1" />
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

  const NotificationsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Notificações Recentes
      </h2>

      <div className="space-y-4">
        {mockNotifications.map(notification => (
          <Card key={notification.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-dark-400">
                        {notification.body}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {getStatusIcon(notification.status)}
                      {notification.status}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Destinatários</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notification.recipients}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Entregues</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {notification.delivered}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Clicados</p>
                      <p className="font-medium text-purple-600 dark:text-purple-400">
                        {notification.clicked}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Descartados</p>
                      <p className="font-medium text-gray-600 dark:text-gray-400">
                        {notification.dismissed}
                      </p>
                    </div>
                  </div>

                  {notification.actions && notification.actions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-dark-400 mb-2">Ações:</p>
                      <div className="flex flex-wrap gap-2">
                        {notification.actions.map((action, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                            {action.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-400">
                    <span>{formatDate(notification.timestamp)}</span>
                    {notification.delivered > 0 && (
                      <span>
                        Taxa de clique: {((notification.clicked / notification.delivered) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const DevicesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dispositivos Registrados
        </h2>
        <div className="text-sm text-gray-500 dark:text-dark-400">
          {mockDevices.filter(d => d.isActive).length} de {mockDevices.length} dispositivos ativos
        </div>
      </div>

      <div className="grid gap-4">
        {mockDevices.map(device => (
          <Card key={device.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getDeviceIcon(device.deviceType)}</div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {device.userName}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-dark-400">
                      <p>{device.deviceModel || device.deviceType}</p>
                      <p>{device.osVersion} • App v{device.appVersion}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600 dark:text-dark-400">
                      {device.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-400">
                    Visto {formatTime(device.lastSeen)}
                  </p>
                </div>
              </div>
              
              {device.subscribedTopics.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                  <p className="text-xs text-gray-500 dark:text-dark-400 mb-2">Tópicos inscritos:</p>
                  <div className="flex flex-wrap gap-1">
                    {device.subscribedTopics.map(topic => (
                      <span key={topic} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Analytics Push
      </h2>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.totalSent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Push Enviados</p>
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
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.clickRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Clique</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mockMetrics.averageClickTime}s
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">Tempo Médio de Clique</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Performance dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-dark-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-600">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 dark:text-dark-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-dark-400">Gráfico de Performance</p>
              <p className="text-sm text-gray-400 dark:text-dark-500">Dados dos últimos 7 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Distribution */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Distribuição por Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Android', count: 450, percentage: 60 },
              { type: 'iOS', count: 230, percentage: 31 },
              { type: 'Web', count: 70, percentage: 9 }
            ].map(device => (
              <div key={device.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getDeviceIcon(device.type.toLowerCase())}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{device.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-dark-400 w-16 text-right">
                    {device.count} ({device.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Configurações Push
      </h2>

      {/* FCM Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Firebase Cloud Messaging (FCM)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Server Key
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Sender ID
            </label>
            <input
              type="text"
              placeholder="123456789"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações FCM
          </Button>
        </CardContent>
      </Card>

      {/* APNS Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Apple Push Notification Service (APNS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Team ID
            </label>
            <input
              type="text"
              placeholder="ABCDEFGHIJ"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Key ID
            </label>
            <input
              type="text"
              placeholder="1234567890"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Bundle ID
            </label>
            <input
              type="text"
              placeholder="com.fisioflow.app"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações APNS
          </Button>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-retry" className="rounded" defaultChecked />
            <label htmlFor="auto-retry" className="text-sm text-gray-700 dark:text-dark-300">
              Tentar novamente automaticamente em caso de falha
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input type="checkbox" id="analytics" className="rounded" defaultChecked />
            <label htmlFor="analytics" className="text-sm text-gray-700 dark:text-dark-300">
              Coletar analytics de performance
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input type="checkbox" id="batch-send" className="rounded" />
            <label htmlFor="batch-send" className="text-sm text-gray-700 dark:text-dark-300">
              Envio em lote para melhor performance
            </label>
          </div>
          
          <Button variant="outline">
            Salvar Configurações
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
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Push Notifications
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gerencie notificações push para dispositivos móveis e web
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Dispositivos Ativos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockDevices.filter(d => d.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Enviados Hoje</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Clique</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">28.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Campanhas Ativas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockCampaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'campaigns', label: 'Campanhas', icon: Send },
          { id: 'notifications', label: 'Notificações', icon: Bell },
          { id: 'devices', label: 'Dispositivos', icon: Smartphone },
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
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'devices' && <DevicesTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </AnimatedContainer>
  );
}