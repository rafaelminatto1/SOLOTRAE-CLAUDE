import React, { useState } from 'react';
import { Watch, Heart, Activity, Smartphone, Bluetooth, Wifi, Battery, TrendingUp, AlertTriangle, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface WearableDevice {
  id: string;
  name: string;
  brand: 'apple' | 'samsung' | 'fitbit' | 'garmin' | 'xiaomi' | 'polar' | 'withings' | 'oura';
  model: string;
  type: 'smartwatch' | 'fitness_tracker' | 'smart_ring' | 'chest_strap' | 'patch' | 'scale';
  patientId: string;
  patientName: string;
  status: 'connected' | 'disconnected' | 'low_battery' | 'syncing' | 'error';
  batteryLevel: number;
  lastSync: Date;
  connectionType: 'bluetooth' | 'wifi' | 'cellular' | 'nfc';
  supportedMetrics: WearableMetric[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  firmwareVersion: string;
  permissions: DevicePermission[];
}

interface WearableMetric {
  type: 'heart_rate' | 'steps' | 'sleep' | 'calories' | 'distance' | 'stress' | 'oxygen' | 'temperature' | 'blood_pressure' | 'weight' | 'glucose';
  enabled: boolean;
  frequency: 'continuous' | 'hourly' | 'daily' | 'on_demand';
  accuracy: number;
  lastReading: Date;
}

interface DevicePermission {
  type: 'health_data' | 'location' | 'notifications' | 'background_sync';
  granted: boolean;
  requiredFor: string[];
}

interface HealthData {
  id: string;
  deviceId: string;
  patientId: string;
  timestamp: Date;
  type: string;
  value: number;
  unit: string;
  context?: HealthContext;
  quality: 'high' | 'medium' | 'low';
  validated: boolean;
}

interface HealthContext {
  activity: 'resting' | 'walking' | 'running' | 'sleeping' | 'exercising';
  location?: 'indoor' | 'outdoor';
  notes?: string;
}

interface DataInsight {
  id: string;
  patientId: string;
  type: 'trend' | 'anomaly' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionRequired: boolean;
  generatedAt: Date;
  relatedMetrics: string[];
  confidence: number;
}

interface IntegrationSettings {
  autoSync: boolean;
  dataRetention: number; // days
  anomalyDetection: boolean;
  realTimeAlerts: boolean;
  shareWithProviders: boolean;
  anonymizeData: boolean;
  syncFrequency: 'real_time' | 'hourly' | 'daily';
  alertThresholds: Record<string, { min: number; max: number }>;
}

const mockDevices: WearableDevice[] = [
  {
    id: '1',
    name: 'Apple Watch Series 9',
    brand: 'apple',
    model: 'Series 9',
    type: 'smartwatch',
    patientId: 'p123',
    patientName: 'João Silva Santos',
    status: 'connected',
    batteryLevel: 78,
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    connectionType: 'bluetooth',
    dataQuality: 'excellent',
    firmwareVersion: '10.1.1',
    supportedMetrics: [
      { type: 'heart_rate', enabled: true, frequency: 'continuous', accuracy: 95, lastReading: new Date() },
      { type: 'steps', enabled: true, frequency: 'continuous', accuracy: 98, lastReading: new Date() },
      { type: 'sleep', enabled: true, frequency: 'daily', accuracy: 85, lastReading: new Date() },
      { type: 'calories', enabled: true, frequency: 'continuous', accuracy: 80, lastReading: new Date() },
      { type: 'oxygen', enabled: true, frequency: 'hourly', accuracy: 92, lastReading: new Date() }
    ],
    permissions: [
      { type: 'health_data', granted: true, requiredFor: ['Monitoramento cardíaco', 'Análise do sono'] },
      { type: 'background_sync', granted: true, requiredFor: ['Sincronização automática'] }
    ]
  },
  {
    id: '2',
    name: 'Samsung Galaxy Watch 6',
    brand: 'samsung',
    model: 'Galaxy Watch 6',
    type: 'smartwatch',
    patientId: 'p456',
    patientName: 'Maria Oliveira',
    status: 'low_battery',
    batteryLevel: 15,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    connectionType: 'bluetooth',
    dataQuality: 'good',
    firmwareVersion: '4.5.1.1',
    supportedMetrics: [
      { type: 'heart_rate', enabled: true, frequency: 'continuous', accuracy: 93, lastReading: new Date() },
      { type: 'steps', enabled: true, frequency: 'continuous', accuracy: 97, lastReading: new Date() },
      { type: 'stress', enabled: true, frequency: 'hourly', accuracy: 85, lastReading: new Date() },
      { type: 'temperature', enabled: false, frequency: 'hourly', accuracy: 88, lastReading: new Date() }
    ],
    permissions: [
      { type: 'health_data', granted: true, requiredFor: ['Monitoramento de estresse'] },
      { type: 'notifications', granted: false, requiredFor: ['Lembretes de medicação'] }
    ]
  },
  {
    id: '3',
    name: 'Fitbit Charge 5',
    brand: 'fitbit',
    model: 'Charge 5',
    type: 'fitness_tracker',
    patientId: 'p789',
    patientName: 'Carlos Lima',
    status: 'disconnected',
    batteryLevel: 42,
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    connectionType: 'bluetooth',
    dataQuality: 'fair',
    firmwareVersion: '1.165.1',
    supportedMetrics: [
      { type: 'heart_rate', enabled: true, frequency: 'continuous', accuracy: 90, lastReading: new Date() },
      { type: 'steps', enabled: true, frequency: 'continuous', accuracy: 96, lastReading: new Date() },
      { type: 'sleep', enabled: true, frequency: 'daily', accuracy: 82, lastReading: new Date() }
    ],
    permissions: [
      { type: 'health_data', granted: true, requiredFor: ['Análise de atividade física'] }
    ]
  },
  {
    id: '4',
    name: 'Oura Ring Gen3',
    brand: 'oura',
    model: 'Generation 3',
    type: 'smart_ring',
    patientId: 'p321',
    patientName: 'Ana Costa',
    status: 'connected',
    batteryLevel: 65,
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    connectionType: 'bluetooth',
    dataQuality: 'excellent',
    firmwareVersion: '3.2.5',
    supportedMetrics: [
      { type: 'heart_rate', enabled: true, frequency: 'continuous', accuracy: 94, lastReading: new Date() },
      { type: 'sleep', enabled: true, frequency: 'daily', accuracy: 93, lastReading: new Date() },
      { type: 'temperature', enabled: true, frequency: 'continuous', accuracy: 89, lastReading: new Date() },
      { type: 'stress', enabled: true, frequency: 'continuous', accuracy: 87, lastReading: new Date() }
    ],
    permissions: [
      { type: 'health_data', granted: true, requiredFor: ['Análise avançada do sono', 'Monitoramento de recuperação'] }
    ]
  }
];

const mockHealthData: HealthData[] = [
  {
    id: '1',
    deviceId: '1',
    patientId: 'p123',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    type: 'heart_rate',
    value: 72,
    unit: 'bpm',
    context: { activity: 'resting' },
    quality: 'high',
    validated: true
  },
  {
    id: '2',
    deviceId: '1',
    patientId: 'p123',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    type: 'steps',
    value: 8543,
    unit: 'steps',
    context: { activity: 'walking' },
    quality: 'high',
    validated: true
  },
  {
    id: '3',
    deviceId: '4',
    patientId: 'p321',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'sleep',
    value: 7.5,
    unit: 'hours',
    context: { activity: 'sleeping' },
    quality: 'high',
    validated: true
  }
];

const mockInsights: DataInsight[] = [
  {
    id: '1',
    patientId: 'p123',
    type: 'trend',
    title: 'Melhoria na Frequência Cardíaca em Repouso',
    description: 'Sua frequência cardíaca em repouso diminuiu 5 bpm nas últimas 2 semanas, indicando melhoria na condição cardiovascular.',
    severity: 'info',
    actionRequired: false,
    generatedAt: new Date(),
    relatedMetrics: ['heart_rate'],
    confidence: 0.92
  },
  {
    id: '2',
    patientId: 'p456',
    type: 'anomaly',
    title: 'Pico de Estresse Detectado',
    description: 'Níveis elevados de estresse foram detectados ontem entre 14h-16h. Considere técnicas de relaxamento.',
    severity: 'warning',
    actionRequired: true,
    generatedAt: new Date(),
    relatedMetrics: ['stress', 'heart_rate'],
    confidence: 0.85
  },
  {
    id: '3',
    patientId: 'p321',
    type: 'achievement',
    title: 'Meta de Sono Alcançada',
    description: 'Parabéns! Você manteve 7+ horas de sono por 7 dias consecutivos.',
    severity: 'info',
    actionRequired: false,
    generatedAt: new Date(),
    relatedMetrics: ['sleep'],
    confidence: 1.0
  }
];

export default function WearableConnector() {
  const [activeTab, setActiveTab] = useState<'devices' | 'data' | 'insights' | 'settings'>('devices');
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'syncing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low_battery':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'disconnected':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'apple': return '🍎';
      case 'samsung': return '📱';
      case 'fitbit': return '⌚';
      case 'garmin': return '🏃';
      case 'xiaomi': return '📟';
      case 'polar': return '❄️';
      case 'withings': return '⚖️';
      case 'oura': return '💍';
      default: return '⌚';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'heart_rate': return <Heart className="w-4 h-4" />;
      case 'steps': return <Activity className="w-4 h-4" />;
      case 'sleep': return '😴';
      case 'calories': return '🔥';
      case 'distance': return '📏';
      case 'stress': return '🧠';
      case 'oxygen': return '🫁';
      case 'temperature': return '🌡️';
      case 'blood_pressure': return '🩺';
      case 'weight': return '⚖️';
      case 'glucose': return '🍭';
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const DevicesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dispositivos Conectados
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Bluetooth className="w-4 h-4 mr-2" />
          Conectar Dispositivo
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockDevices.map(device => (
          <Card key={device.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getBrandIcon(device.brand)}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{device.name}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-400">{device.patientName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                  {device.status}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`} />
                  <span className="text-sm text-gray-600 dark:text-dark-400">Bateria</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {device.batteryLevel}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {device.connectionType === 'bluetooth' && <Bluetooth className="w-4 h-4 text-blue-500" />}
                  {device.connectionType === 'wifi' && <Wifi className="w-4 h-4 text-green-500" />}
                  {device.connectionType === 'cellular' && <Smartphone className="w-4 h-4 text-purple-500" />}
                  <span className="text-sm text-gray-600 dark:text-dark-400">Conectado via</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {device.connectionType}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400 mb-2">
                  Métricas Ativas ({device.supportedMetrics.filter(m => m.enabled).length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {device.supportedMetrics.filter(m => m.enabled).map(metric => (
                    <div key={metric.type} className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                      {getMetricIcon(metric.type)}
                      <span className="capitalize">{metric.type.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-dark-400">
                Última sincronização: {device.lastSync.toLocaleString('pt-BR')}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDevice(device)}>
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const DataTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dados de Saúde Coletados
        </h2>
        <div className="flex gap-2">
          <Button variant="outline">
            Exportar Dados
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            Sincronizar Tudo
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Frequência Cardíaca</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400">Última leitura</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              72 <span className="text-lg font-normal text-gray-500">bpm</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-400">
              Em repouso • Há 1 min
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Passos</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400">Hoje</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              8,543
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              +12% vs ontem
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">😴</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Sono</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400">Última noite</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              7h 30m
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Qualidade: Boa
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Histórico de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHealthData.map(data => (
              <div key={data.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded">
                <div className="flex items-center gap-3">
                  {getMetricIcon(data.type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {data.type.replace('_', ' ')} - {data.value} {data.unit}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      {data.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.quality === 'high' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : data.quality === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {data.quality}
                  </span>
                  {data.validated && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Insights e Análises
        </h2>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          <TrendingUp className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      <div className="space-y-4">
        {mockInsights.map(insight => (
          <Card key={insight.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {insight.type === 'trend' && <TrendingUp className="w-6 h-6 text-blue-500 mt-1" />}
                  {insight.type === 'anomaly' && <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />}
                  {insight.type === 'achievement' && <span className="text-2xl mt-1">🎉</span>}
                  {insight.type === 'recommendation' && <span className="text-2xl mt-1">💡</span>}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <p className="text-gray-600 dark:text-dark-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.severity === 'critical' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : insight.severity === 'warning'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {insight.severity}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {insight.relatedMetrics.map(metric => (
                    <span key={metric} className="px-2 py-1 bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-300 text-xs rounded">
                      {metric.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
                  <span>Confiança: {Math.round(insight.confidence * 100)}%</span>
                  <span>•</span>
                  <span>{insight.generatedAt.toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {insight.actionRequired && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
                    ⚠️ Ação recomendada: Considere consultar um profissional de saúde
                  </p>
                </div>
              )}
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
            <Watch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conectores Wearables
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Integração com dispositivos vestíveis de saúde
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Watch className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Dispositivos Ativos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockDevices.filter(d => d.status === 'connected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Leituras Hoje</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Insights Gerados</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockInsights.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Alertas Pendentes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockInsights.filter(i => i.actionRequired).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'devices', label: 'Dispositivos', icon: Watch },
          { id: 'data', label: 'Dados', icon: Activity },
          { id: 'insights', label: 'Insights', icon: TrendingUp },
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
      {activeTab === 'devices' && <DevicesTab />}
      {activeTab === 'data' && <DataTab />}
      {activeTab === 'insights' && <InsightsTab />}
      {activeTab === 'settings' && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Configurações de Integração
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Configurações avançadas em desenvolvimento...
          </p>
        </div>
      )}

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getBrandIcon(selectedDevice.brand)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedDevice.name}
                  </h3>
                  <p className="text-gray-600 dark:text-dark-400">
                    {selectedDevice.patientName}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedDevice(null)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Métricas Suportadas
                  </h4>
                  <div className="space-y-3">
                    {selectedDevice.supportedMetrics.map(metric => (
                      <div key={metric.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded">
                        <div className="flex items-center gap-3">
                          {getMetricIcon(metric.type)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {metric.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-dark-400">
                              {metric.frequency} • {metric.accuracy}% precisão
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            metric.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {metric.enabled ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Permissões
                  </h4>
                  <div className="space-y-2">
                    {selectedDevice.permissions.map(permission => (
                      <div key={permission.type} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {permission.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          permission.granted ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {permission.granted ? 'Concedida' : 'Negada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}