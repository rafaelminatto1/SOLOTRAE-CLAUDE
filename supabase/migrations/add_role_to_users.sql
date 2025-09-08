-- Criar um tipo enum para os roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'patient', 'secretary', 'partner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna role à tabela users se ela não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'patient'::user_role;

-- Criar usuário admin se não existir
INSERT INTO users (id, email, name, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'admin@fisioflow.com',
    'Administrador',
    'admin'::user_role,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@fisioflow.com'
);

-- Verificar se o usuário foi criado
SELECT id, email, name, role FROM users WHERE email = 'admin@fisioflow.com';