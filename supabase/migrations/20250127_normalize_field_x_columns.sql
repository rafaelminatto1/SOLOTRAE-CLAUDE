-- Migração para normalizar campos field_X para nomes descritivos
-- Gerado automaticamente em 2025-01-27T19:04:16.294Z

-- Normalização da tabela users
ALTER TABLE users RENAME COLUMN field_0 TO email;
ALTER TABLE users RENAME COLUMN field_1 TO password_hash;
ALTER TABLE users RENAME COLUMN field_2 TO full_name;

-- Normalização da tabela patients
ALTER TABLE patients RENAME COLUMN field_1 TO full_name;
ALTER TABLE patients RENAME COLUMN field_2 TO phone_number;
ALTER TABLE patients RENAME COLUMN field_3 TO emergency_contact_name;

-- Normalização da tabela physiotherapists
ALTER TABLE physiotherapists RENAME COLUMN field_1 TO specialization;
ALTER TABLE physiotherapists RENAME COLUMN field_2 TO crefito_number;

-- Normalização da tabela exercises
ALTER TABLE exercises RENAME COLUMN field_1 TO exercise_name;
ALTER TABLE exercises RENAME COLUMN field_2 TO description;
ALTER TABLE exercises RENAME COLUMN field_3 TO category;

-- Normalização da tabela appointments
ALTER TABLE appointments RENAME COLUMN field_1 TO appointment_date;
ALTER TABLE appointments RENAME COLUMN field_2 TO status;

-- Normalização da tabela treatment_plans
ALTER TABLE treatment_plans RENAME COLUMN field_1 TO plan_title;
ALTER TABLE treatment_plans RENAME COLUMN field_2 TO description;
ALTER TABLE treatment_plans RENAME COLUMN field_3 TO start_date;

-- Normalização da tabela exercise_logs
ALTER TABLE exercise_logs RENAME COLUMN field_1 TO sets_completed;
ALTER TABLE exercise_logs RENAME COLUMN field_2 TO repetitions_completed;
ALTER TABLE exercise_logs RENAME COLUMN field_3 TO duration_minutes;

-- Comentários para documentação
COMMENT ON COLUMN users.email IS 'Email do usuário (anteriormente field_0)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha (anteriormente field_1)';
COMMENT ON COLUMN users.full_name IS 'Nome completo (anteriormente field_2)';

COMMENT ON COLUMN patients.full_name IS 'Nome completo do paciente (anteriormente field_1)';
COMMENT ON COLUMN patients.phone_number IS 'Número de telefone (anteriormente field_2)';
COMMENT ON COLUMN patients.emergency_contact_name IS 'Nome do contato de emergência (anteriormente field_3)';

COMMENT ON COLUMN physiotherapists.specialization IS 'Especialização do fisioterapeuta (anteriormente field_1)';
COMMENT ON COLUMN physiotherapists.crefito_number IS 'Número do CREFITO (anteriormente field_2)';

COMMENT ON COLUMN exercises.exercise_name IS 'Nome do exercício (anteriormente field_1)';
COMMENT ON COLUMN exercises.description IS 'Descrição do exercício (anteriormente field_2)';
COMMENT ON COLUMN exercises.category IS 'Categoria do exercício (anteriormente field_3)';

COMMENT ON COLUMN appointments.appointment_date IS 'Data do agendamento (anteriormente field_1)';
COMMENT ON COLUMN appointments.status IS 'Status do agendamento (anteriormente field_2)';

COMMENT ON COLUMN treatment_plans.plan_title IS 'Título do plano de tratamento (anteriormente field_1)';
COMMENT ON COLUMN treatment_plans.description IS 'Descrição do plano (anteriormente field_2)';
COMMENT ON COLUMN treatment_plans.start_date IS 'Data de início (anteriormente field_3)';

COMMENT ON COLUMN exercise_logs.sets_completed IS 'Séries completadas (anteriormente field_1)';
COMMENT ON COLUMN exercise_logs.repetitions_completed IS 'Repetições completadas (anteriormente field_2)';
COMMENT ON COLUMN exercise_logs.duration_minutes IS 'Duração em minutos (anteriormente field_3)';