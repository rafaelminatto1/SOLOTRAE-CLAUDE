import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  CheckCircle,
  Brain,
  Trash2,
  LoaderCircle,
  DollarSign,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { AnimatedContainer } from '../components/ui/AnimatedContainer';
import AIAssistantPanel from "../components/AI/AIAssistantPanel";
import { useAuth } from '../contexts/AuthContext';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import { supabase } from '../lib/supabase';
import type { UserRole } from '@shared/types';

interface DashboardStats {
  patients: {
    total: number;
    new_this_month: number;
    active: number;
  };
  appointments: {
    today: number;
    this_week: number;
    pending: number;
    completed: number;
  };
  revenue: {
    this_month: number;
    last_month: number;
    growth_percentage: number;
  };
  exercises: {
    total: number;
    completed_today: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'exercise' | 'payment';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

interface UpcomingAppointment {
  id: string;
  patient_name: string;
  time: string;
  type: string;
  status: string;
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleClearData = async () => {
    if (!window.confirm('Você tem certeza que deseja apagar TODOS os dados de exemplo? Esta ação não pode ser desfeita e irá recarregar a página.')) {
      return;
    }

    setIsClearing(true);
    setClearMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não encontrada. Por favor, faça login novamente.');
      }

      const response = await fetch('/api/admin/clear-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao apagar os dados.');
      }

      setClearMessage({ type: 'success', text: 'Dados apagados com sucesso! A página será recarregada.' });
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      setClearMessage({ type: 'error', text: error.message || 'Ocorreu um erro desconhecido.' });
    } finally {
      setIsClearing(false);
    }
  };
  
  const getRoleSpecificStats = () => {
    if (hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.SECRETARY])) {
      return [
        {
          name: 'Total de Pacientes',
          value: stats?.patients.total || 0,
          change: `+${stats?.patients.new_this_month || 0} este mês`,
          icon: Users,
          color: 'bg-blue-500',
        },
        {
          name: 'Consultas Hoje',
          value: stats?.appointments.today || 0,
          change: `${stats?.appointments.this_week || 0} esta semana`,
          icon: Calendar,
          color: 'bg-green-500',
        },
        {
          name: 'Receita Mensal',
          value: `R$ ${(stats?.revenue.this_month || 0).toLocaleString()}`,
          change: `${stats?.revenue.growth_percentage || 0}% vs mês anterior`,
          icon: DollarSign,
          color: 'bg-yellow-500',
        },
        {
          name: 'Consultas Pendentes',
          value: stats?.appointments.pending || 0,
          change: 'Aguardando confirmação',
          icon: Clock,
          color: 'bg-orange-500',
        },
      ];
    } else if (hasRole([UserRole.PATIENT])) {
      return [
        {
          name: 'Próxima Consulta',
          value: upcomingAppointments.length > 0 ? '1' : '0',
          change: upcomingAppointments.length > 0 ? upcomingAppointments[0].time : 'Nenhuma agendada',
          icon: Calendar,
          color: 'bg-blue-500',
        },
        {
          name: 'Exercícios Hoje',
          value: stats?.exercises.completed_today || 0,
          change: `de ${stats?.exercises.total || 0} prescritos`,
          icon: Activity,
          color: 'bg-green-500',
        },
        {
          name: 'Progresso',
          value: '85%',
          change: 'Do plano de tratamento',
          icon: TrendingUp,
          color: 'bg-purple-500',
        },
        {
          name: 'Saúde Geral',
          value: 'Boa',
          change: 'Baseado nos últimos dados',
          icon: Heart,
          color: 'bg-red-500',
        },
      ];
    } else {
      return [];
    }
  };

  const statsCards = getRoleSpecificStats();
  const { triggerStagger, isItemVisible } = useStaggerAnimation(statsCards.length, 150);
  
  const [activityLoading, setActivityLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Trigger stagger animation after data loads
    setTimeout(() => triggerStagger(), 500);
  }, [triggerStagger]);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas dos pacientes
      const { data: patients } = await supabase
        .from('patients')
        .select('id, created_at') as { data: Array<{id: string, created_at: string}> | null };
      
      // Carregar agendamentos
      setAppointmentsLoading(true);
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, patient_id, scheduled_for, status, type, patients(full_name)')
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(10) as { data: Array<{
          id: string,
          patient_id: string,
          scheduled_for: string,
          status: string,
          type: string,
          patients: {full_name: string} | null
        }> | null };
      
      if (appointments) {
        const formattedAppointments = appointments.map(apt => ({
          id: apt.id,
          patient_name: apt.patients?.full_name || 'Paciente',
          time: new Date(apt.scheduled_for).toLocaleString('pt-BR'),
          type: apt.type || 'Consulta',
          status: apt.status || 'pending'
        }));
        setUpcomingAppointments(formattedAppointments);
      }
      setAppointmentsLoading(false);
      
      // Simular dados de estatísticas (pode ser expandido com consultas reais)
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const mockStats: DashboardStats = {
        patients: {
          total: patients?.length || 0,
          new_this_month: patients?.filter(p => new Date(p.created_at) >= thisMonth).length || 0,
          active: patients?.length || 0
        },
        appointments: {
          today: appointments?.filter(a => 
            new Date(a.scheduled_for).toDateString() === today.toDateString()
          ).length || 0,
          this_week: appointments?.length || 0,
          pending: appointments?.filter(a => a.status === 'pending').length || 0,
          completed: 0
        },
        revenue: {
          this_month: 15000,
          last_month: 12000,
          growth_percentage: 25
        },
        exercises: {
          total: 10,
          completed_today: 3
        }
      };
      
      setStats(mockStats);
      
      // Simular atividades recentes
      setActivityLoading(true);
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Nova consulta agendada',
          description: 'Consulta de fisioterapia agendada',
          time: 'Há 2 horas',
          status: 'success'
        },
        {
          id: '2',
          type: 'patient',
          title: 'Novo paciente cadastrado',
          description: 'Paciente adicionado ao sistema',
          time: 'Há 4 horas',
          status: 'success'
        }
      ];
      setRecentActivity(mockActivity);
      setActivityLoading(false);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setActivityLoading(false);
      setAppointmentsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'patient':
        return Users;
      case 'exercise':
        return Activity;
      case 'payment':
        return DollarSign;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedContainer animation="fade-in" delay={0}>
        <Card variant="elevated" padding="lg" gradient>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                {getGreeting()}, {user?.full_name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                {hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.SECRETARY]) 
                  ? 'Aqui está um resumo das atividades de hoje.'
                  : 'Acompanhe seu progresso e próximas atividades.'}
              </p>
            </div>
            {hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST]) && (
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors">IA Assistente Ativo</span>
              </div>
            )}
          </div>
        </Card>
      </AnimatedContainer>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedContainer
              key={index}
              animation="scale-in"
              delay={index * 100}
              className={`transition-all duration-300 ${
                isItemVisible(index) ? 'opacity-100 transform-none' : 'opacity-0 transform scale-95'
              }`}
            >
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        {hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.SECRETARY, UserRole.PATIENT]) && (
          <AnimatedContainer animation="slide-up" delay={200}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{hasRole([UserRole.PATIENT]) ? 'Minhas Próximas Consultas' : 'Próximos Agendamentos'}</span>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
            
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">{appointment.time}</p>
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {appointment.status === 'confirmed' ? 'Confirmado' :
                             appointment.status === 'pending' ? 'Pendente' : appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}

        {/* Atividades Recentes */}
        <AnimatedContainer animation="slide-up" delay={300}>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Atividades Recentes</span>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
          
              {activityLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 6).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'appointment' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          activity.type === 'patient' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                          activity.type === 'payment' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      {/* Quick Actions */}
      {hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.SECRETARY]) && (
        <AnimatedContainer animation="fade-in" delay={400}>
          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ações Rápidas</span>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/patients/new')}
                  className="flex flex-col items-center h-auto p-6 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800 group"
                >
                  <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Novo Paciente</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/appointments/new')}
                  className="flex flex-col items-center h-auto p-6 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 group"
                >
                  <Calendar className="h-8 w-8 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Agendar Consulta</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/reports')}
                  className="flex flex-col items-center h-auto p-6 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:border-purple-800 group"
                >
                  <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Relatórios</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="flex flex-col items-center h-auto p-6 bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-800 group"
                >
                  <Settings className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Configurações</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {/* Admin Tools */}
      {hasRole([UserRole.ADMIN]) && (
        <AnimatedContainer animation="fade-in" delay={500}>
          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-red-700 dark:text-red-400">
                <span>Ferramentas de Administrador</span>
                <Shield className="h-5 w-5 text-red-500 dark:text-red-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-start gap-4">
                    <p className="text-sm text-muted-foreground">
                      Esta seção contém ferramentas avançadas que devem ser usadas com cuidado.
                    </p>
                    
                    <Button
                      variant="destructive"
                      onClick={handleClearData}
                      disabled={isClearing}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Limpar Dados de Exemplo
                    </Button>
                    
                    {isClearing && (
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                        Limpando dados...
                      </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {/* AI Assistant Floating Panel */}
      {hasRole([UserRole.ADMIN, UserRole.PHYSIOTHERAPIST]) && (
        <AIAssistantPanel 
          context="dashboard"
          className="fixed bottom-6 right-6 z-50"
        />
      )}
    </div>
  );
}