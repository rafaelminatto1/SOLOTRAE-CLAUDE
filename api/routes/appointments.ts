/**
 * Rotas para gerenciamento de agendamentos
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, validateParams, commonSchemas } from '../middleware/validation.js';
import { cacheMiddleware, appointmentCacheHelpers, cacheInvalidationMiddleware } from '../middleware/cache.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/appointments - Listar agendamentos
router.get('/', cacheMiddleware({ ttl: 300, keyGenerator: appointmentCacheHelpers.generateListKey }), async (req: Request, res: Response) => {
  try {
    const { patient_id, physiotherapist_id, status, date } = req.query;
    
    let query = supabaseAdmin
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
        ),
        physiotherapists!inner(
          id,
          users!inner(
            id,
            full_name,
            email
          )
        )
      `);
    
    // Filtros baseados no papel do usuário
    if (req.user?.role === 'patient') {
      // Pacientes só veem seus próprios agendamentos
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (patient) {
        query = query.eq('patient_id', patient.id);
      }
    } else if (req.user?.role === 'physiotherapist') {
      // Fisioterapeutas só veem seus próprios agendamentos
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physiotherapist) {
        query = query.eq('physiotherapist_id', physiotherapist.id);
      }
    }
    
    // Filtros adicionais
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }
    
    if (physiotherapist_id) {
      query = query.eq('physiotherapist_id', physiotherapist_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (date) {
      // Para filtrar por data, usamos gte e lt para pegar todo o dia
      const startDate = `${date}T00:00:00`;
      const endDate = `${date}T23:59:59`;
      query = query.gte('date_time', startDate).lte('date_time', endDate);
    }
    
    const { data: appointments, error } = await query.order('date_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedAppointments = appointments?.map(appointment => ({
      ...appointment,
      patient_name: appointment.patients.users.full_name,
      patient_email: appointment.patients.users.email,
      physiotherapist_name: appointment.physiotherapists.users.full_name,
      physiotherapist_email: appointment.physiotherapists.users.email,
      patients: undefined,
      physiotherapists: undefined
    })) || [];
    
    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/:id - Obter agendamento específico
router.get('/:id', validateParams(commonSchemas.id), cacheMiddleware({ ttl: 600, keyGenerator: appointmentCacheHelpers.generateDetailKey }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: appointment, error } = await supabaseAdmin
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
        ),
        physiotherapists!inner(
          id,
          users!inner(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verificar permissões
    if (req.user?.role === 'patient') {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!patient || appointment.patient_id !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!physiotherapist || appointment.physiotherapist_id !== physiotherapist.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedAppointment = {
      ...appointment,
      patient_name: appointment.patients.users.full_name,
      patient_email: appointment.patients.users.email,
      physiotherapist_name: appointment.physiotherapists.users.full_name,
      physiotherapist_email: appointment.physiotherapists.users.email,
      patients: undefined,
      physiotherapists: undefined
    };
    
    res.json(formattedAppointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/appointments - Criar novo agendamento
router.post('/', validateRequest(commonSchemas.appointment), cacheInvalidationMiddleware(['appointments']), async (req: Request, res: Response) => {
  try {
    const { patient_id, physiotherapist_id, date_time, duration, type, notes } = (req as any).validatedData;
    
    // Validação dos campos obrigatórios
    if (!patient_id || !physiotherapist_id || !date_time || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verificar se o paciente existe
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .single();
    
    if (patientError || !patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Verificar se o fisioterapeuta existe
    const { data: physiotherapist, error: physiotherapistError } = await supabaseAdmin
      .from('physiotherapists')
      .select('*')
      .eq('id', physiotherapist_id)
      .single();
    
    if (physiotherapistError || !physiotherapist) {
      return res.status(404).json({ error: 'Physiotherapist not found' });
    }
    
    // Verificar permissões
    const canCreate = req.user?.role === 'admin' || 
                     req.user?.role === 'physiotherapist' ||
                     (req.user?.role === 'patient' && patient.user_id === req.user.id);
    
    if (!canCreate) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Verificar conflitos de horário
    const { data: conflictingAppointment } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('physiotherapist_id', physiotherapist_id)
      .eq('date_time', date_time)
      .neq('status', 'cancelled')
      .single();
    
    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    
    // Criar agendamento
    const { data: newAppointmentData, error: createError } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id,
        physiotherapist_id,
        date_time,
        duration,
        type: type || 'consultation',
        notes: notes || '',
        status: 'scheduled'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating appointment:', createError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Buscar agendamento criado com informações completas
    const { data: newAppointment, error: fetchError } = await supabaseAdmin
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
        ),
        physiotherapists!inner(
          id,
          users!inner(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', newAppointmentData.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching created appointment:', fetchError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedAppointment = {
      ...newAppointment,
      patient_name: newAppointment.patients.users.full_name,
      patient_email: newAppointment.patients.users.email,
      physiotherapist_name: newAppointment.physiotherapists.users.full_name,
      physiotherapist_email: newAppointment.physiotherapists.users.email,
      patients: undefined,
      physiotherapists: undefined
    };
    
    res.status(201).json(formattedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/appointments/:id - Atualizar agendamento
router.put('/:id', validateParams(commonSchemas.id), validateRequest({
  date_time: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, required: false },
  duration: { type: 'number', min: 15, max: 240, required: false },
  type: { type: 'string', choices: ['consultation', 'treatment', 'evaluation', 'follow_up'], required: false },
  notes: { type: 'string', maxLength: 1000, required: false },
  status: { type: 'string', choices: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], required: false }
}), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date_time, duration, type, notes, status } = (req as any).validatedData;
    
    // Verificar se o agendamento existe
    const { data: existingAppointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (appointmentError || !existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verificar permissões
    if (req.user?.role === 'patient') {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!patient || existingAppointment.patient_id !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Pacientes não podem alterar status
      if (status && status !== existingAppointment.status) {
        return res.status(403).json({ error: 'Patients cannot change appointment status' });
      }
    } else if (req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!physiotherapist || existingAppointment.physiotherapist_id !== physiotherapist.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Se mudando data/hora, verificar conflitos
    if (date_time && date_time !== existingAppointment.date_time) {
      const { data: conflictingAppointment } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('physiotherapist_id', existingAppointment.physiotherapist_id)
        .eq('date_time', date_time)
        .neq('status', 'cancelled')
        .neq('id', id)
        .single();
      
      if (conflictingAppointment) {
        return res.status(409).json({ error: 'Time slot already booked' });
      }
    }
    
    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (date_time !== undefined) updateData.date_time = date_time;
    if (duration !== undefined) updateData.duration = duration;
    if (type !== undefined) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    
    // Atualizar agendamento
    const { error: updateError } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Buscar agendamento atualizado
    const { data: updatedAppointment, error: fetchError } = await supabaseAdmin
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
        ),
        physiotherapists!inner(
          id,
          users!inner(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated appointment:', fetchError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedAppointment = {
      ...updatedAppointment,
      patient_name: updatedAppointment.patients.users.full_name,
      patient_email: updatedAppointment.patients.users.email,
      physiotherapist_name: updatedAppointment.physiotherapists.users.full_name,
      physiotherapist_email: updatedAppointment.physiotherapists.users.email,
      patients: undefined,
      physiotherapists: undefined
    };
    
    res.json(formattedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/appointments/:id - Cancelar agendamento
router.delete('/:id', validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o agendamento existe
    const { data: existingAppointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (appointmentError || !existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verificar permissões
    if (req.user?.role === 'patient') {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!patient || existingAppointment.patient_id !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!physiotherapist || existingAppointment.physiotherapist_id !== physiotherapist.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Marcar como cancelado em vez de deletar
    const { error: updateError } = await supabaseAdmin
      .from('appointments')
      .update({ 
        status: 'cancelled', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error cancelling appointment:', updateError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;