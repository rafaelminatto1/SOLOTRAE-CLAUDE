import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';
import {
  Receipt,
  Plus,
  Edit,
  Trash2,
  Send,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Printer,
  Share,
  CreditCard,
  Building,
  RefreshCw,
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
  paymentDate?: string;
  createdBy: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  serviceType: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceFormData {
  patientId: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  tax: number;
  notes: string;
}

export default function InvoiceManager() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<InvoiceFormData>({
    patientId: '',
    dueDate: '',
    items: [],
    discount: 0,
    tax: 0,
    notes: ''
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    
    try {
      // Simular carregamento - integrar com API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          number: 'INV-2024-001',
          patientId: 'patient-1',
          patientName: 'João Silva',
          patientEmail: 'joao.silva@email.com',
          patientPhone: '(11) 99999-9999',
          patientAddress: 'Rua das Flores, 123 - São Paulo, SP',
          issueDate: '2024-01-15',
          dueDate: '2024-01-30',
          status: 'sent',
          items: [
            {
              id: '1',
              description: 'Consulta de Fisioterapia',
              serviceType: 'Consulta Individual',
              quantity: 1,
              unitPrice: 150.00,
              total: 150.00
            },
            {
              id: '2',
              description: 'Sessão de RPG',
              serviceType: 'RPG',
              quantity: 2,
              unitPrice: 120.00,
              total: 240.00
            }
          ],
          subtotal: 390.00,
          discount: 30.00,
          tax: 0.00,
          total: 360.00,
          notes: 'Desconto de 8% para pagamento à vista.',
          createdBy: user?.id || 'user-1'
        },
        {
          id: '2',
          number: 'INV-2024-002',
          patientId: 'patient-2',
          patientName: 'Maria Santos',
          patientEmail: 'maria.santos@email.com',
          patientPhone: '(11) 88888-8888',
          patientAddress: 'Av. Paulista, 456 - São Paulo, SP',
          issueDate: '2024-01-16',
          dueDate: '2024-02-15',
          status: 'paid',
          items: [
            {
              id: '1',
              description: 'Pacote 10 Sessões de Fisioterapia',
              serviceType: 'Pacote de Sessões',
              quantity: 1,
              unitPrice: 1200.00,
              total: 1200.00
            }
          ],
          subtotal: 1200.00,
          discount: 120.00,
          tax: 0.00,
          total: 1080.00,
          notes: 'Pagamento via PIX - 10% desconto',
          paymentMethod: 'PIX',
          paymentDate: '2024-01-17',
          createdBy: user?.id || 'user-1'
        },
        {
          id: '3',
          number: 'INV-2024-003',
          patientId: 'patient-3',
          patientName: 'Pedro Oliveira',
          patientEmail: 'pedro.oliveira@email.com',
          patientPhone: '(11) 77777-7777',
          patientAddress: 'Rua Augusta, 789 - São Paulo, SP',
          issueDate: '2024-01-10',
          dueDate: '2024-01-25',
          status: 'overdue',
          items: [
            {
              id: '1',
              description: 'Avaliação Postural Completa',
              serviceType: 'Avaliação',
              quantity: 1,
              unitPrice: 200.00,
              total: 200.00
            }
          ],
          subtotal: 200.00,
          discount: 0.00,
          tax: 0.00,
          total: 200.00,
          createdBy: user?.id || 'user-1'
        }
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-indigo-100 text-indigo-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviada';
      case 'viewed': return 'Visualizada';
      case 'overdue': return 'Em Atraso';
      case 'paid': return 'Paga';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText;
      case 'sent': return Send;
      case 'viewed': return Eye;
      case 'overdue': return AlertCircle;
      case 'paid': return CheckCircle;
      case 'cancelled': return RefreshCw;
      default: return FileText;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      serviceType: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeInvoiceItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateInvoiceItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - formData.discount + formData.tax;
    return { subtotal, total };
  };

  const handleSaveInvoice = async () => {
    try {
      const { subtotal, total } = calculateTotals();
      
      const newInvoice: Invoice = {
        id: editingInvoice?.id || Date.now().toString(),
        number: editingInvoice?.number || `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        patientId: formData.patientId,
        patientName: 'João Silva', // Buscar do cadastro
        patientEmail: 'joao@email.com',
        patientPhone: '(11) 99999-9999',
        patientAddress: 'Endereço do paciente',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate,
        status: 'draft',
        items: formData.items,
        subtotal,
        discount: formData.discount,
        tax: formData.tax,
        total,
        notes: formData.notes,
        createdBy: user?.id || 'user-1'
      };

      if (editingInvoice) {
        setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? newInvoice : inv));
      } else {
        setInvoices(prev => [...prev, newInvoice]);
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      dueDate: '',
      items: [],
      discount: 0,
      tax: 0,
      notes: ''
    });
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'sent' as const } : inv
      ));
    } catch (error) {
      console.error('Erro ao enviar fatura:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Receipt className="h-6 w-6 mr-2 text-blue-600" />
            Gestão de Faturas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crie, envie e gerencie suas faturas
          </p>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Fatura
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por paciente ou número da fatura..."
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
            <option value="draft">Rascunho</option>
            <option value="sent">Enviadas</option>
            <option value="viewed">Visualizadas</option>
            <option value="overdue">Em Atraso</option>
            <option value="paid">Pagas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </Card>

      {/* Lista de Faturas */}
      {!showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice, index) => {
            const StatusIcon = getStatusIcon(invoice.status);
            
            return (
              <AnimatedContainer key={invoice.id} animation="scale-in" delay={index * 100}>
                <Card hover className="group cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {invoice.number}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invoice.patientName}
                        </p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Emissão:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(invoice.issueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Vencimento:</span>
                        <span className={`font-medium ${
                          invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        
                        {invoice.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendInvoice(invoice.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedContainer>
            );
          })}
        </div>
      ) : (
        /* Formulário de Nova Fatura */
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingInvoice ? 'Editar Fatura' : 'Nova Fatura'}
              </h2>
              <Button variant="ghost" onClick={resetForm}>
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paciente
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecione um paciente</option>
                    <option value="patient-1">João Silva</option>
                    <option value="patient-2">Maria Santos</option>
                    <option value="patient-3">Pedro Oliveira</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Vencimento
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Itens da Fatura */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Itens da Fatura
                  </h3>
                  <Button onClick={addInvoiceItem} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Descrição do serviço"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(item.id, { description: e.target.value })}
                        />
                      </div>
                      <div>
                        <select
                          value={item.serviceType}
                          onChange={(e) => updateInvoiceItem(item.id, { serviceType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                        >
                          <option value="">Tipo</option>
                          <option value="Consulta Individual">Consulta</option>
                          <option value="Pacote de Sessões">Pacote</option>
                          <option value="RPG">RPG</option>
                          <option value="Avaliação">Avaliação</option>
                        </select>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(item.id, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Valor unitário"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(item.id, { unitPrice: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.total)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvoiceItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              {formData.items.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Desconto (R$)
                      </label>
                      <Input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Impostos (R$)
                      </label>
                      <Input
                        type="number"
                        value={formData.tax}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total
                      </label>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(calculateTotals().total)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <Textarea
                  placeholder="Observações adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Ações */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveInvoice} disabled={formData.items.length === 0}>
                  {editingInvoice ? 'Atualizar' : 'Criar'} Fatura
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}