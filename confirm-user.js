import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Encontrada' : 'Não encontrada');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRole ? 'Encontrada' : 'Não encontrada');
  process.exit(1);
}

// Criar cliente com service role (tem privilégios administrativos)
const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const confirmUserEmail = async () => {
  console.log('🔧 Confirmando email do usuário de teste...');
  
  try {
    // Primeiro, vamos listar os usuários para encontrar o que criamos
    console.log('\n1. Listando usuários...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${users.users.length} usuários`);
    
    // Procurar pelo usuário de teste
    const testUser = users.users.find(user => user.email === 'teste@fisioflow.com');
    
    if (!testUser) {
      console.log('❌ Usuário de teste não encontrado. Criando...');
      
      // Criar usuário com email já confirmado
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'teste@fisioflow.com',
        password: 'teste123456',
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          name: 'Usuário Teste'
        }
      });
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError.message);
        return;
      }
      
      console.log('✅ Usuário criado com email confirmado:', newUser.user.email);
      
    } else {
      console.log('✅ Usuário de teste encontrado:', testUser.email);
      console.log('📧 Email confirmado:', testUser.email_confirmed_at ? 'Sim' : 'Não');
      
      if (!testUser.email_confirmed_at) {
        console.log('\n2. Confirmando email...');
        
        const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
          testUser.id,
          { email_confirm: true }
        );
        
        if (updateError) {
          console.error('❌ Erro ao confirmar email:', updateError.message);
          return;
        }
        
        console.log('✅ Email confirmado com sucesso!');
      }
    }
    
    // Agora vamos testar o login
    console.log('\n3. Testando login...');
    
    // Criar um cliente normal (não service role) para testar login
    const normalClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const { data: loginData, error: loginError } = await normalClient.auth.signInWithPassword({
      email: 'teste@fisioflow.com',
      password: 'teste123456'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('User ID:', loginData.user?.id);
      console.log('Email:', loginData.user?.email);
      
      // Fazer logout
      await normalClient.auth.signOut();
      console.log('✅ Logout realizado');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
};

async function main() {
  console.log('🚀 Iniciando confirmação de usuário...');
  console.log('URL:', supabaseUrl);
  console.log('Service Role:', supabaseServiceRole ? `${supabaseServiceRole.substring(0, 20)}...` : 'Não encontrada');
  
  await confirmUserEmail();
  
  console.log('\n✅ Processo concluído!');
}

main().catch(console.error);