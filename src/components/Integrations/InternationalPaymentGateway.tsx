import React, { useState } from 'react';
import { CreditCard, DollarSign, Globe, Shield, CheckCircle, AlertTriangle, Clock, TrendingUp, Settings, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface PaymentGateway {
  id: string;
  name: string;
  provider: 'stripe' | 'paypal' | 'adyen' | 'square' | 'braintree' | 'razorpay' | 'mercadopago' | 'payu';
  region: string[];
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  supportedCurrencies: Currency[];
  supportedMethods: PaymentMethod[];
  processingFees: FeeStructure;
  settlementTime: string;
  apiVersion: string;
  lastHealthCheck: Date;
  monthlyVolume: number;
  successRate: number;
  averageProcessingTime: number;
  securityFeatures: SecurityFeature[];
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
  exchangeRate?: number;
  processingFee: number;
}

interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'crypto' | 'bnpl' | 'local_payment';
  name: string;
  regions: string[];
  processingTime: string;
  fee: number;
  enabled: boolean;
}

interface FeeStructure {
  fixed: number;
  percentage: number;
  internationalFee: number;
  currency: string;
  minFee: number;
  maxFee?: number;
}

interface SecurityFeature {
  name: string;
  type: 'fraud_detection' | 'encryption' | 'compliance' | 'authentication';
  enabled: boolean;
  description: string;
}

interface PaymentTransaction {
  id: string;
  gatewayId: string;
  patientId: string;
  patientName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
  referenceId: string;
  merchantFee: number;
  netAmount: number;
  region: string;
  riskScore?: number;
  fraudFlags?: string[];
}

interface MultiCurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  trend: 'up' | 'down' | 'stable';
  provider: string;
}

interface PaymentAnalytics {
  totalVolume: number;
  totalTransactions: number;
  averageTransactionValue: number;
  successRate: number;
  failureRate: number;
  refundRate: number;
  topCurrencies: CurrencyStats[];
  topMethods: MethodStats[];
  regionalBreakdown: RegionalStats[];
  fraudPrevented: number;
}

interface CurrencyStats {
  currency: string;
  volume: number;
  transactions: number;
  percentage: number;
}

interface MethodStats {
  method: string;
  volume: number;
  transactions: number;
  successRate: number;
}

interface RegionalStats {
  region: string;
  volume: number;
  transactions: number;
  successRate: number;
}

const mockGateways: PaymentGateway[] = [
  {
    id: '1',
    name: 'Stripe International',
    provider: 'stripe',
    region: ['Global'],
    status: 'active',
    supportedCurrencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true, processingFee: 2.9 },
      { code: 'EUR', name: 'Euro', symbol: '€', enabled: true, processingFee: 1.4 },
      { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true, processingFee: 1.4 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', enabled: true, processingFee: 2.9 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', enabled: false, processingFee: 1.75 }
    ],
    supportedMethods: [
      { type: 'credit_card', name: 'Credit Cards', regions: ['Global'], processingTime: 'Instant', fee: 2.9, enabled: true },
      { type: 'digital_wallet', name: 'Apple Pay, Google Pay', regions: ['US', 'EU'], processingTime: 'Instant', fee: 2.9, enabled: true },
      { type: 'bank_transfer', name: 'ACH, SEPA', regions: ['US', 'EU'], processingTime: '1-3 days', fee: 0.8, enabled: true }
    ],
    processingFees: {
      fixed: 0.30,
      percentage: 2.9,
      internationalFee: 1.5,
      currency: 'USD',
      minFee: 0.50,
      maxFee: 25.00
    },
    settlementTime: '2 business days',
    apiVersion: 'v3',
    lastHealthCheck: new Date(Date.now() - 5 * 60 * 1000),
    monthlyVolume: 245000,
    successRate: 97.8,
    averageProcessingTime: 1.2,
    securityFeatures: [
      { name: 'PCI DSS Level 1', type: 'compliance', enabled: true, description: 'Highest level of payment security' },
      { name: 'Radar Fraud Detection', type: 'fraud_detection', enabled: true, description: 'ML-powered fraud prevention' },
      { name: '3D Secure 2.0', type: 'authentication', enabled: true, description: 'Strong customer authentication' }
    ]
  },
  {
    id: '2',
    name: 'PayPal Global',
    provider: 'paypal',
    region: ['Global'],
    status: 'active',
    supportedCurrencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true, processingFee: 3.49 },
      { code: 'EUR', name: 'Euro', symbol: '€', enabled: true, processingFee: 2.9 },
      { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true, processingFee: 2.9 }
    ],
    supportedMethods: [
      { type: 'digital_wallet', name: 'PayPal Wallet', regions: ['Global'], processingTime: 'Instant', fee: 3.49, enabled: true },
      { type: 'credit_card', name: 'PayPal Credit Cards', regions: ['Global'], processingTime: 'Instant', fee: 3.49, enabled: true }
    ],
    processingFees: {
      fixed: 0.30,
      percentage: 3.49,
      internationalFee: 1.0,
      currency: 'USD',
      minFee: 0.50
    },
    settlementTime: '1 business day',
    apiVersion: 'v2',
    lastHealthCheck: new Date(Date.now() - 10 * 60 * 1000),
    monthlyVolume: 189000,
    successRate: 96.2,
    averageProcessingTime: 2.1,
    securityFeatures: [
      { name: 'PayPal Protection', type: 'fraud_detection', enabled: true, description: 'Built-in fraud protection' },
      { name: 'Encrypted Transactions', type: 'encryption', enabled: true, description: 'End-to-end encryption' }
    ]
  },
  {
    id: '3',
    name: 'Adyen Unified Commerce',
    provider: 'adyen',
    region: ['Europe', 'Asia-Pacific', 'Americas'],
    status: 'active',
    supportedCurrencies: [
      { code: 'EUR', name: 'Euro', symbol: '€', enabled: true, processingFee: 1.8 },
      { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true, processingFee: 2.6 },
      { code: 'GBP', name: 'British Pound', symbol: '£', enabled: true, processingFee: 1.8 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', enabled: true, processingFee: 3.25 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', enabled: false, processingFee: 2.95 }
    ],
    supportedMethods: [
      { type: 'credit_card', name: 'International Cards', regions: ['Global'], processingTime: 'Instant', fee: 1.8, enabled: true },
      { type: 'local_payment', name: 'iDEAL, Sofort, Alipay', regions: ['EU', 'APAC'], processingTime: 'Instant', fee: 0.9, enabled: true },
      { type: 'bank_transfer', name: 'Local Bank Transfers', regions: ['EU', 'APAC'], processingTime: '1-3 days', fee: 0.5, enabled: true }
    ],
    processingFees: {
      fixed: 0.20,
      percentage: 1.8,
      internationalFee: 0.8,
      currency: 'EUR',
      minFee: 0.20
    },
    settlementTime: '1-2 business days',
    apiVersion: 'v70',
    lastHealthCheck: new Date(Date.now() - 2 * 60 * 1000),
    monthlyVolume: 324000,
    successRate: 98.5,
    averageProcessingTime: 0.8,
    securityFeatures: [
      { name: 'RevenueProtect', type: 'fraud_detection', enabled: true, description: 'Advanced fraud detection' },
      { name: 'PCI DSS Level 1', type: 'compliance', enabled: true, description: 'Highest security standards' },
      { name: 'Risk Management', type: 'fraud_detection', enabled: true, description: 'Real-time risk assessment' }
    ]
  },
  {
    id: '4',
    name: 'MercadoPago Latin America',
    provider: 'mercadopago',
    region: ['Latin America'],
    status: 'maintenance',
    supportedCurrencies: [
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', enabled: true, processingFee: 4.99 },
      { code: 'ARS', name: 'Argentine Peso', symbol: '$', enabled: true, processingFee: 5.99 },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$', enabled: true, processingFee: 3.6 },
      { code: 'USD', name: 'US Dollar', symbol: '$', enabled: false, processingFee: 4.99 }
    ],
    supportedMethods: [
      { type: 'credit_card', name: 'Local Credit Cards', regions: ['LATAM'], processingTime: 'Instant', fee: 4.99, enabled: true },
      { type: 'local_payment', name: 'PIX, Boleto, OXXO', regions: ['LATAM'], processingTime: '1-3 days', fee: 1.99, enabled: true }
    ],
    processingFees: {
      fixed: 0.50,
      percentage: 4.99,
      internationalFee: 2.0,
      currency: 'BRL',
      minFee: 1.00
    },
    settlementTime: '14-30 days',
    apiVersion: 'v1',
    lastHealthCheck: new Date(Date.now() - 4 * 60 * 60 * 1000),
    monthlyVolume: 67000,
    successRate: 94.1,
    averageProcessingTime: 3.2,
    securityFeatures: [
      { name: 'ML Anti-Fraud', type: 'fraud_detection', enabled: true, description: 'Machine learning fraud detection' }
    ]
  }
];

const mockTransactions: PaymentTransaction[] = [
  {
    id: 't1',
    gatewayId: '1',
    patientId: 'p123',
    patientName: 'John Smith (USA)',
    amount: 150.00,
    currency: 'USD',
    paymentMethod: 'Visa ****1234',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000),
    referenceId: 'pi_1234567890',
    merchantFee: 4.65,
    netAmount: 145.35,
    region: 'North America',
    riskScore: 12
  },
  {
    id: 't2',
    gatewayId: '2',
    patientId: 'p456',
    patientName: 'Marie Dubois (France)',
    amount: 89.50,
    currency: 'EUR',
    paymentMethod: 'PayPal',
    status: 'completed',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 8000),
    referenceId: 'pp_987654321',
    merchantFee: 2.90,
    netAmount: 86.60,
    region: 'Europe'
  },
  {
    id: 't3',
    gatewayId: '3',
    patientId: 'p789',
    patientName: 'Hans Mueller (Germany)',
    amount: 200.00,
    currency: 'EUR',
    paymentMethod: 'iDEAL',
    status: 'processing',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    referenceId: 'ad_456789123',
    merchantFee: 1.80,
    netAmount: 198.20,
    region: 'Europe'
  },
  {
    id: 't4',
    gatewayId: '4',
    patientId: 'p321',
    patientName: 'Carlos Silva (Brazil)',
    amount: 150.00,
    currency: 'BRL',
    paymentMethod: 'PIX',
    status: 'failed',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    referenceId: 'mp_123456789',
    failureReason: 'Insufficient funds',
    merchantFee: 0,
    netAmount: 0,
    region: 'Latin America',
    fraudFlags: ['unusual_location']
  }
];

const mockAnalytics: PaymentAnalytics = {
  totalVolume: 825000,
  totalTransactions: 3247,
  averageTransactionValue: 254.12,
  successRate: 96.8,
  failureRate: 2.7,
  refundRate: 0.5,
  topCurrencies: [
    { currency: 'USD', volume: 412500, transactions: 1623, percentage: 50.0 },
    { currency: 'EUR', volume: 247500, transactions: 973, percentage: 30.0 },
    { currency: 'GBP', volume: 123750, transactions: 487, percentage: 15.0 },
    { currency: 'BRL', volume: 41250, transactions: 164, percentage: 5.0 }
  ],
  topMethods: [
    { method: 'Credit Card', volume: 577500, transactions: 2271, successRate: 97.2 },
    { method: 'Digital Wallet', volume: 165000, transactions: 649, successRate: 98.1 },
    { method: 'Bank Transfer', volume: 82500, transactions: 324, successRate: 94.8 }
  ],
  regionalBreakdown: [
    { region: 'North America', volume: 412500, transactions: 1623, successRate: 97.5 },
    { region: 'Europe', volume: 330000, transactions: 1298, successRate: 96.8 },
    { region: 'Latin America', volume: 82500, transactions: 326, successRate: 94.1 }
  ],
  fraudPrevented: 12750
};

export default function InternationalPaymentGateway() {
  const [activeTab, setActiveTab] = useState<'gateways' | 'transactions' | 'analytics' | 'currencies'>('gateways');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive':
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded':
      case 'disputed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return '💳';
      case 'paypal': return '🅿️';
      case 'adyen': return '🔷';
      case 'square': return '⬛';
      case 'braintree': return '🧠';
      case 'razorpay': return '⚡';
      case 'mercadopago': return '🛒';
      case 'payu': return '💰';
      default: return '💳';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const GatewaysTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gateways de Pagamento
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Adicionar Gateway
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mockGateways.map(gateway => (
          <Card key={gateway.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProviderIcon(gateway.provider)}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{gateway.name}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      {gateway.region.join(', ')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gateway.status)}`}>
                  {gateway.status}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Volume Mensal</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(gateway.monthlyVolume, 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Taxa Sucesso</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {gateway.successRate}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400 mb-2">
                  Moedas Suportadas ({gateway.supportedCurrencies.filter(c => c.enabled).length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {gateway.supportedCurrencies.filter(c => c.enabled).slice(0, 4).map(currency => (
                    <span key={currency.code} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                      {currency.symbol} {currency.code}
                    </span>
                  ))}
                  {gateway.supportedCurrencies.filter(c => c.enabled).length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-dark-400 text-xs rounded">
                      +{gateway.supportedCurrencies.filter(c => c.enabled).length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Taxa de Processamento:</span>
                <span className="font-medium">
                  {gateway.processingFees.percentage}% + {formatCurrency(gateway.processingFees.fixed, gateway.processingFees.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Tempo de Liquidação:</span>
                <span className="font-medium">{gateway.settlementTime}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedGateway(gateway)}>
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Testar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Transações Recentes
        </h2>
        <div className="flex gap-2">
          <Button variant="outline">Exportar</Button>
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            Nova Cobrança
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockTransactions.map(transaction => (
          <Card key={transaction.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-400 mt-1">
                      <span>{transaction.patientName}</span>
                      <span>{transaction.paymentMethod}</span>
                      <span>{transaction.region}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">ID da Transação</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {transaction.referenceId}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Taxa do Comerciante</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(transaction.merchantFee, transaction.currency)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Valor Líquido</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(transaction.netAmount, transaction.currency)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Data/Hora</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.createdAt.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {transaction.status === 'failed' && transaction.failureReason && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-300">
                      Falha no Pagamento
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {transaction.failureReason}
                  </p>
                </div>
              )}

              {transaction.fraudFlags && transaction.fraudFlags.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-800 dark:text-orange-300">
                      Alertas de Fraude
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {transaction.fraudFlags.map(flag => (
                      <span key={flag} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-xs rounded">
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
                {transaction.status === 'completed' && (
                  <Button variant="outline" size="sm">
                    Reembolsar
                  </Button>
                )}
                {transaction.status === 'failed' && (
                  <Button variant="outline" size="sm">
                    Reprocessar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Análise de Pagamentos
        </h2>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          <TrendingUp className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Volume Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(mockAnalytics.totalVolume, 'USD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Transações</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockAnalytics.totalTransactions.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Taxa Sucesso</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockAnalytics.successRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Fraude Evitada</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(mockAnalytics.fraudPrevented, 'USD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Currencies */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Top Moedas por Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.topCurrencies.map(currency => (
              <div key={currency.currency} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {currency.currency}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currency.currency}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      {currency.transactions.toLocaleString()} transações
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currency.volume, currency.currency)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    {currency.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Breakdown */}
      <Card className="border border-gray-200 dark:border-dark-600">
        <CardHeader>
          <CardTitle>Breakdown por Região</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.regionalBreakdown.map(region => (
              <div key={region.region} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {region.region}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      {region.transactions.toLocaleString()} transações • {region.successRate}% sucesso
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(region.volume, 'USD')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gateways de Pagamento Internacional
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Processamento global de pagamentos em múltiplas moedas
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'gateways', label: 'Gateways', icon: CreditCard },
          { id: 'transactions', label: 'Transações', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'currencies', label: 'Moedas', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'gateways' && <GatewaysTab />}
      {activeTab === 'transactions' && <TransactionsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'currencies' && (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Gestão de Moedas
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Sistema de conversão de moedas em desenvolvimento...
          </p>
        </div>
      )}

      {/* Gateway Details Modal */}
      {selectedGateway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProviderIcon(selectedGateway.provider)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedGateway.name}
                  </h3>
                  <p className="text-gray-600 dark:text-dark-400">
                    {selectedGateway.region.join(', ')}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedGateway(null)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Recursos de Segurança
                  </h4>
                  <div className="space-y-3">
                    {selectedGateway.securityFeatures.map(feature => (
                      <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {feature.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-dark-400">
                            {feature.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          feature.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {feature.enabled ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Métodos de Pagamento
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedGateway.supportedMethods.map(method => (
                      <div key={method.type} className="p-3 border border-gray-200 dark:border-dark-600 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {method.name}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            method.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {method.enabled ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-400 space-y-1">
                          <p>Taxa: {method.fee}%</p>
                          <p>Tempo: {method.processingTime}</p>
                          <p>Regiões: {method.regions.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}