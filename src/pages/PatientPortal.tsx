import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiGet } from '@/hooks/useApi';
import { formatDate, formatCurrency, formatPhone } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { 
  Appointment, 
  Exercise, 
  Patient, 
  AppointmentStatus, 
  ExerciseCategory, 
  ExerciseDifficulty 
} from '@shared/types';
import {
  Calendar,
  Clock,
  FileText,
  User,
  CreditCard,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  Dumbbell,
  Video,
  MessageSquare,
  Star,
  Download,
  Clipboard,
  Bell,
} from 'lucide-react';

// Interfaces locais para dados específicos do portal do paciente

interface Payment {
  id: string;
  data: string;
  valor: number;
  status: 'pendente' | 'pago' | 'reembolsado';
  metodo: string;
  descricao: string;
  comprovante_url?: string;
}

interface Document {
  id: string;
  nome: string;
  tipo: string;
  data_upload: string;
  tamanho: number;
  url: string;
}

interface Message {
  id: string;
  remetente: {
    id: string;
    nome: string;
    foto_url?: string;
    tipo: 'paciente' | 'fisioterapeuta' | 'secretaria' | 'sistema';
  };
  conteudo: string;
  data_envio: string;
  lida: boolean;
  anexos?: Array<{
    id: string;
    nome: string;
    url: string;
  }>;
}

interface PatientPortalData extends Patient {
  fisioterapeuta_principal?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
  condicao_atual?: string;
  objetivos_tratamento?: string;
  progresso_geral?: number;
  proxima_consulta?: {
    id: number;
    appointment_date: string;
    start_time: string;
  };
  total_consultas: number;
  total_exercicios: number;
  total_concluidos: number;
}

const PatientPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // API calls
  const { data: patientData, loading: loadingPatient } = useApiGet<{ patient: PatientPortalData }>('/patient/profile');
  const { data: appointmentsData } = useApiGet<{ appointments: Appointment[] }>('/patient/appointments');
  const { data: exercisesData } = useApiGet<{ exercises: Exercise[] }>('/patient/exercises');
  const { data: paymentsData } = useApiGet<{ payments: Payment[] }>('/patient/payments');
  const { data: documentsData } = useApiGet<{ documents: Document[] }>('/patient/documents');
  const { data: messagesData } = useApiGet<{ messages: Message[] }>('/patient/messages');

  const patient = patientData?.patient;
  const appointments = appointmentsData?.appointments || [];
  const exercises = exercisesData?.exercises || [];
  const payments = paymentsData?.payments || [];
  const documents = documentsData?.documents || [];
  const messages = messagesData?.messages || [];

  const upcomingAppointments = appointments.filter(a => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED);
  const pastAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CANCELLED);
  const pendingExercises = exercises.filter(e => e.status === 'pending' || e.status === 'in_progress');
  const completedExercises = exercises.filter(e => e.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pendente');
  const unreadMessages = messages.filter(m => !m.read);

  const getStatusColor = (status: string) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.CONFIRMED:
      case 'confirmed': return 'bg-green-100 text-green-800';
      case AppointmentStatus.CANCELLED:
      case 'cancelled': return 'bg-red-100 text-red-800';
      case AppointmentStatus.COMPLETED:
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      // Compatibilidade com valores antigos
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'realizado': return 'bg-gray-100 text-gray-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'pago': return 'bg-green-100 text-green-800';
      case 'reembolsado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case AppointmentStatus.CONFIRMED:
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case AppointmentStatus.CANCELLED:
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case AppointmentStatus.COMPLETED:
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'refunded': return <AlertCircle className="w-4 h-4" />;
      // Compatibilidade com valores antigos
      case 'agendado': return <Clock className="w-4 h-4" />;
      case 'confirmado': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      case 'realizado': return <CheckCircle className="w-4 h-4" />;
      case 'pendente': return <AlertCircle className="w-4 h-4" />;
      case 'em_andamento': return <Play className="w-4 h-4" />;
      case 'concluido': return <CheckCircle className="w-4 h-4" />;
      case 'pago': return <CheckCircle className="w-4 h-4" />;
      case 'reembolsado': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  };

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentDetails(true);
  };

  const handleDownloadDocument = (document: Document) => {
    window.open(document.url, '_blank');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Informações do Paciente */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient?.first_name} {patient?.last_name}</h2>
                <p className="text-gray-600">{patient?.email}</p>
                <p className="text-gray-600">{formatPhone(patient?.phone || '')}</p>
              </div>
            </div>
          <Button
            variant="outline"
            onClick={() => navigate('/patient/profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Consultas</p>
                <p className="text-2xl font-bold text-blue-900">{patient?.total_consultas || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Exercícios Concluídos</p>
                <p className="text-2xl font-bold text-green-900">{patient?.total_concluidos || 0}</p>
              </div>
              <Dumbbell className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Progresso Geral</p>
                <p className="text-2xl font-bold text-purple-900">{patient?.progresso_geral || 0}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Mensagens Não Lidas</p>
                <p className="text-2xl font-bold text-orange-900">{unreadMessages.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </Card>

      {/* Próxima Consulta */}
      {patient?.proxima_consulta && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próxima Consulta</h3>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {formatDate(patient.proxima_consulta.appointment_date)} às {patient.proxima_consulta.start_time}
                </p>
                <p className="text-sm text-gray-600">
                  {patient.fisioterapeuta_principal?.first_name} {patient.fisioterapeuta_principal?.last_name}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setActiveTab('appointments')}
            >
              Ver Detalhes
            </Button>
          </div>
        </Card>
      )}

      {/* Exercícios Pendentes */}
      {pendingExercises.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Exercícios Pendentes</h3>
            <Button
              variant="outline"
              onClick={() => setActiveTab('exercises')}
            >
              Ver Todos
            </Button>
          </div>
          <div className="space-y-3">
            {pendingExercises.slice(0, 3).map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleExerciseClick(exercise)}
              >
                <div className="flex items-center space-x-3">
                  <Dumbbell className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{exercise.name}</p>
                    <p className="text-sm text-gray-600">{exercise.category}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pagamentos Pendentes */}
      {pendingPayments.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pagamentos Pendentes</h3>
            <Button
              variant="outline"
              onClick={() => setActiveTab('payments')}
            >
              Ver Todos
            </Button>
          </div>
          <div className="space-y-3">
            {pendingPayments.slice(0, 3).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">{payment.descricao}</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(payment.status)
                  }`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{payment.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/patient/schedule')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Consulta
        </Button>
      </div>

      {/* Próximos Agendamentos */}
      {upcomingAppointments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Agendamentos</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(appointment.appointment_date)} às {appointment.start_time}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.appointment_type}</p>
                    <p className="text-sm text-gray-600">
                      Dr(a). {appointment.physiotherapist?.first_name} {appointment.physiotherapist?.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(appointment.price || 0)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(appointment.status)
                  }`}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1">{appointment.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Histórico de Agendamentos */}
      {pastAppointments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h3>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(appointment.appointment_date)} às {appointment.start_time}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.appointment_type}</p>
                    <p className="text-sm text-gray-600">
                      Dr(a). {appointment.physiotherapist?.first_name} {appointment.physiotherapist?.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(appointment.price || 0)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(appointment.status)
                  }`}>
                    {getStatusIcon(appointment.status)}
                    <span className="ml-1">{appointment.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderExercises = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Exercícios</h2>
      </div>

      {/* Exercícios Pendentes */}
      {pendingExercises.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercícios Pendentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleExerciseClick(exercise)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(exercise.status)
                  }`}>
                    {getStatusIcon(exercise.status)}
                    <span className="ml-1">{exercise.status}</span>
                  </span>
                  {exercise.video_url && (
                    <Video className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{exercise.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exercise.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{exercise.category}</span>
                  <span>{exercise.estimated_duration} min</span>
                </div>
                {exercise.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>{exercise.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${exercise.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Exercícios Concluídos */}
      {completedExercises.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercícios Concluídos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75"
                onClick={() => handleExerciseClick(exercise)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(exercise.status)
                  }`}>
                    {getStatusIcon(exercise.status)}
                    <span className="ml-1">{exercise.status}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    {exercise.video_url && (
                      <Video className="w-5 h-5 text-blue-600" />
                    )}
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{exercise.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exercise.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{exercise.category}</span>
                  <span>Concluído em {formatDate(exercise.completion_date || '')}</span>
                </div>
                {exercise.feedback && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-800">
                    <Star className="w-4 h-4 inline mr-1" />
                    {exercise.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pagamentos</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{payment.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(payment.date)}</p>
                  <p className="text-sm text-gray-600">{payment.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(payment.status)
                }`}>
                  {getStatusIcon(payment.status)}
                  <span className="ml-1">{payment.status}</span>
                </span>
                {payment.receipt_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(payment.receipt_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Comprovante
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDocumentClick(document)}
            >
              <div className="flex items-center justify-between mb-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadDocument(document);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{document.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{document.type}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(document.upload_date)}</span>
                <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mensagens</h2>
        <Button
          variant="primary"
          onClick={() => navigate('/patient/messages/new')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Nova Mensagem
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${
                message.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{message.sender.name}</p>
            <p className="text-sm text-gray-600">{message.sender.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDate(message.send_date)}</p>
            {!message.read && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      <Bell className="w-3 h-3 mr-1" />
                      Nova
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-800 mb-3">{message.content}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                    <Button
                      key={attachment.id}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Clipboard className="w-4 h-4 mr-1" />
                      {attachment.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Portal do Paciente</h1>
            </div>
            <div className="flex items-center space-x-4">
              {unreadMessages.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages.length}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/logout')}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'appointments', label: 'Agendamentos', icon: Calendar },
              { id: 'exercises', label: 'Exercícios', icon: Dumbbell },
              { id: 'payments', label: 'Pagamentos', icon: CreditCard },
              { id: 'documents', label: 'Documentos', icon: FileText },
              { id: 'messages', label: 'Mensagens', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.id === 'messages' && unreadMessages.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'exercises' && renderExercises()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'messages' && renderMessages()}
      </div>

      {/* Modals */}
      {showAppointmentDetails && selectedAppointment && (
        <Modal
          isOpen={showAppointmentDetails}
          onClose={() => setShowAppointmentDetails(false)}
          title="Detalhes do Agendamento"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data do Agendamento</label>
                <p className="text-gray-900">{formatDate(selectedAppointment.appointment_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Horário</label>
                <p className="text-gray-900">
                  {selectedAppointment.start_time} - {selectedAppointment.end_time}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Consulta</label>
                <p className="text-gray-900">{selectedAppointment.appointment_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(selectedAppointment.status)
                }`}>
                  {getStatusIcon(selectedAppointment.status)}
                  <span className="ml-1">{selectedAppointment.status}</span>
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fisioterapeuta Responsável</label>
                <p className="text-gray-900">Dr(a). {selectedAppointment.physiotherapist?.first_name} {selectedAppointment.physiotherapist?.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor da Consulta</label>
                <p className="text-gray-900">{formatCurrency(selectedAppointment.price || 0)}</p>
              </div>
            </div>
            {selectedAppointment.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <p className="text-gray-900">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showExerciseDetails && selectedExercise && (
        <Modal
          isOpen={showExerciseDetails}
          onClose={() => setShowExerciseDetails(false)}
          title="Detalhes do Exercício"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedExercise.name}</h3>
                <p className="text-gray-600">{selectedExercise.category}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getStatusColor(selectedExercise.status)
              }`}>
                {getStatusIcon(selectedExercise.status)}
                <span className="ml-1">{selectedExercise.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nível de Dificuldade</label>
                <p className="text-gray-900 capitalize">{selectedExercise.difficulty_level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duração Estimada</label>
                <p className="text-gray-900">{selectedExercise.estimated_duration} minutos</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <p className="text-gray-900">{selectedExercise.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instruções</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-line">{selectedExercise.instructions}</p>
              </div>
            </div>

            {selectedExercise.progress !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progresso</label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedExercise.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{selectedExercise.progress}%</span>
                </div>
              </div>
            )}

            {selectedExercise.video_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vídeo Demonstrativo</label>
                <Button
                  variant="primary"
                  onClick={() => window.open(selectedExercise.video_url, '_blank')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Assistir Vídeo
                </Button>
              </div>
            )}

            {selectedExercise.feedback && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">{selectedExercise.feedback}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {selectedExercise.status === 'pendente' && (
                <Button variant="primary">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Exercício
                </Button>
              )}
              {selectedExercise.status === 'em_andamento' && (
                <Button variant="success">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Concluído
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showDocumentDetails && selectedDocument && (
        <Modal
          isOpen={showDocumentDetails}
          onClose={() => setShowDocumentDetails(false)}
          title="Detalhes do Documento"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <FileText className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedDocument.name}</h3>
                <p className="text-gray-600">{selectedDocument.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Envio</label>
                <p className="text-gray-900">{formatDate(selectedDocument.upload_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tamanho</label>
                <p className="text-gray-900">{(selectedDocument.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDocumentDetails(false)}
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownloadDocument(selectedDocument)}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientPortal;