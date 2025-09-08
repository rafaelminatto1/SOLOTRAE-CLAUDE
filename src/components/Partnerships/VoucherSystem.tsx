import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Gift,
  Ticket,
  QrCode,
  Download,
  Share,
  Copy,
  Check,
  X,
  Calendar,
  Clock,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Percent,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Smartphone,
  Printer,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  partnerId: string;
  partnerName: string;
  templateId: string;
  templateName: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  originalPrice: number;
  finalPrice: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  generatedDate: string;
  expirationDate: string;
  usedDate?: string;
  usedBy?: string;
  patientName?: string;
  patientEmail?: string;
  conditions: string[];
  qrCode: string;
}

interface VoucherTemplate {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  validityDays: number;
  maxUsage: number;
  currentUsage: number;
  isActive: boolean;
  partnerId: string;
  partnerName: string;
  categories: string[];
  conditions: string[];
  createdAt: string;
}

interface VoucherStats {
  totalGenerated: number;
  totalUsed: number;
  totalExpired: number;
  totalRevenue: number;
  avgDiscount: number;
  conversionRate: number;
  topPartner: string;
  topCategory: string;
}

export default function VoucherSystem() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [templates, setTemplates] = useState<VoucherTemplate[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vouchers' | 'templates' | 'generator' | 'analytics'>('vouchers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string>('');

  // Dados do gerador de vouchers
  const [generatorForm, setGeneratorForm] = useState({
    templateId: '',
    quantity: 1,
    customDiscount: 0,
    expirationDays: 30,
    targetAudience: 'all',
    personalizedMessage: ''
  });

  useEffect(() => {
    loadVouchersData();
  }, []);

  const loadVouchersData = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockVouchers: Voucher[] = [
        {
          id: '1',
          code: 'FITLIFE20-ABC123',
          partnerId: '1',
          partnerName: 'FitLife Academia',
          templateId: '1',
          templateName: 'Desconto Academia FitLife',
          discountType: 'percentage',
          discountValue: 20,
          originalPrice: 200.00,
          finalPrice: 160.00,
          status: 'used',
          generatedDate: '2024-01-10T10:00:00Z',
          expirationDate: '2024-03-10T23:59:59Z',
          usedDate: '2024-01-15T14:30:00Z',
          usedBy: 'patient-1',
          patientName: 'João Silva',
          patientEmail: 'joao.silva@email.com',
          conditions: [
            'Válido apenas para novos clientes',
            'Não cumulativo com outras promoções',
            'Apresentar voucher no atendimento'
          ],
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FITLIFE20-ABC123'
        },
        {
          id: '2',
          code: 'UNIMED-DEF456',
          partnerId: '2',
          partnerName: 'Unimed São Paulo',
          templateId: '2',
          templateName: 'Reembolso Unimed',
          discountType: 'percentage',
          discountValue: 100,
          originalPrice: 150.00,
          finalPrice: 0.00,
          status: 'active',
          generatedDate: '2024-01-12T09:15:00Z',
          expirationDate: '2024-07-12T23:59:59Z',
          patientName: 'Maria Santos',
          patientEmail: 'maria.santos@email.com',
          conditions: [
            'Apresentar carteira do convênio',
            'Máximo 12 sessões por mês',
            'Autorização prévia necessária'
          ],
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UNIMED-DEF456'
        },
        {
          id: '3',
          code: 'CORP25-GHI789',
          partnerId: '3',
          partnerName: 'EmpresaCorp',
          templateId: '3',
          templateName: 'Desconto Corporativo',
          discountType: 'percentage',
          discountValue: 25,
          originalPrice: 120.00,
          finalPrice: 90.00,
          status: 'expired',
          generatedDate: '2024-01-05T16:20:00Z',
          expirationDate: '2024-01-20T23:59:59Z',
          patientName: 'Pedro Oliveira',
          patientEmail: 'pedro.oliveira@email.com',
          conditions: [
            'Válido apenas em horário comercial',
            'Funcionários da EmpresaCorp',
            'Agendar com antecedência'
          ],
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CORP25-GHI789'
        },
        {
          id: '4',
          code: 'PROMO15-JKL012',
          partnerId: '1',
          partnerName: 'FitLife Academia',
          templateId: '1',
          templateName: 'Desconto Academia FitLife',
          discountType: 'fixed',
          discountValue: 50.00,
          originalPrice: 180.00,
          finalPrice: 130.00,
          status: 'active',
          generatedDate: '2024-01-14T11:45:00Z',
          expirationDate: '2024-02-14T23:59:59Z',
          patientName: 'Ana Costa',
          patientEmail: 'ana.costa@email.com',
          conditions: [
            'Válido para qualquer serviço',
            'Não cumulativo',
            'Uma única utilização'
          ],
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMO15-JKL012'
        }
      ];

      const mockTemplates: VoucherTemplate[] = [
        {
          id: '1',
          name: 'Desconto Academia FitLife',
          description: 'Desconto especial para serviços da FitLife Academia',
          discountType: 'percentage',
          discountValue: 20,
          maxDiscount: 200,
          minPurchase: 100,
          validityDays: 60,
          maxUsage: 500,
          currentUsage: 127,
          isActive: true,
          partnerId: '1',
          partnerName: 'FitLife Academia',
          categories: ['Avaliação', 'Treinamento', 'Fisioterapia'],
          conditions: [
            'Válido apenas para novos clientes',
            'Não cumulativo com outras promoções',
            'Agendamento obrigatório'
          ],
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Reembolso Integral Unimed',
          description: 'Reembolso completo para beneficiários Unimed',
          discountType: 'percentage',
          discountValue: 100,
          validityDays: 180,
          maxUsage: 1000,
          currentUsage: 95,
          isActive: true,
          partnerId: '2',
          partnerName: 'Unimed São Paulo',
          categories: ['Fisioterapia', 'RPG', 'Pilates Terapêutico'],
          conditions: [
            'Apresentar carteira do convênio',
            'Máximo 12 sessões por mês',
            'Autorização prévia obrigatória'
          ],
          createdAt: '2024-01-15T00:00:00Z'
        },
        {
          id: '3',
          name: 'Bem-estar Corporativo',
          description: 'Desconto para funcionários de empresas parceiras',
          discountType: 'percentage',
          discountValue: 25,
          maxDiscount: 150,
          validityDays: 30,
          maxUsage: 200,
          currentUsage: 23,
          isActive: true,
          partnerId: '3',
          partnerName: 'EmpresaCorp',
          categories: ['Quick Massage', 'Ergonomia', 'Fisioterapia'],
          conditions: [
            'Válido apenas em horário comercial',
            'Comprovar vínculo empregatício',
            'Agendamento antecipado'
          ],
          createdAt: '2024-02-01T00:00:00Z'
        }
      ];

      const mockStats: VoucherStats = {
        totalGenerated: mockVouchers.length + 346,
        totalUsed: mockVouchers.filter(v => v.status === 'used').length + 198,
        totalExpired: mockVouchers.filter(v => v.status === 'expired').length + 47,
        totalRevenue: 47850.50,
        avgDiscount: 18.5,
        conversionRate: 67.8,
        topPartner: 'FitLife Academia',
        topCategory: 'Fisioterapia'
      };

      setVouchers(mockVouchers);
      setTemplates(mockTemplates);
      setStats(mockStats);

    } catch (error) {
      console.error('Erro ao carregar vouchers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'used': return Check;
      case 'expired': return AlertCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const copyVoucherCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  const generateVouchers = async () => {
    try {
      // Simular geração de vouchers
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedTemplate = templates.find(t => t.id === generatorForm.templateId);
      if (!selectedTemplate) return;

      const newVouchers: Voucher[] = [];
      
      for (let i = 0; i < generatorForm.quantity; i++) {
        const voucherCode = `${selectedTemplate.partnerName.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        newVouchers.push({
          id: Date.now().toString() + i,
          code: voucherCode,
          partnerId: selectedTemplate.partnerId,
          partnerName: selectedTemplate.partnerName,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          discountType: selectedTemplate.discountType,
          discountValue: generatorForm.customDiscount || selectedTemplate.discountValue,
          originalPrice: 150.00, // Valor base simulado
          finalPrice: 150.00 * (1 - (generatorForm.customDiscount || selectedTemplate.discountValue) / 100),
          status: 'active',
          generatedDate: new Date().toISOString(),
          expirationDate: new Date(Date.now() + generatorForm.expirationDays * 24 * 60 * 60 * 1000).toISOString(),
          conditions: selectedTemplate.conditions,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${voucherCode}`
        });
      }

      setVouchers(prev => [...newVouchers, ...prev]);
      setShowGenerator(false);
      setGeneratorForm({
        templateId: '',
        quantity: 1,
        customDiscount: 0,
        expirationDays: 30,
        targetAudience: 'all',
        personalizedMessage: ''
      });

    } catch (error) {
      console.error('Erro ao gerar vouchers:', error);
    }
  };

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
            <Gift className="h-6 w-6 mr-2 text-green-600" />
            Sistema de Vouchers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crie, gerencie e monitore seus vouchers de desconto
          </p>
        </div>

        <Button onClick={() => setShowGenerator(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Gerar Vouchers
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedContainer animation="scale-in" delay={0}>
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Gerados</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalGenerated}
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
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Utilizados</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalUsed}
                    </p>
                    <p className="text-xs text-green-600">
                      {stats.conversionRate}% conversão
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
                      {formatCurrency(stats.totalRevenue)}
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
                    <Percent className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Desconto Médio</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.avgDiscount}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedContainer>
        </div>
      )}

      {/* Navegação */}
      <Card className="p-1">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'vouchers', label: 'Vouchers Ativos', icon: Ticket },
            { key: 'templates', label: 'Templates', icon: Star },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Conteúdo Principal */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por código, paciente ou parceiro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="used">Utilizados</option>
                <option value="expired">Expirados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </Card>

          {/* Lista de Vouchers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVouchers.map((voucher, index) => {
              const StatusIcon = getStatusIcon(voucher.status);
              const savings = voucher.originalPrice - voucher.finalPrice;
              
              return (
                <AnimatedContainer key={voucher.id} animation="scale-in" delay={index * 100}>
                  <Card hover className="group cursor-pointer" onClick={() => setSelectedVoucher(voucher)}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <Gift className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                              {voucher.code}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {voucher.partnerName}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(voucher.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {voucher.status === 'active' ? 'Ativo' :
                           voucher.status === 'used' ? 'Usado' :
                           voucher.status === 'expired' ? 'Expirado' : 'Cancelado'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Desconto:</span>
                          <span className="font-semibold text-green-600">
                            {voucher.discountType === 'percentage' 
                              ? `${voucher.discountValue}%` 
                              : formatCurrency(voucher.discountValue)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Economia:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(savings)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Expira em:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(voucher.expirationDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {voucher.patientName && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Paciente:</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {voucher.patientName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyVoucherCode(voucher.code);
                          }}
                        >
                          {copiedCode === voucher.code ? (
                            <>
                              <Check className="h-4 w-4 mr-1 text-green-600" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </AnimatedContainer>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template, index) => {
            const usagePercentage = (template.currentUsage / template.maxUsage) * 100;
            
            return (
              <AnimatedContainer key={template.id} animation="slide-up" delay={index * 100}>
                <Card hover>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.partnerName}
                        </p>
                      </div>
                      
                      <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {template.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {template.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Desconto:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.discountType === 'percentage' 
                            ? `${template.discountValue}%` 
                            : formatCurrency(template.discountValue)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Validade:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.validityDays} dias
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Uso:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.currentUsage}/{template.maxUsage}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Ticket className="h-4 w-4 mr-1" />
                        Gerar
                      </Button>
                    </div>
                  </div>
                </Card>
              </AnimatedContainer>
            );
          })}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance por Parceiro
              </h3>
              
              {/* Placeholder para gráfico */}
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Gráfico de Performance</p>
                  <p className="text-sm text-gray-400">Por parceiro</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Taxa de Conversão Mensal
              </h3>
              
              {/* Placeholder para gráfico */}
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Gráfico de Conversão</p>
                  <p className="text-sm text-gray-400">Últimos 6 meses</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Gerador de Vouchers */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gerar Novos Vouchers
                </h2>
                <Button variant="ghost" onClick={() => setShowGenerator(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template de Voucher
                  </label>
                  <select
                    value={generatorForm.templateId}
                    onChange={(e) => setGeneratorForm(prev => ({ ...prev, templateId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecione um template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.partnerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantidade
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={generatorForm.quantity}
                      onChange={(e) => setGeneratorForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Validade (dias)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={generatorForm.expirationDays}
                      onChange={(e) => setGeneratorForm(prev => ({ ...prev, expirationDays: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Desconto Personalizado (%) - Opcional
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={generatorForm.customDiscount}
                    onChange={(e) => setGeneratorForm(prev => ({ ...prev, customDiscount: Number(e.target.value) }))}
                    placeholder="Deixe 0 para usar o padrão do template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Público Alvo
                  </label>
                  <select
                    value={generatorForm.targetAudience}
                    onChange={(e) => setGeneratorForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">Todos os clientes</option>
                    <option value="new">Novos clientes</option>
                    <option value="returning">Clientes existentes</option>
                    <option value="vip">Clientes VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem Personalizada (Opcional)
                  </label>
                  <Textarea
                    value={generatorForm.personalizedMessage}
                    onChange={(e) => setGeneratorForm(prev => ({ ...prev, personalizedMessage: e.target.value }))}
                    placeholder="Mensagem especial para este voucher..."
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Resumo da Geração
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        <li>• {generatorForm.quantity} voucher(s) serão criados</li>
                        <li>• Válidos por {generatorForm.expirationDays} dias</li>
                        <li>• Códigos únicos gerados automaticamente</li>
                        <li>• QR Codes incluídos para facilitar o uso</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowGenerator(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={generateVouchers}
                    disabled={!generatorForm.templateId}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Gerar Vouchers
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Detalhes do Voucher */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Voucher de Desconto
                </h2>
                
                <p className="font-mono text-lg font-bold text-blue-600">
                  {selectedVoucher.code}
                </p>
                
                <Badge className={getStatusColor(selectedVoucher.status)} size="lg">
                  {selectedVoucher.status === 'active' ? 'ATIVO' :
                   selectedVoucher.status === 'used' ? 'UTILIZADO' :
                   selectedVoucher.status === 'expired' ? 'EXPIRADO' : 'CANCELADO'}
                </Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedVoucher.discountType === 'percentage' 
                      ? `${selectedVoucher.discountValue}% OFF` 
                      : `${formatCurrency(selectedVoucher.discountValue)} OFF`}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Economia: {formatCurrency(selectedVoucher.originalPrice - selectedVoucher.finalPrice)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Parceiro:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedVoucher.partnerName}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Válido até:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedVoucher.expirationDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {selectedVoucher.patientName && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reservado para:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedVoucher.patientName}
                    </p>
                  </div>
                )}

                {selectedVoucher.conditions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condições de Uso:
                    </h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {selectedVoucher.conditions.map((condition, index) => (
                        <li key={index}>• {condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center">
                  <img 
                    src={selectedVoucher.qrCode} 
                    alt="QR Code" 
                    className="mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Escaneie o QR Code para usar
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Enviar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedVoucher(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}