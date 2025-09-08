import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Criar cliente com service role
const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const checkAndFixRLS = async () => {
  console.log('🔧 Verificando e corrigindo permissões RLS...');
  
  try {
    // 1. Verificar se conseguimos acessar a tabela users com service role
    console.log('\n1. Testando acesso à tabela users com service role...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erro ao acessar tabela users:', usersError.message);
      console.error('Detalhes:', usersError);
    } else {
      console.log(`✅ Tabela users acessível. Encontrados ${users.length} usuários:`);
      users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    }
    
    // 2. Verificar permissões atuais
    console.log('\n2. Verificando permissões atuais...');
    
    const { data: permissions, error: permError } = await supabase
      .rpc('check_table_permissions', { table_name: 'users' })
      .single();
    
    if (permError) {
      console.log('⚠️ Não foi possível verificar permissões via RPC:', permError.message);
      
      // Tentar verificar via SQL direto
      const { data: sqlPerms, error: sqlError } = await supabase
        .from('information_schema.role_table_grants')
        .select('grantee, table_name, privilege_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'users')
        .in('grantee', ['anon', 'authenticated']);
      
      if (sqlError) {
        console.log('⚠️ Não foi possível verificar permissões via SQL:', sqlError.message);
      } else {
        console.log('✅ Permissões encontradas:', sqlPerms);
      }
    } else {
      console.log('✅ Permissões:', permissions);
    }
    
    // 3. Tentar conceder permissões básicas
    console.log('\n3. Concedendo permissões básicas...');
    
    // Conceder SELECT para anon (para verificar se usuário existe)
    const { error: anonSelectError } = await supabase
      .rpc('grant_table_permission', {
        role_name: 'anon',
        table_name: 'users',
        permission: 'SELECT'
      });
    
    if (anonSelectError) {
      console.log('⚠️ Erro ao conceder SELECT para anon:', anonSelectError.message);
      
      // Tentar via SQL direto
      const { error: directGrantError } = await supabase
        .rpc('exec_sql', { sql: 'GRANT SELECT ON users TO anon;' });
      
      if (directGrantError) {
        console.log('⚠️ Erro ao conceder permissão via SQL:', directGrantError.message);
      } else {
        console.log('✅ Permissão SELECT concedida para anon via SQL');
      }
    } else {
      console.log('✅ Permissão SELECT concedida para anon');
    }
    
    // Conceder ALL para authenticated
    const { error: authAllError } = await supabase
      .rpc('grant_table_permission', {
        role_name: 'authenticated',
        table_name: 'users',
        permission: 'ALL'
      });
    
    if (authAllError) {
      console.log('⚠️ Erro ao conceder ALL para authenticated:', authAllError.message);
    } else {
      console.log('✅ Permissão ALL concedida para authenticated');
    }
    
    // 4. Testar acesso com cliente normal
    console.log('\n4. Testando acesso com cliente normal...');
    
    const normalClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    // Primeiro fazer login
    const { data: loginData, error: loginError } = await normalClient.auth.signInWithPassword({
      email: 'teste@fisioflow.com',
      password: 'teste123456'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login bem-sucedido');
      
      // Tentar acessar a tabela users
      const { data: userProfile, error: profileError } = await normalClient
        .from('users')
        .select('id, email, name')
        .eq('id', loginData.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erro ao acessar perfil:', profileError.message);
        console.error('Detalhes:', profileError);
      } else {
        console.log('✅ Perfil acessado com sucesso:', userProfile);
      }
      
      // Fazer logout
      await normalClient.auth.signOut();
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
};

async function main() {
  console.log('🚀 Iniciando correção de RLS...');
  console.log('URL:', supabaseUrl);
  
  await checkAndFixRLS();
  
  console.log('\n✅ Processo concluído!');
}

main().catch(console.error);