# 🚀 GUIA DE DEPLOY - FISIOFLOW

## 📋 PRÉ-REQUISITOS

### Sistema
- Ubuntu 20.04+ ou CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (opcional, para proxy reverso)
- Certificado SSL (Let's Encrypt recomendado)

### Recursos Mínimos
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 100GB SSD
- **Bandwidth:** 100Mbps

### Domínios Necessários
- `fisioflow.com` (frontend)
- `api.fisioflow.com` (backend)
- `admin.fisioflow.com` (painel admin)

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/fisioflow.git
cd fisioflow
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar template de produção
cp .env.production .env

# Editar com suas configurações
nano .env
```

**Variáveis Obrigatórias:**
- `SECRET_KEY`: Chave secreta Flask
- `JWT_SECRET_KEY`: Chave JWT
- `DB_PASSWORD`: Senha do PostgreSQL
- `OPENAI_API_KEY`: Chave da OpenAI
- `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN`: WhatsApp
- `MERCADOPAGO_ACCESS_TOKEN`: Pagamentos
- `STRIPE_SECRET_KEY`: Pagamentos cartão

### 3. Configurar DNS
```bash
# Apontar domínios para o servidor
fisioflow.com        A    SEU_IP_SERVIDOR
api.fisioflow.com    A    SEU_IP_SERVIDOR
admin.fisioflow.com  A    SEU_IP_SERVIDOR
```

### 4. Configurar Firewall
```bash
# Abrir portas necessárias
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 🚀 DEPLOY

### Deploy Automático
```bash
# Dar permissão ao script
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh production
```

### Deploy Manual
```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

## 📊 MONITORAMENTO

### URLs de Monitoramento
- **Grafana:** http://seu-servidor:3000
- **Prometheus:** http://seu-servidor:9090
- **Traefik Dashboard:** http://seu-servidor:8080

### Logs
```bash
# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Métricas Importantes
- **CPU:** < 70%
- **RAM:** < 80%
- **Disk:** < 85%
- **Response Time:** < 500ms
- **Uptime:** > 99.5%

## 🔄 BACKUP E RESTORE

### Backup Automático
```bash
# Executar backup
./scripts/backup.sh

# Agendar backup diário (crontab)
0 2 * * * /path/to/fisioflow/scripts/backup.sh
```

### Restore
```bash
# Restore PostgreSQL
docker exec -i fisioflow-postgres psql -U fisioflow -d fisioflow_prod < backups/postgres_YYYYMMDD_HHMMSS.sql

# Restore uploads
tar -xzf backups/uploads_YYYYMMDD_HHMMSS.tar.gz
```

## 🛡️ SEGURANÇA

### SSL/TLS
- Certificados automáticos via Let's Encrypt
- HSTS habilitado
- Redirect HTTP → HTTPS

### Firewall
- Apenas portas 80, 443 e 22 abertas
- Rate limiting configurado
- DDoS protection via Cloudflare (recomendado)

### Backup
- Backups diários automáticos
- Retenção de 30 dias
- Backup offsite recomendado

## 🔧 MANUTENÇÃO

### Atualizações
```bash
# Atualizar código
git pull origin main

# Rebuild e redeploy
./scripts/deploy.sh production
```

### Reiniciar Serviços
```bash
# Reiniciar tudo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar serviço específico
docker-compose -f docker-compose.prod.yml restart backend
```

### Limpeza
```bash
# Limpar containers não utilizados
docker system prune -f

# Limpar volumes não utilizados
docker volume prune -f
```

## 🆘 TROUBLESHOOTING

### Problemas Comuns

#### Backend não inicia
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend

# Verificar variáveis de ambiente
docker exec fisioflow-backend env | grep FLASK
```

#### Banco não conecta
```bash
# Verificar PostgreSQL
docker exec fisioflow-postgres pg_isready -U fisioflow

# Resetar senha
docker exec -it fisioflow-postgres psql -U postgres -c "ALTER USER fisioflow PASSWORD 'nova_senha';"
```

#### Frontend não carrega
```bash
# Verificar Nginx
docker exec fisioflow-frontend nginx -t

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend --no-cache
```

### Comandos Úteis
```bash
# Status detalhado
docker stats

# Espaço em disco
df -h

# Processos
htop

# Conectividade
curl -I https://fisioflow.com
```

## 📞 SUPORTE

### Contatos
- **Email:** admin@fisioflow.com
- **Telefone:** (11) 99999-9999
- **Slack:** #fisioflow-ops

### Documentação
- **API:** https://api.fisioflow.com/docs
- **Frontend:** https://fisioflow.com/help
- **Monitoramento:** https://status.fisioflow.com

## 🎯 CHECKLIST DE DEPLOY

### Pré-Deploy
- [ ] Código testado em staging
- [ ] Backup atual realizado
- [ ] Variáveis de ambiente configuradas
- [ ] DNS configurado
- [ ] SSL certificado válido
- [ ] Monitoramento configurado

### Pós-Deploy
- [ ] Todos os serviços funcionando
- [ ] Frontend carregando
- [ ] Backend respondendo
- [ ] Banco de dados conectado
- [ ] Pagamentos testados
- [ ] WhatsApp funcionando
- [ ] Monitoramento ativo
- [ ] Backup agendado

### Validação
- [ ] Login funcionando
- [ ] Cadastro de paciente
- [ ] Agendamento
- [ ] Pagamento PIX
- [ ] IA respondendo
- [ ] Notificações WhatsApp
- [ ] Relatórios gerados

---

**🎉 Parabéns! Seu FisioFlow está no ar!**
