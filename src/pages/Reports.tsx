import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import AdvancedReports from '@/components/Reports/AdvancedReports';
import PatientProgressCharts from '@/components/Reports/PatientProgressCharts';
import BusinessMetrics from '@/components/Reports/BusinessMetrics';
import ExportManager from '@/components/Reports/ExportManager';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
  FileText,
  Download,
  Settings,
  RefreshCw,
  Calendar,
  Eye,
  Filter,
  Share,
  Award,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function Reports() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Verificar permissões
  if (!hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST])) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar os relatórios avançados.
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
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                Relatórios Avançados & Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Business Intelligence completo para tomada de decisão estratégica
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
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar Dados
              </Button>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Relatórios Gerados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">47</p>
                  <p className="text-sm text-green-600 mt-1">+23% este mês</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Melhora</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">82.5%</p>
                  <p className="text-sm text-green-600 mt-1">+4.3% vs anterior</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Analisada</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 125k</p>
                  <p className="text-sm text-purple-600 mt-1">+6.4% crescimento</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">KPIs Monitorados</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
                  <p className="text-sm text-orange-600 mt-1">Tempo real</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-orange-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfação Geral</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">94.5%</p>
                  <p className="text-sm text-pink-600 mt-1">Meta atingida</p>
                </div>
                <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema Completo de Relatórios */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Avançados</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Negócio</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportação</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Resumo Executivo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-600" />
                      Principais Conquistas
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Meta de Receita Superada</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">106.4% da meta mensal atingida</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Crescimento Consistente</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">6 meses consecutivos de crescimento</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Satisfação Excepcional</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">94.5% de satisfação dos pacientes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Pontos de Atenção
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Taxa de Ocupação</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">78% - 7 pontos abaixo da meta</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Reagendamentos</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">15.2% - acima do limite aceitável</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Oportunidade de Expansão</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Demanda alta - considerar novos horários</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tendências e Projeções */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tendências e Projeções - Próximos 3 Meses
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">R$ 410k</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Receita Projetada</div>
                      <div className="text-xs text-green-600">Crescimento esperado: +18%</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">142</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Novos Pacientes</div>
                      <div className="text-xs text-blue-600">Meta: +20% vs trimestre anterior</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Taxa de Ocupação</div>
                      <div className="text-xs text-purple-600">Otimização planejada</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ações Recomendadas */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ações Estratégicas Recomendadas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white">Expandir Horários</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Adicionar turnos vespertinos para aumentar ocupação
                      </p>
                      <div className="mt-2">
                        <Button size="sm" variant="outline">Planejar</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white">Campanha de Marketing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Focar em retenção de pacientes para reduzir churn
                      </p>
                      <div className="mt-2">
                        <Button size="sm" variant="outline">Executar</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white">Otimizar Processos</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Implementar sistema de lembretes para reduzir reagendamentos
                      </p>
                      <div className="mt-2">
                        <Button size="sm" variant="outline">Implementar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <AdvancedReports />
          </TabsContent>

          <TabsContent value="patients" className="mt-6">
            <PatientProgressCharts />
          </TabsContent>

          <TabsContent value="business" className="mt-6">
            <BusinessMetrics />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ExportManager />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Relatório Mensal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gerar relatório completo</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Exportar Dados</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download personalizado</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Share className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Compartilhar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enviar por email</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={400}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Agendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatizar relatórios</p>
            </div>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}