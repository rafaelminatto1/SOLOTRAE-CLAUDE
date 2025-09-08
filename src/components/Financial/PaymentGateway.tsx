import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  Zap,
  Settings,
  Check,
  X,
  AlertTriangle,
  Shield,
  Lock,
  Wifi,
  QrCode,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader,
  Info,
} from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  type: 'credit_card' | 'pix' | 'bank_transfer' | 'digital_wallet' | 'boleto' | 'insurance';
  isActive: boolean;
  isConfigured: boolean;
  configuration: {
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    environment: 'sandbox' | 'production';
  };
  fees: {
    creditCard: number;
    debitCard: number;
    pix: number;
    boleto: number;
    bankTransfer: number;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  processingTime: {
    credit: string;
    debit: string;
    pix: string;
    boleto: string;
  };
  features: string[];
  stats: {
    transactionsToday: number;
    volumeToday: number;
    successRate: number;
    avgProcessingTime: number;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  isEnabled: boolean;
  gateway: string;
}

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method: string;
  gateway: string;
  createdAt: string;
  patientName: string;
}

export default function PaymentGateway() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [testMode, setTestMode] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockGateways: PaymentGateway[] = [
        {
          id: '1',
          name: 'Stripe',
          provider: 'Stripe',
          type: 'credit_card',
          isActive: true,
          isConfigured: true,
          configuration: {
            merchantId: 'acct_1234567890',
            apiKey: 'pk_test_***************',
            secretKey: 'sk_test_***************',
            webhookUrl: 'https://fisioflow.com/webhooks/stripe',
            environment: 'sandbox'
          },
          fees: {
            creditCard: 3.49,
            debitCard: 1.99,
            pix: 0.99,
            boleto: 3.99,
            bankTransfer: 0
          },
          limits: {
            minAmount: 1,
            maxAmount: 50000,
            dailyLimit: 100000,
            monthlyLimit: 1000000
          },
          processingTime: {
            credit: '1-2 dias úteis',
            debit: '1 dia útil',
            pix: 'Instantâneo',
            boleto: '1-3 dias úteis'
          },
          features: ['Checkout transparente', 'Recorrência', 'Anti-fraude', 'Link de pagamento'],
          stats: {
            transactionsToday: 47,
            volumeToday: 8750.50,
            successRate: 96.8,
            avgProcessingTime: 1.2
          }
        },
        {
          id: '2',
          name: 'PagSeguro',
          provider: 'UOL PagSeguro',
          type: 'credit_card',
          isActive: true,
          isConfigured: true,
          configuration: {
            merchantId: 'MERCHANT123456',
            apiKey: 'api_key_***************',
            secretKey: 'secret_***************',
            webhookUrl: 'https://fisioflow.com/webhooks/pagseguro',
            environment: 'sandbox'
          },
          fees: {
            creditCard: 3.99,
            debitCard: 2.49,
            pix: 0.99,
            boleto: 3.49,
            bankTransfer: 0
          },
          limits: {
            minAmount: 1,
            maxAmount: 30000,
            dailyLimit: 50000,
            monthlyLimit: 500000
          },
          processingTime: {
            credit: '1-2 dias úteis',
            debit: '1 dia útil',
            pix: 'Instantâneo',
            boleto: '2-3 dias úteis'
          },
          features: ['Checkout transparente', 'PIX', 'Boleto', 'Cartão de crédito/débito'],
          stats: {
            transactionsToday: 23,
            volumeToday: 4320.00,
            successRate: 94.2,
            avgProcessingTime: 1.8
          }
        },
        {
          id: '3',
          name: 'Mercado Pago',
          provider: 'Mercado Pago',
          type: 'digital_wallet',
          isActive: false,
          isConfigured: false,
          configuration: {
            environment: 'sandbox'
          },
          fees: {
            creditCard: 3.49,
            debitCard: 1.99,
            pix: 0,
            boleto: 0,
            bankTransfer: 0
          },
          limits: {
            minAmount: 0.50,
            maxAmount: 25000,
            dailyLimit: 25000,
            monthlyLimit: 250000
          },
          processingTime: {
            credit: '1-2 dias úteis',
            debit: 'Instantâneo',
            pix: 'Instantâneo',
            boleto: '1-2 dias úteis'
          },
          features: ['Checkout Pro', 'QR Code', 'Link de pagamento', 'Assinatura'],
          stats: {
            transactionsToday: 0,
            volumeToday: 0,
            successRate: 0,
            avgProcessingTime: 0
          }
        }
      ];

      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          name: 'PIX',
          icon: Zap,
          color: 'bg-green-500',
          description: 'Pagamento instantâneo 24/7',
          isEnabled: true,
          gateway: 'stripe'
        },
        {
          id: '2',
          name: 'Cartão de Crédito',
          icon: CreditCard,
          color: 'bg-blue-500',
          description: 'Visa, Mastercard, American Express',
          isEnabled: true,
          gateway: 'stripe'
        },
        {
          id: '3',
          name: 'Cartão de Débito',
          icon: CreditCard,
          color: 'bg-purple-500',
          description: 'Débito em conta corrente',
          isEnabled: true,
          gateway: 'pagseguro'
        },
        {
          id: '4',
          name: 'Transferência Bancária',
          icon: Building,
          color: 'bg-indigo-500',
          description: 'TED/DOC entre bancos',
          isEnabled: false,
          gateway: 'pagseguro'
        },
        {
          id: '5',
          name: 'Dinheiro',
          icon: Banknote,
          color: 'bg-yellow-500',
          description: 'Pagamento em espécie',
          isEnabled: true,
          gateway: 'manual'
        },
        {
          id: '6',
          name: 'Convênios',
          icon: Building,
          color: 'bg-gray-500',
          description: 'Planos de saúde e seguros',
          isEnabled: true,
          gateway: 'insurance'
        }
      ];

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 150.00,
          status: 'completed',
          method: 'PIX',
          gateway: 'stripe',
          createdAt: '2024-01-15T10:30:00Z',
          patientName: 'João Silva'
        },
        {
          id: '2',
          amount: 200.00,
          status: 'processing',
          method: 'Cartão de Crédito',
          gateway: 'stripe',
          createdAt: '2024-01-15T09:15:00Z',
          patientName: 'Maria Santos'
        },
        {
          id: '3',
          amount: 120.00,
          status: 'failed',
          method: 'Cartão de Débito',
          gateway: 'pagseguro',
          createdAt: '2024-01-15T08:45:00Z',
          patientName: 'Pedro Oliveira'
        }
      ];

      setGateways(mockGateways);
      setPaymentMethods(mockPaymentMethods);
      setRecentTransactions(mockTransactions);

    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const toggleGateway = async (gatewayId: string) => {
    try {
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, isActive: !gateway.isActive }
          : gateway
      ));
    } catch (error) {
      console.error('Erro ao toggle gateway:', error);
    }
  };

  const configureGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
            Gateway de Pagamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure e gerencie suas formas de pagamento
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Ambiente:</span>
            <Badge className={testMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
              {testMode ? 'Teste' : 'Produção'}
            </Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={loadPaymentData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resumo de Transações */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedContainer animation="scale-in" delay={0}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Transações Hoje</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {gateways.reduce((sum, g) => sum + g.stats.transactionsToday, 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="scale-in" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Volume Hoje</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(gateways.reduce((sum, g) => sum + g.stats.volumeToday, 0))}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="scale-in" delay={200}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {((gateways.reduce((sum, g) => sum + g.stats.successRate * g.stats.transactionsToday, 0)) / 
                      Math.max(gateways.reduce((sum, g) => sum + g.stats.transactionsToday, 0), 1)).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer animation="scale-in" delay={300}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {((gateways.reduce((sum, g) => sum + g.stats.avgProcessingTime * g.stats.transactionsToday, 0)) / 
                      Math.max(gateways.reduce((sum, g) => sum + g.stats.transactionsToday, 0), 1)).toFixed(1)}s
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Gateways Configurados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Provedores de Pagamento
            </h2>
            
            <div className="space-y-4">
              {gateways.map((gateway, index) => (
                <AnimatedContainer key={gateway.id} animation="slide-up" delay={index * 100}>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        gateway.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          gateway.isActive ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                          {gateway.name}
                          {gateway.isConfigured && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {gateway.provider} • Taxa: {gateway.fees.creditCard}%
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{gateway.stats.transactionsToday} transações</span>
                          <span>{formatCurrency(gateway.stats.volumeToday)}</span>
                          <span>{gateway.stats.successRate}% sucesso</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={gateway.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {gateway.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => configureGateway(gateway)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGateway(gateway.id)}
                      >
                        {gateway.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Métodos Habilitados
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                
                return (
                  <AnimatedContainer key={method.id} animation="scale-in" delay={index * 50}>
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      method.isEnabled 
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${method.color}`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {method.gateway}
                        </Badge>
                        {method.isEnabled ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </AnimatedContainer>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transações Recentes
            </h2>
            <Button variant="ghost" size="sm">
              Ver Todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Paciente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Gateway</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Valor</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {transaction.patientName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {transaction.method}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {transaction.gateway}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status === 'completed' ? 'Concluído' :
                         transaction.status === 'processing' ? 'Processando' :
                         transaction.status === 'pending' ? 'Pendente' :
                         transaction.status === 'failed' ? 'Falhou' : 'Reembolsado'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal de Configuração */}
      {selectedGateway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configurar {selectedGateway.name}
                </h2>
                <Button variant="ghost" onClick={() => setSelectedGateway(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Informações do Gateway */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">
                        Sobre o {selectedGateway.name}
                      </h3>
                      <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                        <p>Funcionalidades:</p>
                        <ul className="list-disc list-inside mt-1">
                          {selectedGateway.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configurações da API */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Credenciais da API
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Merchant ID
                      </label>
                      <div className="relative">
                        <Input
                          type={showApiKeys ? 'text' : 'password'}
                          value={selectedGateway.configuration.merchantId || ''}
                          placeholder="Merchant ID do gateway"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowApiKeys(!showApiKeys)}
                        >
                          {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <Input
                          type={showApiKeys ? 'text' : 'password'}
                          value={selectedGateway.configuration.apiKey || ''}
                          placeholder="Chave pública da API"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Secret Key
                      </label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={selectedGateway.configuration.secretKey || ''}
                          placeholder="Chave secreta da API"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Webhook URL
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          value={selectedGateway.configuration.webhookUrl || ''}
                          placeholder="URL para receber notificações"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configurações de Taxa */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Taxas de Processamento
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cartão de Crédito (%)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={selectedGateway.fees.creditCard}
                        placeholder="3.49"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        PIX (%)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={selectedGateway.fees.pix}
                        placeholder="0.99"
                      />
                    </div>
                  </div>
                </div>

                {/* Teste de Conexão */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Testar Conexão
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Verificar se as credenciais estão corretas
                      </p>
                    </div>
                    <Button variant="outline">
                      <Wifi className="h-4 w-4 mr-2" />
                      Testar
                    </Button>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" onClick={() => setSelectedGateway(null)}>
                    Cancelar
                  </Button>
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}