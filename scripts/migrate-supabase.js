#!/usr/bin/env node

/**
 * Script para automatizar migrações do Supabase
 * Executa todas as migrações pendentes em ordem
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.error('Necessário: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para criar tabela de controle de migrações
async function createMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64),
        success BOOLEAN DEFAULT TRUE
      );
      
      -- Garantir que apenas o service role pode acessar
      ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Service role only" ON _migrations
        FOR ALL USING (auth.role() = 'service_role');
    `
  });

  if (error) {
    console.error('❌ Erro ao criar tabela de migrações:', error);
    throw error;
  }
}

// Função para calcular checksum do arquivo
function calculateChecksum(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Função para verificar se migração já foi executada
async function isMigrationExecuted(filename) {
  const { data, error } = await supabase
    .from('_migrations')
    .select('filename, checksum, success')
    .eq('filename', filename)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }

  return data;
}

// Função para registrar migração executada
async function recordMigration(filename, checksum, success = true) {
  const { error } = await supabase
    .from('_migrations')
    .insert({
      filename,
      checksum,
      success
    });

  if (error) {
    console.error(`❌ Erro ao registrar migração ${filename}:`, error);
    throw error;
  }
}

// Função para executar uma migração
async function executeMigration(filename, content) {
  console.log(`🔄 Executando migração: ${filename}`);
  
  const checksum = calculateChecksum(content);
  
  try {
    // Verificar se já foi executada
    const existing = await isMigrationExecuted(filename);
    
    if (existing) {
      if (existing.checksum === checksum && existing.success) {
        console.log(`✅ Migração ${filename} já executada (checksum válido)`);
        return;
      } else if (existing.checksum !== checksum) {
        console.warn(`⚠️  Migração ${filename} foi modificada após execução`);
        console.warn('   Checksum anterior:', existing.checksum);
        console.warn('   Checksum atual:', checksum);
        
        if (!process.env.FORCE_MIGRATION) {
          throw new Error('Migração modificada. Use FORCE_MIGRATION=true para forçar.');
        }
      }
    }

    // Executar SQL
    const { error } = await supabase.rpc('exec_sql', { sql: content });
    
    if (error) {
      console.error(`❌ Erro na migração ${filename}:`, error);
      await recordMigration(filename, checksum, false);
      throw error;
    }

    // Registrar sucesso
    if (!existing) {
      await recordMigration(filename, checksum, true);
    }
    
    console.log(`✅ Migração ${filename} executada com sucesso`);
    
  } catch (error) {
    console.error(`❌ Falha na migração ${filename}:`, error.message);
    throw error;
  }
}

// Função principal
async function runMigrations() {
  try {
    console.log('🚀 Iniciando processo de migração do Supabase...');
    
    // Criar tabela de controle
    await createMigrationsTable();
    
    // Ler arquivos de migração
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    const files = await readdir(migrationsDir);
    
    // Filtrar apenas arquivos .sql e ordenar
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .filter(file => !file.startsWith('check_')) // Excluir arquivos de verificação
      .sort();
    
    if (sqlFiles.length === 0) {
      console.log('📝 Nenhuma migração encontrada');
      return;
    }
    
    console.log(`📋 Encontradas ${sqlFiles.length} migrações:`);
    sqlFiles.forEach(file => console.log(`   - ${file}`));
    
    // Executar migrações em ordem
    for (const file of sqlFiles) {
      const filePath = join(migrationsDir, file);
      const content = await readFile(filePath, 'utf-8');
      
      await executeMigration(file, content);
    }
    
    console.log('🎉 Todas as migrações foram executadas com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro no processo de migração:', error.message);
    process.exit(1);
  }
}

// Função para rollback (opcional)
async function rollbackMigration(filename) {
  console.log(`🔄 Fazendo rollback da migração: ${filename}`);
  
  try {
    // Marcar como não executada
    const { error } = await supabase
      .from('_migrations')
      .delete()
      .eq('filename', filename);
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Rollback de ${filename} concluído`);
    
  } catch (error) {
    console.error(`❌ Erro no rollback de ${filename}:`, error.message);
    throw error;
  }
}

// Função para listar migrações
async function listMigrations() {
  try {
    const { data, error } = await supabase
      .from('_migrations')
      .select('*')
      .order('executed_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    console.log('📋 Migrações executadas:');
    if (data.length === 0) {
      console.log('   Nenhuma migração executada ainda');
    } else {
      data.forEach(migration => {
        const status = migration.success ? '✅' : '❌';
        const date = new Date(migration.executed_at).toLocaleString('pt-BR');
        console.log(`   ${status} ${migration.filename} (${date})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar migrações:', error.message);
    process.exit(1);
  }
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'migrate':
  case undefined:
    runMigrations();
    break;
    
  case 'list':
    listMigrations();
    break;
    
  case 'rollback':
    const filename = process.argv[3];
    if (!filename) {
      console.error('❌ Especifique o nome do arquivo para rollback');
      process.exit(1);
    }
    rollbackMigration(filename);
    break;
    
  default:
    console.log('Uso:');
    console.log('  node migrate-supabase.js [migrate|list|rollback <filename>]');
    console.log('');
    console.log('Comandos:');
    console.log('  migrate   - Executa todas as migrações pendentes (padrão)');
    console.log('  list      - Lista migrações executadas');
    console.log('  rollback  - Remove registro de uma migração específica');
    process.exit(1);
}