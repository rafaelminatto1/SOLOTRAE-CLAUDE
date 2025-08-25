-- Migration: 002_rls_policies
-- Description: Create Row Level Security policies for FisioFlow
-- Created: 2024-01-20

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is physiotherapist
CREATE OR REPLACE FUNCTION public.is_physiotherapist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'physiotherapist' FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is patient
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'patient' FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());

-- Patients table policies
CREATE POLICY "Patients can view their own data" ON public.patients
  FOR SELECT USING (
    user_id = public.get_current_user_id() OR 
    public.is_admin() OR 
    (public.is_physiotherapist() AND id IN (
      SELECT patient_id FROM public.appointments 
      WHERE physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
    ))
  );

CREATE POLICY "Patients can update their own data" ON public.patients
  FOR UPDATE USING (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Admins and physiotherapists can insert patients" ON public.patients
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_physiotherapist());

CREATE POLICY "Admins can delete patients" ON public.patients
  FOR DELETE USING (public.is_admin());

-- Physiotherapists table policies
CREATE POLICY "Physiotherapists can view their own data" ON public.physiotherapists
  FOR SELECT USING (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Physiotherapists can update their own data" ON public.physiotherapists
  FOR UPDATE USING (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Admins can insert physiotherapists" ON public.physiotherapists
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete physiotherapists" ON public.physiotherapists
  FOR DELETE USING (public.is_admin());

-- Appointments table policies
CREATE POLICY "Users can view their appointments" ON public.appointments
  FOR SELECT USING (
    public.is_admin() OR
    patient_id = (SELECT id FROM public.patients WHERE user_id = public.get_current_user_id()) OR
    physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
  );

CREATE POLICY "Physiotherapists and admins can manage appointments" ON public.appointments
  FOR ALL USING (
    public.is_admin() OR
    physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
  );

-- Exercises table policies
CREATE POLICY "Everyone can view active exercises" ON public.exercises
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Physiotherapists and admins can manage exercises" ON public.exercises
  FOR ALL USING (public.is_admin() OR public.is_physiotherapist());

-- Treatment plans table policies
CREATE POLICY "Users can view their treatment plans" ON public.treatment_plans
  FOR SELECT USING (
    public.is_admin() OR
    patient_id = (SELECT id FROM public.patients WHERE user_id = public.get_current_user_id()) OR
    physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
  );

CREATE POLICY "Physiotherapists can manage their treatment plans" ON public.treatment_plans
  FOR ALL USING (
    public.is_admin() OR
    physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
  );

-- Treatment plan exercises table policies
CREATE POLICY "Users can view treatment plan exercises" ON public.treatment_plan_exercises
  FOR SELECT USING (
    public.is_admin() OR
    treatment_plan_id IN (
      SELECT id FROM public.treatment_plans 
      WHERE patient_id = (SELECT id FROM public.patients WHERE user_id = public.get_current_user_id()) OR
            physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
    )
  );

CREATE POLICY "Physiotherapists can manage treatment plan exercises" ON public.treatment_plan_exercises
  FOR ALL USING (
    public.is_admin() OR
    treatment_plan_id IN (
      SELECT id FROM public.treatment_plans 
      WHERE physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
    )
  );

-- Exercise logs table policies
CREATE POLICY "Users can view their exercise logs" ON public.exercise_logs
  FOR SELECT USING (
    public.is_admin() OR
    patient_id = (SELECT id FROM public.patients WHERE user_id = public.get_current_user_id()) OR
    patient_id IN (
      SELECT patient_id FROM public.appointments 
      WHERE physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
    )
  );

CREATE POLICY "Patients can insert their exercise logs" ON public.exercise_logs
  FOR INSERT WITH CHECK (
    patient_id = (SELECT id FROM public.patients WHERE user_id = public.get_current_user_id())
  );

CREATE POLICY "Patients and physiotherapists can update exercise logs" ON public.exercise_logs
  FOR UPDATE USING (
    public.is_admin() OR
    patient_id = (SELECT id FROM public.patients WHERE user_id = public.get_current_user_id()) OR
    patient_id IN (
      SELECT patient_id FROM public.appointments 
      WHERE physiotherapist_id = (SELECT id FROM public.physiotherapists WHERE user_id = public.get_current_user_id())
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their notifications" ON public.notifications
  FOR DELETE USING (user_id = public.get_current_user_id() OR public.is_admin());

-- Files table policies
CREATE POLICY "Users can view their files" ON public.files
  FOR SELECT USING (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (user_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Users can delete their files" ON public.files
  FOR DELETE USING (user_id = public.get_current_user_id() OR public.is_admin());

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for registration)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.users TO anon;