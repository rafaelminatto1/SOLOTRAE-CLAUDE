import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../../pages/Dashboard';
import { AuthContext } from '../../../contexts/AuthContext';
import { RealtimeContext } from '../../../contexts/RealtimeContext';

// Mock dos contextos
const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@fisioflow.com',
    full_name: 'Usuário Teste',
    role: 'admin',
  },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
};

const mockRealtimeContext = {
  isConnected: true,
  connectionStatus: 'connected' as const,
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  sendMessage: jest.fn(),
};

// Componente wrapper para testes
const DashboardWrapper = () => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      <RealtimeContext.Provider value={mockRealtimeContext}>
        <Dashboard />
      </RealtimeContext.Provider>
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título do dashboard', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });

  it('deve exibir estatísticas do dashboard', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.getByText(/Pacientes/i)).toBeInTheDocument();
      expect(screen.getByText(/Consultas/i)).toBeInTheDocument();
    });
  });

  it('deve exibir informações do usuário logado', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      expect(screen.getByText(mockAuthContext.user.full_name)).toBeInTheDocument();
    });
  });

  it('deve mostrar o status da conexão em tempo real', async () => {
    render(<DashboardWrapper />);
    
    // Verifica se o componente de status de conexão está presente
    const connectionElement = document.querySelector('[data-testid*="connection"]');
    expect(connectionElement).toBeTruthy();
  });

  it('deve exibir cards de estatísticas', async () => {
    render(<DashboardWrapper />);
    
    await waitFor(() => {
      // Verifica se existem cards com estatísticas
      const statsCards = screen.getAllByRole('article');
      expect(statsCards.length).toBeGreaterThan(0);
    });
  });

  it('deve lidar com estado de carregamento', () => {
    const loadingAuthContext = {
      ...mockAuthContext,
      loading: true,
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingAuthContext}>
          <RealtimeContext.Provider value={mockRealtimeContext}>
            <Dashboard />
          </RealtimeContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Verifica se mostra algum indicador de carregamento
    expect(screen.queryByTestId('loading')).toBeTruthy();
  });

  it('deve responder a diferentes tipos de usuário', async () => {
    const fisioContext = {
      ...mockAuthContext,
      user: {
        ...mockAuthContext.user,
        role: 'fisioterapeuta',
      },
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={fisioContext}>
          <RealtimeContext.Provider value={mockRealtimeContext}>
            <Dashboard />
          </RealtimeContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      // Verifica se o dashboard se adapta ao tipo de usuário
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });
});