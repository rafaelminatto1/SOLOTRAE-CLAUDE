import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode, createElement } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { ThemeProvider } from '../../contexts/ThemeContext'

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

// Mock matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia
})

// Test wrapper
const wrapper = ({ children }: { children: ReactNode }) => 
  createElement(ThemeProvider, null, children)

describe('useTheme Hook', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockMatchMedia.mockClear()
    
    // Default matchMedia mock
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('initializes with light theme by default', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('initializes with saved theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('initializes with system preference when no saved theme', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    mockMatchMedia.mockReturnValue({
      matches: true, // System prefers dark
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('switches to dark theme', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('switches to light theme', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('toggles theme', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('sets system theme preference', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('system')
    })

    expect(result.current.theme).toBe('system')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'system')
  })

  it('follows system preference when theme is set to system', () => {
    mockLocalStorage.getItem.mockReturnValue('system')
    
    // Mock system preference as light
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('responds to system theme changes', () => {
    mockLocalStorage.getItem.mockReturnValue('system')
    
    let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.resolvedTheme).toBe('light')

    // Simulate system theme change to dark
    act(() => {
      if (mediaQueryCallback) {
        mediaQueryCallback({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current.resolvedTheme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('provides theme colors and CSS variables', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.colors).toBeDefined()
    expect(result.current.colors.primary).toBeDefined()
    expect(result.current.colors.secondary).toBeDefined()
    expect(result.current.colors.background).toBeDefined()
    expect(result.current.colors.foreground).toBeDefined()
  })

  it('updates CSS custom properties when theme changes', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    // Check if CSS custom properties are set
    const rootStyle = getComputedStyle(document.documentElement)
    expect(document.documentElement.style.getPropertyValue('--primary')).toBeDefined()
  })

  it('supports custom theme colors', () => {
    const customColors = {
      primary: '#ff0000',
      secondary: '#00ff00',
      accent: '#0000ff'
    }

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setCustomColors(customColors)
    })

    expect(result.current.colors.primary).toBe('#ff0000')
    expect(result.current.colors.secondary).toBe('#00ff00')
    expect(result.current.colors.accent).toBe('#0000ff')
  })

  it('resets to default colors', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    // First set custom colors
    act(() => {
      result.current.setCustomColors({ primary: '#ff0000' })
    })

    expect(result.current.colors.primary).toBe('#ff0000')

    // Then reset
    act(() => {
      result.current.resetColors()
    })

    expect(result.current.colors.primary).not.toBe('#ff0000')
  })

  it('provides theme-aware utility functions', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    // Test light theme utilities
    expect(result.current.getContrastColor('#ffffff')).toBe('#000000')
    expect(result.current.getContrastColor('#000000')).toBe('#ffffff')

    // Test theme-specific class names
    expect(result.current.getThemeClass('bg-white', 'bg-gray-900')).toBe('bg-white')

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.getThemeClass('bg-white', 'bg-gray-900')).toBe('bg-gray-900')
  })

  it('supports theme transitions', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setThemeTransition(true)
    })

    expect(document.documentElement.classList.contains('theme-transition')).toBe(true)

    act(() => {
      result.current.setThemeTransition(false)
    })

    expect(document.documentElement.classList.contains('theme-transition')).toBe(false)
  })

  it('handles theme persistence correctly', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    // Test saving theme
    act(() => {
      result.current.setTheme('dark')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')

    // Test clearing saved theme
    act(() => {
      result.current.clearSavedTheme()
    })

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme')
  })

  it('provides theme metadata', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.themeMetadata).toBeDefined()
    expect(result.current.themeMetadata.name).toBeDefined()
    expect(result.current.themeMetadata.description).toBeDefined()

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.themeMetadata.name).toBe('Dark')
  })

  it('supports high contrast mode', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setHighContrast(true)
    })

    expect(result.current.isHighContrast).toBe(true)
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true)

    act(() => {
      result.current.setHighContrast(false)
    })

    expect(result.current.isHighContrast).toBe(false)
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
  })

  it('supports reduced motion preference', () => {
    // Mock reduced motion preference
    const mockReducedMotionQuery = {
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }

    mockMatchMedia.mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mockReducedMotionQuery
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.prefersReducedMotion).toBe(true)
  })

  it('handles theme loading states', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.setTheme('dark')
    })

    // Theme changes should be synchronous
    expect(result.current.isLoading).toBe(false)
    expect(result.current.theme).toBe('dark')
  })

  it('provides theme validation', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.isValidTheme('light')).toBe(true)
    expect(result.current.isValidTheme('dark')).toBe(true)
    expect(result.current.isValidTheme('system')).toBe(true)
    expect(result.current.isValidTheme('invalid')).toBe(false)
  })

  it('supports theme events and callbacks', () => {
    const onThemeChange = vi.fn()

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.onThemeChange(onThemeChange)
    })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(onThemeChange).toHaveBeenCalledWith('dark', 'light')
  })
})