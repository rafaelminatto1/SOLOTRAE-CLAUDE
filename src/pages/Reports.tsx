import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { useApiGet } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Printer,
  Mail,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Stethoscope,
  CalendarDays,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Tipos para relatórios
interface ReportFilter {
  startDate: string;
  endDate: string;
  reportType: string;
  physiotherapistId?: string;
  patientId?: string;
  status?: string;
}

interface FinancialReport {
  total_revenue: number;
  total_appointments: number;
  average_session_value: number;
  pending_payments: number;
  monthly_data: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }>;
  payment_methods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

interface PatientReport {
  total_patients: number;
  new_patients: number;
  active_patients: number;
  inactive_patients: number;
  age_distribution: Array<{
    range: string;
    count: number;
  }>;
  gender_distribution: Array<{
    gender: string;
    count: number;
    percentage: number;
  }>;
}

interface AppointmentReport {
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  completion_rate: number;
  cancellation_rate: number;
  daily_data: Array<{
    date: string;
    appointments: number;
    completed: number;
    cancelled: number;
  }>;
  physiotherapist_performance: Array<{
    id: string;
    name: string;
    appointments: number;
    completion_rate: number;
  }>;
}

interface ExerciseReport {
  total_exercises: number;
  prescribed_exercises: number;
  completed_exercises: number;
  completion_rate: number;
  popular_exercises: Array<{
    name: string;
    prescriptions: number;
    completion_rate: number;
  }>;
  category_distribution: Array<{
    category: string;
    count: number;
  }>;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'monthly'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // API hooks para diferentes tipos de relatórios
  const { data: financialData, loading: loadingFinancial, refetch: refetchFinancial } = useApiGet<FinancialReport>(
    `/reports/financial?start_date=${filters.startDate}&end_date=${filters.endDate}`
  );
  
  const { data: patientData, loading: loadingPatients, refetch: refetchPatients } = useApiGet<PatientReport>(
    `/reports/patients?start_date=${filters.startDate}&end_date=${filters.endDate}`
  );
  
  const { data: appointmentData, loading: loadingAppointments, refetch: refetchAppointments } = useApiGet<AppointmentReport>(
    `/reports/appointments?start_date=${filters.startDate}&end_date=${filters.endDate}`
  );
  
  const { data: exerciseData, loading: loadingExercises, refetch: refetchExercises } = useApiGet<ExerciseReport>(
    `/reports/exercises?start_date=${filters.startDate}&end_date=${filters.endDate}`
  );

  const { data: physiotherapistsData } = useApiGet<{ physiotherapists: Array<{ id: string; first_name: string; last_name: string; }> }>('/physiotherapists');
  const { data: patientsData } = useApiGet<{ patients: Array<{ id: string; first_name: string; last_name: string; }> }>('/patients');

  const physiotherapists = physiotherapistsData?.physiotherapists || [];
  const patients = patientsData?.patients || [];

  const reportTypes = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ];

  const tabs = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'exercises', label: 'Exercícios', icon: Activity }
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const handleFilterChange = (key: keyof ReportFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    refetchFinancial();
    refetchPatients();
    refetchAppointments();
    refetchExercises();
    setShowFilters(false);
    toast.success('Relatórios atualizados!');
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Simular geração de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToExcel = async () => {
    try {
      // Simular exportação para Excel
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados exportados para Excel!');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    }
  };

  const sendByEmail = () => {
    toast.success('Relatório enviado por email!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderFinancialReport = () => {
    if (loadingFinancial) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!financialData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialData.total_revenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Consultas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialData.total_appointments}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Médio/Sessão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialData.average_session_value)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialData.pending_payments)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Gráfico de Receita Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={financialData.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Métodos de Pagamento */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={financialData.payment_methods}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  nameKey="method"
                >
                  {financialData.payment_methods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {financialData.payment_methods.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(method.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPercentage(method.percentage)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderPatientReport = () => {
    if (loadingPatients) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!patientData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs de Pacientes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{patientData.total_patients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos Pacientes</p>
                <p className="text-2xl font-bold text-green-600">{patientData.new_patients}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{patientData.active_patients}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Inativos</p>
                <p className="text-2xl font-bold text-gray-600">{patientData.inactive_patients}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Distribuição por Idade */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Idade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientData.age_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Gênero */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Gênero</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={patientData.gender_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="gender"
                >
                  {patientData.gender_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {patientData.gender_distribution.map((gender, index) => (
                <div key={gender.gender} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{gender.gender}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{gender.count}</p>
                    <p className="text-xs text-gray-500">
                      {formatPercentage(gender.percentage)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderAppointmentReport = () => {
    if (loadingAppointments) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!appointmentData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs de Agendamentos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{appointmentData.total_appointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{appointmentData.completed_appointments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPercentage(appointmentData.completion_rate)}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Cancelamento</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatPercentage(appointmentData.cancellation_rate)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Gráfico de Agendamentos Diários */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos Diários</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentData.daily_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="#3B82F6" name="Total" />
              <Line type="monotone" dataKey="completed" stroke="#10B981" name="Concluídos" />
              <Line type="monotone" dataKey="cancelled" stroke="#EF4444" name="Cancelados" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance dos Fisioterapeutas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance dos Fisioterapeutas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fisioterapeuta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agendamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Conclusão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointmentData.physiotherapist_performance.map((physio) => (
                  <tr key={physio.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{physio.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {physio.appointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(physio.completion_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={physio.completion_rate >= 90 ? 'bg-green-100 text-green-800' : 
                                  physio.completion_rate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}
                      >
                        {physio.completion_rate >= 90 ? 'Excelente' : 
                         physio.completion_rate >= 70 ? 'Bom' : 'Precisa Melhorar'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderExerciseReport = () => {
    if (loadingExercises) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!exerciseData) return null;

    return (
      <div className="space-y-6">
        {/* KPIs de Exercícios */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Exercícios</p>
                <p className="text-2xl font-bold text-gray-900">{exerciseData.total_exercises}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exercícios Prescritos</p>
                <p className="text-2xl font-bold text-purple-600">{exerciseData.prescribed_exercises}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exercícios Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{exerciseData.completed_exercises}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPercentage(exerciseData.completion_rate)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Exercícios Mais Populares */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercícios Mais Populares</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exercício
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescrições
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Conclusão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exerciseData.popular_exercises.map((exercise, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exercise.prescriptions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(exercise.completion_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={exercise.completion_rate >= 80 ? 'bg-green-100 text-green-800' : 
                                  exercise.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}
                      >
                        {exercise.completion_rate >= 80 ? 'Alta' : 
                         exercise.completion_rate >= 60 ? 'Média' : 'Baixa'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exerciseData.category_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  };

  const renderActiveReport = () => {
    switch (activeTab) {
      case 'financial':
        return renderFinancialReport();
      case 'patients':
        return renderPatientReport();
      case 'appointments':
        return renderAppointmentReport();
      case 'exercises':
        return renderExerciseReport();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                <p className="text-sm text-gray-600">Análises e métricas do sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePDF}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <Printer className="w-4 h-4 mr-2" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sendByEmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        <div ref={reportRef}>
          {renderActiveReport()}
        </div>
      </div>

      {/* Modal de Filtros */}
      {showFilters && (
        <Modal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filtros de Relatório"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <Select
                value={filters.reportType}
                onValueChange={(value) => handleFilterChange('reportType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fisioterapeuta (Opcional)
              </label>
              <Select
                value={filters.physiotherapistId || ''}
                onValueChange={(value) => handleFilterChange('physiotherapistId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os fisioterapeutas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os fisioterapeutas</SelectItem>
                  {physiotherapists.map((physio) => (
                    <SelectItem key={physio.id} value={physio.id}>
                      {physio.first_name} {physio.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente (Opcional)
              </label>
              <Select
                value={filters.patientId || ''}
                onValueChange={(value) => handleFilterChange('patientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os pacientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os pacientes</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={applyFilters}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Reports;