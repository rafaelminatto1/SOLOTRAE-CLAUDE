import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');
  process.exit(1);
}

// Cliente Supabase com service role para acesso admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente Supabase normal para teste de login
const supabaseClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);

const testUsers = [
  { email: 'admin@fisioflow.com', password: 'admin123', role: 'admin' },
  { email: 'fisio@fisioflow.com', password: 'fisio123', role: 'physiotherapist' },
  { email: 'paciente@fisioflow.com', password: 'paciente123', role: 'patient' }
];

async function checkUsersInDatabase() {
  console.log('🔍 Verificando usuários na tabela users...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .in('email', testUsers.map(u => u.email));
    
    if (error) {
      console.error('❌ Erro ao consultar tabela users:', error.message);
      return false;
    }
    
    console.log(`📊 Encontrados ${users.length} usuários na tabela users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Erro na consulta:', error.message);
    return false;
  }
}

async function checkAuthUsers() {
  console.log('\n🔍 Verificando usuários na tabela auth.users...');
  
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Erro ao consultar auth.users:', error.message);
      return false;
    }
    
    const testAuthUsers = authUsers.users.filter(user => 
      testUsers.some(testUser => testUser.email === user.email)
    );
    
    console.log(`📊 Encontrados ${testAuthUsers.length} usuários de teste no auth:`);
    testAuthUsers.forEach(user => {
      console.log(`  - ${user.email} - Confirmado: ${user.email_confirmed_at ? '✅' : '❌'}`);
    });
    
    return testAuthUsers;
  } catch (error) {
    console.error('❌ Erro na consulta auth:', error.message);
    return false;
  }
}

async function testLogin(email, password) {
  console.log(`\n🔐 Testando login: ${email}`);
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error(`❌ Erro no login ${email}:`, error.message);
      return false;
    }
    
    console.log(`✅ Login bem-sucedido para ${email}`);
    
    // Fazer logout
    await supabaseClient.auth.signOut();
    return true;
  } catch (error) {
    console.error(`❌ Erro no teste de login ${email}:`, error.message);
    return false;
  }
}

async function createTestUser(email, password, role) {
  console.log(`\n👤 Criando usuário: ${email}`);
  
  try {
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      console.error(`❌ Erro ao criar usuário no auth ${email}:`, authError.message);
      return false;
    }
    
    console.log(`✅ Usuário criado no auth: ${email}`);
    
    // Criar perfil na tabela users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role,
        full_name: role === 'admin' ? 'Administrador' : 
                  role === 'physiotherapist' ? 'Dr. Fisioterapeuta' : 'Paciente Teste',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error(`❌ Erro ao criar perfil ${email}:`, profileError.message);
      return false;
    }
    
    console.log(`✅ Perfil criado na tabela users: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar usuário ${email}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico de usuários de login...');
  console.log('=' .repeat(50));
  
  // 1. Verificar usuários na tabela users
  const dbUsers = await checkUsersInDatabase();
  
  // 2. Verificar usuários no auth
  const authUsers = await checkAuthUsers();
  
  // 3. Testar login para cada usuário
  console.log('\n🧪 Testando login dos usuários...');
  const loginResults = [];
  
  for (const testUser of testUsers) {
    const success = await testLogin(testUser.email, testUser.password);
    loginResults.push({ ...testUser, loginSuccess: success });
  }
  
  // 4. Analisar resultados
  console.log('\n📋 RESUMO DOS RESULTADOS:');
  console.log('=' .repeat(50));
  
  const failedLogins = loginResults.filter(u => !u.loginSuccess);
  
  if (failedLogins.length === 0) {
    console.log('✅ Todos os usuários podem fazer login com sucesso!');
  } else {
    console.log(`❌ ${failedLogins.length} usuário(s) com problema de login:`);
    failedLogins.forEach(user => {
      console.log(`  - ${user.email}`);
    });
    
    // 5. Recriar usuários com problema
    console.log('\n🔧 Recriando usuários com problema...');
    
    for (const user of failedLogins) {
      // Primeiro, tentar deletar o usuário existente
      try {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === user.email);
        
        if (existingUser) {
          await supabase.auth.admin.deleteUser(existingUser.id);
          await supabase.from('users').delete().eq('email', user.email);
          console.log(`🗑️ Usuário existente removido: ${user.email}`);
        }
      } catch (error) {
        console.log(`⚠️ Erro ao remover usuário existente ${user.email}:`, error.message);
      }
      
      // Criar novo usuário
      await createTestUser(user.email, user.password, user.role);
    }
    
    // 6. Testar novamente
    console.log('\n🔄 Testando login novamente...');
    for (const user of failedLogins) {
      await testLogin(user.email, user.password);
    }
  }
  
  console.log('\n✅ Diagnóstico concluído!');
}

main().catch(console.error);