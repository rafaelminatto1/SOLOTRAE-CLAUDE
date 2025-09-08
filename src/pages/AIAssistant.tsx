import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import AIAssistantPanel from '@/components/AI/AIAssistantPanel';
import ExerciseSuggestions from '@/components/AI/ExerciseSuggestions';
import PatientAnalytics from '@/components/AI/PatientAnalytics';
import DiagnosticHelper from '@/components/AI/DiagnosticHelper';
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Stethoscope,
  Activity,
  Users,
  BarChart3,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'learning' | 'maintenance';
  accuracy: number;
  lastUpdate: string;
  category: 'diagnosis' | 'treatment' | 'analytics' | 'general';
}

export default function AIAssistant() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const aiCapabilities: AICapability[] = [
    {
      id: 'diagnostic',
      name: 'Assistente Diagnóstico',
      description: 'Suporte inteligente para diagnóstico diferencial baseado em sintomas e exame físico',
      icon: Stethoscope,
      status: 'active',
      accuracy: 94,
      lastUpdate: '2024-01-15',
      category: 'diagnosis'
    },
    {
      id: 'exercise',
      name: 'Prescrição de Exercícios',
      description: 'Sugestões personalizadas de exercícios baseadas em evidências científicas',
      icon: Target,
      status: 'active',
      accuracy: 89,
      lastUpdate: '2024-01-10',
      category: 'treatment'
    },
    {
      id: 'analytics',
      name: 'Análise de Progresso',
      description: 'Monitoramento automatizado do progresso do paciente com insights preditivos',
      icon: TrendingUp,
      status: 'active',
      accuracy: 92,
      lastUpdate: '2024-01-12',
      category: 'analytics'
    },
    {
      id: 'chat',
      name: 'Assistente Conversacional',
      description: 'Chat inteligente para consultas rápidas e suporte durante atendimentos',
      icon: Brain,
      status: 'learning',
      accuracy: 87,
      lastUpdate: '2024-01-14',
      category: 'general'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'learning': return 'Aprendendo';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diagnosis': return 'border-red-200 bg-red-50';
      case 'treatment': return 'border-green-200 bg-green-50';
      case 'analytics': return 'border-blue-200 bg-blue-50';
      case 'general': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContainer animation="fade-in">
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Brain className="h-8 w-8 mr-3 text-blue-600" />
                IA Assistente FisioFlow
                <Sparkles className="h-6 w-6 ml-2 text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Inteligência artificial avançada para otimizar seu atendimento fisioterapêutico
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sistema IA</div>
                <div className="font-semibold text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configurações
              </Button>
            </div>
          </div>
        </Card>
      </AnimatedContainer>

      {/* AI Capabilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiCapabilities.map((capability, index) => {
          const Icon = capability.icon;
          return (
            <AnimatedContainer key={capability.id} animation="scale-in" delay={index * 100}>
              <Card hover className={`group cursor-pointer border-l-4 ${getCategoryColor(capability.category)}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-6 w-6 text-gray-600 group-hover:scale-110 transition-transform" />
                    <Badge className={getStatusColor(capability.status)}>
                      {getStatusText(capability.status)}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                    {capability.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {capability.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Precisão: <span className="font-medium text-gray-700">{capability.accuracy}%</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(capability.lastUpdate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          );
        })}
      </div>

      {/* Main AI Interface */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assistant" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Chat IA</span>
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Diagnóstico</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Exercícios</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIAssistantPanel 
                  context="dashboard"
                  className="h-[600px]"
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                      Dicas Rápidas
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span>Use comandos específicos como "analisar paciente João"</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span>Peça sugestões de exercícios por condição</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span>Solicite análises de progresso detalhadas</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        <span>Use o microfone para comandos de voz</span>
                      </li>
                    </ul>
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-500" />
                      Status do Sistema
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Modelo Principal</span>
                        <Badge className="bg-green-100 text-green-800">Claude 4</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</span>
                        <span className="text-sm text-gray-900 dark:text-white">15/01/2024</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Base de Conhecimento</span>
                        <span className="text-sm text-gray-900 dark:text-white">94k+ casos</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-6">
            <DiagnosticHelper 
              mode="guided"
              onDiagnosisComplete={(diagnosis) => {
                console.log('Diagnóstico completado:', diagnosis);
              }}
            />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <div className="space-y-6">
              {/* Patient Selection */}
              <Card>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Selecionar Paciente para Recomendações
                  </h4>
                  <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecione um paciente</option>
                    <option value="patient-1">João Silva - Lombalgia</option>
                    <option value="patient-2">Maria Santos - Cervicalgia</option>
                    <option value="patient-3">Pedro Oliveira - Reabilitação Joelho</option>
                  </select>
                </div>
              </Card>

              <ExerciseSuggestions 
                patientId={selectedPatientId}
                context="prescription"
                onExerciseSelect={(exercise) => {
                  console.log('Exercício selecionado:', exercise);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Patient Selection for Analytics */}
              <Card>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Análise de Progresso do Paciente
                  </h4>
                  <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecione um paciente para análise</option>
                    <option value="patient-1">João Silva - Lombalgia</option>
                    <option value="patient-2">Maria Santos - Cervicalgia</option>
                    <option value="patient-3">Pedro Oliveira - Reabilitação Joelho</option>
                  </select>
                </div>
              </Card>

              {selectedPatientId && (
                <PatientAnalytics 
                  patientId={selectedPatientId}
                  timeframe="3m"
                  onInsightClick={(insight) => {
                    console.log('Insight clicado:', insight);
                  }}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Statistics and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Casos Analisados</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">1,247</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                +12% vs mês anterior
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Precisão Diagnóstica</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">94.2%</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Validado por especialistas
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Tempo Economizado</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-1">2.4h</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Por dia, em média
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}