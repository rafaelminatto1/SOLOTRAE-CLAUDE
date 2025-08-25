/**
 * Database seeding
 */
import bcrypt from 'bcryptjs';
import { database } from './config.js';

/**
 * Seed the database with initial data
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const existingUsers = await database.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminResult = await database.run(
    `INSERT INTO users (email, password, name, role, phone) 
     VALUES (?, ?, ?, ?, ?)`,
    ['admin@fisioflow.com', adminPassword, 'Administrador', 'admin', '(11) 99999-9999']
  );

    // Insert physiotherapist users
     const physioPassword = await bcrypt.hash('physio123', 10);
     const physio1Result = await database.run(`
       INSERT INTO users (email, password, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
     `, ['dr.silva@fisioflow.com', physioPassword, 'Dr. João Silva', 'physiotherapist', '(11) 98888-8888', 1]);

     const physio2Result = await database.run(`
       INSERT INTO users (email, password, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
     `, ['dra.santos@fisioflow.com', physioPassword, 'Dra. Maria Santos', 'physiotherapist', '(11) 97777-7777', 1]);

    // Insert patient users
     const patientPassword = await bcrypt.hash('patient123', 10);
     const patient1Result = await database.run(`
       INSERT INTO users (email, password, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
     `, ['ana.costa@email.com', patientPassword, 'Ana Costa', 'patient', '(11) 96666-6666', 1]);

     const patient2Result = await database.run(`
       INSERT INTO users (email, password, name, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
     `, ['carlos.lima@email.com', patientPassword, 'Carlos Lima', 'patient', '(11) 95555-5555', 1]);

    // Insert physiotherapists data
    await database.run(`
      INSERT INTO physiotherapists (user_id, crefito, specialties, bio, experience_years)
      VALUES (?, ?, ?, ?, ?)
    `, [physio1Result.lastID, 'CREFITO-3/12345', 'Ortopedia, Traumatologia', 'Especialista em reabilitação ortopédica com mais de 10 anos de experiência.', 10]);

    await database.run(`
      INSERT INTO physiotherapists (user_id, crefito, specialties, bio, experience_years)
      VALUES (?, ?, ?, ?, ?)
    `, [physio2Result.lastID, 'CREFITO-3/67890', 'Neurologia, Pediatria', 'Fisioterapeuta especializada em neurologia e fisioterapia pediátrica.', 8]);

    // Insert patients data
    await database.run(`
      INSERT INTO patients (user_id, cpf, birth_date, gender, address, emergency_contact, emergency_phone, medical_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [patient1Result.lastID, '123.456.789-01', '1985-03-15', 'F', 'Rua das Flores, 123 - São Paulo/SP', 'Pedro Costa', '(11) 94444-4444', 'Histórico de lesão no joelho direito']);

    await database.run(`
      INSERT INTO patients (user_id, cpf, birth_date, gender, address, emergency_contact, emergency_phone, medical_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [patient2Result.lastID, '987.654.321-09', '1978-11-22', 'M', 'Av. Paulista, 456 - São Paulo/SP', 'Mariana Oliveira', '(11) 93333-3333', 'Dor lombar crônica']);

    // Insert sample exercises
    const exercises = [
      {
        name: 'Alongamento de Quadríceps',
        description: 'Exercício para alongar os músculos da coxa',
        category: 'Alongamento',
        difficulty: 'beginner',
        duration: 30,
        repetitions: 3,
        sets: 1,
        instructions: '1. Fique em pé\n2. Dobre uma perna para trás\n3. Segure o pé com a mão\n4. Mantenha por 30 segundos',
        precautions: 'Não force o movimento se sentir dor'
      },
      {
        name: 'Fortalecimento de Core',
        description: 'Exercício para fortalecer músculos abdominais',
        category: 'Fortalecimento',
        difficulty: 'intermediate',
        duration: 60,
        repetitions: 15,
        sets: 3,
        instructions: '1. Deite de costas\n2. Flexione os joelhos\n3. Levante o tronco\n4. Mantenha por 2 segundos',
        precautions: 'Mantenha a respiração durante o exercício'
      },
      {
        name: 'Caminhada Terapêutica',
        description: 'Exercício cardiovascular de baixo impacto',
        category: 'Cardiovascular',
        difficulty: 'beginner',
        duration: 1800,
        repetitions: 1,
        sets: 1,
        instructions: '1. Caminhe em ritmo moderado\n2. Mantenha postura ereta\n3. Respire naturalmente',
        precautions: 'Pare se sentir fadiga excessiva'
      }
    ];

    for (const exercise of exercises) {
      await database.run(`
        INSERT INTO exercises (name, description, category, difficulty, duration, repetitions, sets, instructions, precautions, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [exercise.name, exercise.description, exercise.category, exercise.difficulty, exercise.duration, exercise.repetitions, exercise.sets, exercise.instructions, exercise.precautions, physio1Result.lastID]);
    }

    // Insert sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    await database.run(`
      INSERT INTO appointments (patient_id, physiotherapist_id, date, time, type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [1, 1, tomorrowStr, '09:00', 'Consulta Inicial', 'scheduled', 'Primeira consulta para avaliação']);

    await database.run(`
      INSERT INTO appointments (patient_id, physiotherapist_id, date, time, type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [2, 2, nextWeekStr, '14:00', 'Sessão de Fisioterapia', 'scheduled', 'Sessão de reabilitação lombar']);

    // Insert sample treatment plan
    const treatmentPlanResult = await database.run(`
      INSERT INTO treatment_plans (patient_id, physiotherapist_id, title, description, start_date, goals)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [1, 1, 'Reabilitação de Joelho', 'Plano de tratamento para recuperação de lesão no joelho direito', tomorrowStr, 'Reduzir dor e inflamação, recuperar amplitude de movimento, fortalecer musculatura']);

    // Insert exercises in treatment plan
    await database.run(`
      INSERT INTO treatment_plan_exercises (treatment_plan_id, exercise_id, sets, repetitions, frequency, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [treatmentPlanResult.lastID, 1, 1, 3, 'Diário', 1]);

    await database.run(`
      INSERT INTO treatment_plan_exercises (treatment_plan_id, exercise_id, sets, repetitions, frequency, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [treatmentPlanResult.lastID, 2, 3, 15, '3x por semana', 2]);

    // Insert sample notifications
    await database.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [patient1Result.lastID, 'Consulta Agendada', 'Sua consulta foi agendada para amanhã às 09:00', 'info']);

    await database.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [physio1Result.lastID, 'Novo Paciente', 'Ana Costa foi adicionada como sua paciente', 'success']);

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@fisioflow.com / admin123');
    console.log('Fisioterapeuta 1: dr.silva@fisioflow.com / physio123');
    console.log('Fisioterapeuta 2: dra.santos@fisioflow.com / physio123');
    console.log('Paciente 1: ana.costa@email.com / patient123');
    console.log('Paciente 2: carlos.oliveira@email.com / patient123');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}