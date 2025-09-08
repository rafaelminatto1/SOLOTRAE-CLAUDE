/**
 * Rotas para gerenciamento de fisioterapeutas
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { cacheMiddleware, physiotherapistCacheHelpers, cacheInvalidationMiddleware } from '../middleware/cache.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/physiotherapists - Listar todos os fisioterapeutas
router.get('/', cacheMiddleware({ ttl: 600, keyGenerator: physiotherapistCacheHelpers.generateListKey }), async (req: Request, res: Response) => {
  try {
    const { data: physiotherapists, error } = await supabaseAdmin
      .from('physiotherapists')
      .select(`
        *,
        users!inner(
          id,
          full_name,
          email,
          phone
        )
      `);

    if (error) {
      console.error('Error fetching physiotherapists:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Formatar resposta para manter compatibilidade
    const formattedPhysiotherapists = physiotherapists?.map(p => ({
      ...p,
      name: p.users.full_name,
      email: p.users.email,
      phone: p.users.phone,
      users: undefined
    })) || [];

    res.json(formattedPhysiotherapists);
  } catch (error) {
    console.error('Error fetching physiotherapists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/physiotherapists/by-user/:userId - Obter fisioterapeuta por user_id
router.get('/by-user/:userId', cacheMiddleware({ ttl: 600, keyGenerator: physiotherapistCacheHelpers.generateByUserKey }), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const { data: physiotherapist, error } = await supabaseAdmin
      .from('physiotherapists')
      .select(`
        *,
        users!inner(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !physiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }

    // Formatar resposta para manter compatibilidade
    const formattedPhysiotherapist = {
      ...physiotherapist,
      name: physiotherapist.users.full_name,
      email: physiotherapist.users.email,
      phone: physiotherapist.users.phone,
      users: undefined
    };
    
    res.json(formattedPhysiotherapist);
  } catch (error) {
    console.error('Error fetching physiotherapist by user_id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/physiotherapists/:id - Obter fisioterapeuta específico
router.get('/:id', cacheMiddleware({ ttl: 600, keyGenerator: physiotherapistCacheHelpers.generateDetailKey }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: physiotherapist, error } = await supabaseAdmin
      .from('physiotherapists')
      .select(`
        *,
        users!inner(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error || !physiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }

    // Formatar resposta para manter compatibilidade
    const formattedPhysiotherapist = {
      ...physiotherapist,
      name: physiotherapist.users.full_name,
      email: physiotherapist.users.email,
      phone: physiotherapist.users.phone,
      users: undefined
    };
    
    res.json(formattedPhysiotherapist);
  } catch (error) {
    console.error('Error fetching physiotherapist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/physiotherapists/:id - Atualizar fisioterapeuta
router.put('/:id', cacheInvalidationMiddleware(['physiotherapists', 'users']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, license_number, specialization, bio } = req.body;
    
    // Verificar se o fisioterapeuta existe
    const { data: existingPhysiotherapist, error: fetchError } = await supabaseAdmin
      .from('physiotherapists')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPhysiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }
    
    // Verificar permissões (apenas admin ou o próprio fisioterapeuta)
    if (req.user?.role !== 'admin' && req.user?.id !== existingPhysiotherapist.user_id) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Atualizar dados do usuário
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        full_name: name,
        email,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPhysiotherapist.user_id);

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Atualizar dados específicos do fisioterapeuta
    const { error: physiotherapistUpdateError } = await supabaseAdmin
      .from('physiotherapists')
      .update({
        license_number,
        specialization,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (physiotherapistUpdateError) {
      console.error('Error updating physiotherapist:', physiotherapistUpdateError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Buscar fisioterapeuta atualizado
    const { data: updatedPhysiotherapist, error: selectError } = await supabaseAdmin
      .from('physiotherapists')
      .select(`
        *,
        users!inner(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (selectError || !updatedPhysiotherapist) {
      return res.status(500).json({ error: 'Error fetching updated physiotherapist' });
    }

    // Formatar resposta para manter compatibilidade
    const formattedPhysiotherapist = {
      ...updatedPhysiotherapist,
      name: updatedPhysiotherapist.users.full_name,
      email: updatedPhysiotherapist.users.email,
      phone: updatedPhysiotherapist.users.phone,
      users: undefined
    };
    
    res.json(formattedPhysiotherapist);
  } catch (error) {
    console.error('Error updating physiotherapist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/physiotherapists/:id - Deletar fisioterapeuta (apenas admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o fisioterapeuta existe
    const { data: existingPhysiotherapist, error: fetchError } = await supabaseAdmin
      .from('physiotherapists')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPhysiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }
    
    // Deletar fisioterapeuta
    const { error: deletePhysiotherapistError } = await supabaseAdmin
      .from('physiotherapists')
      .delete()
      .eq('id', id);

    if (deletePhysiotherapistError) {
      console.error('Error deleting physiotherapist:', deletePhysiotherapistError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Deletar usuário usando Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
      existingPhysiotherapist.user_id
    );

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({ message: 'Physiotherapist deleted successfully' });
  } catch (error) {
    console.error('Error deleting physiotherapist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/physiotherapists/:id/patients - Obter pacientes do fisioterapeuta
router.get('/:id/patients', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar permissões (apenas admin ou o próprio fisioterapeuta)
    const { data: physiotherapist, error: fetchError } = await supabaseAdmin
      .from('physiotherapists')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !physiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }
    
    if (req.user?.role !== 'admin' && req.user?.id !== physiotherapist.user_id) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data: patients, error: patientsError } = await supabaseAdmin
      .from('patients')
      .select(`
        *,
        users!inner(
          id,
          full_name,
          email,
          phone
        ),
        appointments!inner(
          physiotherapist_id
        )
      `)
      .eq('appointments.physiotherapist_id', id);

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Formatar resposta para manter compatibilidade e remover duplicatas
    const uniquePatients = patients?.reduce((acc: any[], patient: any) => {
      const existingPatient = acc.find(p => p.id === patient.id);
      if (!existingPatient) {
        acc.push({
          ...patient,
          name: patient.users.full_name,
          email: patient.users.email,
          phone: patient.users.phone,
          users: undefined,
          appointments: undefined
        });
      }
      return acc;
    }, []) || [];
    
    res.json(uniquePatients);
  } catch (error) {
    console.error('Error fetching physiotherapist patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/physiotherapists/:id/appointments - Obter agendamentos do fisioterapeuta
router.get('/:id/appointments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar permissões (apenas admin ou o próprio fisioterapeuta)
    const { data: physiotherapist, error: fetchError } = await supabaseAdmin
      .from('physiotherapists')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !physiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }
    
    if (req.user?.role !== 'admin' && req.user?.id !== physiotherapist.user_id) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        patients!inner(
          id,
          users!inner(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('physiotherapist_id', id)
      .order('date_time', { ascending: true });

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Formatar resposta para manter compatibilidade
    const formattedAppointments = appointments?.map(appointment => ({
      ...appointment,
      patient_name: appointment.patients.users.full_name,
      patient_email: appointment.patients.users.email,
      patients: undefined
    })) || [];
    
    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching physiotherapist appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/physiotherapists/:id/schedule - Obter horários disponíveis
router.get('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    // Verificar se o fisioterapeuta existe
    const physiotherapist = await database.get('SELECT * FROM physiotherapists WHERE id = ?', [id]);
    if (!physiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }
    
    // Buscar agendamentos para a data específica
    let query = `
      SELECT date_time, duration 
      FROM appointments 
      WHERE physiotherapist_id = ? AND status != 'cancelled'
    `;
    const params = [id];
    
    if (date) {
      query += ` AND date(date_time) = ?`;
      params.push(date as string);
    }
    
    query += ` ORDER BY date_time ASC`;
    
    const appointments = await database.all(query, params);
    
    res.json({
      physiotherapist_id: id,
      date: date || 'all',
      appointments
    });
  } catch (error) {
    console.error('Error fetching physiotherapist schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;