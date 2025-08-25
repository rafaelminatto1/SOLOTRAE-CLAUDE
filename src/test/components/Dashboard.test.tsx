import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'
import Dashboard from '../../pages/Dashboard'

// Mock the useAuth hook
const mockUser = {
  id: '1',
  name: 'Dr. João Silva',
  email: 'joao@fisioflow.com',
  role: 'physiotherapist'
}

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    loading: false
  })
}))

// Mock API hooks
const mockStats = {
  totalPatients: 150,
  totalAppointments: 45,
  totalExercises: 120,
  monthlyRevenue: 15000
}

const mockRecentAppointments = [
  {
    id: '1',
    patientName: 'Maria Santos',
    time: '09:00',
    type: 'Consulta',
    status: 'Confirmado'
  },
  {
    id: '2',
    patientName: 'Pedro Oliveira',
    time: '10:30',
    type: 'Fisioterapia',
    status: 'Em andamento'
  }
]

vi.mock('../../hooks/useApi', () => ({
  useApi: (endpoint: string) => {
    if (endpoint.includes('/stats')) {
      return {
        data: mockStats,
        loading: false,
        error: null,
        refetch: vi.fn()
      }
    }
    if (endpoint.includes('/appointments/recent')) {
      return {
        data: mockRecentAppointments,
        loading: false,
        error: null,
        refetch: vi.fn()
      }
    }
    return {
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn()
    }
  }
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard with welcome message', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(`Bem-vindo, ${mockUser.name}!`)).toBeInTheDocument()
    expect(screen.getByText('Visão geral do seu consultório')).toBeInTheDocument()
  })

  it('displays statistics cards correctly', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Total de Pacientes')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    
    expect(screen.getByText('Agendamentos Hoje')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    
    expect(screen.getByText('Exercícios Cadastrados')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    
    expect(screen.getByText('Receita Mensal')).toBeInTheDocument()
    expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument()
  })

  it('displays recent appointments section', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Próximos Agendamentos')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('navigates to patients page when clicking patients card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    const patientsCard = screen.getByText('Total de Pacientes').closest('div')
    expect(patientsCard).toBeInTheDocument()
    
    if (patientsCard) {
      await user.click(patientsCard)
      expect(mockNavigate).toHaveBeenCalledWith('/patients')
    }
  })

  it('navigates to appointments page when clicking appointments card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    const appointmentsCard = screen.getByText('Agendamentos Hoje').closest('div')
    expect(appointmentsCard).toBeInTheDocument()
    
    if (appointmentsCard) {
      await user.click(appointmentsCard)
      expect(mockNavigate).toHaveBeenCalledWith('/appointments')
    }
  })

  it('navigates to exercises page when clicking exercises card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    const exercisesCard = screen.getByText('Exercícios Cadastrados').closest('div')
    expect(exercisesCard).toBeInTheDocument()
    
    if (exercisesCard) {
      await user.click(exercisesCard)
      expect(mockNavigate).toHaveBeenCalledWith('/exercises')
    }
  })

  it('shows loading state when data is loading', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })
    
    render(<Dashboard />)
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('shows error state when data fails to load', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch'),
      refetch: vi.fn()
    })
    
    render(<Dashboard />)
    
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
  })

  it('displays quick actions section', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Ações Rápidas')).toBeInTheDocument()
    expect(screen.getByText('Novo Agendamento')).toBeInTheDocument()
    expect(screen.getByText('Cadastrar Paciente')).toBeInTheDocument()
    expect(screen.getByText('Adicionar Exercício')).toBeInTheDocument()
  })

  it('navigates to new appointment when clicking quick action', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    
    const newAppointmentButton = screen.getByText('Novo Agendamento')
    await user.click(newAppointmentButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/appointments?new=true')
  })

  it('has proper accessibility attributes', () => {
    render(<Dashboard />)
    
    const statsCards = screen.getAllByRole('button')
    statsCards.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })
})