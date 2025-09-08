// Teste das variáveis de ambiente do frontend
console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE DO FRONTEND ===');

// Simular o ambiente do Vite
const mockEnv = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

console.log('Variáveis de ambiente encontradas:');
console.log('VITE_SUPABASE_URL:', mockEnv.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', mockEnv.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida');

// Verificar se as variáveis estão definidas
if (!mockEnv.VITE_SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL não está definida!');
} else {
  console.log('✅ VITE_SUPABASE_URL está definida');
}

if (!mockEnv.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não está definida!');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY está definida');
}

// Testar criação do cliente Supabase
try {
  const { createClient } = require('@supabase/supabase-js');
  
  if (mockEnv.VITE_SUPABASE_URL && mockEnv.VITE_SUPABASE_ANON_KEY) {
    const supabase = createClient(mockEnv.VITE_SUPABASE_URL, mockEnv.VITE_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    console.log('✅ Cliente Supabase criado com sucesso');
    
    // Testar login
    console.log('\n=== TESTE DE LOGIN ===');
    
    supabase.auth.signInWithPassword({
      email: 'teste@fisioflow.com',
      password: 'teste123456'
    }).then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro no login:', error.message);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log('Usuário:', data.user?.email);
        console.log('Sessão ativa:', !!data.session);
      }
    }).catch(err => {
      console.error('❌ Erro na chamada de login:', err.message);
    });
    
  } else {
    console.error('❌ Não é possível criar cliente Supabase - variáveis de ambiente faltando');
  }
  
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error.message);
}

console.log('\n=== FIM DO TESTE ===');