import React, { useState } from 'react';
import { Database, User, FileText, Activity, Stethoscope, Clock, CheckCircle, AlertTriangle, Search, Download, Upload, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface FHIRResource {
  id: string;
  resourceType: 'Patient' | 'Observation' | 'DiagnosticReport' | 'MedicationRequest' | 'Encounter' | 'Practitioner';
  status: 'active' | 'inactive' | 'unknown';
  lastUpdated: Date;
  data: any;
  source: string;
}

interface FHIRConnection {
  id: string;
  name: string;
  baseUrl: string;
  version: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  resourceCount: number;
  authMethod: 'oauth2' | 'basic' | 'bearer';
  capabilities: string[];
}

interface FHIRSync {
  id: string;
  resourceType: string;
  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
  details: string;
  errorMessage?: string;
}

const mockConnections: FHIRConnection[] = [
  {
    id: '1',
    name: 'Hospital São Lucas - FHIR Server',
    baseUrl: 'https://fhir.hospitalsaolucas.com.br/R4',
    version: 'R4',
    status: 'connected',
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    resourceCount: 15420,
    authMethod: 'oauth2',
    capabilities: ['Patient', 'Observation', 'DiagnosticReport', 'Encounter', 'Practitioner']
  },
  {
    id: '2',
    name: 'Rede D\'Or - FHIR Gateway',
    baseUrl: 'https://api.redor.com.br/fhir/R4',
    version: 'R4',
    status: 'syncing',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    resourceCount: 8932,
    authMethod: 'bearer',
    capabilities: ['Patient', 'Observation', 'MedicationRequest']
  },
  {
    id: '3',
    name: 'Einstein - Interoperabilidade',
    baseUrl: 'https://fhir.einstein.br/api/v4',
    version: 'R4',
    status: 'error',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resourceCount: 0,
    authMethod: 'oauth2',
    capabilities: ['Patient', 'DiagnosticReport', 'Practitioner']
  }
];

const mockResources: FHIRResource[] = [
  {
    id: '1',
    resourceType: 'Patient',
    status: 'active',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
    source: 'Hospital São Lucas',
    data: {
      name: 'João Silva Santos',
      birthDate: '1985-03-15',
      gender: 'male',
      phone: '+55 11 99999-9999',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      identifier: [
        { system: 'cpf', value: '123.456.789-00' },
        { system: 'hospital-id', value: 'HSL001234' }
      ]
    }
  },
  {
    id: '2',
    resourceType: 'Observation',
    status: 'active',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    source: 'Hospital São Lucas',
    data: {
      code: { text: 'Pressão Arterial' },
      valueQuantity: { value: 120, unit: 'mmHg' },
      effectiveDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      subject: { reference: 'Patient/1' }
    }
  },
  {
    id: '3',
    resourceType: 'DiagnosticReport',
    status: 'active',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
    source: 'Rede D\'Or',
    data: {
      code: { text: 'Raio-X Coluna Lombar' },
      status: 'final',
      effectiveDateTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      conclusion: 'Discopatia degenerativa L4-L5',
      subject: { reference: 'Patient/1' }
    }
  }
];

const mockSyncHistory: FHIRSync[] = [
  {
    id: '1',
    resourceType: 'Patient',
    action: 'update',
    status: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    details: 'Atualizado dados demográficos do paciente João Silva'
  },
  {
    id: '2',
    resourceType: 'Observation',
    action: 'create',
    status: 'success',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    details: 'Nova observação de pressão arterial registrada'
  },
  {
    id: '3',
    resourceType: 'DiagnosticReport',
    action: 'create',
    status: 'error',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    details: 'Tentativa de criar relatório diagnóstico',
    errorMessage: 'Formato de data inválido no campo effectiveDateTime'
  }
];

export default function HL7FHIRConnector() {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'sync' | 'mapping'>('overview');
  const [selectedResource, setSelectedResource] = useState<FHIRResource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'Patient':
        return <User className="w-5 h-5" />;
      case 'Observation':
        return <Activity className="w-5 h-5" />;
      case 'DiagnosticReport':
        return <FileText className="w-5 h-5" />;
      case 'MedicationRequest':
        return <Stethoscope className="w-5 h-5" />;
      case 'Encounter':
        return <Clock className="w-5 h-5" />;
      case 'Practitioner':
        return <User className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'syncing':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.data.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.data.code?.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = resourceTypeFilter === 'all' || resource.resourceType === resourceTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Connection Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {mockConnections.map(connection => (
          <Card key={connection.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                {connection.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                    {connection.status === 'syncing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin inline" />}
                    {connection.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Versão FHIR</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection.version}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Recursos</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connection.resourceCount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Última Sync</span>
                  <span className="text-sm text-gray-500 dark:text-dark-400">
                    {formatDateTime(connection.lastSync)}
                  </span>
                </div>

                {/* Capabilities */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-dark-400 mb-2">Recursos suportados:</p>
                  <div className="flex flex-wrap gap-1">
                    {connection.capabilities.map(capability => (
                      <span key={capability} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FHIR Capabilities */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Capacidades HL7 FHIR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recursos Suportados</h4>
              <div className="space-y-2">
                {[
                  { type: 'Patient', description: 'Dados demográficos dos pacientes' },
                  { type: 'Observation', description: 'Observações clínicas e sinais vitais' },
                  { type: 'DiagnosticReport', description: 'Laudos e resultados de exames' },
                  { type: 'MedicationRequest', description: 'Prescrições médicas' },
                  { type: 'Encounter', description: 'Encontros e consultas' },
                  { type: 'Practitioner', description: 'Dados dos profissionais' }
                ].map(resource => (
                  <div key={resource.type} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-dark-700 rounded">
                    {getResourceIcon(resource.type)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {resource.type}
                      </p>
                      <p className="text-gray-600 dark:text-dark-400 text-xs">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Operações Disponíveis</h4>
              <div className="space-y-2">
                {[
                  { operation: 'READ', description: 'Consultar recursos por ID' },
                  { operation: 'SEARCH', description: 'Buscar recursos com filtros' },
                  { operation: 'CREATE', description: 'Criar novos recursos' },
                  { operation: 'UPDATE', description: 'Atualizar recursos existentes' },
                  { operation: 'DELETE', description: 'Remover recursos' },
                  { operation: 'BATCH', description: 'Operações em lote' }
                ].map(op => (
                  <div key={op.operation} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-dark-700 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {op.operation}
                      </p>
                      <p className="text-gray-600 dark:text-dark-400 text-xs">
                        {op.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ResourcesTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="Patient">Patient</option>
              <option value="Observation">Observation</option>
              <option value="DiagnosticReport">DiagnosticReport</option>
              <option value="MedicationRequest">MedicationRequest</option>
              <option value="Encounter">Encounter</option>
              <option value="Practitioner">Practitioner</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    {getResourceIcon(resource.resourceType)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {resource.resourceType}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                        {resource.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      {resource.resourceType === 'Patient' && (
                        <>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {resource.data.name}
                          </p>
                          <p className="text-gray-600 dark:text-dark-400">
                            Nascimento: {resource.data.birthDate} • {resource.data.phone}
                          </p>
                          <p className="text-gray-600 dark:text-dark-400">
                            CPF: {resource.data.identifier.find((id: any) => id.system === 'cpf')?.value}
                          </p>
                        </>
                      )}
                      
                      {resource.resourceType === 'Observation' && (
                        <>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {resource.data.code.text}
                          </p>
                          <p className="text-gray-600 dark:text-dark-400">
                            Valor: {resource.data.valueQuantity.value} {resource.data.valueQuantity.unit}
                          </p>
                        </>
                      )}
                      
                      {resource.resourceType === 'DiagnosticReport' && (
                        <>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {resource.data.code.text}
                          </p>
                          <p className="text-gray-600 dark:text-dark-400">
                            Conclusão: {resource.data.conclusion}
                          </p>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-dark-400">
                      <span>Origem: {resource.source}</span>
                      <span>Atualizado: {formatDateTime(resource.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedResource(resource)}>
                    Ver JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const SyncTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Histórico de Sincronização
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Nova Sincronização
        </Button>
      </div>

      <div className="space-y-4">
        {mockSyncHistory.map(sync => (
          <Card key={sync.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                    {getResourceIcon(sync.resourceType)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {sync.resourceType}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded uppercase">
                        {sync.action}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-dark-400 text-sm mb-2">
                      {sync.details}
                    </p>
                    
                    {sync.errorMessage && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-800 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{sync.errorMessage}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-dark-400 mt-2">
                      {formatDateTime(sync.timestamp)}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sync.status)}`}>
                  {sync.status === 'success' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                  {sync.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                  {sync.status}
                </span>
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
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conector HL7 FHIR
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Interoperabilidade com sistemas de saúde
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Database },
          { id: 'resources', label: 'Recursos', icon: FileText },
          { id: 'sync', label: 'Sincronização', icon: RefreshCw },
          { id: 'mapping', label: 'Mapeamento', icon: Activity }
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
      {activeTab === 'resources' && <ResourcesTab />}
      {activeTab === 'sync' && <SyncTab />}
      {activeTab === 'mapping' && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Mapeamento de Campos
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Configuração de mapeamento de campos FHIR em desenvolvimento...
          </p>
        </div>
      )}

      {/* Resource JSON Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedResource.resourceType} - JSON
              </h3>
              <Button variant="outline" onClick={() => setSelectedResource(null)}>
                ×
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-96">
              <pre className="bg-gray-50 dark:bg-dark-700 p-4 rounded text-sm text-gray-900 dark:text-white overflow-auto">
                {JSON.stringify(selectedResource.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}