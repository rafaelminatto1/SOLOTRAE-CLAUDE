import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { RealtimeConnectionStatus } from './components/Realtime/RealtimeConnectionStatus';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Exercises from './pages/Exercises';
import PatientPortal from './pages/PatientPortal';
import AIAssistant from './pages/AIAssistant';
import Financial from './pages/Financial';
import Partnerships from './pages/Partnerships';
import BodyMap from './pages/BodyMap';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Mobile from './pages/Mobile';
import Demo from './pages/Demo';
import ProjectPresentation from './pages/ProjectPresentation';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
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
              <Route path="/demo" element={<Demo />} />
              <Route path="/presentation" element={<ProjectPresentation />} />
              
              {/* Rotas protegidas com layout */}
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Rotas para todos os usuários autenticados */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Rotas específicas por papel */}
                <Route path="patients" element={<StaffRoute><Patients /></StaffRoute>} />
                <Route path="appointments" element={<StaffRoute><Appointments /></StaffRoute>} />
                <Route path="exercises" element={<FisioterapeutaRoute><Exercises /></FisioterapeutaRoute>} />
                <Route path="ai" element={<FisioterapeutaRoute><AIAssistant /></FisioterapeutaRoute>} />
                <Route path="financial" element={<StaffRoute><Financial /></StaffRoute>} />
                <Route path="partnerships" element={<AdminRoute><Partnerships /></AdminRoute>} />
                <Route path="bodymap" element={<StaffRoute><BodyMap /></StaffRoute>} />
                <Route path="reports" element={<AdminRoute><Reports /></AdminRoute>} />
                <Route path="notifications" element={<AdminRoute><Notifications /></AdminRoute>} />
                <Route path="mobile" element={<AdminRoute><Mobile /></AdminRoute>} />
                <Route path="users" element={<AdminRoute><div className="p-6"><h1 className="text-2xl font-bold">Gestão de Usuários</h1><p className="text-gray-600 mt-2">Página em desenvolvimento...</p></div></AdminRoute>} />
                
                {/* Portal do Paciente */}
                <Route path="portal" element={<PacienteRoute><PatientPortal /></PacienteRoute>} />
                
                {/* Portal do Parceiro */}
                <Route path="partner" element={<ParceiroRoute><div className="p-6"><h1 className="text-2xl font-bold">Portal do Parceiro</h1><p className="text-gray-600 mt-2">Página em desenvolvimento...</p></div></ParceiroRoute>} />
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
