import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Calendar,
  Award,
  Zap,
  RefreshCw,
  Download,
  Share,
  Eye,
} from 'lucide-react';
// Charts will be implemented when recharts is available
// For now, we'll use CSS-based charts

interface PatientData {
  id: string;
  name: string;
  condition: string;
  startDate: string;
  sessions: number;
  adherenceRate: number;
  painLevel: number; // 0-10
  functionalScore: number; // 0-100
  satisfactionScore: number; // 0-100
}

interface AIInsight {
  type: 'positive' | 'concern' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'progress' | 'adherence' | 'outcome' | 'risk' | 'opportunity';
}

interface ProgressMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  interpretation: string;
}

interface PatientAnalyticsProps {
  patientId: string;
  timeframe?: '1w' | '1m' | '3m' | '6m' | '1y';
  onInsightClick?: (insight: AIInsight) => void;
  className?: string;
}

export default function PatientAnalytics({
  patientId,
  timeframe = '3m',
  onInsightClick,
  className = ''
}: PatientAnalyticsProps) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights' | 'predictions'>('overview');

  useEffect(() => {
    loadPatientAnalytics();
  }, [patientId, timeframe]);

  const loadPatientAnalytics = async () => {
    setIsLoading(true);
    
    try {
      // Simular carregamento de dados - integrar com API real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data para demonstração
      const mockPatientData: PatientData = {
        id: patientId,
        name: 'João Silva',
        condition: 'Lombalgia Crônica',
        startDate: '2024-01-15',
        sessions: 12,
        adherenceRate: 85,
        painLevel: 3,
        functionalScore: 78,
        satisfactionScore: 92
      };

      const mockInsights: AIInsight[] = [
        {
          type: 'positive',
          title: 'Progresso Excepcional',
          description: 'Paciente apresentou melhora de 65% na funcionalidade em 8 semanas, superando a média esperada de 40%.',
          confidence: 94,
          actionable: false,
          priority: 'medium',
          category: 'progress'
        },
        {
          type: 'milestone',
          title: 'Meta de Redução de Dor Atingida',
          description: 'Dor reduziu de 8/10 para 3/10, alcançando a meta estabelecida. Considerar nova meta de 2/10.',
          confidence: 98,
          actionable: true,
          priority: 'high',
          category: 'outcome'
        },
        {
          type: 'concern',
          title: 'Aderência em Declínio',
          description: 'Aderência aos exercícios domiciliares caiu de 95% para 75% nas últimas 2 semanas.',
          confidence: 89,
          actionable: true,
          priority: 'high',
          category: 'adherence'
        },
        {
          type: 'recommendation',
          title: 'Progressão de Exercícios Indicada',
          description: 'Baseado na melhora funcional, a IA sugere progresso para exercícios de nível intermediário.',
          confidence: 87,
          actionable: true,
          priority: 'medium',
          category: 'opportunity'
        }
      ];

      const mockMetrics: ProgressMetric[] = [
        {
          name: 'Nível de Dor',
          current: 3,
          previous: 5,
          target: 2,
          unit: '/10',
          trend: 'down',
          interpretation: 'Excelente redução de 40% na percepção de dor'
        },
        {
          name: 'Funcionalidade',
          current: 78,
          previous: 65,
          target: 85,
          unit: '%',
          trend: 'up',
          interpretation: 'Melhora consistente nas atividades diárias'
        },
        {
          name: 'Aderência',
          current: 85,
          previous: 95,
          target: 90,
          unit: '%',
          trend: 'down',
          interpretation: 'Declínio na aderência requer atenção'
        },
        {
          name: 'Amplitude de Movimento',
          current: 82,
          previous: 70,
          target: 90,
          unit: '°',
          trend: 'up',
          interpretation: 'Recuperação satisfatória da mobilidade'
        }
      ];

      const mockProgressData = [
        { week: 'Sem 1', dor: 8, funcionalidade: 45, aderencia: 90 },
        { week: 'Sem 2', dor: 7, funcionalidade: 52, aderencia: 95 },
        { week: 'Sem 3', dor: 6, funcionalidade: 58, aderencia: 92 },
        { week: 'Sem 4', dor: 5, funcionalidade: 65, aderencia: 88 },
        { week: 'Sem 5', dor: 4, funcionalidade: 70, aderencia: 85 },
        { week: 'Sem 6', dor: 4, funcionalidade: 75, aderencia: 82 },
        { week: 'Sem 7', dor: 3, funcionalidade: 78, aderencia: 80 },
        { week: 'Sem 8', dor: 3, funcionalidade: 78, aderencia: 85 }
      ];

      setPatientData(mockPatientData);
      setInsights(mockInsights);
      setMetrics(mockMetrics);
      setProgressData(mockProgressData);

    } catch (error) {
      console.error('Erro ao carregar análise do paciente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle;
      case 'concern': return AlertCircle;
      case 'recommendation': return Sparkles;
      case 'milestone': return Award;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'concern': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'recommendation': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'milestone': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string, isGood: boolean) => {
    if (trend === 'up') return isGood ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return isGood ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">IA Analisando Progresso...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processando dados do paciente
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                Análise IA do Paciente
                <Sparkles className="h-4 w-4 ml-2 text-yellow-500 animate-pulse" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {patientData?.name} - {patientData?.condition}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => loadPatientAnalytics()}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value="1w">1 Semana</option>
              <option value="1m">1 Mês</option>
              <option value="3m">3 Meses</option>
              <option value="6m">6 Meses</option>
              <option value="1y">1 Ano</option>
            </select>
            
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPatientAnalytics}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Visão Geral', icon: Eye },
            { key: 'trends', label: 'Tendências', icon: LineChart },
            { key: 'insights', label: 'Insights IA', icon: Brain },
            { key: 'predictions', label: 'Previsões', icon: Zap }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const TrendIcon = getTrendIcon(metric.trend);
              const isGoodTrend = metric.name === 'Nível de Dor' ? metric.trend === 'down' : metric.trend === 'up';
              
              return (
                <AnimatedContainer key={metric.name} animation="scale-in" delay={index * 100}>
                  <Card hover className="group cursor-pointer">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {metric.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {metric.current}{metric.unit}
                            </span>
                            <TrendIcon className={`h-4 w-4 ${getTrendColor(metric.trend, isGoodTrend)}`} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Meta: {metric.target}{metric.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {metric.interpretation}
                        </p>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              );
            })}
          </div>

          {/* Progress Chart */}
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Evolução do Tratamento
              </h4>
              
              {/* Placeholder for chart - will be replaced with recharts */}
              <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Gráfico de Evolução</p>
                  <p className="text-sm text-gray-400">Dados: {progressData.length} pontos</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const InsightIcon = getInsightIcon(insight.type);
            
            return (
              <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                <Card 
                  variant="elevated" 
                  hover 
                  className={`border-l-4 ${getInsightColor(insight.type)} cursor-pointer group`}
                  onClick={() => onInsightClick?.(insight)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <InsightIcon className="h-5 w-5 mt-0.5 text-gray-600 group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {insight.title}
                            </h4>
                            <Badge 
                              variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            {insight.actionable && (
                              <Badge variant="outline">
                                Ação Necessária
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {insight.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>Confiança: {insight.confidence}%</span>
                              <span>Categoria: {insight.category}</span>
                            </div>
                            
                            {insight.actionable && (
                              <Button size="sm" variant="outline">
                                Ver Ações
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedContainer>
            );
          })}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Distribuição de Sessões
              </h4>
              {/* Placeholder for pie chart */}
              <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Distribuição de Sessões</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">12 Concluídas</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">2 Faltosas</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">1 Reagendada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aderência por Semana
              </h4>
              {/* Placeholder for bar chart */}
              <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Aderência por Semana</p>
                  <p className="text-sm text-gray-400">Média: 85%</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'predictions' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Previsões da IA para os Próximos 30 Dias
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Probabilidade de Alta
                </h5>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  78%
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Baseado na evolução atual, alta prevista em 4-6 semanas
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Nível de Dor Previsto
                </h5>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  1-2/10
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Redução adicional de 33-66% esperada
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Score Funcional Meta
                </h5>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  85%
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Funcionalidade próxima do normal em 3 semanas
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h6 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Fatores de Risco Identificados
                  </h6>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <li>• Declínio na aderência pode impactar cronograma em 15%</li>
                    <li>• Necessário reforço em exercícios domiciliares</li>
                    <li>• Considerar sessões de manutenção pós-alta</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}