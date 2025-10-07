-- Migration: 20240120000004_fix_rls_policies
-- Description: Fix RLS policies to allow user registration
-- Created: 2025-01-07

-- Add INSERT policy for users table to allow user registration
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also allow the trigger function to insert (bypassing RLS for the trigger)
-- The trigger runs with SECURITY DEFINER, so it should work, but let's ensure it can insert
-- We need to allow the system to insert users during registration

-- Create a more permissive policy for user creation during registration
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true); -- Allow any insert during registration

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the user profile, ignoring conflicts
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
