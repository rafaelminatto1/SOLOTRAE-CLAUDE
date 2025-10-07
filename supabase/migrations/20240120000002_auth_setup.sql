-- Migration: 20240120000002_auth_setup
-- Description: Configure authentication and user management
-- Created: 2024-01-20

-- Note: auth.users table is managed by Supabase Auth

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  phone TEXT,
  avatar TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.phone,
    u.avatar,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id UUID,
  user_name TEXT,
  user_phone TEXT,
  user_avatar TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  phone TEXT,
  avatar TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  UPDATE public.users
  SET 
    name = COALESCE(user_name, name),
    phone = COALESCE(user_phone, phone),
    avatar = COALESCE(user_avatar, avatar),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.phone,
    u.avatar,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is physiotherapist
CREATE OR REPLACE FUNCTION public.is_physiotherapist(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'physiotherapist') 
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies for patients table
DROP POLICY IF EXISTS "Patients can view own data" ON public.patients;
DROP POLICY IF EXISTS "Patients can update own data" ON public.patients;

CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own data" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Physiotherapists can view patient data" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'physiotherapist')
    )
  );

-- Update policies for physiotherapists table
DROP POLICY IF EXISTS "Physiotherapists can view own data" ON public.physiotherapists;
DROP POLICY IF EXISTS "Physiotherapists can update own data" ON public.physiotherapists;

CREATE POLICY "Physiotherapists can view own data" ON public.physiotherapists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Physiotherapists can update own data" ON public.physiotherapists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all physiotherapists" ON public.physiotherapists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update policies for appointments
DROP POLICY IF EXISTS "Users can view related appointments" ON public.appointments;

CREATE POLICY "Users can view related appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = appointments.patient_id 
      AND patients.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.physiotherapists 
      WHERE physiotherapists.id = appointments.physiotherapist_id 
      AND physiotherapists.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Physiotherapists can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'physiotherapist')
    )
  );

CREATE POLICY "Physiotherapists can update appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.physiotherapists 
      WHERE physiotherapists.id = appointments.physiotherapist_id 
      AND physiotherapists.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update policies for treatment plans
DROP POLICY IF EXISTS "Users can view related treatment plans" ON public.treatment_plans;

CREATE POLICY "Users can view related treatment plans" ON public.treatment_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = treatment_plans.patient_id 
      AND patients.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.physiotherapists 
      WHERE physiotherapists.id = treatment_plans.physiotherapist_id 
      AND physiotherapists.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update policies for exercise logs
DROP POLICY IF EXISTS "Patients can view own exercise logs" ON public.exercise_logs;

CREATE POLICY "Patients can view own exercise logs" ON public.exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = exercise_logs.patient_id 
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can view patient exercise logs" ON public.exercise_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'physiotherapist')
    )
  );

-- Update policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Update policies for files
DROP POLICY IF EXISTS "Users can view own files" ON public.files;

CREATE POLICY "Users can view own files" ON public.files
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own files" ON public.files
  FOR DELETE USING (auth.uid() = uploaded_by);
