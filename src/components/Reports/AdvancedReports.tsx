import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  PieChart,
  LineChart,
  Activity,
  Users,
  DollarSign,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings,
  RefreshCw,
  Share,
  Mail,
  Printer,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'financial' | 'operational' | 'patient' | 'performance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  format: ('PDF' | 'Excel' | 'CSV')[];
  lastGenerated?: string;
  nextScheduled?: string;
  automated: boolean;
  recipients?: string[];
  dataPoints: string[];
  estimatedTime: string;
}

interface ReportMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
  description: string;
  target?: number;
  alertThreshold?: number;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  parameters: {
    dateRange: { start: string; end: string };
    filters: string[];
    metrics: string[];
    groupBy: string;
    chartType: string;
  };
  lastRun?: string;
  status: 'draft' | 'active' | 'archived';
}

const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'rpt-001',
    name: 'Relatório Clínico Mensal',
    description: 'Análise completa de resultados clínicos e evolução dos pacientes',
    category: 'clinical',
    frequency: 'monthly',
    format: ['PDF', 'Excel'],
    lastGenerated: '2024-01-20',
    nextScheduled: '2024-02-01',
    automated: true,
    recipients: ['clinica@fisioflow.com', 'diretor@fisioflow.com'],
    dataPoints: [
      'Taxa de melhora dos pacientes',
      'Tempo médio de tratamento',
      'Satisfação dos pacientes',
      'Eficácia por tipo de tratamento'
    ],
    estimatedTime: '5-10 min'
  },
  {
    id: 'rpt-002',
    name: 'Performance Financeira',
    description: 'Análise detalhada de receitas, custos e lucratividade',
    category: 'financial',
    frequency: 'weekly',
    format: ['PDF', 'Excel', 'CSV'],
    lastGenerated: '2024-01-19',
    nextScheduled: '2024-01-26',
    automated: true,
    recipients: ['financeiro@fisioflow.com'],
    dataPoints: [
      'Receita total',
      'Custos operacionais',
      'Margem de lucro',
      'ROI por paciente',
      'Inadimplência'
    ],
    estimatedTime: '3-5 min'
  },
  {
    id: 'rpt-003',
    name: 'Eficiência Operacional',
    description: 'Métricas de produtividade e utilização de recursos',
    category: 'operational',
    frequency: 'weekly',
    format: ['PDF', 'Excel'],
    lastGenerated: '2024-01-18',
    nextScheduled: '2024-01-25',
    automated: false,
    dataPoints: [
      'Taxa de ocupação das salas',
      'Tempo médio por sessão',
      'Cancelamentos e reagendamentos',
      'Produtividade por fisioterapeuta'
    ],
    estimatedTime: '7-12 min'
  },
  {
    id: 'rpt-004',
    name: 'Análise de Pacientes',
    description: 'Demografia, comportamento e padrões dos pacientes',
    category: 'patient',
    frequency: 'monthly',
    format: ['PDF', 'Excel'],
    lastGenerated: '2024-01-15',
    nextScheduled: '2024-02-15',
    automated: true,
    recipients: ['marketing@fisioflow.com'],
    dataPoints: [
      'Demografia dos pacientes',
      'Origem dos pacientes',
      'Retenção e churn',
      'Lifetime Value (LTV)'
    ],
    estimatedTime: '8-15 min'
  },
  {
    id: 'rpt-005',
    name: 'KPIs de Performance',
    description: 'Indicadores chave de performance da clínica',
    category: 'performance',
    frequency: 'daily',
    format: ['PDF'],
    lastGenerated: '2024-01-20',
    nextScheduled: '2024-01-21',
    automated: true,
    recipients: ['direcao@fisioflow.com'],
    dataPoints: [
      'NPS (Net Promoter Score)',
      'Taxa de utilização',
      'Tempo de espera médio',
      'Conversão de leads'
    ],
    estimatedTime: '2-3 min'
  }
];

const mockMetrics: ReportMetric[] = [
  {
    id: 'metric-001',
    name: 'Receita Mensal',
    value: 125750,
    previousValue: 118200,
    unit: 'R$',
    trend: 'up',
    category: 'financial',
    description: 'Receita total do mês atual',
    target: 130000,
    alertThreshold: 100000
  },
  {
    id: 'metric-002',
    name: 'Taxa de Satisfação',
    value: 94.5,
    previousValue: 92.8,
    unit: '%',
    trend: 'up',
    category: 'clinical',
    description: 'Percentual de pacientes satisfeitos',
    target: 95,
    alertThreshold: 85
  },
  {
    id: 'metric-003',
    name: 'Tempo Médio de Tratamento',
    value: 28,
    previousValue: 32,
    unit: 'dias',
    trend: 'down',
    category: 'clinical',
    description: 'Duração média dos tratamentos',
    target: 25,
    alertThreshold: 40
  },
  {
    id: 'metric-004',
    name: 'Taxa de Ocupação',
    value: 78.2,
    previousValue: 75.6,
    unit: '%',
    trend: 'up',
    category: 'operational',
    description: 'Percentual de ocupação das salas',
    target: 85,
    alertThreshold: 60
  },
  {
    id: 'metric-005',
    name: 'Novos Pacientes',
    value: 47,
    previousValue: 42,
    unit: 'pacientes',
    trend: 'up',
    category: 'patient',
    description: 'Número de novos pacientes no mês',
    target: 50,
    alertThreshold: 30
  },
  {
    id: 'metric-006',
    name: 'NPS Score',
    value: 8.7,
    previousValue: 8.4,
    unit: 'pontos',
    trend: 'up',
    category: 'performance',
    description: 'Net Promoter Score médio',
    target: 9.0,
    alertThreshold: 7.0
  }
];

const categoryColors = {
  clinical: 'text-blue-600 bg-blue-100',
  financial: 'text-green-600 bg-green-100',
  operational: 'text-purple-600 bg-purple-100',
  patient: 'text-orange-600 bg-orange-100',
  performance: 'text-pink-600 bg-pink-100'
};

const categoryLabels = {
  clinical: 'Clínico',
  financial: 'Financeiro',
  operational: 'Operacional',
  patient: 'Pacientes',
  performance: 'Performance'
};

const frequencyLabels = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  annual: 'Anual'
};

const getTrendIcon = (trend: string) => {
  const icons = { up: ArrowUp, down: ArrowDown, stable: Minus };
  return icons[trend as keyof typeof icons];
};

const getTrendColor = (trend: string) => {
  const colors = { up: 'text-green-600', down: 'text-red-600', stable: 'text-gray-600' };
  return colors[trend as keyof typeof colors];
};

const getPerformanceColor = (value: number, target?: number, alertThreshold?: number) => {
  if (target && value >= target) return 'text-green-600';
  if (alertThreshold && value <= alertThreshold) return 'text-red-600';
  return 'text-yellow-600';
};

export default function AdvancedReports() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  const filteredTemplates = mockReportTemplates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockMetrics.slice(0, 3).map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          const changePercent = ((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1);
          
          return (
            <AnimatedContainer key={metric.id} animation="slide-up" delay={parseInt(metric.id.split('-')[1]) * 100}>
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {metric.unit === 'R$' ? 
                          `${metric.unit} ${metric.value.toLocaleString('pt-BR')}` : 
                          `${metric.value} ${metric.unit !== 'pontos' && metric.unit !== 'pacientes' ? metric.unit : ''}`
                        }
                      </p>
                      <div className={`flex items-center space-x-1 mt-1 ${getTrendColor(metric.trend)}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {changePercent}% vs período anterior
                        </span>
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${categoryColors[metric.category]}`}>
                      {metric.category === 'financial' && <DollarSign className="h-6 w-6" />}
                      {metric.category === 'clinical' && <Activity className="h-6 w-6" />}
                      {metric.category === 'operational' && <Clock className="h-6 w-6" />}
                      {metric.category === 'patient' && <Users className="h-6 w-6" />}
                      {metric.category === 'performance' && <Target className="h-6 w-6" />}
                    </div>
                  </div>
                  
                  {/* Barra de progresso para meta */}
                  {metric.target && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Meta: {metric.unit === 'R$' ? `${metric.unit} ${metric.target.toLocaleString('pt-BR')}` : `${metric.target} ${metric.unit}`}</span>
                        <span>{Math.min(Math.round((metric.value / metric.target) * 100), 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            metric.value >= metric.target ? 'bg-green-500' : 
                            metric.value >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </AnimatedContainer>
          );
        })}
      </div>

      {/* Sistema de Relatórios */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Modelos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Personalizados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              {/* Resumo Executivo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-600" />
                      Destaques do Mês
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Meta de Receita Atingida</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">97% da meta mensal alcançada</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Satisfação em Alta</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">94.5% de satisfação dos pacientes</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Crescimento de Pacientes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">47 novos pacientes este mês</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Alertas e Ações
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Taxa de Ocupação</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">78% - abaixo da meta de 85%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Inadimplência</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">R$ 8.500 em atraso há mais de 30 dias</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Oportunidade</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">15 leads qualificados aguardando contato</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Gráficos Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Evolução da Receita
                    </h3>
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Gráfico de evolução da receita mensal</p>
                        <p className="text-sm text-gray-400 mt-1">Últimos 12 meses</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Distribuição por Categoria
                    </h3>
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Distribuição de receita por serviço</p>
                        <p className="text-sm text-gray-400 mt-1">Período atual</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="clinical">Clínico</option>
                  <option value="financial">Financeiro</option>
                  <option value="operational">Operacional</option>
                  <option value="patient">Pacientes</option>
                  <option value="performance">Performance</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros Avançados
                </Button>
                
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Gerar Relatórios
                </Button>
              </div>

              {/* Lista de Templates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => (
                  <AnimatedContainer key={template.id} animation="slide-up" delay={parseInt(template.id.split('-')[1]) * 100}>
                    <Card hover className="group cursor-pointer" onClick={() => setSelectedTemplate(template)}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {template.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[template.category]}`}>
                              {categoryLabels[template.category]}
                            </div>
                            {template.automated && (
                              <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Automático
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Frequência:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {frequencyLabels[template.frequency]}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Formatos:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {template.format.join(', ')}
                            </div>
                          </div>
                          
                          {template.lastGenerated && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Último:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {new Date(template.lastGenerated).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tempo:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {template.estimatedTime}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Métricas incluídas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.dataPoints.slice(0, 3).map((point, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                {point}
                              </span>
                            ))}
                            {template.dataPoints.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                +{template.dataPoints.length - 3} mais
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Gerar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Métricas Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMetrics.map((metric) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  const changePercent = ((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1);
                  
                  return (
                    <AnimatedContainer key={metric.id} animation="slide-up" delay={parseInt(metric.id.split('-')[1]) * 50}>
                      <Card>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[metric.category]}`}>
                              {categoryLabels[metric.category]}
                            </div>
                          </div>
                          
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {metric.unit === 'R$' ? 
                              `${metric.unit} ${metric.value.toLocaleString('pt-BR')}` : 
                              `${metric.value}${metric.unit !== 'pontos' && metric.unit !== 'pacientes' ? ` ${metric.unit}` : ''}`
                            }
                          </div>
                          
                          <div className={`flex items-center space-x-1 mb-3 ${getTrendColor(metric.trend)}`}>
                            <TrendIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {changePercent}%
                            </span>
                            <span className="text-xs text-gray-500">vs anterior</span>
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {metric.description}
                          </p>
                          
                          {metric.target && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Meta</span>
                                <span>{Math.min(Math.round((metric.value / metric.target) * 100), 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${
                                    metric.value >= metric.target ? 'bg-green-500' : 
                                    metric.value >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </AnimatedContainer>
                  );
                })}
              </div>

              {/* Análises Comparativas */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Análise Comparativa de Períodos
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Este Mês</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Receita</span>
                          <span className="font-medium text-gray-900 dark:text-white">R$ 125.750</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pacientes</span>
                          <span className="font-medium text-gray-900 dark:text-white">47 novos</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Satisfação</span>
                          <span className="font-medium text-gray-900 dark:text-white">94.5%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Mês Anterior</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Receita</span>
                          <span className="font-medium text-gray-900 dark:text-white">R$ 118.200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pacientes</span>
                          <span className="font-medium text-gray-900 dark:text-white">42 novos</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Satisfação</span>
                          <span className="font-medium text-gray-900 dark:text-white">92.8%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Variação</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Receita</span>
                          <span className="font-medium text-green-600">+6.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pacientes</span>
                          <span className="font-medium text-green-600">+11.9%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Satisfação</span>
                          <span className="font-medium text-green-600">+1.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <div className="space-y-6">
              {/* Construtor de Relatórios */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Construtor de Relatórios Personalizados
                    </h3>
                    <Button onClick={() => setShowReportBuilder(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Relatório
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Período
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Métricas
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 mb-2">
                        <option>Receita Total</option>
                        <option>Novos Pacientes</option>
                        <option>Taxa de Satisfação</option>
                        <option>Tempo de Tratamento</option>
                      </select>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Métrica
                      </Button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Visualização
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 mb-2">
                        <option>Gráfico de Linhas</option>
                        <option>Gráfico de Barras</option>
                        <option>Gráfico de Pizza</option>
                        <option>Tabela</option>
                      </select>
                      <Button className="w-full">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Preview de Relatório */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Preview do Relatório
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Relatório de Performance
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Período: {new Date(dateRange.start).toLocaleDateString('pt-BR')} - {new Date(dateRange.end).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">R$ 125.750</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Receita Total</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">47</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Novos Pacientes</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">94.5%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Satisfação</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}