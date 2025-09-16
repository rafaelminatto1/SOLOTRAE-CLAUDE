#!/bin/bash

# Script de Backup - FisioFlow
# Uso: ./scripts/backup.sh

set -e

PROJECT_NAME="fisioflow"
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "📦 Iniciando backup do FisioFlow - $DATE"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup do PostgreSQL
echo "🗃️  Fazendo backup do PostgreSQL..."
docker exec ${PROJECT_NAME}-postgres pg_dump -U fisioflow -d fisioflow_prod > "$BACKUP_DIR/postgres_$DATE.sql"

# Backup dos uploads
echo "📁 Fazendo backup dos uploads..."
if [ -d "./uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" ./uploads/
fi

# Backup das configurações
echo "⚙️  Fazendo backup das configurações..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    .env.production \
    docker-compose.prod.yml \
    nginx.conf \
    scripts/ \
    monitoring/ \
    --exclude=scripts/deploy.sh \
    --exclude=scripts/backup.sh

# Backup do Redis (se necessário)
echo "🔴 Fazendo backup do Redis..."
docker exec ${PROJECT_NAME}-redis redis-cli BGSAVE

# Listar backups
echo "📋 Backups disponíveis:"
ls -la $BACKUP_DIR/

# Limpar backups antigos (manter apenas os últimos 7 dias)
echo "🧹 Limpando backups antigos..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup concluído!"
echo "📍 Localização: $BACKUP_DIR/"
