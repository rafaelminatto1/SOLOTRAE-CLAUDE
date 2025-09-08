import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Download,
  FileText,
  Table,
  BarChart3,
  Calendar,
  Filter,
  Settings,
  Mail,
  Share,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Plus,
  FileSpreadsheet,
  Image,
  Archive
} from 'lucide-react';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON';
  category: 'clinical' | 'financial' | 'operational' | 'custom';
  dataFields: string[];
  filters: ExportFilter[];
  schedule?: ExportSchedule;
  lastExport?: string;
  size?: string;
  recipients?: string[];
  status: 'active' | 'draft' | 'archived';
}

interface ExportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  label: string;
}

interface ExportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  active: boolean;
}

interface ExportHistory {
  id: string;
  templateName: string;
  format: string;
  generatedAt: string;
  generatedBy: string;
  size: string;
  downloadCount: number;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

const mockExportTemplates: ExportTemplate[] = [
  {
    id: 'exp-001',
    name: 'Relatório Mensal Completo',
    description: 'Relatório abrangente com todas as métricas do mês',
    format: 'PDF',
    category: 'clinical',
    dataFields: [
      'Evolução dos pacientes',
      'Métricas de satisfação',
      'Receita e custos',
      'KPIs operacionais'
    ],
    filters: [
      { field: 'date_range', operator: 'between', value: ['2024-01-01', '2024-01-31'], label: 'Período' },
      { field: 'status', operator: 'equals', value: 'active', label: 'Status' }
    ],
    schedule: {
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '08:00',
      active: true
    },
    lastExport: '2024-01-20T08:00:00Z',
    size: '2.4 MB',
    recipients: ['direcao@fisioflow.com', 'admin@fisioflow.com'],
    status: 'active'
  },
  {
    id: 'exp-002',
    name: 'Dados de Pacientes (Excel)',
    description: 'Exportação completa dos dados dos pacientes para análise',
    format: 'Excel',
    category: 'clinical',
    dataFields: [
      'Informações pessoais',
      'Histórico de tratamentos',
      'Evolução clínica',
      'Feedback e avaliações'
    ],
    filters: [
      { field: 'registration_date', operator: 'greater_than', value: '2024-01-01', label: 'Cadastrados após' },
      { field: 'status', operator: 'in', value: ['active', 'completed'], label: 'Status do tratamento' }
    ],
    lastExport: '2024-01-19T14:30:00Z',
    size: '1.8 MB',
    status: 'active'
  },
  {
    id: 'exp-003',
    name: 'Análise Financeira (CSV)',
    description: 'Dados financeiros detalhados para importação em sistemas externos',
    format: 'CSV',
    category: 'financial',
    dataFields: [
      'Transações',
      'Receitas por serviço',
      'Custos operacionais',
      'Margem de lucro'
    ],
    filters: [
      { field: 'transaction_date', operator: 'between', value: ['2024-01-01', '2024-01-31'], label: 'Período' }
    ],
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1,
      time: '07:00',
      active: true
    },
    lastExport: '2024-01-15T07:00:00Z',
    size: '856 KB',
    recipients: ['financeiro@fisioflow.com'],
    status: 'active'
  },
  {
    id: 'exp-004',
    name: 'Dashboard Executivo',
    description: 'Resumo executivo com KPIs principais',
    format: 'PDF',
    category: 'operational',
    dataFields: [
      'Métricas principais',
      'Comparativos mensais',
      'Alertas e recomendações',
      'Projeções'
    ],
    filters: [],
    lastExport: '2024-01-18T09:15:00Z',
    size: '1.2 MB',
    status: 'active'
  },
  {
    id: 'exp-005',
    name: 'Relatório Personalizado',
    description: 'Template personalizado em construção',
    format: 'Excel',
    category: 'custom',
    dataFields: [
      'Campos selecionados',
      'Filtros específicos'
    ],
    filters: [],
    status: 'draft'
  }
];

const mockExportHistory: ExportHistory[] = [
  {
    id: 'hist-001',
    templateName: 'Relatório Mensal Completo',
    format: 'PDF',
    generatedAt: '2024-01-20T08:00:00Z',
    generatedBy: 'Sistema Automático',
    size: '2.4 MB',
    downloadCount: 3,
    status: 'completed',
    downloadUrl: '/downloads/relatorio-mensal-jan2024.pdf'
  },
  {
    id: 'hist-002',
    templateName: 'Dados de Pacientes (Excel)',
    format: 'Excel',
    generatedAt: '2024-01-19T14:30:00Z',
    generatedBy: 'Ana Silva',
    size: '1.8 MB',
    downloadCount: 1,
    status: 'completed',
    downloadUrl: '/downloads/pacientes-jan2024.xlsx'
  },
  {
    id: 'hist-003',
    templateName: 'Análise Financeira (CSV)',
    format: 'CSV',
    generatedAt: '2024-01-15T07:00:00Z',
    generatedBy: 'Sistema Automático',
    size: '856 KB',
    downloadCount: 2,
    status: 'completed',
    downloadUrl: '/downloads/financeiro-semana2-jan2024.csv'
  },
  {
    id: 'hist-004',
    templateName: 'Dashboard Executivo',
    format: 'PDF',
    generatedAt: '2024-01-18T09:15:00Z',
    generatedBy: 'Carlos Santos',
    size: '1.2 MB',
    downloadCount: 5,
    status: 'completed',
    downloadUrl: '/downloads/dashboard-executivo-jan2024.pdf'
  },
  {
    id: 'hist-005',
    templateName: 'Relatório Mensal Completo',
    format: 'PDF',
    generatedAt: '2024-01-21T10:30:00Z',
    generatedBy: 'Maria Costa',
    size: '0 MB',
    downloadCount: 0,
    status: 'processing'
  }
];

const getFormatIcon = (format: string) => {
  const icons = {
    PDF: FileText,
    Excel: FileSpreadsheet,
    CSV: Table,
    JSON: Archive
  };
  return icons[format as keyof typeof icons] || FileText;
};

const getFormatColor = (format: string) => {
  const colors = {
    PDF: 'text-red-600 bg-red-100',
    Excel: 'text-green-600 bg-green-100',
    CSV: 'text-blue-600 bg-blue-100',
    JSON: 'text-purple-600 bg-purple-100'
  };
  return colors[format as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

const getCategoryColor = (category: string) => {
  const colors = {
    clinical: 'text-blue-600 bg-blue-100',
    financial: 'text-green-600 bg-green-100',
    operational: 'text-purple-600 bg-purple-100',
    custom: 'text-orange-600 bg-orange-100'
  };
  return colors[category as keyof typeof colors];
};

const getStatusColor = (status: string) => {
  const colors = {
    active: 'text-green-600 bg-green-100',
    draft: 'text-yellow-600 bg-yellow-100',
    archived: 'text-gray-600 bg-gray-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    processing: 'text-blue-600 bg-blue-100'
  };
  return colors[status as keyof typeof colors];
};

export default function ExportManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates = mockExportTemplates.filter(template =>
    filterCategory === 'all' || template.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciador de Exportações
        </h2>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 pt-4">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Agendamentos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="clinical">Clínicos</option>
                  <option value="financial">Financeiros</option>
                  <option value="operational">Operacionais</option>
                  <option value="custom">Personalizados</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros Avançados
                </Button>
                
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurações
                </Button>
              </div>

              {/* Lista de Templates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => {
                  const FormatIcon = getFormatIcon(template.format);
                  
                  return (
                    <AnimatedContainer key={template.id} animation="slide-up" delay={parseInt(template.id.split('-')[1]) * 50}>
                      <Card hover className="group cursor-pointer" onClick={() => setSelectedTemplate(template)}>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getFormatColor(template.format)}`}>
                                <FormatIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                                  {template.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {template.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                                {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                                {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Campos incluídos:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {template.dataFields.slice(0, 3).map((field, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                  {field}
                                </span>
                              ))}
                              {template.dataFields.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                  +{template.dataFields.length - 3} mais
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Formato:</span>
                              <div className="font-medium text-gray-900 dark:text-white">{template.format}</div>
                            </div>
                            
                            {template.lastExport && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Último export:</span>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {new Date(template.lastExport).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            )}
                            
                            {template.size && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Tamanho típico:</span>
                                <div className="font-medium text-gray-900 dark:text-white">{template.size}</div>
                              </div>
                            )}
                            
                            {template.schedule && (
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Agendamento:</span>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {template.schedule.frequency === 'daily' ? 'Diário' :
                                   template.schedule.frequency === 'weekly' ? 'Semanal' :
                                   template.schedule.frequency === 'monthly' ? 'Mensal' : 'Trimestral'}
                                  {template.schedule.active && (
                                    <span className="ml-1 text-green-600">●</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-1" />
                              Exportar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            {template.recipients && (
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </AnimatedContainer>
                  );
                })}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Histórico de Exportações
                </h3>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Antigos
                </Button>
              </div>
              
              {mockExportHistory.map((item) => {
                const FormatIcon = getFormatIcon(item.format);
                
                return (
                  <AnimatedContainer key={item.id} animation="slide-right" delay={parseInt(item.id.split('-')[1]) * 50}>
                    <Card hover>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getFormatColor(item.format)}`}>
                              <FormatIcon className="h-5 w-5" />
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {item.templateName}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                  {new Date(item.generatedAt).toLocaleString('pt-BR')}
                                </span>
                                <span>por {item.generatedBy}</span>
                                <span>{item.size}</span>
                                {item.downloadCount > 0 && (
                                  <span>{item.downloadCount} download{item.downloadCount > 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status === 'completed' ? 'Concluído' :
                               item.status === 'failed' ? 'Falhou' : 'Processando'}
                            </div>
                            
                            {item.status === 'completed' && (
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            
                            {item.status === 'processing' && (
                              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                            )}
                            
                            {item.status === 'failed' && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AnimatedContainer>
                );
              })}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Exportações Agendadas
                </h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
              
              <div className="grid gap-4">
                {mockExportTemplates
                  .filter(template => template.schedule?.active)
                  .map((template) => (
                    <AnimatedContainer key={template.id} animation="slide-up" delay={parseInt(template.id.split('-')[1]) * 100}>
                      <Card>
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getFormatColor(template.format)}`}>
                                {React.createElement(getFormatIcon(template.format), { className: 'h-6 w-6' })}
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {template.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {template.schedule?.frequency === 'daily' ? 'Execução diária' :
                                   template.schedule?.frequency === 'weekly' ? 'Execução semanal' :
                                   template.schedule?.frequency === 'monthly' ? 'Execução mensal' : 'Execução trimestral'}
                                  {' às '}{template.schedule?.time}
                                </p>
                                {template.recipients && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Enviado para: {template.recipients.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Próxima execução</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {template.schedule?.frequency === 'monthly' ? '01/02/2024' :
                                   template.schedule?.frequency === 'weekly' ? '22/01/2024' : 'Hoje'}
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </AnimatedContainer>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}