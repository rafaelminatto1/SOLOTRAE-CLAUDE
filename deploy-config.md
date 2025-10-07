# Configuração de Deploy - FisioFlow

## Variáveis de Ambiente Necessárias

### Frontend (Vercel)
```
VITE_SUPABASE_URL=https://ixevreqkdliucbsrqviy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODIzNzEsImV4cCI6MjA3MjM1ODM3MX0.GXN1qovqdFAjD9c4AJIhrsKBRl7pJb67CE2-6In48IA
VITE_API_URL=https://fisioflow.vercel.app/api
VITE_NODE_ENV=production
```

### Backend (Vercel)
```
SUPABASE_URL=https://ixevreqkdliucbsrqviy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODIzNzEsImV4cCI6MjA3MjM1ODM3MX0.GXN1qovqdFAjD9c4AJIhrsKBRl7pJb67CE2-6In48IA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc4MjM3MSwiZXhwIjoyMDcyMzU4MzcxfQ.u2FNKpzD0eOO4FXm6B6M36PZo018NjVbrQeLp8NAi0k
JWT_SECRET=your-jwt-secret-key-here
FLASK_ENV=production
PYTHONPATH=/var/task
```

## URLs do Projeto
- **Supabase Project**: https://ixevreqkdliucbsrqviy.supabase.co
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ixevreqkdliucbsrqviy
- **Vercel Project**: https://fisioflow.vercel.app

## Próximos Passos
1. Configurar projeto na Vercel
2. Adicionar variáveis de ambiente na Vercel
3. Fazer deploy do frontend
4. Fazer deploy do backend
5. Configurar domínio personalizado
6. Testar sistema em produção
