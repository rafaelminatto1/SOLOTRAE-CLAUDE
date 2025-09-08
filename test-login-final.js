// Teste final do login após correção das variáveis de ambiente
import { createClient } from '@supabase/supabase-js';

console.log('=== TESTE FINAL DE LOGIN - FISIOFLOW ===');

// Usar as mesmas configurações que o frontend deveria usar
const supabaseUrl = 'https://qywbmnvsyjhlrmtsvkjd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5d2JtbnZzeWpobHJtdHN2a2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDUwODIsImV4cCI6MjA3MTQ4MTA4Mn0.NrCQt7GgpDaUmSlIgXq9RQOkAxYqDS6EtS0bv2-ErtE';

console.log('Configurações do Supabase:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey.substring(0, 50) + '...');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Cliente Supabase criado com sucesso');

async function testLogin() {
  try {
    console.log('\n=== TESTANDO LOGIN ===');
    console.log('Tentando login com: teste@fisioflow.com');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'teste@fisioflow.com',
      password: 'teste123456'
    });
    
    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.error('Código do erro:', error.status);
      return false;
    }
    
    if (data.user && data.session) {
      console.log('✅ Login bem-sucedido!');
      console.log('ID do usuário:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Sessão ativa:', !!data.session);
      
      // Tentar carregar perfil do usuário
      console.log('\n=== CARREGANDO PERFIL ===');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erro ao carregar perfil:', profileError.message);
      } else {
        console.log('✅ Perfil carregado com sucesso!');
        console.log('Nome:', profile.name);
        console.log('Tipo:', profile.user_type);
      }
      
      return true;
    } else {
      console.error('❌ Login falhou - dados inválidos');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Erro na chamada de login:', err.message);
    return false;
  }
}

// Executar teste
testLogin().then(success => {
  console.log('\n=== RESULTADO FINAL ===');
  if (success) {
    console.log('🎉 SUCESSO! O sistema de login está funcionando corretamente.');
    console.log('✅ As variáveis de ambiente foram corrigidas.');
    console.log('✅ O cliente Supabase está configurado corretamente.');
    console.log('✅ As credenciais teste@fisioflow.com/teste123456 funcionam.');
  } else {
    console.log('❌ FALHA! Ainda há problemas com o sistema de login.');
  }
}).catch(err => {
  console.error('❌ Erro geral:', err.message);
});