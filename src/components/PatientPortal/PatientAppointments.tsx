import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Video, Plus, Edit, X, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface Appointment {
  id: string;
  date: Date;
  time: string;
  duration: number;
  provider: string;
  providerRole: string;
  type: 'presencial' | 'online' | 'domicilio';
  status: 'confirmado' | 'pendente' | 'cancelado' | 'concluido';
  location?: string;
  meetingLink?: string;
  notes?: string;
  canReschedule: boolean;
  canCancel: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: new Date(2025, 0, 10, 14, 0),
    time: '14:00',
    duration: 60,
    provider: 'Dr. Ana Silva',
    providerRole: 'Fisioterapeuta',
    type: 'presencial',
    status: 'confirmado',
    location: 'Sala 3 - Clínica FisioFlow',
    notes: 'Avaliação de progresso e novos exercícios',
    canReschedule: true,
    canCancel: true
  },
  {
    id: '2',
    date: new Date(2025, 0, 8, 10, 30),
    time: '10:30',
    duration: 45,
    provider: 'Dr. Carlos Lima',
    providerRole: 'Especialista',
    type: 'online',
    status: 'pendente',
    meetingLink: 'https://meet.fisioflow.com/room/abc123',
    notes: 'Consultoria especializada em dor lombar',
    canReschedule: true,
    canCancel: true
  },
  {
    id: '3',
    date: new Date(2025, 0, 12, 16, 0),
    time: '16:00',
    duration: 90,
    provider: 'Dr. Ana Silva',
    providerRole: 'Fisioterapeuta',
    type: 'domicilio',
    status: 'confirmado',
    location: 'Rua das Flores, 123 - Apartamento 45',
    notes: 'Sessão de fisioterapia em casa',
    canReschedule: true,
    canCancel: false
  },
  {
    id: '4',
    date: new Date(2025, 0, 5, 9, 0),
    time: '09:00',
    duration: 60,
    provider: 'Dr. Ana Silva',
    providerRole: 'Fisioterapeuta',
    type: 'presencial',
    status: 'concluido',
    location: 'Sala 2 - Clínica FisioFlow',
    notes: 'Sessão de exercícios funcionais',
    canReschedule: false,
    canCancel: false
  }
];

const availableTimeSlots: TimeSlot[] = [
  { time: '08:00', available: true },
  { time: '08:30', available: false },
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: false },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: false },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: false },
  { time: '17:00', available: true }
];

export default function PatientAppointments() {
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'schedule'>('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'concluido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'domicilio':
        return <MapPin className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'online':
        return 'Online';
      case 'domicilio':
        return 'Domicílio';
      default:
        return 'Presencial';
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.date > new Date() && apt.status !== 'cancelado'
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastAppointments = appointments.filter(apt => 
    apt.date < new Date() || apt.status === 'concluido'
  ).sort((a, b) => b.date.getTime() - a.date.getTime());

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="border border-gray-200 dark:border-dark-600">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(appointment.type)}
            <span className="font-medium text-gray-900 dark:text-white">
              {getTypeLabel(appointment.type)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-dark-400">
              {formatDate(appointment.date)}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {appointment.time}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
            <User className="w-4 h-4" />
            <span>{appointment.provider} - {appointment.providerRole}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
            <Clock className="w-4 h-4" />
            <span>{appointment.duration} minutos</span>
          </div>

          {appointment.location && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-dark-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{appointment.location}</span>
            </div>
          )}

          {appointment.meetingLink && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Video className="w-4 h-4" />
              <a 
                href={appointment.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                Link da reunião
              </a>
            </div>
          )}
        </div>

        {appointment.notes && (
          <p className="text-sm text-gray-600 dark:text-dark-300 mb-3 p-2 bg-gray-50 dark:bg-dark-700 rounded">
            {appointment.notes}
          </p>
        )}

        <div className="flex gap-2">
          {appointment.canReschedule && appointment.status !== 'concluido' && (
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              Reagendar
            </Button>
          )}
          
          {appointment.canCancel && appointment.status !== 'concluido' && (
            <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          )}
          
          {appointment.type === 'online' && appointment.status === 'confirmado' && (
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
              <Video className="w-4 h-4 mr-1" />
              Entrar na Consulta
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header com estatísticas rápidas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Próximas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {upcomingAppointments.length}
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
                <p className="text-sm text-gray-500 dark:text-dark-400">Concluídas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {pastAppointments.filter(apt => apt.status === 'concluido').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-dark-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-400">Pendentes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {appointments.filter(apt => apt.status === 'pendente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegação */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
          }`}
        >
          Próximas Consultas
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
          }`}
        >
          Histórico
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'schedule'
              ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
          }`}
        >
          Agendar Nova
        </button>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Próximas Consultas
            </h2>
            <Button 
              onClick={() => setActiveTab('schedule')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar Nova
            </Button>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card className="border border-gray-200 dark:border-dark-600">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-dark-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma consulta agendada
                </h3>
                <p className="text-gray-500 dark:text-dark-400 mb-4">
                  Você não tem consultas agendadas no momento.
                </p>
                <Button 
                  onClick={() => setActiveTab('schedule')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Agendar Nova Consulta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Histórico de Consultas
          </h2>
          
          <div className="space-y-4">
            {pastAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Agendar Nova Consulta
          </h2>
          
          {/* Calendário simples */}
          <Card className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="text-lg">Selecione uma Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-dark-400">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((date, index) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Horários disponíveis */}
          <Card className="border border-gray-200 dark:border-dark-600">
            <CardHeader>
              <CardTitle className="text-lg">
                Horários Disponíveis - {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {availableTimeSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      slot.available
                        ? 'border-gray-200 dark:border-dark-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-dark-600 bg-gray-100 dark:bg-dark-800 text-gray-400 dark:text-dark-500 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Confirmar Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AnimatedContainer>
  );
}