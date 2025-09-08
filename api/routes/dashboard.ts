import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { database } from '../database/index.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Buscar estatísticas de pacientes
    const db = database.getDb();
    const patients = db.patients.filter((p: any) => p.created_by === userId);
    
    // Buscar estatísticas de agendamentos
    const appointments = db.appointments.filter((a: any) => a.physiotherapist_id === userId);
    
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const stats = {
      patients: {
        total: patients?.length || 0,
        new_this_month: patients?.filter(p => 
          new Date(p.created_at) >= thisMonthStart
        ).length || 0,
        active: patients?.filter(p => p.status === 'active').length || 0
      },
      appointments: {
        today: appointments?.filter(a => 
          a.date === today
        ).length || 0,
        this_week: appointments?.filter(a => 
          new Date(a.date) >= thisWeekStart
        ).length || 0,
        pending: appointments?.filter(a => a.status === 'pending').length || 0,
        completed: appointments?.filter(a => a.status === 'completed').length || 0
      },
      revenue: {
        this_month: 0, // Implementar quando houver tabela de pagamentos
        last_month: 0,
        growth: 0
      }
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/dashboard/activity
router.get('/activity', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Buscar atividades recentes (últimos agendamentos e pacientes)
    const db = database.getDb();
    const recentAppointments = db.appointments
      .filter((a: any) => a.physiotherapist_id === userId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((apt: any) => {
        const patient = db.patients.find((p: any) => p.id === apt.patient_id);
        return {
          ...apt,
          patients: {
            first_name: patient?.first_name || 'N/A',
            last_name: patient?.last_name || ''
          }
        };
      });
    
    const recentPatients = db.patients
      .filter((p: any) => p.created_by === userId)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
    
    const activities = [
      ...(recentAppointments?.map(apt => ({
        id: apt.id,
        type: 'appointment' as const,
        title: `Agendamento com ${apt.patients.first_name} ${apt.patients.last_name}`,
        description: `${apt.date} às ${apt.time}`,
        time: apt.created_at,
        status: apt.status === 'completed' ? 'success' as const : 
                apt.status === 'pending' ? 'warning' as const : 'error' as const
      })) || []),
      ...(recentPatients?.map(patient => ({
        id: patient.id,
        type: 'patient' as const,
        title: `Novo paciente: ${patient.first_name} ${patient.last_name}`,
        description: 'Cadastro realizado',
        time: patient.created_at,
        status: 'success' as const
      })) || [])
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/dashboard/appointments
router.get('/appointments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Buscar próximos agendamentos
    const today = new Date().toISOString().split('T')[0];
    const db = database.getDb();
    const upcomingAppointments = db.appointments
      .filter((a: any) => a.physiotherapist_id === userId && a.date >= today)
      .sort((a: any, b: any) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      })
      .slice(0, 5)
      .map((apt: any) => {
        const patient = db.patients.find((p: any) => p.id === apt.patient_id);
        return {
          ...apt,
          patients: {
            first_name: patient?.first_name || 'N/A',
            last_name: patient?.last_name || ''
          }
        };
      });
    
    const appointments = upcomingAppointments.map((apt: any) => ({
      id: apt.id,
      patient_name: `${apt.patients.first_name} ${apt.patients.last_name}`,
      time: apt.time,
      type: apt.type,
      status: apt.status
    }));
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching dashboard appointments:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;