import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Cliente Supabase com service role para acesso completo
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuários de teste esperados
const expectedUsers = [
  {
    email: 'admin@fisioflow.com',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
    phone: '(11) 99999-9999'
  },
  {
    email: 'fisio@fisioflow.com',
    password: 'fisio123',
    role: 'physiotherapist',
    name: 'Dr. João Silva',
    phone: '(11) 98888-8888',
    specialization: 'Fisioterapia Ortopédica',
    crefito: '12345-F'
  },
  {
    email: 'paciente@fisioflow.com',
    password: 'paciente123',
    role: 'patient',
    name: 'Maria Santos',
    phone: '(11) 97777-7777',
    birth_date: '1990-05-15',
    cpf: '123.456.789-00'
  }
];

async function checkAuthUsers() {
  console.log('\n🔍 Verificando usuários em auth.users...');
  
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Erro ao buscar usuários auth:', error.message);
      return [];
    }
    
    console.log(`✅ Encontrados ${authUsers.users.length} usuários em auth.users`);
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
    
    return authUsers.users;
  } catch (error) {
    console.error('❌ Erro ao verificar auth.users:', error.message);
    return [];
  }
}

async function checkUsersTable() {
  console.log('\n🔍 Verificando usuários na tabela users...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar tabela users:', error.message);
      return [];
    }
    
    console.log(`✅ Encontrados ${users.length} usuários na tabela users`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Erro ao verificar tabela users:', error.message);
    return [];
  }
}

async function createMissingAuthUsers(authUsers) {
  console.log('\n👤 Criando usuários ausentes em auth.users...');
  
  for (const expectedUser of expectedUsers) {
    const existingAuthUser = authUsers.find(u => u.email === expectedUser.email);
    
    if (!existingAuthUser) {
      console.log(`📝 Criando usuário auth: ${expectedUser.email}`);
      
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: expectedUser.email,
          password: expectedUser.password,
          email_confirm: true
        });
        
        if (error) {
          console.error(`❌ Erro ao criar ${expectedUser.email}:`, error.message);
        } else {
          console.log(`✅ Usuário auth criado: ${expectedUser.email} (ID: ${data.user.id})`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar ${expectedUser.email}:`, error.message);
      }
    } else {
      console.log(`✅ Usuário auth já existe: ${expectedUser.email}`);
    }
  }
}

async function syncUsersTable() {
  console.log('\n🔄 Sincronizando tabela users...');
  
  // Buscar usuários auth atualizados
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('❌ Erro ao buscar usuários auth:', authError.message);
    return;
  }
  
  // Buscar usuários da tabela
  const { data: tableUsers, error: tableError } = await supabase
    .from('users')
    .select('*');
  if (tableError) {
    console.error('❌ Erro ao buscar tabela users:', tableError.message);
    return;
  }
  
  for (const authUser of authUsers.users) {
    const expectedUser = expectedUsers.find(u => u.email === authUser.email);
    const existingTableUser = tableUsers.find(u => u.id === authUser.id);
    
    if (!existingTableUser && expectedUser) {
      console.log(`📝 Criando registro na tabela users: ${authUser.email}`);
      
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: expectedUser.name,
        role: expectedUser.role,
        phone: expectedUser.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Adicionar campos específicos por role
      if (expectedUser.role === 'physiotherapist') {
        userData.specialization = expectedUser.specialization;
        userData.crefito = expectedUser.crefito;
      } else if (expectedUser.role === 'patient') {
        userData.birth_date = expectedUser.birth_date;
        userData.cpf = expectedUser.cpf;
      }
      
      try {
        const { error } = await supabase
          .from('users')
          .insert(userData);
        
        if (error) {
          console.error(`❌ Erro ao inserir ${authUser.email}:`, error.message);
        } else {
          console.log(`✅ Usuário inserido na tabela: ${authUser.email}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao inserir ${authUser.email}:`, error.message);
      }
    } else if (existingTableUser) {
      console.log(`✅ Usuário já existe na tabela: ${authUser.email}`);
    }
  }
}

async function testLogin() {
  console.log('\n🧪 Testando login dos usuários...');
  
  for (const user of expectedUsers) {
    console.log(`\n🔐 Testando login: ${user.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (error) {
        console.error(`❌ Erro no login ${user.email}:`, error.message);
        continue;
      }
      
      console.log(`✅ Login bem-sucedido: ${user.email}`);
      
      // Testar busca do perfil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error(`❌ Erro ao buscar perfil ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Perfil encontrado: ${profile.name} (${profile.role})`);
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error(`❌ Erro no teste ${user.email}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando sincronização de usuários FisioFlow\n');
  
  try {
    // 1. Verificar usuários existentes
    const authUsers = await checkAuthUsers();
    const tableUsers = await checkUsersTable();
    
    // 2. Criar usuários auth ausentes
    await createMissingAuthUsers(authUsers);
    
    // 3. Sincronizar tabela users
    await syncUsersTable();
    
    // 4. Testar login
    await testLogin();
    
    console.log('\n✅ Sincronização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error.message);
    process.exit(1);
  }
}

// Executar script
main();