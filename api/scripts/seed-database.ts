import { supabaseAdmin } from '../database/supabase';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Script para popular o banco de dados com dados de teste
 */
async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // 1. Limpar dados existentes (opcional - comentado por segurança)
    // console.log('🗑️  Limpando dados existentes...');
    // await supabaseAdmin.from('progress_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabaseAdmin.from('treatment_plan_exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabaseAdmin.from('treatment_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabaseAdmin.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabaseAdmin.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabaseAdmin.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabaseAdmin.from('physiotherapists').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Adicionar Fisioterapeutas
    console.log('👨‍⚕️ Adicionando fisioterapeutas...');
    const physiotherapists = [
      {
        crefito: 'CREFITO-12345',
        specialties: 'Ortopedia, Reabilitação',
        bio: 'Especialista em reabilitação ortopédica com 15 anos de experiência',
        experience_years: 15
      },
      {
        crefito: 'CREFITO-12346',
        specialties: 'Neurologia, Reabilitação Pós-AVC',
        bio: 'Especialista em fisioterapia neurológica e reabilitação pós-AVC',
        experience_years: 12
      },
      {
        crefito: 'CREFITO-12347',
        specialties: 'Fisioterapia Esportiva, Alta Performance',
        bio: 'Fisioterapeuta esportivo, trabalha com atletas de alto rendimento',
        experience_years: 10
      }
    ];

    const { data: insertedPhysios, error: physioError } = await supabaseAdmin
      .from('physiotherapists')
      .insert(physiotherapists)
      .select();

    if (physioError) {
      console.error('❌ Erro ao inserir fisioterapeutas:', physioError);
      throw physioError;
    }
    console.log(`✅ ${insertedPhysios?.length} fisioterapeutas adicionados\n`);

    // 3. Adicionar Pacientes
    console.log('👤 Adicionando pacientes...');
    const patients = [
      {
        cpf: '12345678901',
        birth_date: '1985-03-15',
        gender: 'F',
        address: 'Rua das Flores, 123, São Paulo - SP, 01234-567',
        emergency_contact: 'José Costa',
        emergency_phone: '(11) 91234-5679',
        medical_history: 'Histórico de dores lombares crônicas',
        allergies: 'Nenhuma alergia conhecida',
        medications: 'Nenhuma medicação regular'
      },
      {
        cpf: '12345678902',
        birth_date: '1990-07-22',
        gender: 'M',
        address: 'Av. Paulista, 1000, São Paulo - SP, 01310-100',
        emergency_contact: 'Maria Almeida',
        emergency_phone: '(11) 91234-5681',
        medical_history: 'Lesão no joelho direito - cirurgia de LCA',
        allergies: 'Alergia a dipirona',
        medications: 'Anti-inflamatórios prescritos'
      },
      {
        cpf: '12345678903',
        birth_date: '1978-11-30',
        gender: 'F',
        address: 'Rua Augusta, 500, São Paulo - SP, 01305-000',
        emergency_contact: 'Carlos Ferreira',
        emergency_phone: '(11) 91234-5683',
        medical_history: 'Tendinite no ombro direito',
        allergies: 'Nenhuma alergia conhecida',
        medications: 'Nenhuma medicação regular'
      },
      {
        cpf: '12345678904',
        birth_date: '1965-05-10',
        gender: 'M',
        address: 'Rua Consolação, 200, São Paulo - SP, 01301-000',
        emergency_contact: 'Sandra Lima',
        emergency_phone: '(11) 91234-5685',
        medical_history: 'AVC há 6 meses, em processo de reabilitação',
        allergies: 'Nenhuma alergia conhecida',
        medications: 'AAS, Atorvastatina, Enalapril'
      },
      {
        cpf: '12345678905',
        birth_date: '1995-09-18',
        gender: 'F',
        address: 'Rua Oscar Freire, 300, São Paulo - SP, 01426-000',
        emergency_contact: 'Paulo Souza',
        emergency_phone: '(11) 91234-5687',
        medical_history: 'Atleta profissional, lesão muscular na coxa',
        allergies: 'Nenhuma alergia conhecida',
        medications: 'Suplementos vitamínicos'
      }
    ];

    const { data: insertedPatients, error: patientError} = await supabaseAdmin
      .from('patients')
      .insert(patients)
      .select();

    if (patientError) {
      console.error('❌ Erro ao inserir pacientes:', patientError);
      throw patientError;
    }
    console.log(`✅ ${insertedPatients?.length} pacientes adicionados\n`);

    // 4. Adicionar Exercícios
    console.log('🏃 Adicionando exercícios...');
    const exercises = [
      {
        name: 'Alongamento Lombar',
        description: 'Alongamento para redução de dores lombares',
        category: 'Alongamento',
        difficulty: 'beginner',
        duration: 10,
        repetitions: 3,
        sets: 2,
        video_url: 'https://youtube.com/example1',
        instructions: '1. Deite de costas\n2. Puxe os joelhos em direção ao peito\n3. Mantenha por 30 segundos',
        precautions: 'Não forçar se houver dor aguda',
        is_active: true
      },
      {
        name: 'Fortalecimento de Joelho',
        description: 'Exercício para fortalecimento do quadríceps',
        category: 'Fortalecimento',
        difficulty: 'intermediate',
        duration: 15,
        repetitions: 15,
        sets: 3,
        video_url: 'https://youtube.com/example2',
        instructions: '1. Sente em uma cadeira\n2. Estenda a perna\n3. Mantenha por 5 segundos\n4. Retorne lentamente',
        precautions: 'Evitar hiperextensão',
        is_active: true
      },
      {
        name: 'Mobilidade de Ombro',
        description: 'Exercício de mobilidade para ombros',
        category: 'Mobilidade',
        difficulty: 'beginner',
        duration: 8,
        repetitions: 10,
        sets: 2,
        video_url: 'https://youtube.com/example3',
        instructions: '1. Em pé, braços ao lado do corpo\n2. Eleve os braços lateralmente\n3. Retorne lentamente',
        precautions: 'Não forçar além do limite de dor',
        is_active: true
      },
      {
        name: 'Marcha Assistida',
        description: 'Treino de marcha para reabilitação neurológica',
        category: 'Reabilitação',
        difficulty: 'intermediate',
        duration: 20,
        repetitions: 1,
        sets: 1,
        video_url: 'https://youtube.com/example4',
        instructions: '1. Use apoio se necessário\n2. Caminhe em linha reta\n3. Foque no padrão de marcha',
        precautions: 'Sempre com supervisão',
        is_active: true
      },
      {
        name: 'Agachamento Isométrico',
        description: 'Fortalecimento de membros inferiores',
        category: 'Fortalecimento',
        difficulty: 'advanced',
        duration: 12,
        repetitions: 10,
        sets: 3,
        video_url: 'https://youtube.com/example5',
        instructions: '1. Posição de agachamento\n2. Mantenha 90° no joelho\n3. Segure por 30 segundos',
        precautions: 'Não indicado para dores agudas no joelho',
        is_active: true
      }
    ];

    const { data: insertedExercises, error: exerciseError } = await supabaseAdmin
      .from('exercises')
      .insert(exercises)
      .select();

    if (exerciseError) {
      console.error('❌ Erro ao inserir exercícios:', exerciseError);
      throw exerciseError;
    }
    console.log(`✅ ${insertedExercises?.length} exercícios adicionados\n`);

    // 5. Adicionar Consultas
    console.log('📅 Adicionando consultas...');
    const today = new Date();
    const appointments = [
      {
        patient_id: insertedPatients![0].id,
        physiotherapist_id: insertedPhysios![0].id,
        date: today.toISOString().split('T')[0], // Hoje
        time: '14:00:00',
        duration: 60,
        type: 'Avaliação',
        status: 'scheduled',
        notes: 'Primeira consulta - avaliação inicial'
      },
      {
        patient_id: insertedPatients![1].id,
        physiotherapist_id: insertedPhysios![2].id,
        date: today.toISOString().split('T')[0], // Hoje
        time: '16:00:00',
        duration: 45,
        type: 'Tratamento',
        status: 'scheduled',
        notes: 'Continuação do tratamento de joelho'
      },
      {
        patient_id: insertedPatients![2].id,
        physiotherapist_id: insertedPhysios![0].id,
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem
        time: '10:00:00',
        duration: 60,
        type: 'Tratamento',
        status: 'completed',
        notes: 'Tratamento de tendinite - sessão 5'
      },
      {
        patient_id: insertedPatients![3].id,
        physiotherapist_id: insertedPhysios![1].id,
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        time: '09:00:00',
        duration: 90,
        type: 'Reabilitação',
        status: 'scheduled',
        notes: 'Sessão de reabilitação pós-AVC'
      },
      {
        patient_id: insertedPatients![4].id,
        physiotherapist_id: insertedPhysios![2].id,
        date: new Date(today.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0], // Daqui a 2 dias
        time: '15:00:00',
        duration: 60,
        type: 'Esportiva',
        status: 'scheduled',
        notes: 'Recuperação de lesão muscular'
      },
      {
        patient_id: insertedPatients![0].id,
        physiotherapist_id: insertedPhysios![0].id,
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Semana passada
        time: '11:00:00',
        duration: 60,
        type: 'Avaliação',
        status: 'completed',
        notes: 'Avaliação inicial concluída'
      }
    ];

    const { data: insertedAppointments, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentError) {
      console.error('❌ Erro ao inserir consultas:', appointmentError);
      throw appointmentError;
    }
    console.log(`✅ ${insertedAppointments?.length} consultas adicionadas\n`);

    // 6. Adicionar Planos de Tratamento
    console.log('📋 Adicionando planos de tratamento...');
    const treatmentPlans = [
      {
        patient_id: insertedPatients![0].id,
        physiotherapist_id: insertedPhysios![0].id,
        title: 'Plano de Tratamento - Dores Lombares',
        description: 'Tratamento para redução de dores lombares crônicas',
        start_date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        goals: 'Reduzir dor, melhorar mobilidade, fortalecer core',
        notes: 'Paciente respondendo bem ao tratamento. Frequência: 2x por semana, 8 semanas.'
      },
      {
        patient_id: insertedPatients![1].id,
        physiotherapist_id: insertedPhysios![2].id,
        title: 'Reabilitação Pós-Cirúrgica LCA',
        description: 'Protocolo de reabilitação pós-cirurgia de LCA',
        start_date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(today.getTime() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        goals: 'Recuperar amplitude de movimento, fortalecer joelho, retornar ao esporte',
        notes: 'Fase 2 do protocolo - fortalecimento. Frequência: 3x por semana, 24 semanas.'
      },
      {
        patient_id: insertedPatients![3].id,
        physiotherapist_id: insertedPhysios![1].id,
        title: 'Reabilitação Neurológica Pós-AVC',
        description: 'Programa de reabilitação neurológica',
        start_date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(today.getTime() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        goals: 'Melhorar marcha, recuperar movimentos, aumentar independência',
        notes: 'Progresso satisfatório, família engajada. Frequência: 5x por semana, 26 semanas.'
      }
    ];

    const { data: insertedPlans, error: planError } = await supabaseAdmin
      .from('treatment_plans')
      .insert(treatmentPlans)
      .select();

    if (planError) {
      console.error('❌ Erro ao inserir planos de tratamento:', planError);
      throw planError;
    }
    console.log(`✅ ${insertedPlans?.length} planos de tratamento adicionados\n`);

    console.log('✅ Seed do banco de dados concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${insertedPhysios?.length} fisioterapeutas`);
    console.log(`   - ${insertedPatients?.length} pacientes`);
    console.log(`   - ${insertedExercises?.length} exercícios`);
    console.log(`   - ${insertedAppointments?.length} consultas`);
    console.log(`   - ${insertedPlans?.length} planos de tratamento`);
    console.log('\n🎉 Banco de dados populado! Acesse http://localhost:3000 para visualizar.\n');

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    process.exit(1);
  }
}

// Executar seed
seedDatabase();

