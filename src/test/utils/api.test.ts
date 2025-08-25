import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  apiClient,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
  refreshToken,
  makeRequest,
  get,
  post,
  put,
  patch,
  del,
  upload,
  download,
  ApiError,
  isApiError,
  handleApiError,
  retryRequest,
  cancelRequest,
  createAbortController,
  setBaseURL,
  getBaseURL,
  setDefaultHeaders,
  getDefaultHeaders,
  addRequestInterceptor,
  addResponseInterceptor,
  removeInterceptor,
  clearInterceptors,
  enableRequestLogging,
  disableRequestLogging,
  getRequestStats,
  clearRequestStats,
  setRequestTimeout,
  getRequestTimeout,
  enableRetry,
  disableRetry,
  setRetryConfig,
  getRetryConfig,
  createApiInstance,
  destroyApiInstance,
  getApiInstances,
  validateResponse,
  transformRequest,
  transformResponse,
  serializeParams,
  deserializeResponse,
  buildUrl,
  parseUrl,
  encodeParams,
  decodeParams,
  createFormData,
  parseFormData,
  createQueryString,
  parseQueryString,
  normalizeHeaders,
  mergeHeaders,
  filterHeaders,
  sanitizeHeaders,
  validateHeaders,
  createCacheKey,
  getCachedResponse,
  setCachedResponse,
  clearCache,
  isCacheValid,
  getCacheStats,
  enableCache,
  disableCache,
  setCacheConfig,
  getCacheConfig
} from '../../utils/api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

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

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}
Object.defineProperty(console, 'log', { value: mockConsole.log })
Object.defineProperty(console, 'error', { value: mockConsole.error })
Object.defineProperty(console, 'warn', { value: mockConsole.warn })
Object.defineProperty(console, 'info', { value: mockConsole.info })

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuthToken()
    clearInterceptors()
    clearCache()
    clearRequestStats()
    setBaseURL('http://localhost:3000/api')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Configuration', () => {
    it('sets and gets base URL', () => {
      const baseUrl = 'https://api.example.com'
      setBaseURL(baseUrl)
      expect(getBaseURL()).toBe(baseUrl)
    })

    it('sets and gets default headers', () => {
      const headers = { 'Content-Type': 'application/json' }
      setDefaultHeaders(headers)
      expect(getDefaultHeaders()).toEqual(headers)
    })

    it('sets and gets request timeout', () => {
      const timeout = 5000
      setRequestTimeout(timeout)
      expect(getRequestTimeout()).toBe(timeout)
    })

    it('enables and disables request logging', () => {
      enableRequestLogging()
      expect(getRequestStats().loggingEnabled).toBe(true)
      
      disableRequestLogging()
      expect(getRequestStats().loggingEnabled).toBe(false)
    })

    it('configures retry settings', () => {
      const retryConfig = {
        maxRetries: 3,
        retryDelay: 1000,
        retryCondition: (error: any) => error.status >= 500
      }
      
      setRetryConfig(retryConfig)
      expect(getRetryConfig()).toEqual(retryConfig)
    })
  })

  describe('Authentication', () => {
    it('sets and gets auth token', () => {
      const token = 'test-token-123'
      setAuthToken(token)
      expect(getAuthToken()).toBe(token)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', token)
    })

    it('clears auth token', () => {
      setAuthToken('test-token')
      clearAuthToken()
      expect(getAuthToken()).toBeNull()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('loads token from localStorage on initialization', () => {
      const token = 'stored-token'
      mockLocalStorage.getItem.mockReturnValue(token)
      
      // Reinitialize to load from storage
      expect(getAuthToken()).toBe(token)
    })

    it('refreshes auth token', async () => {
      const newToken = 'new-token-123'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: newToken })
      })

      const result = await refreshToken()
      expect(result).toBe(newToken)
      expect(getAuthToken()).toBe(newToken)
    })

    it('handles refresh token failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid refresh token' })
      })

      await expect(refreshToken()).rejects.toThrow('Invalid refresh token')
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('HTTP Methods', () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'test' })
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue(mockResponse)
    })

    it('makes GET requests', async () => {
      const result = await get('/users')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      )
      expect(result).toEqual({ data: 'test' })
    })

    it('makes POST requests', async () => {
      const data = { name: 'John', email: 'john@example.com' }
      const result = await post('/users', data)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(data)
        })
      )
      expect(result).toEqual({ data: 'test' })
    })

    it('makes PUT requests', async () => {
      const data = { id: 1, name: 'John Updated' }
      await put('/users/1', data)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      )
    })

    it('makes PATCH requests', async () => {
      const data = { name: 'John Patched' }
      await patch('/users/1', data)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data)
        })
      )
    })

    it('makes DELETE requests', async () => {
      await del('/users/1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('handles query parameters', async () => {
      await get('/users', { params: { page: 1, limit: 10 } })
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users?page=1&limit=10',
        expect.any(Object)
      )
    })

    it('handles custom headers', async () => {
      const customHeaders = { 'X-Custom-Header': 'custom-value' }
      await get('/users', { headers: customHeaders })
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders)
        })
      )
    })

    it('includes auth token in requests', async () => {
      const token = 'auth-token-123'
      setAuthToken(token)
      
      await get('/users')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`
          })
        })
      )
    })
  })

  describe('File Upload/Download', () => {
    it('uploads files', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', file)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ fileId: '123', url: '/files/123' })
      })

      const result = await upload('/upload', formData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData
        })
      )
      expect(result).toEqual({ fileId: '123', url: '/files/123' })
    })

    it('downloads files', async () => {
      const mockBlob = new Blob(['file content'], { type: 'text/plain' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: async () => mockBlob
      })

      const result = await download('/files/123')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/files/123',
        expect.objectContaining({
          method: 'GET'
        })
      )
      expect(result).toBe(mockBlob)
    })
  })

  describe('Error Handling', () => {
    it('handles HTTP errors', async () => {
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'User not found' })
      }
      mockFetch.mockResolvedValueOnce(errorResponse)

      await expect(get('/users/999')).rejects.toThrow('User not found')
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(get('/users')).rejects.toThrow('Network error')
    })

    it('creates ApiError instances', () => {
      const error = new ApiError('Test error', 400, { detail: 'Bad request' })
      
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(400)
      expect(error.data).toEqual({ detail: 'Bad request' })
      expect(isApiError(error)).toBe(true)
    })

    it('handles API errors correctly', () => {
      const apiError = new ApiError('API Error', 500)
      const networkError = new Error('Network Error')
      
      expect(handleApiError(apiError)).toContain('API Error')
      expect(handleApiError(networkError)).toContain('Network Error')
    })
  })

  describe('Request Interceptors', () => {
    it('adds and executes request interceptors', async () => {
      const interceptor = vi.fn((config) => {
        config.headers = { ...config.headers, 'X-Intercepted': 'true' }
        return config
      })
      
      const interceptorId = addRequestInterceptor(interceptor)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await get('/test')
      
      expect(interceptor).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Intercepted': 'true'
          })
        })
      )
      
      removeInterceptor(interceptorId)
    })

    it('removes request interceptors', async () => {
      const interceptor = vi.fn((config) => config)
      const interceptorId = addRequestInterceptor(interceptor)
      
      removeInterceptor(interceptorId)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await get('/test')
      
      expect(interceptor).not.toHaveBeenCalled()
    })
  })

  describe('Response Interceptors', () => {
    it('adds and executes response interceptors', async () => {
      const interceptor = vi.fn((response) => {
        response.intercepted = true
        return response
      })
      
      addResponseInterceptor(interceptor)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      const result = await get('/test')
      
      expect(interceptor).toHaveBeenCalled()
      expect(result.intercepted).toBe(true)
    })
  })

  describe('Request Cancellation', () => {
    it('creates abort controllers', () => {
      const controller = createAbortController()
      expect(controller).toBeInstanceOf(AbortController)
    })

    it('cancels requests', async () => {
      const controller = createAbortController()
      
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100)
        })
      )

      const requestPromise = get('/test', { signal: controller.signal })
      
      setTimeout(() => controller.abort(), 50)
      
      await expect(requestPromise).rejects.toThrow()
    })

    it('cancels requests by ID', async () => {
      const requestId = 'test-request-123'
      
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100)
        })
      )

      const requestPromise = get('/test', { requestId })
      
      setTimeout(() => cancelRequest(requestId), 50)
      
      await expect(requestPromise).rejects.toThrow()
    })
  })

  describe('Request Retry', () => {
    it('retries failed requests', async () => {
      enableRetry()
      setRetryConfig({ maxRetries: 2, retryDelay: 100 })
      
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' })
        })

      const result = await get('/test')
      
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ data: 'success' })
    })

    it('respects retry conditions', async () => {
      enableRetry()
      setRetryConfig({
        maxRetries: 2,
        retryDelay: 100,
        retryCondition: (error) => error.status >= 500
      })
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' })
      })

      await expect(get('/test')).rejects.toThrow()
      expect(mockFetch).toHaveBeenCalledTimes(1) // No retry for 400 error
    })
  })

  describe('Caching', () => {
    it('enables and disables caching', () => {
      enableCache()
      expect(getCacheConfig().enabled).toBe(true)
      
      disableCache()
      expect(getCacheConfig().enabled).toBe(false)
    })

    it('caches GET requests', async () => {
      enableCache()
      
      const responseData = { data: 'cached' }
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => responseData
      })

      // First request
      const result1 = await get('/test')
      expect(result1).toEqual(responseData)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      
      // Second request should use cache
      const result2 = await get('/test')
      expect(result2).toEqual(responseData)
      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional fetch
    })

    it('creates cache keys correctly', () => {
      const key1 = createCacheKey('GET', '/users', { page: 1 })
      const key2 = createCacheKey('GET', '/users', { page: 2 })
      const key3 = createCacheKey('POST', '/users', { page: 1 })
      
      expect(key1).toBeDefined()
      expect(key1).not.toBe(key2)
      expect(key1).not.toBe(key3)
    })

    it('validates cache expiration', () => {
      const validCache = {
        data: { test: 'data' },
        timestamp: Date.now(),
        ttl: 60000 // 1 minute
      }
      
      const expiredCache = {
        data: { test: 'data' },
        timestamp: Date.now() - 120000, // 2 minutes ago
        ttl: 60000 // 1 minute
      }
      
      expect(isCacheValid(validCache)).toBe(true)
      expect(isCacheValid(expiredCache)).toBe(false)
    })

    it('clears cache', () => {
      setCachedResponse('test-key', { data: 'test' })
      expect(getCachedResponse('test-key')).toBeDefined()
      
      clearCache()
      expect(getCachedResponse('test-key')).toBeNull()
    })
  })

  describe('Request Statistics', () => {
    it('tracks request statistics', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await get('/test1')
      await post('/test2', {})
      
      const stats = getRequestStats()
      expect(stats.totalRequests).toBe(2)
      expect(stats.successfulRequests).toBe(2)
      expect(stats.failedRequests).toBe(0)
    })

    it('tracks failed requests', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      try {
        await get('/test')
      } catch (error) {
        // Expected error
      }
      
      const stats = getRequestStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.successfulRequests).toBe(0)
      expect(stats.failedRequests).toBe(1)
    })

    it('clears request statistics', () => {
      // Make some requests first
      getRequestStats().totalRequests = 5
      
      clearRequestStats()
      
      const stats = getRequestStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.successfulRequests).toBe(0)
      expect(stats.failedRequests).toBe(0)
    })
  })

  describe('API Instances', () => {
    it('creates multiple API instances', () => {
      const instance1 = createApiInstance('api1', {
        baseURL: 'https://api1.example.com',
        timeout: 5000
      })
      
      const instance2 = createApiInstance('api2', {
        baseURL: 'https://api2.example.com',
        timeout: 10000
      })
      
      expect(instance1).toBeDefined()
      expect(instance2).toBeDefined()
      expect(instance1).not.toBe(instance2)
      
      const instances = getApiInstances()
      expect(instances.api1).toBe(instance1)
      expect(instances.api2).toBe(instance2)
    })

    it('destroys API instances', () => {
      createApiInstance('test', { baseURL: 'https://test.com' })
      expect(getApiInstances().test).toBeDefined()
      
      destroyApiInstance('test')
      expect(getApiInstances().test).toBeUndefined()
    })
  })

  describe('Utility Functions', () => {
    it('builds URLs correctly', () => {
      expect(buildUrl('/users', { page: 1, limit: 10 })).toBe('/users?page=1&limit=10')
      expect(buildUrl('/users?existing=true', { page: 1 })).toBe('/users?existing=true&page=1')
    })

    it('parses URLs correctly', () => {
      const parsed = parseUrl('/users?page=1&limit=10')
      expect(parsed.pathname).toBe('/users')
      expect(parsed.params).toEqual({ page: '1', limit: '10' })
    })

    it('creates query strings', () => {
      expect(createQueryString({ page: 1, limit: 10 })).toBe('page=1&limit=10')
      expect(createQueryString({})).toBe('')
    })

    it('parses query strings', () => {
      expect(parseQueryString('page=1&limit=10')).toEqual({ page: '1', limit: '10' })
      expect(parseQueryString('')).toEqual({})
    })

    it('normalizes headers', () => {
      const headers = {
        'content-type': 'application/json',
        'AUTHORIZATION': 'Bearer token'
      }
      
      const normalized = normalizeHeaders(headers)
      expect(normalized['Content-Type']).toBe('application/json')
      expect(normalized['Authorization']).toBe('Bearer token')
    })

    it('merges headers correctly', () => {
      const headers1 = { 'Content-Type': 'application/json' }
      const headers2 = { 'Authorization': 'Bearer token' }
      
      const merged = mergeHeaders(headers1, headers2)
      expect(merged).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      })
    })

    it('validates responses', () => {
      const validResponse = {
        ok: true,
        status: 200,
        headers: new Headers()
      }
      
      const invalidResponse = {
        ok: false,
        status: 400,
        headers: new Headers()
      }
      
      expect(validateResponse(validResponse)).toBe(true)
      expect(validateResponse(invalidResponse)).toBe(false)
    })

    it('transforms requests and responses', () => {
      const requestData = { name: 'John' }
      const responseData = { id: 1, name: 'John' }
      
      const transformedRequest = transformRequest(requestData)
      const transformedResponse = transformResponse(responseData)
      
      expect(transformedRequest).toBeDefined()
      expect(transformedResponse).toBeDefined()
    })
  })
})