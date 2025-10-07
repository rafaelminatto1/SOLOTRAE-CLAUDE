import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../database/supabase';

const router = Router();

/**
 * GET /dashboard/stats
 * Retorna estatísticas gerais do dashboard
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Buscar contadores de cada tabela
    const [
      { count: patientsCount },
      { count: appointmentsCount },
      { count: physiotherapistsCount },
      { count: exercisesCount }
    ] = await Promise.all([
      supabaseAdmin.from('patients').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('physiotherapists').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('exercises').select('*', { count: 'exact', head: true })
    ]);

    // Buscar consultas do dia
    const todayDate = new Date();
    const today = todayDate.toISOString().split('T')[0];
    const { count: todayAppointments } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today);

    // Buscar consultas pendentes
    const { count: pendingAppointments } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled');

    // Buscar consultas concluídas do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    
    const { count: completedThisMonth } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('date', startOfMonthStr);

    // Buscar consultas da semana
    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - todayDate.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    const { count: thisWeekAppointments } = await supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('date', startOfWeekStr)
      .lte('date', today.toISOString().split('T')[0]);

    // Buscar pacientes novos deste mês
    const { count: newPatientsThisMonth } = await supabaseAdmin
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${startOfMonthStr}T00:00:00`);

    const stats = {
      patients: {
        total: patientsCount || 0,
        new_this_month: newPatientsThisMonth || 0,
        active: patientsCount || 0
      },
      appointments: {
        today: todayAppointments || 0,
        this_week: thisWeekAppointments || 0,
        pending: pendingAppointments || 0,
        completed: completedThisMonth || 0
      },
      revenue: {
        this_month: 0, // Pode ser implementado futuramente com dados de pagamento
        last_month: 0,
        growth_percentage: 0
      },
      exercises: {
        total: exercisesCount || 0,
        completed_today: 0 // Pode ser implementado com tabela de logs de exercícios
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /dashboard/activity
 * Retorna atividades recentes do sistema
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    // Por enquanto, retornar dados mock até que as tabelas estejam populadas
    const activities = [
      {
        id: 'activity-1',
        type: 'info',
        title: 'Sistema iniciado',
        description: 'O sistema FisioFlow está funcionando corretamente',
        timestamp: new Date().toISOString()
      },
      {
        id: 'activity-2',
        type: 'info',
        title: 'Dashboard ativo',
        description: 'Rotas de dashboard implementadas e funcionando',
        timestamp: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /dashboard/appointments
 * Retorna resumo de consultas para o dashboard
 */
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Consultas de hoje
    const todayStr = today.toISOString().split('T')[0];
    const { data: todayAppointments } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        time,
        status,
        type
      `)
      .eq('date', todayStr)
      .order('time', { ascending: true });

    // Consultas da semana
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];
    
    const { data: weekAppointments } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        time,
        status,
        type
      `)
      .gte('date', startOfWeekStr)
      .lte('date', endOfWeekStr)
      .order('date', { ascending: true });

    // Próximas consultas
    const { data: upcomingAppointments } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        date,
        time,
        status,
        type
      `)
      .gte('date', todayStr)
      .eq('status', 'scheduled')
      .order('date', { ascending: true })
      .limit(5);

    res.json({
      success: true,
      data: {
        today: todayAppointments || [],
        week: weekAppointments || [],
        upcoming: upcomingAppointments || []
      }
    });
  } catch (error) {
    console.error('Erro ao buscar consultas do dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
