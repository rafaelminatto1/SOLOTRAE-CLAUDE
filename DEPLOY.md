# Deploy do FisioFlow via GitHub + Vercel

Este documento contém as instruções para configurar o deploy automático do projeto FisioFlow usando GitHub Actions e Vercel.

## Pré-requisitos

1. Conta no GitHub
2. Conta na Vercel
3. Projeto Supabase configurado

## Configuração do GitHub

### 1. Criar Repositório no GitHub

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU_USUARIO/fisioflow.git
git branch -M main
git push -u origin main
```

### 2. Configurar Secrets no GitHub

Vá para Settings > Secrets and variables > Actions e adicione os seguintes secrets:

#### Secrets da Vercel:
- `VERCEL_TOKEN`: Token de acesso da Vercel
- `VERCEL_ORG_ID`: ID da organização Vercel
- `VERCEL_PROJECT_ID`: ID do projeto Vercel

#### Secrets do Supabase:
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### 3. Como obter os tokens necessários

#### Token da Vercel:
1. Acesse https://vercel.com/account/tokens
2. Crie um novo token
3. Copie o token gerado

#### IDs da Vercel:
1. Execute `vercel link` no projeto local
2. Os IDs serão salvos em `.vercel/project.json`
3. Ou acesse o projeto na Vercel e veja nas configurações

#### Credenciais do Supabase:
1. Acesse seu projeto no Supabase Dashboard
2. Vá para Settings > API
3. Copie a URL e a chave anônima

## Configuração da Vercel

### 1. Conectar Repositório

1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2. Configurações de Build

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

## Workflow de Deploy

### Deploy Automático

O workflow está configurado para:

1. **Pull Requests**: Deploy de preview automático
2. **Push para main/master**: Deploy de produção automático

### Etapas do Pipeline

1. **Test**: 
   - Instala dependências
   - Executa verificação de tipos
   - Executa testes
   - Faz build do projeto

2. **Deploy Preview** (PRs):
   - Deploy para ambiente de preview
   - URL temporária para testes

3. **Deploy Production** (main/master):
   - Deploy para produção
   - URL definitiva do projeto

## Comandos Úteis

```bash
# Verificar status do deploy
vercel ls

# Ver logs do deploy
vercel logs [deployment-url]

# Deploy manual
vercel --prod

# Configurar projeto local
vercel link
```

## Estrutura de Arquivos

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow GitHub Actions
├── .vercel/
│   └── project.json           # Configurações Vercel
├── vercel.json                # Configurações de deploy
├── package.json               # Scripts e dependências
└── DEPLOY.md                  # Este arquivo
```

## Troubleshooting

### Erro de Build
- Verifique se todas as variáveis de ambiente estão configuradas
- Execute `npm run check` localmente para verificar erros de tipo
- Verifique os logs no GitHub Actions

### Erro de Deploy
- Verifique se o token da Vercel está válido
- Confirme se os IDs da Vercel estão corretos
- Verifique se o projeto está linkado corretamente

### Erro de Conexão Supabase
- Verifique se as credenciais do Supabase estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique as políticas RLS se houver erro de permissão

## Monitoramento

- **GitHub Actions**: https://github.com/SEU_USUARIO/fisioflow/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com/projects

## Próximos Passos

1. Configurar domínio customizado na Vercel
2. Configurar SSL/TLS
3. Configurar monitoramento de performance
4. Configurar backup automático do Supabase