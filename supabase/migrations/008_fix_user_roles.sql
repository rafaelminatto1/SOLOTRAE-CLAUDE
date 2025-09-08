-- Script para corrigir as roles dos usuários baseado nos metadados do auth.users

-- 1. Atualizar role do admin
UPDATE public.users 
SET role = 'admin'::user_role,
    name = 'Administrador',
    updated_at = NOW()
WHERE email = 'admin@fisioflow.com';

-- 2. Atualizar role do fisioterapeuta
UPDATE public.users 
SET role = 'physiotherapist'::user_role,
    name = 'Dr. Fisioterapeuta',
    updated_at = NOW()
WHERE email = 'fisio@fisioflow.com';

-- 3. Atualizar role do paciente (já está correto, mas vamos garantir o nome)
UPDATE public.users 
SET role = 'patient'::user_role,
    name = 'Paciente Teste',
    updated_at = NOW()
WHERE email = 'paciente@fisioflow.com';

-- 4. Remover usuários órfãos (que existem na tabela users mas não em auth.users)
-- Isso é seguro porque esses usuários não conseguem fazer login mesmo
DELETE FROM public.users 
WHERE id NOT IN (
    SELECT id FROM auth.users
);

-- 5. Atualizar metadados no auth.users para manter consistência
-- Nota: Isso requer service role, então vamos fazer via função
CREATE OR REPLACE FUNCTION update_auth_user_metadata()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Esta função será chamada pelo script JavaScript com service role
    -- Aqui apenas criamos a estrutura
    RAISE NOTICE 'Função criada para atualizar metadados';
END;
$$;

-- 6. Criar dados complementares para fisioterapeuta se não existir
INSERT INTO public.physiotherapists (user_id, crefito, specialties, bio, experience_years)
SELECT 
    u.id,
    'CREFITO-12345',
    'Fisioterapia Ortopédica, Neurológica',
    'Fisioterapeuta especializado em reabilitação ortopédica e neurológica com mais de 10 anos de experiência.',
    10
FROM public.users u
WHERE u.email = 'fisio@fisioflow.com'
AND NOT EXISTS (SELECT 1 FROM public.physiotherapists p WHERE p.user_id = u.id);

-- 7. Criar dados complementares para paciente se não existir
INSERT INTO public.patients (user_id, cpf, birth_date, gender, address)
SELECT 
    u.id,
    '123.456.789-00',
    '1985-06-15'::date,
    'M',
    'Rua das Flores, 123 - Centro - São Paulo/SP'
FROM public.users u
WHERE u.email = 'paciente@fisioflow.com'
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- 8. Verificar e reportar o resultado
DO $$
DECLARE
    admin_count INTEGER;
    physio_count INTEGER;
    patient_count INTEGER;
    total_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.users WHERE role = 'admin';
    SELECT COUNT(*) INTO physio_count FROM public.users WHERE role = 'physiotherapist';
    SELECT COUNT(*) INTO patient_count FROM public.users WHERE role = 'patient';
    SELECT COUNT(*) INTO total_users FROM public.users;
    
    RAISE NOTICE 'Correção de roles concluída:';
    RAISE NOTICE '- Administradores: %', admin_count;
    RAISE NOTICE '- Fisioterapeutas: %', physio_count;
    RAISE NOTICE '- Pacientes: %', patient_count;
    RAISE NOTICE '- Total de usuários: %', total_users;
END $$;