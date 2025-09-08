import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Iniciando aplicação da migração de normalização...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250127_normalize_field_x_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Arquivo de migração carregado:', migrationPath);
    
    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== '');
    
    console.log(`📋 ${commands.length} comandos SQL encontrados`);
    
    // Executar cada comando individualmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\n🔄 Executando comando ${i + 1}/${commands.length}:`);
      console.log(`   ${command.substring(0, 80)}${command.length > 80 ? '...' : ''}`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          // Continuar com os próximos comandos mesmo se um falhar
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.error(`❌ Exceção no comando ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎯 Migração concluída!');
    console.log('\n📊 Verificando estrutura das tabelas após migração...');
    
    // Verificar algumas tabelas para confirmar as mudanças
    const tablesToCheck = ['users', 'patients', 'exercises'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`⚠️  Erro ao verificar tabela ${table}:`, error.message);
        } else {
          console.log(`✅ Tabela ${table} acessível`);
          if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            const fieldXColumns = columns.filter(col => col.startsWith('field_'));
            if (fieldXColumns.length > 0) {
              console.log(`   ⚠️  Ainda existem campos field_X: ${fieldXColumns.join(', ')}`);
            } else {
              console.log(`   ✅ Nenhum campo field_X encontrado`);
            }
          }
        }
      } catch (err) {
        console.log(`⚠️  Exceção ao verificar tabela ${table}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral na aplicação da migração:', error);
    process.exit(1);
  }
}

// Executar a migração
applyMigration();