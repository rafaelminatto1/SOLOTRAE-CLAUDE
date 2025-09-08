import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { RealtimeProvider } from '../../contexts/RealtimeContext'

// Custom render function that includes providers
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from testing-library/react
export * from '@testing-library/react'

// Override render method
export { render }

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@fisioflow.com',
  name: 'Test User',
  role: 'physiotherapist',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockPatient = (overrides = {}) => ({
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 98765-4321',
  birth_date: '1990-01-15',
  cpf: '111.444.777-35',
  address: 'Rua das Flores, 123',
  medical_notes: 'Paciente com histórico de lesão no joelho',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockAppointment = (overrides = {}) => ({
  id: '1',
  patient_id: '1',
  physiotherapist_id: '1',
  date: '2024-01-15',
  time: '10:00',
  type: 'consultation',
  status: 'scheduled',
  notes: 'Primeira consulta',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

// Mock data generators
export const generateMockData = {
  users: (count: number = 3) => Array.from({ length: count }, (_, i) => createMockUser({ id: String(i + 1) })),
  patients: (count: number = 3) => Array.from({ length: count }, (_, i) => createMockPatient({ id: String(i + 1) })),
  appointments: (count: number = 3) => Array.from({ length: count }, (_, i) => createMockAppointment({ id: String(i + 1) }))
}

// Wait utilities
export const waitForLoadingToFinish = () => new Promise(resolve => setTimeout(resolve, 0))

// Form test utilities
export const fillForm = async (user: any, fields: Record<string, string>) => {
  for (const [label, value] of Object.entries(fields)) {
    const input = document.querySelector(`[aria-label*="${label}"], [placeholder*="${label}"], label:contains("${label}") input`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

// Local storage mock utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] || null
  }
}

// API mock utilities
export const createMockApiResponse = (data: any, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

// Date utilities for tests
export const getDateString = (daysFromNow: number = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

export const getTimeString = (hour: number = 10, minute: number = 0) => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// Validation test utilities
export const testValidation = {
  email: {
    valid: ['test@example.com', 'user.name+tag@domain.co.uk', 'user@domain-name.com'],
    invalid: ['invalid-email', '@domain.com', 'user@', 'user.domain.com']
  },
  phone: {
    valid: ['(11) 98765-4321', '11987654321', '+5511987654321'],
    invalid: ['123', '11999', 'invalid-phone']
  },
  cpf: {
    valid: ['111.444.777-35', '11144477735'],
    invalid: ['111.111.111-11', '123.456.789-00', '000.000.000-00']
  },
  password: {
    valid: ['StrongPass123!', 'MyP@ssw0rd', 'SecureP@ss1'],
    invalid: ['123', 'password', 'PASSWORD', '12345678']
  }
}

// Error boundary test component
export const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="error-boundary">
      {children}
    </div>
  )
}