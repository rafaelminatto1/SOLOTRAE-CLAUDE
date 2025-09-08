import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import InteractiveBodyMap from '@/components/BodyMap/InteractiveBodyMap';
import PainIndicator from '@/components/BodyMap/PainIndicator';
import ExerciseMapping from '@/components/BodyMap/ExerciseMapping';
import ProgressVisualization from '@/components/BodyMap/ProgressVisualization';
import {
  User,
  Activity,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  MapPin,
  BarChart3,
  Calendar,
  Settings,
  Download,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';

export default function BodyMap() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('bodymap');

  // Verificar permissões
  if (!hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.PATIENT])) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <User className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar o mapa corporal.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContainer animation="fade-in">
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <User className="h-8 w-8 mr-3 text-blue-600" />
                Mapa Corporal Interativo
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Visualização completa de dor, exercícios, progresso e análise corporal
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</div>
                <div className="font-semibold text-blue-600">
                  {new Date().toLocaleString('pt-BR')}
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

      {/* Métricas de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pontos de Dor</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                  <p className="text-sm text-orange-600 mt-1">Média: 5.7/10</p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Exercícios Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
                  <p className="text-sm text-green-600 mt-1">Adesão: 82%</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mobilidade</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">8.0</p>
                  <p className="text-sm text-blue-600 mt-1">+167% melhoria</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Força Muscular</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">7.0</p>
                  <p className="text-sm text-purple-600 mt-1">+133% ganho</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={500}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso Geral</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">78%</p>
                  <p className="text-sm text-green-600 mt-1">Em evolução</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema Completo do Mapa Corporal */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bodymap" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Mapa Corporal</span>
            </TabsTrigger>
            <TabsTrigger value="pain" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Indicador de Dor</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Exercícios</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progresso</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bodymap" className="mt-6">
            <InteractiveBodyMap />
          </TabsContent>

          <TabsContent value="pain" className="mt-6">
            <PainIndicator />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <ExerciseMapping />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <ProgressVisualization />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Insights Inteligentes
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatedContainer animation="slide-up" delay={100}>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Excelente Progresso</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Sua dor cervical reduziu em 62% nos últimos 5 dias. Continue com os exercícios de alongamento!
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={200}>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Nova Meta Disponível</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Baseado no seu progresso, você está pronto para exercícios de nível intermediário.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={300}>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Padrão Identificado</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Dor no ombro aumenta nos dias frios. Considere aquecimento antes dos exercícios.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Registrar Dor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adicionar novo ponto de dor</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Iniciar Exercício</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Começar sessão de treino</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Ver Relatórios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Análise detalhada de progresso</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={400}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Exportar Dados</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download do histórico completo</p>
            </div>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}