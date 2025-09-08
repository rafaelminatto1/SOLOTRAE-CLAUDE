import React, { useState } from 'react';
import { Home, Calendar, Users, Stethoscope, CreditCard, Bell, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatedContainer } from '@/components/ui/AnimatedContainer';

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  roles?: string[];
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    href: '/dashboard'
  },
  {
    icon: Calendar,
    label: 'Agendamentos',
    href: '/appointments',
    roles: ['admin', 'fisioterapeuta', 'secretaria'],
    badge: 3
  },
  {
    icon: Users,
    label: 'Pacientes',
    href: '/patients',
    roles: ['admin', 'fisioterapeuta', 'secretaria']
  },
  {
    icon: Stethoscope,
    label: 'Exercícios',
    href: '/exercises',
    roles: ['admin', 'fisioterapeuta']
  },
  {
    icon: CreditCard,
    label: 'Financeiro',
    href: '/financial',
    roles: ['admin', 'secretaria']
  },
  {
    icon: Bell,
    label: 'Notificações',
    href: '/notifications',
    roles: ['admin'],
    badge: 12
  }
];

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileNavigation({ isOpen, onToggle }: MobileNavigationProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleNavigation = (href: string) => {
    navigate(href);
    onToggle(); // Close menu after navigation
  };

  const handleLogout = async () => {
    await logout();
    onToggle();
  };

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const hasPermission = (roles?: string[]) => {
    if (!roles || !user?.role) return true;
    return roles.includes(user.role);
  };

  const filteredItems = navigationItems.filter(item => hasPermission(item.roles));

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white dark:bg-dark-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AnimatedContainer className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">FisioFlow</span>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-dark-400" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.first_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-dark-400 capitalize">
                  {user?.role}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-2 px-4">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.has(item.label);

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleExpanded(item.label);
                        } else {
                          handleNavigation(item.href);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      <div className="relative">
                        <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                        {item.badge && item.badge > 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {item.badge > 99 ? '99+' : item.badge}
                          </div>
                        )}
                      </div>
                      
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      
                      {item.badge && item.badge > 0 && !hasChildren && (
                        <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </div>
                      )}
                      
                      {hasChildren && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} />
                      )}
                    </button>

                    {/* Submenu */}
                    {hasChildren && isExpanded && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.children!.filter(child => hasPermission(child.roles)).map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.href);

                          return (
                            <button
                              key={child.label}
                              onClick={() => handleNavigation(child.href)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                childActive
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                              }`}
                            >
                              <ChildIcon className="w-4 h-4" />
                              <span className="text-sm">{child.label}</span>
                              {child.badge && child.badge > 0 && (
                                <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ml-auto">
                                  {child.badge > 99 ? '99+' : child.badge}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-dark-600 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </AnimatedContainer>
      </div>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
      aria-label="Abrir menu"
    >
      <Menu className="w-6 h-6 text-gray-600 dark:text-dark-400" />
    </button>
  );
}