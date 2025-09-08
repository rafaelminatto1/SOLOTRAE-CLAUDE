import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'
import PatientForm from '../../components/Patients/PatientForm'

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
    insert: vi.fn(() => ({
      data: [{ id: '123', name: 'João Silva', email: 'joao@email.com' }],
      error: null
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [{ id: '123', name: 'João Silva', email: 'joao@email.com' }],
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

describe('PatientForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders patient form correctly', () => {
    render(<PatientForm {...defaultProps} />)
    
    expect(screen.getByText('Novo Paciente')).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/observações médicas/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/telefone é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/data de nascimento é obrigatória/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail deve ter um formato válido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone format', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const phoneInput = screen.getByLabelText(/telefone/i)
    await user.type(phoneInput, '123')
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/telefone deve ter um formato válido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid CPF format', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const cpfInput = screen.getByLabelText(/cpf/i)
    await user.type(cpfInput, '123.456.789-00') // Invalid CPF
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for future birth date', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const birthDateInput = screen.getByLabelText(/data de nascimento/i)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split('T')[0]
    
    await user.type(birthDateInput, futureDate)
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/data de nascimento não pode ser no futuro/i)).toBeInTheDocument()
    })
  })

  it('formats phone number automatically', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const phoneInput = screen.getByLabelText(/telefone/i)
    await user.type(phoneInput, '11987654321')
    
    await waitFor(() => {
      expect(phoneInput).toHaveValue('(11) 98765-4321')
    })
  })

  it('formats CPF automatically', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const cpfInput = screen.getByLabelText(/cpf/i)
    await user.type(cpfInput, '11144477735')
    
    await waitFor(() => {
      expect(cpfInput).toHaveValue('111.444.777-35')
    })
  })

  it('creates patient with valid data', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@email.com')
    await user.type(screen.getByLabelText(/telefone/i), '11987654321')
    
    const birthDateInput = screen.getByLabelText(/data de nascimento/i)
    await user.type(birthDateInput, '1990-01-15')
    
    await user.type(screen.getByLabelText(/cpf/i), '11144477735')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua das Flores, 123')
    await user.type(screen.getByLabelText(/observações médicas/i), 'Paciente com histórico de lesão no joelho')
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('patients')
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
      insert: vi.fn(() => insertPromise)
    })
    
    render(<PatientForm {...defaultProps} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@email.com')
    await user.type(screen.getByLabelText(/telefone/i), '11987654321')
    
    const birthDateInput = screen.getByLabelText(/data de nascimento/i)
    await user.type(birthDateInput, '1990-01-15')
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
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
    render(<PatientForm {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('renders in edit mode when patient prop is provided', () => {
    const existingPatient = {
      id: '123',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 98765-4321',
      birth_date: '1990-01-15',
      cpf: '111.444.777-35',
      address: 'Rua das Flores, 123',
      medical_notes: 'Paciente com histórico de lesão no joelho'
    }
    
    render(
      <PatientForm 
        {...defaultProps} 
        patient={existingPatient}
      />
    )
    
    expect(screen.getByText('Editar Paciente')).toBeInTheDocument()
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
    expect(screen.getByDisplayValue('joao@email.com')).toBeInTheDocument()
  })

  it('validates form in real-time', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    
    // Type invalid email
    await user.type(emailInput, 'invalid')
    await user.tab()
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/e-mail deve ter um formato válido/i)).toBeInTheDocument()
    })
    
    // Clear and type valid email
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@email.com')
    await user.tab()
    
    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/e-mail deve ter um formato válido/i)).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => ({
        data: null,
        error: { message: 'Erro ao criar paciente' }
      }))
    })
    
    render(<PatientForm {...defaultProps} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@email.com')
    await user.type(screen.getByLabelText(/telefone/i), '11987654321')
    
    const birthDateInput = screen.getByLabelText(/data de nascimento/i)
    await user.type(birthDateInput, '1990-01-15')
    
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  it('validates CPF checksum correctly', async () => {
    const user = userEvent.setup()
    render(<PatientForm {...defaultProps} />)
    
    const cpfInput = screen.getByLabelText(/cpf/i)
    
    // Type valid CPF
    await user.type(cpfInput, '11144477735')
    await user.tab()
    
    // Should not show validation error
    await waitFor(() => {
      expect(screen.queryByText(/cpf inválido/i)).not.toBeInTheDocument()
    })
    
    // Clear and type invalid CPF
    await user.clear(cpfInput)
    await user.type(cpfInput, '11111111111') // Invalid CPF (all same digits)
    await user.tab()
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<PatientForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/e-mail/i)
    const phoneInput = screen.getByLabelText(/telefone/i)
    const birthDateInput = screen.getByLabelText(/data de nascimento/i)
    
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(phoneInput).toHaveAttribute('type', 'tel')
    expect(birthDateInput).toHaveAttribute('type', 'date')
  })
})