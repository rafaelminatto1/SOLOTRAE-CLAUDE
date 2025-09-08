-- Migração 003: Criar índices para performance e triggers para updated_at
-- Data: 2024

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Índices para tabela patients
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

-- Índices para tabela physiotherapists
CREATE INDEX IF NOT EXISTS idx_physiotherapists_user_id ON physiotherapists(user_id);
CREATE INDEX IF NOT EXISTS idx_physiotherapists_crefito ON physiotherapists(crefito);
CREATE INDEX IF NOT EXISTS idx_physiotherapists_specialties ON physiotherapists(specialties);
CREATE INDEX IF NOT EXISTS idx_physiotherapists_created_at ON physiotherapists(created_at);

-- Índices para tabela appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_physiotherapist_id ON appointments(physiotherapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_physio_date ON appointments(physiotherapist_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date, time);

-- Índices para tabela exercises
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_is_active ON exercises(is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON exercises(created_at);

-- Índices para tabela treatment_plans
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_physiotherapist_id ON treatment_plans(physiotherapist_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(status);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_start_date ON treatment_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_end_date ON treatment_plans(end_date);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_created_at ON treatment_plans(created_at);

-- Índices para tabela treatment_plan_exercises
CREATE INDEX IF NOT EXISTS idx_treatment_plan_exercises_plan_id ON treatment_plan_exercises(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_exercises_exercise_id ON treatment_plan_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_exercises_order ON treatment_plan_exercises(order_index);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_exercises_created_at ON treatment_plan_exercises(created_at);

-- Índices para tabela exercise_logs
CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_id ON exercise_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_treatment_plan_id ON exercise_logs(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_completed_at ON exercise_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_date ON exercise_logs(patient_id, completed_at);

-- Índices para tabela notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- Índices para tabela files
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_mimetype ON files(mimetype);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);

-- =============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

-- Trigger para tabela users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela patients
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela physiotherapists
DROP TRIGGER IF EXISTS update_physiotherapists_updated_at ON physiotherapists;
CREATE TRIGGER update_physiotherapists_updated_at
    BEFORE UPDATE ON physiotherapists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela exercises
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela treatment_plans
DROP TRIGGER IF EXISTS update_treatment_plans_updated_at ON treatment_plans;
CREATE TRIGGER update_treatment_plans_updated_at
    BEFORE UPDATE ON treatment_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela treatment_plan_exercises
DROP TRIGGER IF EXISTS update_treatment_plan_exercises_updated_at ON treatment_plan_exercises;
CREATE TRIGGER update_treatment_plan_exercises_updated_at
    BEFORE UPDATE ON treatment_plan_exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela exercise_logs
DROP TRIGGER IF EXISTS update_exercise_logs_updated_at ON exercise_logs;
CREATE TRIGGER update_exercise_logs_updated_at
    BEFORE UPDATE ON exercise_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela notifications
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela files
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- Índices criados para otimizar consultas frequentes:
-- 1. Busca por email, role e status ativo em users
-- 2. Busca por pacientes por user_id e CPF
-- 3. Busca por fisioterapeutas por user_id e CREFITO
-- 4. Busca por consultas por paciente, fisioterapeuta e data
-- 5. Busca por exercícios por categoria e dificuldade
-- 6. Busca por planos de tratamento por paciente e status
-- 7. Busca por logs de exercícios por paciente e data
-- 8. Busca por notificações não lidas por usuário
-- 9. Busca por arquivos por entidade e tipo

-- Triggers criados para manter updated_at sempre atualizado automaticamente