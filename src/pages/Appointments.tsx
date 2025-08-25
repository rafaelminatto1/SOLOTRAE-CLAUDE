import React, { useState } from 'react';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/hooks/useApi';
import { formatDate, formatTime } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { 
  Appointment, 
  Patient, 
  Physiotherapist, 
  AppointmentStatus, 
  AppointmentType 
} from '@shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  PlayCircle,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  Stethoscope,
  FileText,
  Timer,
  UserCheck,
  CalendarPlus,
  List,
  Grid3X3,
  RefreshCw
} from 'lucide-react';

// Interfaces locais para dados específicos da página

interface AppointmentFormData {
  patient_id: string;
  physiotherapist_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  price: string;
  payment_method: 'cash' | 'card' | 'pix' | 'insurance';
}

const Appointments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [medicoFilter, setMedicoFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: '',
    physiotherapist_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    appointment_type: AppointmentType.CONSULTATION,
    status: AppointmentStatus.SCHEDULED,
    notes: '',
    price: '',
    payment_method: 'cash'
  });

  // API calls
  const { data: appointmentsData, loading, refetch } = useApiGet<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/appointments?search=${searchQuery}&status=${statusFilter}&tipo=${tipoFilter}&medico=${medicoFilter}&date=${dateFilter}&page=${currentPage}&limit=${pageSize}`);

  const { data: patientsData } = useApiGet<{ patients: Patient[] }>('/patients?limit=1000');
  const { data: physiotherapistsData } = useApiGet<{ physiotherapists: Physiotherapist[] }>('/physiotherapists?limit=1000');

  const { mutate: createAppointment, loading: creating } = useApiPost('/appointments');
  const { mutate: updateAppointment, loading: updating } = useApiPut(`/appointments/${editingAppointment?.id}`);
  const { mutate: deleteAppointment, loading: deleting } = useApiDelete(`/appointments/${appointmentToDelete?.id}`);

  const appointments = appointmentsData?.appointments || [];
  const totalAppointments = appointmentsData?.total || 0;
  const patients = patientsData?.patients || [];
  const physiotherapists = physiotherapistsData?.physiotherapists || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      [AppointmentStatus.SCHEDULED]: { variant: 'secondary' as const, label: 'Agendado', icon: CalendarIcon },
      [AppointmentStatus.CONFIRMED]: { variant: 'default' as const, label: 'Confirmado', icon: CalendarCheck },
      [AppointmentStatus.IN_PROGRESS]: { variant: 'default' as const, label: 'Em Andamento', icon: PlayCircle },
      [AppointmentStatus.COMPLETED]: { variant: 'default' as const, label: 'Concluído', icon: CheckCircle },
      [AppointmentStatus.CANCELLED]: { variant: 'destructive' as const, label: 'Cancelado', icon: CalendarX },
      [AppointmentStatus.NO_SHOW]: { variant: 'destructive' as const, label: 'Faltou', icon: XCircle },
      // Compatibilidade com valores antigos
      agendado: { variant: 'secondary' as const, label: 'Agendado', icon: CalendarIcon },
      confirmado: { variant: 'default' as const, label: 'Confirmado', icon: CalendarCheck },
      em_andamento: { variant: 'default' as const, label: 'Em Andamento', icon: PlayCircle },
      concluido: { variant: 'default' as const, label: 'Concluído', icon: CheckCircle },
      cancelado: { variant: 'destructive' as const, label: 'Cancelado', icon: CalendarX },
      faltou: { variant: 'destructive' as const, label: 'Faltou', icon: XCircle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.agendado;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      [AppointmentType.CONSULTATION]: 'Consulta',
      [AppointmentType.FOLLOW_UP]: 'Retorno',
      [AppointmentType.EVALUATION]: 'Avaliação',
      [AppointmentType.TREATMENT]: 'Tratamento',
      // Compatibilidade com valores antigos
      'consulta': 'Consulta',
      'retorno': 'Retorno',
      'exame': 'Exame',
      'procedimento': 'Procedimento'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels = {
      'cash': 'Dinheiro',
      'card': 'Cartão',
      'pix': 'PIX',
      'insurance': 'Convênio',
      // Compatibilidade com valores antigos
      'dinheiro': 'Dinheiro',
      'cartao': 'Cartão',
      'convenio': 'Convênio'
    };
    return labels[forma as keyof typeof labels] || forma;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTimeRange = (inicio: string, fim: string) => {
    return `${inicio} - ${fim}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id.toString(),
      physiotherapist_id: appointment.physiotherapist_id.toString(),
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      appointment_type: appointment.appointment_type as AppointmentType,
      status: appointment.status,
      notes: appointment.notes || '',
      price: appointment.price?.toString() || '',
      payment_method: (appointment.payment_method as 'cash' | 'card' | 'pix' | 'insurance') || 'cash'
    });
    setShowEditModal(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      physiotherapist_id: '',
      appointment_date: '',
      start_time: '',
      end_time: '',
      appointment_type: AppointmentType.CONSULTATION,
      status: AppointmentStatus.SCHEDULED,
      notes: '',
      price: '',
      payment_method: 'cash'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        patient_id: formData.patient_id,
        physiotherapist_id: formData.physiotherapist_id,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        appointment_type: formData.appointment_type,
        status: formData.status,
        notes: formData.notes || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        payment_method: formData.payment_method
      };

      if (editingAppointment) {
        await updateAppointment(appointmentData);
        setShowEditModal(false);
        setEditingAppointment(null);
      } else {
        await createAppointment(appointmentData);
        setShowAddModal(false);
      }
      
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const confirmDelete = async () => {
    if (appointmentToDelete) {
      await deleteAppointment();
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      refetch();
    }
  };

  const statusOptions = [
    { value: AppointmentStatus.SCHEDULED, label: 'Agendado' },
    { value: AppointmentStatus.CONFIRMED, label: 'Confirmado' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'Em Andamento' },
    { value: AppointmentStatus.COMPLETED, label: 'Concluído' },
    { value: AppointmentStatus.CANCELLED, label: 'Cancelado' },
    { value: AppointmentStatus.NO_SHOW, label: 'Faltou' }
  ];

  const tipoOptions = [
    { value: AppointmentType.CONSULTATION, label: 'Consulta' },
    { value: AppointmentType.FOLLOW_UP, label: 'Retorno' },
    { value: AppointmentType.EVALUATION, label: 'Avaliação' },
    { value: AppointmentType.TREATMENT, label: 'Tratamento' }
  ];

  const formaPagamentoOptions = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'card', label: 'Cartão' },
    { value: 'pix', label: 'PIX' },
    { value: 'insurance', label: 'Convênio' }
  ];

  const AppointmentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações do Agendamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Paciente *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="physiotherapist_id">Fisioterapeuta *</Label>
            <Select value={formData.physiotherapist_id} onValueChange={(value) => setFormData({ ...formData, physiotherapist_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o médico" />
              </SelectTrigger>
              <SelectContent>
                {physiotherapists.map(physiotherapist => (
                  <SelectItem key={physiotherapist.id} value={physiotherapist.id.toString()}>
                    {physiotherapist.first_name} {physiotherapist.last_name} - {physiotherapist.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Data *</Label>
            <Input
              id="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_type">Tipo de Consulta *</Label>
            <Select value={formData.appointment_type} onValueChange={(value) => setFormData({ ...formData, appointment_type: value as AppointmentType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tipoOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Hora de Início *</Label>
            <Select value={formData.start_time} onValueChange={(value) => setFormData({ ...formData, start_time: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">Hora de Término *</Label>
            <Select value={formData.end_time} onValueChange={(value) => setFormData({ ...formData, end_time: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Informações Financeiras */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Financeiras</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Valor da Consulta</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formaPagamentoOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Observações</h3>
        <div className="space-y-2">
          <Label htmlFor="notes">Observações Gerais</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Informações adicionais sobre o agendamento..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
              setEditingAppointment(null);
            } else {
              setShowAddModal(false);
            }
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={creating || updating}>
          {creating || updating ? 'Salvando...' : isEdit ? 'Atualizar' : 'Agendar'}
        </Button>
      </DialogFooter>
    </form>
  );

  const CalendarView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Simple calendar implementation - you can enhance this with a proper calendar library
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Visualização em Calendário
          </CardTitle>
          <CardDescription>
            Agendamentos do mês atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
            <p>Visualização em calendário será implementada em breve</p>
            <p className="text-sm">Por enquanto, use a visualização em lista</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos e consultas da clínica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{totalAppointments} agendamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>{appointments.filter(a => a.status === 'confirmed').length} confirmados</span>
            </div>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Preencha as informações do agendamento abaixo.
                </DialogDescription>
              </DialogHeader>
              <AppointmentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente, médico ou observações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-[150px]"
                  />
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {tipoOptions.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={medicoFilter} onValueChange={setMedicoFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Todos os fisioterapeutas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os fisioterapeutas</SelectItem>
                      {physiotherapists.map(physiotherapist => (
                        <SelectItem key={physiotherapist.id} value={physiotherapist.id.toString()}>
                          {physiotherapist.first_name} {physiotherapist.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agendamentos</CardTitle>
              <CardDescription>
                {totalAppointments} agendamento(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Nenhum agendamento encontrado
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'N/A')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim() || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Phone className="mr-1 h-3 w-3" />
                                  {appointment.patient?.phone || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center">
                                <Stethoscope className="mr-2 h-3 w-3" />
                                Dr. {`${appointment.physiotherapist?.first_name || ''} ${appointment.physiotherapist?.last_name || ''}`.trim() || 'N/A'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.physiotherapist?.specialization || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium flex items-center">
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {formatDate(appointment.appointment_date)}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="mr-2 h-3 w-3" />
                                {formatTimeRange(appointment.start_time, appointment.end_time)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTipoLabel(appointment.appointment_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {appointment.price ? (
                                <div>
                                  <div className="font-medium">{formatCurrency(appointment.price)}</div>
                                  <div className="text-muted-foreground">
                                    {getFormaPagamentoLabel(appointment.payment_method || 'cash')}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Não informado</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(appointment)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalAppointments > pageSize && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                    {Math.min(currentPage * pageSize, totalAppointments)} de {totalAppointments} agendamentos
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage * pageSize >= totalAppointments}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Appointment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do agendamento abaixo.
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(`${selectedAppointment.patient?.first_name || ''} ${selectedAppointment.patient?.last_name || ''}`.trim() || 'N/A')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{`${selectedAppointment.patient?.first_name || ''} ${selectedAppointment.patient?.last_name || ''}`.trim() || 'N/A'}</h3>
                  <p className="text-muted-foreground">
                    Dr. {`${selectedAppointment.physiotherapist?.first_name || ''} ${selectedAppointment.physiotherapist?.last_name || ''}`.trim() || 'N/A'} • {selectedAppointment.physiotherapist?.specialization || 'N/A'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(selectedAppointment.status)}
                    <Badge variant="outline">
                      {getTipoLabel(selectedAppointment.appointment_type)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações do Agendamento */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Informações do Agendamento
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data:</span>
                      <span className="ml-2">{formatDate(selectedAppointment.appointment_date)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horário:</span>
                      <span className="ml-2">{formatTimeRange(selectedAppointment.start_time, selectedAppointment.end_time)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="ml-2">{getTipoLabel(selectedAppointment.appointment_type)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2">{statusOptions.find(s => s.value === selectedAppointment.status)?.label}</span>
                    </div>
                  </div>
                </div>

                {/* Informações Financeiras */}
                {(selectedAppointment.price || selectedAppointment.payment_method) && (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Informações Financeiras
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedAppointment.price && (
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="ml-2 font-medium">{formatCurrency(selectedAppointment.price)}</span>
                        </div>
                      )}
                      {selectedAppointment.payment_method && (
                        <div>
                          <span className="text-muted-foreground">Forma de Pagamento:</span>
                          <span className="ml-2">{getFormaPagamentoLabel(selectedAppointment.payment_method)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contato do Paciente */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contato do Paciente
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <span className="ml-2">{selectedAppointment.patient?.phone || 'N/A'}</span>
                    </div>
                    {selectedAppointment.patient?.email && (
                      <div>
                        <span className="text-muted-foreground">E-mail:</span>
                        <span className="ml-2">{selectedAppointment.patient.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações do Médico */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Informações do Médico
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="ml-2">Dr. {`${selectedAppointment.physiotherapist?.first_name || ''} ${selectedAppointment.physiotherapist?.last_name || ''}`.trim() || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Especialidade:</span>
                      <span className="ml-2">{selectedAppointment.physiotherapist?.specialization || 'N/A'}</span>
                    </div>
                    {selectedAppointment.physiotherapist?.crefito && (
                      <div>
                        <span className="text-muted-foreground">CREFITO:</span>
                        <span className="ml-2">{selectedAppointment.physiotherapist.crefito}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              {selectedAppointment.notes && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Agendado em: {formatDate(selectedAppointment.created_at)}</span>
                  <span>Atualizado em: {formatDate(selectedAppointment.updated_at)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;