# 🏥 FisioFlow - Sistema de Gestão para Clínicas de Fisioterapia

Sistema completo e moderno de gestão para clínicas de fisioterapia, desenvolvido com as melhores tecnologias do mercado.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização moderna
- **Radix UI** - Componentes acessíveis
- **React Router** - Navegação
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações

### Backend
- **Node.js** com TypeScript
- **Express** - Framework web
- **Socket.IO** - Comunicação em tempo real
- **Supabase** - Backend as a Service (Auth + Database)
- **PostgreSQL** - Banco de dados

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Supabase CLI** - Gerenciamento do banco

## 📋 Funcionalidades

### ✅ Implementadas

#### 👤 Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico médico
- Informações de emergência
- Filtros avançados (status, sexo, busca)
- Visualização detalhada

#### 👨‍⚕️ Gestão de Fisioterapeutas
- Cadastro de profissionais
- Especialidades
- Licença CREFITO
- Biografia e experiência

#### 📅 Agendamento de Consultas
- Calendário interativo
- Múltiplos tipos de consultas
- Status de agendamento
- Consultas de hoje, semana e próximas
- Filtros por status, tipo e fisioterapeuta

#### 🏃 Biblioteca de Exercícios
- Cadastro de exercícios
- Categorias e dificuldades
- Instruções detalhadas
- Vídeos demonstrativos
- Precauções de segurança

#### 📋 Planos de Tratamento
- Criação de planos personalizados
- Associação de exercícios
- Acompanhamento de progresso
- Status (ativo, concluído, pausado)

#### 📊 Dashboard Analítico
- Estatísticas em tempo real
- Total de pacientes e novos no mês
- Consultas (hoje, semana, pendentes, concluídas)
- Total de exercícios
- Gráficos e métricas

#### 🔒 Autenticação e Segurança
- Login seguro com Supabase Auth
- Registro de usuários
- Row Level Security (RLS)
- Diferentes níveis de acesso

#### ⚡ Recursos Técnicos
- Interface responsiva
- Dark mode
- Performance otimizada
- Monitoramento de métricas (FCP, LCP, TTFB)
- Service Worker
- PWA ready

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **patients** - Pacientes cadastrados
- **physiotherapists** - Fisioterapeutas
- **appointments** - Consultas agendadas
- **exercises** - Biblioteca de exercícios
- **treatment_plans** - Planos de tratamento
- **treatment_plan_exercises** - Exercícios dos planos
- **exercise_logs** - Logs de exercícios realizados
- **progress_records** - Registros de progresso

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Docker e Docker Compose (opcional)
- Conta no Supabase

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd SOLOTRAE-CLAUDE
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
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
```

### 4. Configure o Supabase

#### 4.1. Instale a Supabase CLI

```bash
npm install -g supabase
```

#### 4.2. Faça Login no Supabase

```bash
supabase login
```

#### 4.3. Conecte ao Projeto

```bash
supabase link --project-ref seu-project-ref
```

#### 4.4. Execute as Migrations

```bash
supabase db push
```

### 5. Popule o Banco de Dados (Opcional)

Para popular o banco com dados de teste:

```bash
npm run seed
```

Ou manualmente:

```bash
npx tsx api/scripts/seed-database.ts
```

### 6. Inicie o Sistema

#### Desenvolvimento

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend
npm run frontend:dev
```

Ou em um único comando:

```bash
npm run dev
```

#### Produção

```bash
npm run build
npm start
```

## 📱 Acesso ao Sistema

Após iniciar o sistema, acesse:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Health**: http://localhost:8080/api/health

## 🧪 Dados de Teste

Após executar o seed, você terá:

- **3 Fisioterapeutas** (Ortopedia, Neurologia, Esportiva)
- **5 Pacientes** com diferentes condições
- **5 Exercícios** de várias categorias
- **6 Consultas** agendadas
- **3 Planos de Tratamento** ativos

## 📁 Estrutura do Projeto

```
SOLOTRAE-CLAUDE/
├── api/                    # Backend Node.js
│   ├── routes/            # Rotas da API
│   ├── database/          # Configuração do banco
│   ├── scripts/           # Scripts utilitários
│   └── server.ts          # Servidor principal
├── src/                   # Frontend React
│   ├── components/        # Componentes reutilizáveis
│   ├── contexts/          # Context API (Auth, etc)
│   ├── pages/             # Páginas da aplicação
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários
│   └── styles/            # Estilos globais
├── supabase/              # Configuração Supabase
│   └── migrations/        # Migrations SQL
├── public/                # Arquivos estáticos
├── .env                   # Variáveis de ambiente
├── package.json           # Dependências
└── README.md              # Este arquivo
```

## 🔌 API Endpoints

### Dashboard
- `GET /dashboard/stats` - Estatísticas gerais
- `GET /dashboard/activity` - Atividades recentes
- `GET /dashboard/appointments` - Resumo de consultas

### Pacientes
- `GET /api/patients` - Lista de pacientes
- `GET /api/patients/:id` - Detalhes do paciente
- `POST /api/patients` - Criar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Excluir paciente

### Consultas
- `GET /api/appointments` - Lista de consultas
- `GET /api/appointments/:id` - Detalhes da consulta
- `POST /api/appointments` - Agendar consulta
- `PUT /api/appointments/:id` - Atualizar consulta
- `DELETE /api/appointments/:id` - Cancelar consulta

### Exercícios
- `GET /api/exercises` - Lista de exercícios
- `GET /api/exercises/:id` - Detalhes do exercício
- `POST /api/exercises` - Criar exercício
- `PUT /api/exercises/:id` - Atualizar exercício
- `DELETE /api/exercises/:id` - Excluir exercício

### Planos de Tratamento
- `GET /api/treatment-plans` - Lista de planos
- `GET /api/treatment-plans/:id` - Detalhes do plano
- `POST /api/treatment-plans` - Criar plano
- `PUT /api/treatment-plans/:id` - Atualizar plano
- `DELETE /api/treatment-plans/:id` - Excluir plano

## 🔐 Segurança

- **Autenticação**: Supabase Auth com JWT
- **RLS (Row Level Security)**: Políticas de acesso por linha
- **CORS**: Configurado para origens permitidas
- **Variáveis de Ambiente**: Credenciais protegidas
- **HTTPS**: Recomendado em produção

## 🎨 UI/UX

- **Design System**: Consistente e moderno
- **Responsivo**: Mobile-first approach
- **Acessibilidade**: Componentes Radix UI
- **Performance**: Lazy loading e code splitting
- **Dark Mode**: Suporte completo

## 📈 Monitoramento

O sistema inclui monitoramento de performance:

- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **TTFB** (Time to First Byte)
- **INP** (Interaction to Next Paint)
- **CLS** (Cumulative Layout Shift)

## 🐛 Resolução de Problemas

### Erro: "EADDRINUSE: address already in use"

```bash
# Mate o processo na porta 8080
pkill -f "tsx.*server"

# Ou manualmente
lsof -ti:8080 | xargs kill -9
```

### Erro: "VITE_SUPABASE_URL is required"

Certifique-se de que as variáveis de ambiente estão configuradas e reinicie o Vite.

### Banco de dados não conecta

Verifique:
1. Credenciais do Supabase no `.env`
2. Migrations foram aplicadas (`supabase db push`)
3. Internet está funcionando

## 📝 Scripts Disponíveis

```bash
npm run dev              # Inicia frontend e backend
npm run frontend:dev     # Inicia apenas frontend
npm run backend:dev      # Inicia apenas backend
npm run build            # Build de produção
npm run seed             # Popula banco de dados
npm run lint             # Verifica código
npm run test             # Executa testes
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Desenvolvido com ❤️ pela equipe SOLOTRAE

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] Integração com calendário Google
- [ ] Notificações push
- [ ] Relatórios em PDF
- [ ] Chat em tempo real
- [ ] Integração com WhatsApp
- [ ] Histórico de pagamentos
- [ ] Avaliações de pacientes
- [ ] Exercícios com vídeo ao vivo
- [ ] Dashboard para pacientes
- [ ] App mobile (React Native)

## 📞 Suporte

Para suporte, envie um email para suporte@fisioflow.com ou abra uma issue no GitHub.

---

**FisioFlow** - Transformando a gestão de clínicas de fisioterapia 🏥✨
