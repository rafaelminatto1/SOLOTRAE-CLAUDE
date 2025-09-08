import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import FinancialDashboard from '@/components/Financial/FinancialDashboard';
import InvoiceManager from '@/components/Financial/InvoiceManager';
import PaymentGateway from '@/components/Financial/PaymentGateway';
import {
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  PieChart,
  BarChart3,
  Settings,
  Download,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Financial() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar permissões
  if (!hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST])) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar o módulo financeiro.
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
                <DollarSign className="h-8 w-8 mr-3 text-green-600" />
                Sistema Financeiro
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gestão completa das suas finanças - Faturas, Pagamentos e Relatórios
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Integração</div>
                <div className="font-semibold text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Ativa
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

      {/* Sistema Financeiro Completo */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Faturas</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <InvoiceManager />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentGateway />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Relatórios Financeiros */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Relatórios Disponíveis
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Demonstrativo de Resultado (DRE)',
                        description: 'Receitas, custos e resultado do período',
                        period: 'Mensal/Anual',
                        format: 'PDF, Excel'
                      },
                      {
                        name: 'Fluxo de Caixa',
                        description: 'Entradas e saídas detalhadas',
                        period: 'Diário/Semanal/Mensal',
                        format: 'PDF, Excel'
                      },
                      {
                        name: 'Contas a Receber',
                        description: 'Faturas pendentes e vencimentos',
                        period: 'Atual',
                        format: 'PDF, Excel'
                      },
                      {
                        name: 'Análise de Pagamentos',
                        description: 'Performance dos métodos de pagamento',
                        period: 'Mensal',
                        format: 'PDF, Excel'
                      },
                      {
                        name: 'Comissões e Taxas',
                        description: 'Custos de processamento por gateway',
                        period: 'Mensal',
                        format: 'PDF, Excel'
                      }
                    ].map((report, index) => (
                      <AnimatedContainer key={index} animation="slide-up" delay={index * 100}>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {report.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {report.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Período: {report.period}</span>
                                <span>Formato: {report.format}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Métricas Avançadas */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Métricas Avançadas
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        metric: 'Receita Média por Paciente',
                        value: 'R$ 485,50',
                        change: '+8,3%',
                        trend: 'up'
                      },
                      {
                        metric: 'Ticket Médio por Sessão',
                        value: 'R$ 147,20',
                        change: '+2,1%',
                        trend: 'up'
                      },
                      {
                        metric: 'Taxa de Conversão',
                        value: '73,8%',
                        change: '-1,2%',
                        trend: 'down'
                      },
                      {
                        metric: 'Inadimplência',
                        value: '3,2%',
                        change: '-0,8%',
                        trend: 'up'
                      },
                      {
                        metric: 'Custo por Transação',
                        value: 'R$ 4,85',
                        change: '-5,2%',
                        trend: 'up'
                      },
                      {
                        metric: 'ROI Médio por Paciente',
                        value: '285%',
                        change: '+12,5%',
                        trend: 'up'
                      }
                    ].map((item, index) => (
                      <AnimatedContainer key={index} animation="scale-in" delay={index * 50}>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.metric}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.value}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.change}
                            </div>
                            <div className="text-xs text-gray-500">vs mês anterior</div>
                          </div>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gerar Relatório Completo
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
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
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Nova Fatura</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Criar fatura rapidamente</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={200}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Recebimentos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Registrar pagamento</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={300}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Configurar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gateway de pagamento</p>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="slide-up" delay={400}>
          <Card hover className="group cursor-pointer">
            <div className="p-6 text-center">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Download className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">Relatórios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exportar dados financeiros</p>
            </div>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}