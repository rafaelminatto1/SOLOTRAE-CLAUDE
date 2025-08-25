import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Verificar se o usuário tem as roles necessárias
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Seu perfil:</strong> {user?.role}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Perfis necessários:</strong> {requiredRoles.join(', ')}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Renderizar o componente se todas as verificações passaram
  return <>{children}</>;
}

// Componente para verificar apenas autenticação (sem roles)
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

// Componentes específicos para cada role
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}

export function PhysiotherapistRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.PHYSIOTHERAPIST]}>
      {children}
    </ProtectedRoute>
  );
}

export function SecretaryRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SECRETARY]}>
      {children}
    </ProtectedRoute>
  );
}

export function PatientRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.PATIENT]}>
      {children}
    </ProtectedRoute>
  );
}

// Componente para rotas que requerem múltiplas roles
export function StaffRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.PHYSIOTHERAPIST, UserRole.SECRETARY]}>
      {children}
    </ProtectedRoute>
  );
}

// Componente para parceiros
export function PartnerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={[UserRole.PARTNER]}>
      {children}
    </ProtectedRoute>
  );
}

// Aliases para compatibilidade (deprecated - usar os novos nomes)
export const FisioterapeutaRoute = PhysiotherapistRoute;
export const SecretariaRoute = SecretaryRoute;
export const PacienteRoute = PatientRoute;
export const ParceiroRoute = PartnerRoute;