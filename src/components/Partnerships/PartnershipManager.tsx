import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Handshake,
  Building,
  Users,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  DollarSign,
  Percent,
  Gift,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share,
  Download,
  RefreshCw,
  Filter,
  Search,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Link,
  ExternalLink,
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  type: 'corporate' | 'individual' | 'health_plan' | 'gym' | 'pharmacy' | 'clinic';
  logo?: string;
  description: string;
  contact: {
    responsibleName: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
  contract: {
    startDate: string;
    endDate: string;
    status: 'active' | 'pending' | 'expired' | 'suspended' | 'cancelled';
    commission: number; // Percentual de comissão
    exclusivity: boolean;
  };
  benefits: {
    discountPercentage: number;
    maxDiscount: number;
    categories: string[];
    validDays: number[];
    validHours: { start: string; end: string };
  };
  stats: {
    totalVouchers: number;
    usedVouchers: number;
    totalRevenue: number;
    avgTicket: number;
    conversionRate: number;
    activeCustomers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface VoucherTemplate {
  id: string;
  partnerId: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUsage: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  conditions: string[];
  isActive: boolean;
  generatedCount: number;
}

export default function PartnershipManager() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [voucherTemplates, setVoucherTemplates] = useState<VoucherTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    loadPartnershipsData();
  }, []);

  const loadPartnershipsData = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPartners: Partner[] = [
        {
          id: '1',
          name: 'FitLife Academia',
          type: 'gym',
          logo: '/logos/fitlife.png',
          description: 'Academia premium com foco em reabilitação e condicionamento físico',
          contact: {
            responsibleName: 'Carlos Silva',
            email: 'parceria@fitlife.com.br',
            phone: '(11) 99999-8888',
            address: 'Av. Paulista, 1000 - São Paulo, SP',
            website: 'https://fitlife.com.br'
          },
          contract: {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'active',
            commission: 15,
            exclusivity: false
          },
          benefits: {
            discountPercentage: 20,
            maxDiscount: 200,
            categories: ['Avaliação Física', 'Reabilitação', 'Condicionamento'],
            validDays: [1, 2, 3, 4, 5], // Segunda a sexta
            validHours: { start: '06:00', end: '22:00' }
          },
          stats: {
            totalVouchers: 250,
            usedVouchers: 187,
            totalRevenue: 28750.50,
            avgTicket: 153.75,
            conversionRate: 74.8,
            activeCustomers: 45
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Unimed São Paulo',
          type: 'health_plan',
          description: 'Convênio médico com cobertura para fisioterapia',
          contact: {
            responsibleName: 'Ana Costa',
            email: 'credenciamento@unimed.com.br',
            phone: '(11) 3333-4444',
            address: 'Rua Augusta, 2000 - São Paulo, SP',
            website: 'https://unimed.com.br'
          },
          contract: {
            startDate: '2024-01-15',
            endDate: '2025-01-15',
            status: 'active',
            commission: 8,
            exclusivity: true
          },
          benefits: {
            discountPercentage: 0, // Convênio não tem desconto, mas reembolso
            maxDiscount: 0,
            categories: ['Fisioterapia', 'RPG', 'Pilates Terapêutico'],
            validDays: [1, 2, 3, 4, 5, 6],
            validHours: { start: '07:00', end: '18:00' }
          },
          stats: {
            totalVouchers: 120,
            usedVouchers: 95,
            totalRevenue: 45600.00,
            avgTicket: 480.00,
            conversionRate: 79.2,
            activeCustomers: 28
          },
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T14:22:00Z'
        },
        {
          id: '3',
          name: 'EmpresaCorp',
          type: 'corporate',
          description: 'Empresa de tecnologia com programa de bem-estar corporativo',
          contact: {
            responsibleName: 'Roberto Santos',
            email: 'rh@empresacorp.com',
            phone: '(11) 5555-6666',
            address: 'Rua do Comércio, 500 - São Paulo, SP',
            website: 'https://empresacorp.com'
          },
          contract: {
            startDate: '2024-02-01',
            endDate: '2024-07-31',
            status: 'pending',
            commission: 12,
            exclusivity: false
          },
          benefits: {
            discountPercentage: 25,
            maxDiscount: 150,
            categories: ['Quick Massage', 'Ergonomia', 'Fisioterapia'],
            validDays: [1, 2, 3, 4, 5],
            validHours: { start: '12:00', end: '14:00' }
          },
          stats: {
            totalVouchers: 50,
            usedVouchers: 12,
            totalRevenue: 1800.00,
            avgTicket: 150.00,
            conversionRate: 24.0,
            activeCustomers: 8
          },
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-10T16:45:00Z'
        },
        {
          id: '4',
          name: 'Farmácia São João',
          type: 'pharmacy',
          description: 'Rede de farmácias com produtos de reabilitação',
          contact: {
            responsibleName: 'Maria Oliveira',
            email: 'compras@farmaciajoao.com.br',
            phone: '(11) 2222-3333',
            address: 'Av. São João, 800 - São Paulo, SP'
          },
          contract: {
            startDate: '2024-01-10',
            endDate: '2024-06-10',
            status: 'expired',
            commission: 5,
            exclusivity: false
          },
          benefits: {
            discountPercentage: 10,
            maxDiscount: 50,
            categories: ['Produtos Ortopédicos', 'Suplementos'],
            validDays: [1, 2, 3, 4, 5, 6],
            validHours: { start: '08:00', end: '20:00' }
          },
          stats: {
            totalVouchers: 80,
            usedVouchers: 65,
            totalRevenue: 3250.00,
            avgTicket: 50.00,
            conversionRate: 81.3,
            activeCustomers: 22
          },
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-25T09:15:00Z'
        }
      ];

      const mockVoucherTemplates: VoucherTemplate[] = [
        {
          id: '1',
          partnerId: '1',
          name: 'Desconto Academia FitLife',
          description: '20% de desconto na primeira avaliação física',
          discountType: 'percentage',
          discountValue: 20,
          maxUsage: 100,
          usageCount: 67,
          validFrom: '2024-01-01',
          validTo: '2024-12-31',
          conditions: [
            'Válido apenas para novos clientes',
            'Não cumulativo com outras promoções',
            'Agendamento obrigatório'
          ],
          isActive: true,
          generatedCount: 250
        },
        {
          id: '2',
          partnerId: '2',
          name: 'Reembolso Unimed',
          description: 'Reembolso integral para sessões de fisioterapia',
          discountType: 'percentage',
          discountValue: 100,
          maxUsage: 500,
          usageCount: 95,
          validFrom: '2024-01-15',
          validTo: '2025-01-15',
          conditions: [
            'Apresentar carteira do convênio',
            'Máximo 12 sessões por mês',
            'Autorização prévia necessária'
          ],
          isActive: true,
          generatedCount: 120
        }
      ];

      setPartners(mockPartners);
      setVoucherTemplates(mockVoucherTemplates);

    } catch (error) {
      console.error('Erro ao carregar parcerias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'corporate': return 'bg-blue-100 text-blue-800';
      case 'health_plan': return 'bg-purple-100 text-purple-800';
      case 'gym': return 'bg-green-100 text-green-800';
      case 'pharmacy': return 'bg-red-100 text-red-800';
      case 'clinic': return 'bg-indigo-100 text-indigo-800';
      case 'individual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'corporate': return Building;
      case 'health_plan': return Trophy;
      case 'gym': return Activity;
      case 'pharmacy': return Plus;
      case 'clinic': return Building;
      case 'individual': return Users;
      default: return Building;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || partner.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalStats = partners.reduce(
    (acc, partner) => ({
      totalVouchers: acc.totalVouchers + partner.stats.totalVouchers,
      usedVouchers: acc.usedVouchers + partner.stats.usedVouchers,
      totalRevenue: acc.totalRevenue + partner.stats.totalRevenue,
      activeCustomers: acc.activeCustomers + partner.stats.activeCustomers
    }),
    { totalVouchers: 0, usedVouchers: 0, totalRevenue: 0, activeCustomers: 0 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
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
            <Handshake className="h-6 w-6 mr-2 text-blue-600" />
            Gestão de Parcerias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas parcerias estratégicas e sistemas de vouchers
          </p>
        </div>

        <Button onClick={() => setShowPartnerForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Parceria
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedContainer animation="scale-in" delay={0}>
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Parceiros Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partners.filter(p => p.contract.status === 'active').length}
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
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Vouchers Usados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalStats.usedVouchers}
                  </p>
                  <p className="text-xs text-gray-500">
                    de {totalStats.totalVouchers} gerados
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
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalStats.totalRevenue)}
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
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalStats.activeCustomers}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar parceiros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">Todos os Tipos</option>
            <option value="corporate">Empresarial</option>
            <option value="health_plan">Convênio</option>
            <option value="gym">Academia</option>
            <option value="pharmacy">Farmácia</option>
            <option value="clinic">Clínica</option>
            <option value="individual">Individual</option>
          </select>
        </div>
      </Card>

      {/* Lista de Parceiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPartners.map((partner, index) => {
          const TypeIcon = getTypeIcon(partner.type);
          const conversionRate = partner.stats.totalVouchers > 0 
            ? (partner.stats.usedVouchers / partner.stats.totalVouchers) * 100 
            : 0;
          
          return (
            <AnimatedContainer key={partner.id} animation="scale-in" delay={index * 100}>
              <Card hover className="group cursor-pointer" onClick={() => setSelectedPartner(partner)}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TypeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {partner.name}
                        </h3>
                        <Badge className={getTypeColor(partner.type)}>
                          {partner.type === 'corporate' ? 'Empresarial' :
                           partner.type === 'health_plan' ? 'Convênio' :
                           partner.type === 'gym' ? 'Academia' :
                           partner.type === 'pharmacy' ? 'Farmácia' :
                           partner.type === 'clinic' ? 'Clínica' : 'Individual'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(partner.contract.status)}>
                      {partner.contract.status === 'active' ? 'Ativo' :
                       partner.contract.status === 'pending' ? 'Pendente' :
                       partner.contract.status === 'expired' ? 'Expirado' :
                       partner.contract.status === 'suspended' ? 'Suspenso' : 'Cancelado'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {partner.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Comissão:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partner.contract.commission}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Desconto:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partner.benefits.discountPercentage}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Vouchers:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {partner.stats.usedVouchers}/{partner.stats.totalVouchers}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Conversão:</span>
                      <span className="font-medium text-green-600">
                        {conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Receita:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(partner.stats.totalRevenue)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Contrato até: {new Date(partner.contract.endDate).toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          );
        })}
      </div>

      {/* Modal de Detalhes do Parceiro */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {React.createElement(getTypeIcon(selectedPartner.type), {
                      className: "h-8 w-8 text-white"
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {selectedPartner.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPartner.description}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedPartner(null)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações de Contato */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Informações de Contato
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedPartner.contact.responsibleName}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedPartner.contact.email}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedPartner.contact.phone}
                        </span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedPartner.contact.address}
                        </span>
                      </div>
                      
                      {selectedPartner.contact.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a 
                            href={selectedPartner.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Website
                            <ExternalLink className="h-3 w-3 ml-1 inline" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Estatísticas */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Performance
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Conversão de Vouchers
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {((selectedPartner.stats.usedVouchers / selectedPartner.stats.totalVouchers) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((selectedPartner.stats.usedVouchers / selectedPartner.stats.totalVouchers) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedPartner.stats.totalVouchers}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Total Vouchers
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedPartner.stats.usedVouchers}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Utilizados
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(selectedPartner.stats.avgTicket)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Ticket Médio
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Benefícios */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Benefícios Oferecidos
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedPartner.benefits.discountPercentage}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Desconto
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Categorias Incluídas:
                        </h4>
                        <div className="space-y-1">
                          {selectedPartner.benefits.categories.map((category, index) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                              {category}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Horário de Funcionamento:
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedPartner.benefits.validHours.start} às {selectedPartner.benefits.validHours.end}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-3">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Parceria
                  </Button>
                  <Button>
                    <Gift className="h-4 w-4 mr-2" />
                    Gerar Vouchers
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