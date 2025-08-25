import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiGet } from '@/hooks/useApi';
import { Card } from '@/components/ui/Card';
import AnimatedContainer from '@/components/ui/AnimatedContainer';
import { useStaggerAnimation } from '@/hooks/useAnimation';
import {
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  DollarSign,
  Heart,
  Brain,
} from 'lucide-react';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  
  const getRoleSpecificStats = () => {
    if (hasRole(['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA'])) {
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
    } else if (hasRole(['PACIENTE'])) {
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
  
  const { execute: fetchStats } = useApiGet('/dashboard/stats');
  const { execute: fetchActivity, loading: activityLoading } = useApiGet('/dashboard/activity');
  const { execute: fetchAppointments, loading: appointmentsLoading } = useApiGet('/dashboard/appointments');

  useEffect(() => {
    loadDashboardData();
    // Trigger stagger animation after data loads
    setTimeout(() => triggerStagger(), 500);
  }, [triggerStagger]);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas
      const statsResult = await fetchStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Carregar atividades recentes
      const activityResult = await fetchActivity();
      if (activityResult.success) {
        setRecentActivity(activityResult.data);
      }

      // Carregar próximos agendamentos
      const appointmentsResult = await fetchAppointments();
      if (appointmentsResult.success) {
        setUpcomingAppointments(appointmentsResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
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
                {hasRole(['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA']) 
                  ? 'Aqui está um resumo das atividades de hoje.'
                  : 'Acompanhe seu progresso e próximas atividades.'}
              </p>
            </div>
            {hasRole(['ADMIN', 'FISIOTERAPEUTA']) && (
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
              <Card hover glow className="group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        {hasRole(['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA', 'PACIENTE']) && (
          <AnimatedContainer animation="slide-up" delay={200}>
            <Card variant="elevated" hover>
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                {hasRole(['PACIENTE']) ? 'Minhas Próximas Consultas' : 'Próximos Agendamentos'}
              </h3>
              <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors" />
            </div>
            
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 transition-colors"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 transition-colors"></div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white transition-colors">{appointment.patient?.first_name} {appointment.patient?.last_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">{appointment.appointment_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{appointment.start_time}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' :
                         appointment.status === 'pending' ? 'Pendente' : appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 transition-colors">Nenhum agendamento próximo</p>
              </div>
            )}
            </Card>
          </AnimatedContainer>
        )}

        {/* Atividades Recentes */}
        <AnimatedContainer animation="slide-up" delay={300}>
          <Card variant="elevated" hover>
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Atividades Recentes</h3>
            <Activity className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors" />
          </div>
          
          {activityLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 transition-colors"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 transition-colors"></div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`h-5 w-5 ${getStatusColor(activity.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">{activity.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors">{activity.created_at}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
              <p className="text-gray-500 dark:text-gray-400 transition-colors">Nenhuma atividade recente</p>
            </div>
          )}
          </Card>
        </AnimatedContainer>
      </div>

      {/* Quick Actions */}
      {hasRole(['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA']) && (
        <AnimatedContainer animation="fade-in" delay={400}>
          <Card variant="glass" hover>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-105 hover:shadow-md group">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 group-hover:animate-bounce-gentle transition-colors" />
              <span className="text-blue-600 dark:text-blue-400 font-medium transition-colors">Novo Paciente</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-105 hover:shadow-md group">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400 mr-2 group-hover:animate-bounce-gentle transition-colors" />
              <span className="text-green-600 dark:text-green-400 font-medium transition-colors">Agendar Consulta</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300 hover:scale-105 hover:shadow-md group">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2 group-hover:animate-bounce-gentle transition-colors" />
              <span className="text-purple-600 dark:text-purple-400 font-medium transition-colors">Prescrever Exercício</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-300 hover:scale-105 hover:shadow-md group">
              <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-2 group-hover:animate-bounce-gentle transition-colors" />
              <span className="text-orange-600 dark:text-orange-400 font-medium transition-colors">IA Assistente</span>
            </button>
            </div>
          </Card>
        </AnimatedContainer>
      )}
    </div>
  );
}