import React, { useState } from 'react';
import { FlaskConical, Download, Upload, CheckCircle, Clock, AlertCircle, Search, Filter, Calendar, User, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  examType: string;
  examCode: string;
  requestDate: Date;
  collectionDate?: Date;
  resultDate?: Date;
  status: 'solicitado' | 'coletado' | 'processando' | 'concluido' | 'cancelado';
  laboratory: string;
  results: LabResultItem[];
  observations?: string;
  referenceValues?: string;
  clinicalData?: {
    symptoms: string[];
    medications: string[];
    clinicalHistory: string;
  };
}

interface LabResultItem {
  id: string;
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'alto' | 'baixo' | 'critico';
  flag?: string;
}

interface LabConnection {
  id: string;
  name: string;
  type: 'fleury' | 'dasa' | 'hermes_pardini' | 'sabin' | 'db' | 'custom';
  status: 'ativo' | 'inativo' | 'erro' | 'testando';
  apiUrl: string;
  lastSync: Date;
  totalExams: number;
  pendingResults: number;
  authMethod: 'api_key' | 'oauth2' | 'certificate';
  supportedExams: string[];
}

interface ExamScheduling {
  id: string;
  patientId: string;
  patientName: string;
  examType: string;
  scheduledDate: Date;
  location: string;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  instructions?: string;
  requirements?: string[];
  laboratory: string;
}

const mockConnections: LabConnection[] = [
  {
    id: '1',
    name: 'Fleury Medicina e Saúde',
    type: 'fleury',
    status: 'ativo',
    apiUrl: 'https://api.fleury.com.br/v2',
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    totalExams: 2543,
    pendingResults: 12,
    authMethod: 'api_key',
    supportedExams: ['Hemograma', 'Glicemia', 'Colesterol', 'TSH', 'PCR', 'Ureia', 'Creatinina']
  },
  {
    id: '2',
    name: 'DASA - Diagnósticos da América',
    type: 'dasa',
    status: 'ativo',
    apiUrl: 'https://api.dasa.com.br/lab/v1',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    totalExams: 1876,
    pendingResults: 8,
    authMethod: 'oauth2',
    supportedExams: ['Hemograma', 'Lipidograma', 'Função Hepática', 'Função Renal', 'Hormônios']
  },
  {
    id: '3',
    name: 'Hermes Pardini',
    type: 'hermes_pardini',
    status: 'testando',
    apiUrl: 'https://api.hermespardini.com.br/v3',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalExams: 567,
    pendingResults: 3,
    authMethod: 'certificate',
    supportedExams: ['Genética', 'Biologia Molecular', 'Imunologia', 'Microbiologia']
  },
  {
    id: '4',
    name: 'Grupo Sabin',
    type: 'sabin',
    status: 'inativo',
    apiUrl: 'https://api.sabin.com.br/api/v2',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalExams: 0,
    pendingResults: 0,
    authMethod: 'api_key',
    supportedExams: ['Análises Clínicas', 'Patologia', 'Citologia', 'Imagem']
  }
];

const mockResults: LabResult[] = [
  {
    id: '1',
    patientId: 'p123',
    patientName: 'João Silva Santos',
    examType: 'Hemograma Completo',
    examCode: 'HEM001',
    requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    collectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    resultDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'concluido',
    laboratory: 'Fleury',
    observations: 'Paciente em jejum de 12 horas',
    results: [
      {
        id: '1',
        parameter: 'Hemoglobina',
        value: '14.2',
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5',
        status: 'normal'
      },
      {
        id: '2',
        parameter: 'Hematócrito',
        value: '42.5',
        unit: '%',
        referenceRange: '36.0 - 46.0',
        status: 'normal'
      },
      {
        id: '3',
        parameter: 'Leucócitos',
        value: '11.2',
        unit: '10³/μL',
        referenceRange: '4.0 - 10.0',
        status: 'alto',
        flag: 'Possível processo infeccioso'
      }
    ],
    clinicalData: {
      symptoms: ['Febre', 'Dor de cabeça'],
      medications: ['Paracetamol 750mg'],
      clinicalHistory: 'Paciente com quadro gripal há 3 dias'
    }
  },
  {
    id: '2',
    patientId: 'p456',
    patientName: 'Maria Oliveira',
    examType: 'Glicemia de Jejum',
    examCode: 'GLI001',
    requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    collectionDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
    status: 'processando',
    laboratory: 'DASA',
    results: []
  },
  {
    id: '3',
    patientId: 'p789',
    patientName: 'Carlos Lima',
    examType: 'Perfil Lipídico',
    examCode: 'LIP001',
    requestDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    collectionDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
    resultDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'concluido',
    laboratory: 'DASA',
    results: [
      {
        id: '4',
        parameter: 'Colesterol Total',
        value: '240',
        unit: 'mg/dL',
        referenceRange: '< 200',
        status: 'alto',
        flag: 'Risco cardiovascular elevado'
      },
      {
        id: '5',
        parameter: 'LDL',
        value: '165',
        unit: 'mg/dL',
        referenceRange: '< 130',
        status: 'alto'
      },
      {
        id: '6',
        parameter: 'HDL',
        value: '38',
        unit: 'mg/dL',
        referenceRange: '> 40',
        status: 'baixo'
      }
    ]
  }
];

const mockSchedulings: ExamScheduling[] = [
  {
    id: '1',
    patientId: 'p123',
    patientName: 'João Silva Santos',
    examType: 'Ressonância Magnética - Joelho',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: 'Fleury - Unidade Paulista',
    status: 'agendado',
    laboratory: 'Fleury',
    requirements: ['Jejum 12 horas', 'Retirar objetos metálicos'],
    instructions: 'Comparecer 30 minutos antes do horário agendado'
  },
  {
    id: '2',
    patientId: 'p456',
    patientName: 'Maria Oliveira',
    examType: 'Ultrassom Abdominal',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    location: 'DASA - Centro',
    status: 'confirmado',
    laboratory: 'DASA',
    requirements: ['Jejum 8 horas', 'Beber 1L água 1h antes'],
    instructions: 'Trazer exames anteriores se houver'
  }
];

export default function LaboratoryConnector() {
  const [activeTab, setActiveTab] = useState<'results' | 'scheduling' | 'connections' | 'integration'>('results');
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labFilter, setLabFilter] = useState<string>('all');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'ativo':
      case 'confirmado':
      case 'realizado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processando':
      case 'testando':
      case 'agendado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'coletado':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'solicitado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelado':
      case 'erro':
      case 'inativo':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'alto':
      case 'baixo':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critico':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLabIcon = (type: string) => {
    switch (type) {
      case 'fleury':
        return '🔬';
      case 'dasa':
        return '🧪';
      case 'hermes_pardini':
        return '🧬';
      case 'sabin':
        return '⚗️';
      case 'db':
        return '📋';
      default:
        return '🏥';
    }
  };

  const filteredResults = mockResults.filter(result => {
    const matchesSearch = !searchQuery || 
      result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.examCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    const matchesLab = labFilter === 'all' || result.laboratory === labFilter;
    
    return matchesSearch && matchesStatus && matchesLab;
  });

  const ResultsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, exame ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os status</option>
              <option value="solicitado">Solicitado</option>
              <option value="coletado">Coletado</option>
              <option value="processando">Processando</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
            
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os labs</option>
              <option value="Fleury">Fleury</option>
              <option value="DASA">DASA</option>
              <option value="Hermes Pardini">Hermes Pardini</option>
              <option value="Sabin">Sabin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map(result => (
          <Card key={result.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {result.examType}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {result.patientName}
                      </span>
                      <span>{result.examCode}</span>
                      <span>{result.laboratory}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-dark-400">Solicitado</span>
                    <span className="font-medium">{formatDate(result.requestDate)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                
                {result.collectionDate && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-dark-400">Coletado</span>
                      <span className="font-medium">{formatDate(result.collectionDate)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mt-1">
                      <div className="bg-yellow-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                )}
                
                {result.resultDate && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-dark-400">Resultado</span>
                      <span className="font-medium">{formatDate(result.resultDate)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              {result.results.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Resultados ({result.results.length} parâmetros)
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {result.results.slice(0, 3).map(item => (
                      <div key={item.id} className="bg-gray-50 dark:bg-dark-700 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.parameter}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getResultStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">{item.value} {item.unit}</span>
                          <span className="text-gray-600 dark:text-dark-400 ml-2">
                            (Ref: {item.referenceRange})
                          </span>
                        </div>
                        {item.flag && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            {item.flag}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {result.results.length > 3 && (
                    <p className="text-sm text-gray-600 dark:text-dark-400 mt-2">
                      +{result.results.length - 3} parâmetros adicionais
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                  <FileText className="w-4 h-4 mr-1" />
                  Ver Completo
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Baixar PDF
                </Button>
                {result.status === 'concluido' && (
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-1" />
                    Enviar ao Paciente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const SchedulingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Agendamentos de Exames
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Calendar className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="space-y-4">
        {mockSchedulings.map(scheduling => (
          <Card key={scheduling.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {scheduling.examType}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-dark-400 space-y-1 mt-1">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {scheduling.patientName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(scheduling.scheduledDate)}
                      </div>
                      <div>{scheduling.location}</div>
                    </div>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scheduling.status)}`}>
                  {scheduling.status}
                </span>
              </div>

              {/* Requirements and Instructions */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {scheduling.requirements && scheduling.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Pré-requisitos:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-1">
                      {scheduling.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {scheduling.instructions && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Instruções:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-dark-400">
                      {scheduling.instructions}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Reagendar
                </Button>
                <Button variant="outline" size="sm">
                  Confirmar
                </Button>
                <Button variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ConnectionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Conexões com Laboratórios
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Nova Conexão
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mockConnections.map(connection => (
          <Card key={connection.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{getLabIcon(connection.type)}</span>
                {connection.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                    {connection.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-dark-400">Total Exames</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {connection.totalExams.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-dark-400">Pendentes</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {connection.pendingResults}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600 dark:text-dark-400">Última Sincronização</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(connection.lastSync)}
                  </p>
                </div>

                {/* Supported Exams */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Exames suportados:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {connection.supportedExams.slice(0, 3).map(exam => (
                      <span key={exam} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                        {exam}
                      </span>
                    ))}
                    {connection.supportedExams.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-dark-400">
                        +{connection.supportedExams.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Activity className="w-4 h-4 mr-1" />
                    Testar
                  </Button>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
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
            <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conectores de Laboratórios
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Integração com sistemas de laboratórios clínicos
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
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Exames Concluídos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Em Processamento</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Agendamentos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">15</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Labs Conectados</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockConnections.filter(c => c.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'results', label: 'Resultados', icon: FileText },
          { id: 'scheduling', label: 'Agendamentos', icon: Calendar },
          { id: 'connections', label: 'Conexões', icon: Activity },
          { id: 'integration', label: 'Integração', icon: FlaskConical }
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
      {activeTab === 'results' && <ResultsTab />}
      {activeTab === 'scheduling' && <SchedulingTab />}
      {activeTab === 'connections' && <ConnectionsTab />}
      {activeTab === 'integration' && (
        <div className="text-center py-12">
          <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Configurações de Integração
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Configurações avançadas de integração em desenvolvimento...
          </p>
        </div>
      )}

      {/* Result Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedResult.examType}
                </h3>
                <p className="text-gray-600 dark:text-dark-400">
                  {selectedResult.patientName} • {selectedResult.examCode}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedResult(null)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              {selectedResult.results.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Resultados Detalhados
                  </h4>
                  <div className="space-y-3">
                    {selectedResult.results.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {item.parameter}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-dark-400">
                            Referência: {item.referenceRange}
                          </p>
                          {item.flag && (
                            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                              ⚠️ {item.flag}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.value} {item.unit}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getResultStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-dark-400">
                    Resultado ainda não disponível
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}