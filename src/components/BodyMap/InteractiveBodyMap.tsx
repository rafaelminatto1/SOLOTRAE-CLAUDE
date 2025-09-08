import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  User,
  MapPin,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  Zap
} from 'lucide-react';

interface PainPoint {
  id: string;
  x: number;
  y: number;
  intensity: number;
  type: 'pain' | 'tension' | 'weakness' | 'numbness' | 'improvement';
  description: string;
  date: string;
  notes?: string;
}

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  x: number;
  y: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  reps?: string;
  sets?: number;
}

const mockPainPoints: PainPoint[] = [
  {
    id: 'pain-1',
    x: 45,
    y: 15,
    intensity: 8,
    type: 'pain',
    description: 'Dor cervical intensa',
    date: '2024-01-15',
    notes: 'Piora pela manhã, melhora com movimento'
  },
  {
    id: 'pain-2',
    x: 42,
    y: 35,
    intensity: 6,
    type: 'tension',
    description: 'Tensão no ombro direito',
    date: '2024-01-15'
  },
  {
    id: 'pain-3',
    x: 40,
    y: 55,
    intensity: 4,
    type: 'improvement',
    description: 'Melhora na lombar',
    date: '2024-01-20',
    notes: 'Após 5 sessões de fisioterapia'
  }
];

const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Alongamento Cervical',
    bodyPart: 'Pescoço',
    x: 45,
    y: 18,
    difficulty: 'beginner',
    duration: '30s',
    sets: 3
  },
  {
    id: 'ex-2',
    name: 'Fortalecimento Ombro',
    bodyPart: 'Ombro',
    x: 42,
    y: 38,
    difficulty: 'intermediate',
    duration: '45s',
    reps: '12-15',
    sets: 2
  },
  {
    id: 'ex-3',
    name: 'Mobilização Lombar',
    bodyPart: 'Lombar',
    x: 40,
    y: 58,
    difficulty: 'beginner',
    duration: '1min',
    sets: 2
  }
];

const bodyMapSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Corpo Humano Simplificado - Vista Frontal -->
  <!-- Cabeça -->
  <circle cx="50" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="0.5"/>
  
  <!-- Pescoço -->
  <line x1="50" y1="20" x2="50" y2="25" stroke="currentColor" stroke-width="2"/>
  
  <!-- Tronco -->
  <ellipse cx="50" cy="45" rx="12" ry="20" fill="none" stroke="currentColor" stroke-width="0.5"/>
  
  <!-- Braços -->
  <line x1="38" y1="30" x2="25" y2="55" stroke="currentColor" stroke-width="2"/>
  <line x1="62" y1="30" x2="75" y2="55" stroke="currentColor" stroke-width="2"/>
  
  <!-- Antebraços -->
  <line x1="25" y1="55" x2="20" y2="70" stroke="currentColor" stroke-width="2"/>
  <line x1="75" y1="55" x2="80" y2="70" stroke="currentColor" stroke-width="2"/>
  
  <!-- Pernas -->
  <line x1="45" y1="65" x2="42" y2="90" stroke="currentColor" stroke-width="2"/>
  <line x1="55" y1="65" x2="58" y2="90" stroke="currentColor" stroke-width="2"/>
  
  <!-- Pés -->
  <ellipse cx="40" cy="92" rx="3" ry="2" fill="none" stroke="currentColor" stroke-width="0.5"/>
  <ellipse cx="60" cy="92" rx="3" ry="2" fill="none" stroke="currentColor" stroke-width="0.5"/>
  
  <!-- Articulações principais -->
  <circle cx="35" cy="42" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Ombro E -->
  <circle cx="65" cy="42" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Ombro D -->
  <circle cx="25" cy="55" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Cotovelo E -->
  <circle cx="75" cy="55" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Cotovelo D -->
  <circle cx="45" cy="65" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Quadril E -->
  <circle cx="55" cy="65" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Quadril D -->
  <circle cx="42" cy="80" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Joelho E -->
  <circle cx="58" cy="80" r="2" fill="none" stroke="currentColor" stroke-width="0.5"/> <!-- Joelho D -->
</svg>
`;

const getPainColor = (type: string, intensity: number) => {
  const colors = {
    pain: intensity > 7 ? 'text-red-600' : intensity > 4 ? 'text-red-500' : 'text-red-400',
    tension: 'text-yellow-500',
    weakness: 'text-orange-500',
    numbness: 'text-purple-500',
    improvement: 'text-green-500'
  };
  return colors[type as keyof typeof colors] || 'text-gray-500';
};

const getPainIcon = (type: string) => {
  const icons = {
    pain: AlertTriangle,
    tension: Activity,
    weakness: Minus,
    numbness: Eye,
    improvement: CheckCircle
  };
  const Icon = icons[type as keyof typeof icons] || MapPin;
  return Icon;
};

export default function InteractiveBodyMap() {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const [painPoints, setPainPoints] = useState<PainPoint[]>(mockPainPoints);
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [selectedPoint, setSelectedPoint] = useState<PainPoint | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExercises, setShowExercises] = useState(true);
  const [showPainPoints, setShowPainPoints] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (event: React.MouseEvent) => {
    if (!isAddingPoint || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPoint: PainPoint = {
      id: `pain-${Date.now()}`,
      x,
      y,
      intensity: 5,
      type: 'pain',
      description: 'Nova dor',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    };

    setPainPoints([...painPoints, newPoint]);
    setSelectedPoint(newPoint);
    setIsAddingPoint(false);
  };

  const intensityColors = {
    1: 'bg-green-200 text-green-800',
    2: 'bg-green-300 text-green-800',
    3: 'bg-yellow-200 text-yellow-800',
    4: 'bg-yellow-300 text-yellow-800',
    5: 'bg-orange-200 text-orange-800',
    6: 'bg-orange-300 text-orange-800',
    7: 'bg-red-200 text-red-800',
    8: 'bg-red-300 text-red-800',
    9: 'bg-red-400 text-red-900',
    10: 'bg-red-500 text-white'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContainer animation="fade-in">
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Mapa Corporal Interativo
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Visualização e mapeamento de dor, exercícios e evolução do paciente
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showPainPoints ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPainPoints(!showPainPoints)}
              >
                {showPainPoints ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Pontos de Dor
              </Button>
              <Button
                variant={showExercises ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowExercises(!showExercises)}
              >
                {showExercises ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Exercícios
              </Button>
            </div>
          </div>
        </Card>
      </AnimatedContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Corporal */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              {/* Controles */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedView === 'front' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedView('front')}
                  >
                    Frontal
                  </Button>
                  <Button
                    variant={selectedView === 'back' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedView('back')}
                  >
                    Posterior
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isAddingPoint ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsAddingPoint(!isAddingPoint)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Ponto
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>

              {/* Mapa SVG */}
              <div 
                ref={mapRef}
                className={`relative bg-gray-50 dark:bg-gray-800 rounded-lg p-8 h-96 ${
                  isAddingPoint ? 'cursor-crosshair' : 'cursor-pointer'
                }`}
                onClick={handleMapClick}
              >
                <div 
                  className="w-full h-full text-gray-400 dark:text-gray-500"
                  dangerouslySetInnerHTML={{ __html: bodyMapSvg }}
                />

                {/* Pontos de Dor */}
                {showPainPoints && painPoints.map((point) => {
                  const Icon = getPainIcon(point.type);
                  return (
                    <div
                      key={point.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(point);
                      }}
                    >
                      <div className={`
                        h-6 w-6 rounded-full flex items-center justify-center
                        ${getPainColor(point.type, point.intensity)}
                        bg-white dark:bg-gray-900 border-2 border-current
                        animate-pulse shadow-lg
                      `}>
                        <Icon className="h-3 w-3" />
                      </div>
                      
                      {/* Indicador de intensidade */}
                      {point.type === 'pain' && (
                        <div className={`
                          absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-bold
                          flex items-center justify-center
                          ${intensityColors[point.intensity as keyof typeof intensityColors]}
                        `}>
                          {point.intensity}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Exercícios */}
                {showExercises && exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${exercise.x}%`,
                      top: `${exercise.y}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(exercise);
                    }}
                  >
                    <div className={`
                      h-6 w-6 rounded-full flex items-center justify-center
                      bg-blue-100 text-blue-600 border-2 border-blue-500
                      shadow-lg
                    `}>
                      <Zap className="h-3 w-3" />
                    </div>
                    
                    <div className={`
                      absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-bold
                      flex items-center justify-center
                      ${exercise.difficulty === 'beginner' ? 'bg-green-200 text-green-800' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }
                    `}>
                      {exercise.difficulty.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ))}

                {/* Instrução quando em modo adicionar */}
                {isAddingPoint && (
                  <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    Clique no mapa para adicionar um ponto de dor
                  </div>
                )}
              </div>

              {/* Legenda */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Dor</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-yellow-500" />
                    <span>Tensão</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Melhora</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Exercício</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Intensidade da dor: 1 (leve) - 10 (severa)
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Ponto Selecionado */}
          {selectedPoint && (
            <AnimatedContainer animation="slide-left">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detalhes do Ponto
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPoint(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo
                      </label>
                      <select 
                        value={selectedPoint.type}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        onChange={(e) => {
                          const updatedPoint = { ...selectedPoint, type: e.target.value as any };
                          setSelectedPoint(updatedPoint);
                          setPainPoints(points => points.map(p => p.id === updatedPoint.id ? updatedPoint : p));
                        }}
                      >
                        <option value="pain">Dor</option>
                        <option value="tension">Tensão</option>
                        <option value="weakness">Fraqueza</option>
                        <option value="numbness">Dormência</option>
                        <option value="improvement">Melhora</option>
                      </select>
                    </div>
                    
                    {selectedPoint.type === 'pain' && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Intensidade: {selectedPoint.intensity}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={selectedPoint.intensity}
                          className="w-full mt-1"
                          onChange={(e) => {
                            const updatedPoint = { ...selectedPoint, intensity: parseInt(e.target.value) };
                            setSelectedPoint(updatedPoint);
                            setPainPoints(points => points.map(p => p.id === updatedPoint.id ? updatedPoint : p));
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Leve</span>
                          <span>Severa</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={selectedPoint.description}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        onChange={(e) => {
                          const updatedPoint = { ...selectedPoint, description: e.target.value };
                          setSelectedPoint(updatedPoint);
                          setPainPoints(points => points.map(p => p.id === updatedPoint.id ? updatedPoint : p));
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Observações
                      </label>
                      <textarea
                        value={selectedPoint.notes || ''}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 h-20"
                        placeholder="Observações adicionais..."
                        onChange={(e) => {
                          const updatedPoint = { ...selectedPoint, notes: e.target.value };
                          setSelectedPoint(updatedPoint);
                          setPainPoints(points => points.map(p => p.id === updatedPoint.id ? updatedPoint : p));
                        }}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setPainPoints(points => points.filter(p => p.id !== selectedPoint.id));
                          setSelectedPoint(null);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          )}

          {/* Exercício Selecionado */}
          {selectedExercise && (
            <AnimatedContainer animation="slide-left">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Exercício
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedExercise(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {selectedExercise.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedExercise.bodyPart}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Duração:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedExercise.duration}
                        </div>
                      </div>
                      
                      {selectedExercise.reps && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Repetições:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedExercise.reps}
                          </div>
                        </div>
                      )}
                      
                      {selectedExercise.sets && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Séries:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {selectedExercise.sets}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Nível:</span>
                        <div className={`font-medium ${
                          selectedExercise.difficulty === 'beginner' ? 'text-green-600' :
                          selectedExercise.difficulty === 'intermediate' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedExercise.difficulty === 'beginner' ? 'Iniciante' :
                           selectedExercise.difficulty === 'intermediate' ? 'Intermediário' :
                           'Avançado'}
                        </div>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      <Activity className="h-4 w-4 mr-1" />
                      Ver Instruções
                    </Button>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          )}

          {/* Histórico de Evolução */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Histórico
              </h3>
              
              <div className="space-y-3">
                {[
                  { date: '20/01', action: 'Melhora na lombar', type: 'improvement' },
                  { date: '15/01', action: 'Nova dor cervical', type: 'pain' },
                  { date: '12/01', action: 'Exercício adicionado', type: 'exercise' },
                  { date: '08/01', action: 'Tensão no ombro', type: 'tension' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      item.type === 'improvement' ? 'bg-green-100 text-green-600' :
                      item.type === 'pain' ? 'bg-red-100 text-red-600' :
                      item.type === 'exercise' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {item.type === 'improvement' && <CheckCircle className="h-4 w-4" />}
                      {item.type === 'pain' && <AlertTriangle className="h-4 w-4" />}
                      {item.type === 'exercise' && <Zap className="h-4 w-4" />}
                      {item.type === 'tension' && <Activity className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}