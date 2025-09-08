import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Zap,
  Heart,
  Star,
  Building2
} from 'lucide-react';

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'revenue' | 'patients' | 'operations' | 'satisfaction' | 'efficiency';
  target?: number;
  description: string;
  alertThreshold?: number;
  period: string;
}

interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
  growth: number;
  color: string;
}

interface OperationalKPI {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface CompetitiveAnalysis {
  metric: string;
  ourValue: number;
  marketAverage: number;
  topCompetitor: number;
  unit: string;
  performance: 'above' | 'average' | 'below';
}

const mockBusinessMetrics: BusinessMetric[] = [
  {
    id: 'bm001',
    name: 'Receita Total Mensal',
    value: 125750,
    previousValue: 118200,
    unit: 'R$',
    trend: 'up',
    category: 'revenue',
    target: 130000,
    description: 'Receita bruta total do mês atual',
    alertThreshold: 100000,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm002',
    name: 'Margem de Lucro',
    value: 35.8,
    previousValue: 33.2,
    unit: '%',
    trend: 'up',
    category: 'revenue',
    target: 40,
    description: 'Percentual de lucro sobre a receita total',
    alertThreshold: 25,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm003',
    name: 'Novos Pacientes',
    value: 47,
    previousValue: 42,
    unit: 'pacientes',
    trend: 'up',
    category: 'patients',
    target: 50,
    description: 'Número de novos pacientes cadastrados',
    alertThreshold: 30,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm004',
    name: 'Taxa de Retenção',
    value: 89.5,
    previousValue: 87.2,
    unit: '%',
    trend: 'up',
    category: 'patients',
    target: 92,
    description: 'Percentual de pacientes que continuam o tratamento',
    alertThreshold: 80,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm005',
    name: 'Taxa de Ocupação',
    value: 78.2,
    previousValue: 75.6,
    unit: '%',
    trend: 'up',
    category: 'operations',
    target: 85,
    description: 'Percentual de ocupação das salas de atendimento',
    alertThreshold: 60,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm006',
    name: 'Tempo Médio de Espera',
    value: 12.5,
    previousValue: 15.2,
    unit: 'min',
    trend: 'down',
    category: 'operations',
    target: 10,
    description: 'Tempo médio de espera dos pacientes',
    alertThreshold: 20,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm007',
    name: 'NPS (Net Promoter Score)',
    value: 78,
    previousValue: 74,
    unit: 'pontos',
    trend: 'up',
    category: 'satisfaction',
    target: 80,
    description: 'Índice de recomendação dos pacientes',
    alertThreshold: 60,
    period: 'Janeiro 2024'
  },
  {
    id: 'bm008',
    name: 'Produtividade por Fisio',
    value: 8.5,
    previousValue: 7.8,
    unit: 'sessões/dia',
    trend: 'up',
    category: 'efficiency',
    target: 9,
    description: 'Número médio de sessões por fisioterapeuta por dia',
    alertThreshold: 6,
    period: 'Janeiro 2024'
  }
];

const mockRevenueBreakdown: RevenueBreakdown[] = [
  {
    source: 'Fisioterapia Geral',
    amount: 78500,
    percentage: 62.4,
    growth: 8.2,
    color: 'bg-blue-500'
  },
  {
    source: 'RPG',
    amount: 25200,
    percentage: 20.0,
    growth: 15.6,
    color: 'bg-green-500'
  },
  {
    source: 'Pilates',
    amount: 15600,
    percentage: 12.4,
    growth: 22.1,
    color: 'bg-purple-500'
  },
  {
    source: 'Acupuntura',
    amount: 4800,
    percentage: 3.8,
    growth: -2.5,
    color: 'bg-orange-500'
  },
  {
    source: 'Outros',
    amount: 1650,
    percentage: 1.3,
    growth: 5.8,
    color: 'bg-gray-500'
  }
];

const mockOperationalKPIs: OperationalKPI[] = [
  {
    name: 'Taxa de Cancelamento',
    current: 8.5,
    target: 10,
    unit: '%',
    status: 'good',
    trend: 'down',
    description: 'Percentual de consultas canceladas'
  },
  {
    name: 'Reagendamentos',
    current: 15.2,
    target: 12,
    unit: '%',
    status: 'warning',
    trend: 'up',
    description: 'Percentual de consultas reagendadas'
  },
  {
    name: 'Pontualidade',
    current: 94.8,
    target: 95,
    unit: '%',
    status: 'excellent',
    trend: 'up',
    description: 'Percentual de atendimentos pontuais'
  },
  {
    name: 'Utilização de Equipamentos',
    current: 72.3,
    target: 80,
    unit: '%',
    status: 'warning',
    trend: 'stable',
    description: 'Percentual de uso dos equipamentos'
  }
];

const mockCompetitiveAnalysis: CompetitiveAnalysis[] = [
  {
    metric: 'Preço Médio por Sessão',
    ourValue: 85,
    marketAverage: 90,
    topCompetitor: 95,
    unit: 'R$',
    performance: 'below'
  },
  {
    metric: 'Satisfação do Cliente',
    ourValue: 9.2,
    marketAverage: 8.5,
    topCompetitor: 9.0,
    unit: '/10',
    performance: 'above'
  },
  {
    metric: 'Tempo de Agendamento',
    ourValue: 2.1,
    marketAverage: 3.5,
    topCompetitor: 1.8,
    unit: 'dias',
    performance: 'above'
  },
  {
    metric: 'Taxa de Retenção',
    ourValue: 89.5,
    marketAverage: 82.0,
    topCompetitor: 91.2,
    unit: '%',
    performance: 'above'
  }
];

const getCategoryColor = (category: string) => {
  const colors = {
    revenue: 'text-green-600 bg-green-100',
    patients: 'text-blue-600 bg-blue-100',
    operations: 'text-purple-600 bg-purple-100',
    satisfaction: 'text-pink-600 bg-pink-100',
    efficiency: 'text-orange-600 bg-orange-100'
  };
  return colors[category as keyof typeof colors];
};

const getTrendIcon = (trend: string) => {
  const icons = { up: ArrowUp, down: ArrowDown, stable: Minus };
  return icons[trend as keyof typeof icons];
};

const getTrendColor = (trend: string, isInverted = false) => {
  if (trend === 'stable') return 'text-gray-600';
  const isGood = isInverted ? trend === 'down' : trend === 'up';
  return isGood ? 'text-green-600' : 'text-red-600';
};

const getStatusColor = (status: string) => {
  const colors = {
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100',
    critical: 'text-red-600 bg-red-100'
  };
  return colors[status as keyof typeof colors];
};

const getPerformanceColor = (performance: string) => {
  const colors = {
    above: 'text-green-600',
    average: 'text-yellow-600',
    below: 'text-red-600'
  };
  return colors[performance as keyof typeof colors];
};

export default function BusinessMetrics() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredMetrics = mockBusinessMetrics.filter(metric =>
    selectedCategory === 'all' || metric.category === selectedCategory
  );

  const totalRevenue = mockBusinessMetrics.find(m => m.name === 'Receita Total Mensal')?.value || 0;
  const revenueGrowth = ((totalRevenue - 118200) / 118200 * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Mensal</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {totalRevenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-green-600 mt-1">+{revenueGrowth}% vs mês anterior</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Novos Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">47</p>
                  <p className="text-sm text-blue-600 mt-1">+11.9% vs mês anterior</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Ocupação</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">78.2%</p>
                  <p className="text-sm text-purple-600 mt-1">+3.4% vs mês anterior</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={400}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">NPS Score</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">78</p>
                  <p className="text-sm text-pink-600 mt-1">+5.4% vs mês anterior</p>
                </div>
                <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema de Métricas de Negócio */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Receita</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Operações</span>
            </TabsTrigger>
            <TabsTrigger value="competitive" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Competitivo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="revenue">Receita</option>
                  <option value="patients">Pacientes</option>
                  <option value="operations">Operações</option>
                  <option value="satisfaction">Satisfação</option>
                  <option value="efficiency">Eficiência</option>
                </select>
                
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="week">Última semana</option>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="year">Último ano</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros Avançados
                </Button>
                
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </div>

              {/* Métricas Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMetrics.map((metric) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  const changePercent = ((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1);
                  const isInverted = metric.name.includes('Tempo') || metric.name.includes('Cancelamento');
                  
                  return (
                    <AnimatedContainer key={metric.id} animation="slide-up" delay={parseInt(metric.id.substring(2)) * 50}>
                      <Card hover>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(metric.category)}`}>
                              {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                            </div>
                            <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, isInverted)}`}>
                              <TrendIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{changePercent}%</span>
                            </div>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{metric.name}</h4>
                          
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {metric.unit === 'R$' ? 
                              `${metric.unit} ${metric.value.toLocaleString('pt-BR')}` :
                              `${metric.value}${metric.unit !== 'pontos' && metric.unit !== 'pacientes' ? ` ${metric.unit}` : ''}`
                            }
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            {metric.description}
                          </p>
                          
                          {metric.target && (
                            <div>
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Meta: {metric.target} {metric.unit}</span>
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
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="space-y-6">
              {/* Breakdown de Receita */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Distribuição de Receita por Serviço
                    </h3>
                    
                    <div className="space-y-4">
                      {mockRevenueBreakdown.map((item, index) => (
                        <AnimatedContainer key={index} animation="slide-right" delay={index * 100}>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${item.color}`} />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{item.source}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  R$ {item.amount.toLocaleString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {item.percentage}%
                              </div>
                              <div className={`text-sm font-medium ${
                                item.growth > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.growth > 0 ? '+' : ''}{item.growth}%
                              </div>
                            </div>
                          </div>
                        </AnimatedContainer>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Evolução da Receita
                    </h3>
                    
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Gráfico de evolução mensal da receita</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Crescimento de {revenueGrowth}% este mês
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Análise Financeira */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Análise Financeira Detalhada
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">R$ 45.019</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Lucro Líquido</div>
                      <div className="text-xs text-green-600 mt-1">+8,2% vs mês anterior</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">R$ 80.731</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Custos Operacionais</div>
                      <div className="text-xs text-blue-600 mt-1">+4,1% vs mês anterior</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">R$ 2.675</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Receita por Paciente</div>
                      <div className="text-xs text-purple-600 mt-1">+2,9% vs mês anterior</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="mt-6">
            <div className="space-y-6">
              {/* KPIs Operacionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockOperationalKPIs.map((kpi, index) => {
                  const TrendIcon = getTrendIcon(kpi.trend);
                  const progressPercentage = Math.min((kpi.current / kpi.target) * 100, 100);
                  const isInverted = kpi.name.includes('Cancelamento') || kpi.name.includes('Reagenda');
                  
                  return (
                    <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                      <Card>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{kpi.name}</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                                {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                              </div>
                              <div className={`flex items-center space-x-1 ${getTrendColor(kpi.trend, isInverted)}`}>
                                <TrendIcon className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {kpi.current} {kpi.unit}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {kpi.description}
                          </p>
                          
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Meta: {kpi.target} {kpi.unit}</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  kpi.status === 'excellent' ? 'bg-green-500' :
                                  kpi.status === 'good' ? 'bg-blue-500' :
                                  kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </AnimatedContainer>
                  );
                })}
              </div>

              {/* Eficiência Operacional */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Eficiência Operacional - Últimos 30 Dias
                  </h3>
                  
                  <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de eficiência operacional</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Melhoria de 12% na eficiência geral
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitive" className="mt-6">
            <div className="space-y-6">
              {/* Análise Competitiva */}
              <div className="grid gap-6">
                {mockCompetitiveAnalysis.map((analysis, index) => (
                  <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {analysis.metric}
                          </h4>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            analysis.performance === 'above' ? 'text-green-600 bg-green-100' :
                            analysis.performance === 'average' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {analysis.performance === 'above' ? 'Acima da Média' :
                             analysis.performance === 'average' ? 'Na Média' : 'Abaixo da Média'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {analysis.ourValue} {analysis.unit}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Nosso Valor</div>
                          </div>
                          
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600 mb-2">
                              {analysis.marketAverage} {analysis.unit}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Média do Mercado</div>
                          </div>
                          
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                              {analysis.topCompetitor} {analysis.unit}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Melhor Concorrente</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Posição no Mercado</span>
                            <div className="flex items-center space-x-2">
                              {analysis.performance === 'above' && <Award className="h-4 w-4 text-green-600" />}
                              {analysis.performance === 'average' && <Target className="h-4 w-4 text-yellow-600" />}
                              {analysis.performance === 'below' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                              <span className={`font-medium ${getPerformanceColor(analysis.performance)}`}>
                                {analysis.performance === 'above' ? 'Líder' :
                                 analysis.performance === 'average' ? 'Competitivo' : 'Oportunidade'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>

              {/* Posicionamento Competitivo */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Posicionamento Geral no Mercado
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                      <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Métricas Acima da Média</div>
                      <div className="text-xs text-green-600 mt-1">Satisfação, Tempo de Agendamento, Retenção</div>
                    </div>
                    
                    <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Métricas na Média</div>
                      <div className="text-xs text-yellow-600 mt-1">Nenhuma métrica na média exata</div>
                    </div>
                    
                    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                      <div className="text-3xl font-bold text-red-600 mb-2">1</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Métricas Abaixo da Média</div>
                      <div className="text-xs text-red-600 mt-1">Preço médio por sessão</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Avaliação Competitiva Geral</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Posição forte no mercado com vantagens competitivas em satisfação do cliente e eficiência operacional. 
                          Oportunidade de melhoria na precificação para maximizar receita.
                        </p>
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