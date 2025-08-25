/**
 * Rotas para gerenciamento de pacientes
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../database/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, validateParams, commonSchemas } from '../middleware/validation.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/patients - Listar todos os pacientes
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data: patients, error } = await supabaseAdmin
      .from('patients')
      .select(`
        *,
        users!inner(
          name,
          email,
          phone
        )
      `);

    if (error) {
      console.error('Error fetching patients:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const formattedPatients = patients?.map((patient: any) => ({
      ...patient,
      name: patient.users.name,
      email: patient.users.email,
      phone: patient.users.phone
    })) || [];

    res.json(formattedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id - Obter paciente específico
router.get('/:id', validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .select(`
        *,
        users!inner(
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !patient) {
      console.error('Error fetching patient:', error);
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const formattedPatient = {
      ...patient,
      name: patient.users.name,
      email: patient.users.email,
      phone: patient.users.phone
    };
    
    res.json(formattedPatient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/patients/:id - Atualizar paciente
router.put('/:id', 
  validateParams(commonSchemas.id),
  validateRequest(commonSchemas.patient),
  async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, date_of_birth, medical_history, emergency_contact } = (req as any).validatedData;
    
    // Verificar se o paciente existe
    const { data: existingPatient, error: fetchError } = await supabaseAdmin
      .from('patients')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Atualizar dados do usuário
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        email,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPatient.user_id);
    
    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      return res.status(500).json({ error: 'Failed to update user data' });
    }
    
    // Atualizar dados específicos do paciente
    const { error: patientUpdateError } = await supabaseAdmin
      .from('patients')
      .update({
        date_of_birth,
        medical_history,
        emergency_contact,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (patientUpdateError) {
      console.error('Error updating patient:', patientUpdateError);
      return res.status(500).json({ error: 'Failed to update patient data' });
    }
    
    // Buscar paciente atualizado
    const { data: updatedPatient, error: getError } = await supabaseAdmin
      .from('patients')
      .select(`
        *,
        users!inner(
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (getError || !updatedPatient) {
      console.error('Error fetching updated patient:', getError);
      return res.status(500).json({ error: 'Failed to fetch updated patient' });
    }
    
    const formattedPatient = {
      ...updatedPatient,
      name: updatedPatient.users.name,
      email: updatedPatient.users.email,
      phone: updatedPatient.users.phone
    };
    
    res.json(formattedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/patients/:id - Deletar paciente
router.delete('/:id', validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o paciente existe
    const { data: existingPatient, error: fetchError } = await supabaseAdmin
      .from('patients')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Deletar paciente (cascade delete será tratado pelo banco)
    const { error: deletePatientError } = await supabaseAdmin
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (deletePatientError) {
      console.error('Error deleting patient:', deletePatientError);
      return res.status(500).json({ error: 'Failed to delete patient' });
    }
    
    // Deletar usuário associado
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(existingPatient.user_id);
    
    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError);
      // Continue mesmo se falhar ao deletar o usuário auth, pois o paciente já foi deletado
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id/appointments - Obter agendamentos do paciente
router.get('/:id/appointments', validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        physiotherapists!inner(
          users!inner(
            name
          )
        )
      `)
      .eq('patient_id', id)
      .order('date_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching patient appointments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const formattedAppointments = appointments?.map((appointment: any) => ({
      ...appointment,
      physiotherapist_name: appointment.physiotherapists.users.name
    })) || [];
    
    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id/treatment-plans - Obter planos de tratamento do paciente
router.get('/:id/treatment-plans', validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: treatmentPlans, error } = await supabaseAdmin
      .from('treatment_plans')
      .select(`
        *,
        physiotherapists!inner(
          users!inner(
            name
          )
        )
      `)
      .eq('patient_id', id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patient treatment plans:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const formattedTreatmentPlans = treatmentPlans?.map((plan: any) => ({
      ...plan,
      physiotherapist_name: plan.physiotherapists.users.name
    })) || [];
    
    res.json(formattedTreatmentPlans);
  } catch (error) {
    console.error('Error fetching patient treatment plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;