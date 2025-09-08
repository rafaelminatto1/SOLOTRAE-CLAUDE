-- Verificar se existe usuário admin na tabela users
SELECT * FROM users WHERE email = 'admin@fisioflow.com';

-- Verificar todos os usuários
SELECT id, email, name, created_at FROM users LIMIT 10;

-- Verificar se a coluna role existe na tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';