import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Não encontrada');
  process.exit(1);
}

// Criar cliente Supabase com service role key para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const adminEmail = 'admin@fisioflow.com';
  const adminPassword = 'admin123';
  
  console.log('🔍 Verificando se o usuário admin já existe...');
  
  try {
    // Primeiro, tentar fazer login para verificar se o usuário existe
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginData.user && !loginError) {
      console.log('✅ Usuário admin já existe e as credenciais estão corretas');
      console.log('👤 User ID:', loginData.user.id);
      
      // Verificar se existe na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .single();
      
      if (userError && userError.code === 'PGRST116') {
        console.log('⚠️ Usuário existe no Auth mas não na tabela users. Criando registro...');
        await createUserRecord(loginData.user);
      } else if (userData) {
        console.log('✅ Usuário também existe na tabela users');
        console.log('📋 Dados do usuário:', userData);
      }
      
      return;
    }
    
    // Se chegou aqui, o usuário não existe ou as credenciais estão incorretas
    console.log('🔧 Criando usuário admin...');
    
    // Criar usuário usando Admin API
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: 'Administrador'
      }
    });
    
    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      return;
    }
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('👤 User ID:', createData.user.id);
    
    // Criar registro na tabela users
    await createUserRecord(createData.user);
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error.message);
  }
}

async function createUserRecord(user) {
  console.log('📝 Criando registro na tabela users...');
  
  // Inserir apenas os campos obrigatórios
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'Administrador',
      password_hash: 'managed_by_supabase_auth'
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Erro ao criar registro na tabela users:', error.message);
    console.error('❌ Detalhes do erro:', error);
    return;
  }
  
  console.log('✅ Registro criado na tabela users:');
  console.log('📋 Dados:', data);
}

// Executar o script
createAdminUser()
  .then(() => {
    console.log('\n🎉 Processo concluído!');
    console.log('🔑 Credenciais do admin:');
    console.log('📧 Email: admin@fisioflow.com');
    console.log('🔒 Senha: admin123');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });