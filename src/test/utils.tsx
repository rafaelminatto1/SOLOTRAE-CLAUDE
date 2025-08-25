import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data helpers
export const mockPatient = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-9999',
  birthDate: '1990-01-01',
  gender: 'M' as const,
  address: 'Rua das Flores, 123',
  emergencyContact: 'Maria Silva - (11) 88888-8888',
  medicalHistory: 'Histórico médico de teste',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export const mockAppointment = {
  id: '1',
  patientId: '1',
  physiotherapistId: '1',
  date: '2024-01-15',
  time: '10:00',
  duration: 60,
  type: 'Consulta' as const,
  status: 'Confirmado' as const,
  value: 150.00,
  notes: 'Consulta de rotina',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export const mockExercise = {
  id: '1',
  name: 'Alongamento de Quadríceps',
  description: 'Exercício para alongar o músculo quadríceps',
  category: 'Alongamento',
  subcategory: 'Membros Inferiores',
  difficulty: 'Fácil' as const,
  estimatedDuration: 5,
  equipment: ['Nenhum'],
  muscleGroups: ['Quadríceps'],
  objectives: ['Flexibilidade'],
  instructions: 'Instruções detalhadas do exercício',
  contraindications: 'Nenhuma contraindicação específica',
  tags: ['alongamento', 'quadriceps'],
  videoUrl: '',
  imageUrl: '',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}