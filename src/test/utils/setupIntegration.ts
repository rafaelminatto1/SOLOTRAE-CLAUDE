import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para testes
const supabaseUrl = process.env.SUPABASE_TEST_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_TEST_ANON_KEY || 'test-key';

export const testSupabase = createClient(supabaseUrl, supabaseKey);

// Configuração do banco de dados de teste
beforeAll(async () => {
  // Limpar e configurar banco de dados de teste
  await setupTestDatabase();
});

afterAll(async () => {
  // Limpar banco de dados após testes
  await cleanupTestDatabase();
});

beforeEach(async () => {
  // Reset do estado entre testes
  await resetTestData();
});

async function setupTestDatabase() {
  console.log('🔧 Configurando banco de dados de teste...');
  
  try {
    // Criar tabelas de teste se necessário
    const { error } = await testSupabase.rpc('setup_test_schema');
    
    if (error) {
      console.error('Erro ao configurar schema de teste:', error);
    }
    
    // Inserir dados de teste básicos
    await seedTestData();
    
    console.log('✅ Banco de dados de teste configurado');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de teste:', error);
    throw error;
  }
}

async function cleanupTestDatabase() {
  console.log('🧹 Limpando banco de dados de teste...');
  
  try {
    // Limpar todas as tabelas de teste
    const tables = ['appointments', 'patients', 'users', 'treatment_plans'];
    
    for (const table of tables) {
      const { error } = await testSupabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (error) {
        console.warn(`Aviso ao limpar tabela ${table}:`, error);
      }
    }
    
    console.log('✅ Banco de dados limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
  }
}

async function resetTestData() {
  // Resetar dados entre testes
  await cleanupTestDatabase();
  await seedTestData();
}

async function seedTestData() {
  // Dados de teste padrão
  const testUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'test@fisioflow.com',
    full_name: 'Usuário Teste',
    role: 'admin',
    created_at: new Date().toISOString(),
  };
  
  const testPatient = {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Paciente Teste',
    email: 'paciente@test.com',
    phone: '(11) 99999-9999',
    birth_date: '1990-01-01',
    created_at: new Date().toISOString(),
  };
  
  // Inserir dados de teste
  await testSupabase.from('users').upsert(testUser);
  await testSupabase.from('patients').upsert(testPatient);
}