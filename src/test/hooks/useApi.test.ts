import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, createElement } from 'react'
import { useApi, useApiMutation } from '../../hooks/useApi'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock data
const mockPatients = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-15',
    address: 'Rua das Flores, 123',
    medicalHistory: 'Histórico médico do paciente',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    birthDate: '1985-05-20',
    address: 'Av. Principal, 456',
    medicalHistory: 'Histórico médico da paciente',
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  }
]

const mockPatient = {
  id: 1,
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '(11) 99999-9999',
  birthDate: '1990-01-01',
  address: 'Rua A, 123'
}

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => 
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useApi Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useApi('/api/patients'), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockPatients)
    expect(result.current.error).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith('/api/patients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('handles fetch errors', async () => {
    const errorMessage = 'Network error'
    mockFetch.mockRejectedValueOnce(new Error(errorMessage))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useApi('/api/patients'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe(errorMessage)
  })

  it('handles HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Patients not found' }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useApi('/api/patients'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
  })

  it('supports query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApi('/api/patients', { params: { search: 'João', limit: 10 } }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/patients?search=Jo%C3%A3o&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('supports custom headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApi('/api/patients', { 
        headers: { 
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value'
        } 
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/patients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      },
    })
  })

  it('supports conditional fetching', async () => {
    const wrapper = createWrapper()
    const { result, rerender } = renderHook(
      ({ enabled }) => useApi('/api/patients', { enabled }),
      { 
        wrapper,
        initialProps: { enabled: false }
      }
    )

    // Should not fetch when disabled
    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()

    // Should fetch when enabled
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    rerender({ enabled: true })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('supports data transformation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApi('/api/patients', {
        select: (data: typeof mockPatients) => data.map(p => ({ ...p, displayName: p.name.toUpperCase() }))
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.[0].displayName).toBe('JOÃO SILVA')
    expect(result.current.data?.[1].displayName).toBe('MARIA SANTOS')
  })

  it('supports cache configuration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApi('/api/patients', {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockPatients)
  })

  it('supports manual refetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatients,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useApi('/api/patients'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Mock second response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [...mockPatients, { id: 3, name: 'Pedro Costa' }],
    })

    // Trigger refetch
    result.current.refetch()

    await waitFor(() => {
      expect(result.current.data?.length).toBe(3)
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('useApiMutation Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('performs POST mutation successfully', async () => {
    const newPatient = {
      name: 'Carlos Silva',
      email: 'carlos@example.com',
      phone: '(11) 77777-7777',
      birthDate: '1992-03-10',
      address: 'Rua C, 789'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...newPatient, id: 3 }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useApiMutation('/api/patients'), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()

    result.current.mutate(newPatient)

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ ...newPatient, id: 3 })
    expect(result.current.error).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPatient),
    })
  })

  it('performs PUT mutation successfully', async () => {
    const updatedPatient = {
      ...mockPatient,
      name: 'João Silva Updated'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedPatient,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApiMutation('/api/patients/1', { method: 'PUT' }),
      { wrapper }
    )

    result.current.mutate(updatedPatient)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(updatedPatient)
    expect(mockFetch).toHaveBeenCalledWith('/api/patients/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPatient),
    })
  })

  it('performs DELETE mutation successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApiMutation('/api/patients/1', { method: 'DELETE' }),
      { wrapper }
    )

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ success: true })
    expect(mockFetch).toHaveBeenCalledWith('/api/patients/1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('handles mutation errors', async () => {
    const errorMessage = 'Validation failed'
    mockFetch.mockRejectedValueOnce(new Error(errorMessage))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useApiMutation('/api/patients'), { wrapper })

    result.current.mutate(mockPatient)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe(errorMessage)
  })

  it('supports mutation callbacks', async () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const onSettled = vi.fn()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockPatient, id: 3 }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApiMutation('/api/patients', {
        onSuccess,
        onError,
        onSettled,
      }),
      { wrapper }
    )

    result.current.mutate(mockPatient)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(onSuccess).toHaveBeenCalledWith({ ...mockPatient, id: 3 })
    expect(onError).not.toHaveBeenCalled()
    expect(onSettled).toHaveBeenCalled()
  })

  it('supports optimistic updates', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set initial cache data
    queryClient.setQueryData(['/api/patients'], mockPatients)

    const wrapper = ({ children }: { children: ReactNode }) => 
      createElement(QueryClientProvider, { client: queryClient }, children)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockPatient, id: 3 }),
    })

    const { result } = renderHook(
      () => useApiMutation('/api/patients', {
        onMutate: async (newPatient) => {
          // Cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey: ['/api/patients'] })

          // Snapshot previous value
          const previousPatients = queryClient.getQueryData(['/api/patients'])

          // Optimistically update
          queryClient.setQueryData(['/api/patients'], (old: any) => [
            ...old,
            { ...newPatient, id: Date.now() }
          ])

          return { previousPatients }
        },
        onError: (err, newPatient, context) => {
          // Rollback on error
          queryClient.setQueryData(['/api/patients'], context?.previousPatients)
        },
        onSettled: () => {
          // Refetch after mutation
          queryClient.invalidateQueries({ queryKey: ['/api/patients'] })
        },
      }),
      { wrapper }
    )

    result.current.mutate(mockPatient)

    // Should immediately show optimistic update
    const cacheData = queryClient.getQueryData(['/api/patients']) as any[]
    expect(cacheData.length).toBe(3)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('supports file upload mutations', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientId', '1')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, fileId: 'file123' }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApiMutation('/api/upload', {
        headers: {}, // Remove Content-Type for FormData
      }),
      { wrapper }
    )

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ success: true, fileId: 'file123' })
    expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  })

  it('supports mutation retry', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockPatient, id: 3 }),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(
      () => useApiMutation('/api/patients', { retry: 1 }),
      { wrapper }
    )

    result.current.mutate(mockPatient)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ ...mockPatient, id: 3 })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})