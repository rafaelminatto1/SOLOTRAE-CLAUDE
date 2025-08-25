/**
 * Rotas para gerenciamento do progresso dos exercícios
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../database/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/progress - Listar progresso dos exercícios
router.get('/', async (req: Request, res: Response) => {
  try {
    const { patient_id, exercise_id, treatment_plan_id, date_from, date_to } = req.query;
    
    let query = supabaseAdmin
      .from('exercise_progress')
      .select(`
        *,
        exercises!inner(name, category, difficulty),
        treatment_plans(title),
        patients!inner(
          id,
          users!inner(name, email)
        )
      `);
    
    // Filtros baseados no papel do usuário
    if (req.user?.role === 'patient') {
      // Pacientes só veem seu próprio progresso
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (patient) {
        query = query.eq('patient_id', patient.id);
      }
    } else if (req.user?.role === 'physiotherapist') {
      // Fisioterapeutas só veem progresso de seus pacientes
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physiotherapist) {
        const { data: treatmentPlans } = await supabaseAdmin
          .from('treatment_plans')
          .select('patient_id')
          .eq('physiotherapist_id', physiotherapist.id);
        
        const patientIds = treatmentPlans?.map(tp => tp.patient_id) || [];
        if (patientIds.length > 0) {
          query = query.in('patient_id', patientIds);
        }
      }
    }
    
    // Filtros adicionais
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }
    
    if (exercise_id) {
      query = query.eq('exercise_id', exercise_id);
    }
    
    if (treatment_plan_id) {
      query = query.eq('treatment_plan_id', treatment_plan_id);
    }
    
    if (date_from) {
      query = query.gte('completed_at', date_from);
    }
    
    if (date_to) {
      query = query.lte('completed_at', date_to);
    }
    
    const { data: progress, error } = await query.order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching exercise progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedProgress = progress?.map(p => ({
      ...p,
      exercise_name: p.exercises?.name,
      category: p.exercises?.category,
      difficulty: p.exercises?.difficulty,
      treatment_plan_title: p.treatment_plans?.title,
      patient_name: p.patients?.users?.name,
      patient_email: p.patients?.users?.email
    })) || [];
    
    res.json(formattedProgress);
  } catch (error) {
    console.error('Error fetching exercise progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/:id - Obter progresso específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: progress, error } = await supabaseAdmin
      .from('exercise_progress')
      .select(`
        *,
        exercises!inner(name, category, difficulty, instructions),
        treatment_plans(title),
        patients!inner(
          id,
          user_id,
          users!inner(name, email)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }
    
    // Verificar permissões
    let hasPermission = req.user?.role === 'admin' || 
                       (req.user?.role === 'patient' && progress.patients?.user_id === req.user.id);
    
    // Fisioterapeutas podem ver progresso de seus pacientes
    if (req.user?.role === 'physiotherapist' && !hasPermission) {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physiotherapist) {
        const { data: treatmentPlan } = await supabaseAdmin
          .from('treatment_plans')
          .select('id')
          .eq('patient_id', progress.patient_id)
          .eq('physiotherapist_id', physiotherapist.id)
          .single();
        
        hasPermission = !!treatmentPlan;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedProgress = {
      ...progress,
      exercise_name: progress.exercises?.name,
      category: progress.exercises?.category,
      difficulty: progress.exercises?.difficulty,
      instructions: progress.exercises?.instructions,
      treatment_plan_title: progress.treatment_plans?.title,
      patient_name: progress.patients?.users?.name,
      patient_email: progress.patients?.users?.email
    };
    
    res.json(formattedProgress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress - Registrar progresso de exercício
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      exercise_id, 
      treatment_plan_id, 
      sets_completed, 
      repetitions_completed, 
      duration_completed, 
      difficulty_rating, 
      pain_level, 
      notes 
    } = req.body;
    
    // Validação dos campos obrigatórios
    if (!exercise_id) {
      return res.status(400).json({ error: 'Missing required field: exercise_id' });
    }
    
    // Verificar se o exercício existe
    const { data: exercise } = await supabaseAdmin
      .from('exercises')
      .select('id')
      .eq('id', exercise_id)
      .single();
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Obter ID do paciente
    let patient_id;
    if (req.user?.role === 'patient') {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!patient) {
        return res.status(403).json({ error: 'Patient profile not found' });
      }
      patient_id = patient.id;
    } else {
      // Admin ou fisioterapeuta deve especificar o paciente
      patient_id = req.body.patient_id;
      if (!patient_id) {
        return res.status(400).json({ error: 'patient_id is required' });
      }
      
      // Verificar se o paciente existe
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('id', patient_id)
        .single();
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      // Fisioterapeutas só podem registrar progresso para seus pacientes
      if (req.user?.role === 'physiotherapist') {
        const { data: physiotherapist } = await supabaseAdmin
          .from('physiotherapists')
          .select('id')
          .eq('user_id', req.user.id)
          .single();
        
        if (physiotherapist) {
          const { data: treatmentPlan } = await supabaseAdmin
            .from('treatment_plans')
            .select('id')
            .eq('patient_id', patient_id)
            .eq('physiotherapist_id', physiotherapist.id)
            .single();
          
          if (!treatmentPlan) {
            return res.status(403).json({ error: 'Permission denied: not your patient' });
          }
        }
      }
    }
    
    // Verificar se o plano de tratamento existe (se fornecido)
    if (treatment_plan_id) {
      const { data: treatmentPlan } = await supabaseAdmin
        .from('treatment_plans')
        .select('id')
        .eq('id', treatment_plan_id)
        .eq('patient_id', patient_id)
        .single();
      if (!treatmentPlan) {
        return res.status(404).json({ error: 'Treatment plan not found for this patient' });
      }
    }
    
    // Registrar progresso
    const { data: newProgress, error: insertError } = await supabaseAdmin
      .from('exercise_progress')
      .insert({
        patient_id,
        exercise_id,
        treatment_plan_id: treatment_plan_id || null,
        sets_completed: sets_completed || 0,
        repetitions_completed: repetitions_completed || 0,
        duration_completed: duration_completed || 0,
        difficulty_rating: difficulty_rating || null,
        pain_level: pain_level || null,
        notes: notes || '',
        completed_at: new Date().toISOString()
      })
      .select(`
        *,
        exercises!inner(name, category, difficulty),
        treatment_plans(title),
        patients!inner(
          id,
          users!inner(name, email)
        )
      `)
      .single();
    
    if (insertError) {
      console.error('Error creating exercise progress:', insertError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedProgress = {
      ...newProgress,
      exercise_name: newProgress.exercises?.name,
      category: newProgress.exercises?.category,
      difficulty: newProgress.exercises?.difficulty,
      treatment_plan_title: newProgress.treatment_plans?.title,
      patient_name: newProgress.patients?.users?.name,
      patient_email: newProgress.patients?.users?.email
    };
    
    res.status(201).json(formattedProgress);
  } catch (error) {
    console.error('Error creating exercise progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/progress/:id - Atualizar progresso
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      sets_completed, 
      repetitions_completed, 
      duration_completed, 
      difficulty_rating, 
      pain_level, 
      notes 
    } = req.body;
    
    // Verificar se o progresso existe
    const { data: existingProgress } = await supabaseAdmin
      .from('exercise_progress')
      .select('*, patients!inner(user_id)')
      .eq('id', id)
      .single();
    
    if (!existingProgress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }
    
    // Verificar permissões
    let hasPermission = req.user?.role === 'admin' || 
                       (req.user?.role === 'patient' && existingProgress.patients?.user_id === req.user.id);
    
    // Fisioterapeutas podem editar progresso de seus pacientes
    if (req.user?.role === 'physiotherapist' && !hasPermission) {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physiotherapist) {
        const { data: treatmentPlan } = await supabaseAdmin
          .from('treatment_plans')
          .select('id')
          .eq('patient_id', existingProgress.patient_id)
          .eq('physiotherapist_id', physiotherapist.id)
          .single();
        
        hasPermission = !!treatmentPlan;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (sets_completed !== undefined) updateData.sets_completed = sets_completed;
    if (repetitions_completed !== undefined) updateData.repetitions_completed = repetitions_completed;
    if (duration_completed !== undefined) updateData.duration_completed = duration_completed;
    if (difficulty_rating !== undefined) updateData.difficulty_rating = difficulty_rating;
    if (pain_level !== undefined) updateData.pain_level = pain_level;
    if (notes !== undefined) updateData.notes = notes;
    
    // Atualizar progresso
    const { data: updatedProgress, error: updateError } = await supabaseAdmin
      .from('exercise_progress')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        exercises!inner(name, category, difficulty),
        treatment_plans(title),
        patients!inner(
          id,
          users!inner(name, email)
        )
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating exercise progress:', updateError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedProgress = {
      ...updatedProgress,
      exercise_name: updatedProgress.exercises?.name,
      category: updatedProgress.exercises?.category,
      difficulty: updatedProgress.exercises?.difficulty,
      treatment_plan_title: updatedProgress.treatment_plans?.title,
      patient_name: updatedProgress.patients?.users?.name,
      patient_email: updatedProgress.patients?.users?.email
    };
    
    res.json(formattedProgress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/progress/:id - Deletar progresso
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o progresso existe
    const { data: existingProgress } = await supabaseAdmin
      .from('exercise_progress')
      .select('*, patients!inner(user_id)')
      .eq('id', id)
      .single();
    
    if (!existingProgress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }
    
    // Verificar permissões
    let hasPermission = req.user?.role === 'admin' || 
                       (req.user?.role === 'patient' && existingProgress.patients?.user_id === req.user.id);
    
    // Fisioterapeutas podem deletar progresso de seus pacientes
    if (req.user?.role === 'physiotherapist' && !hasPermission) {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physiotherapist) {
        const { data: treatmentPlan } = await supabaseAdmin
          .from('treatment_plans')
          .select('id')
          .eq('patient_id', existingProgress.patient_id)
          .eq('physiotherapist_id', physiotherapist.id)
          .single();
        
        hasPermission = !!treatmentPlan;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Deletar progresso
    const { error: deleteError } = await supabaseAdmin
      .from('exercise_progress')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting exercise progress:', deleteError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({ message: 'Progress record deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/stats/:patientId - Obter estatísticas de progresso do paciente
router.get('/stats/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;
    
    // Verificar se o paciente existe
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('*, users!inner(id)')
      .eq('id', patientId)
      .single();
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Verificar permissões
    let hasPermission = req.user?.role === 'admin' || 
                       (req.user?.role === 'patient' && patient.users?.id === req.user.id);
    
    // Fisioterapeutas podem ver stats de seus pacientes
    if (req.user?.role === 'physiotherapist' && !hasPermission) {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physiotherapist) {
        const { data: treatmentPlan } = await supabaseAdmin
          .from('treatment_plans')
          .select('id')
          .eq('patient_id', patientId)
          .eq('physiotherapist_id', physiotherapist.id)
          .single();
        
        hasPermission = !!treatmentPlan;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Calcular data limite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days as string));
    
    // Buscar dados de progresso
    const { data: progressData } = await supabaseAdmin
      .from('exercise_progress')
      .select(`
        *,
        exercises!inner(name, category)
      `)
      .eq('patient_id', patientId)
      .gte('completed_at', dateLimit.toISOString());
    
    // Estatísticas gerais
    const totalSessions = progressData?.length || 0;
    
    const avgPainLevel = progressData?.length ? 
      progressData.filter(p => p.pain_level !== null)
        .reduce((sum, p) => sum + p.pain_level, 0) / 
        progressData.filter(p => p.pain_level !== null).length : null;
    
    const avgDifficulty = progressData?.length ? 
      progressData.filter(p => p.difficulty_rating !== null)
        .reduce((sum, p) => sum + p.difficulty_rating, 0) / 
        progressData.filter(p => p.difficulty_rating !== null).length : null;
    
    // Progresso por exercício
    const exerciseGroups = progressData?.reduce((acc, progress) => {
      const exerciseId = progress.exercise_id;
      if (!acc[exerciseId]) {
        acc[exerciseId] = {
          name: progress.exercises?.name,
          category: progress.exercises?.category,
          sessions: []
        };
      }
      acc[exerciseId].sessions.push(progress);
      return acc;
    }, {} as any) || {};
    
    const exerciseProgress = Object.values(exerciseGroups).map((group: any) => ({
      name: group.name,
      category: group.category,
      sessions_count: group.sessions.length,
      avg_sets: group.sessions.reduce((sum: number, s: any) => sum + (s.sets_completed || 0), 0) / group.sessions.length,
      avg_reps: group.sessions.reduce((sum: number, s: any) => sum + (s.repetitions_completed || 0), 0) / group.sessions.length,
      avg_duration: group.sessions.reduce((sum: number, s: any) => sum + (s.duration_completed || 0), 0) / group.sessions.length,
      avg_pain: group.sessions.filter((s: any) => s.pain_level !== null).length > 0 ?
        group.sessions.filter((s: any) => s.pain_level !== null).reduce((sum: number, s: any) => sum + s.pain_level, 0) / 
        group.sessions.filter((s: any) => s.pain_level !== null).length : null,
      avg_difficulty: group.sessions.filter((s: any) => s.difficulty_rating !== null).length > 0 ?
        group.sessions.filter((s: any) => s.difficulty_rating !== null).reduce((sum: number, s: any) => sum + s.difficulty_rating, 0) / 
        group.sessions.filter((s: any) => s.difficulty_rating !== null).length : null
    })).sort((a, b) => b.sessions_count - a.sessions_count);
    
    // Progresso diário
    const dailyGroups = progressData?.reduce((acc, progress) => {
      const date = new Date(progress.completed_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(progress);
      return acc;
    }, {} as any) || {};
    
    const dailyProgress = Object.entries(dailyGroups).map(([date, sessions]: [string, any[]]) => ({
      date,
      sessions_count: sessions.length,
      avg_pain: sessions.filter(s => s.pain_level !== null).length > 0 ?
        sessions.filter(s => s.pain_level !== null).reduce((sum, s) => sum + s.pain_level, 0) / 
        sessions.filter(s => s.pain_level !== null).length : null,
      avg_difficulty: sessions.filter(s => s.difficulty_rating !== null).length > 0 ?
        sessions.filter(s => s.difficulty_rating !== null).reduce((sum, s) => sum + s.difficulty_rating, 0) / 
        sessions.filter(s => s.difficulty_rating !== null).length : null
    })).sort((a, b) => b.date.localeCompare(a.date));
    
    res.json({
      period_days: parseInt(days as string),
      total_sessions: totalSessions,
      avg_pain_level: avgPainLevel,
      avg_difficulty_rating: avgDifficulty,
      exercise_progress: exerciseProgress,
      daily_progress: dailyProgress
    });
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;