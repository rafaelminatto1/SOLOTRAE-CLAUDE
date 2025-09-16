# 🚀 GUIA DE DEPLOY - FISIOFLOW
## Supabase + Vercel

### 📋 **PRÉ-REQUISITOS**

✅ **Contas necessárias:**
- [x] Conta no Supabase (https://supabase.com)
- [x] Conta no Vercel (https://vercel.com)
- [x] Node.js 18+ instalado
- [x] Git configurado

### 🔧 **PASSO 1: CONFIGURAR SUPABASE**

#### 1.1 Criar Projeto no Supabase
```bash
# Acesse: https://supabase.com/dashboard
# Clique em "New Project"
# Nome: fisioflow
# Senha do banco: escolha uma senha forte
# Região: escolha a mais próxima (ex: South America)
```

#### 1.2 Obter Configurações
No painel do Supabase:
- Vá em **Settings** → **API**
- Copie:
  - **Project URL** (ex: https://xxxxx.supabase.co)
  - **anon public** key
  - **service_role** key

#### 1.3 Configurar Variáveis de Ambiente
```bash
# Editar arquivo .env
nano .env

# Adicionar:
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 🔧 **PASSO 2: CONFIGURAR VERCEL**

#### 2.1 Fazer Login
```bash
vercel login
```

#### 2.2 Criar Projeto
```bash
vercel
# Escolha:
# - Set up and deploy? Y
# - Which scope? (sua conta)
# - Link to existing project? N
# - What's your project's name? fisioflow
# - In which directory is your code located? ./
```

### 🔧 **PASSO 3: CONFIGURAR BANCO DE DADOS**

#### 3.1 Executar Migrações
```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
npx supabase login

# Linkar projeto
npx supabase link --project-ref SEU_PROJECT_ID

# Aplicar migrações
npx supabase db push
```

#### 3.2 Verificar Tabelas
No painel do Supabase:
- Vá em **Table Editor**
- Verifique se as tabelas foram criadas:
  - users
  - patients
  - appointments
  - exercises
  - payments
  - ai_consultations
  - whatsapp_messages
  - settings

### 🔧 **PASSO 4: CONFIGURAR API KEYS**

#### 4.1 No Vercel Dashboard
Acesse: https://vercel.com/dashboard/fisioflow/settings/environment-variables

Adicione as variáveis:
```
SUPABASE_URL = https://seu-projeto.supabase.co
SUPABASE_ANON_KEY = sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY = sua-chave-service-role
OPENAI_API_KEY = sk-sua-chave-openai
TWILIO_ACCOUNT_SID = sua-account-sid
TWILIO_AUTH_TOKEN = seu-auth-token
MERCADOPAGO_ACCESS_TOKEN = seu-token-mp
STRIPE_SECRET_KEY = sk_sua-chave-stripe
```

### 🔧 **PASSO 5: DEPLOY AUTOMÁTICO**

#### 5.1 Executar Script de Deploy
```bash
./deploy.sh
```

#### 5.2 Deploy Manual (alternativo)
```bash
# Build do frontend
npm run build

# Deploy no Vercel
vercel --prod

# Verificar status
vercel ls
```

### 🔧 **PASSO 6: CONFIGURAR FUNCIONALIDADES**

#### 6.1 WhatsApp Business API
1. Acesse: https://console.twilio.com
2. Crie um número WhatsApp Business
3. Configure webhook: `https://seu-app.vercel.app/api/integrations/webhook/whatsapp`

#### 6.2 Pagamentos
1. **Mercado Pago:**
   - Acesse: https://www.mercadopago.com.br/developers
   - Crie aplicação
   - Obtenha Access Token

2. **Stripe:**
   - Acesse: https://dashboard.stripe.com
   - Obtenha chaves de API

#### 6.3 OpenAI
1. Acesse: https://platform.openai.com
2. Crie API Key
3. Configure no Vercel

### 🔧 **PASSO 7: TESTAR SISTEMA**

#### 7.1 URLs de Teste
```
Frontend: https://fisioflow.vercel.app
API: https://fisioflow.vercel.app/api
Health: https://fisioflow.vercel.app/api/health
```

#### 7.2 Testes Básicos
```bash
# Testar API
curl https://fisioflow.vercel.app/api/health

# Testar IA
curl -X POST https://fisioflow.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Como tratar lombalgia?"}'

# Testar Pagamentos
curl -X POST https://fisioflow.vercel.app/api/payments/pix \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "123", "amount": 100}'
```

### 🔧 **PASSO 8: CONFIGURAR DOMÍNIO (OPCIONAL)**

#### 8.1 No Vercel
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

#### 8.2 Atualizar Supabase
1. Vá em **Authentication** → **URL Configuration**
2. Adicione seu domínio em **Site URL**
3. Adicione em **Redirect URLs**

### 📊 **MONITORAMENTO**

#### Supabase Dashboard
- **Database:** https://supabase.com/dashboard/project/SEU_ID/editor
- **Auth:** https://supabase.com/dashboard/project/SEU_ID/auth/users
- **API:** https://supabase.com/dashboard/project/SEU_ID/api

#### Vercel Dashboard
- **Deployments:** https://vercel.com/dashboard/fisioflow
- **Analytics:** https://vercel.com/dashboard/fisioflow/analytics
- **Functions:** https://vercel.com/dashboard/fisioflow/functions

### 🆘 **TROUBLESHOOTING**

#### Problemas Comuns

**1. Erro de CORS**
```bash
# Verificar configuração CORS no backend
# Adicionar domínio do Vercel em CORS_ORIGINS
```

**2. Erro de Banco de Dados**
```bash
# Verificar se migrações foram aplicadas
npx supabase db push

# Verificar conexão
npx supabase db ping
```

**3. Erro de Deploy**
```bash
# Verificar logs
vercel logs

# Rebuild
vercel --prod --force
```

**4. Erro de API Keys**
```bash
# Verificar se todas as variáveis estão configuradas
vercel env ls
```

### 💰 **CUSTOS ESTIMADOS**

#### Supabase
- **Free Tier:** 500MB database, 50MB storage
- **Pro:** $25/mês (8GB database, 100GB storage)

#### Vercel
- **Hobby:** Gratuito (100GB bandwidth)
- **Pro:** $20/mês (1TB bandwidth)

#### APIs Externas
- **OpenAI:** $5-50/mês (dependendo do uso)
- **Twilio:** $0.005/mensagem WhatsApp
- **Mercado Pago:** 3.99% por transação
- **Stripe:** 2.9% + $0.30 por transação

### 🎯 **CHECKLIST FINAL**

- [ ] Projeto criado no Supabase
- [ ] Projeto criado no Vercel
- [ ] Banco de dados configurado
- [ ] Migrações aplicadas
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Testes básicos funcionando
- [ ] API keys configuradas
- [ ] WhatsApp funcionando
- [ ] Pagamentos funcionando
- [ ] IA funcionando
- [ ] Domínio configurado (opcional)

---

## 🎉 **PARABÉNS!**

Seu **FisioFlow** está no ar e funcionando! 

**URLs importantes:**
- 🌐 **Frontend:** https://fisioflow.vercel.app
- 🔧 **API:** https://fisioflow.vercel.app/api
- 🗄️ **Supabase:** https://supabase.com/dashboard
- 🚀 **Vercel:** https://vercel.com/dashboard

**Próximos passos:**
1. Teste todas as funcionalidades
2. Configure notificações
3. Adicione mais exercícios
4. Configure relatórios
5. Treine sua equipe

**Suporte:**
- 📧 Email: admin@fisioflow.com
- 📱 WhatsApp: (11) 99999-9999
- 📚 Docs: https://fisioflow.vercel.app/docs
