# FisioFlow - Plano de Verificação e Correção da Integridade dos Dados

## 1. Resumo Executivo

Este documento apresenta uma análise abrangente da integridade dos dados no sistema FisioFlow, identificando problemas críticos na estrutura de dados, inconsistências entre schemas e implementações, e propondo um plano de correção estruturado.

### Problemas Identificados

* **Crítico**: Uso de `field_0`, `field_1`, etc. ao invés de nomes de campos no banco JSON

* **Alto**: Inconsistências entre schema SQL e dados JSON

* **Alto**: Duplicações massivas na tabela de migrations (100 registros)

* **Médio**: Falta de validações robustas de dados

* **Médio**: Inconsistências entre tipos TypeScript e implementação

## 2. Análise Detalhada dos Problemas

### 2.1 Estrutura de Dados JSON Inconsistente

**Problema**: O arquivo `data/fisioflow.json` utiliza nomenclatura genérica (`field_0`, `field_1`, etc.) ao invés dos nomes de campos definidos no schema SQL.

**Exemplo Atual**:

```json
{
  "users": [
    {
      "id": 1,
      "field_0": "admin@fisioflow.com",  // deveria ser "email"
      "field_1": "$2b$10$...",           // deveria ser "password"
      "field_2": "Administrador",        // deveria ser "name"
      "field_3": "admin",                // deveria ser "role"
      "field_4": "(11) 99999-9999"       // deveria ser "phone"
    }
  ]
}
```

**Impacto**:

* Dificuldade de manutenção e debugging

* Código menos legível e propenso a erros

* Inconsistência com schema SQL definido

* Problemas de integração com frontend

### 2.2 Inconsistências entre Schema SQL e Dados JSON

**Schema SQL Esperado** (api/database/schema.ts):

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Dados JSON Atual**:

* Campos `avatar`, `is_active`, `created_at`, `updated_at` ausentes

* Nomenclatura inconsistente (`field_X` vs nomes reais)

* Falta de validação de tipos

### 2.3 Duplicações na Tabela de Migrations

**Problema**: A tabela `migrations` contém 100 registros duplicados, indicando execução múltipla das mesmas migrations.

**Registros Encontrados**:

* `001_initial_schema.sql`: 67 execuções

* `004_create_notifications.sql`: 17 execuções

* `005_create_files.sql`: 16 execuções

**Impacto**:

* Poluição do banco de dados

* Dificuldade de rastreamento de mudanças

* Possíveis conflitos em futuras migrations

### 2.4 Problemas de Validação de Dados

**Validações Ausentes**:

* Validação de CPF nos pacientes

* Validação de CREFITO nos fisioterapeutas

* Validação de formato de email

* Validação de datas e horários

* Validação de status de agendamentos

**Exemplo de Dados Inconsistentes**:

```json
{
  "patients": [
    {
      "field_1": "123.456.789-01",  // CPF sem validação
      "field_2": "1985-03-15",      // Data sem validação de formato
      "field_3": "F"                // Gênero sem enum validation
    }
  ]
}
```

### 2.5 Inconsistências entre TypeScript e Implementação

**Tipos Definidos** (shared/types.ts):

```typescript
export interface User {
  id: string;
  email: string;
  nome: string;        // Inconsistente com "name" no banco
  perfil: UserRole;    // Inconsistente com "role" no banco
  crefito?: string;
  ativo: boolean;      // Inconsistente com "is_active" no banco
}
```

**Implementação Real**:

* Campos com nomes diferentes

* Tipos não correspondentes

* Campos opcionais tratados como obrigatórios

## 3. Plano de Correção

### 3.1 Fase 1: Correção Crítica (Prioridade Alta)

#### 3.1.1 Normalização da Estrutura de Dados JSON

**Prazo**: 2-3 dias
**Responsável**: Desenvolvedor Backend

**Ações**:

1. Criar script de migração para converter `field_X` para nomes reais
2. Atualizar `data/fisioflow.json` com estrutura correta
3. Modificar `api/database/config.ts` para usar nomes de campos corretos
4. Testar todas as rotas da API após mudança

**Script de Migração Sugerido**:

```javascript
// scripts/migrate-json-structure.js
const fs = require('fs');
const path = require('path');

const fieldMappings = {
  users: {
    field_0: 'email',
    field_1: 'password',
    field_2: 'name',
    field_3: 'role',
    field_4: 'phone',
    field_5: 'is_active'
  },
  patients: {
    field_0: 'user_id',
    field_1: 'cpf',
    field_2: 'birth_date',
    field_3: 'gender',
    field_4: 'address',
    field_5: 'emergency_contact',
    field_6: 'emergency_phone',
    field_7: 'medical_history'
  }
  // ... outros mapeamentos
};
```

#### 3.1.2 Limpeza da Tabela de Migrations

**Prazo**: 1 dia
**Responsável**: Desenvolvedor Backend

**Ações**:

1. Backup do banco atual
2. Limpar registros duplicados na tabela migrations
3. Manter apenas um registro por migration executada
4. Implementar controle de execução única

### 3.2 Fase 2: Padronização e Validação (Prioridade Média)

#### 3.2.1 Implementação de Validações Robustas

**Prazo**: 3-4 dias
**Responsável**: Desenvolvedor Backend

**Validações a Implementar**:

```typescript
// api/middleware/validation.ts
import Joi from 'joi';

export const userValidation = {
  create: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('admin', 'physiotherapist', 'patient').required(),
    phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional()
  })
};

export const patientValidation = {
  create: Joi.object({
    user_id: Joi.number().integer().positive().required(),
    cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
    birth_date: Joi.date().iso().max('now').required(),
    gender: Joi.string().valid('M', 'F', 'O').required()
  })
};
```

#### 3.2.2 Sincronização de Tipos TypeScript

**Prazo**: 2 dias
**Responsável**: Desenvolvedor Frontend/Backend

**Ações**:

1. Revisar e padronizar `shared/types.ts`
2. Garantir consistência entre tipos TS e schema SQL
3. Implementar validação de tipos em runtime
4. Atualizar interfaces do frontend

### 3.3 Fase 3: Melhorias e Otimizações (Prioridade Baixa)

#### 3.3.1 Implementação de Auditoria de Dados

**Prazo**: 2-3 dias
**Responsável**: Desenvolvedor Backend

**Funcionalidades**:

* Log de todas as operações CRUD

* Rastreamento de mudanças em dados sensíveis

* Alertas para inconsistências detectadas

* Relatórios de integridade periódicos

#### 3.3.2 Testes de Integridade Automatizados

**Prazo**: 3-4 dias
**Responsável**: Desenvolvedor QA/Backend

**Testes a Implementar**:

```typescript
// tests/data-integrity.test.ts
describe('Data Integrity Tests', () => {
  test('should validate all user records', async () => {
    const users = await database.all('SELECT * FROM users');
    users.forEach(user => {
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(['admin', 'physiotherapist', 'patient']).toContain(user.role);
    });
  });

  test('should validate patient CPF format', async () => {
    const patients = await database.all('SELECT * FROM patients');
    patients.forEach(patient => {
      expect(patient.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });
  });
});
```

## 4. Cronograma de Execução

| Fase | Atividade              | Prazo  | Status   |
| ---- | ---------------------- | ------ | -------- |
| 1    | Normalização JSON      | 3 dias | Pendente |
| 1    | Limpeza Migrations     | 1 dia  | Pendente |
| 2    | Implementar Validações | 4 dias | Pendente |
| 2    | Sincronizar Tipos TS   | 2 dias | Pendente |
| 3    | Sistema de Auditoria   | 3 dias | Pendente |
| 3    | Testes Automatizados   | 4 dias | Pendente |

**Prazo Total Estimado**: 17 dias úteis

## 5. Riscos e Mitigações

### 5.1 Riscos Identificados

| Risco                                | Probabilidade | Impacto | Mitigação                                        |
| ------------------------------------ | ------------- | ------- | ------------------------------------------------ |
| Perda de dados durante migração      | Baixa         | Alto    | Backup completo antes de qualquer alteração      |
| Quebra de funcionalidades existentes | Média         | Alto    | Testes extensivos em ambiente de desenvolvimento |
| Inconsistências após migração        | Média         | Médio   | Scripts de validação pós-migração                |
| Resistência da equipe às mudanças    | Baixa         | Baixo   | Documentação clara e treinamento                 |

### 5.2 Estratégias de Mitigação

1. **Backup e Rollback**:

   * Backup completo antes de cada fase

   * Scripts de rollback para cada alteração

   * Ambiente de teste isolado

2. **Testes Graduais**:

   * Migração em ambiente de desenvolvimento primeiro

   * Testes de regressão completos

   * Validação com dados reais (anonimizados)

3. **Monitoramento Contínuo**:

   * Logs detalhados durante migração

   * Alertas para inconsistências

   * Métricas de integridade em tempo real

## 6. Recomendações para o Futuro

### 6.1 Boas Práticas de Desenvolvimento

1. **Validação em Múltiplas Camadas**:

   * Validação no frontend (UX)

   * Validação na API (segurança)

   * Constraints no banco (integridade)

2. **Versionamento de Schema**:

   * Migrations versionadas e controladas

   * Documentação de mudanças

   * Testes de compatibilidade

3. **Monitoramento Proativo**:

   * Alertas para inconsistências

   * Relatórios periódicos de integridade

   * Métricas de qualidade de dados

### 6.2 Ferramentas Recomendadas

1. **Validação**: Joi, Yup, ou Zod para validação de schemas
2. **Migrations**: Knex.js ou TypeORM para controle de migrations
3. **Testes**: Jest com testes de integridade automatizados
4. **Monitoramento**: Sentry ou similar para alertas de erro

### 6.3 Processos Recomendados

1. **Code Review Obrigatório**: Especialmente para mudanças em schemas
2. **Testes de Integridade**: Executados em cada deploy
3. **Documentação Atualizada**: Manter docs sincronizadas com código
4. **Backup Automatizado**: Backups regulares e testados

## 7. Conclusão

A análise revelou problemas significativos na integridade dos dados do sistema FisioFlow, principalmente relacionados à inconsistência entre a estrutura de dados JSON e o schema SQL definido. O plano proposto aborda esses problemas de forma estruturada, priorizando correções críticas e implementando melhorias graduais.

A execução deste plano resultará em:

* **Maior confiabilidade** dos dados

* \*\*Facilidade de m

