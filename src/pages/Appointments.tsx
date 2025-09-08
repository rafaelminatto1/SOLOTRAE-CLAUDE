import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/hooks/useApi';
import { formatDate, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
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
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

// Simple Badge component
const Badge: React.FC<{ children: React.ReactNode; className?: string; variant?: string }> = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700',
    secondary: 'bg-gray-200 text-gray-900',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

// Simple Avatar components
const Avatar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);
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
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw,
  Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Interfaces para o sistema de agendamento
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
  recurrence?: {
    type: 'none' | 'weekly' | 'biweekly' | 'monthly';
    end_date?: string;
    occurrences?: number;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    appointment: Appointment;
    patient: Patient;
    physiotherapist: Physiotherapist;
  };
}

const Appointments: React.FC = () => {
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
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
    payment_method: 'cash',
    recurrence: { type: 'none' }
  });

  // Loading states
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conflictAlert, setConflictAlert] = useState<any>(null);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [medicoFilter, setMedicoFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  
  // Edit and delete states
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // Real-time updates via Supabase
  useEffect(() => {
    const subscription = supabase
      .channel('appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, (payload) => {
        console.log('Real-time update:', payload);
        
        // Refetch data when appointments change
        refetch();
        
        // Show notification based on event type
        switch (payload.eventType) {
          case 'INSERT':
            toast.success('Novo agendamento criado');
            break;
          case 'UPDATE':
            toast.info('Agendamento atualizado');
            break;
          case 'DELETE':
            toast.info('Agendamento removido');
            break;
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Removido refetch das dependências para evitar loop infinito

  // Cores por tipo de consulta
  const getAppointmentColor = (type: AppointmentType, status: AppointmentStatus) => {
    const colors = {
      [AppointmentType.CONSULTATION]: { bg: '#3b82f6', border: '#2563eb' },
      [AppointmentType.EVALUATION]: { bg: '#8b5cf6', border: '#7c3aed' },
      [AppointmentType.TREATMENT]: { bg: '#10b981', border: '#059669' },
      [AppointmentType.FOLLOW_UP]: { bg: '#f59e0b', border: '#d97706' }
    };

    if (status === AppointmentStatus.CANCELLED) {
      return { bg: '#ef4444', border: '#dc2626' };
    }
    if (status === AppointmentStatus.COMPLETED) {
      return { bg: '#6b7280', border: '#4b5563' };
    }

    return colors[type] || colors[AppointmentType.CONSULTATION];
  };

  // Converter appointments para eventos do calendário
  useEffect(() => {
    const events: CalendarEvent[] = appointments.map(appointment => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      const physiotherapist = physiotherapists.find(p => p.id === appointment.physiotherapist_id);
      const colors = getAppointmentColor(appointment.appointment_type, appointment.status);

      return {
        id: appointment.id.toString(),
        title: `${patient?.first_name || 'Paciente'} - ${getTipoLabel(appointment.appointment_type)}`,
        start: `${appointment.appointment_date}T${appointment.start_time}`,
        end: `${appointment.appointment_date}T${appointment.end_time}`,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          appointment,
          patient: patient!,
          physiotherapist: physiotherapist!
        }
      };
    });

    setCalendarEvents(events);
  }, [appointments, patients, physiotherapists]); // Dependências estáveis

  // Buscar slots disponíveis
  const fetchAvailableSlots = async (therapistId: string, date: string, duration: number) => {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        therapist_id: therapistId,
        date: date,
        duration: duration
      });

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback: gerar slots padrão
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
    }
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

  // Regras de negócio
  const validateAppointmentConflict = async (appointmentData: Partial<AppointmentFormData>) => {
    try {
      const { data, error } = await supabase.rpc('validate_appointment_conflict', {
        appointment_id: selectedAppointment?.id || null,
        therapist_id: appointmentData.physiotherapist_id,
        patient_id: appointmentData.patient_id,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.start_time,
        duration: appointmentData.appointment_type === AppointmentType.EVALUATION ? 60 : 30
      });

      if (error) throw error;
      return data?.[0] || { has_conflict: false };
    } catch (error) {
      console.error('Error validating conflict:', error);
      return { has_conflict: false };
    }
  };

  const checkCancellationPolicy = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase.rpc('can_cancel_appointment', {
        appointment_id: appointmentId
      });

      if (error) throw error;
      return data?.[0] || { can_cancel: false, reason: 'Erro ao verificar política' };
    } catch (error) {
      console.error('Error checking cancellation policy:', error);
      return { can_cancel: false, reason: 'Erro ao verificar política de cancelamento' };
    }
  };

  const checkDailyPatientLimit = async (therapistId: string, date: string) => {
    try {
      const { data, error } = await supabase.rpc('check_daily_patient_limit', {
        therapist_id: therapistId,
        appointment_date: date,
        max_patients: 12
      });

      if (error) throw error;
      return data?.[0] || { within_limit: true, current_count: 0, max_limit: 12 };
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return { within_limit: true, current_count: 0, max_limit: 12 };
    }
  };

  const generateRecurringAppointments = async (baseData: AppointmentFormData) => {
    if (!baseData.recurrence || baseData.recurrence.type === 'none') {
      return [baseData];
    }

    try {
      const { data, error } = await supabase.rpc('create_recurring_appointments', {
        base_appointment: baseData,
        recurrence_type: baseData.recurrence.type,
        recurrence_count: baseData.recurrence.occurrences,
        recurrence_end_date: baseData.recurrence.end_date
      });

      if (error) throw error;
      return data || [baseData];
    } catch (error) {
      console.error('Error generating recurring appointments:', error);
      return [baseData];
    }
  };

  // Handlers do calendário
  const handleDateClick = (selectInfo: any) => {
    setSelectedDate(selectInfo.date);
    setFormData(prev => ({
      ...prev,
      appointment_date: selectInfo.dateStr
    }));
    setIsEditing(false);
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const appointment = clickInfo.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      physiotherapist_id: appointment.physiotherapist_id,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      appointment_type: appointment.appointment_type,
      status: appointment.status,
      notes: appointment.notes || '',
      price: appointment.price?.toString() || '',
      payment_method: appointment.payment_method || 'cash',
      recurrence: { type: 'none' }
    });
    setIsEditing(true);
    setShowAppointmentModal(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const appointment = dropInfo.event.extendedProps.appointment;
    const newDate = dropInfo.event.start;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate.toISOString().split('T')[0],
          start_time: newDate.toTimeString().slice(0, 5),
          end_time: new Date(newDate.getTime() + (appointment.appointment_type === AppointmentType.EVALUATION ? 60 : 30) * 60000).toTimeString().slice(0, 5)
        })
        .eq('id', appointment.id);

      if (error) throw error;
      
      toast.success('Consulta remarcada com sucesso!');
      refetch();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao remarcar consulta');
      dropInfo.revert();
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda de Consultas</h1>
          <p className="text-gray-600">Gerencie agendamentos com calendário interativo</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSettingsModal(true)}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
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

      {/* Calendário Principal */}
      <div className="bg-white rounded-lg border p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          initialView={currentView}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          select={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          height="auto"
          locale="pt-br"
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Lista'
          }}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:30:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '08:00',
            endTime: '18:00'
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>

      {false ? (
        <div></div>
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

      {/* Appointment Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do agendamento' : 'Preencha as informações para criar um novo agendamento'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção de Paciente */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Fisioterapeuta */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fisioterapeuta</label>
                <select
                  value={formData.physiotherapist_id}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, physiotherapist_id: e.target.value }));
                    if (e.target.value && formData.appointment_date) {
                      const duration = formData.appointment_type === AppointmentType.EVALUATION ? 60 : 30;
                      fetchAvailableSlots(e.target.value, formData.appointment_date, duration);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione um fisioterapeuta</option>
                  {physiotherapists.map(physio => (
                    <option key={physio.id} value={physio.id}>
                      Dr. {physio.first_name} {physio.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, appointment_date: e.target.value }));
                    if (formData.physiotherapist_id && e.target.value) {
                      const duration = formData.appointment_type === AppointmentType.EVALUATION ? 60 : 30;
                      fetchAvailableSlots(formData.physiotherapist_id, e.target.value, duration);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {/* Tipo de Consulta */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Consulta</label>
                <select
                  value={formData.appointment_type}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, appointment_type: e.target.value as AppointmentType }));
                    if (formData.physiotherapist_id && formData.appointment_date) {
                      const duration = e.target.value === AppointmentType.EVALUATION ? 60 : 30;
                      fetchAvailableSlots(formData.physiotherapist_id, formData.appointment_date, duration);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value={AppointmentType.CONSULTATION}>Consulta (30min)</option>
                  <option value={AppointmentType.EVALUATION}>Avaliação (60min)</option>
                  <option value={AppointmentType.TREATMENT}>Tratamento (30min)</option>
                  <option value={AppointmentType.FOLLOW_UP}>Retorno (30min)</option>
                </select>
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário</label>
                <select
                  value={formData.start_time}
                  onChange={(e) => {
                    const startTime = e.target.value;
                    const duration = formData.appointment_type === AppointmentType.EVALUATION ? 60 : 30;
                    const [hours, minutes] = startTime.split(':').map(Number);
                    const endTime = new Date(0, 0, 0, hours, minutes + duration);
                    const endTimeString = endTime.toTimeString().slice(0, 5);
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      start_time: startTime,
                      end_time: endTimeString
                    }));
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione um horário</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AppointmentStatus }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={AppointmentStatus.SCHEDULED}>Agendado</option>
                  <option value={AppointmentStatus.CONFIRMED}>Confirmado</option>
                  <option value={AppointmentStatus.COMPLETED}>Concluído</option>
                  <option value={AppointmentStatus.CANCELLED}>Cancelado</option>
                </select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="0,00"
                />
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as 'cash' | 'card' | 'pix' | 'insurance' }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="insurance">Convênio</option>
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Observações adicionais..."
              />
            </div>

            {/* Recorrência */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recorrência</label>
              <select
                value={formData.recurrence.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  recurrence: { type: e.target.value as 'none' | 'weekly' | 'biweekly' }
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="none">Sem recorrência</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAppointmentModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                // Implementar lógica de salvar
                toast.success(isEditing ? 'Agendamento atualizado!' : 'Agendamento criado!');
                setShowAppointmentModal(false);
                refetch();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Agendamento"
      >
        <div className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Atualize as informações do agendamento abaixo.
          </p>
          <div>Formulário de edição será implementado aqui</div>
        </div>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalhes do Agendamento"
      >
        <div className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Agendamento"
      >
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja excluir este agendamento?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Agendamento'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;