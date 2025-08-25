import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RealtimeNotificationBell } from '../Notifications/RealtimeNotificationBell';
import { ThemeToggle } from '../ui/ThemeToggle';
import Button from '../ui/button';
import Input from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Shield,
} from 'lucide-react';
import type { UserRole } from '@shared/types';

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      ADMIN: 'Administrador',
      FISIOTERAPEUTA: 'Fisioterapeuta',
      SECRETARIA: 'Secretária',
      PACIENTE: 'Paciente',
      PARCEIRO: 'Parceiro',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      FISIOTERAPEUTA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      SECRETARIA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PACIENTE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      PARCEIRO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };



  return (
    <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Menu mobile e busca */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Busca */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar pacientes, consultas..."
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md leading-5 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          {/* Theme Toggle, Notificações e menu do usuário */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />
            {/* Notificações */}
            <RealtimeNotificationBell />

            {/* Menu do usuário */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center transition-colors duration-200">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.full_name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          getRoleBadgeColor(user?.role || '')
                        }`}
                      >
                        {getRoleDisplayName(user?.role || '')}
                      </span>
                      {user?.two_factor_enabled && (
                        <Shield className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                </div>
              </button>

              {/* Dropdown do usuário */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-dark-600 z-50 transition-colors duration-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Configurações
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-dark-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;