/**
 * Database schema for FisioFlow
 */
import { Database } from './config.js';

/**
 * Initialize database schema
 */
export async function initializeSchema(db: Database): Promise<void> {
  try {
    // Enable foreign keys
    await db.run('PRAGMA foreign_keys = ON');

    // Users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'physiotherapist', 'patient')),
        phone TEXT,
        avatar TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patients table
    await db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        cpf TEXT UNIQUE,
        birth_date DATE,
        gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
        address TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        medical_history TEXT,
        allergies TEXT,
        medications TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Physiotherapists table
    await db.run(`
      CREATE TABLE IF NOT EXISTS physiotherapists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        crefito TEXT UNIQUE NOT NULL,
        specialties TEXT,
        bio TEXT,
        experience_years INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Appointments table
    await db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        physiotherapist_id INTEGER NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER DEFAULT 60,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
        type TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (physiotherapist_id) REFERENCES physiotherapists (id) ON DELETE CASCADE
      )
    `);

    // Exercises table
    await db.run(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        duration INTEGER,
        repetitions INTEGER,
        sets INTEGER,
        instructions TEXT,
        precautions TEXT,
        image_url TEXT,
        video_url TEXT,
        created_by INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Treatment plans table
    await db.run(`
      CREATE TABLE IF NOT EXISTS treatment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        physiotherapist_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
        goals TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (physiotherapist_id) REFERENCES physiotherapists (id) ON DELETE CASCADE
      )
    `);

    // Treatment plan exercises table
    await db.run(`
      CREATE TABLE IF NOT EXISTS treatment_plan_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        treatment_plan_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER,
        repetitions INTEGER,
        duration INTEGER,
        frequency TEXT,
        notes TEXT,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
      )
    `);

    // Exercise logs table
    await db.run(`
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        treatment_plan_id INTEGER,
        completed_sets INTEGER,
        completed_repetitions INTEGER,
        completed_duration INTEGER,
        difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
        pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
        notes TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
        FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans (id) ON DELETE SET NULL
      )
    `);

    // Notifications table
    await db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Files table
    await db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        path TEXT NOT NULL,
        uploaded_by INTEGER NOT NULL,
        entity_type TEXT,
        entity_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients (user_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_physiotherapists_user_id ON physiotherapists (user_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_appointments_physiotherapist_id ON appointments (physiotherapist_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans (patient_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_id ON exercise_logs (patient_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_files_entity ON files (entity_type, entity_id)');

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}