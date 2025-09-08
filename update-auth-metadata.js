quqimport { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const userUpdates = [
  {
    email: 'admin@fisioflow.com',
    metadata: {
      name: 'Administrador',
      role: 'admin'
    }
  },
  {
    email: 'fisio@fisioflow.com',
    metadata: {
      name: 'Dr. Fisioterapeuta',
      role: 'physiotherapist'
    }
  },
  {
    email: 'paciente@fisioflow.com',
    metadata: {
      name: 'Paciente Teste',
      role: 'patient'
    }
  }
];

async function updateAuthMetadata() {
  console.log('🔄 Atualizando metadados dos usuários no auth.users...');
  
  try {
    // Buscar todos os usuários
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return false;
    }
    
    let updatedCount = 0;
    
    for (const update of userUpdates) {
      // Encontrar o usuário pelo email
      const user = authUsers.users.find(u => u.email === update.email);
      if (!user) {
        console.log(`⚠️  Usuário não encontrado: ${update.email}`);
        continue;
      }
      
      console.log(`🔄 Atualizando ${update.email}...`);
      
      // Atualizar metadados do usuário
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            ...update.metadata
          }
        }
      );
      
      if (error) {
        console.error(`❌ Erro ao atualizar ${update.email}:`, error.message);
      } else {
        console.log(`✅ ${update.email} atualizado com role: ${update.metadata.role}`);
        updatedCount++;
      }
    }
    
    console.log(`\n📊 Resumo: ${updatedCount}/${userUpdates.length} usuários atualizados`);
    return updatedCount === userUpdates.length;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

async function verifyUpdates() {
  console.log('\n🔍 Verificando atualizações...');
  
  try {
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error('❌ Erro ao verificar usuários:', error.message);
      return;
    }
    
    console.log('\n📋 Metadados atualizados:');
    for (const update of userUpdates) {
      const user = authUsers.users.find(u => u.email === update.email);
      if (user) {
        const metadata = user.user_metadata || {};
        console.log(`  - ${user.email}:`);
        console.log(`    Nome: ${metadata.name || 'N/A'}`);
        console.log(`    Role: ${metadata.role || 'N/A'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando atualização de metadados do auth.users\n');
  
  const success = await updateAuthMetadata();
  await verifyUpdates();
  
  if (success) {
    console.log('\n🎉 Todos os metadados foram atualizados com sucesso!');
  } else {
    console.log('\n⚠️  Alguns metadados não puderam ser atualizados.');
  }
}

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});