import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Zap,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Target,
  Award,
  Calendar,
  Activity,
  TrendingUp,
  Video,
  BookOpen,
  Timer,
  RotateCcw,
  Star,
  AlertTriangle,
  Info,
  Heart,
  Settings,
  Download
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'stretching' | 'strengthening' | 'mobility' | 'balance' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em segundos
  sets?: number;
  reps?: string;
  restBetweenSets?: number;
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  targetMuscles: string[];
  benefits: string[];
  precautions?: string[];
  completedToday: boolean;
  completedThisWeek: number;
  totalCompleted: number;
  streak: number;
  lastCompleted?: string;
  rating?: number;
  feedback?: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: string[];
  completionRate: number;
  estimatedCalories: number;
  targetAreas: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  nextSession?: string;
}

const mockExercises: Exercise[] = [
  {
    id: 'ex001',
    name: 'Alongamento Cervical Lateral',
    description: 'Exercício para alívio de tensão no pescoço e melhora da flexibilidade cervical',
    category: 'stretching',
    difficulty: 'beginner',
    duration: 30,
    sets: 3,
    instructions: [
      'Sente-se com a coluna ereta',
      'Incline suavemente a cabeça para o lado direito',
      'Mantenha por 30 segundos',
      'Retorne ao centro e repita do lado esquerdo'
    ],
    tips: [
      'Respire profundamente durante o exercício',
      'Não force o movimento',
      'Mantenha os ombros relaxados'
    ],
    targetMuscles: ['Esternocleidomastoideo', 'Escalenos', 'Trapézio superior'],
    benefits: [
      'Reduz tensão cervical',
      'Melhora amplitude de movimento',
      'Previne dores de cabeça'
    ],
    precautions: ['Não realizar se houver dor aguda', 'Movimentos suaves apenas'],
    completedToday: true,
    completedThisWeek: 5,
    totalCompleted: 28,
    streak: 5,
    lastCompleted: '2024-01-20T09:30:00Z',
    rating: 4.5,
    feedback: 'Muito eficaz para alívio da tensão'
  },
  {
    id: 'ex002',
    name: 'Fortalecimento de Ombro com Faixa',
    description: 'Exercício com faixa elástica para fortalecer músculos do ombro',
    category: 'strengthening',
    difficulty: 'intermediate',
    duration: 45,
    sets: 2,
    reps: '12-15',
    restBetweenSets: 60,
    instructions: [
      'Segure a faixa elástica com ambas as mãos',
      'Mantenha os braços ao lado do corpo',
      'Puxe afastando as mãos lateralmente',
      'Retorne controladamente à posição inicial'
    ],
    tips: [
      'Mantenha o core contraído',
      'Controle o movimento na volta',
      'Ajuste a resistência conforme necessário'
    ],
    targetMuscles: ['Deltoides', 'Supraespinhal', 'Infraespinhal', 'Redondo menor'],
    benefits: [
      'Fortalece músculos estabilizadores',
      'Melhora postura',
      'Previne lesões no ombro'
    ],
    completedToday: false,
    completedThisWeek: 3,
    totalCompleted: 15,
    streak: 0,
    lastCompleted: '2024-01-19T16:45:00Z',
    rating: 4.8
  },
  {
    id: 'ex003',
    name: 'Mobilização Lombar - Joelho no Peito',
    description: 'Exercício de mobilização para alívio da tensão lombar',
    category: 'mobility',
    difficulty: 'beginner',
    duration: 60,
    sets: 2,
    instructions: [
      'Deite-se de costas',
      'Flexione um joelho em direção ao peito',
      'Abrace o joelho com ambas as mãos',
      'Mantenha por 60 segundos',
      'Repita com a outra perna'
    ],
    tips: [
      'Respire profundamente',
      'Relaxe a coluna no chão',
      'Não balance o corpo'
    ],
    targetMuscles: ['Eretores da coluna', 'Psoas', 'Glúteos'],
    benefits: [
      'Reduz compressão discal',
      'Alonga musculatura posterior',
      'Melhora flexibilidade lombar'
    ],
    completedToday: true,
    completedThisWeek: 4,
    totalCompleted: 22,
    streak: 3,
    lastCompleted: '2024-01-20T19:15:00Z',
    rating: 4.2
  },
  {
    id: 'ex004',
    name: 'Equilíbrio Unipodal',
    description: 'Exercício de equilíbrio em uma perna só',
    category: 'balance',
    difficulty: 'intermediate',
    duration: 30,
    sets: 3,
    instructions: [
      'Fique em pé apoiado em uma perna',
      'Mantenha o equilíbrio por 30 segundos',
      'Troque de perna',
      'Use apoio se necessário inicialmente'
    ],
    tips: [
      'Olhe para um ponto fixo',
      'Mantenha o core ativado',
      'Progrida gradualmente'
    ],
    targetMuscles: ['Músculos estabilizadores', 'Core', 'Glúteo médio'],
    benefits: [
      'Melhora propriocepção',
      'Fortalece estabilizadores',
      'Previne quedas'
    ],
    completedToday: false,
    completedThisWeek: 2,
    totalCompleted: 18,
    streak: 0,
    lastCompleted: '2024-01-18T14:20:00Z',
    rating: 4.0
  },
  {
    id: 'ex005',
    name: 'Caminhada Estacionária',
    description: 'Exercício cardiovascular de baixo impacto',
    category: 'cardio',
    difficulty: 'beginner',
    duration: 300, // 5 minutos
    instructions: [
      'Caminhe no lugar elevando bem os joelhos',
      'Balance os braços naturalmente',
      'Mantenha postura ereta',
      'Controle a respiração'
    ],
    tips: [
      'Inicie devagar',
      'Aumente gradualmente a intensidade',
      'Pare se sentir falta de ar'
    ],
    targetMuscles: ['Quadríceps', 'Glúteos', 'Panturrilhas', 'Core'],
    benefits: [
      'Melhora condicionamento',
      'Fortalece pernas',
      'Baixo impacto nas articulações'
    ],
    completedToday: true,
    completedThisWeek: 6,
    totalCompleted: 35,
    streak: 6,
    lastCompleted: '2024-01-20T08:00:00Z',
    rating: 4.7
  }
];

const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'plan001',
    name: 'Alívio de Dor Cervical',
    description: 'Programa específico para reduzir tensão e dor na região cervical',
    totalDuration: 15,
    difficulty: 'beginner',
    exercises: ['ex001', 'ex002'],
    completionRate: 85,
    estimatedCalories: 25,
    targetAreas: ['Pescoço', 'Ombros', 'Parte superior das costas'],
    isActive: true,
    createdBy: 'Dr. Ana Silva',
    createdAt: '2024-01-10',
    nextSession: '2024-01-21'
  },
  {
    id: 'plan002',
    name: 'Mobilidade Lombar',
    description: 'Exercícios para melhora da flexibilidade e mobilidade lombar',
    totalDuration: 12,
    difficulty: 'beginner',
    exercises: ['ex003'],
    completionRate: 90,
    estimatedCalories: 15,
    targetAreas: ['Lombar', 'Quadris'],
    isActive: true,
    createdBy: 'Dr. Ana Silva',
    createdAt: '2024-01-08',
    nextSession: '2024-01-21'
  },
  {
    id: 'plan003',
    name: 'Condicionamento Geral',
    description: 'Programa completo para condicionamento físico geral',
    totalDuration: 25,
    difficulty: 'intermediate',
    exercises: ['ex001', 'ex002', 'ex003', 'ex004', 'ex005'],
    completionRate: 70,
    estimatedCalories: 85,
    targetAreas: ['Corpo todo'],
    isActive: false,
    createdBy: 'Dr. Ana Silva',
    createdAt: '2024-01-05'
  }
];

const categoryColors = {
  stretching: 'text-blue-600 bg-blue-100',
  strengthening: 'text-red-600 bg-red-100',
  mobility: 'text-green-600 bg-green-100',
  balance: 'text-purple-600 bg-purple-100',
  cardio: 'text-orange-600 bg-orange-100'
};

const categoryLabels = {
  stretching: 'Alongamento',
  strengthening: 'Fortalecimento',
  mobility: 'Mobilidade',
  balance: 'Equilíbrio',
  cardio: 'Cardiovascular'
};

const difficultyColors = {
  beginner: 'text-green-600 bg-green-100',
  intermediate: 'text-yellow-600 bg-yellow-100',
  advanced: 'text-red-600 bg-red-100'
};

const difficultyLabels = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado'
};

export default function PatientExercisePlan() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('today');

  const todayExercises = mockExercises.filter(ex => 
    mockWorkoutPlans.some(plan => plan.isActive && plan.exercises.includes(ex.id))
  );

  const completedToday = mockExercises.filter(ex => ex.completedToday).length;
  const totalToday = todayExercises.length;
  const streakDays = Math.max(...mockExercises.map(ex => ex.streak));
  const weeklyProgress = mockExercises.reduce((sum, ex) => sum + ex.completedThisWeek, 0);

  const startTimer = (exerciseId: string, duration: number) => {
    setActiveTimer(exerciseId);
    setTimeLeft(duration);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setActiveTimer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <AnimatedContainer animation="fade-in">
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Zap className="h-6 w-6 mr-3 text-blue-600" />
                Meu Plano de Exercícios
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Exercícios personalizados para sua recuperação
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedToday}/{totalToday}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{streakDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sequência</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{weeklyProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Semana</div>
              </div>
            </div>
          </div>
        </Card>
      </AnimatedContainer>

      {/* Progresso Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Progresso Diário</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Meta: {totalToday} exercícios</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{Math.round((completedToday / totalToday) * 100)}%</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedToday / totalToday) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Sequência Atual</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dias consecutivos</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{streakDays} dias</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Continue assim!</div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Próxima Sessão</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Agendamento</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">Amanhã</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">09:00 - Dr. Ana Silva</div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema de Exercícios */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Hoje</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progresso</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Biblioteca</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Exercícios de Hoje ({completedToday}/{totalToday})
                </h3>
                <Button size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar Sessão
                </Button>
              </div>

              {todayExercises.map((exercise, index) => (
                <AnimatedContainer key={exercise.id} animation="slide-up" delay={index * 100}>
                  <Card hover className="group cursor-pointer" onClick={() => setSelectedExercise(exercise)}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            exercise.completedToday ? 'bg-green-100 text-green-600' : categoryColors[exercise.category]
                          }`}>
                            {exercise.completedToday ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Zap className="h-6 w-6" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                                {exercise.name}
                              </h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[exercise.category]}`}>
                                {categoryLabels[exercise.category]}
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                                {difficultyLabels[exercise.difficulty]}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {exercise.description}
                            </p>
                            
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Duração:</span>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {exercise.duration >= 60 ? `${Math.floor(exercise.duration / 60)}min` : `${exercise.duration}s`}
                                </div>
                              </div>
                              
                              {exercise.sets && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Séries:</span>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {exercise.sets}
                                  </div>
                                </div>
                              )}
                              
                              {exercise.reps && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Repetições:</span>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {exercise.reps}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Sequência:</span>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {exercise.streak} dias
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {exercise.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {exercise.rating}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startTimer(exercise.id, exercise.duration);
                              }}
                              disabled={activeTimer === exercise.id}
                            >
                              {activeTimer === exercise.id ? (
                                <>
                                  <Timer className="h-4 w-4 mr-1" />
                                  {formatTime(timeLeft)}
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Iniciar
                                </>
                              )}
                            </Button>
                            
                            {exercise.videoUrl && (
                              <Button variant="outline" size="sm">
                                <Video className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <div className="space-y-6">
              {mockWorkoutPlans.map((plan) => (
                <AnimatedContainer key={plan.id} animation="slide-up" delay={parseInt(plan.id.substring(4)) * 100}>
                  <Card hover className={`${plan.isActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            {plan.isActive && (
                              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Ativo
                              </div>
                            )}
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[plan.difficulty]}`}>
                              {difficultyLabels[plan.difficulty]}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{plan.exercises.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Exercícios</div>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{plan.totalDuration}min</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Duração</div>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{plan.estimatedCalories}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Calorias</div>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{plan.completionRate}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Adesão</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Áreas trabalhadas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.targetAreas.map((area, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Criado por {plan.createdBy} em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                          {plan.nextSession && (
                            <div className="mt-1">
                              Próxima sessão: {new Date(plan.nextSession).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {plan.isActive ? (
                            <Button size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Continuar
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Detalhes
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progresso do plano</span>
                          <span className="font-medium text-gray-900 dark:text-white">{plan.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${plan.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="space-y-6">
              {/* Gráfico de Progresso Semanal */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Progresso dos Últimos 7 Dias
                  </h3>
                  
                  <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de progresso semanal</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {weeklyProgress} exercícios completados esta semana
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Estatísticas de Progresso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Estatísticas Gerais
                    </h3>
                    
                    <div className="space-y-4">
                      {mockExercises.slice(0, 3).map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Total: {exercise.totalCompleted}</span>
                              <span>Semana: {exercise.completedThisWeek}</span>
                              <span>Sequência: {exercise.streak}</span>
                            </div>
                          </div>
                          
                          {exercise.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {exercise.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Conquistas
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Award className="h-6 w-6 text-yellow-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Sequência de 5 dias</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Parabéns pela consistência!</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">100 exercícios completados</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Marco importante atingido</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Heart className="h-6 w-6 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Dedicação exemplar</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">85% de adesão aos exercícios</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Biblioteca de Exercícios ({mockExercises.length})
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar PDF
                </Button>
              </div>

              <div className="grid gap-4">
                {mockExercises.map((exercise, index) => (
                  <AnimatedContainer key={exercise.id} animation="slide-up" delay={index * 50}>
                    <Card hover className="group cursor-pointer" onClick={() => setSelectedExercise(exercise)}>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${categoryColors[exercise.category]}`}>
                              <Zap className="h-5 w-5" />
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                                {exercise.name}
                              </h4>
                              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[exercise.category]}`}>
                                  {categoryLabels[exercise.category]}
                                </span>
                                <span>
                                  {exercise.duration >= 60 ? `${Math.floor(exercise.duration / 60)}min` : `${exercise.duration}s`}
                                </span>
                                <span>Feito {exercise.totalCompleted}x</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {exercise.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {exercise.rating}
                                </span>
                              </div>
                            )}
                            
                            {exercise.videoUrl && (
                              <Video className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal de Detalhes do Exercício */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AnimatedContainer animation="scale-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedExercise.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExercise(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedExercise.description}
                  </p>
                  
                  {/* Instruções */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Como fazer
                    </h4>
                    <ol className="space-y-2">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  {/* Dicas */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-green-600" />
                      Dicas importantes
                    </h4>
                    <ul className="space-y-1">
                      {selectedExercise.tips.map((tip, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Precauções */}
                  {selectedExercise.precautions && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                        Precauções
                      </h4>
                      <ul className="space-y-1">
                        {selectedExercise.precautions.map((precaution, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-gray-700 dark:text-gray-300">{precaution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedExercise.totalCompleted}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedExercise.streak}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sequência</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedExercise.rating || 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avaliação</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1"
                      onClick={() => startTimer(selectedExercise.id, selectedExercise.duration)}
                      disabled={activeTimer === selectedExercise.id}
                    >
                      {activeTimer === selectedExercise.id ? (
                        <>
                          <Timer className="h-4 w-4 mr-2" />
                          {formatTime(timeLeft)}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Exercício
                        </>
                      )}
                    </Button>
                    {selectedExercise.videoUrl && (
                      <Button variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Ver Vídeo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedContainer>
        </div>
      )}
    </div>
  );
}