import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, User, Calendar } from 'lucide-react';

// Simple Alert components
const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    {children}
  </div>
);

const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>
    {children}
  </h5>
);

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
    {children}
  </div>
);

export interface ConflictInfo {
  type: 'time_conflict' | 'therapist_unavailable' | 'patient_conflict' | 'room_conflict';
  message: string;
  conflictingAppointment?: {
    id: string;
    patient_name: string;
    therapist_name: string;
    date: string;
    time: string;
    type: string;
  };
  suggestions?: string[];
}

interface ConflictAlertProps {
  conflicts: ConflictInfo[];
  onResolve?: (conflictType: string) => void;
  onIgnore?: () => void;
  className?: string;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  conflicts,
  onResolve,
  onIgnore,
  className = ''
}) => {
  if (conflicts.length === 0) return null;

  const getConflictIcon = (type: ConflictInfo['type']) => {
    switch (type) {
      case 'time_conflict':
        return <Clock className="h-4 w-4" />;
      case 'therapist_unavailable':
      case 'patient_conflict':
        return <User className="h-4 w-4" />;
      case 'room_conflict':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConflictTitle = (type: ConflictInfo['type']) => {
    switch (type) {
      case 'time_conflict':
        return 'Conflito de Horário';
      case 'therapist_unavailable':
        return 'Fisioterapeuta Indisponível';
      case 'patient_conflict':
        return 'Paciente com Outro Agendamento';
      case 'room_conflict':
        return 'Sala Ocupada';
      default:
        return 'Conflito Detectado';
    }
  };

  const getSeverityColor = (type: ConflictInfo['type']) => {
    switch (type) {
      case 'time_conflict':
      case 'patient_conflict':
        return 'border-red-200 bg-red-50';
      case 'therapist_unavailable':
      case 'room_conflict':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-orange-200 bg-orange-50';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {conflicts.map((conflict, index) => (
        <Alert key={index} className={`${getSeverityColor(conflict.type)} border-l-4`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getConflictIcon(conflict.type)}
            </div>
            
            <div className="flex-1 space-y-2">
              <AlertTitle className="text-sm font-semibold">
                {getConflictTitle(conflict.type)}
              </AlertTitle>
              
              <AlertDescription className="text-sm">
                {conflict.message}
              </AlertDescription>

              {/* Detalhes do agendamento conflitante */}
              {conflict.conflictingAppointment && (
                <div className="mt-3 p-3 bg-white/50 rounded-md border">
                  <p className="text-xs font-medium text-gray-600 mb-2">Agendamento Conflitante:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Paciente:</span> {conflict.conflictingAppointment.patient_name}
                    </div>
                    <div>
                      <span className="font-medium">Fisioterapeuta:</span> {conflict.conflictingAppointment.therapist_name}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {new Date(conflict.conflictingAppointment.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Horário:</span> {conflict.conflictingAppointment.time}
                    </div>
                  </div>
                </div>
              )}

              {/* Sugestões */}
              {conflict.suggestions && conflict.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Sugestões:</p>
                  <ul className="text-xs space-y-1">
                    {conflict.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-gray-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Alert>
      ))}

      {/* Botões de Ação */}
      {(onResolve || onIgnore) && (
        <div className="flex gap-2 pt-2">
          {onResolve && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(conflicts[0].type)}
              className="text-xs"
            >
              Resolver Conflitos
            </Button>
          )}
          {onIgnore && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onIgnore}
              className="text-xs text-gray-600"
            >
              Ignorar e Continuar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};