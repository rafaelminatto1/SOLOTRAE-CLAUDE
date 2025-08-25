import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { ReactNode, createElement } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock user data
const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
}

const mockToken = 'mock-jwt-token'

// Test wrapper
const wrapper = ({ children }: { children: ReactNode }) => 
  createElement(AuthProvider, null, children)

describe('useAuth Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with no user when no token in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('initializes with user when valid token exists in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(mockToken)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
    })
  })

  it('handles login successfully', async () => {
    const credentials = {
      email: 'joao@fisioflow.com',
      password: 'password123'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        token: mockToken
      }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      await result.current.login(credentials)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.error).toBeNull()

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
  })

  it('handles login failure', async () => {
    const credentials = {
      email: 'joao@fisioflow.com',
      password: 'wrongpassword'
    }

    const errorMessage = 'Credenciais inválidas'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: errorMessage }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.login(credentials)
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe(errorMessage)
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
  })

  it('handles logout', async () => {
    // Setup authenticated state
    mockLocalStorage.getItem.mockReturnValue(mockToken)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    // Mock logout API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
  })

  it('handles registration successfully', async () => {
    const registrationData = {
      name: 'Dr. Maria Santos',
      email: 'maria@fisioflow.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'physiotherapist',
      clinic: {
        name: 'Clínica Maria Santos',
        address: 'Rua B, 456'
      }
    }

    const newUser = {
      id: 2,
      name: 'Dr. Maria Santos',
      email: 'maria@fisioflow.com',
      role: 'physiotherapist',
      clinic: {
        id: 2,
        name: 'Clínica Maria Santos',
        address: 'Rua B, 456'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: newUser,
        token: mockToken
      }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register(registrationData)
    })

    expect(result.current.user).toEqual(newUser)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken)
  })

  it('handles registration failure', async () => {
    const registrationData = {
      name: 'Dr. Maria Santos',
      email: 'maria@fisioflow.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'physiotherapist'
    }

    const errorMessage = 'Email já está em uso'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: errorMessage }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.register(registrationData)
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('handles password reset request', async () => {
    const email = 'joao@fisioflow.com'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email de recuperação enviado' }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.requestPasswordReset(email)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
  })

  it('handles password reset', async () => {
    const resetData = {
      token: 'reset-token-123',
      password: 'newpassword123',
      confirmPassword: 'newpassword123'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Senha alterada com sucesso' }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.resetPassword(resetData)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetData),
    })
  })

  it('handles profile update', async () => {
    // Setup authenticated state
    mockLocalStorage.getItem.mockReturnValue(mockToken)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    const updatedData = {
      name: 'Dr. João Silva Updated',
      phone: '(11) 99999-9999'
    }

    const updatedUser = {
      ...mockUser,
      ...updatedData
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedUser,
    })

    await act(async () => {
      await result.current.updateProfile(updatedData)
    })

    expect(result.current.user).toEqual(updatedUser)
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      body: JSON.stringify(updatedData),
    })
  })

  it('handles token refresh', async () => {
    const newToken = 'new-token-123'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: newToken }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.refreshToken()
    })

    expect(result.current.token).toBe(newToken)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', newToken)
  })

  it('handles expired token', async () => {
    mockLocalStorage.getItem.mockReturnValue(mockToken)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Token expirado' }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
  })

  it('provides loading state during authentication operations', async () => {
    const credentials = {
      email: 'joao@fisioflow.com',
      password: 'password123'
    }

    // Simulate slow API response
    mockFetch.mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ user: mockUser, token: mockToken })
        }), 100)
      )
    )

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login(credentials)
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('clears error state on successful operations', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    // First, cause an error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Erro de autenticação' }),
    })

    await act(async () => {
      try {
        await result.current.login({ email: 'test@test.com', password: 'wrong' })
      } catch (error) {
        // Expected
      }
    })

    expect(result.current.error).toBe('Erro de autenticação')

    // Then, perform successful operation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    })

    await act(async () => {
      await result.current.login({ email: 'joao@fisioflow.com', password: 'password123' })
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles network errors gracefully', async () => {
    const credentials = {
      email: 'joao@fisioflow.com',
      password: 'password123'
    }

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      try {
        await result.current.login(credentials)
      } catch (error) {
        // Expected
      }
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('validates user permissions', () => {
    mockLocalStorage.getItem.mockReturnValue(mockToken)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Test permission checking
    expect(result.current.hasPermission('manage_patients')).toBe(true)
    expect(result.current.hasPermission('admin_access')).toBe(false)
    expect(result.current.hasRole('physiotherapist')).toBe(true)
    expect(result.current.hasRole('admin')).toBe(false)
  })
})