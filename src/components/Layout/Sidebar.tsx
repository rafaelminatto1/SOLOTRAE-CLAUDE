import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@shared/types';
import {
  Home,
  Users,
  Calendar,
  Activity,
  FileText,
  Settings,
  Shield,
  Heart,
  BarChart3,
  Handshake,
  Brain,
  X,
  User,
  Clock,
  Stethoscope,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA', 'PACIENTE', 'PARCEIRO'],
  },
  {
    name: 'Pacientes',
    href: '/patients',
    icon: Users,
    roles: ['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA'],
  },
  {
    name: 'Agendamentos',
    href: '/appointments',
    icon: Calendar,
    roles: ['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA'],
  },
  {
    name: 'Minhas Consultas',
    href: '/my-appointments',
    icon: Clock,
    roles: ['PACIENTE'],
  },
  {
    name: 'Exercícios',
    href: '/exercises',
    icon: Activity,
    roles: ['ADMIN', 'FISIOTERAPEUTA', 'PACIENTE'],
  },
  {
    name: 'Meu Plano',
    href: '/my-plan',
    icon: Heart,
    roles: ['PACIENTE'],
  },
  {
    name: 'IA Assistente',
    href: '/ai-assistant',
    icon: Brain,
    roles: ['ADMIN', 'FISIOTERAPEUTA'],
    badge: 'Pro',
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'FISIOTERAPEUTA'],
  },
  {
    name: 'Parcerias',
    href: '/partnerships',
    icon: Handshake,
    roles: ['ADMIN', 'PARCEIRO'],
  },
  {
    name: 'Meus Vouchers',
    href: '/my-vouchers',
    icon: FileText,
    roles: ['PARCEIRO'],
  },
  {
    name: 'Usuários',
    href: '/users',
    icon: Shield,
    roles: ['ADMIN'],
  },
  {
    name: 'Perfil',
    href: '/profile',
    icon: User,
    roles: ['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA', 'PACIENTE', 'PARCEIRO'],
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN', 'FISIOTERAPEUTA', 'SECRETARIA'],
  },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  // Filtrar navegação baseada no role do usuário
  const filteredNavigation = navigation.filter(item => 
    hasRole(item.roles)
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-colors">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-dark-700 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center transition-colors">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors">FisioFlow</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 dark:text-dark-400 hover:text-gray-500 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors">
              {user?.full_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-400 truncate transition-colors">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                active
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                  : 'text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400 dark:text-dark-500 group-hover:text-gray-500 dark:group-hover:text-dark-300'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 transition-colors">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700 transition-colors">
        <div className="text-xs text-gray-500 dark:text-dark-400 text-center transition-colors">
          <p>FisioFlow v1.0</p>
          <p className="mt-1">Sistema de Gestão</p>
        </div>
      </div>
    </div>
  );
}