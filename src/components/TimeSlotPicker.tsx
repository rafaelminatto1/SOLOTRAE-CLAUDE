import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  availableSlots: string[];
  selectedSlot: string;
  onSlotSelect: (slot: string) => void;
  duration: number; // em minutos
  disabled?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availableSlots,
  selectedSlot,
  onSlotSelect,
  duration,
  disabled = false
}) => {
  const formatSlotWithDuration = (slot: string) => {
    const [hours, minutes] = slot.split(':').map(Number);
    const endTime = new Date(0, 0, 0, hours, minutes + duration);
    const endTimeString = endTime.toTimeString().slice(0, 5);
    return `${slot} - ${endTimeString}`;
  };

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>Nenhum horário disponível para esta data</p>
        <p className="text-sm">Tente selecionar outra data ou fisioterapeuta</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>Horários disponíveis ({duration} min)</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {availableSlots.map((slot) => (
          <Button
            key={slot}
            variant={selectedSlot === slot ? "default" : "outline"}
            size="sm"
            onClick={() => onSlotSelect(slot)}
            disabled={disabled}
            className={`text-xs justify-start ${
              selectedSlot === slot 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'hover:bg-blue-50'
            }`}
          >
            {formatSlotWithDuration(slot)}
          </Button>
        ))}
      </div>
      
      {selectedSlot && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Horário selecionado:</strong> {formatSlotWithDuration(selectedSlot)}
          </p>
        </div>
      )}
    </div>
  );
};