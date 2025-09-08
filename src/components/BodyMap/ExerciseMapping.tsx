import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Video,
  Calendar,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Filter,
  Search
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: 'stretching' | 'strengthening' | 'mobility' | 'stability' | 'cardio';
  bodyPart: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em segundos
  sets?: number;
  reps?: string;
  equipment?: string[];
  instructions: string[];
  benefits: string[];
  precautions?: string[];
  videoUrl?: string;
  imageUrl?: string;
  targetMuscles: string[];
  energyBurn: number; // calorias estimadas
  effectiveness: number; // 1-10
  patientRating?: number;
  completedSessions: number;
  lastCompleted?: string;
}

interface ExercisePlan {
  id: string;
  name: string;
  description: string;
  exercises: string[]; // IDs dos exercícios
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetConditions: string[];
  completionRate: number;
  nextSession?: string;
}

const mockExercises: Exercise[] = [
  {
    id: 'ex-001',
    name: 'Alongamento Cervical Lateral',
    category: 'stretching',
    bodyPart: ['Pescoço', 'Cervical'],
    difficulty: 'beginner',
    duration: 30,
    sets: 3,
    equipment: [],
    instructions: [
      'Sente-se ou fique em pé com a coluna ereta',
      'Incline suavemente a cabeça para o lado direito',
      'Mantenha a posição por 30 segundos',
      'Retorne à posição inicial e repita do lado esquerdo'
    ],
    benefits: [
      'Reduz tensão cervical',
      'Melhora flexibilidade do pescoço',
      'Alivia dores de cabeça tensionais'
    ],
    precautions: [
      'Não force o movimento',
      'Pare se sentir dor aguda'
    ],
    targetMuscles: ['Esternocleidomastoideo', 'Escalenos'],
    energyBurn: 5,
    effectiveness: 8,
    patientRating: 4.5,
    completedSessions: 12,
    lastCompleted: '2024-01-19'
  },
  {
    id: 'ex-002',
    name: 'Fortalecimento de Ombro com Resistência',
    category: 'strengthening',
    bodyPart: ['Ombro', 'Braço'],
    difficulty: 'intermediate',
    duration: 45,
    sets: 2,
    reps: '12-15',
    equipment: ['Faixa elástica'],
    instructions: [
      'Segure a faixa elástica com ambas as mãos',
      'Mantenha os braços ao lado do corpo',
      'Puxe a faixa afastando as mãos lateralmente',
      'Retorne controladamente à posição inicial'
    ],
    benefits: [
      'Fortalece músculos do ombro',
      'Melhora estabilidade articular',
      'Previne lesões futuras'
    ],
    targetMuscles: ['Deltoides', 'Supraespinhal', 'Infraespinhal'],
    energyBurn: 25,
    effectiveness: 9,
    patientRating: 4.8,
    completedSessions: 8,
    lastCompleted: '2024-01-18'
  },
  {
    id: 'ex-003',
    name: 'Mobilização Lombar em Flexão',
    category: 'mobility',
    bodyPart: ['Lombar', 'Quadril'],
    difficulty: 'beginner',
    duration: 60,
    sets: 2,
    equipment: [],
    instructions: [
      'Deite-se de costas no chão',
      'Flexione os joelhos em direção ao peito',
      'Abrace os joelhos com os braços',
      'Mantenha por 60 segundos respirando profundamente'
    ],
    benefits: [
      'Alonga musculatura lombar',
      'Reduz compressão discal',
      'Melhora flexibilidade da coluna'
    ],
    targetMuscles: ['Eretores da coluna', 'Quadrado lombar'],
    energyBurn: 8,
    effectiveness: 7,
    patientRating: 4.2,
    completedSessions: 15,
    lastCompleted: '2024-01-20'
  },
  {
    id: 'ex-004',
    name: 'Exercício de Estabilidade do Core',
    category: 'stability',
    bodyPart: ['Abdome', 'Core'],
    difficulty: 'intermediate',
    duration: 30,
    sets: 3,
    equipment: [],
    instructions: [
      'Deite-se de barriga para baixo',
      'Apoie-se nos antebraços e pontas dos pés',
      'Mantenha o corpo reto como uma prancha',
      'Contraia o abdome durante todo o exercício'
    ],
    benefits: [
      'Fortalece músculos do core',
      'Melhora postura',
      'Estabiliza coluna vertebral'
    ],
    precautions: [
      'Não arqueie as costas',
      'Mantenha respiração constante'
    ],
    targetMuscles: ['Transverso do abdome', 'Multífidos', 'Diafragma'],
    energyBurn: 35,
    effectiveness: 9,
    patientRating: 4.0,
    completedSessions: 6,
    lastCompleted: '2024-01-17'
  },
  {
    id: 'ex-005',
    name: 'Caminhada Terapêutica',
    category: 'cardio',
    bodyPart: ['Pernas', 'Cardiovascular'],
    difficulty: 'beginner',
    duration: 600, // 10 minutos
    equipment: [],
    instructions: [
      'Caminhe em ritmo moderado',
      'Mantenha postura ereta',
      'Balance os braços naturalmente',
      'Respire de forma ritmada'
    ],
    benefits: [
      'Melhora condicionamento cardiovascular',
      'Fortalece músculos das pernas',
      'Reduz rigidez articular',
      'Estimula circulação'
    ],
    targetMuscles: ['Quadríceps', 'Glúteos', 'Panturrilhas'],
    energyBurn: 50,
    effectiveness: 8,
    patientRating: 4.7,
    completedSessions: 20,
    lastCompleted: '2024-01-20'
  }
];

const mockExercisePlans: ExercisePlan[] = [
  {
    id: 'plan-001',
    name: 'Alívio de Dor Cervical',
    description: 'Programa específico para reduzir tensão e dor na região cervical',
    exercises: ['ex-001', 'ex-002'],
    estimatedTime: 15,
    difficulty: 'beginner',
    targetConditions: ['Dor cervical', 'Tensão muscular', 'Cefaleia tensional'],
    completionRate: 85,
    nextSession: '2024-01-21'
  },
  {
    id: 'plan-002',
    name: 'Fortalecimento Core Básico',
    description: 'Exercícios fundamentais para estabilização do core',
    exercises: ['ex-003', 'ex-004'],
    estimatedTime: 20,
    difficulty: 'intermediate',
    targetConditions: ['Dor lombar', 'Instabilidade postural'],
    completionRate: 70,
    nextSession: '2024-01-22'
  },
  {
    id: 'plan-003',
    name: 'Condicionamento Geral',
    description: 'Programa completo de condicionamento físico terapêutico',
    exercises: ['ex-001', 'ex-002', 'ex-003', 'ex-004', 'ex-005'],
    estimatedTime: 35,
    difficulty: 'intermediate',
    targetConditions: ['Condicionamento geral', 'Prevenção de lesões'],
    completionRate: 92,
    nextSession: '2024-01-21'
  }
];

const categoryColors = {
  stretching: 'text-blue-600 bg-blue-100',
  strengthening: 'text-red-600 bg-red-100',
  mobility: 'text-green-600 bg-green-100',
  stability: 'text-purple-600 bg-purple-100',
  cardio: 'text-orange-600 bg-orange-100'
};

const categoryLabels = {
  stretching: 'Alongamento',
  strengthening: 'Fortalecimento',
  mobility: 'Mobilidade',
  stability: 'Estabilidade',
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

export default function ExerciseMapping() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ExercisePlan | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('exercises');

  const filteredExercises = mockExercises.filter(exercise => {
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty === filterDifficulty;
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.bodyPart.some(part => part.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

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

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header com Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Exercícios Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockExercises.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Adesão</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.round(mockExercisePlans.reduce((sum, plan) => sum + plan.completionRate, 0) / mockExercisePlans.length)}%
                  </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessões Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockExercises.filter(ex => ex.lastCompleted === '2024-01-20').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avaliação Média</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {(mockExercises.reduce((sum, ex) => sum + (ex.patientRating || 0), 0) / mockExercises.length).toFixed(1)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema de Exercícios */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exercises" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Exercícios</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progresso</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="mt-6">
            {/* Filtros */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar exercícios..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="all">Todas categorias</option>
                <option value="stretching">Alongamento</option>
                <option value="strengthening">Fortalecimento</option>
                <option value="mobility">Mobilidade</option>
                <option value="stability">Estabilidade</option>
                <option value="cardio">Cardiovascular</option>
              </select>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="all">Todos níveis</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>

            {/* Lista de Exercícios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredExercises.map((exercise) => (
                <AnimatedContainer key={exercise.id} animation="slide-up" delay={parseInt(exercise.id.split('-')[1]) * 50}>
                  <Card hover className="group cursor-pointer" onClick={() => setSelectedExercise(exercise)}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {exercise.bodyPart.join(', ')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[exercise.category]}`}>
                            {categoryLabels[exercise.category]}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                            {difficultyLabels[exercise.difficulty]}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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
                        
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Sessões:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {exercise.completedSessions}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Avaliação:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {exercise.patientRating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {exercise.equipment && exercise.equipment.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Settings className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {exercise.equipment.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        
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
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockExercisePlans.map((plan) => (
                <AnimatedContainer key={plan.id} animation="slide-up" delay={parseInt(plan.id.split('-')[1]) * 100}>
                  <Card hover className="group cursor-pointer" onClick={() => setSelectedPlan(plan)}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {plan.description}
                          </p>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[plan.difficulty]}`}>
                          {difficultyLabels[plan.difficulty]}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Exercícios:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {plan.exercises.length}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Tempo estimado:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {plan.estimatedTime}min
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Adesão:</span>
                          <div className={`font-medium ${getCompletionColor(plan.completionRate)}`}>
                            {plan.completionRate}%
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Próxima sessão:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {plan.nextSession ? new Date(plan.nextSession).toLocaleDateString('pt-BR') : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Condições alvo:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plan.targetConditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                        <div 
                          className={`h-2 rounded-full ${
                            plan.completionRate >= 90 ? 'bg-green-500' :
                            plan.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${plan.completionRate}%` }}
                        />
                      </div>
                      
                      <Button size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar Plano
                      </Button>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progresso Geral */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Progresso Geral
                  </h3>
                  
                  <div className="space-y-4">
                    {mockExercises.slice(0, 3).map((exercise) => (
                      <div key={exercise.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {exercise.completedSessions} sessões
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {exercise.patientRating?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {Math.round((exercise.completedSessions / 20) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">conclusão</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Conquistas */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-600" />
                    Conquistas Recentes
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { title: '7 dias consecutivos', description: 'Exercícios diários completados', icon: Calendar, color: 'text-green-600' },
                      { title: 'Mestre do Core', description: '50 exercícios de estabilidade', icon: Target, color: 'text-purple-600' },
                      { title: 'Flexibilidade em Alta', description: '100 alongamentos realizados', icon: Zap, color: 'text-blue-600' },
                      { title: 'Feedback Positivo', description: 'Avaliação média acima de 4.5', icon: Star, color: 'text-yellow-600' }
                    ].map((achievement, index) => (
                      <AnimatedContainer key={index} animation="slide-left" delay={index * 100}>
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${achievement.color}`}>
                            <achievement.icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </p>
                          </div>
                          
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Gráfico de Aderência */}
            <Card className="mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Aderência aos Exercícios - Últimos 30 Dias
                </h3>
                
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Gráfico de aderência aos exercícios</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Média de {mockExercises.reduce((sum, ex) => sum + ex.completedSessions, 0)} sessões realizadas
                    </p>
                  </div>
                </div>
              </div>
            </Card>
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
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[selectedExercise.category]}`}>
                        {categoryLabels[selectedExercise.category]}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nível</label>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[selectedExercise.difficulty]}`}>
                        {difficultyLabels[selectedExercise.difficulty]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Instruções */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
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
                  
                  {/* Benefícios */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Benefícios
                    </h4>
                    <ul className="space-y-1">
                      {selectedExercise.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Precauções */}
                  {selectedExercise.precautions && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                        Precauções
                      </h4>
                      <ul className="space-y-1">
                        {selectedExercise.precautions.map((precaution, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-gray-700 dark:text-gray-300">{precaution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Músculos alvo */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Músculos Trabalhados
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.targetMuscles.map((muscle, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedExercise.completedSessions}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sessões</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedExercise.energyBurn}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cal/sessão</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedExercise.patientRating?.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avaliação</div>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
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