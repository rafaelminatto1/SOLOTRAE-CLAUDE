# FisioFlow - Plano de Ação Detalhado - Fase 1

## 🎯 Objetivo da Fase 1
Corrigir problemas críticos de integridade de dados e estabelecer uma base sólida para o desenvolvimento futuro.

## 📋 Checklist de Tarefas - Semana 1

### 1. Preparação e Backup (Dia 1)

#### 1.1 Backup Completo
- [ ] Criar backup completo do banco Supabase
- [ ] Exportar dados JSON atuais
- [ ] Documentar estrutura atual dos dados
- [ ] Criar branch `fix/data-integrity` no Git

**Comandos:**
```bash
# Backup do banco
pg_dump -h [supabase-host] -U [user] -d [database] > backup_$(date +%Y%m%d).sql

# Criar branch
git checkout -b fix/data-integrity
git push -u origin fix/data-integrity
```

#### 1.2 Auditoria de Dados
- [ ] Identificar todas as tabelas com campos `field_X`
- [ ] Mapear relacionamentos entre tabelas
- [ ] Listar inconsistências encontradas
- [ ] Priorizar correções por impacto

### 2. Normalização de Dados JSON (Dias 2-3)

#### 2.1 Tabela `patients`
- [ ] Substituir `field_1` por `nome_completo`
- [ ] Substituir `field_2` por `cpf`
- [ ] Substituir `field_3` por `data_nascimento`
- [ ] Substituir `field_4` por `telefone`
- [ ] Substituir `field_5` por `endereco`
- [ ] Substituir `field_6` por `historico_medico`

**Script SQL:**
```sql
-- Backup da tabela antes da alteração
CREATE TABLE patients_backup AS SELECT * FROM patients;

-- Normalização dos campos JSON
UPDATE patients 
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(data, '{nome_completo}', data->'field_1'),
          '{cpf}', data->'field_2'
        ),
        '{data_nascimento}', data->'field_3'
      ),
      '{telefone}', data->'field_4'
    ),
    '{endereco}', data->'field_5'
  ),
  '{historico_medico}', data->'field_6'
)
WHERE data ? 'field_1';

-- Remover campos antigos
UPDATE patients 
SET data = data - 'field_1' - 'field_2' - 'field_3' - 'field_4' - 'field_5' - 'field_6';
```

#### 2.2 Tabela `exercises`
- [ ] Substituir `field_1` por `nome_exercicio`
- [ ] Substituir `field_2` por `descricao`
- [ ] Substituir `field_3` por `grupo_muscular`
- [ ] Substituir `field_4` por `dificuldade`
- [ ] Substituir `field_5` por `duracao_segundos`
- [ ] Substituir `field_6` por `repeticoes`
- [ ] Substituir `field_7` por `url_video`

#### 2.3 Tabela `prescriptions`
- [ ] Substituir `field_1` por `paciente_id`
- [ ] Substituir `field_2` por `fisioterapeuta_id`
- [ ] Substituir `field_3` por `data_prescricao`
- [ ] Substituir `field_4` por `exercicios_ids`
- [ ] Substituir `field_5` por `observacoes`
- [ ] Substituir `field_6` por `status`

### 3. Limpeza de Migrations (Dia 4)

#### 3.1 Identificar Duplicações
- [ ] Listar todas as migrations na tabela `schema_migrations`
- [ ] Identificar migrations duplicadas ou conflitantes
- [ ] Verificar dependências entre migrations

**Query de Auditoria:**
```sql
-- Verificar duplicações
SELECT version, COUNT(*) as count 
FROM schema_migrations 
GROUP BY version 
HAVING COUNT(*) > 1;

-- Listar migrations por data
SELECT version, executed_at 
FROM schema_migrations 
ORDER BY executed_at DESC;
```

#### 3.2 Consolidar Migrations
- [ ] Remover migrations duplicadas
- [ ] Criar migration consolidada se necessário
- [ ] Testar rollback das migrations
- [ ] Atualizar arquivos de migration no código

### 4. Implementação de Validações (Dia 5)

#### 4.1 Validações Frontend
- [ ] Criar schemas Zod para validação
- [ ] Implementar validação em formulários
- [ ] Adicionar mensagens de erro claras
- [ ] Testar validações com dados inválidos

**Exemplo de Schema:**
```typescript
// src/lib/schemas/patient.ts
import { z } from 'zod';

export const PatientSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.object({
    rua: z.string(),
    numero: z.string(),
    cidade: z.string(),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
  }),
  historico_medico: z.string().optional()
});

export type Patient = z.infer<typeof PatientSchema>;
```

#### 4.2 Validações Backend
- [ ] Implementar triggers de validação no Supabase
- [ ] Criar funções de validação SQL
- [ ] Configurar constraints de banco
- [ ] Testar validações com dados inválidos

## 📋 Checklist de Tarefas - Semana 2

### 5. Sincronização de Tipos TypeScript (Dias 6-7)

#### 5.1 Atualizar Interfaces
- [ ] Atualizar interface `Patient` em `src/types/patient.ts`
- [ ] Atualizar interface `Exercise` em `src/types/exercise.ts`
- [ ] Atualizar interface `Prescription` em `src/types/prescription.ts`
- [ ] Atualizar interface `Appointment` em `src/types/appointment.ts`

#### 5.2 Implementar Type Guards
- [ ] Criar type guards para validação runtime
- [ ] Implementar em pontos críticos da aplicação
- [ ] Adicionar logs para debugging

**Exemplo de Type Guard:**
```typescript
// src/lib/guards/patient.ts
import { Patient } from '../types/patient';

export function isPatient(obj: any): obj is Patient {
  return (
    typeof obj === 'object' &&
    typeof obj.nome_completo === 'string' &&
    typeof obj.cpf === 'string' &&
    typeof obj.data_nascimento === 'string' &&
    typeof obj.telefone === 'string'
  );
}

export function assertPatient(obj: any): Patient {
  if (!isPatient(obj)) {
    throw new Error('Invalid patient data structure');
  }
  return obj;
}
```

### 6. Testes e Validação (Dias 8-9)

#### 6.1 Testes Automatizados
- [ ] Criar testes para validações de dados
- [ ] Testar normalização de JSON
- [ ] Testar type guards
- [ ] Testar integração frontend-backend

#### 6.2 Testes Manuais
- [ ] Testar cadastro de pacientes
- [ ] Testar criação de exercícios
- [ ] Testar prescrições
- [ ] Testar agendamentos

### 7. Deploy e Monitoramento (Dia 10)

#### 7.1 Deploy Gradual
- [ ] Deploy em ambiente de staging
- [ ] Testes de regressão
- [ ] Deploy em produção
- [ ] Monitoramento de erros

#### 7.2 Documentação
- [ ] Atualizar documentação da API
- [ ] Documentar mudanças no banco
- [ ] Criar guia de migração
- [ ] Atualizar README do projeto

## 🔧 Scripts Úteis

### Script de Backup Automático
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

echo "Criando backup do banco de dados..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/fisioflow_backup_$DATE.sql"

echo "Backup criado: $BACKUP_DIR/fisioflow_backup_$DATE.sql"
```

### Script de Validação de Dados
```sql
-- validate_data.sql
-- Verificar integridade dos dados após normalização

-- Verificar se todos os pacientes têm nome_completo
SELECT COUNT(*) as pacientes_sem_nome 
FROM patients 
WHERE data->>'nome_completo' IS NULL OR data->>'nome_completo' = '';

-- Verificar CPFs válidos
SELECT COUNT(*) as cpfs_invalidos 
FROM patients 
WHERE data->>'cpf' !~ '^[0-9]{11}$';

-- Verificar exercícios sem nome
SELECT COUNT(*) as exercicios_sem_nome 
FROM exercises 
WHERE data->>'nome_exercicio' IS NULL OR data->>'nome_exercicio' = '';
```

## 📊 Métricas de Sucesso

### Critérios de Aceitação
- [ ] 0 campos `field_X` restantes no banco
- [ ] 0 migrations duplicadas
- [ ] 100% dos formulários com validação
- [ ] 0 erros de tipo TypeScript
- [ ] Tempo de carregamento < 2s mantido
- [ ] 0 erros críticos em produção

### KPIs de Monitoramento
- **Integridade de Dados:** 100% dos registros com campos nomeados
- **Performance:** Tempo de resposta < 500ms
- **Estabilidade:** 0 crashes relacionados a tipos
- **Usabilidade:** 0 erros de validação não tratados

## 🚨 Plano de Contingência

### Se algo der errado:
1. **Parar imediatamente** qualquer operação
2. **Restaurar backup** mais recente
3. **Analisar logs** para identificar o problema
4. **Corrigir em ambiente de teste** antes de tentar novamente
5. **Comunicar stakeholders** sobre o status

### Rollback Plan:
```sql
-- Em caso de emergência, restaurar dados originais
DROP TABLE IF EXISTS patients;
CREATE TABLE patients AS SELECT * FROM patients_backup;

DROP TABLE IF EXISTS exercises;
CREATE TABLE exercises AS SELECT * FROM exercises_backup;
```

## 📞 Contatos de Emergência
- **Supabase Support:** [support@supabase.io]
- **Vercel Support:** [support@vercel.com]
- **Backup Repository:** [GitHub/fisioflow-backups]

Este plano garante uma execução segura e controlada das correções críticas, estabelecendo uma base sólida para as próximas fases do desenvolvimento.