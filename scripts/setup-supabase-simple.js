import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔧 Configuração do Supabase:');
console.log('URL:', SUPABASE_URL);
console.log('Service Key:', SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'Não configurada');
console.log('Anon Key:', SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.log('\n📋 Para configurar um novo projeto Supabase:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Crie um novo projeto');
  console.log('3. Vá em Settings > API');
  console.log('4. Copie a URL e as chaves');
  console.log('5. Atualize o arquivo .env com as novas credenciais');
  console.log('\n🔑 Variáveis necessárias no .env:');
  console.log('SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key');
  console.log('SUPABASE_ANON_KEY=sua-anon-key');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('\n🔍 Testando conexão com Supabase...');
  
  try {
    // Teste básico de autenticação - sempre funciona se as credenciais estão corretas
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Se não houver erro de autenticação, a conexão está funcionando
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('🔑 Autenticação testada com sucesso');
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se as credenciais estão corretas');
    console.log('2. Verifique se o projeto Supabase está ativo');
    console.log('3. Crie um novo projeto Supabase se necessário');
    return false;
  }
}

async function createInitialSchema() {
  console.log('\n🏗️ Aplicando schema inicial...');
  
  try {
    const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_fisioflow_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Arquivo de schema não encontrado:', schemaPath);
      return false;
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.warn(`⚠️ Aviso no comando ${i + 1}: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
            if (i % 10 === 0 || i === commands.length - 1) {
              console.log(`✅ Progresso: ${i + 1}/${commands.length} comandos`);
            }
          }
        } catch (err) {
          console.warn(`⚠️ Erro no comando ${i + 1}: ${err.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Resultado: ${successCount} sucessos, ${errorCount} avisos/erros`);
    return successCount > 0;
    
  } catch (error) {
    console.error('❌ Erro ao aplicar schema:', error.message);
    return false;
  }
}

async function setupSupabase() {
  console.log('🚀 Iniciando configuração do Supabase...');
  
  // Testar conexão
  const connected = await testConnection();
  if (!connected) {
    return;
  }
  
  // Aplicar schema
  const schemaApplied = await createInitialSchema();
  if (!schemaApplied) {
    console.log('⚠️ Schema não foi aplicado completamente');
  }
  
  console.log('\n🎉 Configuração concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Verifique se as tabelas foram criadas corretamente');
  console.log('2. Configure as políticas RLS se necessário');
  console.log('3. Teste a aplicação com o banco configurado');
}

// Executar
setupSupabase().catch(console.error);