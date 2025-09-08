import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'
import AppointmentForm from '../../components/Appointments/AppointmentForm'

// Mock the useAuth hook
const mockUser = {
  id: '1',
  email: 'test@fisioflow.com',
  name: 'Dr. Test',
  role: 'physiotherapist'
}

const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false,
  error: null,
  hasRole: vi.fn(() => true),
  refreshToken: vi.fn()
}

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => mockAuthContext
  }
})

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [
          { id: '1', name: 'João Silva', email: 'joao@email.com' },
          { id: '2', name: 'Maria Santos', email: 'maria@email.com' }
        ],
        error: null
      }))
    })),
    insert: vi.fn(() => ({
      data: [{ id: '123', patient_id: '1', date: '2024-01-15', time: '10:00' }],
      error: null
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [{ id: '123', patient_id: '1', date: '2024-01-15', time: '10:00' }],
        error: null
      }))
    }))
  }))
}

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}))

const mockOnSuccess = vi.fn()
const mockOnCancel = vi.fn()

const defaultProps = {
  onSuccess: mockOnSuccess,
  onCancel: mockOnCancel
}

describe('AppointmentForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders appointment form correctly', async () => {
    render(<AppointmentForm {...defaultProps} />)
    
    expect(screen.getByText('Novo Agendamento')).toBeInTheDocument()
    expect(screen.getByLabelText(/paciente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/horário/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de consulta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/observações/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agendar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('loads patients on component mount', async () => {
    render(<AppointmentForm {...defaultProps} />)
    
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
    })
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /agendar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/paciente é obrigatório/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/data é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/horário é obrigatório/i)).toBeInTheDocument()
  })

  it('shows validation error for past date', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    const dateInput = screen.getByLabelText(/data/i)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = yesterday.toISOString().split('T')[0]
    
    await user.type(dateInput, pastDate)
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/data não pode ser no passado/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid time format', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    const timeInput = screen.getByLabelText(/horário/i)
    await user.type(timeInput, '25:00') // Invalid time
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/horário inválido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for time outside business hours', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    const timeInput = screen.getByLabelText(/horário/i)
    await user.type(timeInput, '06:00') // Before business hours
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/horário deve ser entre 07:00 e 18:00/i)).toBeInTheDocument()
    })
  })

  it('creates appointment with valid data', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    // Wait for patients to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
    })
    
    // Fill form with valid data
    const patientSelect = screen.getByLabelText(/paciente/i)
    await user.selectOptions(patientSelect, '1')
    
    const dateInput = screen.getByLabelText(/data/i)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    await user.type(dateInput, futureDate)
    
    const timeInput = screen.getByLabelText(/horário/i)
    await user.type(timeInput, '10:00')
    
    const typeSelect = screen.getByLabelText(/tipo de consulta/i)
    await user.selectOptions(typeSelect, 'consultation')
    
    const notesInput = screen.getByLabelText(/observações/i)
    await user.type(notesInput, 'Primeira consulta')
    
    const submitButton = screen.getByRole('button', { name: /agendar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('appointments')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('disables submit button during form submission', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    let resolveInsert: (value: any) => void
    const insertPromise = new Promise(resolve => {
      resolveInsert = resolve
    })
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ id: '1', name: 'João Silva', email: 'joao@email.com' }],
          error: null
        }))
      })),
      insert: vi.fn(() => insertPromise)
    })
    
    render(<AppointmentForm {...defaultProps} />)
    
    // Fill form with valid data
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
    })
    
    const patientSelect = screen.getByLabelText(/paciente/i)
    await user.selectOptions(patientSelect, '1')
    
    const dateInput = screen.getByLabelText(/data/i)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    await user.type(dateInput, futureDate)
    
    const timeInput = screen.getByLabelText(/horário/i)
    await user.type(timeInput, '10:00')
    
    const submitButton = screen.getByRole('button', { name: /agendar/i })
    await user.click(submitButton)
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()
    
    // Resolve the promise to complete the submission
    resolveInsert!({ data: [{ id: '123' }], error: null })
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('renders in edit mode when appointment prop is provided', () => {
    const existingAppointment = {
      id: '123',
      patient_id: '1',
      date: '2024-01-15',
      time: '10:00',
      type: 'consultation',
      notes: 'Follow-up consultation'
    }
    
    render(
      <AppointmentForm 
        {...defaultProps} 
        appointment={existingAppointment}
      />
    )
    
    expect(screen.getByText('Editar Agendamento')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('validates form in real-time', async () => {
    const user = userEvent.setup()
    render(<AppointmentForm {...defaultProps} />)
    
    const dateInput = screen.getByLabelText(/data/i)
    
    // Type past date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = yesterday.toISOString().split('T')[0]
    
    await user.type(dateInput, pastDate)
    await user.tab()
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/data não pode ser no passado/i)).toBeInTheDocument()
    })
    
    // Clear and type valid date
    await user.clear(dateInput)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    await user.type(dateInput, futureDate)
    await user.tab()
    
    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/data não pode ser no passado/i)).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ id: '1', name: 'João Silva', email: 'joao@email.com' }],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: { message: 'Erro ao criar agendamento' }
      }))
    })
    
    render(<AppointmentForm {...defaultProps} />)
    
    // Fill form with valid data
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
    })
    
    const patientSelect = screen.getByLabelText(/paciente/i)
    await user.selectOptions(patientSelect, '1')
    
    const dateInput = screen.getByLabelText(/data/i)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    await user.type(dateInput, futureDate)
    
    const timeInput = screen.getByLabelText(/horário/i)
    await user.type(timeInput, '10:00')
    
    const submitButton = screen.getByRole('button', { name: /agendar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })
})