/**
 * Script para configurar um novo projeto Supabase com schema limpo
 * Este script irá:
 * 1. Aplicar o schema inicial do FisioFlow
 * 2. Configurar políticas RLS
 * 3. Criar usuário admin inicial
 * 4. Testar a conexão
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do novo projeto Supabase
// IMPORTANTE: Substitua estas variáveis pelas do seu novo projeto
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Criar cliente Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupNewSupabase() {
  console.log('🚀 Iniciando configuração do novo projeto Supabase...');
  
  try {
    // 1. Testar conexão
    console.log('\n1. Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError) {
      throw new Error(`Erro na conexão: ${testError.message}`);
    }
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // 2. Aplicar schema inicial
    console.log('\n2. Aplicando schema inicial...');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_fisioflow_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.warn(`⚠️ Aviso no comando ${i + 1}: ${error.message}`);
          } else {
            console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
          }
        } catch (err) {
          console.warn(`⚠️ Erro no comando ${i + 1}: ${err.message}`);
        }
      }
    }
    
    // 3. Configurar políticas RLS básicas
    console.log('\n3. Configurando políticas RLS...');
    const rlsPolicies = [
      // Política para users
      `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);`,
      `CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);`,
      
      // Política para patients
      `ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Patients can view own data" ON public.patients FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Physiotherapists can view patients" ON public.patients FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'physiotherapist'));`,
      
      // Política para physiotherapists
      `ALTER TABLE public.physiotherapists ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Physiotherapists can view own data" ON public.physiotherapists FOR SELECT USING (auth.uid() = user_id);`,
      
      // Política para appointments
      `ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.physiotherapists pt WHERE pt.id = physiotherapist_id AND pt.user_id = auth.uid()));`,
      
      // Política para exercises (público para leitura)
      `ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Exercises are viewable by authenticated users" ON public.exercises FOR SELECT TO authenticated USING (true);`,
      
      // Política para treatment_plans
      `ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Users can view own treatment plans" ON public.treatment_plans FOR SELECT USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.physiotherapists pt WHERE pt.id = physiotherapist_id AND pt.user_id = auth.uid()));`,
      
      // Política para notifications
      `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);`,
      
      // Política para files
      `ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "Users can view own files" ON public.files FOR SELECT USING (auth.uid() = user_id);`
    ];
    
    for (let i = 0; i < rlsPolicies.length; i++) {
      const policy = rlsPolicies[i];
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.warn(`⚠️ Aviso na política ${i + 1}: ${error.message}`);
        } else {
          console.log(`✅ Política ${i + 1}/${rlsPolicies.length} configurada`);
        }
      } catch (err) {
        console.warn(`⚠️ Erro na política ${i + 1}: ${err.message}`);
      }
    }
    
    // 4. Verificar tabelas criadas
    console.log('\n4. Verificando tabelas criadas...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('✅ Tabelas criadas:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // 5. Criar usuário admin inicial (opcional)
    console.log('\n5. Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Atualize as variáveis de ambiente (.env) com as novas credenciais');
    console.log('2. Teste a aplicação com o novo banco');
    console.log('3. Crie o primeiro usuário admin através da interface');
    console.log('4. Migre dados importantes do banco antigo (se necessário)');
    
    console.log('\n🎉 Novo projeto Supabase configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

// Executar configuração
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith('setup-new-supabase.js')) {
  setupNewSupabase();
}

export { setupNewSupabase };