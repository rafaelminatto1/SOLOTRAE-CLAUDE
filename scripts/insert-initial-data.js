/**
 * Script para inserir dados iniciais no novo projeto Supabase
 * Este script irá:
 * 1. Inserir exercícios básicos
 * 2. Criar dados de exemplo para demonstração
 * 3. Configurar notificações padrão
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

// Criar cliente Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dados iniciais de exercícios
const initialExercises = [
  {
    name: 'Alongamento de Pescoço',
    description: 'Exercício básico para alívio de tensão no pescoço',
    category: 'Alongamento',
    difficulty: 'beginner',
    duration: 300, // 5 minutos
    repetitions: 10,
    sets: 2,
    instructions: '1. Sente-se com a coluna ereta\n2. Incline a cabeça lentamente para a direita\n3. Mantenha por 15 segundos\n4. Repita para o lado esquerdo',
    precautions: 'Não force o movimento. Pare se sentir dor.',
    is_active: true
  },
  {
    name: 'Fortalecimento de Core',
    description: 'Exercício para fortalecer músculos abdominais',
    category: 'Fortalecimento',
    difficulty: 'intermediate',
    duration: 600, // 10 minutos
    repetitions: 15,
    sets: 3,
    instructions: '1. Deite-se de costas\n2. Flexione os joelhos\n3. Levante o tronco contraindo o abdômen\n4. Desça lentamente',
    precautions: 'Mantenha a respiração constante. Não force a lombar.',
    is_active: true
  },
  {
    name: 'Caminhada Terapêutica',
    description: 'Exercício cardiovascular de baixo impacto',
    category: 'Cardiovascular',
    difficulty: 'beginner',
    duration: 1800, // 30 minutos
    repetitions: null,
    sets: 1,
    instructions: '1. Inicie com ritmo lento\n2. Mantenha postura ereta\n3. Respire profundamente\n4. Aumente gradualmente o ritmo',
    precautions: 'Use calçados adequados. Hidrate-se regularmente.',
    is_active: true
  },
  {
    name: 'Mobilização de Ombro',
    description: 'Exercício para melhorar amplitude de movimento do ombro',
    category: 'Mobilização',
    difficulty: 'beginner',
    duration: 240, // 4 minutos
    repetitions: 12,
    sets: 2,
    instructions: '1. Fique em pé com braços ao lado do corpo\n2. Levante os braços lateralmente\n3. Forme círculos pequenos\n4. Aumente gradualmente o tamanho dos círculos',
    precautions: 'Pare se sentir dor aguda. Movimento deve ser suave.',
    is_active: true
  },
  {
    name: 'Exercício Respiratório',
    description: 'Técnica de respiração para relaxamento e controle',
    category: 'Respiratório',
    difficulty: 'beginner',
    duration: 600, // 10 minutos
    repetitions: 20,
    sets: 1,
    instructions: '1. Sente-se confortavelmente\n2. Inspire pelo nariz por 4 segundos\n3. Segure por 4 segundos\n4. Expire pela boca por 6 segundos',
    precautions: 'Não force a respiração. Pare se sentir tontura.',
    is_active: true
  }
];

async function insertInitialData() {
  console.log('🚀 Iniciando inserção de dados iniciais...');
  
  try {
    // 1. Testar conexão
    console.log('\n1. Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('exercises')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Erro na conexão: ${testError.message}`);
    }
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // 2. Inserir exercícios iniciais
    console.log('\n2. Inserindo exercícios iniciais...');
    
    // Verificar se já existem exercícios
    const { data: existingExercises, error: checkError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);
    
    if (checkError) {
      throw new Error(`Erro ao verificar exercícios: ${checkError.message}`);
    }
    
    if (existingExercises && existingExercises.length > 0) {
      console.log('ℹ️ Exercícios já existem no banco. Pulando inserção...');
    } else {
      const { data: insertedExercises, error: exerciseError } = await supabase
        .from('exercises')
        .insert(initialExercises)
        .select();
      
      if (exerciseError) {
        throw new Error(`Erro ao inserir exercícios: ${exerciseError.message}`);
      }
      
      console.log(`✅ ${insertedExercises.length} exercícios inseridos com sucesso!`);
      insertedExercises.forEach((exercise, index) => {
        console.log(`   ${index + 1}. ${exercise.name} (${exercise.category})`);
      });
    }
    
    // 3. Verificar estrutura das tabelas
    console.log('\n3. Verificando estrutura das tabelas...');
    const tables = ['users', 'patients', 'physiotherapists', 'appointments', 'treatment_plans', 'notifications', 'files'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ Problema com tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table} acessível`);
        }
      } catch (err) {
        console.warn(`⚠️ Erro ao acessar tabela ${table}: ${err.message}`);
      }
    }
    
    // 4. Estatísticas finais
    console.log('\n4. Estatísticas do banco:');
    
    // Contar exercícios
    const { data: exerciseCount, error: countError } = await supabase
      .from('exercises')
      .select('id', { count: 'exact' });
    
    if (!countError) {
      console.log(`   📋 Exercícios: ${exerciseCount.length}`);
    }
    
    // Contar usuários
    const { data: userCount, error: userCountError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
    
    if (!userCountError) {
      console.log(`   👥 Usuários: ${userCount.length}`);
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Crie o primeiro usuário através da interface da aplicação');
    console.log('2. Promova o usuário para admin no dashboard do Supabase');
    console.log('3. Teste as funcionalidades básicas da aplicação');
    console.log('4. Adicione mais exercícios conforme necessário');
    
    console.log('\n🎉 Dados iniciais inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a inserção de dados:', error.message);
    process.exit(1);
  }
}

// Executar inserção
if (require.main === module) {
  insertInitialData();
}

module.exports = { insertInitialData };