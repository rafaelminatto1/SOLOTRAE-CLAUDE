import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
import { Clock, User, Phone, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface WaitlistEntry {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  therapist_id: string;
  therapist_name: string;
  preferred_date?: string;
  preferred_time?: string;
  appointment_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  created_at: string;
  notified_count: number;
  last_offer_date?: string;
}

interface WaitlistManagerProps {
  entries: WaitlistEntry[];
  onAddToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'notified_count'>) => void;
  onRemoveFromWaitlist: (entryId: string) => void;
  onOfferSlot: (entryId: string, slotInfo: { date: string; time: string }) => void;
  onScheduleFromWaitlist: (entryId: string) => void;
  availableSlots?: { date: string; time: string; therapist_id: string }[];
}

export const WaitlistManager: React.FC<WaitlistManagerProps> = ({
  entries,
  onAddToWaitlist,
  onRemoveFromWaitlist,
  onOfferSlot,
  onScheduleFromWaitlist,
  availableSlots = []
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  const getPriorityColor = (priority: WaitlistEntry['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: WaitlistEntry['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleOfferSlot = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setShowOfferModal(true);
  };

  const confirmOfferSlot = () => {
    if (selectedEntry && selectedSlot) {
      onOfferSlot(selectedEntry.id, selectedSlot);
      toast.success(`Vaga oferecida para ${selectedEntry.patient_name}`);
      setShowOfferModal(false);
      setSelectedEntry(null);
      setSelectedSlot(null);
    }
  };

  // Filtrar slots disponíveis para o fisioterapeuta selecionado
  const getAvailableSlotsForTherapist = (therapistId: string) => {
    return availableSlots.filter(slot => slot.therapist_id === therapistId);
  };

  // Ordenar entradas por prioridade e data de criação
  const sortedEntries = [...entries].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Lista de Espera</h3>
          <Badge variant="secondary">{entries.length}</Badge>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          Adicionar à Lista
        </Button>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>Nenhum paciente na lista de espera</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const therapistSlots = getAvailableSlotsForTherapist(entry.therapist_id);
            const hasAvailableSlots = therapistSlots.length > 0;

            return (
              <div key={entry.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{entry.patient_name}</span>
                      <Badge className={getPriorityColor(entry.priority)}>
                        {getPriorityLabel(entry.priority)}
                      </Badge>
                      {hasAvailableSlots && (
                        <Badge className="bg-green-100 text-green-800">
                          Vaga Disponível
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{entry.patient_phone}</span>
                      </div>
                      <div>
                        <span className="font-medium">Fisioterapeuta:</span> {entry.therapist_name}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {entry.appointment_type}
                      </div>
                      <div>
                        <span className="font-medium">Aguardando:</span> {formatDate(entry.created_at)}
                      </div>
                    </div>

                    {entry.preferred_date && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Preferência:</span> {formatDate(entry.preferred_date)}
                        {entry.preferred_time && ` às ${entry.preferred_time}`}
                      </div>
                    )}

                    {entry.notes && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Observações:</span> {entry.notes}
                      </div>
                    )}

                    {entry.notified_count > 0 && (
                      <div className="text-xs text-gray-500">
                        Notificado {entry.notified_count} vez(es)
                        {entry.last_offer_date && ` - Última oferta: ${formatDateTime(entry.last_offer_date)}`}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {hasAvailableSlots ? (
                      <Button
                        size="sm"
                        onClick={() => handleOfferSlot(entry)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Oferecer Vaga
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onScheduleFromWaitlist(entry.id)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Agendar
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFromWaitlist(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Oferecer Vaga */}
      <Modal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        title="Oferecer Vaga Disponível"
      >
        <div>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="font-medium">{selectedEntry.patient_name}</p>
                <p className="text-sm text-gray-600">{selectedEntry.therapist_name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione a vaga disponível:</label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {getAvailableSlotsForTherapist(selectedEntry.therapist_id).map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSlot(slot)}
                      className="justify-start"
                    >
                      {formatDate(slot.date)} às {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowOfferModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmOfferSlot}
              disabled={!selectedSlot}
              className="bg-green-600 hover:bg-green-700"
            >
              Oferecer Vaga
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};