import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente com anon key para simular usuário normal
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  { email: 'admin@fisioflow.com', password: 'admin123', expectedRole: 'admin' },
  { email: 'fisio@fisioflow.com', password: 'fisio123', expectedRole: 'physiotherapist' },
  { email: 'paciente@fisioflow.com', password: 'paciente123', expectedRole: 'patient' }
];

async function checkUserSynchronization() {
  console.log('\n🔍 Verificando sincronização de usuários...');
  
  try {
    // Verificar usuários em auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Erro ao buscar usuários de auth:', authError.message);
      return false;
    }
    
    console.log(`📊 Usuários em auth.users: ${authUsers.users.length}`);
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
    
    // Verificar usuários na tabela users
    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role');
      
    if (publicError) {
      console.error('❌ Erro ao buscar usuários da tabela users:', publicError.message);
      return false;
    }
    
    console.log(`\n📊 Usuários na tabela users: ${publicUsers.length}`);
    publicUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.id}`);
    });
    
    // Verificar se todos os usuários de auth estão na tabela users
    const authUserIds = new Set(authUsers.users.map(u => u.id));
    const publicUserIds = new Set(publicUsers.map(u => u.id));
    
    const missingInPublic = [...authUserIds].filter(id => !publicUserIds.has(id));
    const missingInAuth = [...publicUserIds].filter(id => !authUserIds.has(id));
    
    if (missingInPublic.length > 0) {
      console.log(`\n⚠️  Usuários em auth.users mas não na tabela users: ${missingInPublic.length}`);
      missingInPublic.forEach(id => {
        const user = authUsers.users.find(u => u.id === id);
        console.log(`  - ${user?.email} (${id})`);
      });
    }
    
    if (missingInAuth.length > 0) {
      console.log(`\n⚠️  Usuários na tabela users mas não em auth.users: ${missingInAuth.length}`);
      missingInAuth.forEach(id => {
        const user = publicUsers.find(u => u.id === id);
        console.log(`  - ${user?.email} (${id})`);
      });
    }
    
    if (missingInPublic.length === 0 && missingInAuth.length === 0) {
      console.log('\n✅ Todos os usuários estão sincronizados!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro na verificação de sincronização:', error.message);
    return false;
  }
}

async function testLogin(email, password, expectedRole) {
  console.log(`\n🔐 Testando login: ${email}`);
  
  try {
    // Fazer logout primeiro para limpar sessão
    await supabaseClient.auth.signOut();
    
    // Tentar fazer login
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error(`❌ Erro no login: ${authError.message}`);
      return false;
    }
    
    if (!authData.user) {
      console.error('❌ Login retornou sem usuário');
      return false;
    }
    
    console.log(`✅ Login bem-sucedido: ${authData.user.email}`);
    
    // Verificar se o usuário existe na tabela users
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, name, role')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error(`❌ Erro ao buscar perfil do usuário: ${userError.message}`);
      return false;
    }
    
    if (!userData) {
      console.error('❌ Usuário não encontrado na tabela users');
      return false;
    }
    
    console.log(`✅ Perfil carregado: ${userData.name} (${userData.role})`);
    
    if (userData.role !== expectedRole) {
      console.error(`❌ Role incorreta. Esperado: ${expectedRole}, Atual: ${userData.role}`);
      return false;
    }
    
    console.log(`✅ Role correta: ${userData.role}`);
    
    // Testar logout
    const { error: logoutError } = await supabaseClient.auth.signOut();
    if (logoutError) {
      console.error(`❌ Erro no logout: ${logoutError.message}`);
      return false;
    }
    
    console.log('✅ Logout bem-sucedido');
    return true;
    
  } catch (error) {
    console.error(`❌ Erro inesperado no teste de login: ${error.message}`);
    return false;
  }
}

async function testCompleteAuthFlow() {
  console.log('🚀 Iniciando teste completo do fluxo de autenticação\n');
  
  // 1. Verificar sincronização
  const syncOk = await checkUserSynchronization();
  if (!syncOk) {
    console.log('\n⚠️  Problemas de sincronização detectados, mas continuando com os testes...');
  }
  
  // 2. Testar login/logout para cada usuário
  let allTestsPassed = true;
  
  for (const user of testUsers) {
    const testPassed = await testLogin(user.email, user.password, user.expectedRole);
    if (!testPassed) {
      allTestsPassed = false;
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. Resultado final
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed && syncOk) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema de autenticação funcionando corretamente.');
  } else if (allTestsPassed) {
    console.log('✅ Testes de login/logout passaram, mas há problemas de sincronização.');
  } else {
    console.log('❌ Alguns testes falharam. Verifique os erros acima.');
  }
  console.log('='.repeat(50));
}

// Executar teste
testCompleteAuthFlow().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});