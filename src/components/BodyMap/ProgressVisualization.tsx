import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  Activity,
  Clock,
  Zap,
  Heart,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ProgressEntry {
  id: string;
  date: string;
  painLevel: number;
  mobilityScore: number;
  strengthScore: number;
  flexibilityScore: number;
  functionalScore: number;
  moodScore: number;
  notes?: string;
  exercisesCompleted: number;
  sessionDuration: number;
}

interface MilestoneGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'pain' | 'mobility' | 'strength' | 'flexibility' | 'functional';
  deadline: string;
  achieved: boolean;
  achievedDate?: string;
}

interface ComparisonPeriod {
  label: string;
  start: string;
  end: string;
  painAverage: number;
  mobilityAverage: number;
  strengthAverage: number;
  flexibilityAverage: number;
  functionalAverage: number;
  sessionsCompleted: number;
}

const mockProgressData: ProgressEntry[] = [
  {
    id: '1',
    date: '2024-01-20',
    painLevel: 3,
    mobilityScore: 8,
    strengthScore: 7,
    flexibilityScore: 6,
    functionalScore: 8,
    moodScore: 8,
    exercisesCompleted: 5,
    sessionDuration: 45,
    notes: 'Ótima sessão, menos dor cervical'
  },
  {
    id: '2',
    date: '2024-01-19',
    painLevel: 4,
    mobilityScore: 7,
    strengthScore: 6,
    flexibilityScore: 6,
    functionalScore: 7,
    moodScore: 7,
    exercisesCompleted: 4,
    sessionDuration: 40
  },
  {
    id: '3',
    date: '2024-01-18',
    painLevel: 5,
    mobilityScore: 6,
    strengthScore: 6,
    flexibilityScore: 5,
    functionalScore: 6,
    moodScore: 6,
    exercisesCompleted: 3,
    sessionDuration: 35
  },
  {
    id: '4',
    date: '2024-01-17',
    painLevel: 6,
    mobilityScore: 5,
    strengthScore: 5,
    flexibilityScore: 5,
    functionalScore: 5,
    moodScore: 5,
    exercisesCompleted: 3,
    sessionDuration: 30
  },
  {
    id: '5',
    date: '2024-01-16',
    painLevel: 7,
    mobilityScore: 4,
    strengthScore: 4,
    flexibilityScore: 4,
    functionalScore: 4,
    moodScore: 4,
    exercisesCompleted: 2,
    sessionDuration: 25
  },
  {
    id: '6',
    date: '2024-01-15',
    painLevel: 8,
    mobilityScore: 3,
    strengthScore: 3,
    flexibilityScore: 3,
    functionalScore: 3,
    moodScore: 3,
    exercisesCompleted: 2,
    sessionDuration: 20
  }
];

const mockMilestones: MilestoneGoal[] = [
  {
    id: 'goal-1',
    title: 'Reduzir Dor para Nível 2',
    description: 'Diminuir a intensidade da dor de 8 para 2 pontos',
    targetValue: 2,
    currentValue: 3,
    unit: 'pontos',
    category: 'pain',
    deadline: '2024-02-15',
    achieved: false
  },
  {
    id: 'goal-2',
    title: 'Mobilidade Excelente',
    description: 'Atingir pontuação de mobilidade 9/10',
    targetValue: 9,
    currentValue: 8,
    unit: 'pontos',
    category: 'mobility',
    deadline: '2024-02-28',
    achieved: false
  },
  {
    id: 'goal-3',
    title: 'Força Completa',
    description: 'Recuperar 100% da força muscular',
    targetValue: 10,
    currentValue: 7,
    unit: 'pontos',
    category: 'strength',
    deadline: '2024-03-15',
    achieved: false
  },
  {
    id: 'goal-4',
    title: '30 Dias Consecutivos',
    description: 'Completar 30 dias de exercícios consecutivos',
    targetValue: 30,
    currentValue: 5,
    unit: 'dias',
    category: 'functional',
    deadline: '2024-02-20',
    achieved: false
  }
];

const mockComparisons: ComparisonPeriod[] = [
  {
    label: 'Esta Semana',
    start: '2024-01-15',
    end: '2024-01-21',
    painAverage: 4.6,
    mobilityAverage: 6.5,
    strengthAverage: 5.8,
    flexibilityAverage: 5.5,
    functionalAverage: 6.2,
    sessionsCompleted: 6
  },
  {
    label: 'Semana Anterior',
    start: '2024-01-08',
    end: '2024-01-14',
    painAverage: 6.2,
    mobilityAverage: 4.8,
    strengthAverage: 4.2,
    flexibilityAverage: 4.0,
    functionalAverage: 4.5,
    sessionsCompleted: 4
  },
  {
    label: 'Início do Tratamento',
    start: '2024-01-01',
    end: '2024-01-07',
    painAverage: 8.5,
    mobilityAverage: 2.8,
    strengthAverage: 2.5,
    flexibilityAverage: 2.2,
    functionalAverage: 2.8,
    sessionsCompleted: 2
  }
];

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) return ArrowUp;
  if (current < previous) return ArrowDown;
  return Minus;
};

const getTrendColor = (current: number, previous: number, isInverted = false) => {
  const isImproving = isInverted ? current < previous : current > previous;
  if (isImproving) return 'text-green-600';
  if (current === previous) return 'text-gray-600';
  return 'text-red-600';
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600 bg-green-100';
  if (score >= 6) return 'text-yellow-600 bg-yellow-100';
  if (score >= 4) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getPainColor = (pain: number) => {
  if (pain <= 2) return 'text-green-600 bg-green-100';
  if (pain <= 4) return 'text-yellow-600 bg-yellow-100';
  if (pain <= 6) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getMoodIcon = (score: number) => {
  if (score >= 8) return Smile;
  if (score >= 5) return Meh;
  return Frown;
};

const getCategoryColor = (category: string) => {
  const colors = {
    pain: 'text-red-600 bg-red-100',
    mobility: 'text-blue-600 bg-blue-100',
    strength: 'text-purple-600 bg-purple-100',
    flexibility: 'text-green-600 bg-green-100',
    functional: 'text-orange-600 bg-orange-100'
  };
  return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

const getCategoryIcon = (category: string) => {
  const icons = {
    pain: AlertTriangle,
    mobility: Activity,
    strength: Zap,
    flexibility: Target,
    functional: CheckCircle
  };
  return icons[category as keyof typeof icons] || Target;
};

export default function ProgressVisualization() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const latestEntry = mockProgressData[0];
  const previousEntry = mockProgressData[1];
  const initialEntry = mockProgressData[mockProgressData.length - 1];

  const overallProgress = {
    painImprovement: ((initialEntry.painLevel - latestEntry.painLevel) / initialEntry.painLevel) * 100,
    mobilityImprovement: ((latestEntry.mobilityScore - initialEntry.mobilityScore) / initialEntry.mobilityScore) * 100,
    strengthImprovement: ((latestEntry.strengthScore - initialEntry.strengthScore) / initialEntry.strengthScore) * 100,
    functionalImprovement: ((latestEntry.functionalScore - initialEntry.functionalScore) / initialEntry.functionalScore) * 100
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Redução da Dor</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {overallProgress.painImprovement.toFixed(0)}%
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    De {initialEntry.painLevel} para {latestEntry.painLevel}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Melhora Mobilidade</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {overallProgress.mobilityImprovement.toFixed(0)}%
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Pontuação atual: {latestEntry.mobilityScore}/10
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganho de Força</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {overallProgress.strengthImprovement.toFixed(0)}%
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    Pontuação atual: {latestEntry.strengthScore}/10
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacidade Funcional</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {overallProgress.functionalImprovement.toFixed(0)}%
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    Pontuação atual: {latestEntry.functionalScore}/10
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema de Progresso */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Metas</span>
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Comparações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Resumo Atual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Status Atual
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Nível de Dor</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getPainColor(latestEntry.painLevel)}`}>
                            {latestEntry.painLevel}/10
                          </div>
                          {(() => {
                            const TrendIcon = getTrendIcon(latestEntry.painLevel, previousEntry.painLevel);
                            return (
                              <TrendIcon className={`h-4 w-4 ${getTrendColor(latestEntry.painLevel, previousEntry.painLevel, true)}`} />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Mobilidade</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(latestEntry.mobilityScore)}`}>
                            {latestEntry.mobilityScore}/10
                          </div>
                          {(() => {
                            const TrendIcon = getTrendIcon(latestEntry.mobilityScore, previousEntry.mobilityScore);
                            return (
                              <TrendIcon className={`h-4 w-4 ${getTrendColor(latestEntry.mobilityScore, previousEntry.mobilityScore)}`} />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Zap className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Força</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(latestEntry.strengthScore)}`}>
                            {latestEntry.strengthScore}/10
                          </div>
                          {(() => {
                            const TrendIcon = getTrendIcon(latestEntry.strengthScore, previousEntry.strengthScore);
                            return (
                              <TrendIcon className={`h-4 w-4 ${getTrendColor(latestEntry.strengthScore, previousEntry.strengthScore)}`} />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Target className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900 dark:text-white">Flexibilidade</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(latestEntry.flexibilityScore)}`}>
                            {latestEntry.flexibilityScore}/10
                          </div>
                          {(() => {
                            const TrendIcon = getTrendIcon(latestEntry.flexibilityScore, previousEntry.flexibilityScore);
                            return (
                              <TrendIcon className={`h-4 w-4 ${getTrendColor(latestEntry.flexibilityScore, previousEntry.flexibilityScore)}`} />
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-pink-600" />
                      Bem-estar Geral
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="text-center">
                        {(() => {
                          const MoodIcon = getMoodIcon(latestEntry.moodScore);
                          return (
                            <div className="flex items-center justify-center space-x-3 mb-4">
                              <MoodIcon className="h-12 w-12 text-blue-600" />
                              <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {latestEntry.moodScore}/10
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Humor Geral</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {latestEntry.exercisesCompleted}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Exercícios Hoje</div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {latestEntry.sessionDuration}min
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Tempo de Sessão</div>
                        </div>
                      </div>

                      {latestEntry.notes && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            "{latestEntry.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Gráfico de Evolução */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Evolução dos Últimos 6 Dias
                    </h3>
                    <select 
                      value={selectedMetric} 
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800"
                    >
                      <option value="all">Todas as métricas</option>
                      <option value="pain">Dor</option>
                      <option value="mobility">Mobilidade</option>
                      <option value="strength">Força</option>
                      <option value="flexibility">Flexibilidade</option>
                      <option value="functional">Funcional</option>
                    </select>
                  </div>
                  
                  <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de evolução do progresso</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {mockProgressData.length} avaliações registradas
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <div className="space-y-6">
              {/* Histórico Detalhado */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Histórico de Avaliações
                  </h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {mockProgressData.map((entry, index) => (
                      <AnimatedContainer key={entry.id} animation="slide-right" delay={index * 50}>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {new Date(entry.date).toLocaleDateString('pt-BR', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sessão de {entry.sessionDuration} minutos • {entry.exercisesCompleted} exercícios
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-4 mb-3">
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getPainColor(entry.painLevel)}`}>
                                {entry.painLevel}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Dor</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(entry.mobilityScore)}`}>
                                {entry.mobilityScore}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Mobilidade</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(entry.strengthScore)}`}>
                                {entry.strengthScore}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Força</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(entry.flexibilityScore)}`}>
                                {entry.flexibilityScore}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Flexibilidade</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(entry.functionalScore)}`}>
                                {entry.functionalScore}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Funcional</div>
                            </div>
                          </div>
                          
                          {entry.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 pl-3">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <div className="space-y-6">
              {/* Metas e Objetivos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockMilestones.map((goal) => {
                  const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                  const CategoryIcon = getCategoryIcon(goal.category);
                  
                  return (
                    <AnimatedContainer key={goal.id} animation="slide-up" delay={parseInt(goal.id.split('-')[1]) * 100}>
                      <Card>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                                <CategoryIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {goal.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {goal.description}
                                </p>
                              </div>
                            </div>
                            
                            {goal.achieved ? (
                              <div className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">Concluída</span>
                              </div>
                            ) : (
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  {progressPercentage.toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-500">completo</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  goal.achieved ? 'bg-green-500' :
                                  progressPercentage >= 75 ? 'bg-blue-500' :
                                  progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Meta: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                            </div>
                            
                            {goal.achieved && goal.achievedDate && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <Award className="h-4 w-4" />
                                <span>Concluída em {new Date(goal.achievedDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </AnimatedContainer>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparisons" className="mt-6">
            <div className="space-y-6">
              {/* Comparações por Período */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Comparação por Períodos
                  </h3>
                  
                  <div className="space-y-6">
                    {mockComparisons.map((period, index) => (
                      <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {period.label}
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(period.start).toLocaleDateString('pt-BR')} - {new Date(period.end).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <div className="text-xl font-bold text-red-600">
                                {period.painAverage.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Dor Média</div>
                            </div>
                            
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">
                                {period.mobilityAverage.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Mobilidade</div>
                            </div>
                            
                            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <div className="text-xl font-bold text-purple-600">
                                {period.strengthAverage.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Força</div>
                            </div>
                            
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-xl font-bold text-green-600">
                                {period.flexibilityAverage.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Flexibilidade</div>
                            </div>
                            
                            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <div className="text-xl font-bold text-orange-600">
                                {period.functionalAverage.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Funcional</div>
                            </div>
                            
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                {period.sessionsCompleted}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Sessões</div>
                            </div>
                          </div>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Análise Comparativa */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Principais Melhorias
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Redução da Dor</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Diminuição de {overallProgress.painImprovement.toFixed(0)}% desde o início
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Activity className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Melhoria da Mobilidade</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Aumento de {overallProgress.mobilityImprovement.toFixed(0)}% na mobilidade
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Zap className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Ganho de Força</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Fortalecimento de {overallProgress.strengthImprovement.toFixed(0)}% na força muscular
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Áreas de Foco
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Target className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Flexibilidade</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Continuar trabalho de alongamento para melhor amplitude
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Consistência</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manter regularidade nas sessões para otimizar resultados
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Award className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Progressão</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Avançar para exercícios mais desafiadores gradualmente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}