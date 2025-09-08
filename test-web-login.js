import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🌐 Testando login exatamente como a aplicação web faz...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NÃO ENCONTRADA');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Criar cliente Supabase exatamente como na aplicação
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWebLogin() {
  console.log('\n🔐 Simulando login da interface web...');
  
  const email = 'teste@fisioflow.com';
  const password = 'teste123456';
  
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  
  try {
    console.log('\n1. Chamando supabase.auth.signInWithPassword...');
    
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('\n📊 Resultado completo:');
    console.log('- Tem data:', !!result.data);
    console.log('- Tem session:', !!result.data?.session);
    console.log('- Tem user:', !!result.data?.user);
    console.log('- Tem error:', !!result.error);
    
    if (result.error) {
      console.log('\n❌ ERRO ENCONTRADO:');
      console.log('- Message:', result.error.message);
      console.log('- Code:', result.error.status);
      console.log('- Details:', result.error);
      return;
    }
    
    if (result.data?.session) {
      console.log('\n✅ LOGIN BEM-SUCEDIDO!');
      console.log('- User ID:', result.data.session.user.id);
      console.log('- Email:', result.data.session.user.email);
      console.log('- Email confirmado:', result.data.session.user.email_confirmed_at ? 'Sim' : 'Não');
      
      // Testar carregamento do perfil
      console.log('\n2. Testando carregamento do perfil...');
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', result.data.session.user.id)
        .single();
        
      if (profileError) {
        console.log('❌ Erro ao carregar perfil:', profileError.message);
        console.log('- Code:', profileError.code);
        console.log('- Details:', profileError.details);
        console.log('- Hint:', profileError.hint);
      } else {
        console.log('✅ Perfil carregado:', {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          plan: profile.plan
        });
      }
    } else {
      console.log('⚠️ Login sem sessão criada');
    }
    
  } catch (error) {
    console.log('\n💥 ERRO INESPERADO:');
    console.error(error);
  }
}

// Testar também outros emails para comparação
async function testOtherCredentials() {
  console.log('\n\n🧪 Testando outras credenciais para comparação...');
  
  const testCases = [
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'user@test.com', password: 'password123' },
    { email: 'inexistente@email.com', password: 'qualquersenha' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📧 Testando: ${testCase.email}`);
    
    try {
      const result = await supabase.auth.signInWithPassword(testCase);
      
      if (result.error) {
        console.log(`❌ Falhou: ${result.error.message}`);
      } else {
        console.log(`✅ Sucesso: ${result.data?.session?.user?.email}`);
      }
    } catch (error) {
      console.log(`💥 Erro: ${error.message}`);
    }
  }
}

async function main() {
  await testWebLogin();
  await testOtherCredentials();
  
  console.log('\n🏁 Teste concluído!');
}

main().catch(console.error);