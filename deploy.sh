#!/bin/bash

# Script de Deploy Automático - FisioFlow
# Supabase + Vercel

set -e

echo "🚀 INICIANDO DEPLOY DO FISIOFLOW"
echo "================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto FisioFlow"
    exit 1
fi

# 1. CONFIGURAR SUPABASE
print_status "1. Configurando Supabase..."

# Verificar se Supabase CLI está disponível
if ! command -v npx supabase &> /dev/null; then
    print_error "Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Inicializar Supabase se não estiver inicializado
if [ ! -f "supabase/config.toml" ]; then
    print_status "Inicializando projeto Supabase..."
    npx supabase init
fi

# Fazer login no Supabase
print_status "Fazendo login no Supabase..."
npx supabase login

# Criar projeto no Supabase (se não existir)
print_status "Criando/verificando projeto no Supabase..."
PROJECT_NAME="fisioflow-$(date +%s)"
npx supabase projects create $PROJECT_NAME --region us-east-1

# Obter URL e chaves do projeto
print_status "Obtendo configurações do projeto..."
PROJECT_URL=$(npx supabase projects list --output json | jq -r '.[0].api_url')
PROJECT_ANON_KEY=$(npx supabase projects list --output json | jq -r '.[0].anon_key')

# Atualizar .env com as configurações do Supabase
print_status "Atualizando arquivo .env..."
cat >> .env << EOF

# Supabase Configuration
SUPABASE_URL=$PROJECT_URL
SUPABASE_ANON_KEY=$PROJECT_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$PROJECT_ANON_KEY
EOF

# Aplicar migrações
print_status "Aplicando migrações do banco de dados..."
npx supabase db push

print_success "Supabase configurado com sucesso!"

# 2. CONFIGURAR VERCEL
print_status "2. Configurando Vercel..."

# Verificar se Vercel CLI está disponível
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Fazer login no Vercel
print_status "Fazendo login no Vercel..."
vercel login

# Criar projeto no Vercel
print_status "Criando projeto no Vercel..."
vercel --yes

# Configurar variáveis de ambiente no Vercel
print_status "Configurando variáveis de ambiente no Vercel..."
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add MERCADOPAGO_ACCESS_TOKEN
vercel env add STRIPE_SECRET_KEY

print_success "Vercel configurado com sucesso!"

# 3. BUILD E DEPLOY
print_status "3. Fazendo build e deploy..."

# Build do frontend
print_status "Fazendo build do frontend..."
npm run build

# Deploy no Vercel
print_status "Fazendo deploy no Vercel..."
vercel --prod

# Obter URL do deploy
DEPLOY_URL=$(vercel ls --output json | jq -r '.[0].url')

print_success "Deploy concluído com sucesso!"
echo ""
echo "🌐 URLs do projeto:"
echo "   Frontend: https://$DEPLOY_URL"
echo "   API: https://$DEPLOY_URL/api"
echo "   Supabase: $PROJECT_URL"
echo ""
echo "📊 Próximos passos:"
echo "   1. Configure as API keys no painel do Vercel"
echo "   2. Teste todas as funcionalidades"
echo "   3. Configure domínio personalizado (opcional)"
echo ""
echo "🎉 FisioFlow está no ar!"
