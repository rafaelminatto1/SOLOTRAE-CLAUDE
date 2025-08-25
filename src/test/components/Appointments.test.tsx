import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockAppointment, mockPatient } from '../utils'
import Appointments from '../../pages/Appointments'

// Mock appointments data
const mockAppointments = [
  {
    ...mockAppointment,
    id: '1',
    patientName: 'João Silva',
    physiotherapistName: 'Dr. Maria Santos',
    date: '2024-01-15',
    time: '09:00',
    status: 'Confirmado'
  },
  {
    ...mockAppointment,
    id: '2',
    patientName: 'Pedro Oliveira',
    physiotherapistName: 'Dr. Ana Costa',
    date: '2024-01-15',
    time: '10:30',
    status: 'Em andamento'
  },
  {
    ...mockAppointment,
    id: '3',
    patientName: 'Maria Santos',
    physiotherapistName: 'Dr. João Silva',
    date: '2024-01-16',
    time: '14:00',
    status: 'Concluído'
  }
]

const mockPatients = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Pedro Oliveira' },
  { id: '3', name: 'Maria Santos' }
]

const mockPhysiotherapists = [
  { id: '1', name: 'Dr. Maria Santos' },
  { id: '2', name: 'Dr. Ana Costa' },
  { id: '3', name: 'Dr. João Silva' }
]

// Mock API hooks
const mockRefetch = vi.fn()
const mockCreateAppointment = vi.fn()
const mockUpdateAppointment = vi.fn()
const mockDeleteAppointment = vi.fn()

vi.mock('../../hooks/useApi', () => ({
  useApi: (endpoint: string) => {
    if (endpoint.includes('/appointments')) {
      return {
        data: mockAppointments,
        loading: false,
        error: null,
        refetch: mockRefetch
      }
    }
    if (endpoint.includes('/patients')) {
      return {
        data: mockPatients,
        loading: false,
        error: null,
        refetch: vi.fn()
      }
    }
    if (endpoint.includes('/physiotherapists')) {
      return {
        data: mockPhysiotherapists,
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
  },
  useApiMutation: () => ({
    mutate: mockCreateAppointment,
    loading: false,
    error: null
  })
}))

describe('Appointments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders appointments page correctly', () => {
    render(<Appointments />)
    
    expect(screen.getByText('Agendamentos')).toBeInTheDocument()
    expect(screen.getByText('Gerencie os agendamentos do consultório')).toBeInTheDocument()
    expect(screen.getByText('Novo Agendamento')).toBeInTheDocument()
  })

  it('displays calendar view by default', () => {
    render(<Appointments />)
    
    expect(screen.getByText('Janeiro 2024')).toBeInTheDocument()
    expect(screen.getByText('Dom')).toBeInTheDocument()
    expect(screen.getByText('Seg')).toBeInTheDocument()
    expect(screen.getByText('Ter')).toBeInTheDocument()
    expect(screen.getByText('Qua')).toBeInTheDocument()
    expect(screen.getByText('Qui')).toBeInTheDocument()
    expect(screen.getByText('Sex')).toBeInTheDocument()
    expect(screen.getByText('Sáb')).toBeInTheDocument()
  })

  it('toggles between calendar and list view', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    await waitFor(() => {
      expect(screen.getByText('Paciente')).toBeInTheDocument()
      expect(screen.getByText('Fisioterapeuta')).toBeInTheDocument()
      expect(screen.getByText('Data/Hora')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
    
    const calendarViewButton = screen.getByLabelText('Visualização em calendário')
    await user.click(calendarViewButton)
    
    await waitFor(() => {
      expect(screen.getByText('Janeiro 2024')).toBeInTheDocument()
    })
  })

  it('navigates between months in calendar view', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const nextMonthButton = screen.getByLabelText('Próximo mês')
    await user.click(nextMonthButton)
    
    await waitFor(() => {
      expect(screen.getByText('Fevereiro 2024')).toBeInTheDocument()
    })
    
    const prevMonthButton = screen.getByLabelText('Mês anterior')
    await user.click(prevMonthButton)
    
    await waitFor(() => {
      expect(screen.getByText('Janeiro 2024')).toBeInTheDocument()
    })
  })

  it('opens new appointment modal when clicking new appointment button', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const newAppointmentButton = screen.getByText('Novo Agendamento')
    await user.click(newAppointmentButton)
    
    await waitFor(() => {
      expect(screen.getByText('Novo Agendamento')).toBeInTheDocument()
      expect(screen.getByLabelText(/paciente/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fisioterapeuta/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
    })
  })

  it('validates required fields in appointment form', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const newAppointmentButton = screen.getByText('Novo Agendamento')
    await user.click(newAppointmentButton)
    
    const saveButton = screen.getByText('Salvar')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Paciente é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Fisioterapeuta é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Data é obrigatória')).toBeInTheDocument()
      expect(screen.getByText('Hora é obrigatória')).toBeInTheDocument()
    })
  })

  it('creates new appointment with valid data', async () => {
    const user = userEvent.setup()
    mockCreateAppointment.mockResolvedValue({ success: true })
    
    render(<Appointments />)
    
    const newAppointmentButton = screen.getByText('Novo Agendamento')
    await user.click(newAppointmentButton)
    
    const patientSelect = screen.getByLabelText(/paciente/i)
    const physiotherapistSelect = screen.getByLabelText(/fisioterapeuta/i)
    const dateInput = screen.getByLabelText(/data/i)
    const timeInput = screen.getByLabelText(/hora/i)
    const saveButton = screen.getByText('Salvar')
    
    await user.selectOptions(patientSelect, '1')
    await user.selectOptions(physiotherapistSelect, '1')
    await user.type(dateInput, '2024-01-20')
    await user.type(timeInput, '10:00')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockCreateAppointment).toHaveBeenCalledWith({
        patientId: '1',
        physiotherapistId: '1',
        date: '2024-01-20',
        time: '10:00',
        duration: 60,
        type: 'Consulta',
        status: 'Confirmado',
        value: 0,
        notes: ''
      })
    })
  })

  it('displays appointments in calendar view', () => {
    render(<Appointments />)
    
    // Check if appointments are displayed on the correct dates
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('displays appointments in list view', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      expect(screen.getByText('Dr. Maria Santos')).toBeInTheDocument()
      expect(screen.getByText('Dr. Ana Costa')).toBeInTheDocument()
    })
  })

  it('filters appointments by search term', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    const searchInput = screen.getByPlaceholderText('Buscar agendamentos...')
    await user.type(searchInput, 'João')
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.queryByText('Pedro Oliveira')).not.toBeInTheDocument()
    })
  })

  it('filters appointments by status', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    const statusFilter = screen.getByLabelText(/status/i)
    await user.selectOptions(statusFilter, 'Confirmado')
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.queryByText('Pedro Oliveira')).not.toBeInTheDocument()
    })
  })

  it('opens appointment details modal when clicking on appointment', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const appointmentCard = screen.getByText('João Silva').closest('div')
    if (appointmentCard) {
      await user.click(appointmentCard)
      
      await waitFor(() => {
        expect(screen.getByText('Detalhes do Agendamento')).toBeInTheDocument()
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.getByText('Dr. Maria Santos')).toBeInTheDocument()
      })
    }
  })

  it('opens edit modal when clicking edit button', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    const editButtons = screen.getAllByLabelText('Editar agendamento')
    await user.click(editButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Editar Agendamento')).toBeInTheDocument()
    })
  })

  it('opens delete confirmation modal when clicking delete button', async () => {
    const user = userEvent.setup()
    render(<Appointments />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    const deleteButtons = screen.getAllByLabelText('Excluir agendamento')
    await user.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument()
      expect(screen.getByText('Tem certeza que deseja excluir este agendamento?')).toBeInTheDocument()
    })
  })

  it('shows loading state when data is loading', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })
    
    render(<Appointments />)
    
    expect(screen.getByText('Carregando agendamentos...')).toBeInTheDocument()
  })

  it('shows error state when data fails to load', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch'),
      refetch: vi.fn()
    })
    
    render(<Appointments />)
    
    expect(screen.getByText('Erro ao carregar agendamentos')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Appointments />)
    
    const calendarViewButton = screen.getByLabelText('Visualização em calendário')
    const listViewButton = screen.getByLabelText('Visualização em lista')
    
    expect(calendarViewButton).toHaveAttribute('type', 'button')
    expect(listViewButton).toHaveAttribute('type', 'button')
  })
})