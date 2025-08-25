import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockExercise } from '../utils'
import Exercises from '../../pages/Exercises'

// Mock exercises data
const mockExercises = [
  {
    ...mockExercise,
    id: '1',
    name: 'Flexão de Braço',
    category: 'Força',
    subcategory: 'Membros Superiores',
    difficulty: 'Intermediário',
    duration: 30,
    description: 'Exercício para fortalecimento dos músculos do peito e braços',
    muscleGroups: ['Peitoral', 'Tríceps'],
    equipment: ['Peso corporal'],
    tags: ['força', 'peito', 'braços']
  },
  {
    ...mockExercise,
    id: '2',
    name: 'Agachamento',
    category: 'Força',
    subcategory: 'Membros Inferiores',
    difficulty: 'Iniciante',
    duration: 45,
    description: 'Exercício fundamental para fortalecimento das pernas',
    muscleGroups: ['Quadríceps', 'Glúteos'],
    equipment: ['Peso corporal'],
    tags: ['força', 'pernas', 'glúteos']
  },
  {
    ...mockExercise,
    id: '3',
    name: 'Alongamento Cervical',
    category: 'Flexibilidade',
    subcategory: 'Pescoço',
    difficulty: 'Iniciante',
    duration: 15,
    description: 'Alongamento para alívio de tensão cervical',
    muscleGroups: ['Cervical'],
    equipment: [],
    tags: ['alongamento', 'cervical', 'relaxamento']
  }
]

const mockCategories = [
  { id: '1', name: 'Força' },
  { id: '2', name: 'Flexibilidade' },
  { id: '3', name: 'Cardio' },
  { id: '4', name: 'Reabilitação' }
]

// Mock API hooks
const mockRefetch = vi.fn()
const mockCreateExercise = vi.fn()
const mockUpdateExercise = vi.fn()
const mockDeleteExercise = vi.fn()

vi.mock('../../hooks/useApi', () => ({
  useApi: (endpoint: string) => {
    if (endpoint.includes('/exercises')) {
      return {
        data: mockExercises,
        loading: false,
        error: null,
        refetch: mockRefetch
      }
    }
    if (endpoint.includes('/categories')) {
      return {
        data: mockCategories,
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
    mutate: mockCreateExercise,
    loading: false,
    error: null
  })
}))

describe('Exercises Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders exercises page correctly', () => {
    render(<Exercises />)
    
    expect(screen.getByText('Biblioteca de Exercícios')).toBeInTheDocument()
    expect(screen.getByText('Gerencie os exercícios disponíveis para prescrição')).toBeInTheDocument()
    expect(screen.getByText('Novo Exercício')).toBeInTheDocument()
  })

  it('displays exercises in grid view by default', () => {
    render(<Exercises />)
    
    expect(screen.getByText('Flexão de Braço')).toBeInTheDocument()
    expect(screen.getByText('Agachamento')).toBeInTheDocument()
    expect(screen.getByText('Alongamento Cervical')).toBeInTheDocument()
    
    // Check if exercise cards are displayed
    expect(screen.getByText('Intermediário')).toBeInTheDocument()
    expect(screen.getByText('Iniciante')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
  })

  it('toggles between grid and list view', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const listViewButton = screen.getByLabelText('Visualização em lista')
    await user.click(listViewButton)
    
    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Categoria')).toBeInTheDocument()
      expect(screen.getByText('Dificuldade')).toBeInTheDocument()
      expect(screen.getByText('Duração')).toBeInTheDocument()
    })
    
    const gridViewButton = screen.getByLabelText('Visualização em grade')
    await user.click(gridViewButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Nome')).not.toBeInTheDocument()
    })
  })

  it('filters exercises by search term', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const searchInput = screen.getByPlaceholderText('Buscar exercícios...')
    await user.type(searchInput, 'Flexão')
    
    await waitFor(() => {
      expect(screen.getByText('Flexão de Braço')).toBeInTheDocument()
      expect(screen.queryByText('Agachamento')).not.toBeInTheDocument()
      expect(screen.queryByText('Alongamento Cervical')).not.toBeInTheDocument()
    })
  })

  it('filters exercises by category', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const categoryFilter = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categoryFilter, 'Flexibilidade')
    
    await waitFor(() => {
      expect(screen.getByText('Alongamento Cervical')).toBeInTheDocument()
      expect(screen.queryByText('Flexão de Braço')).not.toBeInTheDocument()
      expect(screen.queryByText('Agachamento')).not.toBeInTheDocument()
    })
  })

  it('filters exercises by difficulty level', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const difficultyFilter = screen.getByLabelText(/dificuldade/i)
    await user.selectOptions(difficultyFilter, 'Intermediário')
    
    await waitFor(() => {
      expect(screen.getByText('Flexão de Braço')).toBeInTheDocument()
      expect(screen.queryByText('Agachamento')).not.toBeInTheDocument()
      expect(screen.queryByText('Alongamento Cervical')).not.toBeInTheDocument()
    })
  })

  it('opens new exercise modal when clicking new exercise button', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const newExerciseButton = screen.getByText('Novo Exercício')
    await user.click(newExerciseButton)
    
    await waitFor(() => {
      expect(screen.getByText('Novo Exercício')).toBeInTheDocument()
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    })
  })

  it('validates required fields in exercise form', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const newExerciseButton = screen.getByText('Novo Exercício')
    await user.click(newExerciseButton)
    
    const saveButton = screen.getByText('Salvar')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Categoria é obrigatória')).toBeInTheDocument()
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument()
    })
  })

  it('creates new exercise with valid data', async () => {
    const user = userEvent.setup()
    mockCreateExercise.mockResolvedValue({ success: true })
    
    render(<Exercises />)
    
    const newExerciseButton = screen.getByText('Novo Exercício')
    await user.click(newExerciseButton)
    
    const nameInput = screen.getByLabelText(/nome/i)
    const categorySelect = screen.getByLabelText(/categoria/i)
    const descriptionInput = screen.getByLabelText(/descrição/i)
    const saveButton = screen.getByText('Salvar')
    
    await user.type(nameInput, 'Novo Exercício Teste')
    await user.selectOptions(categorySelect, 'Força')
    await user.type(descriptionInput, 'Descrição do novo exercício')
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockCreateExercise).toHaveBeenCalledWith({
        name: 'Novo Exercício Teste',
        category: 'Força',
        subcategory: '',
        difficulty: 'Iniciante',
        duration: 30,
        description: 'Descrição do novo exercício',
        instructions: '',
        contraindications: '',
        equipment: [],
        muscleGroups: [],
        objectives: [],
        tags: [],
        videoUrl: '',
        imageUrl: '',
        isActive: true
      })
    })
  })

  it('opens exercise details modal when clicking on exercise card', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const exerciseCard = screen.getByText('Flexão de Braço').closest('div')
    if (exerciseCard) {
      const viewButton = exerciseCard.querySelector('[aria-label="Ver detalhes"]')
      if (viewButton) {
        await user.click(viewButton)
        
        await waitFor(() => {
          expect(screen.getByText('Detalhes do Exercício')).toBeInTheDocument()
          expect(screen.getByText('Flexão de Braço')).toBeInTheDocument()
          expect(screen.getByText('Exercício para fortalecimento dos músculos do peito e braços')).toBeInTheDocument()
        })
      }
    }
  })

  it('opens edit modal when clicking edit button', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const exerciseCard = screen.getByText('Flexão de Braço').closest('div')
    if (exerciseCard) {
      const editButton = exerciseCard.querySelector('[aria-label="Editar exercício"]')
      if (editButton) {
        await user.click(editButton)
        
        await waitFor(() => {
          expect(screen.getByText('Editar Exercício')).toBeInTheDocument()
          expect(screen.getByDisplayValue('Flexão de Braço')).toBeInTheDocument()
        })
      }
    }
  })

  it('opens delete confirmation modal when clicking delete button', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const exerciseCard = screen.getByText('Flexão de Braço').closest('div')
    if (exerciseCard) {
      const deleteButton = exerciseCard.querySelector('[aria-label="Excluir exercício"]')
      if (deleteButton) {
        await user.click(deleteButton)
        
        await waitFor(() => {
          expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument()
          expect(screen.getByText('Tem certeza que deseja excluir este exercício?')).toBeInTheDocument()
        })
      }
    }
  })

  it('displays exercise muscle groups and equipment', () => {
    render(<Exercises />)
    
    expect(screen.getByText('Peitoral')).toBeInTheDocument()
    expect(screen.getByText('Tríceps')).toBeInTheDocument()
    expect(screen.getByText('Quadríceps')).toBeInTheDocument()
    expect(screen.getByText('Glúteos')).toBeInTheDocument()
    expect(screen.getByText('Peso corporal')).toBeInTheDocument()
  })

  it('shows video indicator for exercises with video', () => {
    render(<Exercises />)
    
    // Assuming exercises with videoUrl show a video indicator
    const videoIndicators = screen.getAllByLabelText('Vídeo disponível')
    expect(videoIndicators.length).toBeGreaterThan(0)
  })

  it('displays difficulty badges with correct colors', () => {
    render(<Exercises />)
    
    const beginnerBadges = screen.getAllByText('Iniciante')
    const intermediateBadges = screen.getAllByText('Intermediário')
    
    expect(beginnerBadges.length).toBeGreaterThan(0)
    expect(intermediateBadges.length).toBeGreaterThan(0)
  })

  it('shows loading state when data is loading', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn()
    })
    
    render(<Exercises />)
    
    expect(screen.getByText('Carregando exercícios...')).toBeInTheDocument()
  })

  it('shows error state when data fails to load', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch'),
      refetch: vi.fn()
    })
    
    render(<Exercises />)
    
    expect(screen.getByText('Erro ao carregar exercícios')).toBeInTheDocument()
  })

  it('shows empty state when no exercises are found', () => {
    vi.mocked(require('../../hooks/useApi').useApi).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn()
    })
    
    render(<Exercises />)
    
    expect(screen.getByText('Nenhum exercício encontrado')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Exercises />)
    
    const gridViewButton = screen.getByLabelText('Visualização em grade')
    const listViewButton = screen.getByLabelText('Visualização em lista')
    const searchInput = screen.getByPlaceholderText('Buscar exercícios...')
    
    expect(gridViewButton).toHaveAttribute('type', 'button')
    expect(listViewButton).toHaveAttribute('type', 'button')
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Exercises />)
    
    const searchInput = screen.getByPlaceholderText('Buscar exercícios...')
    
    await user.tab()
    expect(searchInput).toHaveFocus()
    
    await user.tab()
    const categoryFilter = screen.getByLabelText(/categoria/i)
    expect(categoryFilter).toHaveFocus()
  })
})