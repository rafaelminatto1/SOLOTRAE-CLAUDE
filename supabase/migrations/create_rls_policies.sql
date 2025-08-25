-- Enable RLS on all tables (if not already enabled)
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
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients table policies
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Physiotherapists can view their patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM physiotherapists p 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow patient registration" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Physiotherapists table policies
CREATE POLICY "Physiotherapists can view their own data" ON physiotherapists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Physiotherapists can update their own data" ON physiotherapists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow physiotherapist registration" ON physiotherapists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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
      SELECT 1 FROM physiotherapists p 
      WHERE p.id = physiotherapist_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can manage appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM physiotherapists p 
      WHERE p.id = physiotherapist_id AND p.user_id = auth.uid()
    )
  );

-- Exercises table policies (public read, physiotherapists can manage)
CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Physiotherapists can manage exercises" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM physiotherapists p 
      WHERE p.user_id = auth.uid()
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

CREATE POLICY "Physiotherapists can manage treatment plans" ON treatment_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM physiotherapists p 
      WHERE p.id = physiotherapist_id AND p.user_id = auth.uid()
    )
  );

-- Treatment plan exercises table policies
CREATE POLICY "Users can view treatment plan exercises" ON treatment_plan_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN patients p ON tp.patient_id = p.id
      WHERE tp.id = treatment_plan_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN physiotherapists ph ON tp.physiotherapist_id = ph.id
      WHERE tp.id = treatment_plan_id AND ph.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can manage treatment plan exercises" ON treatment_plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM treatment_plans tp
      JOIN physiotherapists ph ON tp.physiotherapist_id = ph.id
      WHERE tp.id = treatment_plan_id AND ph.user_id = auth.uid()
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

CREATE POLICY "Physiotherapists can view patient exercise logs" ON exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      JOIN appointments a ON p.id = a.patient_id
      JOIN physiotherapists ph ON a.physiotherapist_id = ph.id
      WHERE p.id = patient_id AND ph.user_id = auth.uid()
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Files table policies
CREATE POLICY "Users can view their files" ON files
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload files" ON files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their files" ON files
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Messages table policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Projects table policies (if needed for collaboration)
CREATE POLICY "Users can view their projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaborations c 
      WHERE c.project_id = id AND c.user_id = auth.uid()
    )
  );

-- Collaborations table policies
CREATE POLICY "Users can view their collaborations" ON collaborations
  FOR SELECT USING (auth.uid() = user_id);

-- Data uploads table policies
CREATE POLICY "Users can view their data uploads" ON data_uploads
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can create data uploads" ON data_uploads
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Artifacts table policies
CREATE POLICY "Users can view artifacts from their projects" ON artifacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaborations c 
      WHERE c.project_id = project_id AND c.user_id = auth.uid()
    )
  );

-- Artifact versions table policies
CREATE POLICY "Users can view artifact versions from their projects" ON artifact_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM artifacts a
      JOIN collaborations c ON a.project_id = c.project_id
      WHERE a.id = artifact_id AND c.user_id = auth.uid()
    )
  );