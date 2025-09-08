-- Inserir usuário admin na tabela users
-- Este script deve ser executado após a criação do usuário no Supabase Auth

INSERT INTO users (id, email, name, password_hash, plan, usage_count, preferences)
VALUES (
  '1d27e6a2-fa19-41eb-89cd-8d6e7c861c57',
  'admin@fisioflow.com',
  'Administrador',
  'managed_by_supabase_auth',
  'pro',
  0,
  '{}'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  plan = EXCLUDED.plan,
  updated_at = NOW();

-- Verificar se o usuário foi inserido corretamente
SELECT * FROM users WHERE email = 'admin@fisioflow.com';