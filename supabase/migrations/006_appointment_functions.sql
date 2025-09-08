-- Função para buscar slots disponíveis de um fisioterapeuta
CREATE OR REPLACE FUNCTION get_available_slots(
  therapist_id UUID,
  date DATE,
  duration INTEGER DEFAULT 30
)
RETURNS TABLE(
  slot_time TIME,
  is_available BOOLEAN,
  conflict_reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  start_time TIME := '08:00';
  end_time TIME := '18:00';
  lunch_start TIME := '12:00';
  lunch_end TIME := '13:00';
  current_slot TIME;
  slot_end TIME;
  existing_appointment RECORD;
BEGIN
  -- Gerar slots de horário baseado na duração
  current_slot := start_time;
  
  WHILE current_slot < end_time LOOP
    slot_end := current_slot + (duration || ' minutes')::INTERVAL;
    
    -- Verificar se não é horário de almoço
    IF NOT (current_slot >= lunch_start AND current_slot < lunch_end) THEN
      -- Verificar se há conflito com agendamentos existentes
      SELECT * INTO existing_appointment
      FROM appointments a
      WHERE a.therapist_id = get_available_slots.therapist_id
        AND a.date = get_available_slots.date
        AND a.status NOT IN ('cancelled')
        AND (
          (a.time <= current_slot AND (a.time + (a.duration || ' minutes')::INTERVAL) > current_slot)
          OR
          (a.time < slot_end AND a.time >= current_slot)
        );
      
      IF existing_appointment.id IS NULL THEN
        -- Slot disponível
        RETURN QUERY SELECT current_slot, true, NULL::TEXT;
      ELSE
        -- Slot ocupado
        RETURN QUERY SELECT current_slot, false, 'Horário já ocupado'::TEXT;
      END IF;
    ELSE
      -- Horário de almoço
      RETURN QUERY SELECT current_slot, false, 'Horário de almoço'::TEXT;
    END IF;
    
    current_slot := current_slot + (duration || ' minutes')::INTERVAL;
  END LOOP;
END;
$$;

-- Função para validar conflitos de agendamento
CREATE OR REPLACE FUNCTION validate_appointment_conflict(
  appointment_id UUID DEFAULT NULL,
  therapist_id UUID,
  patient_id UUID,
  appointment_date DATE,
  appointment_time TIME,
  duration INTEGER DEFAULT 30
)
RETURNS TABLE(
  has_conflict BOOLEAN,
  conflict_type TEXT,
  conflict_details JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  therapist_conflict RECORD;
  patient_conflict RECORD;
  slot_end TIME;
BEGIN
  slot_end := appointment_time + (duration || ' minutes')::INTERVAL;
  
  -- Verificar conflito de fisioterapeuta
  SELECT * INTO therapist_conflict
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  WHERE a.therapist_id = validate_appointment_conflict.therapist_id
    AND a.date = appointment_date
    AND a.status NOT IN ('cancelled')
    AND (appointment_id IS NULL OR a.id != appointment_id)
    AND (
      (a.time <= appointment_time AND (a.time + (a.duration || ' minutes')::INTERVAL) > appointment_time)
      OR
      (a.time < slot_end AND a.time >= appointment_time)
    )
  LIMIT 1;
  
  IF therapist_conflict.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      true,
      'therapist_conflict'::TEXT,
      jsonb_build_object(
        'appointment_id', therapist_conflict.id,
        'patient_name', (SELECT name FROM patients WHERE id = therapist_conflict.patient_id),
        'time', therapist_conflict.time,
        'duration', therapist_conflict.duration
      );
    RETURN;
  END IF;
  
  -- Verificar conflito de paciente (múltiplos agendamentos no mesmo dia)
  SELECT * INTO patient_conflict
  FROM appointments a
  WHERE a.patient_id = validate_appointment_conflict.patient_id
    AND a.date = appointment_date
    AND a.status NOT IN ('cancelled')
    AND (appointment_id IS NULL OR a.id != appointment_id)
  LIMIT 1;
  
  IF patient_conflict.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      true,
      'patient_conflict'::TEXT,
      jsonb_build_object(
        'appointment_id', patient_conflict.id,
        'therapist_name', (SELECT name FROM therapists WHERE id = patient_conflict.therapist_id),
        'time', patient_conflict.time,
        'duration', patient_conflict.duration
      );
    RETURN;
  END IF;
  
  -- Nenhum conflito encontrado
  RETURN QUERY SELECT false, NULL::TEXT, NULL::JSONB;
END;
$$;

-- Função para gerar agendamentos recorrentes
CREATE OR REPLACE FUNCTION create_recurring_appointments(
  base_appointment JSONB,
  recurrence_type TEXT, -- 'weekly', 'biweekly'
  recurrence_count INTEGER DEFAULT NULL,
  recurrence_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  appointment_data JSONB,
  appointment_date DATE,
  has_conflict BOOLEAN,
  conflict_details JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_date DATE;
  interval_days INTEGER;
  max_occurrences INTEGER := 52; -- Máximo de 1 ano
  occurrence_count INTEGER := 0;
  conflict_result RECORD;
BEGIN
  -- Definir intervalo baseado no tipo de recorrência
  CASE recurrence_type
    WHEN 'weekly' THEN interval_days := 7;
    WHEN 'biweekly' THEN interval_days := 14;
    ELSE 
      RAISE EXCEPTION 'Tipo de recorrência inválido: %', recurrence_type;
  END CASE;
  
  -- Data inicial
  current_date := (base_appointment->>'date')::DATE;
  
  -- Gerar agendamentos recorrentes
  WHILE (
    (recurrence_count IS NULL OR occurrence_count < recurrence_count) AND
    (recurrence_end_date IS NULL OR current_date <= recurrence_end_date) AND
    occurrence_count < max_occurrences
  ) LOOP
    -- Verificar conflitos para esta data
    SELECT * INTO conflict_result
    FROM validate_appointment_conflict(
      NULL,
      (base_appointment->>'therapist_id')::UUID,
      (base_appointment->>'patient_id')::UUID,
      current_date,
      (base_appointment->>'time')::TIME,
      (base_appointment->>'duration')::INTEGER
    );
    
    -- Retornar dados do agendamento com informações de conflito
    RETURN QUERY SELECT 
      jsonb_set(base_appointment, '{date}', to_jsonb(current_date::TEXT)),
      current_date,
      conflict_result.has_conflict,
      conflict_result.conflict_details;
    
    -- Próxima data
    current_date := current_date + (interval_days || ' days')::INTERVAL;
    occurrence_count := occurrence_count + 1;
  END LOOP;
END;
$$;

-- Função para verificar limite de pacientes por dia
CREATE OR REPLACE FUNCTION check_daily_patient_limit(
  therapist_id UUID,
  appointment_date DATE,
  max_patients INTEGER DEFAULT 12
)
RETURNS TABLE(
  within_limit BOOLEAN,
  current_count INTEGER,
  max_limit INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  patient_count INTEGER;
BEGIN
  -- Contar agendamentos do fisioterapeuta na data
  SELECT COUNT(*) INTO patient_count
  FROM appointments
  WHERE appointments.therapist_id = check_daily_patient_limit.therapist_id
    AND date = appointment_date
    AND status NOT IN ('cancelled');
  
  RETURN QUERY SELECT 
    patient_count < max_patients,
    patient_count,
    max_patients;
END;
$$;

-- Função para verificar regra de cancelamento (24h)
CREATE OR REPLACE FUNCTION can_cancel_appointment(
  appointment_id UUID
)
RETURNS TABLE(
  can_cancel BOOLEAN,
  reason TEXT,
  hours_until_appointment INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  appointment_datetime TIMESTAMP;
  hours_diff INTEGER;
BEGIN
  -- Buscar data e hora do agendamento
  SELECT (date + time) INTO appointment_datetime
  FROM appointments
  WHERE id = appointment_id;
  
  IF appointment_datetime IS NULL THEN
    RETURN QUERY SELECT false, 'Agendamento não encontrado'::TEXT, 0;
    RETURN;
  END IF;
  
  -- Calcular diferença em horas
  hours_diff := EXTRACT(EPOCH FROM (appointment_datetime - NOW())) / 3600;
  
  IF hours_diff >= 24 THEN
    RETURN QUERY SELECT true, 'Cancelamento permitido'::TEXT, hours_diff;
  ELSE
    RETURN QUERY SELECT false, 'Cancelamento deve ser feito com pelo menos 24h de antecedência'::TEXT, hours_diff;
  END IF;
END;
$$;

-- Função para buscar próximos agendamentos
CREATE OR REPLACE FUNCTION get_upcoming_appointments(
  days_ahead INTEGER DEFAULT 7,
  therapist_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  patient_name TEXT,
  therapist_name TEXT,
  date DATE,
  time TIME,
  duration INTEGER,
  type TEXT,
  status TEXT,
  phone TEXT,
  needs_confirmation BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    p.name as patient_name,
    t.name as therapist_name,
    a.date,
    a.time,
    a.duration,
    a.type,
    a.status,
    p.phone,
    (a.status = 'scheduled' AND a.date <= CURRENT_DATE + 1) as needs_confirmation
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN therapists t ON a.therapist_id = t.id
  WHERE a.date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
    AND a.status NOT IN ('cancelled')
    AND (get_upcoming_appointments.therapist_id IS NULL OR a.therapist_id = get_upcoming_appointments.therapist_id)
  ORDER BY a.date, a.time;
END;
$$;

-- Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION get_available_slots TO authenticated, anon;
GRANT EXECUTE ON FUNCTION validate_appointment_conflict TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_recurring_appointments TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_daily_patient_limit TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_cancel_appointment TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_upcoming_appointments TO authenticated, anon;