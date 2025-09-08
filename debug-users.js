import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuração do Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Não encontrada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    console.log('\n🔍 Verificando usuários na tabela users customizada...');
    
    // Primeiro, tentar apenas contar os registros
    const { count: totalCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar usuários na tabela customizada:', countError);
      console.log('\n🔍 Tentando verificar usuários do Supabase Auth...');
      
      // Verificar usuários autenticados via Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Erro ao buscar usuários do Auth (precisa de service role):', authError.message);
      } else {
        console.log(`✅ Usuários encontrados no Supabase Auth: ${authUsers.users.length}`);
        authUsers.users.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Criado em: ${user.created_at}`);
          console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
          console.log('---');
        });
      }
      return;
    }
    
    console.log(`✅ Total de usuários encontrados na tabela customizada: ${totalCount}`);
    
    if (totalCount > 0) {
      // Tentar buscar apenas alguns campos básicos
      console.log('\n🔍 Tentando buscar dados básicos dos usuários...');
      
      const { data: users, error: selectError } = await supabase
        .from('users')
        .select('id, email, created_at')
        .limit(5);
      
      if (selectError) {
        console.error('❌ Erro ao buscar dados dos usuários:', selectError);
      } else {
        console.log('\n📋 Usuários cadastrados na tabela customizada:');
        users?.forEach((user, index) => {
          console.log(`${index + 1}. ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Criado em: ${user.created_at}`);
          console.log('---');
        });
      }
    } else {
      console.log('⚠️ Nenhum usuário encontrado na tabela users customizada');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 Testando autenticação do Supabase...');
    
    // Verificar se conseguimos acessar a sessão atual
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao verificar sessão:', error);
    } else {
      console.log('✅ Verificação de sessão bem-sucedida');
      console.log('Sessão atual:', session ? 'Ativa' : 'Nenhuma');
    }
    
  } catch (err) {
    console.error('❌ Erro ao testar autenticação:', err);
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico do sistema de autenticação...');
  
  await checkUsers();
  await testAuth();
  
  console.log('\n✅ Diagnóstico concluído!');
}

main().catch(console.error);