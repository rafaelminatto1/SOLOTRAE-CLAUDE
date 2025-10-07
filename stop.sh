#!/bin/bash

# Script para parar o FisioFlow
# Autor: Equipe SOLOTRAE
# Data: 2025-10-07

echo "🛑 Parando FisioFlow..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parar usando PIDs salvos
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend parado (PID: $BACKEND_PID)${NC}"
    fi
    rm -f logs/backend.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend parado (PID: $FRONTEND_PID)${NC}"
    fi
    rm -f logs/frontend.pid
fi

# Garantir que todos os processos foram parados
pkill -f "tsx.*server" 2>/dev/null && echo -e "${GREEN}✅ Processos tsx parados${NC}"
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✅ Processos vite parados${NC}"

# Verificar portas
if lsof -ti:8080 >/dev/null 2>&1; then
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    echo -e "${YELLOW}⚠️  Porta 8080 liberada forçadamente${NC}"
fi

if lsof -ti:3000 >/dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo -e "${YELLOW}⚠️  Porta 3000 liberada forçadamente${NC}"
fi

echo ""
echo -e "${GREEN}✅ FisioFlow parado com sucesso!${NC}"

