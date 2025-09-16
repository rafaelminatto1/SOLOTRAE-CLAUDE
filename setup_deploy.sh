#!/bin/bash

# 🚀 SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA - FISIOFLOW
# Supabase + Vercel

set -e

echo "🚀 FISIOFLOW - CONFIGURAÇÃO AUTOMÁTICA"
echo "======================================"
echo ""

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
if [ ! -f "package.json" ] || [ ! -f "backend/app_simple.py" ]; then
    print_error "Execute este script no diretório raiz do projeto FisioFlow"
    exit 1
fi

print_status "Verificando pré-requisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado. Instale npm primeiro."
    exit 1
fi

# Verificar git
if ! command -v git &> /dev/null; then
    print_error "git não encontrado. Instale git primeiro."
    exit 1
fi

print_success "Pré-requisitos verificados!"

# Instalar dependências
print_status "Instalando dependências do frontend..."
npm install

print_status "Instalando dependências do backend..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements_essential.txt

print_success "Dependências instaladas!"

# Instalar CLIs
print_status "Instalando Vercel CLI..."
npm install -g vercel

print_status "Instalando Supabase CLI..."
npm install -g supabase

print_success "CLIs instalados!"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado. Criando template..."
    cat > .env << 'EOF'
# Flask Configuration
FLASK_APP=app_simple.py
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DATABASE_URL=sqlite:///fisioflow.db
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# JWT
JWT_SECRET_KEY=sua-chave-jwt-super-secreta

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# OpenAI
OPENAI_API_KEY=sk-sua-chave-openai

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=sua-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Google Calendar
GOOGLE_CALENDAR_CREDENTIALS_FILE=credentials.json
GOOGLE_CALENDAR_TOKEN_FILE=token.json

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-token-mp

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_sua-chave-stripe
STRIPE_SECRET_KEY=sk_sua-chave-stripe
EOF
    print_warning "Configure as variáveis no arquivo .env antes de continuar!"
fi

# Criar arquivos de configuração se não existirem
print_status "Criando arquivos de configuração..."

# Vercel config
if [ ! -f "vercel.json" ]; then
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "backend/app_simple.py",
      "use": "@vercel/python"
    },
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app_simple.py"
    },
    {
      "src": "/(.*)",
      "dest": "dist/$1"
    }
  ],
  "env": {
    "FLASK_APP": "app_simple.py",
    "FLASK_ENV": "production"
  }
}
EOF
fi

# Supabase config
if [ ! -f "supabase/config.toml" ]; then
    mkdir -p supabase
    cat > supabase/config.toml << 'EOF'
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "fisioflow"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API endpoints.
# public and storage are always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returned from a table or view. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv6)
# ip_version = "IPv6"

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://localhost:54321"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = true
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false

# Configure one of the supported SMS providers: `twilio`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Use pre-defined map of phone number to OTP for testing.
[auth.sms.test_otp]
# 4152127777 = "123456"

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
[auth.captcha]
enabled = false
provider = "hcaptcha"
secret = "env(SUPABASE_AUTH_CAPTCHA_SECRET)"

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""

[analytics]
enabled = false
port = 54327
vector_port = 54328
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"
EOF
fi

# Criar migração inicial se não existir
if [ ! -f "supabase/migrations/20240915000001_initial_schema.sql" ]; then
    mkdir -p supabase/migrations
    cat > supabase/migrations/20240915000001_initial_schema.sql << 'EOF'
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    address TEXT,
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    treatment_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty_level VARCHAR(20),
    duration_minutes INTEGER,
    repetitions INTEGER,
    sets INTEGER,
    instructions TEXT,
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_exercises table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS patient_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'assigned',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    external_payment_id VARCHAR(255),
    payment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_consultations table
CREATE TABLE IF NOT EXISTS ai_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    consultation_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    ai_response JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    external_message_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_patient_id ON patient_exercises(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_exercise_id ON patient_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_ai_consultations_patient_id ON ai_consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_patient_id ON whatsapp_messages(patient_id);

-- Insert some sample data
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@fisioflow.com', crypt('admin123', gen_salt('bf')), 'Administrador', 'admin'),
('fisio@fisioflow.com', crypt('fisio123', gen_salt('bf')), 'Fisioterapeuta', 'therapist')
ON CONFLICT (email) DO NOTHING;

INSERT INTO exercises (name, description, category, difficulty_level, duration_minutes, repetitions, sets, instructions) VALUES 
('Alongamento de Quadríceps', 'Alongamento para a parte frontal da coxa', 'alongamento', 'iniciante', 5, 3, 1, 'Fique em pé, dobre o joelho e puxe o pé em direção ao glúteo. Segure por 30 segundos.'),
('Prancha', 'Exercício de fortalecimento do core', 'fortalecimento', 'intermediario', 1, 3, 1, 'Deite de bruços, apoie os antebraços e mantenha o corpo reto. Segure por 30 segundos.'),
('Agachamento', 'Exercício de fortalecimento das pernas', 'fortalecimento', 'iniciante', 10, 15, 3, 'Fique em pé, pés afastados na largura dos ombros. Desça como se fosse sentar em uma cadeira.'),
('Caminhada', 'Exercício cardiovascular', 'cardio', 'iniciante', 30, 1, 1, 'Caminhe em ritmo moderado por 30 minutos.')
ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, description) VALUES 
('app_name', '"FisioFlow"', 'Nome da aplicação'),
('app_version', '"1.0.0"', 'Versão da aplicação'),
('max_appointments_per_day', '20', 'Número máximo de consultas por dia'),
('session_duration', '60', 'Duração padrão das sessões em minutos'),
('whatsapp_enabled', 'true', 'Habilitar integração com WhatsApp'),
('ai_enabled', 'true', 'Habilitar funcionalidades de IA')
ON CONFLICT (key) DO NOTHING;
EOF
fi

print_success "Arquivos de configuração criados!"

# Build do frontend
print_status "Fazendo build do frontend..."
npm run build

print_success "Build do frontend concluído!"

# Verificar se o usuário quer continuar com o deploy
echo ""
print_warning "Configuração local concluída!"
echo ""
echo "Próximos passos:"
echo "1. Configure as variáveis no arquivo .env"
echo "2. Execute: ./deploy.sh"
echo ""
echo "Ou siga o guia completo:"
echo "cat GUIA_DEPLOY_SUPABASE_VERCEL.md"
echo ""

# Tornar scripts executáveis
chmod +x deploy.sh
chmod +x setup_deploy.sh

print_success "Scripts configurados e prontos para uso!"
