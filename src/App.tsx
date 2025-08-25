import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { RealtimeConnectionStatus } from './components/Realtime/RealtimeConnectionStatus';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute, {
  AdminRoute,
  FisioterapeutaRoute,
  SecretariaRoute,
  PacienteRoute,
  ParceiroRoute,
  StaffRoute,
} from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas protegidas com layout */}
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Rotas para todos os usuários autenticados */}
                <Route path="profile" element={<div>Perfil do Usuário</div>} />
                <Route path="settings" element={<div>Configurações</div>} />
                
                {/* Rotas específicas por papel */}
                <Route path="patients/*" element={<StaffRoute><div>Gestão de Pacientes</div></StaffRoute>} />
                <Route path="appointments/*" element={<StaffRoute><div>Sistema de Agendamento</div></StaffRoute>} />
                <Route path="exercises/*" element={<FisioterapeutaRoute><div>Biblioteca de Exercícios</div></FisioterapeutaRoute>} />
                <Route path="ai/*" element={<FisioterapeutaRoute><div>IA Assistente</div></FisioterapeutaRoute>} />
                <Route path="reports/*" element={<AdminRoute><div>Relatórios</div></AdminRoute>} />
                <Route path="partnerships/*" element={<AdminRoute><div>Parcerias</div></AdminRoute>} />
                <Route path="users/*" element={<AdminRoute><div>Gestão de Usuários</div></AdminRoute>} />
                
                {/* Portal do Paciente */}
                <Route path="portal/*" element={<PacienteRoute><div>Portal do Paciente</div></PacienteRoute>} />
                
                {/* Portal do Parceiro */}
                <Route path="partner/*" element={<ParceiroRoute><div>Portal do Parceiro</div></ParceiroRoute>} />
              </Route>
              
              {/* Rota de fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              duration={4000}
              theme="system"
            />
            
            {/* Realtime connection status */}
            <RealtimeConnectionStatus />
          </div>
          </Router>
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
