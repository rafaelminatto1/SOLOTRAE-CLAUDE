# Configuração de Secrets do GitHub para Deploy Automático

Este guia explica como configurar os secrets necessários no GitHub para habilitar o deploy automático no Vercel através do GitHub Actions.

## Pré-requisitos

- Conta no GitHub com repositório do projeto
- Conta no Vercel com projeto já configurado
- Acesso de administrador ao repositório GitHub

## Passo 1: Obter o VERCEL_TOKEN

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique no seu avatar no canto superior direito
3. Selecione **Settings**
4. No menu lateral, clique em **Tokens**
5. Clique em **Create Token**
6. Digite um nome descritivo (ex: "GitHub Actions Deploy")
7. Selecione o escopo apropriado (recomendado: **Full Account**)
8. Clique em **Create**
9. **IMPORTANTE**: Copie o token imediatamente (ele não será mostrado novamente)

## Passo 2: Obter VERCEL_ORG_ID e VERCEL_PROJECT_ID

### Método 1: Via Vercel CLI (Recomendado)

1. Instale o Vercel CLI se ainda não tiver:
   ```bash
   npm i -g vercel
   ```

2. Faça login no Vercel:
   ```bash
   vercel login
   ```

3. No diretório do seu projeto, execute:
   ```bash
   vercel link
   ```

4. Após o link, verifique o arquivo `.vercel/project.json`:
   ```bash
   cat .vercel/project.json
   ```

5. Você verá algo como:
   ```json
   {
     "orgId": "team_xxxxxxxxxxxxxxxxxx",
     "projectId": "prj_xxxxxxxxxxxxxxxxxx"
   }
   ```

### Método 2: Via Dashboard Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto
3. Vá em **Settings**
4. Na seção **General**:
   - **Project ID** está listado como "Project ID"
   - **Team ID** (ou Org ID) está na URL: `vercel.com/[TEAM_ID]/[PROJECT_NAME]`

## Passo 3: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Clique na aba **Settings**
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Adicione os seguintes secrets:

### VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Secret**: Cole o token obtido no Passo 1

### VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`
- **Secret**: Cole o orgId obtido no Passo 2

### VERCEL_PROJECT_ID
- **Name**: `VERCEL_PROJECT_ID`
- **Secret**: Cole o projectId obtido no Passo 2

## Passo 4: Verificar Configuração do GitHub Actions

Verifique se o arquivo `.github/workflows/deploy.yml` está configurado corretamente:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

## Passo 5: Testar o Deploy Automático

1. Faça um commit e push para a branch `main` ou `master`:
   ```bash
   git add .
   git commit -m "test: trigger automatic deploy"
   git push origin main
   ```

2. Vá para a aba **Actions** no GitHub
3. Verifique se o workflow "Deploy to Vercel" foi executado
4. Acompanhe os logs para verificar se o deploy foi bem-sucedido

## Solução de Problemas

### Erro: "Invalid token"
- Verifique se o VERCEL_TOKEN foi copiado corretamente
- Certifique-se de que o token não expirou
- Gere um novo token se necessário

### Erro: "Project not found"
- Verifique se VERCEL_ORG_ID e VERCEL_PROJECT_ID estão corretos
- Certifique-se de que o projeto existe no Vercel
- Execute `vercel link` novamente se necessário

### Erro: "Permission denied"
- Verifique se você tem permissões de administrador no repositório GitHub
- Certifique-se de que o token Vercel tem as permissões necessárias

## Segurança

- **NUNCA** commite os secrets no código
- Use apenas GitHub Secrets para armazenar informações sensíveis
- Revogue tokens antigos quando criar novos
- Monitore regularmente o uso dos tokens no Vercel Dashboard

## Próximos Passos

Após configurar os secrets:
1. Configure monitoramento e analytics
2. Implemente logging de erros
3. Configure alertas de performance
4. Documente métricas e dashboards

---

**Nota**: Este guia assume que você já tem um projeto Vercel configurado. Se ainda não configurou, siga primeiro o guia em `DEPLOY.md`.