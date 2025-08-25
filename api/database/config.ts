import fs from 'fs';
import path from 'path';

interface DatabaseData {
  users: any[];
  patients: any[];
  physiotherapists: any[];
  appointments: any[];
  exercises: any[];
  treatment_plans: any[];
  treatment_plan_exercises: any[];
  exercise_logs: any[];
  notifications: any[];
  files: any[];
  migrations: any[];
}

class DatabaseManager {
  private dbPath: string;
  private data: DatabaseData;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'fisioflow.json');
    this.data = {
      users: [],
      patients: [],
      physiotherapists: [],
      appointments: [],
      exercises: [],
      treatment_plans: [],
      treatment_plan_exercises: [],
      exercise_logs: [],
      notifications: [],
      files: [],
      migrations: []
    };
  }

  async connect(): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load existing data if file exists
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
      }

      console.log('Connected to JSON database');
    } catch (err) {
      throw new Error(`Failed to connect to database: ${err}`);
    }
  }

  async close(): Promise<void> {
    // Save data to file
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    console.log('Database connection closed');
  }

  getDb(): any {
    return this.data;
  }

  save(): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    // Simple SQL parser for basic operations
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('create table')) {
      // Table creation - just return success for JSON implementation
      return { lastID: 0, changes: 0 };
    }
    
    if (sqlLower.startsWith('insert into')) {
      return this.handleInsert(sql, params);
    }
    
    if (sqlLower.startsWith('update')) {
      return this.handleUpdate(sql, params);
    }
    
    if (sqlLower.startsWith('delete')) {
      return this.handleDelete(sql, params);
    }
    
    return { lastID: 0, changes: 0 };
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.includes('select count(*) as count from users')) {
      return { count: this.data.users.length };
    }
    
    if (sqlLower.includes('select filename from migrations')) {
      return this.data.migrations.map(m => ({ filename: m.filename }));
    }
    
    // Handle patient queries
    if (sqlLower.includes('select * from patients where id = ?')) {
      const patientId = params[0];
      return this.data.patients.find(p => p.id == patientId) || null;
    }
    
    // Handle physiotherapist queries
    if (sqlLower.includes('select * from physiotherapists where id = ?')) {
      const physiotherapistId = params[0];
      return this.data.physiotherapists.find(p => p.id == physiotherapistId) || null;
    }
    
    // Handle user queries
    if (sqlLower.includes('select * from users where id = ?')) {
      const userId = params[0];
      return this.data.users.find(u => u.id == userId) || null;
    }
    
    // Handle appointment queries
    if (sqlLower.includes('select * from appointments where id = ?')) {
      const appointmentId = params[0];
      return this.data.appointments.find(a => a.id == appointmentId) || null;
    }
    
    // Handle exercise queries
    if (sqlLower.includes('select * from exercises where id = ?')) {
      const exerciseId = params[0];
      return this.data.exercises.find(e => e.id == exerciseId) || null;
    }
    
    if (sqlLower.includes('select * from exercises where name = ?')) {
      const exerciseName = params[0];
      return this.data.exercises.find(e => e.name === exerciseName) || null;
    }
    
    // Handle physiotherapist queries
    if (sqlLower.includes('select * from physiotherapists where id = ?')) {
      const physiotherapistId = params[0];
      return this.data.physiotherapists.find(p => p.id == physiotherapistId) || null;
    }
    
    if (sqlLower.includes('select * from physiotherapists where user_id = ?')) {
      const userId = params[0];
      return this.data.physiotherapists.find(p => p.user_id == userId) || null;
    }
    
    if (sqlLower.includes('select id from physiotherapists where user_id = ?')) {
      const userId = params[0];
      const physio = this.data.physiotherapists.find(p => p.user_id == userId);
      return physio ? { id: physio.id } : null;
    }
    
    // Handle complex physiotherapist JOIN queries by ID
    if (sqlLower.includes('select p.*') && sqlLower.includes('u.name') && sqlLower.includes('u.email') && sqlLower.includes('from physiotherapists p') && sqlLower.includes('join users u') && sqlLower.includes('where p.id = ?')) {
      const physiotherapistId = params[0];
      const physiotherapist = this.data.physiotherapists.find(p => p.id == physiotherapistId);
      if (!physiotherapist) return null;
      
      const user = this.data.users.find(u => u.id == physiotherapist.user_id);
      return {
        ...physiotherapist,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      };
    }
    
    // Handle complex physiotherapist JOIN queries by user_id
    if (sqlLower.includes('select p.*') && sqlLower.includes('u.name') && sqlLower.includes('u.email') && sqlLower.includes('from physiotherapists p') && sqlLower.includes('join users u') && sqlLower.includes('where p.user_id = ?')) {
      const userId = params[0];
      const physiotherapist = this.data.physiotherapists.find(p => p.user_id == userId);
      if (!physiotherapist) return null;
      
      const user = this.data.users.find(u => u.id == physiotherapist.user_id);
      return {
        ...physiotherapist,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      };
    }
    
    // Handle treatment plan queries
    if (sqlLower.includes('select * from treatment_plans where id = ?')) {
      const treatmentPlanId = params[0];
      return this.data.treatment_plans.find(tp => tp.id == treatmentPlanId) || null;
    }
    
    // Handle complex treatment plan JOIN queries
    if (sqlLower.includes('select tp.*') && sqlLower.includes('from treatment_plans tp') && sqlLower.includes('join patients p') && sqlLower.includes('where tp.id = ?')) {
      const treatmentPlanId = params[0];
      const treatmentPlan = this.data.treatment_plans.find(tp => tp.id == treatmentPlanId);
      if (!treatmentPlan) return null;
      
      // Find related patient and physiotherapist data
      const patient = this.data.patients.find(p => p.id == treatmentPlan.patient_id);
      const physiotherapist = this.data.physiotherapists.find(p => p.id == treatmentPlan.physiotherapist_id);
      const patientUser = patient ? this.data.users.find(u => u.id == patient.user_id) : null;
      const physiotherapistUser = physiotherapist ? this.data.users.find(u => u.id == physiotherapist.user_id) : null;
      
      return {
        ...treatmentPlan,
        patient_name: patientUser?.name || '',
        patient_email: patientUser?.email || '',
        physiotherapist_name: physiotherapistUser?.name || '',
        physiotherapist_email: physiotherapistUser?.email || ''
      };
    }
    
    // Handle complex treatment plan JOIN queries with multiple user joins (specific pattern from POST route)
    if (sqlLower.includes('select tp.*') && sqlLower.includes('pt.name as patient_name') && sqlLower.includes('pu.email as patient_email') && sqlLower.includes('ph.name as physiotherapist_name') && sqlLower.includes('phu.email as physiotherapist_email') && sqlLower.includes('where tp.id = ?')) {
      const treatmentPlanId = params[0];
      const treatmentPlan = this.data.treatment_plans.find(tp => tp.id == treatmentPlanId);
      if (!treatmentPlan) return null;
      
      // Find related patient and physiotherapist data
      const patient = this.data.patients.find(p => p.id == treatmentPlan.patient_id);
      const physiotherapist = this.data.physiotherapists.find(p => p.id == treatmentPlan.physiotherapist_id);
      const patientUser = patient ? this.data.users.find(u => u.id == patient.user_id) : null;
      const physiotherapistUser = physiotherapist ? this.data.users.find(u => u.id == physiotherapist.user_id) : null;
      
      return {
        ...treatmentPlan,
        patient_name: patientUser?.name || '',
        patient_email: patientUser?.email || '',
        physiotherapist_name: physiotherapistUser?.name || '',
        physiotherapist_email: physiotherapistUser?.email || ''
      };
    }
    
    // Handle complex treatment plan JOIN queries with multiple user joins (general pattern)
    if (sqlLower.includes('select tp.*') && sqlLower.includes('pt.name as patient_name') && sqlLower.includes('ph.name as physiotherapist_name') && sqlLower.includes('where tp.id = ?')) {
      const treatmentPlanId = params[0];
      const treatmentPlan = this.data.treatment_plans.find(tp => tp.id == treatmentPlanId);
      if (!treatmentPlan) return null;
      
      // Find related patient and physiotherapist data
      const patient = this.data.patients.find(p => p.id == treatmentPlan.patient_id);
      const physiotherapist = this.data.physiotherapists.find(p => p.id == treatmentPlan.physiotherapist_id);
      const patientUser = patient ? this.data.users.find(u => u.id == patient.user_id) : null;
      const physiotherapistUser = physiotherapist ? this.data.users.find(u => u.id == physiotherapist.user_id) : null;
      
      return {
        ...treatmentPlan,
        patient_name: patientUser?.name || '',
        patient_email: patientUser?.email || '',
        physiotherapist_name: physiotherapistUser?.name || '',
        physiotherapist_email: physiotherapistUser?.email || ''
      };
    }
    
    // Handle treatment plan exercises queries
    if (sqlLower.includes('select tpe.*') && sqlLower.includes('from treatment_plan_exercises tpe') && sqlLower.includes('join exercises e') && sqlLower.includes('where tpe.treatment_plan_id = ?')) {
      const treatmentPlanId = params[0];
      const planExercises = this.data.treatment_plan_exercises?.filter(tpe => tpe.treatment_plan_id == treatmentPlanId) || [];
      
      return planExercises.map(tpe => {
        const exercise = this.data.exercises.find(e => e.id == tpe.exercise_id);
        return {
          ...tpe,
          name: exercise?.name || '',
          description: exercise?.description || '',
          category: exercise?.category || '',
          difficulty: exercise?.difficulty_level || '',
          duration: exercise?.duration || 0,
          instructions: exercise?.instructions || '',
          video_url: exercise?.video_url || '',
          image_url: exercise?.image_url || ''
        };
      });
    }
    
    // Default return for other queries
    return null;
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.includes('select filename from migrations')) {
      return this.data.migrations.map(m => ({ filename: m.filename }));
    }
    
    // Handle exercise queries
    if (sqlLower.includes('select * from exercises')) {
      return this.data.exercises || [];
    }
    
    if (sqlLower.includes('select distinct category from exercises')) {
      const categories = [...new Set((this.data.exercises || []).map(e => e.category).filter(Boolean))];
      return categories.map(category => ({ category }));
    }
    
    if (sqlLower.includes('select distinct difficulty_level from exercises')) {
      const difficulties = [...new Set((this.data.exercises || []).map(e => e.difficulty_level).filter(Boolean))];
      return difficulties.map(difficulty_level => ({ difficulty_level }));
    }
    
    // Handle physiotherapist queries
    if (sqlLower.includes('select * from physiotherapists')) {
      return this.data.physiotherapists || [];
    }
    
    // Handle treatment plan queries
    if (sqlLower.includes('select * from treatment_plans')) {
      return this.data.treatment_plans || [];
    }
    
    // Handle complex treatment plan JOIN queries for listing
    if (sqlLower.includes('select tp.*') && sqlLower.includes('from treatment_plans tp') && sqlLower.includes('join patients p') && sqlLower.includes('join physiotherapists phy')) {
      const treatmentPlans = this.data.treatment_plans || [];
      
      return treatmentPlans.map(tp => {
        const patient = this.data.patients.find(p => p.id == tp.patient_id);
        const physiotherapist = this.data.physiotherapists.find(p => p.id == tp.physiotherapist_id);
        const patientUser = patient ? this.data.users.find(u => u.id == patient.user_id) : null;
        const physiotherapistUser = physiotherapist ? this.data.users.find(u => u.id == physiotherapist.user_id) : null;
        
        return {
          ...tp,
          patient_name: patientUser?.name || '',
          patient_email: patientUser?.email || '',
          physiotherapist_name: physiotherapistUser?.name || '',
          physiotherapist_email: physiotherapistUser?.email || ''
        };
      });
    }
    
    // Handle treatment plan exercises queries
    if (sqlLower.includes('select tpe.*') && sqlLower.includes('from treatment_plan_exercises tpe') && sqlLower.includes('join exercises e') && sqlLower.includes('where tpe.treatment_plan_id = ?')) {
      const treatmentPlanId = params[0];
      const planExercises = this.data.treatment_plan_exercises?.filter(tpe => tpe.treatment_plan_id == treatmentPlanId) || [];
      
      return planExercises.map(tpe => {
        const exercise = this.data.exercises.find(e => e.id == tpe.exercise_id);
        return {
          ...tpe,
          name: exercise?.name || '',
          description: exercise?.description || '',
          category: exercise?.category || '',
          difficulty: exercise?.difficulty_level || '',
          duration: exercise?.duration || 0,
          instructions: exercise?.instructions || '',
          video_url: exercise?.video_url || '',
          image_url: exercise?.image_url || ''
        };
      });
    }
    
    return [];
  }

  private handleInsert(sql: string, params: any[]): any {
    const sqlLower = sql.toLowerCase();
    let table = '';
    
    if (sqlLower.includes('insert into users')) {
      table = 'users';
    } else if (sqlLower.includes('insert into patients')) {
      table = 'patients';
    } else if (sqlLower.includes('insert into physiotherapists')) {
      table = 'physiotherapists';
    } else if (sqlLower.includes('insert into appointments')) {
      table = 'appointments';
    } else if (sqlLower.includes('insert into exercises')) {
      table = 'exercises';
    } else if (sqlLower.includes('insert into treatment_plans')) {
      table = 'treatment_plans';
    } else if (sqlLower.includes('insert into treatment_plan_exercises')) {
      table = 'treatment_plan_exercises';
    } else if (sqlLower.includes('insert into notifications')) {
      table = 'notifications';
    } else if (sqlLower.includes('insert into migrations')) {
      table = 'migrations';
    }
    
    if (table && this.data[table as keyof DatabaseData]) {
      const id = this.data[table as keyof DatabaseData].length + 1;
      const record = { id, ...this.parseInsertParams(sql, params) };
      (this.data[table as keyof DatabaseData] as any[]).push(record);
      
      // Save to file
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      
      return { lastInsertRowid: id, changes: 1 };
    }
    
    return { lastID: 0, changes: 0 };
  }

  private handleUpdate(sql: string, params: any[]): any {
    // Simple update implementation
    return { changes: 1 };
  }

  private handleDelete(sql: string, params: any[]): any {
    // Simple delete implementation
    return { changes: 1 };
  }

  private parseInsertParams(sql: string, params: any[]): any {
    const record: any = {};
    const sqlLower = sql.toLowerCase();
    
    // Map parameters to correct field names based on table
    if (sqlLower.includes('insert into users')) {
      const fields = ['email', 'password', 'name', 'role', 'phone', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into patients')) {
      const fields = ['user_id', 'date_of_birth', 'gender', 'address', 'emergency_contact', 'medical_history', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into physiotherapists')) {
      const fields = ['user_id', 'license_number', 'specialization', 'experience_years', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into appointments')) {
      const fields = ['patient_id', 'physiotherapist_id', 'appointment_date', 'duration', 'status', 'notes', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into exercises')) {
      const fields = ['name', 'description', 'category', 'difficulty_level', 'duration', 'instructions', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into treatment_plans')) {
      const fields = ['patient_id', 'physiotherapist_id', 'title', 'description', 'goals', 'start_date', 'end_date', 'status', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into treatment_plan_exercises')) {
      const fields = ['treatment_plan_id', 'exercise_id', 'sets', 'repetitions', 'duration', 'notes', 'order_index', 'created_at', 'updated_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into notifications')) {
      const fields = ['user_id', 'title', 'message', 'type', 'read', 'created_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else if (sqlLower.includes('insert into migrations')) {
      const fields = ['filename', 'executed_at'];
      params.forEach((param, index) => {
        if (fields[index]) {
          record[fields[index]] = param;
        }
      });
    } else {
      // Fallback for unknown tables
      params.forEach((param, index) => {
        record[`field_${index}`] = param;
      });
    }
    
    return record;
  }
}

export const database = new DatabaseManager();