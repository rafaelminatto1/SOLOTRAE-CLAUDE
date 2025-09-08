import React, { useState } from 'react';
import { Bell, MessageCircle, Mail, Smartphone, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import WhatsAppIntegration from '@/components/Notifications/WhatsAppIntegration';
import EmailNotifications from '@/components/Notifications/EmailNotifications';
import PushNotifications from '@/components/Notifications/PushNotifications';
import NotificationCenter from '@/components/Notifications/NotificationCenter';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<'center' | 'whatsapp' | 'email' | 'push' | 'settings'>('center');

  const tabs = [
    {
      id: 'center',
      label: 'Central',
      icon: Bell,
      description: 'Gerenciar todas as notificações',
      component: <NotificationCenter />
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      description: 'Integração WhatsApp Business',
      component: <WhatsAppIntegration />
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      description: 'Campanhas e templates de email',
      component: <EmailNotifications />
    },
    {
      id: 'push',
      label: 'Push',
      icon: Smartphone,
      description: 'Notificações push para dispositivos',
      component: <PushNotifications />
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações gerais de notificações',
      component: <NotificationSettings />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sistema de Notificações
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gerencie todas as formas de comunicação com pacientes e equipe
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid md:grid-cols-5 gap-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-dark-600 hover:shadow-md hover:border-gray-300 dark:hover:border-dark-500'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className={`font-semibold mb-1 ${
                  activeTab === tab.id
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {tab.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">
                  {tab.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="mt-8">
        {activeTabData?.component}
      </div>
    </AnimatedContainer>
  );
}

// Settings Component
function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailEnabled: true,
    whatsappEnabled: true,
    pushEnabled: true,
    appointmentReminders: true,
    exerciseReminders: true,
    paymentReminders: true,
    systemAlerts: true,
    marketingEmails: false,
    reminderTiming: '24', // hours before
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    },
    priority: {
      urgent: true,
      high: true,
      medium: true,
      low: false
    }
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações de Notificações
          </h2>
          <p className="text-gray-600 dark:text-dark-400">
            Configure como e quando as notificações devem ser enviadas
          </p>
        </div>
      </div>

      {/* Channel Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Enviar notificações por email
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">WhatsApp</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Enviar notificações via WhatsApp Business
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.whatsappEnabled}
              onChange={(e) => handleSettingChange('whatsappEnabled', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Enviar notificações push para dispositivos móveis
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.pushEnabled}
              onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Lembretes de Consulta</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Lembrar pacientes sobre consultas agendadas
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.appointmentReminders}
              onChange={(e) => handleSettingChange('appointmentReminders', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Lembretes de Exercícios</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Lembrar pacientes sobre exercícios programados
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.exerciseReminders}
              onChange={(e) => handleSettingChange('exerciseReminders', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Lembretes de Pagamento</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Lembrar sobre pagamentos pendentes
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.paymentReminders}
              onChange={(e) => handleSettingChange('paymentReminders', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Alertas de Sistema</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Alertas sobre falhas e atualizações do sistema
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Emails de Marketing</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Newsletters e campanhas promocionais
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Configurações de Tempo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Antecedência dos Lembretes de Consulta
            </label>
            <select
              value={settings.reminderTiming}
              onChange={(e) => handleSettingChange('reminderTiming', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="1">1 hora antes</option>
              <option value="2">2 horas antes</option>
              <option value="4">4 horas antes</option>
              <option value="12">12 horas antes</option>
              <option value="24">24 horas antes</option>
              <option value="48">48 horas antes</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Horário Silencioso</h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">
                  Não enviar notificações durante este período
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => handleNestedSettingChange('quietHours', 'enabled', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </div>

            {settings.quietHours.enabled && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Início
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleNestedSettingChange('quietHours', 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Fim
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleNestedSettingChange('quietHours', 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Settings */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Filtros de Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-dark-400 mb-4">
            Escolha quais níveis de prioridade devem gerar notificações
          </p>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">Urgente</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Falhas críticas e emergências
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.priority.urgent}
              onChange={(e) => handleNestedSettingChange('priority', 'urgent', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-orange-600 dark:text-orange-400">Alta</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Consultas e pagamentos importantes
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.priority.high}
              onChange={(e) => handleNestedSettingChange('priority', 'high', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-600 dark:text-yellow-400">Média</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Lembretes e atualizações gerais
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.priority.medium}
              onChange={(e) => handleNestedSettingChange('priority', 'medium', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-600 dark:text-green-400">Baixa</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                Informações e dicas gerais
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.priority.low}
              onChange={(e) => handleNestedSettingChange('priority', 'low', e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
          <Settings className="w-5 h-5 mr-2 inline" />
          Salvar Configurações
        </button>
      </div>
    </AnimatedContainer>
  );
}