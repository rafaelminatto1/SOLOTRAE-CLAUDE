import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Simple Badge component
const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);
import { CheckCircle, X, Calendar, MessageSquare, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';

export interface AppointmentAction {
  id: string;
  patient_name: string;
  therapist_name: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  phone?: string;
}

interface QuickActionsProps {
  appointment: AppointmentAction;
  onConfirm: (appointmentId: string) => void;
  onCancel: (appointmentId: string, reason?: string) => void;
  onReschedule: (appointmentId: string) => void;
  onSendReminder: (appointmentId: string, method: 'whatsapp' | 'sms' | 'call') => void;
  onMarkCompleted: (appointmentId: string) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  onSendReminder,
  onMarkCompleted,
  disabled = false
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReminderOptions, setShowReminderOptions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: AppointmentAction['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: AppointmentAction['status']) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const handleConfirm = () => {
    onConfirm(appointment.id);
    toast.success('Agendamento confirmado!');
  };

  const handleCancel = () => {
    onCancel(appointment.id, cancelReason);
    toast.success('Agendamento cancelado');
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleReschedule = () => {
    onReschedule(appointment.id);
    toast.info('Abrindo opções de reagendamento...');
  };

  const handleSendReminder = (method: 'whatsapp' | 'sms' | 'call') => {
    onSendReminder(appointment.id, method);
    const methodLabels = {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      call: 'ligação'
    };
    toast.success(`Lembrete enviado via ${methodLabels[method]}`);
    setShowReminderOptions(false);
  };

  const handleMarkCompleted = () => {
    onMarkCompleted(appointment.id);
    toast.success('Agendamento marcado como concluído!');
  };

  const isAppointmentToday = () => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(appointment.date).toDateString();
    return today === appointmentDate;
  };

  const isAppointmentPast = () => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    return appointmentDateTime < now;
  };

  return (
    <div className="space-y-3">
      {/* Informações do Agendamento */}
      <div className="p-3 bg-gray-50 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{appointment.patient_name}</h4>
          <Badge className={getStatusColor(appointment.status)}>
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Fisioterapeuta: {appointment.therapist_name}</div>
          <div>Data: {formatDate(appointment.date)} às {appointment.time}</div>
          <div>Tipo: {appointment.type}</div>
          {appointment.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {appointment.phone}
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 gap-2">
        {/* Confirmar */}
        {appointment.status === 'scheduled' && (
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={disabled}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
        )}

        {/* Reagendar */}
        {['scheduled', 'confirmed'].includes(appointment.status) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReschedule}
            disabled={disabled}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Reagendar
          </Button>
        )}

        {/* Enviar Lembrete */}
        {['scheduled', 'confirmed'].includes(appointment.status) && appointment.phone && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReminderOptions(true)}
            disabled={disabled}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Lembrete
          </Button>
        )}

        {/* Marcar como Concluído */}
        {appointment.status === 'confirmed' && isAppointmentToday() && (
          <Button
            size="sm"
            onClick={handleMarkCompleted}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )}

        {/* Cancelar */}
        {['scheduled', 'confirmed'].includes(appointment.status) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCancelModal(true)}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}
      </div>

      {/* Alertas */}
      {isAppointmentPast() && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <Clock className="h-4 w-4" />
            <span>Este agendamento já passou do horário</span>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Agendamento"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-md">
            <p className="font-medium text-red-800">{appointment.patient_name}</p>
            <p className="text-sm text-red-600">
              {formatDate(appointment.date)} às {appointment.time}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo do cancelamento (opcional):</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Descreva o motivo do cancelamento..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Voltar
            </Button>
            <Button 
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Opções de Lembrete */}
      <Modal
        isOpen={showReminderOptions}
        onClose={() => setShowReminderOptions(false)}
        title="Enviar Lembrete"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="font-medium">{appointment.patient_name}</p>
            <p className="text-sm text-gray-600">
              {formatDate(appointment.date)} às {appointment.time}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Escolha o método de envio:</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => handleSendReminder('whatsapp')}
                className="justify-start"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSendReminder('sms')}
                className="justify-start"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSendReminder('call')}
                className="justify-start"
              >
                <Phone className="h-4 w-4 mr-2" />
                Ligação
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowReminderOptions(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};