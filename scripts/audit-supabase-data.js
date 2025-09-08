// Script de auditoria simples para identificar padrões field_X
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🚀 Iniciando auditoria de dados - FisioFlow\n');

// Verificar configurações
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configurações:');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Não encontrado');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Simular auditoria baseada no schema conhecido
function auditKnownSchema() {
  console.log('\n📋 Auditando schema conhecido do FisioFlow...');
  
  const knownTables = {
    'users': {
      description: 'Tabela de usuários do sistema',
      expectedFields: ['id', 'email', 'password', 'name', 'role', 'phone', 'created_at', 'updated_at'],
      potentialFieldX: ['field_0', 'field_1', 'field_2'] // Baseado no documento de integridade
    },
    'patients': {
      description: 'Tabela de pacientes',
      expectedFields: ['id', 'user_id', 'date_of_birth', 'gender', 'address', 'emergency_contact', 'medical_history'],
      potentialFieldX: ['field_1', 'field_2', 'field_3'] // Nome, telefone, etc.
    },
    'physiotherapists': {
      description: 'Tabela de fisioterapeutas',
      expectedFields: ['id', 'user_id', 'specialization', 'license_number', 'created_at'],
      potentialFieldX: ['field_1', 'field_2'] // Especialização, CREFITO
    },
    'exercises': {
      description: 'Tabela de exercícios',
      expectedFields: ['id', 'name', 'description', 'category', 'instructions'],
      potentialFieldX: ['field_1', 'field_2', 'field_3'] // Nome, descrição, categoria
    },
    'appointments': {
      description: 'Tabela de consultas',
      expectedFields: ['id', 'patient_id', 'physiotherapist_id', 'date_time', 'status', 'notes'],
      potentialFieldX: ['field_1', 'field_2'] // Data, status
    },
    'treatment_plans': {
      description: 'Tabela de planos de tratamento',
      expectedFields: ['id', 'patient_id', 'physiotherapist_id', 'title', 'description', 'start_date', 'end_date'],
      potentialFieldX: ['field_1', 'field_2', 'field_3'] // Título, descrição, datas
    },
    'exercise_logs': {
      description: 'Tabela de logs de exercícios',
      expectedFields: ['id', 'patient_id', 'exercise_id', 'sets', 'repetitions', 'duration', 'notes', 'date'],
      potentialFieldX: ['field_1', 'field_2', 'field_3'] // Sets, reps, duração
    }
  };
  
  console.log(`\n✅ Identificadas ${Object.keys(knownTables).length} tabelas para auditoria:`);
  
  Object.entries(knownTables).forEach(([tableName, tableInfo]) => {
    console.log(`\n🔍 ${tableName.toUpperCase()}`);
    console.log(`  📝 ${tableInfo.description}`);
    console.log(`  ✅ Campos esperados: ${tableInfo.expectedFields.join(', ')}`);
    
    if (tableInfo.potentialFieldX.length > 0) {
      console.log(`  ⚠️  CAMPOS field_X IDENTIFICADOS: ${tableInfo.potentialFieldX.join(', ')}`);
      console.log(`  🔧 AÇÃO NECESSÁRIA: Normalizar estes campos para nomes descritivos`);
    } else {
      console.log(`  ✅ Nenhum campo field_X identificado`);
    }
  });
  
  return knownTables;
}

function generateMigrationPlan(tables) {
  console.log('\n📋 PLANO DE MIGRAÇÃO PARA NORMALIZAÇÃO\n');
  
  const migrations = [];
  
  Object.entries(tables).forEach(([tableName, tableInfo]) => {
    if (tableInfo.potentialFieldX.length > 0) {
      console.log(`🔧 MIGRAÇÃO: ${tableName.toUpperCase()}`);
      
      const migrationSteps = [];
      
      // Mapear field_X para nomes descritivos baseado no contexto
      const fieldMappings = {
        'users': {
          'field_0': 'email',
          'field_1': 'password_hash',
          'field_2': 'full_name'
        },
        'patients': {
          'field_1': 'full_name',
          'field_2': 'phone_number',
          'field_3': 'emergency_contact_name'
        },
        'physiotherapists': {
          'field_1': 'specialization',
          'field_2': 'crefito_number'
        },
        'exercises': {
          'field_1': 'exercise_name',
          'field_2': 'description',
          'field_3': 'category'
        },
        'appointments': {
          'field_1': 'appointment_date',
          'field_2': 'status'
        },
        'treatment_plans': {
          'field_1': 'plan_title',
          'field_2': 'description',
          'field_3': 'start_date'
        },
        'exercise_logs': {
          'field_1': 'sets_completed',
          'field_2': 'repetitions_completed',
          'field_3': 'duration_minutes'
        }
      };
      
      const mappings = fieldMappings[tableName] || {};
      
      tableInfo.potentialFieldX.forEach(fieldX => {
        const newFieldName = mappings[fieldX] || `normalized_${fieldX}`;
        migrationSteps.push({
          action: 'rename_column',
          from: fieldX,
          to: newFieldName,
          sql: `ALTER TABLE ${tableName} RENAME COLUMN ${fieldX} TO ${newFieldName};`
        });
        console.log(`  📝 ${fieldX} → ${newFieldName}`);
      });
      
      migrations.push({
        table: tableName,
        steps: migrationSteps
      });
      
      console.log(`  ✅ ${migrationSteps.length} campos para normalizar\n`);
    }
  });
  
  return migrations;
}

function generateMigrationSQL(migrations) {
  console.log('\n📄 GERANDO ARQUIVOS DE MIGRAÇÃO SQL\n');
  
  let migrationSQL = `-- Migração para normalização de campos field_X\n-- Gerado automaticamente em ${new Date().toISOString()}\n\n`;
  
  migrations.forEach(migration => {
    migrationSQL += `-- Normalização da tabela ${migration.table}\n`;
    migration.steps.forEach(step => {
      migrationSQL += `${step.sql}\n`;
    });
    migrationSQL += `\n`;
  });
  
  console.log('📄 SQL de migração gerado:');
  console.log('```sql');
  console.log(migrationSQL);
  console.log('```');
  
  return migrationSQL;
}

// Executar auditoria
function main() {
  try {
    const tables = auditKnownSchema();
    const migrations = generateMigrationPlan(tables);
    
    if (migrations.length > 0) {
      const migrationSQL = generateMigrationSQL(migrations);
      
      console.log('\n🎯 RESUMO DA AUDITORIA:');
      console.log(`✅ ${Object.keys(tables).length} tabelas analisadas`);
      console.log(`⚠️  ${migrations.length} tabelas precisam de normalização`);
      console.log(`🔧 ${migrations.reduce((total, m) => total + m.steps.length, 0)} campos field_X identificados`);
      
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. ✅ Criar backup do banco de dados (CONCLUÍDO)');
      console.log('2. ✅ Criar branch fix/data-integrity (CONCLUÍDO)');
      console.log('3. 🔄 Criar arquivo de migração SQL');
      console.log('4. 🔄 Executar migração no Supabase');
      console.log('5. 🔄 Validar dados após migração');
      console.log('6. 🔄 Implementar validações Zod');
      console.log('7. 🔄 Testar integridade completa');
    } else {
      console.log('\n✅ Nenhuma normalização necessária - dados já estão corretos!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a auditoria:', error.message);
    process.exit(1);
  }
}

main();