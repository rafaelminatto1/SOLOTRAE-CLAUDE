import { AppointmentFormData, AppointmentType, AppointmentStatus } from '@shared/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Definir maxLimit como constante
const DEFAULT_MAX_LIMIT = 12;

// Interface para resultado de validação
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Interface para conflito de agendamento
interface ConflictResult {
  hasConflict: boolean;
  conflictingAppointment?: any;
  message?: string;
}

// Interface para política de cancelamento
interface CancellationPolicy {
  canCancel: boolean;
  reason?: string;
  hoursUntilAppointment?: number;
}

export class AppointmentValidator {
  /**
   * Valida dados do formulário de agendamento
   */
  static validateForm(data: Partial<AppointmentFormData>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações obrigatórias
    if (!data.patient_id) {
      errors.push('Paciente é obrigatório');
    }

    if (!data.physiotherapist_id) {
      errors.push('Fisioterapeuta é obrigatório');
    }

    if (!data.appointment_date) {
      errors.push('Data do agendamento é obrigatória');
    }

    if (!data.start_time) {
      errors.push('Horário de início é obrigatório');
    }

    if (!data.end_time) {
      errors.push('Horário de término é obrigatório');
    }

    // Validação de data
    if (data.appointment_date) {
      const appointmentDate = new Date(data.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        errors.push('Data do agendamento não pode ser no passado');
      }

      // Verificar se não é domingo
      if (appointmentDate.getDay() === 0) {
        errors.push('Agendamentos não são permitidos aos domingos');
      }

      // Verificar se não é muito no futuro (1 ano)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (appointmentDate > maxDate) {
        errors.push('Agendamento não pode ser mais de 1 ano no futuro');
      }
    }

    // Validação de horário
    if (data.start_time && data.end_time) {
      const startTime = this.parseTime(data.start_time);
      const endTime = this.parseTime(data.end_time);

      if (startTime >= endTime) {
        errors.push('Horário de término deve ser posterior ao horário de início');
      }

      // Verificar horário comercial (8h às 18h)
      if (startTime < 8 || startTime >= 18) {
        errors.push('Agendamentos devem ser entre 8h e 18h');
      }

      if (endTime > 18) {
        errors.push('Agendamentos devem terminar até 18h');
      }

      // Verificar duração mínima e máxima
      const duration = (endTime - startTime) * 60; // em minutos
      if (duration < 15) {
        errors.push('Duração mínima é de 15 minutos');
      }

      if (duration > 180) {
        errors.push('Duração máxima é de 3 horas');
      }

      // Verificar se é múltiplo de 15 minutos
      if (duration % 15 !== 0) {
        warnings.push('Recomenda-se que a duração seja múltiplo de 15 minutos');
      }
    }

    // Validação de preço
    if (data.price) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0) {
        errors.push('Preço deve ser um valor válido e positivo');
      }

      if (price > 10000) {
        warnings.push('Preço parece muito alto, verifique se está correto');
      }
    }

    // Validação de notas
    if (data.notes && data.notes.length > 1000) {
      errors.push('Observações não podem exceder 1000 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Verifica conflitos de agendamento
   */
  static async checkConflicts(
    data: Partial<AppointmentFormData>,
    excludeAppointmentId?: string
  ): Promise<ConflictResult> {
    try {
      if (!data.physiotherapist_id || !data.appointment_date || !data.start_time || !data.end_time) {
        return { hasConflict: false };
      }

      const startDateTime = `${data.appointment_date}T${data.start_time}`;
      const endDateTime = `${data.appointment_date}T${data.end_time}`;

      let query = supabase
        .from('appointments')
        .select('*')
        .eq('physiotherapist_id', data.physiotherapist_id)
        .eq('appointment_date', data.appointment_date)
        .neq('status', AppointmentStatus.CANCELLED)
        .or(`and(start_time.lte.${data.end_time},end_time.gt.${data.start_time})`);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data: conflictingAppointments, error } = await query;

      if (error) {
        console.error('Error checking conflicts:', error);
        return { hasConflict: false };
      }

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        return {
          hasConflict: true,
          conflictingAppointment: conflictingAppointments[0],
          message: 'Já existe um agendamento neste horário'
        };
      }

      return { hasConflict: false };
    } catch (error) {
      console.error('Error checking appointment conflicts:', error);
      return { hasConflict: false };
    }
  }

  /**
   * Verifica política de cancelamento
   */
  static async checkCancellationPolicy(appointmentId: string): Promise<CancellationPolicy> {
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('appointment_date, start_time, status')
        .eq('id', appointmentId)
        .single();

      if (error || !appointment) {
        return {
          canCancel: false,
          reason: 'Agendamento não encontrado'
        };
      }

      // Verificar se já foi cancelado
      if (appointment.status === AppointmentStatus.CANCELLED) {
        return {
          canCancel: false,
          reason: 'Agendamento já foi cancelado'
        };
      }

      // Verificar se já foi concluído
      if (appointment.status === AppointmentStatus.COMPLETED) {
        return {
          canCancel: false,
          reason: 'Agendamento já foi concluído'
        };
      }

      // Calcular horas até o agendamento
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Política: cancelamento até 24 horas antes
      if (hoursUntilAppointment < 24) {
        return {
          canCancel: false,
          reason: 'Cancelamento deve ser feito com pelo menos 24 horas de antecedência',
          hoursUntilAppointment
        };
      }

      return {
        canCancel: true,
        hoursUntilAppointment
      };
    } catch (error) {
      console.error('Error checking cancellation policy:', error);
      return {
        canCancel: false,
        reason: 'Erro ao verificar política de cancelamento'
      };
    }
  }

  /**
   * Verifica limite diário de pacientes
   */
  static async checkDailyLimit(
    physiotherapistId: string,
    date: string,
    maxPatients: number = 12
  ): Promise<{ withinLimit: boolean; currentCount: number; maxLimit: number }> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('physiotherapist_id', physiotherapistId)
        .eq('appointment_date', date)
        .neq('status', AppointmentStatus.CANCELLED) as { data: Array<{id: string}> | null, error: any };

      if (error) {
        console.error('Error checking daily limit:', error);
        return { withinLimit: true, currentCount: 0, maxLimit: maxPatients };
      }

      const currentCount = appointments?.length || 0;
      return {
        withinLimit: currentCount < maxPatients,
        currentCount,
        maxLimit: maxPatients
      };
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return { withinLimit: true, currentCount: 0, maxLimit: maxPatients };
    }
  }

  /**
   * Gera slots de tempo disponíveis
   */
  static async getAvailableSlots(
    physiotherapistId: string,
    date: string,
    duration: number = 30
  ): Promise<string[]> {
    try {
      // Buscar agendamentos existentes
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('physiotherapist_id', physiotherapistId)
        .eq('appointment_date', date)
        .neq('status', AppointmentStatus.CANCELLED) as { data: Array<{start_time: string, end_time: string}> | null, error: any };

      if (error) {
        console.error('Error fetching appointments:', error);
        return this.generateDefaultSlots();
      }

      // Gerar todos os slots possíveis
      const allSlots = this.generateDefaultSlots();
      const bookedSlots = new Set<string>();

      // Marcar slots ocupados
      appointments?.forEach(appointment => {
        const startTime = this.parseTime(appointment.start_time);
        const endTime = this.parseTime(appointment.end_time);
        
        for (let time = startTime; time < endTime; time += 0.5) {
          const timeStr = this.formatTime(time);
          bookedSlots.add(timeStr);
        }
      });

      // Filtrar slots disponíveis
      return allSlots.filter(slot => !bookedSlots.has(slot));
    } catch (error) {
      console.error('Error getting available slots:', error);
      return this.generateDefaultSlots();
    }
  }

  /**
   * Gera slots padrão (8h às 18h, intervalos de 30 minutos)
   */
  private static generateDefaultSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }

  /**
   * Converte string de tempo para número decimal
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }

  /**
   * Converte número decimal para string de tempo
   */
  private static formatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Calcula duração entre dois horários
   */
  static calculateDuration(startTime: string, endTime: string): number {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    return Math.round((end - start) * 60); // retorna em minutos
  }

  /**
   * Calcula horário de término baseado na duração
   */
  static calculateEndTime(startTime: string, duration: number): string {
    const start = this.parseTime(startTime);
    const end = start + duration / 60;
    return this.formatTime(end);
  }

  /**
   * Valida se o agendamento pode ser editado
   */
  static canEditAppointment(appointment: { status: string; appointment_date: string; start_time: string }): { canEdit: boolean; reason?: string } {
    // Não pode editar se já foi concluído
    if (appointment.status === AppointmentStatus.COMPLETED) {
      return { canEdit: false, reason: 'Agendamento já foi concluído' };
    }

    // Não pode editar se já foi cancelado
    if (appointment.status === AppointmentStatus.CANCELLED) {
      return { canEdit: false, reason: 'Agendamento já foi cancelado' };
    }

    // Verificar se não é muito próximo (2 horas antes)
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      return { canEdit: false, reason: 'Agendamento muito próximo para ser editado' };
    }

    return { canEdit: true };
  }
}

// Função utilitária para mostrar erros de validação
export const showValidationErrors = (errors: string[], warnings: string[] = []) => {
  errors.forEach(error => toast.error(error));
  warnings.forEach(warning => toast.warning(warning));
};

// Função utilitária para validação em tempo real
export const validateAppointmentForm = async (
  data: Partial<AppointmentFormData>,
  excludeId?: string
): Promise<{ isValid: boolean; canSubmit: boolean }> => {
  const validation = AppointmentValidator.validateForm(data);
  
  if (!validation.isValid) {
    showValidationErrors(validation.errors, validation.warnings);
    return { isValid: false, canSubmit: false };
  }

  // Verificar conflitos se dados suficientes
  if (data.physiotherapist_id && data.appointment_date && data.start_time && data.end_time) {
    const conflict = await AppointmentValidator.checkConflicts(data, excludeId);
    if (conflict.hasConflict) {
      toast.error(conflict.message || 'Conflito de agendamento detectado');
      return { isValid: true, canSubmit: false };
    }
  }

  // Mostrar warnings se houver
  if (validation.warnings.length > 0) {
    showValidationErrors([], validation.warnings);
  }

  return { isValid: true, canSubmit: true };
};