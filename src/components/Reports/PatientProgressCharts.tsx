import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  User,
  Zap
} from 'lucide-react';

interface PatientProgress {
  id: string;
  name: string;
  startDate: string;
  condition: string;
  initialPainLevel: number;
  currentPainLevel: number;
  mobilityScore: number;
  strengthScore: number;
  sessionsCompleted: number;
  totalSessions: number;
  improvementRate: number;
  status: 'excellent' | 'good' | 'fair' | 'concern';
  nextAppointment?: string;
  notes?: string;
}

interface TreatmentOutcome {
  condition: string;
  totalPatients: number;
  successRate: number;
  averageSessionsNeeded: number;
  averageImprovementTime: number; // em dias
  satisfactionScore: number;
  commonComplications: string[];
  recommendedProtocols: string[];
}

interface ProgressMetric {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  description: string;
}

const mockPatientProgress: PatientProgress[] = [
  {
    id: 'p001',
    name: 'Maria Silva',
    startDate: '2024-01-05',
    condition: 'Dor lombar crônica',
    initialPainLevel: 8,
    currentPainLevel: 3,
    mobilityScore: 8.5,
    strengthScore: 7.2,
    sessionsCompleted: 12,
    totalSessions: 15,
    improvementRate: 87,
    status: 'excellent',
    nextAppointment: '2024-01-22',
    notes: 'Excelente progresso, muito colaborativa'
  },
  {
    id: 'p002',
    name: 'João Santos',
    startDate: '2024-01-08',
    condition: 'Lesão no ombro',
    initialPainLevel: 7,
    currentPainLevel: 4,
    mobilityScore: 6.8,
    strengthScore: 6.5,
    sessionsCompleted: 8,
    totalSessions: 12,
    improvementRate: 65,
    status: 'good',
    nextAppointment: '2024-01-23',
    notes: 'Progresso consistente'
  },
  {
    id: 'p003',
    name: 'Ana Costa',
    startDate: '2024-01-10',
    condition: 'Cervicalgia',
    initialPainLevel: 6,
    currentPainLevel: 2,
    mobilityScore: 9.1,
    strengthScore: 8.0,
    sessionsCompleted: 10,
    totalSessions: 12,
    improvementRate: 92,
    status: 'excellent',
    nextAppointment: '2024-01-24'
  },
  {
    id: 'p004',
    name: 'Carlos Oliveira',
    startDate: '2024-01-12',
    condition: 'Artrose no joelho',
    initialPainLevel: 9,
    currentPainLevel: 7,
    mobilityScore: 4.2,
    strengthScore: 4.8,
    sessionsCompleted: 6,
    totalSessions: 20,
    improvementRate: 28,
    status: 'concern',
    nextAppointment: '2024-01-21',
    notes: 'Progresso lento, necessita reavaliação'
  },
  {
    id: 'p005',
    name: 'Lucia Pereira',
    startDate: '2024-01-15',
    condition: 'Fibromialgia',
    initialPainLevel: 7,
    currentPainLevel: 5,
    mobilityScore: 6.0,
    strengthScore: 5.5,
    sessionsCompleted: 4,
    totalSessions: 18,
    improvementRate: 45,
    status: 'fair',
    nextAppointment: '2024-01-25'
  }
];

const mockTreatmentOutcomes: TreatmentOutcome[] = [
  {
    condition: 'Dor lombar',
    totalPatients: 45,
    successRate: 89,
    averageSessionsNeeded: 14,
    averageImprovementTime: 28,
    satisfactionScore: 9.2,
    commonComplications: ['Recidiva em 6 meses (12%)', 'Rigidez matinal persistente'],
    recommendedProtocols: ['RPG + Pilates', 'Exercícios de estabilização do core']
  },
  {
    condition: 'Lesões de ombro',
    totalPatients: 32,
    successRate: 85,
    averageSessionsNeeded: 16,
    averageImprovementTime: 35,
    satisfactionScore: 8.8,
    commonComplications: ['Capsulite adesiva (8%)', 'Limitação residual de amplitude'],
    recommendedProtocols: ['Mobilização articular', 'Fortalecimento progressivo']
  },
  {
    condition: 'Cervicalgia',
    totalPatients: 28,
    successRate: 92,
    averageSessionsNeeded: 12,
    averageImprovementTime: 21,
    satisfactionScore: 9.0,
    commonComplications: ['Cefaleia tensional (15%)', 'Dormência residual'],
    recommendedProtocols: ['Terapia manual', 'Exercícios posturais']
  },
  {
    condition: 'Artrose',
    totalPatients: 18,
    successRate: 65,
    averageSessionsNeeded: 20,
    averageImprovementTime: 45,
    satisfactionScore: 7.8,
    commonComplications: ['Progressão da doença', 'Limitação funcional persistente'],
    recommendedProtocols: ['Hidroterapia', 'Fortalecimento muscular']
  }
];

const progressMetrics: ProgressMetric[] = [
  {
    name: 'Taxa de Melhora Geral',
    value: 82.5,
    previousValue: 78.2,
    unit: '%',
    trend: 'up',
    target: 85,
    description: 'Percentual de pacientes com melhora significativa'
  },
  {
    name: 'Tempo Médio de Tratamento',
    value: 16.2,
    previousValue: 18.5,
    unit: 'sessões',
    trend: 'down',
    target: 15,
    description: 'Número médio de sessões para conclusão do tratamento'
  },
  {
    name: 'Satisfação dos Pacientes',
    value: 9.1,
    previousValue: 8.9,
    unit: 'pontos',
    trend: 'up',
    target: 9.0,
    description: 'Avaliação média de satisfação (escala 1-10)'
  },
  {
    name: 'Taxa de Abandono',
    value: 8.3,
    previousValue: 12.1,
    unit: '%',
    trend: 'down',
    target: 10,
    description: 'Percentual de pacientes que abandonaram o tratamento'
  }
];

const getStatusColor = (status: string) => {
  const colors = {
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    fair: 'text-yellow-600 bg-yellow-100',
    concern: 'text-red-600 bg-red-100'
  };
  return colors[status as keyof typeof colors];
};

const getStatusLabel = (status: string) => {
  const labels = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular',
    concern: 'Atenção'
  };
  return labels[status as keyof typeof labels];
};

const getTrendIcon = (trend: string) => {
  const icons = { up: ArrowUp, down: ArrowDown, stable: Minus };
  return icons[trend as keyof typeof icons];
};

const getTrendColor = (trend: string) => {
  const colors = { up: 'text-green-600', down: 'text-red-600', stable: 'text-gray-600' };
  return colors[trend as keyof typeof colors];
};

export default function PatientProgressCharts() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredPatients = mockPatientProgress.filter(patient =>
    selectedCondition === 'all' || patient.condition.toLowerCase().includes(selectedCondition.toLowerCase())
  );

  const overallStats = {
    totalPatients: mockPatientProgress.length,
    averageImprovement: Math.round(mockPatientProgress.reduce((sum, p) => sum + p.improvementRate, 0) / mockPatientProgress.length),
    completedTreatments: mockPatientProgress.filter(p => p.status === 'excellent').length,
    needingAttention: mockPatientProgress.filter(p => p.status === 'concern').length
  };

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pacientes em Tratamento</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.totalPatients}</p>
                  <p className="text-sm text-blue-600 mt-1">+12% este mês</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Melhora Média</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.averageImprovement}%</p>
                  <p className="text-sm text-green-600 mt-1">+4.3% vs mês anterior</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tratamentos Concluídos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.completedTreatments}</p>
                  <p className="text-sm text-green-600 mt-1">Alta médica</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Necessitam Atenção</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{overallStats.needingAttention}</p>
                  <p className="text-sm text-red-600 mt-1">Progresso lento</p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema de Análise */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Progresso Individual</span>
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Por Condição</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Métricas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="week">Última semana</option>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                </select>
                
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="all">Todas as condições</option>
                  <option value="lombar">Dor lombar</option>
                  <option value="ombro">Lesão no ombro</option>
                  <option value="cervical">Cervicalgia</option>
                  <option value="artrose">Artrose</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Mais Filtros
                </Button>
                
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </div>

              {/* Gráficos de Evolução */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Evolução da Dor (Média dos Pacientes)
                    </h3>
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Gráfico de evolução do nível de dor</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Redução média de 58% na intensidade da dor
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Taxa de Sucesso por Condição
                    </h3>
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Distribuição de sucesso por tipo de tratamento</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Taxa média de sucesso: 82.5%
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Resumo de Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {progressMetrics.slice(0, 2).map((metric, index) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  const changePercent = ((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1);
                  
                  return (
                    <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                      <Card>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{metric.name}</h4>
                            <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                              <TrendIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{changePercent}%</span>
                            </div>
                          </div>
                          
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {metric.value} {metric.unit}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {metric.description}
                          </p>
                          
                          {metric.target && (
                            <div>
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>Meta: {metric.target} {metric.unit}</span>
                                <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
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

          <TabsContent value="individual" className="mt-6">
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <AnimatedContainer key={patient.id} animation="slide-up" delay={parseInt(patient.id.substring(1)) * 50}>
                  <Card hover>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {patient.condition} • Iniciado em {new Date(patient.startDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                            {getStatusLabel(patient.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dor Inicial</div>
                          <div className="text-xl font-bold text-red-600">{patient.initialPainLevel}/10</div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dor Atual</div>
                          <div className="text-xl font-bold text-green-600">{patient.currentPainLevel}/10</div>
                        </div>
                        
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mobilidade</div>
                          <div className="text-xl font-bold text-blue-600">{patient.mobilityScore}/10</div>
                        </div>
                        
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Força</div>
                          <div className="text-xl font-bold text-purple-600">{patient.strengthScore}/10</div>
                        </div>
                        
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Melhora</div>
                          <div className="text-xl font-bold text-orange-600">{patient.improvementRate}%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Sessões: {patient.sessionsCompleted}/{patient.totalSessions}
                          {patient.nextAppointment && (
                            <span className="ml-4">
                              Próxima: {new Date(patient.nextAppointment).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Evolução
                          </Button>
                        </div>
                      </div>
                      
                      {patient.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            "{patient.notes}"
                          </p>
                        </div>
                      )}
                      
                      {/* Barra de progresso */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progresso do tratamento</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {Math.round((patient.sessionsCompleted / patient.totalSessions) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              patient.status === 'excellent' ? 'bg-green-500' :
                              patient.status === 'good' ? 'bg-blue-500' :
                              patient.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(patient.sessionsCompleted / patient.totalSessions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="mt-6">
            <div className="space-y-6">
              {mockTreatmentOutcomes.map((outcome, index) => (
                <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {outcome.condition}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {outcome.totalPatients} pacientes tratados
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">{outcome.successRate}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">{outcome.averageSessionsNeeded}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Sessões Médias</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">{outcome.averageImprovementTime}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Dias para Melhora</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600 mb-2">{outcome.satisfactionScore}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Satisfação Média</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                            Complicações Comuns
                          </h4>
                          <div className="space-y-2">
                            {outcome.commonComplications.map((complication, i) => (
                              <div key={i} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{complication}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <Award className="h-5 w-5 mr-2 text-green-600" />
                            Protocolos Recomendados
                          </h4>
                          <div className="space-y-2">
                            {outcome.recommendedProtocols.map((protocol, i) => (
                              <div key={i} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{protocol}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progressMetrics.map((metric, index) => {
                const TrendIcon = getTrendIcon(metric.trend);
                const changePercent = ((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1);
                
                return (
                  <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{metric.name}</h4>
                          <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                            <TrendIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{changePercent}%</span>
                          </div>
                        </div>
                        
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {metric.value} {metric.unit}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {metric.description}
                        </p>
                        
                        {metric.target && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>Meta: {metric.target} {metric.unit}</span>
                              <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
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

            {/* Gráfico de Métricas Consolidado */}
            <Card className="mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Evolução das Métricas - Últimos 6 Meses
                </h3>
                
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Gráfico comparativo de todas as métricas</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Tendência geral: Melhora consistente em todas as áreas
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}