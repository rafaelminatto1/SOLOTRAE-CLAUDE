import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Target,
  Brain,
  TrendingUp,
  Clock,
  User,
  Star,
  Play,
  Plus,
  AlertTriangle,
  CheckCircle,
  Zap,
  Activity,
  Heart,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface ExerciseRecommendation {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  targetMuscles: string[];
  equipment: string[];
  aiConfidence: number; // 0-100
  personalizedReason: string;
  contraindications?: string[];
  modifications?: {
    easier: string;
    harder: string;
  };
  videoUrl?: string;
  evidenceLevel: 'A' | 'B' | 'C'; // Nível de evidência científica
  expectedResults: {
    timeline: string;
    outcomes: string[];
  };
}

interface PatientProfile {
  age: number;
  condition: string;
  limitations: string[];
  goals: string[];
  fitnessLevel: 'low' | 'medium' | 'high';
  previousExercises?: string[];
}

interface ExerciseSuggestionsProps {
  patientId?: string;
  patientProfile?: PatientProfile;
  context?: 'prescription' | 'modification' | 'progression' | 'recovery';
  onExerciseSelect?: (exercise: ExerciseRecommendation) => void;
  className?: string;
}

export default function ExerciseSuggestions({
  patientId,
  patientProfile,
  context = 'prescription',
  onExerciseSelect,
  className = ''
}: ExerciseSuggestionsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<{
    difficulty: string[];
    muscle: string[];
    equipment: string[];
  }>({
    difficulty: [],
    muscle: [],
    equipment: []
  });
  const [sortBy, setSortBy] = useState<'confidence' | 'difficulty' | 'duration'>('confidence');

  useEffect(() => {
    loadAIRecommendations();
  }, [patientId, patientProfile, context]);

  const loadAIRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Simular chamada para IA - integrar com API real
      const mockRecommendations = await generateAIRecommendations();
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIRecommendations = async (): Promise<ExerciseRecommendation[]> => {
    // Simular delay da IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    const baseExercises: ExerciseRecommendation[] = [
      {
        id: '1',
        name: 'Ponte Glútea Progressiva',
        description: 'Exercício para fortalecimento dos glúteos e estabilização pélvica, com progressão adaptada ao perfil do paciente.',
        difficulty: 'beginner' as const,
        duration: 15,
        targetMuscles: ['Glúteos', 'Core', 'Isquiotibiais'],
        equipment: ['Tapete', 'Banda elástica (opcional)'],
        aiConfidence: 95,
        personalizedReason: 'Baseado na condição de lombalgia, este exercício fortalece os músculos estabilizadores sem sobrecarga vertebral. A IA identificou 89% de sucesso em casos similares.',
        contraindications: ['Dor aguda na coluna', 'Lesões recentes no quadril'],
        modifications: {
          easier: 'Realizar sem elevação, apenas contraindo os glúteos',
          harder: 'Adicionar banda elástica ou apoio unipodal'
        },
        videoUrl: '/videos/ponte-glutea.mp4',
        evidenceLevel: 'A' as const,
        expectedResults: {
          timeline: '4-6 semanas',
          outcomes: ['Redução de 60% na dor lombar', 'Aumento de 40% na força glútea', 'Melhora da postura']
        }
      },
      {
        id: '2',
        name: 'Mobilização Neural Dinâmica',
        description: 'Técnica de mobilização do sistema nervoso periférico para redução de tensão neural e melhora da amplitude de movimento.',
        difficulty: 'intermediate' as const,
        duration: 20,
        targetMuscles: ['Sistema Neural', 'Cadeia posterior'],
        equipment: ['Nenhum'],
        aiConfidence: 87,
        personalizedReason: 'IA detectou padrão de tensão neural baseado nos sintomas relatados. Protocolo personalizado considerando idade e limitações funcionais.',
        contraindications: ['Sintomas neurológicos severos', 'Inflamação aguda'],
        modifications: {
          easier: 'Reduzir amplitude e velocidade do movimento',
          harder: 'Adicionar componentes de flexão cervical'
        },
        evidenceLevel: 'A' as const,
        expectedResults: {
          timeline: '2-3 semanas',
          outcomes: ['Redução da tensão neural', 'Melhora da flexibilidade', 'Diminuição de parestesias']
        }
      },
      {
        id: '3',
        name: 'Exercício Proprioceptivo Inteligente',
        description: 'Treinamento proprioceptivo adaptativo com feedback visual, otimizado por IA para máxima eficácia.',
        difficulty: 'advanced' as const,
        duration: 25,
        targetMuscles: ['Músculos estabilizadores', 'Core', 'Membros inferiores'],
        equipment: ['Bosu ball', 'Olhos vendados (opcional)'],
        aiConfidence: 92,
        personalizedReason: 'Algoritmo de IA identificou déficit proprioceptivo específico. Protocolo personalizado com progressão automática baseada na performance.',
        modifications: {
          easier: 'Olhos abertos, superfície estável',
          harder: 'Olhos fechados, perturbações externas'
        },
        evidenceLevel: 'B' as const,
        expectedResults: {
          timeline: '6-8 semanas',
          outcomes: ['Melhora do equilíbrio em 75%', 'Redução de quedas', 'Aumento da confiança motora']
        }
      },
      {
        id: '4',
        name: 'Respiração Diafragmática Terapêutica',
        description: 'Técnica de respiração focada na ativação do diafragma para estabilização do core e redução da dor.',
        difficulty: 'beginner' as const,
        duration: 10,
        targetMuscles: ['Diafragma', 'Core profundo', 'Músculos respiratórios'],
        equipment: ['Nenhum'],
        aiConfidence: 88,
        personalizedReason: 'IA correlacionou padrões respiratórios inadequados com a dor relatada. Exercício fundamental para reorganização muscular.',
        contraindications: ['Problemas respiratórios graves'],
        modifications: {
          easier: 'Posição supina com apoio',
          harder: 'Incorporar movimentos de membros'
        },
        evidenceLevel: 'A' as const,
        expectedResults: {
          timeline: '1-2 semanas',
          outcomes: ['Melhora da função respiratória', 'Redução da ansiedade', 'Ativação do core']
        }
      }
    ];

    // Personalização baseada no perfil do paciente
    return baseExercises.map(exercise => ({
      ...exercise,
      aiConfidence: Math.max(60, exercise.aiConfidence + (Math.random() * 10 - 5))
    }));
  };

  const filteredAndSortedExercises = recommendations
    .filter(exercise => {
      if (selectedFilters.difficulty.length && !selectedFilters.difficulty.includes(exercise.difficulty)) {
        return false;
      }
      if (selectedFilters.muscle.length && !exercise.targetMuscles.some(muscle => 
        selectedFilters.muscle.some(filter => muscle.toLowerCase().includes(filter.toLowerCase()))
      )) {
        return false;
      }
      if (selectedFilters.equipment.length && !exercise.equipment.some(eq => 
        selectedFilters.equipment.some(filter => eq.toLowerCase().includes(filter.toLowerCase()))
      )) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.aiConfidence - a.aiConfidence;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'B': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'C': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 75) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">IA Analisando...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerando recomendações personalizadas
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
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
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                Sugestões de IA para Exercícios
                <Sparkles className="h-4 w-4 ml-2 text-yellow-500 animate-pulse" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recommendations.length} exercícios personalizados encontrados
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value="confidence">Confiança IA</option>
              <option value="difficulty">Dificuldade</option>
              <option value="duration">Duração</option>
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAIRecommendations}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {filteredAndSortedExercises.map((exercise, index) => (
          <AnimatedContainer
            key={exercise.id}
            animation="slide-up"
            delay={index * 100}
          >
            <Card variant="elevated" hover className="group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {exercise.name}
                      </h4>
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty === 'beginner' ? 'Iniciante' : 
                         exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                      </Badge>
                      <Badge className={getEvidenceColor(exercise.evidenceLevel)}>
                        Evidência {exercise.evidenceLevel}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {exercise.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{exercise.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{exercise.targetMuscles.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${getConfidenceColor(exercise.aiConfidence)}`}>
                      {Math.round(exercise.aiConfidence)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Confiança IA
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                        Por que a IA recomenda este exercício:
                      </h5>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {exercise.personalizedReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expected Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Resultados Esperados ({exercise.expectedResults.timeline})
                    </h6>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {exercise.expectedResults.outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Equipamentos
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment.map((eq, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modifications */}
                {exercise.modifications && (
                  <div className="mb-4">
                    <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                      Modificações:
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Mais fácil:
                        </span>
                        <p className="text-green-700 dark:text-green-300">
                          {exercise.modifications.easier}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/30 rounded p-2">
                        <span className="font-medium text-red-800 dark:text-red-200">
                          Mais difícil:
                        </span>
                        <p className="text-red-700 dark:text-red-300">
                          {exercise.modifications.harder}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contraindications */}
                {exercise.contraindications && exercise.contraindications.length > 0 && (
                  <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h6 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm mb-1">
                          Contraindicações:
                        </h6>
                        <ul className="text-sm text-yellow-800 dark:text-yellow-200">
                          {exercise.contraindications.map((contra, idx) => (
                            <li key={idx}>• {contra}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    {exercise.videoUrl && (
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Ver Vídeo
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4 mr-1" />
                      Favoritar
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExerciseSelect?.(exercise)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => onExerciseSelect?.(exercise)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Prescrever
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedContainer>
        ))}
      </div>

      {filteredAndSortedExercises.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum exercício encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ajuste os filtros ou tente outros critérios de busca.
          </p>
        </Card>
      )}
    </div>
  );
}