# FisioFlow - Arquitetura de Dados Normalizada

## 1. Visão Geral da Normalização

Este documento detalha a nova estrutura de dados normalizada do FisioFlow, substituindo os campos genéricos `field_X` por nomes descritivos e estabelecendo relacionamentos claros entre entidades.

## 2. Estrutura de Dados Atual vs. Normalizada

### 2.1 Tabela `patients`

#### Estrutura Atual (Problemática)

```json
{
  "id": "uuid",
  "data": {
    "field_1": "João Silva",
    "field_2": "12345678901",
    "field_3": "1985-03-15",
    "field_4": "11999887766",
    "field_5": "Rua das Flores, 123",
    "field_6": "Histórico de lesão no joelho"
  }
}
```

#### Estrutura Normalizada (Nova)

```json
{
  "id": "uuid",
  "data": {
    "nome_completo": "João Silva",
    "cpf": "12345678901",
    "data_nascimento": "1985-03-15",
    "telefone": "11999887766",
    "endereco": {
      "rua": "Rua das Flores",
      "numero": "123",
      "complemento": "Apto 45",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    },
    "contato": {
      "telefone_principal": "11999887766",
      "telefone_secundario": "1133334444",
      "email": "joao.silva@email.com",
      "contato_emergencia": {
        "nome": "Maria Silva",
        "telefone": "11888776655",
        "parentesco": "esposa"
      }
    },
    "informacoes_medicas": {
      "historico_medico": "Histórico de lesão no joelho",
      "medicamentos_atuais": ["Ibuprofeno 600mg"],
      "alergias": ["Dipirona"],
      "cirurgias_anteriores": [
        {
          "procedimento": "Artroscopia de joelho",
          "data": "2020-05-15",
          "hospital": "Hospital São Paulo"
        }
      ],
      "condicoes_cronicas": ["Artrose leve"]
    },
    "dados_fisicos": {
      "altura": 175,
      "peso": 80,
      "tipo_sanguineo": "O+",
      "dominancia": "destro"
    }
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2.2 Tabela `exercises`

#### Estrutura Atual (Problemática)

```json
{
  "id": "uuid",
  "data": {
    "field_1": "Agachamento",
    "field_2": "Exercício para fortalecimento",
    "field_3": "Quadríceps",
    "field_4": "Intermediário",
    "field_5": "30",
    "field_6": "15",
    "field_7": "https://video.com/agachamento"
  }
}
```

#### Estrutura Normalizada (Nova)

```json
{
  "id": "uuid",
  "data": {
    "nome_exercicio": "Agachamento Livre",
    "descricao": "Exercício para fortalecimento dos músculos do quadríceps e glúteos",
    "categoria": "Fortalecimento",
    "grupos_musculares": ["Quadríceps", "Glúteos", "Core"],
    "nivel_dificuldade": "intermediario",
    "equipamentos": ["Nenhum"],
    "parametros": {
      "duracao_segundos": 30,
      "repeticoes": 15,
      "series": 3,
      "intervalo_segundos": 60,
      "carga_kg": null
    },
    "midia": {
      "url_video": "https://storage.supabase.co/videos/agachamento.mp4",
      "url_imagem": "https://storage.supabase.co/images/agachamento.jpg",
      "duracao_video": 45
    },
    "instrucoes": {
      "posicao_inicial": "Pés afastados na largura dos ombros",
      "execucao": "Desça flexionando joelhos e quadris, mantenha costas retas",
      "respiracao": "Inspire na descida, expire na subida",
      "cuidados": "Não deixe joelhos ultrapassarem a ponta dos pés"
    },
    "contraindicacoes": ["Lesão aguda no joelho", "Dor lombar severa"],
    "variacoes": [
      {
        "nome": "Agachamento com Peso",
        "modificacao": "Adicionar halteres ou barra"
      }
    ]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2.3 Tabela `prescriptions`

#### Estrutura Atual (Problemática)

```json
{
  "id": "uuid",
  "data": {
    "field_1": "patient_uuid",
    "field_2": "therapist_uuid",
    "field_3": "2024-01-15",
    "field_4": "[exercise_uuid1, exercise_uuid2]",
    "field_5": "Fazer 3x por semana",
    "field_6": "ativa"
  }
}
```

#### Estrutura Normalizada (Nova)

```json
{
  "id": "uuid",
  "data": {
    "paciente_id": "patient_uuid",
    "fisioterapeuta_id": "therapist_uuid",
    "data_prescricao": "2024-01-15T14:30:00Z",
    "data_inicio": "2024-01-16",
    "data_fim": "2024-02-16",
    "status": "ativa",
    "objetivo_tratamento": "Fortalecimento do quadríceps pós-cirurgia",
    "frequencia_semanal": 3,
    "observacoes_gerais": "Paciente deve evitar sobrecarga inicial",
    "exercicios": [
      {
        "exercicio_id": "exercise_uuid1",
        "ordem": 1,
        "parametros_personalizados": {
          "series": 2,
          "repeticoes": 10,
          "carga_kg": 0,
          "intervalo_segundos": 90
        },
        "observacoes": "Começar sem peso",
        "progressao": {
          "semana_1": {"series": 2, "repeticoes": 10},
          "semana_2": {"series": 3, "repeticoes": 12},
          "semana_3": {"series": 3, "repeticoes": 15}
        }
      }
    ],
    "avaliacoes": [
      {
        "data": "2024-01-20",
        "dor_escala": 3,
        "aderencia_percentual": 85,
        "observacoes": "Paciente relatou melhora na mobilidade"
      }
    ]
  },
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-20T10:15:00Z"
}
```

## 3. Schema SQL Normalizado

### 3.1 Tabelas Principais

```sql
-- Tabela de usuários (fisioterapeutas)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'fisioterapeuta',
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de exercícios
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prescrições
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'agendado',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de tratamento
CREATE TABLE treatment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    session_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Índices para Performance

```sql
-- Índices para busca eficiente
CREATE INDEX idx_patients_therapist_id ON patients(therapist_id);
CREATE INDEX idx_patients_name ON patients USING GIN ((data->>'nome_completo'));
CREATE INDEX idx_patients_cpf ON patients USING GIN ((data->>'cpf'));

CREATE INDEX idx_exercises_category ON exercises USING GIN ((data->>'categoria'));
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN ((data->'grupos_musculares'));
CREATE INDEX idx_exercises_public ON exercises(is_public);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_therapist_id ON prescriptions(therapist_id);
CREATE INDEX idx_prescriptions_status ON prescriptions USING GIN ((data->>'status'));

CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### 3.3 Constraints e Validações

```sql
-- Constraints para garantir integridade
ALTER TABLE patients ADD CONSTRAINT check_patient_data_required 
CHECK (data ? 'nome_completo' AND data ? 'cpf');

ALTER TABLE exercises ADD CONSTRAINT check_exercise_data_required 
CHECK (data ? 'nome_exercicio' AND data ? 'descricao');

ALTER TABLE prescriptions ADD CONSTRAINT check_prescription_data_required 
CHECK (data ? 'paciente_id' AND data ? 'fisioterapeuta_id');

-- Validação de CPF (formato básico)
ALTER TABLE patients ADD CONSTRAINT check_cpf_format 
CHECK ((data->>'cpf') ~ '^[0-9]{11}$');

-- Validação de status de agendamento
ALTER TABLE appointments ADD CONSTRAINT check_appointment_status 
CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou'));
```

## 4. Funções SQL Utilitárias

### 4.1 Função de Busca de Pacientes

```sql
CREATE OR REPLACE FUNCTION search_patients(
    therapist_uuid UUID,
    search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    nome_completo TEXT,
    cpf TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.data->>'nome_completo' as nome_completo,
        p.data->>'cpf' as cpf,
        p.data->'contato'->>'telefone_principal' as telefone,
        p.created_at
    FROM patients p
    WHERE p.therapist_id = therapist_uuid
    AND (
        search_term IS NULL OR
        p.data->>'nome_completo' ILIKE '%' || search_term || '%' OR
        p.data->>'cpf' LIKE '%' || search_term || '%'
    )
    ORDER BY p.data->>'nome_completo';
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Função de Estatísticas do Dashboard

```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats(
    therapist_uuid UUID
)
RETURNS JSON AS $$
DECLARE
    total_patients INTEGER;
    appointments_today INTEGER;
    active_prescriptions INTEGER;
    result JSON;
BEGIN
    -- Contar pacientes
    SELECT COUNT(*) INTO total_patients
    FROM patients
    WHERE therapist_id = therapist_uuid;
    
    -- Contar agendamentos de hoje
    SELECT COUNT(*) INTO appointments_today
    FROM appointments
    WHERE therapist_id = therapist_uuid
    AND DATE(scheduled_at) = CURRENT_DATE
    AND status IN ('agendado', 'confirmado');
    
    -- Contar prescrições ativas
    SELECT COUNT(*) INTO active_prescriptions
    FROM prescriptions
    WHERE therapist_id = therapist_uuid
    AND data->>'status' = 'ativa';
    
    -- Montar resultado
    result := json_build_object(
        'total_patients', total_patients,
        'appointments_today', appointments_today,
        'active_prescriptions', active_prescriptions,
        'generated_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## 5. Tipos TypeScript Atualizados

### 5.1 Interface Patient

```typescript
// src/types/patient.ts
export interface PatientAddress {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface EmergencyContact {
  nome: string;
  telefone: string;
  parentesco: string;
}

export interface PatientContact {
  telefone_principal: string;
  telefone_secundario?: string;
  email?: string;
  contato_emergencia: EmergencyContact;
}

export interface Surgery {
  procedimento: string;
  data: string;
  hospital: string;
}

export interface MedicalInfo {
  historico_medico: string;
  medicamentos_atuais: string[];
  alergias: string[];
  cirurgias_anteriores: Surgery[];
  condicoes_cronicas: string[];
}

export interface PhysicalData {
  altura: number; // cm
  peso: number; // kg
  tipo_sanguineo: string;
  dominancia: 'destro' | 'canhoto' | 'ambidestro';
}

export interface PatientData {
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  endereco: PatientAddress;
  contato: PatientContact;
  informacoes_medicas: MedicalInfo;
  dados_fisicos: PhysicalData;
}

export interface Patient {
  id: string;
  therapist_id: string;
  data: PatientData;
  created_at: string;
  updated_at: string;
}
```

### 5.2 Interface Exercise

```typescript
// src/types/exercise.ts
export interface ExerciseParameters {
  duracao_segundos?: number;
  repeticoes?: number;
  series?: number;
  intervalo_segundos?: number;
  carga_kg?: number;
}

export interface ExerciseMedia {
  url_video?: string;
  url_imagem?: string;
  duracao_video?: number;
}

export interface ExerciseInstructions {
  posicao_inicial: string;
  execucao: string;
  respiracao: string;
  cuidados: string;
}

export interface ExerciseVariation {
  nome: string;
  modificacao: string;
}

export interface ExerciseData {
  nome_exercicio: string;
  descricao: string;
  categoria: string;
  grupos_musculares: string[];
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  equipamentos: string[];
  parametros: ExerciseParameters;
  midia: ExerciseMedia;
  instrucoes: ExerciseInstructions;
  contraindicacoes: string[];
  variacoes: ExerciseVariation[];
}

export interface Exercise {
  id: string;
  created_by?: string;
  data: ExerciseData;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

## 6. Validações Zod

```typescript
// src/lib/validations/patient.ts
import { z } from 'zod';

const AddressSchema = z.object({
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
});

const EmergencyContactSchema = z.object({
  nome: z.string().min(2, 'Nome do contato é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  parentesco: z.string().min(1, 'Parentesco é obrigatório')
});

const ContactSchema = z.object({
  telefone_principal: z.string().min(10, 'Telefone principal é obrigatório'),
  telefone_secundario: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  contato_emergencia: EmergencyContactSchema
});

export const PatientDataSchema = z.object({
  nome_completo: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  endereco: AddressSchema,
  contato: ContactSchema,
  informacoes_medicas: z.object({
    historico_medico: z.string(),
    medicamentos_atuais: z.array(z.string()),
    alergias: z.array(z.string()),
    cirurgias_anteriores: z.array(z.object({
      procedimento: z.string(),
      data: z.string(),
      hospital: z.string()
    })),
    condicoes_cronicas: z.array(z.string())
  }),
  dados_fisicos: z.object({
    altura: z.number().min(50).max(250),
    peso: z.number().min(20).max(300),
    tipo_sanguineo: z.string(),
    dominancia: z.enum(['destro', 'canhoto', 'ambidestro'])
  })
});
```

## 7. Migração de Dados

### 7.1 Script de Migração Principal

```sql
-- migration_normalize_data.sql
BEGIN;

-- Criar tabelas de backup
CREATE TABLE patients_backup AS SELECT * FROM patients;
CREATE TABLE exercises_backup AS SELECT * FROM exercises;
CREATE TABLE prescriptions_backup AS SELECT * FROM prescriptions;

-- Migrar dados de pacientes
UPDATE patients 
SET data = jsonb_build_object(
  'nome_completo', data->>'field_1',
  'cpf', data->>'field_2',
  'data_nascimento', data->>'field_3',
  'contato', jsonb_build_object(
    'telefone_principal', data->>'field_4',
    'contato_emergencia', jsonb_build_object(
      'nome', '',
      'telefone', '',
      'parentesco', ''
    )
  ),
  'endereco', jsonb_build_object(
    'rua', COALESCE(split_part(data->>'field_5', ',', 1), ''),
    'numero', COALESCE(split_part(data->>'field_5', ',', 2), ''),
    'bairro', '',
    'cidade', '',
    'estado', '',
    'cep', ''
  ),
  'informacoes_medicas', jsonb_build_object(
    'historico_medico', COALESCE(data->>'field_6', ''),
    'medicamentos_atuais', '[]'::jsonb,
    'alergias', '[]'::jsonb,
    'cirurgias_anteriores', '[]'::jsonb,
    'condicoes_cronicas', '[]'::jsonb
  ),
  'dados_fisicos', jsonb_build_object(
    'altura', 0,
    'peso', 0,
    'tipo_sanguineo', '',
    'dominancia', 'destro'
  )
)
WHERE data ? 'field_1';

-- Migrar dados de exercícios
UPDATE exercises 
SET data = jsonb_build_object(
  'nome_exercicio', COALESCE(data->>'field_1', ''),
  'descricao', COALESCE(data->>'field_2', ''),
  'categoria', 'Fortalecimento',
  'grupos_musculares', jsonb_build_array(COALESCE(data->>'field_3', '')),
  'nivel_dificuldade', LOWER(COALESCE(data->>'field_4', 'iniciante')),
  'equipamentos', jsonb_build_array('Nenhum'),
  'parametros', jsonb_build_object(
    'duracao_segundos', COALESCE((data->>'field_5')::integer, 30),
    'repeticoes', COALESCE((data->>'field_6')::integer, 10),
    'series', 3,
    'intervalo_segundos', 60
  ),
  'midia', jsonb_build_object(
    'url_video', COALESCE(data->>'field_7', '')
  ),
  'instrucoes', jsonb_build_object(
    'posicao_inicial', '',
    'execucao', '',
    'respiracao', '',
    'cuidados', ''
  ),
  'contraindicacoes', '[]'::jsonb,
  'variacoes', '[]'::jsonb
)
WHERE data ? 'field_1';

-- Migrar dados de prescrições
UPDATE prescriptions 
SET data = jsonb_build_object(
  'paciente_id', COALESCE(data->>'field_1', ''),
  'fisioterapeuta_id', COALESCE(data->>'field_2', ''),
  'data_prescricao', COALESCE(data->>'field_3', NOW()::text),
  'status', COALESCE(data->>'field_6', 'ativa'),
  'observacoes_gerais', COALESCE(data->>'field_5', ''),
  'exercicios', COALESCE(data->'field_4', '[]'::jsonb),
  'frequencia_semanal', 3,
  'avaliacoes', '[]'::jsonb
)
WHERE data ? 'field_1';

COMMIT;
```

Esta arquitetura normalizada fornece uma base sólida e escalável para o FisioFlow, eliminando ambiguidades e estabelecendo relacionamentos claros entre as entidades do sistema.
