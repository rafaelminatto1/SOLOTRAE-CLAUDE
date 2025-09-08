-- Script para sincronizar dados entre auth.users e tabela users
-- e corrigir permissões das tabelas

-- 1. Inserir usuários que existem em auth.users mas não na tabela users
INSERT INTO public.users (id, email, name, password_hash, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
    'synced_from_auth' as password_hash,
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'physiotherapist' THEN 'physiotherapist'::user_role
        WHEN au.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
        ELSE 'patient'::user_role
    END as role,
    au.created_at,
    au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. Atualizar dados dos usuários existentes com informações do auth.users
UPDATE public.users 
SET 
    email = au.email,
    name = COALESCE(au.raw_user_meta_data->>'name', au.email),
    updated_at = NOW()
FROM auth.users au
WHERE public.users.id = au.id
AND (public.users.email != au.email OR public.users.name != COALESCE(au.raw_user_meta_data->>'name', au.email));

-- 3. Verificar e conceder permissões para as tabelas principais
-- Conceder permissões para a role anon (usuários não logados)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.patients TO anon;
GRANT SELECT ON public.physiotherapists TO anon;
GRANT SELECT ON public.appointments TO anon;
GRANT SELECT ON public.exercises TO anon;
GRANT SELECT ON public.treatment_plans TO anon;
GRANT SELECT ON public.treatment_plan_exercises TO anon;
GRANT SELECT ON public.exercise_logs TO anon;
GRANT SELECT ON public.notifications TO anon;
GRANT SELECT ON public.files TO anon;

-- Conceder permissões completas para a role authenticated (usuários logados)
GRANT ALL PRIVILEGES ON public.users TO authenticated;
GRANT ALL PRIVILEGES ON public.patients TO authenticated;
GRANT ALL PRIVILEGES ON public.physiotherapists TO authenticated;
GRANT ALL PRIVILEGES ON public.appointments TO authenticated;
GRANT ALL PRIVILEGES ON public.exercises TO authenticated;
GRANT ALL PRIVILEGES ON public.treatment_plans TO authenticated;
GRANT ALL PRIVILEGES ON public.treatment_plan_exercises TO authenticated;
GRANT ALL PRIVILEGES ON public.exercise_logs TO authenticated;
GRANT ALL PRIVILEGES ON public.notifications TO authenticated;
GRANT ALL PRIVILEGES ON public.files TO authenticated;

-- 4. Criar dados de teste para fisioterapeutas se não existirem
INSERT INTO public.physiotherapists (user_id, crefito, specialties, bio, experience_years)
SELECT 
    u.id,
    'CREFITO-' || SUBSTRING(u.id::text, 1, 8),
    'Fisioterapia Geral, Ortopedia',
    'Fisioterapeuta especializado em reabilitação',
    5
FROM public.users u
WHERE u.role = 'physiotherapist'
AND NOT EXISTS (SELECT 1 FROM public.physiotherapists p WHERE p.user_id = u.id);

-- 5. Criar dados de teste para pacientes se não existirem
INSERT INTO public.patients (user_id, cpf, birth_date, gender, address)
SELECT 
    u.id,
    '000.000.000-' || LPAD((ROW_NUMBER() OVER())::text, 2, '0'),
    '1990-01-01'::date,
    'M',
    'Endereço de teste'
FROM public.users u
WHERE u.role = 'patient'
AND NOT EXISTS (SELECT 1 FROM public.patients p WHERE p.user_id = u.id);

-- 6. Verificar se há usuários órfãos (na tabela users mas não em auth.users)
-- e reportar (não deletar automaticamente por segurança)
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM public.users pu
    LEFT JOIN auth.users au ON pu.id = au.id
    WHERE au.id IS NULL;
    
    IF orphan_count > 0 THEN
        RAISE NOTICE 'Encontrados % usuários órfãos na tabela users (existem em users mas não em auth.users)', orphan_count;
    END IF;
END $$;

-- 7. Criar alguns exercícios básicos se não existirem
INSERT INTO public.exercises (name, description, category, difficulty, duration, repetitions, sets, instructions)
SELECT * FROM (
    VALUES 
    ('Alongamento de Pescoço', 'Exercício básico para alongar músculos do pescoço', 'Alongamento', 'beginner', 30, 1, 3, 'Incline a cabeça suavemente para cada lado'),
    ('Flexão de Braço', 'Fortalecimento dos músculos peitorais e tríceps', 'Fortalecimento', 'intermediate', 0, 10, 3, 'Mantenha o corpo alinhado durante o movimento'),
    ('Caminhada', 'Exercício cardiovascular básico', 'Cardio', 'beginner', 1800, 1, 1, 'Mantenha um ritmo constante e confortável')
) AS v(name, description, category, difficulty, duration, repetitions, sets, instructions)
WHERE NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = v.name);

-- 8. Mostrar estatísticas finais
DO $$
DECLARE
    user_count INTEGER;
    patient_count INTEGER;
    physio_count INTEGER;
    exercise_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO patient_count FROM public.patients;
    SELECT COUNT(*) INTO physio_count FROM public.physiotherapists;
    SELECT COUNT(*) INTO exercise_count FROM public.exercises;
    
    RAISE NOTICE 'Sincronização concluída:';
    RAISE NOTICE '- Total de usuários: %', user_count;
    RAISE NOTICE '- Total de pacientes: %', patient_count;
    RAISE NOTICE '- Total de fisioterapeutas: %', physio_count;
    RAISE NOTICE '- Total de exercícios: %', exercise_count;
END $$;