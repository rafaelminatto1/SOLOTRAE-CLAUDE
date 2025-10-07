-- Migration: 20240120000003_fix_auth_schema
-- Description: Fix authentication schema to work with Supabase Auth
-- Created: 2025-01-07

-- Remove password column from users table since Supabase Auth handles passwords
ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- Update the handle_new_user function to not include password
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
