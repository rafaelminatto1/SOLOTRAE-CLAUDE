import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import PartnershipManager from '@/components/Partnerships/PartnershipManager';
import VoucherSystem from '@/components/Partnerships/VoucherSystem';
import PartnerPortal from '@/components/Partnerships/PartnerPortal';
import {
  Building2,
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  Plus,
  Eye,
  BarChart3,
  Handshake
} from 'lucide-react';

export default function Partnerships() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Verificar permissões
  if (!hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST])) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar o módulo de parcerias.
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
                <Handshake className="h-8 w-8 mr-3 text-blue-600" />
                Sistema de Parcerias & Vouchers
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gestão completa de parcerias comerciais, vouchers e relacionamentos estratégicos
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Status do Sistema</div>
                <div className="font-semibold text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Operacional
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

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Parcerias Ativas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">4</p>
                  <p className="text-sm text-green-600 mt-1">100% ativas</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vouchers Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">1.045</p>
                  <p className="text-sm text-blue-600 mt-1">+15,3% este mês</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Parcerias</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 119.850</p>
                  <p className="text-sm text-green-600 mt-1">+22,8% este mês</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Conversão</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">74,8%</p>
                  <p className="text-sm text-green-600 mt-1">+3,2% este mês</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema Completo de Parcerias */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="partnerships" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Parcerias</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center space-x-2">
              <Gift className="h-4 w-4" />
              <span>Vouchers</span>
            </TabsTrigger>
            <TabsTrigger value="portal" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Portal Parceiros</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Visão Geral do Sistema */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                      Status das Parcerias
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { name: 'TechCorp Saúde', type: 'Empresa', status: 'Ativa', revenue: 28750, vouchers: '187/250' },
                        { name: 'UnMed Planos', type: 'Plano de Saúde', status: 'Ativa', revenue: 67200, vouchers: '445/580' },
                        { name: 'FitLife Academia', type: 'Academia', status: 'Pendente', revenue: 15400, vouchers: '89/120' },
                        { name: 'FarmaVida', type: 'Farmácia', status: 'Ativa', revenue: 8500, vouchers: '72/95' }
                      ].map((partner, index) => (
                        <AnimatedContainer key={index} animation="slide-right" delay={index * 100}>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {partner.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{partner.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{partner.type}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                partner.status === 'Ativa' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {partner.status}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                R$ {partner.revenue.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-500">{partner.vouchers} vouchers</p>
                            </div>
                          </div>
                        </AnimatedContainer>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Performance Mensal
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receita Total</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ 119.850</p>
                        </div>
                        <div className="text-green-600 text-right">
                          <p className="text-sm font-medium">+22,8%</p>
                          <p className="text-xs">vs mês anterior</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Vouchers Utilizados</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">793</p>
                        </div>
                        <div className="text-blue-600 text-right">
                          <p className="text-sm font-medium">+15,3%</p>
                          <p className="text-xs">vs mês anterior</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Novos Parceiros</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                        </div>
                        <div className="text-purple-600 text-right">
                          <p className="text-sm font-medium">+100%</p>
                          <p className="text-xs">vs mês anterior</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Próximas Ações */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-orange-600" />
                    Ações Recomendadas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: 'Renovar Contrato',
                        description: 'FitLife Academia - Vence em 15 dias',
                        priority: 'high',
                        action: 'Renovar'
                      },
                      {
                        title: 'Análise de Performance',
                        description: 'UnMed Planos - ROI acima da meta',
                        priority: 'medium',
                        action: 'Analisar'
                      },
                      {
                        title: 'Criar Campanha',
                        description: 'TechCorp - Baixa utilização vouchers',
                        priority: 'low',
                        action: 'Campanha'
                      }
                    ].map((item, index) => (
                      <AnimatedContainer key={index} animation="scale-in" delay={index * 100}>
                        <div className={`p-4 rounded-lg border-l-4 ${
                          item.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                          item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`mt-3 ${
                              item.priority === 'high' ? 'border-red-500 text-red-600' :
                              item.priority === 'medium' ? 'border-yellow-500 text-yellow-600' :
                              'border-blue-500 text-blue-600'
                            }`}
                          >
                            {item.action}
                          </Button>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partnerships" className="mt-6">
            <PartnershipManager />
          </TabsContent>

          <TabsContent value="vouchers" className="mt-6">
            <VoucherSystem />
          </TabsContent>

          <TabsContent value="portal" className="mt-6">
            <PartnerPortal />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Nova Parceria</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cadastrar novo parceiro</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Gerar Voucher</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Criar novo voucher</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Relatórios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Performance parcerias</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={400}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Configurações</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sistema de parcerias</p>
            </div>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}