/**
 * Rotas para gerenciamento de planos de tratamento
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requirePhysiotherapist } from '../middleware/auth.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/treatment-plans - Listar planos de tratamento
router.get('/', async (req: Request, res: Response) => {
  try {
    const { patient_id, physiotherapist_id, status } = req.query;
    
    let query = supabaseAdmin
      .from('treatment_plans')
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
      .order('created_at', { ascending: false });
    
    // Filtros baseados no papel do usuário
    if (req.user?.role === 'patient') {
      // Pacientes só veem seus próprios planos
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (patient) {
        query = query.eq('patient_id', patient.id);
      }
    } else if (req.user?.role === 'physiotherapist') {
      // Fisioterapeutas só veem seus próprios planos
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
    
    const { data: treatmentPlans, error } = await query;
    
    if (error) {
      console.error('Error fetching treatment plans:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Formatar resposta para manter compatibilidade
    const formattedPlans = treatmentPlans.map((plan: any) => ({
      ...plan,
      patient_name: plan.patients.users.full_name,
      patient_email: plan.patients.users.email,
      physiotherapist_name: plan.physiotherapists.users.full_name,
      physiotherapist_email: plan.physiotherapists.users.email
    }));
    
    res.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/treatment-plans/:id - Obter plano de tratamento específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: treatmentPlan, error } = await supabaseAdmin
      .from('treatment_plans')
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
    
    if (error || !treatmentPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Verificar permissões
    if (req.user?.role === 'patient') {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!patient || treatmentPlan.patient_id !== patient.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (!physiotherapist || treatmentPlan.physiotherapist_id !== physiotherapist.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    // Buscar exercícios do plano
    const { data: exercises } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select(`
        *,
        exercises!inner(
          id,
          name,
          description,
          category,
          difficulty,
          duration,
          instructions,
          video_url,
          image_url
        )
      `)
      .eq('treatment_plan_id', id)
      .order('order_index');
    
    // Formatar exercícios para manter compatibilidade
    const formattedExercises = exercises?.map((tpe: any) => ({
      ...tpe,
      name: tpe.exercises.name,
      description: tpe.exercises.description,
      category: tpe.exercises.category,
      difficulty: tpe.exercises.difficulty,
      duration: tpe.exercises.duration,
      instructions: tpe.exercises.instructions,
      video_url: tpe.exercises.video_url,
      image_url: tpe.exercises.image_url
    })) || [];
    
    res.json({
      ...treatmentPlan,
      patient_name: treatmentPlan.patients.users.full_name,
      patient_email: treatmentPlan.patients.users.email,
      physiotherapist_name: treatmentPlan.physiotherapists.users.full_name,
      physiotherapist_email: treatmentPlan.physiotherapists.users.email,
      exercises: formattedExercises
    });
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/treatment-plans - Criar novo plano de tratamento (apenas fisioterapeutas e admin)
router.post('/', requirePhysiotherapist, async (req: Request, res: Response) => {
  try {
    const { patient_id, title, description, goals, start_date, end_date, exercises } = req.body;
    
    // Validação dos campos obrigatórios
    if (!patient_id || !title || !description || !start_date) {
      return res.status(400).json({ error: 'Missing required fields: patient_id, title, description, start_date' });
    }
    
    // Verificar se o paciente existe
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id')
      .eq('id', patient_id)
      .single();
    
    if (patientError || !patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Obter ID do fisioterapeuta
    let physiotherapist_id;
    if (req.user?.role === 'admin') {
      // Admin pode especificar qualquer fisioterapeuta
      physiotherapist_id = req.body.physiotherapist_id;
      if (!physiotherapist_id) {
        return res.status(400).json({ error: 'Admin must specify physiotherapist_id' });
      }
    } else {
      // Fisioterapeuta cria para si mesmo
      const { data: physiotherapist, error: physioError } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      if (physioError || !physiotherapist) {
        return res.status(403).json({ error: 'Physiotherapist profile not found' });
      }
      physiotherapist_id = physiotherapist.id;
    }
    
    // Criar plano de tratamento
    const { data: newPlan, error: createError } = await supabaseAdmin
      .from('treatment_plans')
      .insert({
        patient_id,
        physiotherapist_id,
        title,
        description,
        goals: goals || '',
        start_date,
        end_date: end_date || null,
        status: 'active'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating treatment plan:', createError);
      return res.status(500).json({ error: 'Failed to create treatment plan' });
    }
    
    const treatmentPlanId = newPlan.id;
    
    // Adicionar exercícios se fornecidos
    if (exercises && Array.isArray(exercises)) {
      const exerciseInserts = exercises.map((exercise, i) => ({
        treatment_plan_id: treatmentPlanId,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets || 1,
        repetitions: exercise.repetitions || 1,
        duration: exercise.duration || 0,
        notes: exercise.notes || '',
        order_index: i + 1
      }));
      
      await supabaseAdmin
        .from('treatment_plan_exercises')
        .insert(exerciseInserts);
    }
    
    // Buscar plano criado com exercícios
    const { data: newTreatmentPlan } = await supabaseAdmin
      .from('treatment_plans')
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
      .eq('id', treatmentPlanId)
      .single();
    
    const { data: planExercises } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select(`
        *,
        exercises!inner(
          id,
          name,
          description,
          category,
          difficulty,
          duration,
          instructions,
          video_url,
          image_url
        )
      `)
      .eq('treatment_plan_id', treatmentPlanId)
      .order('order_index');
    
    // Formatar exercícios para manter compatibilidade
    const formattedExercises = planExercises?.map((tpe: any) => ({
      ...tpe,
      name: tpe.exercises.name,
      description: tpe.exercises.description,
      category: tpe.exercises.category,
      difficulty: tpe.exercises.difficulty,
      duration: tpe.exercises.duration,
      instructions: tpe.exercises.instructions,
      video_url: tpe.exercises.video_url,
      image_url: tpe.exercises.image_url
    })) || [];
    
    res.status(201).json({
      ...newTreatmentPlan,
      patient_name: newTreatmentPlan?.patients.users.full_name,
      patient_email: newTreatmentPlan?.patients.users.email,
      physiotherapist_name: newTreatmentPlan?.physiotherapists.users.full_name,
      physiotherapist_email: newTreatmentPlan?.physiotherapists.users.email,
      exercises: formattedExercises
    });
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/treatment-plans/:id - Atualizar plano de tratamento
router.put('/:id', requirePhysiotherapist, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, goals, start_date, end_date, status } = req.body;
    
    // Verificar se o plano existe
    const { data: existingPlan, error: planError } = await supabaseAdmin
      .from('treatment_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (planError || !existingPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Verificar permissões
    let canUpdate = req.user?.role === 'admin';
    
    if (!canUpdate && req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      canUpdate = physiotherapist && existingPlan.physiotherapist_id === physiotherapist.id;
    }
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Preparar dados para atualização
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (goals !== undefined) updateData.goals = goals;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    
    // Atualizar plano
    const { error: updateError } = await supabaseAdmin
      .from('treatment_plans')
      .update(updateData)
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating treatment plan:', updateError);
      return res.status(500).json({ error: 'Failed to update treatment plan' });
    }
    
    // Buscar plano atualizado
    const { data: updatedPlan } = await supabaseAdmin
      .from('treatment_plans')
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
    
    const { data: planExercises } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select(`
        *,
        exercises!inner(
          id,
          name,
          description,
          category,
          difficulty,
          duration,
          instructions,
          video_url,
          image_url
        )
      `)
      .eq('treatment_plan_id', id)
      .order('order_index');
    
    // Formatar exercícios para manter compatibilidade
    const formattedExercises = planExercises?.map((tpe: any) => ({
      ...tpe,
      name: tpe.exercises.name,
      description: tpe.exercises.description,
      category: tpe.exercises.category,
      difficulty: tpe.exercises.difficulty,
      duration: tpe.exercises.duration,
      instructions: tpe.exercises.instructions,
      video_url: tpe.exercises.video_url,
      image_url: tpe.exercises.image_url
    })) || [];
    
    res.json({
      ...updatedPlan,
      patient_name: updatedPlan?.patients.users.full_name,
      patient_email: updatedPlan?.patients.users.email,
      physiotherapist_name: updatedPlan?.physiotherapists.users.full_name,
      physiotherapist_email: updatedPlan?.physiotherapists.users.email,
      exercises: formattedExercises
    });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/treatment-plans/:id - Deletar plano de tratamento
router.delete('/:id', requirePhysiotherapist, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o plano existe
    const { data: existingPlan, error: planError } = await supabaseAdmin
      .from('treatment_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (planError || !existingPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Verificar permissões
    let canDelete = req.user?.role === 'admin';
    
    if (!canDelete && req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      canDelete = physiotherapist && existingPlan.physiotherapist_id === physiotherapist.id;
    }
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Deletar exercícios do plano primeiro
    const { error: exercisesError } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .delete()
      .eq('treatment_plan_id', id);
    
    if (exercisesError) {
      console.error('Error deleting treatment plan exercises:', exercisesError);
      return res.status(500).json({ error: 'Failed to delete treatment plan exercises' });
    }
    
    // Deletar plano
    const { error: deleteError } = await supabaseAdmin
      .from('treatment_plans')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting treatment plan:', deleteError);
      return res.status(500).json({ error: 'Failed to delete treatment plan' });
    }
    
    res.json({ message: 'Treatment plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/treatment-plans/:id/exercises - Adicionar exercício ao plano
router.post('/:id/exercises', requirePhysiotherapist, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { exercise_id, sets, repetitions, duration, notes } = req.body;
    
    // Verificar se o plano existe
    const { data: existingPlan, error: planError } = await supabaseAdmin
      .from('treatment_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (planError || !existingPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Verificar permissões
    let canModify = req.user?.role === 'admin';
    
    if (!canModify && req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      canModify = physiotherapist && existingPlan.physiotherapist_id === physiotherapist.id;
    }
    
    if (!canModify) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Verificar se o exercício existe
    const { data: exercise, error: exerciseError } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .eq('id', exercise_id)
      .single();
    
    if (exerciseError || !exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Obter próximo order_index
    const { data: lastOrderData } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select('order_index')
      .eq('treatment_plan_id', id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    const orderIndex = (lastOrderData?.order_index || 0) + 1;
    
    // Adicionar exercício
    const { data: newExercise, error: insertError } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .insert({
        treatment_plan_id: id,
        exercise_id,
        sets: sets || 1,
        repetitions: repetitions || 1,
        duration: duration || 0,
        notes: notes || '',
        order_index: orderIndex
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error adding exercise to treatment plan:', insertError);
      return res.status(500).json({ error: 'Failed to add exercise to treatment plan' });
    }
    
    // Buscar exercício adicionado com detalhes
    const { data: addedExercise } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select(`
        *,
        exercises!inner(
          id,
          name,
          description,
          category,
          difficulty,
          duration,
          instructions,
          video_url,
          image_url
        )
      `)
      .eq('id', newExercise.id)
      .single();
    
    // Formatar exercício para manter compatibilidade
    const formattedExercise = {
      ...addedExercise,
      name: addedExercise?.exercises.name,
      description: addedExercise?.exercises.description,
      category: addedExercise?.exercises.category,
      difficulty: addedExercise?.exercises.difficulty,
      duration: addedExercise?.exercises.duration,
      instructions: addedExercise?.exercises.instructions,
      video_url: addedExercise?.exercises.video_url,
      image_url: addedExercise?.exercises.image_url
    };
    
    res.status(201).json(formattedExercise);
  } catch (error) {
    console.error('Error adding exercise to treatment plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/treatment-plans/:id/exercises/:exerciseId - Remover exercício do plano
router.delete('/:id/exercises/:exerciseId', requirePhysiotherapist, async (req: Request, res: Response) => {
  try {
    const { id, exerciseId } = req.params;
    
    // Verificar se o plano existe
    const { data: existingPlan, error: planError } = await supabaseAdmin
      .from('treatment_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (planError || !existingPlan) {
      return res.status(404).json({ error: 'Treatment plan not found' });
    }
    
    // Verificar permissões
    let canModify = req.user?.role === 'admin';
    
    if (!canModify && req.user?.role === 'physiotherapist') {
      const { data: physiotherapist } = await supabaseAdmin
        .from('physiotherapists')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      
      canModify = physiotherapist && existingPlan.physiotherapist_id === physiotherapist.id;
    }
    
    if (!canModify) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    // Verificar se o exercício está no plano
    const { data: planExercise, error: exerciseError } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select('*')
      .eq('treatment_plan_id', id)
      .eq('id', exerciseId)
      .single();
    
    if (exerciseError || !planExercise) {
      return res.status(404).json({ error: 'Exercise not found in treatment plan' });
    }
    
    // Remover exercício
    const { error: deleteError } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .delete()
      .eq('id', exerciseId);
    
    if (deleteError) {
      console.error('Error removing exercise from treatment plan:', deleteError);
      return res.status(500).json({ error: 'Failed to remove exercise from treatment plan' });
    }
    
    res.json({ message: 'Exercise removed from treatment plan successfully' });
  } catch (error) {
    console.error('Error removing exercise from treatment plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;