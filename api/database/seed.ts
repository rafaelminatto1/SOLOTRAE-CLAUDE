/**
 * Database seeding for FisioFlow
 */
import bcrypt from 'bcryptjs';
import { database } from './config.js';

// Helper Functions
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatDate = (date) => date.toISOString().split('T')[0];

// --- SAMPLE DATA ---
const firstNames = ['Ana', 'Carlos', 'Beatriz', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Heitor', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Patrícia', 'Rafael', 'Sofia', 'Thiago', 'Valentina', 'Lucas'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Ribeiro', 'Carvalho', 'Martins', 'Rocha'];
const specialties = ['Ortopedia', 'Traumatologia', 'Neurologia', 'Pediatria', 'Geriatria', 'Fisioterapia Esportiva', 'Acupuntura', 'Quiropraxia', 'Saúde da Mulher'];
const medicalHistories = ['Fratura de fêmur', 'Hérnia de disco lombar', 'Lesão no ligamento cruzado anterior (LCA)', 'Escoliose idiopática', 'Artrose no joelho', 'Tendinite no ombro', 'Síndrome do túnel do carpo', 'Asma', 'Hipertensão', 'Diabetes tipo 2'];
const appointmentTypes = ['Consulta Inicial', 'Sessão de Acompanhamento', 'Avaliação Postural', 'Sessão de Reabilitação', 'Atendimento de Emergência'];

const exercisesData = [
    { name: 'Agachamento Livre', type: 'Fortalecimento', body_part: 'Membros Inferiores', equipment: 'Nenhum' },
    { name: 'Elevação Pélvica', type: 'Fortalecimento', body_part: 'Core', equipment: 'Nenhum' },
    { name: 'Prancha Abdominal', type: 'Fortalecimento', body_part: 'Core', equipment: 'Nenhum' },
    { name: 'Flexão de Braço', type: 'Fortalecimento', body_part: 'Membros Superiores', equipment: 'Nenhum' },
    { name: 'Remada com Elástico', type: 'Fortalecimento', body_part: 'Membros Superiores', equipment: 'Faixa Elástica' },
    { name: 'Abdução de Quadril com Elástico', type: 'Fortalecimento', body_part: 'Membros Inferiores', equipment: 'Faixa Elástica' },
    { name: 'Elevação de Panturrilha', type: 'Fortalecimento', body_part: 'Membros Inferiores', equipment: 'Nenhum' },
    { name: 'Rosca Bíceps com Halter', type: 'Fortalecimento', body_part: 'Membros Superiores', equipment: 'Halter' },
    { name: 'Alongamento de Isquiotibiais', type: 'Alongamento', body_part: 'Membros Inferiores', equipment: 'Toalha' },
    { name: 'Alongamento Gato-Camelo', type: 'Mobilidade', body_part: 'Tronco', equipment: 'Nenhum' },
    { name: 'Rotação de Tronco Sentado', type: 'Mobilidade', body_part: 'Tronco', equipment: 'Nenhum' },
    { name: 'Liberação Miofascial de Panturrilha', type: 'Liberação Miofascial', body_part: 'Membros Inferiores', equipment: 'Rolo de Liberação' },
    { name: 'Equilíbrio Unipodal', type: 'Propriocepção', body_part: 'Membros Inferiores', equipment: 'Nenhum' },
    { name: 'Caminhada Estacionária', type: 'Cardiovascular', body_part: 'Geral', equipment: 'Nenhum' },
];

const protocolsData = [
    { name: 'Protocolo Pós-Operatório de LCA - Fase 1', pathology: 'LCA', exercises: ['Elevação de Panturrilha', 'Equilíbrio Unipodal', 'Alongamento de Isquiotibiais'] },
    { name: 'Protocolo para Lombalgia Crônica', pathology: 'Lombalgia', exercises: ['Elevação Pélvica', 'Prancha Abdominal', 'Alongamento Gato-Camelo'] },
    { name: 'Protocolo de Fortalecimento de Ombro', pathology: 'Tendinite de Ombro', exercises: ['Remada com Elástico', 'Flexão de Braço'] },
];

/**
 * Seed the database with a large amount of initial data
 */
export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    const existingUsers = await database.get(`SELECT COUNT(*) as count FROM users`);
    if (existingUsers.count > 0) {
      console.log(`Database already contains data. For a full re-seed, please clear the database first.`);
      return;
    }

    // --- CREATE ADMIN ---
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash(`admin123`, 10);
    await database.run(
      `INSERT INTO users (email, password, name, role, phone) VALUES (?, ?, ?, ?, ?)`,
      [`admin@fisioflow.com`, adminPassword, `Admin Geral`, `admin`, `(11) 99999-9999`]
    );

    const physioPassword = await bcrypt.hash(`physio123`, 10);
    const patientPassword = await bcrypt.hash(`patient123`, 10);

    // --- CREATE PHYSIOTHERAPISTS ---
    console.log('Creating physiotherapists...');
    const physioUserIds = [];
    for (let i = 0; i < 10; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const name = `Dr(a). ${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@fisioflow.com`;
      const userResult = await database.run(
        `INSERT INTO users (email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, physioPassword, name, `physiotherapist`, `(11) 9${getRandomNumber(1000, 9999)}-${getRandomNumber(1000, 9999)}`, 1]
      );
      const userId = userResult.lastID;
      physioUserIds.push(userId);
      await database.run(
        `INSERT INTO physiotherapists (user_id, crefito, specialties, bio, experience_years) VALUES (?, ?, ?, ?, ?)`,
        [userId, `CREFITO-3/${getRandomNumber(10000, 99999)}`, `${getRandomItem(specialties)}, ${getRandomItem(specialties)}`, `Especialista em reabilitação com ${getRandomNumber(2, 15)} anos de experiência.`, getRandomNumber(2, 15)]
      );
    }

    // --- CREATE PATIENTS ---
    console.log('Creating patients...');
    const patientUserIds = [];
    for (let i = 0; i < 50; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
      const userResult = await database.run(
        `INSERT INTO users (email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, patientPassword, name, `patient`, `(11) 9${getRandomNumber(1000, 9999)}-${getRandomNumber(1000, 9999)}`, 1]
      );
      const userId = userResult.lastID;
      patientUserIds.push(userId);
      await database.run(
        `INSERT INTO patients (user_id, cpf, birth_date, gender, address, emergency_contact, emergency_phone, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, `${getRandomNumber(100, 999)}.${getRandomNumber(100, 999)}.${getRandomNumber(100, 999)}-${getRandomNumber(10, 99)}`, `${getRandomNumber(1950, 2005)}-${getRandomNumber(1, 12).toString().padStart(2, '0')}-${getRandomNumber(1, 28).toString().padStart(2, '0')}`, getRandomItem([`M`, `F`, `Other`]), `Endereço Fictício, 123`, `${getRandomItem(firstNames)} ${lastName}`, `(11) 9${getRandomNumber(1000, 9999)}-${getRandomNumber(1000, 9999)}`, getRandomItem(medicalHistories)]
      );
    }

    // --- CREATE EXERCISES ---
    console.log('Creating exercises...');
    const exerciseIdsMap = new Map();
    for (const ex of exercisesData) {
        const exerciseResult = await database.run(
            `INSERT INTO exercises (name, description, type, body_part, equipment, difficulty, duration, repetitions, sets, instructions, precautions, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ex.name, `Descrição para ${ex.name}`, ex.type, ex.body_part, ex.equipment, getRandomItem(['beginner', 'intermediate', 'advanced']), getRandomNumber(30, 300), getRandomNumber(8, 15), getRandomNumber(2, 4), 'Instruções detalhadas do exercício.', 'Precauções a serem tomadas.', getRandomItem(physioUserIds)]
        );
        exerciseIdsMap.set(ex.name, exerciseResult.lastID);
    }

    // --- CREATE PROTOCOLS ---
    console.log('Creating protocols...');
    for (const proto of protocolsData) {
        const protocolResult = await database.run(
            `INSERT INTO protocols (name, description, pathology, created_by, is_public) VALUES (?, ?, ?, ?, ?)`,
            [proto.name, `Protocolo para tratamento de ${proto.pathology}`, proto.pathology, getRandomItem(physioUserIds), 1]
        );
        const protocolId = protocolResult.lastID;

        // Link exercises to protocol
        for (const exName of proto.exercises) {
            const exerciseId = exerciseIdsMap.get(exName);
            if (exerciseId) {
                await database.run(
                    `INSERT INTO protocol_exercises (protocol_id, exercise_id, order_index) VALUES (?, ?, ?)`,
                    [protocolId, exerciseId, proto.exercises.indexOf(exName) + 1]
                );
            }
        }
    }

    // --- CREATE APPOINTMENTS ---
    console.log('Creating appointments...');
    for (let i = 0; i < 200; i++) {
        const date = new Date();
        date.setDate(date.getDate() + getRandomNumber(-30, 60));
        const time = `${getRandomNumber(8, 18).toString().padStart(2, '0')}:${getRandomItem(['00', '30'])}`;
        await database.run(
            `INSERT INTO appointments (patient_id, physiotherapist_id, date, time, type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [getRandomItem(patientUserIds), getRandomItem(physioUserIds), formatDate(date), time, getRandomItem(appointmentTypes), getRandomItem(['scheduled', 'completed', 'cancelled']), 'Nenhuma observação.']
        );
    }

    // --- CREATE TREATMENT PLANS ---
    console.log('Creating treatment plans...');
    const allExerciseIds = Array.from(exerciseIdsMap.values());
    for (let i = 0; i < 50; i++) {
        const patientId = getRandomItem(patientUserIds);
        const physioId = getRandomItem(physioUserIds);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - getRandomNumber(0, 45));

        const planResult = await database.run(
            `INSERT INTO treatment_plans (patient_id, physiotherapist_id, title, description, start_date, goals) VALUES (?, ?, ?, ?, ?, ?)`,
            [patientId, physioId, `Plano de Reabilitação para ${medicalHistories[i % medicalHistories.length]}`, `Descrição detalhada do plano.`, formatDate(startDate), 'Reduzir a dor, melhorar a mobilidade e fortalecer a musculatura.']
        );
        const planId = planResult.lastID;

        const numExercises = getRandomNumber(3, 8);
        const shuffledExercises = [...allExerciseIds].sort(() => 0.5 - Math.random());
        for (let j = 0; j < numExercises; j++) {
            await database.run(
                `INSERT INTO treatment_plan_exercises (treatment_plan_id, exercise_id, sets, repetitions, frequency, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
                [planId, shuffledExercises[j], getRandomNumber(2, 4), getRandomNumber(10, 20), getRandomItem(['Diário', '3x por semana', '2x por semana']), j + 1]
            );
        }
    }
    
    // --- CREATE NOTIFICATIONS ---
    console.log('Creating notifications...');
    for (let i = 0; i < 100; i++) {
        await database.run(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
            [getRandomItem(patientUserIds), `Lembrete de Agendamento`, `Sua próxima sessão de fisioterapia é amanhã.`, `info`]
        );
    }


    console.log(`Database seeded successfully!`);
    console.log(`\nDefault Login Credentials:`);
    console.log(`Admin: admin@fisioflow.com / admin123`);
    console.log(`Physiotherapists: (various emails) / physio123`);
    console.log(`Patients: (various emails) / patient123`);

  } catch (error) {
    console.error(`Error seeding database:`, error);
    throw error;
  }
}

seedDatabase().catch(err => {
    console.error(err);
    process.exit(1);
});
