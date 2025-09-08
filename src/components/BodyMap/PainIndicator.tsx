import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Clock,
  ThermometerSun,
  Zap,
  Eye,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react';

interface PainEntry {
  id: string;
  date: string;
  time: string;
  intensity: number;
  location: string;
  type: 'sharp' | 'dull' | 'burning' | 'throbbing' | 'tingling';
  triggers?: string[];
  relief?: string[];
  duration: string;
  notes?: string;
  weather?: string;
  medication?: string;
}

interface PainPattern {
  location: string;
  averageIntensity: number;
  frequency: number;
  trend: 'improving' | 'worsening' | 'stable';
  commonTriggers: string[];
  bestReliefs: string[];
}

const mockPainEntries: PainEntry[] = [
  {
    id: '1',
    date: '2024-01-20',
    time: '09:30',
    intensity: 6,
    location: 'Cervical',
    type: 'throbbing',
    triggers: ['Estresse', 'Postura ruim'],
    relief: ['Calor', 'Alongamento'],
    duration: '2 horas',
    notes: 'Piora ao trabalhar no computador',
    weather: 'Tempo frio',
    medication: 'Ibuprofeno 400mg'
  },
  {
    id: '2',
    date: '2024-01-19',
    time: '14:15',
    intensity: 4,
    location: 'Lombar',
    type: 'dull',
    triggers: ['Ficar sentado muito tempo'],
    relief: ['Caminhada', 'Calor'],
    duration: '1 hora',
    weather: 'Ensolarado'
  },
  {
    id: '3',
    date: '2024-01-19',
    time: '07:45',
    intensity: 8,
    location: 'Ombro direito',
    type: 'sharp',
    triggers: ['Movimento brusco'],
    relief: ['Repouso', 'Gelo'],
    duration: '30 minutos',
    notes: 'Dor intensa ao levantar o braço'
  },
  {
    id: '4',
    date: '2024-01-18',
    time: '16:20',
    intensity: 3,
    location: 'Cervical',
    type: 'dull',
    triggers: ['Tensão'],
    relief: ['Massagem'],
    duration: '45 minutos'
  },
  {
    id: '5',
    date: '2024-01-17',
    time: '11:10',
    intensity: 7,
    location: 'Lombar',
    type: 'burning',
    triggers: ['Exercício intenso'],
    relief: ['Repouso', 'Anti-inflamatório'],
    duration: '3 horas',
    medication: 'Diclofenaco 50mg'
  }
];

const mockPainPatterns: PainPattern[] = [
  {
    location: 'Cervical',
    averageIntensity: 5.5,
    frequency: 4,
    trend: 'stable',
    commonTriggers: ['Estresse', 'Postura ruim', 'Tensão'],
    bestReliefs: ['Calor', 'Alongamento', 'Massagem']
  },
  {
    location: 'Lombar',
    averageIntensity: 5.5,
    frequency: 2,
    trend: 'improving',
    commonTriggers: ['Ficar sentado', 'Exercício intenso'],
    bestReliefs: ['Caminhada', 'Calor', 'Repouso']
  },
  {
    location: 'Ombro direito',
    averageIntensity: 8.0,
    frequency: 1,
    trend: 'worsening',
    commonTriggers: ['Movimento brusco'],
    bestReliefs: ['Repouso', 'Gelo']
  }
];

const painTypeColors = {
  sharp: 'text-red-600',
  dull: 'text-yellow-600',
  burning: 'text-orange-600',
  throbbing: 'text-purple-600',
  tingling: 'text-blue-600'
};

const painTypeLabels = {
  sharp: 'Aguda',
  dull: 'Surda',
  burning: 'Queimação',
  throbbing: 'Latejante',
  tingling: 'Formigamento'
};

const getIntensityColor = (intensity: number) => {
  if (intensity >= 8) return 'text-red-600 bg-red-100';
  if (intensity >= 6) return 'text-orange-600 bg-orange-100';
  if (intensity >= 4) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
};

const getTrendIcon = (trend: string) => {
  const icons = {
    improving: TrendingDown,
    worsening: TrendingUp,
    stable: Activity
  };
  return icons[trend as keyof typeof icons];
};

const getTrendColor = (trend: string) => {
  const colors = {
    improving: 'text-green-600',
    worsening: 'text-red-600',
    stable: 'text-gray-600'
  };
  return colors[trend as keyof typeof colors];
};

export default function PainIndicator() {
  const [selectedEntry, setSelectedEntry] = useState<PainEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'quarter'>('week');

  const averagePain = mockPainEntries.reduce((sum, entry) => sum + entry.intensity, 0) / mockPainEntries.length;
  const todayEntries = mockPainEntries.filter(entry => entry.date === '2024-01-20');
  const weekTrend = 'stable'; // Calculado com base nos dados

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Intensidade Média</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {averagePain.toFixed(1)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">-0,8 esta semana</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <ThermometerSun className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Episódios Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {todayEntries.length}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">Igual a ontem</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Locais Afetados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockPainPatterns.length}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">Principalmente cervical</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tendência Semanal</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">Estável</p>
                  <p className="text-sm text-gray-600 mt-1">Sem mudanças significativas</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registro de Dor */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Registro de Dor
              </h3>
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Registrar
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockPainEntries.map((entry) => (
                <AnimatedContainer key={entry.id} animation="slide-right" delay={parseInt(entry.id) * 50}>
                  <div 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getIntensityColor(entry.intensity)}`}>
                            {entry.intensity}
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {entry.location}
                          </h4>
                          <span className={`text-sm ${painTypeColors[entry.type]}`}>
                            {painTypeLabels[entry.type]}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{entry.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3" />
                            <span>{entry.duration}</span>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </Card>

        {/* Padrões de Dor */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Padrões Identificados
              </h3>
              <select 
                value={timeFrame} 
                onChange={(e) => setTimeFrame(e.target.value as any)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="quarter">Último trimestre</option>
              </select>
            </div>

            <div className="space-y-4">
              {mockPainPatterns.map((pattern, index) => {
                const TrendIcon = getTrendIcon(pattern.trend);
                return (
                  <AnimatedContainer key={index} animation="slide-left" delay={index * 100}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {pattern.location}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <TrendIcon className={`h-4 w-4 ${getTrendColor(pattern.trend)}`} />
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getIntensityColor(pattern.averageIntensity)}`}>
                            {pattern.averageIntensity.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Frequência:</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {pattern.frequency}x/semana
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Tendência:</p>
                          <p className={`font-medium ${getTrendColor(pattern.trend)}`}>
                            {pattern.trend === 'improving' ? 'Melhorando' :
                             pattern.trend === 'worsening' ? 'Piorando' : 'Estável'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gatilhos comuns:</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.commonTriggers.slice(0, 2).map((trigger, i) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alívios eficazes:</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.bestReliefs.slice(0, 2).map((relief, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {relief}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedContainer>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Evolução da Dor - Últimos 7 Dias
          </h3>
          
          {/* Placeholder para gráfico */}
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de evolução da intensidade da dor</p>
              <p className="text-sm text-gray-400 mt-1">
                {mockPainEntries.length} registros analisados
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Detalhes */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AnimatedContainer animation="scale-in">
            <Card className="w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detalhes do Registro
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEntry(null)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Local</label>
                      <p className="text-gray-900 dark:text-white">{selectedEntry.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Intensidade</label>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${getIntensityColor(selectedEntry.intensity)}`}>
                        {selectedEntry.intensity}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                      <p className={`${painTypeColors[selectedEntry.type]}`}>
                        {painTypeLabels[selectedEntry.type]}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duração</label>
                      <p className="text-gray-900 dark:text-white">{selectedEntry.duration}</p>
                    </div>
                  </div>
                  
                  {selectedEntry.triggers && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gatilhos</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEntry.triggers.map((trigger, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.relief && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">O que ajudou</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEntry.relief.map((relief, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {relief}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {selectedEntry.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Data/Hora:</span>
                      <p>{new Date(selectedEntry.date).toLocaleDateString('pt-BR')} às {selectedEntry.time}</p>
                    </div>
                    {selectedEntry.weather && (
                      <div>
                        <span className="font-medium">Clima:</span>
                        <p>{selectedEntry.weather}</p>
                      </div>
                    )}
                    {selectedEntry.medication && (
                      <div className="col-span-2">
                        <span className="font-medium">Medicação:</span>
                        <p>{selectedEntry.medication}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <Button size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          </AnimatedContainer>
        </div>
      )}
    </div>
  );
}