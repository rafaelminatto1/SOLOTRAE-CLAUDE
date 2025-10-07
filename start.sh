#!/bin/bash

# Script de inicialização do FisioFlow
# Autor: Equipe SOLOTRAE
# Data: 2025-10-07

echo "🏥 FisioFlow - Sistema de Gestão para Clínicas de Fisioterapia"
echo "=============================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se uma porta está em uso
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Verificar Node.js
echo "📦 Verificando dependências..."
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Verificar npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm não está instalado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
    echo "   Criando arquivo .env de exemplo..."
    cat > .env << EOF
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Frontend (Vite)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_API_URL=http://localhost:8080

# Backend
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
EOF
    echo -e "${YELLOW}   Configure o arquivo .env com suas credenciais do Supabase!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Instalando dependências..."
    npm install
fi

# Verificar portas
echo ""
echo "🔌 Verificando portas..."

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Porta 3000 já está em uso (Frontend)${NC}"
    echo "   Matando processo..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

if port_in_use 8080; then
    echo -e "${YELLOW}⚠️  Porta 8080 já está em uso (Backend)${NC}"
    echo "   Matando processo..."
    pkill -f "tsx.*server" 2>/dev/null
    sleep 2
fi

echo -e "${GREEN}✅ Portas 3000 e 8080 disponíveis${NC}"

# Criar diretórios necessários
mkdir -p uploads
mkdir -p logs

# Iniciar serviços
echo ""
echo "🚀 Iniciando serviços..."
echo ""

# Iniciar backend em background
echo "📡 Iniciando Backend (porta 8080)..."
npx tsx api/server.ts > logs/backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# Verificar se backend iniciou
if ! port_in_use 8080; then
    echo -e "${RED}❌ Erro ao iniciar backend!${NC}"
    echo "   Verifique o log em: logs/backend.log"
    exit 1
fi
echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"

# Iniciar frontend em background
echo "🌐 Iniciando Frontend (porta 3000)..."
npm run frontend:dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar frontend iniciar
sleep 5

# Verificar se frontend iniciou
if ! port_in_use 3000; then
    echo -e "${RED}❌ Erro ao iniciar frontend!${NC}"
    echo "   Verifique o log em: logs/frontend.log"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"

# Salvar PIDs em arquivo
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Mensagem de sucesso
echo ""
echo "=============================================================="
echo -e "${GREEN}✅ FisioFlow iniciado com sucesso!${NC}"
echo "=============================================================="
echo ""
echo "📍 Acesse o sistema em:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   📡 Backend:  http://localhost:8080"
echo "   ⚕️  Health:   http://localhost:8080/api/health"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs backend:  tail -f logs/backend.log"
echo "   Ver logs frontend: tail -f logs/frontend.log"
echo "   Parar sistema:     ./stop.sh"
echo ""
echo "🔍 PIDs dos processos:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "💡 Pressione Ctrl+C para parar o sistema"
echo ""

# Função para cleanup ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "tsx.*server" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    rm -f logs/backend.pid logs/frontend.pid
    echo -e "${GREEN}✅ Serviços parados${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup INT TERM

# Manter script rodando
while true; do
    # Verificar se processos ainda estão rodando
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend parou inesperadamente!${NC}"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend parou inesperadamente!${NC}"
        cleanup
    fi
    
    sleep 5
done

