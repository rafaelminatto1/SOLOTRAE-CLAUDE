import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Repeat } from 'lucide-react';

export interface RecurrenceConfig {
  type: 'none' | 'weekly' | 'biweekly';
  endDate?: string;
  occurrences?: number;
}

interface RecurrenceSelectorProps {
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
  disabled?: boolean;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const recurrenceOptions = [
    { value: 'none', label: 'Sem recorrência', description: 'Agendamento único' },
    { value: 'weekly', label: 'Semanal', description: 'Repetir toda semana' },
    { value: 'biweekly', label: 'Quinzenal', description: 'Repetir a cada 2 semanas' }
  ];

  const handleTypeChange = (type: 'none' | 'weekly' | 'biweekly') => {
    onChange({
      ...value,
      type,
      // Reset end date and occurrences when changing type
      endDate: type === 'none' ? undefined : value.endDate,
      occurrences: type === 'none' ? undefined : value.occurrences || 4
    });
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({
      ...value,
      endDate,
      occurrences: undefined // Clear occurrences when setting end date
    });
  };

  const handleOccurrencesChange = (occurrences: number) => {
    onChange({
      ...value,
      occurrences,
      endDate: undefined // Clear end date when setting occurrences
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Repeat className="h-4 w-4" />
        <span>Configuração de Recorrência</span>
      </div>

      {/* Tipo de Recorrência */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Recorrência</label>
        <div className="grid gap-2">
          {recurrenceOptions.map((option) => (
            <Button
              key={option.value}
              variant={value.type === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange(option.value as 'none' | 'weekly' | 'biweekly')}
              disabled={disabled}
              className={`justify-start text-left h-auto p-3 ${
                value.type === option.value 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="font-medium">{option.label}</div>
                <div className={`text-xs ${
                  value.type === option.value ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {option.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Configurações adicionais para recorrência */}
      {value.type !== 'none' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4" />
            <span>Configurações Adicionais</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de Ocorrências */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de Sessões</label>
              <select
                value={value.occurrences || 4}
                onChange={(e) => handleOccurrencesChange(Number(e.target.value))}
                disabled={disabled || !!value.endDate}
                className="w-full p-2 border rounded-md text-sm disabled:bg-gray-100"
              >
                {[2, 4, 6, 8, 10, 12, 16, 20].map(num => (
                  <option key={num} value={num}>{num} sessões</option>
                ))}
              </select>
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ou definir data final</label>
              <input
                type="date"
                value={value.endDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                disabled={disabled || !!value.occurrences}
                className="w-full p-2 border rounded-md text-sm disabled:bg-gray-100"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Resumo da Recorrência */}
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Resumo:</strong> {' '}
              {value.type === 'weekly' && 'Agendamentos semanais'}
              {value.type === 'biweekly' && 'Agendamentos quinzenais'}
              {value.occurrences && ` por ${value.occurrences} sessões`}
              {value.endDate && ` até ${new Date(value.endDate).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};