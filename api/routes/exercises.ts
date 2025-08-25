/**
 * Rotas para gerenciamento de exercícios
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requirePhysiotherapist } from '../middleware/auth.js';
import { validateRequest, validateParams, commonSchemas } from '../middleware/validation.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/exercises - Listar exercícios
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let query = supabaseAdmin
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data: exercises, error } = await query;
    
    if (error) {
      console.error('Error fetching exercises:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/:id - Obter exercício específico
router.get('/:id', validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: exercise, error } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/exercises - Criar novo exercício (apenas fisioterapeutas e admin)
router.post('/', requirePhysiotherapist, validateRequest(commonSchemas.exercise), async (req: Request, res: Response) => {
  try {
    const { name, description, category, difficulty, duration, instructions, video_url, image_url } = (req as any).validatedData;
    
    // Validação dos campos obrigatórios
    if (!name || !description || !category || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields: name, description, category, difficulty' });
    }
    
    // Verificar se já existe um exercício com o mesmo nome
    const { data: existingExercise } = await supabaseAdmin
      .from('exercises')
      .select('id')
      .eq('name', name)
      .single();
    
    if (existingExercise) {
      return res.status(409).json({ error: 'Exercise with this name already exists' });
    }
    
    // Criar exercício
    const { data: newExercise, error } = await supabaseAdmin
      .from('exercises')
      .insert({
        name,
        description,
        category,
        difficulty,
        duration: duration || 0,
        instructions: instructions || '',
        video_url: video_url || '',
        image_url: image_url || ''
      })
      .select()
      .single();
    
    if (error || !newExercise) {
      console.error('Error creating exercise:', error);
      return res.status(500).json({ error: 'Failed to create exercise' });
    }
    
    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/exercises/:id - Atualizar exercício (apenas fisioterapeutas e admin)
router.put('/:id', requirePhysiotherapist, validateParams(commonSchemas.id), validateRequest({
  name: { type: 'string', minLength: 2, maxLength: 200, required: false },
  description: { type: 'string', minLength: 10, maxLength: 2000, required: false },
  category: { type: 'string', choices: ['strength', 'flexibility', 'balance', 'cardio', 'rehabilitation', 'mobility'], required: false },
  difficulty: { type: 'string', choices: ['beginner', 'intermediate', 'advanced'], required: false },
  duration: { type: 'number', min: 0, max: 3600, required: false },
  instructions: { type: 'string', maxLength: 5000, required: false },
  video_url: { type: 'string', pattern: /^https?:\/\/.+/, required: false },
  image_url: { type: 'string', pattern: /^https?:\/\/.+/, required: false }
}), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, difficulty, duration, instructions, video_url, image_url } = (req as any).validatedData;
    
    // Verificar se o exercício existe
    const { data: existingExercise, error: fetchError } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingExercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Verificar se já existe outro exercício com o mesmo nome
    if (name && name !== existingExercise.name) {
      const { data: duplicateExercise } = await supabaseAdmin
        .from('exercises')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single();
      
      if (duplicateExercise) {
        return res.status(409).json({ error: 'Exercise with this name already exists' });
      }
    }
    
    // Preparar dados para atualização
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (duration !== undefined) updateData.duration = duration;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (image_url !== undefined) updateData.image_url = image_url;
    updateData.updated_at = new Date().toISOString();
    
    // Atualizar exercício
    const { data: updatedExercise, error: updateError } = await supabaseAdmin
      .from('exercises')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError || !updatedExercise) {
      console.error('Error updating exercise:', updateError);
      return res.status(500).json({ error: 'Failed to update exercise' });
    }
    
    res.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/exercises/:id - Deletar exercício (apenas fisioterapeutas e admin)
router.delete('/:id', requirePhysiotherapist, validateParams(commonSchemas.id), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o exercício existe
    const { data: existingExercise, error: fetchError } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingExercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Verificar se o exercício está sendo usado em planos de tratamento
    const { count, error: countError } = await supabaseAdmin
      .from('treatment_plan_exercises')
      .select('*', { count: 'exact', head: true })
      .eq('exercise_id', id);
    
    if (countError) {
      console.error('Error checking exercise usage:', countError);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (count && count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete exercise that is being used in treatment plans' 
      });
    }
    
    // Deletar exercício
    const { error: deleteError } = await supabaseAdmin
      .from('exercises')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting exercise:', deleteError);
      return res.status(500).json({ error: 'Failed to delete exercise' });
    }
    
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/meta/categories - Obter categorias de exercícios
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('exercises')
      .select('category')
      .order('category', { ascending: true });
    
    if (error) {
      console.error('Error fetching exercise categories:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Agrupar e contar categorias
    const categoryCount = categories.reduce((acc: any, exercise: any) => {
      const category = exercise.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    const result = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching exercise categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/meta/difficulties - Obter níveis de dificuldade
router.get('/meta/difficulties', async (req: Request, res: Response) => {
  try {
    const { data: exercises, error } = await supabaseAdmin
      .from('exercises')
      .select('difficulty');
    
    if (error) {
      console.error('Error fetching exercise difficulties:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Agrupar e contar dificuldades
    const difficultyCount = exercises.reduce((acc: any, exercise: any) => {
      const difficulty = exercise.difficulty;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {});
    
    // Ordenar por ordem de dificuldade
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const result = difficultyOrder
      .filter(difficulty => difficultyCount[difficulty])
      .map(difficulty => ({
        difficulty,
        count: difficultyCount[difficulty]
      }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching exercise difficulties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;