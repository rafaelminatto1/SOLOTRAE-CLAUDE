import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockPatient } from '../utils'
import Patients from '../../pages/Patients'

// Mock patients data
const mockPatients = [
  {
    ...mockPatient,
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999'
  },
  {
    ...mockPatient,
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 88888-8888'
  },
  {
    ...mockPatient,
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(11) 77777-7777'
  }
]

// Mock API hooks
const mockRefetch = vi.fn()
const mockCreatePatient = vi.fn()
const mockUpdatePatient = vi.fn()
const mockDeletePatient = vi.fn()

vi.mock('../../hooks/useApi', () => ({
  useApi: (endpoint: string) => {
    if (endpoint.includes('/patients')) {
      return {
        data: mockPatients,
        loading: false,
        error: null,
        refetch: mockRefetch
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
    mutate: mockCreatePatient,
    loading: false,
    error: null
  })
}))

// Mock react-query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useMutation: () => ({
      mutate: mockCreatePatient,
      isLoading: false,
      error: null
    })
  }
})

describe('Patients Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders patients page correctly', () => {
    render(<Patients />)
    
    expect(screen.getByText('Pacientes')).toBeInTheDocument()
    expect(screen.getByText('Gerencie os pacientes do seu consultório')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar pacientes...')).toBeInTheDocument()
    expect(screen.getByText('Novo Paciente')).toBeInTheDocument()
  })

  it('displays patients list correctly', () => {
    render(<Patients />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
    
    expect(screen.getByText('joao@email.com')).toBeInTheDocument()
    expect(screen.getByText('maria@email.com')).toBeInTheDocument()
    expect(screen.getByText('pedro@email.com')).toBeInTheDocument()
  })

  it('filters patients based on search input', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const searchInput = screen.getByPlaceholderText('Buscar pacientes...')
    await user.type(searchInput, 'João')
    
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument()
      expect(screen.queryByText('Pedro Oliveira')).not.toBeInTheDocument()
    })
  })

  it('opens new patient modal when clicking new patient button', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const newPatientButton = screen.getByText('Novo Paciente')
    await user.click(newPatientButton)
    
    await waitFor(() => {
      expect(screen.getByText('Cadastrar Paciente')).toBeInTheDocument()
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    })
  })

  it('validates required fields in patient form', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const newPatientButton = screen.getByText('Novo Paciente')
    await user.click(newPatientButton)
    
    const saveButton = screen.getByText('Salvar')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Telefone é obrigatório')).toBeInTheDocument()
    })
  })

  it('creates new patient with valid data', async () => {
    const user = userEvent.setup()
    mockCreatePatient.mockResolvedValue({ success: true })
    
    render(<Patients />)
    
    const newPatientButton = screen.getByText('Novo Paciente')
    await user.click(newPatientButton)
    
    const nameInput = screen.getByLabelText(/nome/i)
    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/telefone/i)
    const saveButton = screen.getByText('Salvar')
    
    await user.type(nameInput, 'Novo Paciente')
    await user.type(emailInput, 'novo@email.com')
    await user.type(phoneInput, '(11) 66666-6666')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockCreatePatient).toHaveBeenCalledWith({
        name: 'Novo Paciente',
        email: 'novo@email.com',
        phone: '(11) 66666-6666',
        birthDate: '',
        gender: '',
        address: '',
        emergencyContact: '',
        medicalHistory: ''
      })
    })
  })

  it('opens edit modal when clicking edit button', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const editButtons = screen.getAllByLabelText('Editar paciente')
    await user.click(editButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Editar Paciente')).toBeInTheDocument()
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument()
      expect(screen.getByDisplayValue('joao@email.com')).toBeInTheDocument()
    })
  })

  it('opens patient details modal when clicking view button', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const viewButtons = screen.getAllByLabelText('Ver detalhes')
    await user.click(viewButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Detalhes do Paciente')).toBeInTheDocument()
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('joao@email.com')).toBeInTheDocument()
    })
  })

  it('opens delete confirmation modal when clicking delete button', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const deleteButtons = screen.getAllByLabelText('Excluir paciente')
    await user.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument()
      expect(screen.getByText('Tem certeza que deseja excluir este paciente?')).toBeInTheDocument()
    })
  })

  it('deletes patient when confirming deletion', async () => {
    const user = userEvent.setup()
    mockDeletePatient.mockResolvedValue({ success: true })
    
    render(<Patients />)
    
    const deleteButtons = screen.getAllByLabelText('Excluir paciente')
    await user.click(deleteButtons[0])
    
    const confirmButton = screen.getByText('Excluir')
    await user.click(confirmButton)
    
    await waitFor(() => {
      expect(mockDeletePatient).toHaveBeenCalledWith('1')
    })
  })

  it('toggles between grid and list view', async () => {
    const user = userEvent.setup()
    render(<Patients />)
    
    const gridViewButton = screen.getByLabelText('Visualização em grade')
    const listViewButton = screen.getByLabelText('Visualização em lista')
    
    expect(gridViewButton).toBeInTheDocument()
    expect(listViewButton).toBeInTheDocument()
    
    await user.click(listViewButton)
    // Verify list view is active
    
    await user.click(gridViewButton)
    // Verify grid view is active
  })

  it('shows loading state when data is loading', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })
    
    render(<Patients />)
    
    expect(screen.getByText('Carregando pacientes...')).toBeInTheDocument()
  })

  it('shows error state when data fails to load', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch'),
      refetch: vi.fn()
    })
    
    render(<Patients />)
    
    expect(screen.getByText('Erro ao carregar pacientes')).toBeInTheDocument()
  })

  it('shows empty state when no patients exist', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn()
    })
    
    render(<Patients />)
    
    expect(screen.getByText('Nenhum paciente encontrado')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Patients />)
    
    const searchInput = screen.getByPlaceholderText('Buscar pacientes...')
    expect(searchInput).toHaveAttribute('type', 'search')
    
    const newPatientButton = screen.getByText('Novo Paciente')
    expect(newPatientButton).toHaveAttribute('type', 'button')
  })
})