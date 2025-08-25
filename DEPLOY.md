# Deploy do FisioFlow

Este documento contém as instruções para fazer o deploy do projeto FisioFlow usando GitHub e Vercel.

## Pré-requisitos

- Conta no GitHub
- Conta no Vercel
- Projeto Supabase configurado

## Configuração do GitHub

### 1. Criar Repositório

1. Acesse [GitHub](https://github.com) e crie um novo repositório
2. Nomeie o repositório como `fisioflow` ou nome de sua preferência
3. Mantenha o repositório público ou privado conforme necessário

### 2. Conectar Repositório Local

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU_USUARIO/fisioflow.git

# Push do código
git branch -M main
git push -u origin main
```

## Configuração do Vercel

### 1. Conectar Projeto

1. Acesse [Vercel](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, vá em Settings > Environment Variables e adicione:

#### Variáveis Obrigatórias:
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `SUPABASE_URL`: URL do seu projeto Supabase (para API)
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase (para API)
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de service role do Supabase
- `JWT_SECRET`: Chave secreta para JWT (gere uma string aleatória)

#### Como obter as chaves do Supabase:
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em Settings > API
3. Copie a URL e as chaves necessárias

### 3. Configurar Secrets do GitHub (para CI/CD)

No repositório GitHub, vá em Settings > Secrets and variables > Actions e adicione:

- `VERCEL_TOKEN`: Token de acesso do Vercel
- `VERCEL_ORG_ID`: ID da organização Vercel
- `VERCEL_PROJECT_ID`: ID do projeto Vercel

#### Como obter os tokens do Vercel:
1. Acesse [Vercel Tokens](https://vercel.com/account/tokens)
2. Crie um novo token
3. Para obter ORG_ID e PROJECT_ID, execute no terminal:
   ```bash
   npx vercel link
   cat .vercel/project.json
   ```

## Estrutura de Deploy

### Workflow GitHub Actions

O arquivo `.github/workflows/deploy.yml` configura:

1. **Testes**: Executa type check e build em cada push/PR
2. **Deploy**: Faz deploy automático para produção na branch main

### Configuração Vercel

O arquivo `vercel.json` configura:

- **Build**: Comando de build e diretório de saída
- **Rewrites**: Roteamento para SPA e APIs
- **Headers**: CORS para APIs
- **Environment**: Variáveis de ambiente

## Comandos Úteis

```bash
# Testar build localmente
npm run build

# Verificar tipos
npm run check

# Deploy manual via Vercel CLI
npx vercel --prod

# Visualizar logs de deploy
npx vercel logs
```

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Execute `npm run check` para verificar erros de tipo
- Verifique se as variáveis de ambiente estão configuradas

### Erro de API
- Verifique se as chaves do Supabase estão corretas
- Confirme se as políticas RLS estão configuradas
- Verifique os logs no painel do Vercel

### Erro de Roteamento
- Verifique a configuração de rewrites no `vercel.json`
- Confirme se o roteamento do frontend está correto

## Monitoramento

- **Vercel Dashboard**: Monitore deploys e performance
- **GitHub Actions**: Acompanhe builds e testes
- **Supabase Dashboard**: Monitore banco de dados e APIs

## Atualizações

Para fazer atualizações:

1. Faça as alterações no código
2. Commit e push para o repositório
3. O GitHub Actions executará os testes
4. Se os testes passarem, o deploy será feito automaticamente

```bash
git add .
git commit -m "Descrição da alteração"
git push origin main
```