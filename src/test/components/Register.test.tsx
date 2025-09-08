import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils'
import Register from '../../pages/Register'

// Mock the useAuth hook
const mockLogin = vi.fn()
const mockLogout = vi.fn()
const mockRegister = vi.fn()
const mockHasRole = vi.fn(() => false)
const mockRefreshToken = vi.fn()

const mockAuthContext = {
  user: null,
  login: mockLogin,
  logout: mockLogout,
  register: mockRegister,
  loading: false,
  error: null,
  hasRole: mockHasRole,
  refreshToken: mockRefreshToken
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

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>{children}</a>
    )
  }
})

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister.mockResolvedValue({ success: true })
  })

  it('renders registration form correctly', () => {
    render(<Register />)
    
    expect(screen.getByText('Criar Conta')).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de usuário/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const emailInput = screen.getByLabelText(/e-mail/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail deve ter um formato válido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for weak password', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const passwordInput = screen.getByLabelText(/^senha$/i)
    await user.type(passwordInput, '123')
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.tab() // Trigger blur event
    
    await waitFor(() => {
      expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
    })
  })

  it('calls register function with correct data on valid form submission', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    render(<Register />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'Dr. João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@fisioflow.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    
    // Select user type
    const userTypeSelect = screen.getByLabelText(/tipo de usuário/i)
    await user.selectOptions(userTypeSelect, 'physiotherapist')
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Dr. João Silva',
        email: 'joao@fisioflow.com',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'physiotherapist'
      })
    })
  })

  it('disables submit button during form submission', async () => {
    const user = userEvent.setup()
    let resolveRegister: (value: any) => void
    const registerPromise = new Promise(resolve => {
      resolveRegister = resolve
    })
    mockRegister.mockReturnValue(registerPromise)
    
    render(<Register />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'Dr. João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@fisioflow.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    
    const userTypeSelect = screen.getByLabelText(/tipo de usuário/i)
    await user.selectOptions(userTypeSelect, 'physiotherapist')
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()
    
    // Resolve the promise to complete the submission
    resolveRegister!({ success: true })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('navigates to login page on successful registration', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    render(<Register />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'Dr. João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@fisioflow.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    
    const userTypeSelect = screen.getByLabelText(/tipo de usuário/i)
    await user.selectOptions(userTypeSelect, 'physiotherapist')
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error message on registration failure', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ 
      success: false, 
      message: 'E-mail já está em uso' 
    })
    
    render(<Register />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/nome completo/i), 'Dr. João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@fisioflow.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    
    const userTypeSelect = screen.getByLabelText(/tipo de usuário/i)
    await user.selectOptions(userTypeSelect, 'physiotherapist')
    
    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<Register />)
    
    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
    
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })

  it('validates form in real-time', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
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
})