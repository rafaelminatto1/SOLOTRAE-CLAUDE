import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Building2,
  CreditCard,
  Users,
  Gift,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  type: 'corporate' | 'health_plan' | 'gym' | 'pharmacy';
  status: 'active' | 'inactive' | 'pending';
  contractStart: string;
  contractEnd: string;
  commissionRate: number;
  vouchersIssued: number;
  vouchersUsed: number;
  revenue: number;
  rating: number;
  contact: {
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
  benefits: string[];
}

const mockPartners: Partner[] = [
  {
    id: 'corp-001',
    name: 'TechCorp Saúde',
    type: 'corporate',
    status: 'active',
    contractStart: '2024-01-15',
    contractEnd: '2025-01-15',
    commissionRate: 15,
    vouchersIssued: 250,
    vouchersUsed: 187,
    revenue: 28750,
    rating: 4.8,
    contact: {
      email: 'parceria@techcorp.com.br',
      phone: '(11) 3456-7890',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      website: 'https://techcorp.com.br'
    },
    benefits: ['Desconto 20% em consultas', 'Sessões de pilates grátis', 'Avaliação física completa']
  },
  {
    id: 'plan-001',
    name: 'UnMed Planos',
    type: 'health_plan',
    status: 'active',
    contractStart: '2023-06-10',
    contractEnd: '2025-06-10',
    commissionRate: 12,
    vouchersIssued: 580,
    vouchersUsed: 445,
    revenue: 67200,
    rating: 4.6,
    contact: {
      email: 'fisioterapia@unmed.com.br',
      phone: '(11) 2345-6789',
      address: 'R. Augusta, 500 - São Paulo/SP',
      website: 'https://unmed.com.br'
    },
    benefits: ['Cobertura total fisioterapia', 'RPG incluído', 'Até 24 sessões/ano']
  },
  {
    id: 'gym-001',
    name: 'FitLife Academia',
    type: 'gym',
    status: 'pending',
    contractStart: '2024-03-01',
    contractEnd: '2025-03-01',
    commissionRate: 18,
    vouchersIssued: 120,
    vouchersUsed: 89,
    revenue: 15400,
    rating: 4.9,
    contact: {
      email: 'contato@fitlife.com.br',
      phone: '(11) 4567-8901',
      address: 'Av. Rebouças, 800 - São Paulo/SP',
      website: 'https://fitlife.com.br'
    },
    benefits: ['Cross-training fisio', 'Avaliação postural', 'Personal trainer incluso']
  },
  {
    id: 'farm-001',
    name: 'FarmaVida',
    type: 'pharmacy',
    status: 'active',
    contractStart: '2024-02-20',
    contractEnd: '2025-02-20',
    commissionRate: 10,
    vouchersIssued: 95,
    vouchersUsed: 72,
    revenue: 8500,
    rating: 4.4,
    contact: {
      email: 'vendas@farmavida.com.br',
      phone: '(11) 5678-9012',
      address: 'R. da Consolação, 1200 - São Paulo/SP'
    },
    benefits: ['Desconto medicamentos', 'Suplementos esportivos', 'Frete grátis acima R$ 50']
  }
];

const getPartnerTypeLabel = (type: string) => {
  const labels = {
    corporate: 'Empresa',
    health_plan: 'Plano de Saúde',
    gym: 'Academia',
    pharmacy: 'Farmácia'
  };
  return labels[type as keyof typeof labels];
};

const getPartnerTypeIcon = (type: string) => {
  const icons = {
    corporate: Building2,
    health_plan: CreditCard,
    gym: Users,
    pharmacy: Gift
  };
  const Icon = icons[type as keyof typeof icons];
  return <Icon className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  const colors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-red-600 bg-red-100',
    pending: 'text-yellow-600 bg-yellow-100'
  };
  return colors[status as keyof typeof colors];
};

const getStatusIcon = (status: string) => {
  const icons = {
    active: CheckCircle,
    inactive: AlertCircle,
    pending: Clock
  };
  const Icon = icons[status as keyof typeof icons];
  return <Icon className="h-4 w-4" />;
};

export default function PartnerPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const totalRevenue = mockPartners.reduce((sum, partner) => sum + partner.revenue, 0);
  const totalVouchers = mockPartners.reduce((sum, partner) => sum + partner.vouchersIssued, 0);
  const totalUsed = mockPartners.reduce((sum, partner) => sum + partner.vouchersUsed, 0);
  const averageRating = mockPartners.reduce((sum, partner) => sum + partner.rating, 0) / mockPartners.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContainer animation="fade-in">
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Portal de Parcerias
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gestão completa de parcerias e relacionamentos comerciais
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Parcerias</div>
                <div className="font-semibold text-blue-600 text-2xl">{mockPartners.length}</div>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Notificações
              </Button>
            </div>
          </div>
        </Card>
      </AnimatedContainer>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedContainer animation="slide-up" delay={100}>
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    R$ {totalRevenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-green-600 mt-1">+18,5% este mês</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vouchers Emitidos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVouchers}</p>
                  <p className="text-sm text-blue-600 mt-1">+12,3% este mês</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.round((totalUsed / totalVouchers) * 100)}%
                  </p>
                  <p className="text-sm text-green-600 mt-1">+2,8% este mês</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avaliação Média</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Sistema Completo */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Parceiros</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance por Tipo */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance por Tipo de Parceria
                  </h3>
                  
                  <div className="space-y-4">
                    {['corporate', 'health_plan', 'gym', 'pharmacy'].map((type) => {
                      const partners = mockPartners.filter(p => p.type === type);
                      const revenue = partners.reduce((sum, p) => sum + p.revenue, 0);
                      const vouchers = partners.reduce((sum, p) => sum + p.vouchersUsed, 0);
                      
                      return (
                        <div key={type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              {getPartnerTypeIcon(type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {getPartnerTypeLabel(type)}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {partners.length} parceiro{partners.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              R$ {revenue.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {vouchers} vouchers
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Atividade Recente */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Atividade Recente
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { action: 'Novo voucher gerado', partner: 'TechCorp Saúde', time: '2 min atrás', type: 'voucher' },
                      { action: 'Contrato renovado', partner: 'UnMed Planos', time: '1 hora atrás', type: 'contract' },
                      { action: 'Pagamento recebido', partner: 'FitLife Academia', time: '3 horas atrás', type: 'payment' },
                      { action: 'Parceria aprovada', partner: 'FarmaVida', time: '1 dia atrás', type: 'approval' },
                      { action: 'Relatório enviado', partner: 'TechCorp Saúde', time: '2 dias atrás', type: 'report' }
                    ].map((activity, index) => (
                      <AnimatedContainer key={index} animation="slide-right" delay={index * 100}>
                        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === 'voucher' ? 'bg-green-100 text-green-600' :
                            activity.type === 'contract' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                            activity.type === 'approval' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'voucher' && <Gift className="h-4 w-4" />}
                            {activity.type === 'contract' && <Building2 className="h-4 w-4" />}
                            {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                            {activity.type === 'approval' && <CheckCircle className="h-4 w-4" />}
                            {activity.type === 'report' && <BarChart3 className="h-4 w-4" />}
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {activity.partner} • {activity.time}
                            </p>
                          </div>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="mt-6">
            <div className="space-y-6">
              {/* Lista de Parceiros */}
              <div className="grid gap-6">
                {mockPartners.map((partner, index) => (
                  <AnimatedContainer key={partner.id} animation="slide-up" delay={index * 100}>
                    <Card hover className="group cursor-pointer" onClick={() => setSelectedPartner(partner)}>
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              {partner.name.charAt(0)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                                  {partner.name}
                                </h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(partner.status)}`}>
                                  {getStatusIcon(partner.status)}
                                  <span className="capitalize">{partner.status}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  {getPartnerTypeIcon(partner.type)}
                                  <span>{getPartnerTypeLabel(partner.type)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{partner.contact.address.split(' - ')[1]}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span>{partner.rating}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Receita: </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    R$ {partner.revenue.toLocaleString('pt-BR')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Vouchers: </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {partner.vouchersUsed}/{partner.vouchersIssued}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Comissão: </span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {partner.commissionRate}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Melhores Performers
                  </h3>
                  
                  <div className="space-y-4">
                    {mockPartners
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 3)
                      .map((partner, index) => (
                        <div key={partner.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {partner.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              R$ {partner.revenue.toLocaleString('pt-BR')} • {Math.round((partner.vouchersUsed / partner.vouchersIssued) * 100)}% conversão
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {partner.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>

              {/* Contratos Próximos do Vencimento */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contratos Próximos do Vencimento
                  </h3>
                  
                  <div className="space-y-4">
                    {mockPartners
                      .sort((a, b) => new Date(a.contractEnd).getTime() - new Date(b.contractEnd).getTime())
                      .slice(0, 3)
                      .map((partner) => {
                        const daysLeft = Math.ceil(
                          (new Date(partner.contractEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        return (
                          <div key={partner.id} className="flex items-center justify-between p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {partner.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vence em {new Date(partner.contractEnd).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                daysLeft < 30 ? 'text-red-600' : 
                                daysLeft < 60 ? 'text-orange-600' : 'text-yellow-600'
                              }`}>
                                {daysLeft} dias
                              </div>
                              <Button variant="outline" size="sm" className="mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                Renovar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Relatórios Disponíveis */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Relatórios de Performance
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Relatório Mensal de Parcerias', description: 'Performance completa de todos os parceiros', format: 'PDF, Excel' },
                      { name: 'Análise de ROI por Parceiro', description: 'Retorno sobre investimento detalhado', format: 'PDF, Excel' },
                      { name: 'Vouchers - Uso e Conversão', description: 'Análise detalhada dos vouchers emitidos', format: 'PDF, Excel' },
                      { name: 'Projeção de Receitas', description: 'Estimativas baseadas em contratos ativos', format: 'PDF, Excel' },
                      { name: 'Relatório de Satisfação', description: 'Avaliações e feedback dos parceiros', format: 'PDF, Excel' }
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {report.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {report.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Formato: {report.format}
                          </p>
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
                    ))}
                  </div>
                </div>
              </Card>

              {/* Exportação Rápida */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Exportação Rápida
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Período
                      </label>
                      <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        <option>Último mês</option>
                        <option>Últimos 3 meses</option>
                        <option>Últimos 6 meses</option>
                        <option>Último ano</option>
                        <option>Personalizado</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipo de Parceiro
                      </label>
                      <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        <option>Todos os tipos</option>
                        <option>Empresas</option>
                        <option>Planos de Saúde</option>
                        <option>Academias</option>
                        <option>Farmácias</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Formato de Exportação
                      </label>
                      <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        <option>PDF</option>
                        <option>Excel</option>
                        <option>CSV</option>
                      </select>
                    </div>
                    
                    <Button className="w-full mt-6">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar e Baixar Relatório
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}