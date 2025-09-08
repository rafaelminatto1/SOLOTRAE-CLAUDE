import React, { useState } from 'react';
import { Link, Settings, Activity, CheckCircle, AlertCircle, Clock, Key, Database, Zap, RefreshCw, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface APIConnection {
  id: string;
  name: string;
  type: 'hospital' | 'laboratory' | 'insurance' | 'payment' | 'wearable' | 'erp';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  version: string;
  lastSync: Date;
  requestsToday: number;
  errorRate: number;
  responseTime: number;
  endpoint: string;
  description: string;
  features: string[];
  credentials: {
    hasApiKey: boolean;
    hasToken: boolean;
    expiresAt?: Date;
  };
}

interface APIMetrics {
  totalConnections: number;
  activeConnections: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
}

const mockConnections: APIConnection[] = [
  {
    id: '1',
    name: 'Hospital São Lucas',
    type: 'hospital',
    status: 'connected',
    version: 'HL7 FHIR R4',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    requestsToday: 1247,
    errorRate: 0.2,
    responseTime: 450,
    endpoint: 'https://api.hospitalsaolucas.com.br/fhir',
    description: 'Integração completa com sistema hospitalar para troca de informações de pacientes',
    features: ['Consulta de pacientes', 'Histórico médico', 'Exames', 'Prescrições'],
    credentials: {
      hasApiKey: true,
      hasToken: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: '2',
    name: 'Laboratório Fleury',
    type: 'laboratory',
    status: 'connected',
    version: 'REST API v2.1',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    requestsToday: 89,
    errorRate: 0.0,
    responseTime: 320,
    endpoint: 'https://api.fleury.com.br/v2',
    description: 'Acesso aos resultados de exames laboratoriais dos pacientes',
    features: ['Resultados de exames', 'Status de coletas', 'Agendamentos'],
    credentials: {
      hasApiKey: true,
      hasToken: false
    }
  },
  {
    id: '3',
    name: 'Unimed Nacional',
    type: 'insurance',
    status: 'testing',
    version: 'TISS 3.02.02',
    lastSync: new Date(Date.now() - 60 * 60 * 1000),
    requestsToday: 23,
    errorRate: 5.2,
    responseTime: 1200,
    endpoint: 'https://webservice.unimed.com.br/tiss',
    description: 'Integração para autorizações e faturamento com plano de saúde',
    features: ['Autorização de consultas', 'Faturamento', 'Elegibilidade'],
    credentials: {
      hasApiKey: true,
      hasToken: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: '4',
    name: 'Stripe Global',
    type: 'payment',
    status: 'connected',
    version: 'v2023-10-16',
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    requestsToday: 456,
    errorRate: 0.1,
    responseTime: 180,
    endpoint: 'https://api.stripe.com/v1',
    description: 'Gateway de pagamento internacional para cobranças globais',
    features: ['Pagamentos', 'Assinaturas', 'Reembolsos', 'Multi-moeda'],
    credentials: {
      hasApiKey: true,
      hasToken: false
    }
  },
  {
    id: '5',
    name: 'Apple HealthKit',
    type: 'wearable',
    status: 'error',
    version: 'iOS 17 SDK',
    lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000),
    requestsToday: 12,
    errorRate: 15.8,
    responseTime: 0,
    endpoint: 'https://developer.apple.com/healthkit',
    description: 'Dados de saúde e atividade física dos dispositivos Apple',
    features: ['Passos', 'Frequência cardíaca', 'Sono', 'Atividades'],
    credentials: {
      hasApiKey: false,
      hasToken: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: '6',
    name: 'Salesforce Health Cloud',
    type: 'erp',
    status: 'disconnected',
    version: 'REST API v58.0',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    requestsToday: 0,
    errorRate: 0.0,
    responseTime: 0,
    endpoint: 'https://fisioflow.my.salesforce.com/services/data/v58.0',
    description: 'CRM integrado para gestão de relacionamento com pacientes',
    features: ['Leads', 'Campanhas', 'Analytics', 'Automação'],
    credentials: {
      hasApiKey: false,
      hasToken: false
    }
  }
];

const mockMetrics: APIMetrics = {
  totalConnections: 6,
  activeConnections: 4,
  totalRequests: 15420,
  successRate: 97.3,
  averageResponseTime: 425,
  errorCount: 89
};

export default function APIManager() {
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'monitoring' | 'settings'>('overview');
  const [connections, setConnections] = useState<APIConnection[]>(mockConnections);
  const [selectedConnection, setSelectedConnection] = useState<APIConnection | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'testing':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'disconnected':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return '🏥';
      case 'laboratory':
        return '🔬';
      case 'insurance':
        return '🛡️';
      case 'payment':
        return '💳';
      case 'wearable':
        return '⌚';
      case 'erp':
        return '📊';
      default:
        return '🔌';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'Sistema Hospitalar';
      case 'laboratory':
        return 'Laboratório';
      case 'insurance':
        return 'Convênio Médico';
      case 'payment':
        return 'Gateway Pagamento';
      case 'wearable':
        return 'Dispositivo Wearable';
      case 'erp':
        return 'Sistema ERP/CRM';
      default:
        return 'API Externa';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const handleTestConnection = (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'testing' as const }
        : conn
    ));

    // Simulate test result
    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connected' as const, lastSync: new Date() }
          : conn
      ));
    }, 3000);
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Total Conexões</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.totalConnections}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Ativas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.activeConnections}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Requests Hoje</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.totalRequests.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Tempo Resposta</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.averageResponseTime}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {connections.map(connection => (
              <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(connection.type)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {connection.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      {getTypeLabel(connection.type)}
                    </p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                  {getStatusIcon(connection.status)}
                  {connection.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ConnectionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Conexões API
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link className="w-4 h-4 mr-2" />
          Nova Conexão
        </Button>
      </div>

      <div className="space-y-4">
        {connections.map(connection => (
          <Card key={connection.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getTypeIcon(connection.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {connection.name}
                    </h3>
                    <p className="text-gray-600 dark:text-dark-400">
                      {getTypeLabel(connection.type)} • {connection.version}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(connection.status)}`}>
                    {getStatusIcon(connection.status)}
                    {connection.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-dark-300 mb-4">
                {connection.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Recursos disponíveis:
                </p>
                <div className="flex flex-wrap gap-2">
                  {connection.features.map(feature => (
                    <span key={feature} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Requests Hoje</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {connection.requestsToday.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Erro</p>
                  <p className={`font-semibold ${connection.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {connection.errorRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Tempo Resposta</p>
                  <p className={`font-semibold ${connection.responseTime > 1000 ? 'text-red-600' : 'text-green-600'}`}>
                    {connection.responseTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Última Sync</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatTime(connection.lastSync)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTestConnection(connection.id)}
                  disabled={connection.status === 'testing'}
                >
                  {connection.status === 'testing' ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4 mr-1" />
                  )}
                  {connection.status === 'testing' ? 'Testando...' : 'Testar'}
                </Button>
                
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
                
                <Button variant="outline" size="sm">
                  <Key className="w-4 h-4 mr-1" />
                  Credenciais
                </Button>
                
                <Button variant="outline" size="sm">
                  <Database className="w-4 h-4 mr-1" />
                  Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciador de APIs
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gerencie todas as integrações externas do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Monitor },
          { id: 'connections', label: 'Conexões', icon: Link },
          { id: 'monitoring', label: 'Monitoramento', icon: Activity },
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
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'connections' && <ConnectionsTab />}
      {activeTab === 'monitoring' && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Monitoramento em Tempo Real
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Dashboard de monitoramento em desenvolvimento...
          </p>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Configurações Globais
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Configurações de API em desenvolvimento...
          </p>
        </div>
      )}
    </AnimatedContainer>
  );
}