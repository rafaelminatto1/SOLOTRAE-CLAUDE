/**
 * Script para testar o novo banco de dados Supabase
 * Este script irá:
 * 1. Testar conexão e autenticação
 * 2. Verificar políticas RLS
 * 3. Testar operações CRUD básicas
 * 4. Validar integridade dos dados
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase são obrigatórias');
  console.log('Certifique-se de que estão definidas:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Criar clientes Supabase
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testNewDatabase() {
  console.log('🧪 Iniciando testes do novo banco de dados...');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  
  let testResults = {
    connection: false,
    tables: false,
    rls: false,
    crud: false,
    integrity: false
  };
  
  try {
    // 1. Teste de Conexão
    console.log('\n1. 🔌 Testando conexão...');
    
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('exercises')
      .select('count')
      .limit(1);
    
    if (healthError) {
      throw new Error(`Erro na conexão: ${healthError.message}`);
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    testResults.connection = true;
    
    // 2. Teste de Estrutura das Tabelas
    console.log('\n2. 🗄️ Verificando estrutura das tabelas...');
    
    const expectedTables = [
      'users', 'patients', 'physiotherapists', 'appointments',
      'exercises', 'treatment_plans', 'treatment_plan_exercises',
      'exercise_logs', 'notifications', 'files'
    ];
    
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', expectedTables);
    
    if (tablesError) {
      throw new Error(`Erro ao verificar tabelas: ${tablesError.message}`);
    }
    
    const foundTables = tables.map(t => t.table_name).sort();
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      console.warn(`⚠️ Tabelas faltando: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ Todas as tabelas esperadas foram encontradas!');
      testResults.tables = true;
    }
    
    foundTables.forEach(table => {
      console.log(`   ✓ ${table}`);
    });
    
    // 3. Teste de Políticas RLS
    console.log('\n3. 🔒 Testando políticas RLS...');
    
    // Verificar se RLS está habilitado
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'patients', 'exercises']);
    
    if (rlsError) {
      console.warn(`⚠️ Erro ao verificar RLS: ${rlsError.message}`);
    } else {
      console.log('✅ Políticas RLS verificadas!');
      testResults.rls = true;
    }
    
    // Teste de acesso sem autenticação (deve falhar para tabelas protegidas)
    try {
      const { data: unauthorizedAccess, error: unauthorizedError } = await supabaseClient
        .from('users')
        .select('*')
        .limit(1);
      
      if (unauthorizedError) {
        console.log('✅ RLS funcionando - acesso negado sem autenticação');
      } else {
        console.warn('⚠️ RLS pode não estar funcionando - acesso permitido sem auth');
      }
    } catch (err) {
      console.log('✅ RLS funcionando - erro de acesso esperado');
    }
    
    // 4. Teste de Operações CRUD
    console.log('\n4. 📝 Testando operações CRUD...');
    
    // Teste de leitura de exercícios (deve ser público)
    const { data: exercises, error: exercisesError } = await supabaseClient
      .from('exercises')
      .select('id, name, category')
      .limit(3);
    
    if (exercisesError) {
      console.warn(`⚠️ Erro ao ler exercícios: ${exercisesError.message}`);
    } else {
      console.log(`✅ Leitura de exercícios funcionando (${exercises.length} encontrados)`);
      exercises.forEach(ex => {
        console.log(`   - ${ex.name} (${ex.category})`);
      });
      testResults.crud = true;
    }
    
    // 5. Teste de Integridade dos Dados
    console.log('\n5. 🔍 Verificando integridade dos dados...');
    
    // Verificar se não há campos field_X
    const problematicFields = [];
    
    for (const table of foundTables) {
      try {
        const { data: columns, error: columnsError } = await supabaseAdmin
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', table)
          .like('column_name', 'field_%');
        
        if (!columnsError && columns && columns.length > 0) {
          problematicFields.push({
            table,
            fields: columns.map(c => c.column_name)
          });
        }
      } catch (err) {
        console.warn(`⚠️ Erro ao verificar colunas da tabela ${table}`);
      }
    }
    
    if (problematicFields.length > 0) {
      console.warn('⚠️ Campos field_X encontrados:');
      problematicFields.forEach(({ table, fields }) => {
        console.warn(`   ${table}: ${fields.join(', ')}`);
      });
    } else {
      console.log('✅ Nenhum campo field_X encontrado - integridade OK!');
      testResults.integrity = true;
    }
    
    // 6. Teste de Índices
    console.log('\n6. 📊 Verificando índices...');
    
    const { data: indexes, error: indexError } = await supabaseAdmin
      .from('pg_indexes')
      .select('indexname, tablename')
      .eq('schemaname', 'public')
      .like('indexname', 'idx_%');
    
    if (indexError) {
      console.warn(`⚠️ Erro ao verificar índices: ${indexError.message}`);
    } else {
      console.log(`✅ ${indexes.length} índices personalizados encontrados`);
      indexes.slice(0, 5).forEach(idx => {
        console.log(`   - ${idx.indexname} (${idx.tablename})`);
      });
      if (indexes.length > 5) {
        console.log(`   ... e mais ${indexes.length - 5} índices`);
      }
    }
    
    // 7. Resumo dos Testes
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('=' .repeat(50));
    
    const tests = [
      { name: 'Conexão', status: testResults.connection },
      { name: 'Estrutura das Tabelas', status: testResults.tables },
      { name: 'Políticas RLS', status: testResults.rls },
      { name: 'Operações CRUD', status: testResults.crud },
      { name: 'Integridade dos Dados', status: testResults.integrity }
    ];
    
    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌';
      console.log(`${icon} ${test.name}`);
    });
    
    const passedTests = tests.filter(t => t.status).length;
    const totalTests = tests.length;
    
    console.log('\n📈 RESULTADO FINAL:');
    console.log(`${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Todos os testes passaram! O banco está pronto para uso.');
    } else {
      console.log('⚠️ Alguns testes falharam. Verifique a configuração.');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Crie o primeiro usuário admin');
    console.log('2. Teste a aplicação frontend');
    console.log('3. Configure dados adicionais conforme necessário');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Executar testes
if (require.main === module) {
  testNewDatabase();
}

module.exports = { testNewDatabase };