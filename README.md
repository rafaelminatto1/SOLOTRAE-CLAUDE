# FisioFlow

Sistema completo de gestão para clínicas de fisioterapia, desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Funcionalidades

- **Gestão de Pacientes**: Cadastro, histórico médico e acompanhamento
- **Agendamento**: Sistema completo de agendamento de consultas
- **Portal do Paciente**: Acesso para pacientes visualizarem informações
- **Exercícios**: Biblioteca de exercícios com instruções
- **Documentos**: Upload e gestão de documentos médicos
- **Mensagens**: Sistema de comunicação interna
- **Pagamentos**: Controle financeiro e pagamentos

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Deploy**: Vercel + GitHub Actions
- **Icons**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no Supabase
- Conta no Vercel (para deploy)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/fisioflow.git
cd fisioflow
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Execute o projeto:
```bash
npm run dev
```

## 🧪 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run check` - Executa verificação de tipos TypeScript
- `npm run preview` - Visualiza build de produção localmente

## 📚 Deploy

Veja o arquivo [DEPLOY.md](./DEPLOY.md) para instruções detalhadas de deploy.

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── utils/         # Funções utilitárias
└── types/         # Definições de tipos TypeScript

api/               # Backend APIs (Node.js/Express)
shared/            # Tipos compartilhados
supabase/          # Configurações e migrações do Supabase
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Configuração Avançada do ESLint

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
