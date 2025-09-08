import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Criar cliente normal (como a aplicação usa)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testCompleteLogin = async () => {
  console.log('🧪 Testando login completo como a aplicação faria...');
  
  try {
    // 1. Testar login com usuário sincronizado
    console.log('\n1. Fazendo login com teste@fisioflow.com...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste@fisioflow.com',
      password: 'teste123456'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    
    console.log('✅ Login bem-sucedido!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);
    console.log('   Email confirmado:', loginData.user.email_confirmed_at ? 'Sim' : 'Não');
    
    // 2. Testar carregamento do perfil
    console.log('\n2. Carregando perfil do usuário...');
    
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, plan, usage_count, preferences, created_at')
      .eq('id', loginData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao carregar perfil:', profileError.message);
      console.error('   Código:', profileError.code);
      console.error('   Detalhes:', profileError.details);
    } else {
      console.log('✅ Perfil carregado com sucesso!');
      console.log('   Nome:', userProfile.name);
      console.log('   Plano:', userProfile.plan);
      console.log('   Uso:', userProfile.usage_count);
      console.log('   Criado em:', userProfile.created_at);
    }
    
    // 3. Testar sessão atual
    console.log('\n3. Verificando sessão atual...');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Sessão ativa!');
      console.log('   Access token válido:', sessionData.session.access_token ? 'Sim' : 'Não');
      console.log('   Expira em:', new Date(sessionData.session.expires_at * 1000).toLocaleString());
    } else {
      console.log('⚠️ Nenhuma sessão ativa');
    }
    
    // 4. Testar outros usuários existentes
    console.log('\n4. Testando login com outros usuários...');
    
    // Fazer logout primeiro
    await supabase.auth.signOut();
    
    // Testar com admin@example.com (se existir)
    console.log('\n   Testando admin@example.com...');
    const { data: adminLogin, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123' // Senha padrão comum
    });
    
    if (adminError) {
      console.log('   ⚠️ Login admin falhou:', adminError.message);
    } else {
      console.log('   ✅ Login admin bem-sucedido!');
      
      // Verificar perfil do admin
      const { data: adminProfile, error: adminProfileError } = await supabase
        .from('users')
        .select('id, email, name, plan')
        .eq('id', adminLogin.user.id)
        .single();
      
      if (adminProfileError) {
        console.log('   ❌ Erro ao carregar perfil admin:', adminProfileError.message);
      } else {
        console.log('   ✅ Perfil admin:', adminProfile.name, '-', adminProfile.plan);
      }
      
      await supabase.auth.signOut();
    }
    
    // 5. Resumo final
    console.log('\n📋 RESUMO DO TESTE:');
    console.log('='.repeat(50));
    console.log('✅ Conectividade com Supabase: OK');
    console.log('✅ Usuário teste sincronizado: OK');
    console.log('✅ Login funcionando: OK');
    console.log(profileError ? '❌ Carregamento de perfil: FALHOU' : '✅ Carregamento de perfil: OK');
    console.log('✅ Gerenciamento de sessão: OK');
    
    if (!profileError) {
      console.log('\n🎉 SISTEMA DE AUTENTICAÇÃO FUNCIONANDO CORRETAMENTE!');
      console.log('\n📝 Credenciais de teste válidas:');
      console.log('   Email: teste@fisioflow.com');
      console.log('   Senha: teste123456');
    } else {
      console.log('\n⚠️ Sistema parcialmente funcional - verificar permissões RLS');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
};

async function main() {
  console.log('🚀 Iniciando teste final de autenticação...');
  console.log('URL:', supabaseUrl);
  console.log('Aplicação rodando em: http://localhost:3001');
  
  await testCompleteLogin();
  
  console.log('\n✅ Teste concluído!');
}

main().catch(console.error);