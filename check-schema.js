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

const checkSchema = async () => {
  console.log('🔍 Verificando estrutura da tabela users...');
  
  try {
    // Tentar buscar um registro para ver a estrutura
    const { data: sampleData, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erro ao buscar dados de exemplo:', sampleError.message);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Estrutura inferida da tabela users:');
      const columns = Object.keys(sampleData[0]);
      columns.forEach(col => {
        const value = sampleData[0][col];
        const type = typeof value;
        console.log(`  - ${col}: ${type} (exemplo: ${value})`);
      });
    } else {
      console.log('⚠️ Tabela users está vazia');
    }
    
    // Tentar inserir um registro de teste para ver quais campos são obrigatórios
    console.log('\n🧪 Testando inserção para identificar campos obrigatórios...');
    
    const testData = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@test.com'
    };
    
    const { error: insertError } = await supabase
      .from('users')
      .insert(testData);
    
    if (insertError) {
      console.log('❌ Erro esperado na inserção (nos ajuda a entender o schema):');
      console.log('   ', insertError.message);
      
      // Analisar a mensagem de erro para identificar campos obrigatórios
      if (insertError.message.includes('password_hash')) {
        console.log('\n💡 Campo password_hash é obrigatório');
        
        // Tentar novamente com password_hash
        const testDataWithPassword = {
          ...testData,
          password_hash: 'dummy_hash'
        };
        
        const { error: insertError2 } = await supabase
          .from('users')
          .insert(testDataWithPassword);
        
        if (insertError2) {
          console.log('❌ Ainda há campos obrigatórios:', insertError2.message);
        } else {
          console.log('✅ Inserção bem-sucedida com password_hash');
          
          // Remover o registro de teste
          await supabase
            .from('users')
            .delete()
            .eq('id', testData.id);
          
          console.log('🗑️ Registro de teste removido');
        }
      }
    } else {
      console.log('✅ Inserção bem-sucedida (removendo registro de teste...)');
      
      // Remover o registro de teste
      await supabase
        .from('users')
        .delete()
        .eq('id', testData.id);
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
};

async function main() {
  console.log('🚀 Iniciando verificação de schema...');
  console.log('URL:', supabaseUrl);
  
  await checkSchema();
  
  console.log('\n✅ Verificação concluída!');
}

main().catch(console.error);