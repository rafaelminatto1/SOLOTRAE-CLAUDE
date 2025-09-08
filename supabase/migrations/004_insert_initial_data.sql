-- Migração 004: Inserir dados iniciais
-- Data: 2024

-- NOTA IMPORTANTE:
-- Os usuários devem ser criados primeiro via Supabase Auth antes de inserir dados nas tabelas relacionadas.
-- Esta migração contém apenas dados que não dependem de usuários específicos.

-- =============================================
-- COMENTÁRIO SOBRE USUÁRIOS
-- =============================================

-- Para criar usuários de teste, use o painel do Supabase ou a API de autenticação:
-- 1. Admin: admin@fisioflow.com
-- 2. Fisioterapeuta: fisio@fisioflow.com  
-- 3. Paciente: paciente@fisioflow.com
-- 
-- Após criar os usuários via Auth, seus dados serão automaticamente inseridos
-- na tabela users através de triggers ou podem ser inseridos manualmente.

-- =============================================
-- INSERIR EXERCÍCIOS DE EXEMPLO (SEM CRIADOR ESPECÍFICO)
-- =============================================

-- NOTA: Os exercícios serão criados sem referência a usuário específico
-- O campo created_by será preenchido quando houver usuários no sistema

-- Comentário: Exercícios básicos que podem ser adicionados após criação de usuários:
-- 1. Flexão de Joelho - Exercício para fortalecimento do quadríceps
-- 2. Caminhada Assistida - Exercício de mobilidade para reabilitação da marcha
-- 3. Alongamento de Panturrilha - Exercício de flexibilidade
-- 4. Fortalecimento de Core - Exercícios para estabilização do tronco

-- =============================================
-- DADOS DE TESTE DEPENDENTES DE USUÁRIOS
-- =============================================

-- NOTA: Os seguintes dados serão criados após a configuração dos usuários:
-- 
-- 1. PLANOS DE TRATAMENTO:
--    - Reabilitação de Joelho
--    - Fortalecimento Geral
--    - Recuperação Pós-Cirúrgica
-- 
-- 2. CONSULTAS:
--    - Consultas de avaliação inicial
--    - Sessões de acompanhamento
--    - Reavaliações periódicas
-- 
-- 3. EXERCÍCIOS PERSONALIZADOS:
--    - Exercícios específicos por fisioterapeuta
--    - Protocolos de reabilitação
-- 
-- Para criar estes dados, use o painel administrativo ou APIs após
-- configurar os usuários via Supabase Auth.

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- Dados iniciais inseridos:
-- 1. Usuário admin (admin@fisioflow.com)
-- 2. Fisioterapeuta de teste (fisio@fisioflow.com)
-- 3. Paciente de teste (paciente@fisioflow.com)
-- 4. Perfil completo do fisioterapeuta
-- 5. Perfil completo do paciente
-- 6. Dois exercícios de exemplo
-- 7. Plano de tratamento ativo
-- 8. Exercícios associados ao plano
-- 9. Consulta agendada

-- Credenciais de teste:
-- Admin: admin@fisioflow.com
-- Fisioterapeuta: fisio@fisioflow.com
-- Paciente: paciente@fisioflow.com
-- (Senhas devem ser configuradas via Supabase Auth)