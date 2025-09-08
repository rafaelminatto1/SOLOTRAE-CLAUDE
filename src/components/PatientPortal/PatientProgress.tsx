import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Calendar,
  BarChart3,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Heart,
  Zap,
  Clock,
  Star,
  User,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download,
  Share,
  RefreshCw,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

interface ProgressEntry {
  id: string;
  date: string;
  painLevel: number;
  mobilityScore: number;
  strengthScore: number;
  energyLevel: number;
  moodScore: number;
  sleepQuality: number;
  exercisesCompleted: number;
  sessionDuration: number;
  notes?: string;
  symptoms: string[];
  improvements: string[];
}

interface TreatmentGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'pain' | 'mobility' | 'strength' | 'functional';
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  achieved: boolean;
  achievedDate?: string;
}

interface MilestoneAchievement {
  id: string;
  title: string;
  description: string;
  achievedDate: string;
  category: string;
  icon: string;
  points: number;
}

const mockProgressData: ProgressEntry[] = [
  {
    id: 'prog-001',
    date: '2024-01-20',
    painLevel: 3,
    mobilityScore: 8.5,
    strengthScore: 7.2,
    energyLevel: 8,
    moodScore: 9,
    sleepQuality: 7.5,
    exercisesCompleted: 5,
    sessionDuration: 45,
    notes: 'Dia excelente! Menos dor cervical, consegui fazer todos os exercícios.',
    symptoms: ['Leve rigidez matinal'],
    improvements: ['Maior amplitude de movimento no pescoço', 'Melhor postura']
  },
  {
    id: 'prog-002',
    date: '2024-01-19',
    painLevel: 4,
    mobilityScore: 7.8,
    strengthScore: 6.8,
    energyLevel: 7,
    moodScore: 8,
    sleepQuality: 6.5,
    exercisesCompleted: 4,
    sessionDuration: 35,
    symptoms: ['Dor leve no ombro direito', 'Tensão cervical'],
    improvements: ['Melhor equilíbrio']
  },
  {
    id: 'prog-003',
    date: '2024-01-18',
    painLevel: 5,
    mobilityScore: 7.0,
    strengthScore: 6.5,
    energyLevel: 6,
    moodScore: 7,
    sleepQuality: 6,
    exercisesCompleted: 3,
    sessionDuration: 30,
    symptoms: ['Dor moderada lombar', 'Rigidez matinal'],
    improvements: ['Exercícios ficando mais fáceis']
  },
  {
    id: 'prog-004',
    date: '2024-01-17',
    painLevel: 6,
    mobilityScore: 6.5,
    strengthScore: 6.0,
    energyLevel: 5,
    moodScore: 6,
    sleepQuality: 5.5,
    exercisesCompleted: 3,
    sessionDuration: 25,
    symptoms: ['Dor intensa pela manhã', 'Limitação de movimento'],
    improvements: []
  },
  {
    id: 'prog-005',
    date: '2024-01-16',
    painLevel: 7,
    mobilityScore: 6.0,
    strengthScore: 5.5,
    energyLevel: 4,
    moodScore: 5,
    sleepQuality: 5,
    exercisesCompleted: 2,
    sessionDuration: 20,
    symptoms: ['Dor constante', 'Fadiga'],
    improvements: []
  },
  {
    id: 'prog-006',
    date: '2024-01-15',
    painLevel: 8,
    mobilityScore: 5.0,
    strengthScore: 5.0,
    energyLevel: 3,
    moodScore: 4,
    sleepQuality: 4,
    exercisesCompleted: 2,
    sessionDuration: 15,
    symptoms: ['Dor severa', 'Rigidez significativa', 'Sono prejudicado'],
    improvements: []
  }
];

const mockTreatmentGoals: TreatmentGoal[] = [
  {
    id: 'goal-001',
    title: 'Reduzir Dor para Nível 2',
    description: 'Diminuir a intensidade da dor de 8 para 2 pontos na escala',
    targetValue: 2,
    currentValue: 3,
    unit: 'pontos',
    category: 'pain',
    deadline: '2024-02-15',
    priority: 'high',
    achieved: false
  },
  {
    id: 'goal-002',
    title: 'Mobilidade Excelente',
    description: 'Atingir pontuação de mobilidade de 9/10',
    targetValue: 9,
    currentValue: 8.5,
    unit: 'pontos',
    category: 'mobility',
    deadline: '2024-02-28',
    priority: 'high',
    achieved: false
  },
  {
    id: 'goal-003',
    title: 'Força Muscular Completa',
    description: 'Recuperar 90% da força muscular',
    targetValue: 9,
    currentValue: 7.2,
    unit: 'pontos',
    category: 'strength',
    deadline: '2024-03-15',
    priority: 'medium',
    achieved: false
  },
  {
    id: 'goal-004',
    title: '30 Dias Consecutivos',
    description: 'Completar 30 dias de exercícios sem interrupção',
    targetValue: 30,
    currentValue: 5,
    unit: 'dias',
    category: 'functional',
    deadline: '2024-02-20',
    priority: 'low',
    achieved: false
  }
];

const mockAchievements: MilestoneAchievement[] = [
  {
    id: 'ach-001',
    title: 'Primeira Semana Completa',
    description: 'Completou 7 dias consecutivos de exercícios',
    achievedDate: '2024-01-18',
    category: 'consistência',
    icon: 'calendar',
    points: 50
  },
  {
    id: 'ach-002',
    title: 'Redução Significativa de Dor',
    description: 'Diminuiu a dor em mais de 50%',
    achievedDate: '2024-01-20',
    category: 'recuperação',
    icon: 'trending-down',
    points: 100
  },
  {
    id: 'ach-003',
    title: 'Mobilidade Melhorada',
    description: 'Aumentou a mobilidade em 70%',
    achievedDate: '2024-01-19',
    category: 'movimento',
    icon: 'activity',
    points: 75
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

const getPainColor = (level: number) => {
  if (level <= 2) return 'text-green-600 bg-green-100';
  if (level <= 4) return 'text-yellow-600 bg-yellow-100';
  if (level <= 6) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600 bg-green-100';
  if (score >= 6) return 'text-blue-600 bg-blue-100';
  if (score >= 4) return 'text-yellow-600 bg-yellow-100';
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
    functional: 'text-green-600 bg-green-100'
  };
  return colors[category as keyof typeof colors];
};

const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-yellow-600 bg-yellow-100',
    low: 'text-green-600 bg-green-100'
  };
  return colors[priority as keyof typeof colors];
};

export default function PatientProgress() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const latestEntry = mockProgressData[0];
  const previousEntry = mockProgressData[1];
  const initialEntry = mockProgressData[mockProgressData.length - 1];

  const overallImprovement = {
    painReduction: ((initialEntry.painLevel - latestEntry.painLevel) / initialEntry.painLevel) * 100,
    mobilityIncrease: ((latestEntry.mobilityScore - initialEntry.mobilityScore) / initialEntry.mobilityScore) * 100,
    strengthGain: ((latestEntry.strengthScore - initialEntry.strengthScore) / initialEntry.strengthScore) * 100
  };

  const totalPoints = mockAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  return (
    <div className="space-y-6">
      {/* Header com Métricas Principais */}
      <AnimatedContainer animation="fade-in">
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
                Meu Progresso
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Acompanhe sua evolução e conquistas no tratamento
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {overallImprovement.painReduction.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Redução de Dor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {overallImprovement.mobilityIncrease.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Melhora Mobilidade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pontos Ganhos</div>
              </div>
            </div>
          </div>
        </Card>
      </AnimatedContainer>

      {/* Status Atual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Nível de Dor</h3>
                {(() => {
                  const TrendIcon = getTrendIcon(latestEntry.painLevel, previousEntry.painLevel);
                  return (
                    <TrendIcon className={`h-5 w-5 ${getTrendColor(latestEntry.painLevel, previousEntry.painLevel, true)}`} />
                  );
                })()}
              </div>
              <div className={`text-3xl font-bold mb-2 px-3 py-1 rounded-lg inline-block ${getPainColor(latestEntry.painLevel)}`}>
                {latestEntry.painLevel}/10
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {latestEntry.painLevel < previousEntry.painLevel ? 'Melhorando!' : 
                 latestEntry.painLevel > previousEntry.painLevel ? 'Precisa atenção' : 'Estável'}
              </p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Mobilidade</h3>
                {(() => {
                  const TrendIcon = getTrendIcon(latestEntry.mobilityScore, previousEntry.mobilityScore);
                  return (
                    <TrendIcon className={`h-5 w-5 ${getTrendColor(latestEntry.mobilityScore, previousEntry.mobilityScore)}`} />
                  );
                })()}
              </div>
              <div className={`text-3xl font-bold mb-2 px-3 py-1 rounded-lg inline-block ${getScoreColor(latestEntry.mobilityScore)}`}>
                {latestEntry.mobilityScore}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {latestEntry.mobilityScore >= 8 ? 'Excelente!' : 
                 latestEntry.mobilityScore >= 6 ? 'Bom progresso' : 'Continue praticando'}
              </p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Força Muscular</h3>
                {(() => {
                  const TrendIcon = getTrendIcon(latestEntry.strengthScore, previousEntry.strengthScore);
                  return (
                    <TrendIcon className={`h-5 w-5 ${getTrendColor(latestEntry.strengthScore, previousEntry.strengthScore)}`} />
                  );
                })()}
              </div>
              <div className={`text-3xl font-bold mb-2 px-3 py-1 rounded-lg inline-block ${getScoreColor(latestEntry.strengthScore)}`}>
                {latestEntry.strengthScore}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                +{overallImprovement.strengthGain.toFixed(0)}% vs inicial
              </p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={400}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Humor Geral</h3>
                {(() => {
                  const MoodIcon = getMoodIcon(latestEntry.moodScore);
                  return <MoodIcon className="h-5 w-5 text-blue-600" />;
                })()}
              </div>
              <div className={`text-3xl font-bold mb-2 px-3 py-1 rounded-lg inline-block ${getScoreColor(latestEntry.moodScore)}`}>
                {latestEntry.moodScore}/10
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {latestEntry.moodScore >= 8 ? 'Muito bem!' : 
                 latestEntry.moodScore >= 6 ? 'Melhorando' : 'Precisa cuidado'}
              </p>
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
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Metas</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Conquistas</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Gráficos de Evolução */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Evolução da Dor
                      </h3>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
                      >
                        <option value="week">Última semana</option>
                        <option value="month">Último mês</option>
                        <option value="all">Todo período</option>
                      </select>
                    </div>
                    
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Gráfico de evolução da dor</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Redução de {overallImprovement.painReduction.toFixed(0)}% na dor
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Mobilidade e Força
                    </h3>
                    
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Gráfico comparativo</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Melhora consistente em ambas as áreas
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Resumo dos Últimos Dias */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Resumo dos Últimos 5 Dias
                  </h3>
                  
                  <div className="space-y-4">
                    {mockProgressData.slice(0, 5).map((entry, index) => (
                      <AnimatedContainer key={entry.id} animation="slide-right" delay={index * 100}>
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-center min-w-[60px]">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {new Date(entry.date).getDate()}/{new Date(entry.date).getMonth() + 1}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                            </div>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded text-sm font-bold ${getPainColor(entry.painLevel)}`}>
                                {entry.painLevel}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Dor</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(entry.mobilityScore)}`}>
                                {entry.mobilityScore}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Mobilidade</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(entry.strengthScore)}`}>
                                {entry.strengthScore}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Força</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {entry.exercisesCompleted}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Exercícios</div>
                            </div>
                          </div>
                          
                          <div className="min-w-[100px]">
                            {entry.improvements.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.improvements.slice(0, 2).map((improvement, i) => (
                                  <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    ✓
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {entry.symptoms.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.symptoms.slice(0, 1).map((_, i) => (
                                  <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                                    !
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Minhas Metas de Tratamento
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {mockTreatmentGoals.filter(goal => goal.achieved).length} de {mockTreatmentGoals.length} concluídas
                </div>
              </div>

              <div className="grid gap-6">
                {mockTreatmentGoals.map((goal) => {
                  const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                  const isInverted = goal.category === 'pain';
                  const actualProgress = isInverted ? 
                    Math.min(((8 - goal.currentValue) / (8 - goal.targetValue)) * 100, 100) : 
                    progressPercentage;
                  
                  return (
                    <AnimatedContainer key={goal.id} animation="slide-up" delay={parseInt(goal.id.split('-')[1]) * 100}>
                      <Card>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                                {goal.category === 'pain' && <AlertTriangle className="h-6 w-6" />}
                                {goal.category === 'mobility' && <Activity className="h-6 w-6" />}
                                {goal.category === 'strength' && <Zap className="h-6 w-6" />}
                                {goal.category === 'functional' && <Target className="h-6 w-6" />}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {goal.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  {goal.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                                    {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {goal.achieved ? (
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                                <span className="font-medium">Concluída!</span>
                              </div>
                            ) : (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {Math.round(actualProgress)}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">progresso</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                {isInverted ? 'Reduzir de 8 para' : 'Atingir'} {goal.targetValue} {goal.unit}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                Atual: {goal.currentValue} {goal.unit}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  goal.achieved ? 'bg-green-500' :
                                  actualProgress >= 75 ? 'bg-blue-500' :
                                  actualProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${actualProgress}%` }}
                              />
                            </div>
                          </div>
                          
                          {!goal.achieved && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {isInverted ? 
                                `Faltam ${(goal.currentValue - goal.targetValue).toFixed(1)} pontos para atingir a meta` :
                                `Faltam ${(goal.targetValue - goal.currentValue).toFixed(1)} pontos para atingir a meta`
                              }
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

          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conquistas Desbloqueadas
                </h3>
                <div className="flex items-center space-x-2 text-yellow-600">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">{totalPoints} pontos</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAchievements.map((achievement) => (
                  <AnimatedContainer key={achievement.id} animation="scale-in" delay={parseInt(achievement.id.split('-')[1]) * 100}>
                    <Card className="relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-400 to-yellow-600 transform rotate-45 translate-x-6 -translate-y-6" />
                      <div className="absolute top-2 right-2 text-white font-bold text-sm">
                        +{achievement.points}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                            {achievement.icon === 'calendar' && <Calendar className="h-6 w-6" />}
                            {achievement.icon === 'trending-down' && <TrendingDown className="h-6 w-6" />}
                            {achievement.icon === 'activity' && <Activity className="h-6 w-6" />}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {new Date(achievement.achievedDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {achievement.category}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>

              {/* Próximas Conquistas */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Próximas Conquistas
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'Sequência de 10 dias', description: 'Exercícios por 10 dias consecutivos', progress: 50, points: 75 },
                      { title: 'Zero dor', description: 'Atingir nível de dor 0', progress: 62, points: 150 },
                      { title: '50 exercícios completados', description: 'Completar 50 exercícios totais', progress: 80, points: 100 }
                    ].map((upcoming, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-gray-500" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{upcoming.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{upcoming.description}</p>
                          
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Progresso</span>
                              <span className="text-gray-900 dark:text-white font-medium">{upcoming.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div 
                                className="bg-yellow-500 h-1 rounded-full"
                                style={{ width: `${upcoming.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-yellow-600 font-bold">+{upcoming.points}</div>
                          <div className="text-xs text-gray-500">pontos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Histórico Detalhado
                </h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              {mockProgressData.map((entry, index) => (
                <AnimatedContainer key={entry.id} animation="slide-up" delay={index * 50}>
                  <Card hover>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
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
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Energia</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {entry.energyLevel}/10
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`px-2 py-1 rounded text-sm font-bold ${getPainColor(entry.painLevel)}`}>
                            {entry.painLevel}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Dor</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(entry.mobilityScore)}`}>
                            {entry.mobilityScore}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Mobilidade</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(entry.strengthScore)}`}>
                            {entry.strengthScore}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Força</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(entry.moodScore)}`}>
                            {entry.moodScore}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Humor</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(entry.sleepQuality)}`}>
                            {entry.sleepQuality}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Sono</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold">
                            {entry.exercisesCompleted}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Exercícios</div>
                        </div>
                      </div>
                      
                      {entry.notes && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            "{entry.notes}"
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entry.symptoms.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1 text-orange-600" />
                              Sintomas
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {entry.symptoms.map((symptom, i) => (
                                <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.improvements.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                              Melhorias
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {entry.improvements.map((improvement, i) => (
                                <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  {improvement}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}