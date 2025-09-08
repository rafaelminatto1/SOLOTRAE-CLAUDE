import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testAuth = async () => {
  console.log('🧪 Testando autenticação básica do Supabase...');
  
  try {
    // Primeiro, vamos tentar fazer login com um usuário que pode já existir
    console.log('\n1. Tentando fazer login com usuário existente...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@fisioflow.com',
      password: 'admin123'
    });
    
    if (signInError) {
      console.log('❌ Login com admin falhou:', signInError.message);
      
      // Se falhou, vamos tentar criar um usuário de teste
      console.log('\n2. Criando usuário de teste...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'teste@fisioflow.com',
        password: 'teste123456',
        options: {
          emailRedirectTo: undefined // Tentar evitar confirmação de email
        }
      });
      
      if (signUpError) {
        console.error('❌ Erro ao criar usuário:', signUpError.message);
      } else {
        console.log('✅ Usuário criado:', signUpData.user?.email);
        console.log('📧 Email confirmado:', signUpData.user?.email_confirmed_at ? 'Sim' : 'Não');
        
        // Se o usuário foi criado mas não confirmado, vamos tentar confirmar manualmente
        if (!signUpData.user?.email_confirmed_at) {
          console.log('\n3. Tentando fazer login mesmo sem confirmação...');
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'teste@fisioflow.com',
            password: 'teste123456'
          });
          
          if (loginError) {
            console.error('❌ Login sem confirmação falhou:', loginError.message);
          } else {
            console.log('✅ Login sem confirmação funcionou!');
          }
        }
      }
    } else {
      console.log('✅ Login com admin bem-sucedido:', signInData.user?.email);
      
      // Fazer logout
      console.log('\n3. Fazendo logout...');
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        console.error('❌ Erro no logout:', logoutError.message);
      } else {
        console.log('✅ Logout bem-sucedido');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
};

async function main() {
  console.log('🚀 Iniciando teste de autenticação básica...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Não encontrada');
  
  await testAuth();
  
  console.log('\n✅ Teste concluído!');
}

main().catch(console.error);