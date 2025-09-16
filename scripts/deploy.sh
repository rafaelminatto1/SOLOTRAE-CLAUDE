#!/bin/bash

# Script de Deploy - FisioFlow
# Uso: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="fisioflow"

echo "🚀 Iniciando deploy do FisioFlow - Ambiente: $ENVIRONMENT"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker."
    exit 1
fi

# Verificar se docker-compose está disponível
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose não encontrado. Por favor, instale o docker-compose."
    exit 1
fi

# Fazer backup do banco antes do deploy (se já existir)
if docker ps -a | grep -q "${PROJECT_NAME}-postgres"; then
    echo "📦 Fazendo backup do banco de dados..."
    ./scripts/backup.sh
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Limpar imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker system prune -f

# Build das novas imagens
echo "🔨 Construindo novas imagens..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar serviços
echo "▶️  Iniciando serviços..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar saúde dos serviços
echo "🔍 Verificando saúde dos serviços..."

# Backend
if curl -f -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ERRO"
fi

# Frontend
if curl -f -s http://localhost/ > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: ERRO"
fi

# PostgreSQL
if docker exec ${PROJECT_NAME}-postgres pg_isready -U fisioflow > /dev/null 2>&1; then
    echo "✅ PostgreSQL: OK"
else
    echo "❌ PostgreSQL: ERRO"
fi

# Redis
if docker exec ${PROJECT_NAME}-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: ERRO"
fi

# Mostrar logs dos últimos minutos
echo "📋 Logs dos últimos 2 minutos:"
docker-compose -f docker-compose.prod.yml logs --tail=50 --since=2m

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📊 Status dos serviços:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost/"
echo "   Backend:  http://localhost:5000/"
echo "   Grafana:  http://localhost:3000/ (admin/senha-definida)"
echo "   Traefik:  http://localhost:8080/"
echo ""
echo "📝 Para acompanhar logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f [serviço]"
echo ""
echo "🔄 Para reiniciar serviços:"
echo "   docker-compose -f docker-compose.prod.yml restart [serviço]"
