# 🚀 Configuração do Novo Projeto Supabase

Este guia irá te ajudar a criar um novo projeto Supabase limpo para o FisioFlow, resolvendo todos os problemas de integridade de dados.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Acesso ao dashboard do Supabase

## 🔧 Passo 1: Criar Novo Projeto no Supabase

1. **Acesse o Dashboard do Supabase**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Faça login na sua conta

2. **Criar Novo Projeto**
   - Clique em "New Project"
   - Escolha sua organização
   - Preencha os dados:
     - **Name**: `FisioFlow` (ou nome de sua preferência)
     - **Database Password**: Crie uma senha forte e **anote-a**
     - **Region**: Escolha a região mais próxima (ex: South America)
     - **Pricing Plan**: Free (ou conforme sua necessidade)
   - Clique em "Create new project"

3. **Aguardar Criação**
   - O projeto levará alguns minutos para ser criado
   - Aguarde até aparecer o dashboard do projeto

## 🔑 Passo 2: Obter Credenciais do Projeto

1. **Acessar Configurações**
   - No dashboard do projeto, vá para "Settings" → "API"

2. **Copiar Credenciais**
   - **Project URL**: `https://[seu-projeto].supabase.co`
   - **anon public**: Chave pública (para frontend)
   - **service_role**: Chave de serviço (para backend) - **MANTENHA SECRETA**

## 🔧 Passo 3: Atualizar Variáveis de Ambiente

1. **Editar arquivo .env**
   ```env
   # Supabase Configuration (NOVO PROJETO)
   SUPABASE_URL=https://[seu-projeto].supabase.co
   SUPABASE_ANON_KEY=[sua-chave-anon]
   SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role]
   
   # Outras variáveis existentes...
   ```

2. **Substituir as Credenciais**
   - Substitua `[seu-projeto]` pelo ID do seu projeto
   - Substitua `[sua-chave-anon]` pela chave anon copiada
   - Substitua `[sua-chave-service-role]` pela chave service_role copiada

## 🗄️ Passo 4: Executar Script de Configuração

1. **Executar o Script**
   ```bash
   node scripts/setup-new-supabase.js
   ```

2. **O que o Script Faz:**
   - ✅ Testa a conexão com o novo projeto
   - ✅ Aplica o schema inicial (todas as tabelas)
   - ✅ Configura políticas RLS (Row Level Security)
   - ✅ Cria índices para performance
   - ✅ Configura triggers para updated_at
   - ✅ Verifica se tudo foi criado corretamente

## 🧪 Passo 5: Testar a Aplicação

1. **Reiniciar o Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Testar Funcionalidades Básicas**
   - Acesse a aplicação
   - Teste o login/registro
   - Verifique se as páginas carregam sem erros
   - Teste criação de dados básicos

## 👤 Passo 6: Criar Usuário Admin

1. **Via Interface da Aplicação**
   - Registre-se como novo usuário
   - Use um email que você tenha acesso

2. **Promover para Admin (via Supabase Dashboard)**
   - Vá para "Table Editor" → "users"
   - Encontre seu usuário
   - Edite o campo `role` para `admin`

## 📊 Passo 7: Migrar Dados (Opcional)

Se você tem dados importantes no banco antigo:

1. **Exportar Dados do Banco Antigo**
   - Use o dashboard do Supabase antigo
   - Vá para "Table Editor"
   - Exporte dados importantes em CSV

2. **Importar no Novo Banco**
   - Use o dashboard do novo projeto
   - Importe os CSVs nas tabelas correspondentes
   - **Atenção**: Verifique se os IDs e relacionamentos estão corretos

## ✅ Verificação Final

### Checklist de Verificação:

- [ ] Novo projeto Supabase criado
- [ ] Variáveis de ambiente atualizadas
- [ ] Script de configuração executado com sucesso
- [ ] Aplicação funcionando com novo banco
- [ ] Usuário admin criado
- [ ] Funcionalidades básicas testadas
- [ ] Dados migrados (se necessário)

## 🔍 Estrutura do Novo Banco

### Tabelas Criadas:
- `users` - Usuários do sistema
- `patients` - Dados dos pacientes
- `physiotherapists` - Dados dos fisioterapeutas
- `appointments` - Agendamentos
- `exercises` - Exercícios disponíveis
- `treatment_plans` - Planos de tratamento
- `treatment_plan_exercises` - Exercícios dos planos
- `exercise_logs` - Logs de exercícios realizados
- `notifications` - Notificações do sistema
- `files` - Arquivos uploadados

### Características:
- ✅ **Sem padrões field_X** - Todos os campos têm nomes descritivos
- ✅ **RLS Configurado** - Segurança a nível de linha
- ✅ **Índices Otimizados** - Performance melhorada
- ✅ **Triggers Automáticos** - updated_at automático
- ✅ **Relacionamentos Corretos** - Foreign keys bem definidas

## 🆘 Solução de Problemas

### Erro de Conexão
- Verifique se as credenciais estão corretas no .env
- Confirme se o projeto está ativo no Supabase

### Erro de Permissão
- Verifique se está usando a service_role_key
- Confirme se as políticas RLS foram criadas

### Tabelas Não Criadas
- Execute o script novamente
- Verifique logs de erro no console

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do script
2. Consulte a documentação do Supabase
3. Verifique se todas as credenciais estão corretas

---

🎉 **Parabéns!** Seu novo projeto Supabase está configurado e pronto para uso!