-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE physiotherapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients table policies
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Patients can update their own data" ON patients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Physiotherapists can view their patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'physiotherapist'
    )
  );

CREATE POLICY "Physiotherapists can update their patients" ON patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'physiotherapist'
    )
  );

CREATE POLICY "Admins can manage all patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Physiotherapists table policies
CREATE POLICY "Physiotherapists can view their own data" ON physiotherapists
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Physiotherapists can update their own data" ON physiotherapists
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all physiotherapists" ON physiotherapists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all physiotherapists" ON physiotherapists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Appointments table policies
CREATE POLICY "Patients can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM physiotherapists pt 
      WHERE pt.id = physiotherapist_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can manage their appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM physiotherapists pt 
      WHERE pt.id = physiotherapist_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exercises table policies
CREATE POLICY "Everyone can view active exercises" ON exercises
  FOR SELECT USING (is_active = true);

CREATE POLICY "Physiotherapists can create exercises" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('physiotherapist', 'admin')
    )
  );

CREATE POLICY "Creators can update their exercises" ON exercises
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all exercises" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Treatment plans table policies
CREATE POLICY "Patients can view their treatment plans" ON treatment_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can view their treatment plans" ON treatment_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM physiotherapists pt 
      WHERE pt.id = physiotherapist_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can manage their treatment plans" ON treatment_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM physiotherapists pt 
      WHERE pt.id = physiotherapist_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all treatment plans" ON treatment_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Treatment plan exercises table policies
CREATE POLICY "Users can view treatment plan exercises" ON treatment_plan_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN patients p ON tp.patient_id = p.id
      WHERE tp.id = treatment_plan_id AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN physiotherapists pt ON tp.physiotherapist_id = pt.id
      WHERE tp.id = treatment_plan_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can manage treatment plan exercises" ON treatment_plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN physiotherapists pt ON tp.physiotherapist_id = pt.id
      WHERE tp.id = treatment_plan_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all treatment plan exercises" ON treatment_plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exercise logs table policies
CREATE POLICY "Patients can view their exercise logs" ON exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create their exercise logs" ON exercise_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can view their patients' exercise logs" ON exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN physiotherapists pt ON tp.physiotherapist_id = pt.id
      WHERE tp.id = treatment_plan_id AND pt.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all exercise logs" ON exercise_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Files table policies
CREATE POLICY "Users can view their files" ON files
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upload files" ON files
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their files" ON files
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their files" ON files
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Physiotherapists can view patient files" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN patients p ON u.id = p.user_id
      WHERE p.user_id = files.user_id 
      AND EXISTS (
        SELECT 1 FROM physiotherapists pt
        WHERE pt.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage all files" ON files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON physiotherapists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON treatment_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON treatment_plan_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exercise_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON files TO authenticated;

-- Grant basic read access to anon role for public data
GRANT SELECT ON exercises TO anon;