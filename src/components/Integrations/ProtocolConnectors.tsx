import React, { useState } from 'react';
import { Network, Code, Database, Zap, CheckCircle, AlertTriangle, Settings, Monitor, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface ProtocolConnector {
  id: string;
  name: string;
  type: 'hl7' | 'fhir' | 'loinc' | 'snomed' | 'dicom' | 'ihe' | 'astm' | 'custom';
  version: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  endpoint: string;
  authType: 'basic' | 'oauth2' | 'certificate' | 'api_key' | 'saml';
  supportedOperations: string[];
  connectedSystems: ConnectedSystem[];
  performance: PerformanceMetrics;
  compliance: ComplianceStatus;
  lastSync: Date;
  configuration: ProtocolConfiguration;
}

interface ConnectedSystem {
  id: string;
  name: string;
  vendor: string;
  version: string;
  capabilities: string[];
  lastActivity: Date;
  status: 'online' | 'offline' | 'maintenance';
  messageCount: number;
  errorRate: number;
}

interface PerformanceMetrics {
  messagesPerHour: number;
  averageLatency: number;
  successRate: number;
  errorCount: number;
  bandwidth: number;
  uptime: number;
}

interface ComplianceStatus {
  standard: string;
  version: string;
  certificationLevel: 'full' | 'partial' | 'basic' | 'none';
  validationRules: ValidationRule[];
  auditLog: AuditLogEntry[];
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  passRate: number;
  lastCheck: Date;
}

interface AuditLogEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
  result: 'success' | 'failure' | 'warning';
}

interface ProtocolConfiguration {
  messageFormat: 'xml' | 'json' | 'edi' | 'pipe_delimited';
  encoding: 'utf8' | 'ascii' | 'base64';
  compression: 'none' | 'gzip' | 'deflate';
  encryption: 'none' | 'tls' | 'ssl';
  timeout: number;
  retryAttempts: number;
  batchSize: number;
  customFields: Record<string, any>;
}

interface MessageMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation: string;
  validation: string;
  required: boolean;
}

const mockConnectors: ProtocolConnector[] = [
  {
    id: '1',
    name: 'HL7 v2.5 Connector',
    type: 'hl7',
    version: '2.5.1',
    status: 'active',
    endpoint: 'mllp://lab.hospital.com:6661',
    authType: 'certificate',
    supportedOperations: ['ADT', 'ORM', 'ORU', 'ACK', 'QRY'],
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    connectedSystems: [
      {
        id: 's1',
        name: 'Fleury LIS',
        vendor: 'Fleury',
        version: '3.2.1',
        capabilities: ['ADT^A01', 'ORU^R01', 'ACK^A01'],
        lastActivity: new Date(Date.now() - 2 * 60 * 1000),
        status: 'online',
        messageCount: 1247,
        errorRate: 0.02
      },
      {
        id: 's2',
        name: 'DASA Integration Hub',
        vendor: 'DASA',
        version: '4.1.0',
        capabilities: ['ORM^O01', 'ORU^R01', 'QRY^A19'],
        lastActivity: new Date(Date.now() - 1 * 60 * 1000),
        status: 'online',
        messageCount: 892,
        errorRate: 0.01
      }
    ],
    performance: {
      messagesPerHour: 350,
      averageLatency: 120,
      successRate: 99.2,
      errorCount: 5,
      bandwidth: 1.2,
      uptime: 99.8
    },
    compliance: {
      standard: 'HL7 v2.5.1',
      version: '2.5.1',
      certificationLevel: 'full',
      validationRules: [
        {
          id: 'v1',
          name: 'Message Structure Validation',
          description: 'Valida estrutura de mensagens HL7',
          severity: 'error',
          passRate: 99.5,
          lastCheck: new Date()
        },
        {
          id: 'v2',
          name: 'Encoding Rules Check',
          description: 'Verifica regras de codificação',
          severity: 'warning',
          passRate: 97.8,
          lastCheck: new Date()
        }
      ],
      auditLog: []
    },
    configuration: {
      messageFormat: 'pipe_delimited',
      encoding: 'utf8',
      compression: 'none',
      encryption: 'tls',
      timeout: 30000,
      retryAttempts: 3,
      batchSize: 100,
      customFields: {
        sendingApplication: 'FisioFlow',
        sendingFacility: 'CLINIC001'
      }
    }
  },
  {
    id: '2',
    name: 'FHIR R4 Connector',
    type: 'fhir',
    version: '4.0.1',
    status: 'active',
    endpoint: 'https://fhir.hospital.com/R4/',
    authType: 'oauth2',
    supportedOperations: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    connectedSystems: [
      {
        id: 's3',
        name: 'Epic FHIR Server',
        vendor: 'Epic',
        version: 'R4',
        capabilities: ['Patient', 'Observation', 'DiagnosticReport', 'ServiceRequest'],
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        status: 'online',
        messageCount: 567,
        errorRate: 0.05
      }
    ],
    performance: {
      messagesPerHour: 180,
      averageLatency: 250,
      successRate: 98.5,
      errorCount: 12,
      bandwidth: 2.1,
      uptime: 99.5
    },
    compliance: {
      standard: 'FHIR R4',
      version: '4.0.1',
      certificationLevel: 'full',
      validationRules: [
        {
          id: 'v3',
          name: 'FHIR Resource Validation',
          description: 'Valida recursos FHIR contra schemas',
          severity: 'error',
          passRate: 98.2,
          lastCheck: new Date()
        }
      ],
      auditLog: []
    },
    configuration: {
      messageFormat: 'json',
      encoding: 'utf8',
      compression: 'gzip',
      encryption: 'tls',
      timeout: 60000,
      retryAttempts: 2,
      batchSize: 50,
      customFields: {
        clientId: 'fisioflow-app',
        scope: 'patient/*.read observation/*.read'
      }
    }
  },
  {
    id: '3',
    name: 'LOINC Terminology Service',
    type: 'loinc',
    version: '2.73',
    status: 'active',
    endpoint: 'https://loinc.org/ws/',
    authType: 'api_key',
    supportedOperations: ['lookup', 'validate', 'translate', 'search'],
    lastSync: new Date(Date.now() - 60 * 60 * 1000),
    connectedSystems: [
      {
        id: 's4',
        name: 'LOINC Database',
        vendor: 'Regenstrief Institute',
        version: '2.73',
        capabilities: ['Code lookup', 'Hierarchy navigation', 'Translation'],
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        status: 'online',
        messageCount: 234,
        errorRate: 0.001
      }
    ],
    performance: {
      messagesPerHour: 45,
      averageLatency: 80,
      successRate: 99.9,
      errorCount: 1,
      bandwidth: 0.3,
      uptime: 99.9
    },
    compliance: {
      standard: 'LOINC',
      version: '2.73',
      certificationLevel: 'full',
      validationRules: [
        {
          id: 'v4',
          name: 'LOINC Code Validation',
          description: 'Verifica códigos LOINC válidos',
          severity: 'error',
          passRate: 100,
          lastCheck: new Date()
        }
      ],
      auditLog: []
    },
    configuration: {
      messageFormat: 'json',
      encoding: 'utf8',
      compression: 'gzip',
      encryption: 'tls',
      timeout: 15000,
      retryAttempts: 2,
      batchSize: 20,
      customFields: {
        version: '2.73',
        language: 'pt-BR'
      }
    }
  }
];

const messageMappings: MessageMapping[] = [
  {
    id: '1',
    sourceField: 'OBX.3',
    targetField: 'Observation.code',
    transformation: 'LOINC_MAPPING',
    validation: 'LOINC_CODE_EXISTS',
    required: true
  },
  {
    id: '2',
    sourceField: 'OBX.5',
    targetField: 'Observation.valueQuantity.value',
    transformation: 'NUMERIC_CONVERSION',
    validation: 'NUMERIC_RANGE',
    required: true
  },
  {
    id: '3',
    sourceField: 'PID.3',
    targetField: 'Patient.identifier',
    transformation: 'IDENTIFIER_MAPPING',
    validation: 'IDENTIFIER_FORMAT',
    required: true
  }
];

export default function ProtocolConnectors() {
  const [selectedConnector, setSelectedConnector] = useState<ProtocolConnector>(mockConnectors[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'systems' | 'performance' | 'compliance' | 'mapping'>('overview');
  const [showConfiguration, setShowConfiguration] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'testing':
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'inactive':
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getProtocolIcon = (type: string) => {
    switch (type) {
      case 'hl7':
        return '📨';
      case 'fhir':
        return '🔗';
      case 'loinc':
        return '📋';
      case 'snomed':
        return '🏥';
      case 'dicom':
        return '🖼️';
      case 'ihe':
        return '🌐';
      case 'astm':
        return '⚗️';
      default:
        return '🔧';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Connector Details */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getProtocolIcon(selectedConnector.type)}</span>
              {selectedConnector.name}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedConnector.status)}`}>
              {selectedConnector.status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Informações Técnicas
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Protocolo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedConnector.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Versão:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedConnector.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Endpoint:</span>
                  <span className="font-mono text-xs text-gray-900 dark:text-white">{selectedConnector.endpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Autenticação:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedConnector.authType}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Operações Suportadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedConnector.supportedOperations.map(op => (
                  <span key={op} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                    {op}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfiguration(true)}>
              <Settings className="w-4 h-4 mr-1" />
              Configurar
            </Button>
            <Button variant="outline" size="sm">
              <Monitor className="w-4 h-4 mr-1" />
              Testar Conexão
            </Button>
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4 mr-1" />
              Ver Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Msg/Hora</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedConnector.performance.messagesPerHour}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Taxa Sucesso</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedConnector.performance.successRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Latência Média</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedConnector.performance.averageLatency}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Uptime</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedConnector.performance.uptime}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SystemsTab = () => (
    <div className="space-y-4">
      {selectedConnector.connectedSystems.map(system => (
        <Card key={system.id} className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {system.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-400">
                  {system.vendor} • Versão {system.version}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(system.status)}`}>
                {system.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Mensagens Processadas</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {system.messageCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Taxa de Erro</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {(system.errorRate * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Última Atividade</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {system.lastActivity.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Capacidades:
              </h4>
              <div className="flex flex-wrap gap-2">
                {system.capabilities.map(cap => (
                  <span key={cap} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const MappingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mapeamento de Campos
        </h3>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Novo Mapeamento
        </Button>
      </div>

      <div className="space-y-4">
        {messageMappings.map(mapping => (
          <Card key={mapping.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-dark-400">Origem</p>
                    <code className="text-sm font-mono bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded">
                      {mapping.sourceField}
                    </code>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-dark-400">Destino</p>
                    <code className="text-sm font-mono bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded">
                      {mapping.targetField}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mapping.required && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs rounded">
                      Obrigatório
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Transformação:
                  </p>
                  <code className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {mapping.transformation}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Validação:
                  </p>
                  <code className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {mapping.validation}
                  </code>
                </div>
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
            <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conectores de Protocolo
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Integração com protocolos padrão de saúde
            </p>
          </div>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Novo Conector
        </Button>
      </div>

      {/* Connector Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {mockConnectors.map(connector => (
          <Card 
            key={connector.id} 
            className={`border cursor-pointer transition-all ${
              selectedConnector.id === connector.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-dark-600'
            }`}
            onClick={() => setSelectedConnector(connector)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getProtocolIcon(connector.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {connector.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    {connector.type.toUpperCase()} {connector.version}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connector.status)}`}>
                  {connector.status}
                </span>
                <span className="text-xs text-gray-500 dark:text-dark-400">
                  {connector.connectedSystems.length} sistemas
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Monitor },
          { id: 'systems', label: 'Sistemas', icon: Database },
          { id: 'performance', label: 'Performance', icon: Zap },
          { id: 'compliance', label: 'Compliance', icon: CheckCircle },
          { id: 'mapping', label: 'Mapeamento', icon: Code }
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
      {activeTab === 'systems' && <SystemsTab />}
      {activeTab === 'mapping' && <MappingTab />}
      {activeTab === 'performance' && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Métricas de Performance
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Dashboard de performance em desenvolvimento...
          </p>
        </div>
      )}
      {activeTab === 'compliance' && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Auditoria e Compliance
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Relatórios de compliance em desenvolvimento...
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfiguration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuração do Conector
              </h3>
              <Button variant="outline" onClick={() => setShowConfiguration(false)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Endpoint
                  </label>
                  <input
                    type="text"
                    value={selectedConnector.endpoint}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={selectedConnector.configuration.timeout}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                      Tentativas
                    </label>
                    <input
                      type="number"
                      value={selectedConnector.configuration.retryAttempts}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Salvar
                  </Button>
                  <Button variant="outline">
                    Testar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}