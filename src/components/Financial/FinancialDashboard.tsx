import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Receipt,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Wallet,
  Building,
  Users,
  Activity,
} from 'lucide-react';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyAverage: number;
  growthRate: number;
  pendingPayments: number;
  overduePayments: number;
  completedTransactions: number;
  cancellations: number;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'refund';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'cash' | 'insurance';
  patientName?: string;
  serviceType?: string;
  category: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'cash' | 'insurance';
  fee: number;
  processingTime: string;
  isActive: boolean;
  monthlyVolume: number;
  icon: React.ComponentType<any>;
}

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    
    try {
      // Simular carregamento - integrar com API real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock de dados financeiros realistas
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 28750.50,
        monthlyRevenue: 15420.00,
        dailyAverage: 512.67,
        growthRate: 23.5,
        pendingPayments: 3250.00,
        overduePayments: 890.00,
        completedTransactions: 127,
        cancellations: 3
      };

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          description: 'Consulta de Fisioterapia - João Silva',
          amount: 150.00,
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          paymentMethod: 'pix',
          patientName: 'João Silva',
          serviceType: 'Consulta Individual',
          category: 'Atendimento'
        },
        {
          id: '2',
          type: 'income',
          description: 'Pacote 10 Sessões - Maria Santos',
          amount: 1200.00,
          date: '2024-01-15T14:15:00Z',
          status: 'completed',
          paymentMethod: 'credit_card',
          patientName: 'Maria Santos',
          serviceType: 'Pacote de Sessões',
          category: 'Atendimento'
        },
        {
          id: '3',
          type: 'income',
          description: 'Consulta + RPG - Pedro Oliveira',
          amount: 200.00,
          date: '2024-01-14T16:45:00Z',
          status: 'pending',
          paymentMethod: 'insurance',
          patientName: 'Pedro Oliveira',
          serviceType: 'RPG',
          category: 'Atendimento'
        },
        {
          id: '4',
          type: 'expense',
          description: 'Equipamento - Ultrassom Terapêutico',
          amount: -2500.00,
          date: '2024-01-12T09:00:00Z',
          status: 'completed',
          paymentMethod: 'bank_transfer',
          category: 'Equipamentos'
        },
        {
          id: '5',
          type: 'expense',
          description: 'Aluguel da Clínica - Janeiro 2024',
          amount: -3200.00,
          date: '2024-01-01T08:00:00Z',
          status: 'completed',
          paymentMethod: 'bank_transfer',
          category: 'Operacional'
        },
        {
          id: '6',
          type: 'refund',
          description: 'Estorno - Cancelamento Ana Costa',
          amount: -120.00,
          date: '2024-01-13T11:20:00Z',
          status: 'completed',
          paymentMethod: 'credit_card',
          patientName: 'Ana Costa',
          category: 'Estorno'
        }
      ];

      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          name: 'PIX',
          type: 'pix',
          fee: 0,
          processingTime: 'Instantâneo',
          isActive: true,
          monthlyVolume: 8500.00,
          icon: Zap
        },
        {
          id: '2',
          name: 'Cartão de Crédito',
          type: 'credit_card',
          fee: 3.49,
          processingTime: '1-2 dias úteis',
          isActive: true,
          monthlyVolume: 12300.00,
          icon: CreditCard
        },
        {
          id: '3',
          name: 'Cartão de Débito',
          type: 'debit_card',
          fee: 1.99,
          processingTime: '1 dia útil',
          isActive: true,
          monthlyVolume: 3200.00,
          icon: CreditCard
        },
        {
          id: '4',
          name: 'Dinheiro',
          type: 'cash',
          fee: 0,
          processingTime: 'Instantâneo',
          isActive: true,
          monthlyVolume: 1850.00,
          icon: Banknote
        },
        {
          id: '5',
          name: 'Convênios',
          type: 'insurance',
          fee: 8.5,
          processingTime: '30-45 dias',
          isActive: true,
          monthlyVolume: 15600.00,
          icon: Building
        },
        {
          id: '6',
          name: 'Transferência Bancária',
          type: 'bank_transfer',
          fee: 0,
          processingTime: '1-3 dias úteis',
          isActive: true,
          monthlyVolume: 4200.00,
          icon: Banknote
        }
      ];

      setMetrics(mockMetrics);
      setTransactions(mockTransactions);
      setPaymentMethods(mockPaymentMethods);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'refund': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'pix': return Activity;
      case 'credit_card':
      case 'debit_card': return CreditCard;
      case 'cash': return Banknote;
      case 'bank_transfer': return Banknote;
      case 'insurance': return Building;
      default: return Wallet;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-green-600" />
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Controle completo das suas finanças
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="1y">Último ano</option>
          </select>

          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={loadFinancialData}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedContainer animation="scale-in" delay={0}>
          <Card hover className="group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Receita Total</p>
                    <div className="flex items-center space-x-2">
                      {showBalance ? (
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(metrics.totalRevenue)}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-gray-400">••••••</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-0 h-6 w-6"
                      >
                        {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="scale-in" delay={100}>
          <Card hover className="group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Este Mês</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {showBalance ? formatCurrency(metrics.monthlyRevenue) : '••••••'}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        {formatPercent(metrics.growthRate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="scale-in" delay={200}>
          <Card hover className="group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {showBalance ? formatCurrency(metrics.pendingPayments) : '••••••'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Em análise
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="scale-in" delay={300}>
          <Card hover className="group cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Em Atraso</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {showBalance ? formatCurrency(metrics.overduePayments) : '••••••'}
                    </p>
                    <p className="text-sm text-red-500 mt-1">
                      Requer atenção
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="methods">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Receita vs Despesas */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Fluxo de Caixa - {selectedPeriod}
                  </h3>
                  
                  {/* Placeholder para gráfico */}
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">Gráfico de Fluxo de Caixa</p>
                      <p className="text-sm text-gray-400">
                        Receitas: {formatCurrency(metrics.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Transações Recentes */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Transações Recentes
                  </h3>
                  <Button variant="ghost" size="sm">
                    Ver Todas
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => {
                    const PaymentIcon = getPaymentMethodIcon(transaction.paymentMethod);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' :
                            transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            <PaymentIcon className={`h-4 w-4 ${getTypeColor(transaction.type)}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {transaction.patientName || transaction.description}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${getTypeColor(transaction.type)}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status === 'completed' ? 'Pago' :
                             transaction.status === 'pending' ? 'Pendente' :
                             transaction.status === 'failed' ? 'Falhou' : 'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Todas as Transações
                </h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filtrar
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Transação
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Descrição</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Categoria</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Método</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const PaymentIcon = getPaymentMethodIcon(transaction.paymentMethod);
                      
                      return (
                        <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {transaction.patientName || transaction.description}
                              </p>
                              {transaction.serviceType && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {transaction.serviceType}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {transaction.category}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <PaymentIcon className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {transaction.paymentMethod.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status === 'completed' ? 'Concluído' :
                               transaction.status === 'pending' ? 'Pendente' :
                               transaction.status === 'failed' ? 'Falhou' : 'Cancelado'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${getTypeColor(transaction.type)}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              
              return (
                <AnimatedContainer key={method.id} animation="scale-in" delay={index * 100}>
                  <Card hover className="group cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {method.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Taxa: {method.fee}%
                            </p>
                          </div>
                        </div>
                        <Badge className={method.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {method.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Volume Mensal:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(method.monthlyVolume)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Processamento:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {method.processingTime}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" size="sm" className="w-full">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Relatórios Disponíveis
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Relatório Mensal</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receitas e despesas do mês</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">DRE Simplificado</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Demonstrativo de resultado</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Fluxo de Caixa</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Entradas e saídas detalhadas</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Metas Financeiras
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Mensal
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round((metrics.monthlyRevenue / 20000) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((metrics.monthlyRevenue / 20000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{formatCurrency(metrics.monthlyRevenue)}</span>
                      <span>{formatCurrency(20000)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Meta Anual
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round((metrics.totalRevenue / 250000) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((metrics.totalRevenue / 250000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{formatCurrency(metrics.totalRevenue)}</span>
                      <span>{formatCurrency(250000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}