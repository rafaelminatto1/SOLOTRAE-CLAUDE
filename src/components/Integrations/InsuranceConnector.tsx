import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, Clock, AlertTriangle, CreditCard, User, Calendar, DollarSign, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface InsuranceProvider {
  id: string;
  name: string;
  type: 'saude' | 'odontologico' | 'vida' | 'previdencia';
  logo: string;
  status: 'ativo' | 'inativo' | 'manutencao' | 'erro';
  apiEndpoint: string;
  authType: 'oauth2' | 'api_key' | 'certificate';
  supportedServices: string[];
  processingTime: number;
  successRate: number;
  lastUpdate: Date;
  coverage: CoverageInfo;
  contracts: ContractInfo[];
}

interface CoverageInfo {
  individuals: number;
  families: number;
  companies: number;
  totalLives: number;
  averageAge: number;
  genderDistribution: { male: number; female: number };
}

interface ContractInfo {
  id: string;
  companyName: string;
  planType: string;
  activeLives: number;
  monthlyPremium: number;
  renewalDate: Date;
  status: 'ativo' | 'pendente' | 'cancelado';
}

interface AuthorizationRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientCardNumber: string;
  providerId: string;
  providerName: string;
  serviceType: 'consulta' | 'exame' | 'procedimento' | 'internacao' | 'cirurgia';
  serviceCode: string;
  serviceDescription: string;
  requestedDate: Date;
  urgencyLevel: 'rotina' | 'urgente' | 'emergencia';
  estimatedCost: number;
  status: 'pendente' | 'aprovado' | 'negado' | 'informacoes_adicionais';
  responseTime?: number;
  approvalCode?: string;
  denialReason?: string;
  validUntil?: Date;
  clinicalData: {
    cid10: string;
    symptoms: string[];
    previousTreatments: string[];
    medicalHistory: string;
    urgencyJustification?: string;
  };
}

interface ClaimSubmission {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  serviceDate: Date;
  serviceType: string;
  serviceCode: string;
  authorizedAmount: number;
  actualAmount: number;
  status: 'enviado' | 'processando' | 'aprovado' | 'negado' | 'auditoria';
  submissionDate: Date;
  processingDate?: Date;
  paymentDate?: Date;
  documents: ClaimDocument[];
  auditNotes?: string[];
}

interface ClaimDocument {
  id: string;
  type: 'nota_fiscal' | 'relatorio_medico' | 'receituario' | 'exames' | 'outros';
  filename: string;
  uploadDate: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

interface EligibilityCheck {
  id: string;
  patientCardNumber: string;
  patientName: string;
  patientBirthDate: Date;
  providerId: string;
  checkDate: Date;
  status: 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
  planDetails: {
    planName: string;
    planType: string;
    validFrom: Date;
    validTo: Date;
    copayAmount: number;
    deductible: number;
    coverageLevel: string;
  };
  benefits: BenefitInfo[];
  limitations: LimitationInfo[];
}

interface BenefitInfo {
  serviceType: string;
  coverage: number;
  annualLimit?: number;
  usedAmount: number;
  remainingAmount: number;
  requiresAuthorization: boolean;
}

interface LimitationInfo {
  serviceType: string;
  restriction: string;
  waitingPeriod?: number;
  excludedConditions?: string[];
}

const mockProviders: InsuranceProvider[] = [
  {
    id: '1',
    name: 'Amil Assistência Médica',
    type: 'saude',
    logo: '🏥',
    status: 'ativo',
    apiEndpoint: 'https://api.amil.com.br/v2/',
    authType: 'oauth2',
    supportedServices: ['Elegibilidade', 'Autorização', 'Cobrança', 'Auditoria'],
    processingTime: 15,
    successRate: 98.5,
    lastUpdate: new Date(Date.now() - 10 * 60 * 1000),
    coverage: {
      individuals: 125000,
      families: 45000,
      companies: 350,
      totalLives: 287500,
      averageAge: 34.2,
      genderDistribution: { male: 48.5, female: 51.5 }
    },
    contracts: [
      {
        id: 'c1',
        companyName: 'Tech Solutions Ltd',
        planType: 'Executivo',
        activeLives: 1250,
        monthlyPremium: 125000,
        renewalDate: new Date('2024-12-31'),
        status: 'ativo'
      }
    ]
  },
  {
    id: '2',
    name: 'SulAmérica Saúde',
    type: 'saude',
    logo: '⛑️',
    status: 'ativo',
    apiEndpoint: 'https://api.sulamerica.com.br/health/v1/',
    authType: 'api_key',
    supportedServices: ['Elegibilidade', 'Autorização', 'Cobrança'],
    processingTime: 22,
    successRate: 97.2,
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    coverage: {
      individuals: 89000,
      families: 32000,
      companies: 280,
      totalLives: 198500,
      averageAge: 36.8,
      genderDistribution: { male: 49.2, female: 50.8 }
    },
    contracts: []
  },
  {
    id: '3',
    name: 'Bradesco Saúde',
    type: 'saude',
    logo: '🛡️',
    status: 'ativo',
    apiEndpoint: 'https://api.bradescosaude.com.br/v3/',
    authType: 'certificate',
    supportedServices: ['Elegibilidade', 'Autorização', 'Cobrança', 'Reembolso'],
    processingTime: 18,
    successRate: 98.1,
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    coverage: {
      individuals: 156000,
      families: 58000,
      companies: 420,
      totalLives: 342800,
      averageAge: 32.9,
      genderDistribution: { male: 47.8, female: 52.2 }
    },
    contracts: []
  },
  {
    id: '4',
    name: 'Unimed Nacional',
    type: 'saude',
    logo: '🏨',
    status: 'manutencao',
    apiEndpoint: 'https://api.unimed.com.br/saude/v2/',
    authType: 'oauth2',
    supportedServices: ['Elegibilidade', 'Autorização'],
    processingTime: 25,
    successRate: 96.8,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    coverage: {
      individuals: 234000,
      families: 87000,
      companies: 650,
      totalLives: 489600,
      averageAge: 35.5,
      genderDistribution: { male: 48.9, female: 51.1 }
    },
    contracts: []
  }
];

const mockAuthorizations: AuthorizationRequest[] = [
  {
    id: '1',
    patientId: 'p123',
    patientName: 'João Silva Santos',
    patientCardNumber: '123456789',
    providerId: '1',
    providerName: 'Amil',
    serviceType: 'exame',
    serviceCode: '40301012',
    serviceDescription: 'Ressonância Magnética - Joelho',
    requestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    urgencyLevel: 'rotina',
    estimatedCost: 850.00,
    status: 'aprovado',
    responseTime: 12,
    approvalCode: 'AMI-2024-001234',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    clinicalData: {
      cid10: 'M25.5',
      symptoms: ['Dor no joelho', 'Limitação de movimento'],
      previousTreatments: ['Fisioterapia', 'Anti-inflamatórios'],
      medicalHistory: 'Lesão esportiva há 3 meses'
    }
  },
  {
    id: '2',
    patientId: 'p456',
    patientName: 'Maria Oliveira',
    patientCardNumber: '987654321',
    providerId: '2',
    providerName: 'SulAmérica',
    serviceType: 'consulta',
    serviceCode: '10101012',
    serviceDescription: 'Consulta Cardiológica',
    requestedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    urgencyLevel: 'urgente',
    estimatedCost: 250.00,
    status: 'pendente',
    clinicalData: {
      cid10: 'I25.9',
      symptoms: ['Dor no peito', 'Falta de ar'],
      previousTreatments: [],
      medicalHistory: 'Hipertensão controlada',
      urgencyJustification: 'Sintomas sugestivos de angina'
    }
  }
];

const mockClaims: ClaimSubmission[] = [
  {
    id: '1',
    patientId: 'p123',
    patientName: 'João Silva Santos',
    providerId: '1',
    serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    serviceType: 'Ressonância Magnética',
    serviceCode: '40301012',
    authorizedAmount: 850.00,
    actualAmount: 820.00,
    status: 'aprovado',
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    processingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    documents: [
      {
        id: 'd1',
        type: 'nota_fiscal',
        filename: 'NF_001234.pdf',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'aprovado'
      },
      {
        id: 'd2',
        type: 'relatorio_medico',
        filename: 'relatorio_rm.pdf',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'aprovado'
      }
    ]
  }
];

export default function InsuranceConnector() {
  const [activeTab, setActiveTab] = useState<'providers' | 'authorizations' | 'claims' | 'eligibility'>('providers');
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [selectedAuth, setSelectedAuth] = useState<AuthorizationRequest | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'aprovado':
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pendente':
      case 'processando':
      case 'enviado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'manutencao':
      case 'informacoes_adicionais':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inativo':
      case 'negado':
      case 'cancelado':
      case 'erro':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergencia':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'urgente':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'rotina':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const ProvidersTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockProviders.map(provider => (
          <Card key={provider.id} className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.logo}</span>
                  {provider.name}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                  {provider.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Vidas Cobertas</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {provider.coverage.totalLives.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Taxa Sucesso</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {provider.successRate}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400 mb-2">
                  Serviços Suportados:
                </p>
                <div className="flex flex-wrap gap-1">
                  {provider.supportedServices.map(service => (
                    <span key={service} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-400">Tempo Médio:</span>
                <span className="font-medium">{provider.processingTime}min</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedProvider(provider)}>
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const AuthorizationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Solicitações de Autorização
        </h2>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Nova Autorização
        </Button>
      </div>

      <div className="space-y-4">
        {mockAuthorizations.map(auth => (
          <Card key={auth.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {auth.serviceDescription}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {auth.patientName}
                      </span>
                      <span>{auth.providerName}</span>
                      <span>R$ {auth.estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(auth.urgencyLevel)}`}>
                    {auth.urgencyLevel}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auth.status)}`}>
                    {auth.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Data Solicitada</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {auth.requestedDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">CID-10</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {auth.clinicalData.cid10}
                  </p>
                </div>
                
                {auth.responseTime && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-400">Tempo Resposta</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {auth.responseTime} min
                    </p>
                  </div>
                )}
              </div>

              {auth.status === 'aprovado' && auth.approvalCode && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-300">
                      Autorização Aprovada
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Código: {auth.approvalCode}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Válida até: {auth.validUntil?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {auth.status === 'negado' && auth.denialReason && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-300">
                      Autorização Negada
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {auth.denialReason}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedAuth(auth)}>
                  Ver Detalhes
                </Button>
                {auth.status === 'pendente' && (
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Acompanhar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ClaimsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cobranças e Reembolsos
        </h2>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Nova Cobrança
        </Button>
      </div>

      <div className="space-y-4">
        {mockClaims.map(claim => (
          <Card key={claim.id} className="border border-gray-200 dark:border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {claim.serviceType}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {claim.patientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {claim.serviceDate.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                  {claim.status}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Valor Autorizado</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    R$ {claim.authorizedAmount.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Valor Cobrado</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    R$ {claim.actualAmount.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Data Envio</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {claim.submissionDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {claim.paymentDate && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-400">Data Pagamento</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {claim.paymentDate.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Documentos ({claim.documents.length}):
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {claim.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {doc.filename}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  Baixar Comprovante
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Integração com Convênios
            </h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gestão de autorizações, cobranças e elegibilidade
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Convênios Ativos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockProviders.filter(p => p.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Autorizações Aprovadas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockAuthorizations.filter(a => a.status === 'aprovado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Pendentes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {mockAuthorizations.filter(a => a.status === 'pendente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Valor Processado</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  R$ {mockClaims.reduce((sum, c) => sum + c.actualAmount, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        {[
          { id: 'providers', label: 'Convênios', icon: Shield },
          { id: 'authorizations', label: 'Autorizações', icon: FileText },
          { id: 'claims', label: 'Cobranças', icon: DollarSign },
          { id: 'eligibility', label: 'Elegibilidade', icon: CheckCircle }
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
      {activeTab === 'providers' && <ProvidersTab />}
      {activeTab === 'authorizations' && <AuthorizationsTab />}
      {activeTab === 'claims' && <ClaimsTab />}
      {activeTab === 'eligibility' && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Verificação de Elegibilidade
          </h3>
          <p className="text-gray-500 dark:text-dark-400">
            Sistema de verificação em desenvolvimento...
          </p>
        </div>
      )}

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedProvider.logo}</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedProvider.name}
                </h3>
              </div>
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                ×
              </Button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Cobertura
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Pessoas Físicas:</span>
                      <span className="font-medium">{selectedProvider.coverage.individuals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Famílias:</span>
                      <span className="font-medium">{selectedProvider.coverage.families.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Empresas:</span>
                      <span className="font-medium">{selectedProvider.coverage.companies.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Total Vidas:</span>
                      <span className="font-bold">{selectedProvider.coverage.totalLives.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Taxa de Sucesso:</span>
                      <span className="font-medium">{selectedProvider.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Tempo Médio:</span>
                      <span className="font-medium">{selectedProvider.processingTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-400">Última Atualização:</span>
                      <span className="font-medium">{selectedProvider.lastUpdate.toLocaleString('pt-BR')}</span>
                    </div>
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