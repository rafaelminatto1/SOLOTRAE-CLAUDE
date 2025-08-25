import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatDateTime,
  formatDate,
  formatTime,
  formatCurrency,
  formatPhone,
  formatCPF,
  validateEmail,
  validatePhone,
  validateCPF,
  validatePassword,
  validateRequired,
  calculateAge,
  getInitials,
  truncateText,
  slugify,
  debounce,
  throttle,
  generateId,
  isValidDate,
  addDays,
  subtractDays,
  isSameDay,
  isToday,
  isTomorrow,
  isYesterday,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  formatRelativeTime,
  parseDateTime,
  sortByDate,
  groupByDate,
  filterByDateRange,
  capitalizeFirst,
  camelCase,
  kebabCase,
  snakeCase,
  removeAccents,
  sanitizeHtml,
  escapeRegex,
  isEmptyObject,
  deepClone,
  mergeObjects,
  pickProperties,
  omitProperties,
  arrayToObject,
  objectToArray,
  groupBy,
  unique,
  chunk,
  flatten,
  intersection,
  difference,
  union,
  shuffle,
  sample,
  range,
  sum,
  average,
  median,
  min,
  max,
  round,
  clamp,
  percentage,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isPdfFile,
  getMimeType,
  downloadFile,
  uploadFile,
  compressImage,
  resizeImage,
  generateQRCode,
  parseCSV,
  exportToCSV,
  exportToPDF,
  exportToExcel,
  printDocument,
  copyToClipboard,
  shareContent,
  getDeviceInfo,
  getBrowserInfo,
  getLocationInfo,
  detectMobile,
  detectTablet,
  detectDesktop,
  getScreenSize,
  isOnline,
  getNetworkInfo,
  vibrate,
  playSound,
  showNotification,
  requestPermission,
  getStorageInfo,
  clearStorage,
  encryptData,
  decryptData,
  hashData,
  generateToken,
  validateToken,
  formatApiError,
  retryRequest,
  cancelRequest,
  logError,
  logInfo,
  logWarning,
  logDebug
} from '../../utils'

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:30:00.000Z')

describe('Date and Time Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatDateTime(date)).toBe('15/01/2024 14:30')
    })

    it('handles custom format', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatDateTime(date, 'DD/MM/YYYY HH:mm:ss')).toBe('15/01/2024 14:30:00')
    })

    it('handles invalid date', () => {
      expect(formatDateTime(new Date('invalid'))).toBe('Data inválida')
    })

    it('handles null/undefined', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('handles different formats', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
      expect(formatDate(date, 'DD de MMMM de YYYY')).toBe('15 de janeiro de 2024')
    })
  })

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatTime(date)).toBe('14:30')
    })

    it('handles 12-hour format', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatTime(date, 'h:mm A')).toBe('2:30 PM')
    })
  })

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date('1990-01-15')
      expect(calculateAge(birthDate)).toBe(34)
    })

    it('handles future birth date', () => {
      const birthDate = new Date('2025-01-15')
      expect(calculateAge(birthDate)).toBe(0)
    })
  })

  describe('isValidDate', () => {
    it('validates valid dates', () => {
      expect(isValidDate(new Date())).toBe(true)
      expect(isValidDate(new Date('2024-01-15'))).toBe(true)
    })

    it('validates invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
    })
  })

  describe('date operations', () => {
    it('adds days correctly', () => {
      const date = new Date('2024-01-15')
      const result = addDays(date, 5)
      expect(formatDate(result)).toBe('20/01/2024')
    })

    it('subtracts days correctly', () => {
      const date = new Date('2024-01-15')
      const result = subtractDays(date, 5)
      expect(formatDate(result)).toBe('10/01/2024')
    })

    it('checks if same day', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T15:00:00')
      const date3 = new Date('2024-01-16T10:00:00')
      
      expect(isSameDay(date1, date2)).toBe(true)
      expect(isSameDay(date1, date3)).toBe(false)
    })

    it('checks if today', () => {
      expect(isToday(mockDate)).toBe(true)
      expect(isToday(new Date('2024-01-16'))).toBe(false)
    })
  })
})

describe('String Utils', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
      expect(formatCurrency(0)).toBe('R$ 0,00')
      expect(formatCurrency(-100)).toBe('-R$ 100,00')
    })

    it('handles different currencies', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$ 1,234.56')
      expect(formatCurrency(1234.56, 'EUR')).toBe('€ 1.234,56')
    })
  })

  describe('formatPhone', () => {
    it('formats phone numbers correctly', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('handles invalid phone numbers', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('')).toBe('')
    })
  })

  describe('formatCPF', () => {
    it('formats CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01')
    })

    it('handles invalid CPF', () => {
      expect(formatCPF('123')).toBe('123')
      expect(formatCPF('')).toBe('')
    })
  })

  describe('getInitials', () => {
    it('gets initials correctly', () => {
      expect(getInitials('João Silva')).toBe('JS')
      expect(getInitials('Maria da Silva Santos')).toBe('MS')
      expect(getInitials('Ana')).toBe('A')
    })

    it('handles empty string', () => {
      expect(getInitials('')).toBe('')
      expect(getInitials('   ')).toBe('')
    })
  })

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      const text = 'Este é um texto muito longo que precisa ser truncado'
      expect(truncateText(text, 20)).toBe('Este é um texto...')
    })

    it('does not truncate short text', () => {
      const text = 'Texto curto'
      expect(truncateText(text, 20)).toBe('Texto curto')
    })

    it('handles custom suffix', () => {
      const text = 'Texto longo'
      expect(truncateText(text, 5, ' [...]')).toBe('Texto [...]')
    })
  })

  describe('slugify', () => {
    it('creates slugs correctly', () => {
      expect(slugify('Título com Acentos')).toBe('titulo-com-acentos')
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
      expect(slugify('Special!@#$%Characters')).toBe('specialcharacters')
    })
  })

  describe('case conversions', () => {
    it('converts to camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld')
      expect(camelCase('hello-world')).toBe('helloWorld')
      expect(camelCase('hello_world')).toBe('helloWorld')
    })

    it('converts to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world')
      expect(kebabCase('hello world')).toBe('hello-world')
      expect(kebabCase('hello_world')).toBe('hello-world')
    })

    it('converts to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world')
      expect(snakeCase('hello world')).toBe('hello_world')
      expect(snakeCase('hello-world')).toBe('hello_world')
    })

    it('capitalizes first letter', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world')
      expect(capitalizeFirst('HELLO WORLD')).toBe('Hello world')
    })
  })

  describe('removeAccents', () => {
    it('removes accents correctly', () => {
      expect(removeAccents('João')).toBe('Joao')
      expect(removeAccents('São Paulo')).toBe('Sao Paulo')
      expect(removeAccents('Coração')).toBe('Coracao')
    })
  })
})

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('11987654321')).toBe(true)
      expect(validatePhone('(11) 98765-4321')).toBe(true)
      expect(validatePhone('+55 11 98765-4321')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validateCPF', () => {
    it('validates correct CPF', () => {
      expect(validateCPF('11144477735')).toBe(true)
      expect(validateCPF('111.444.777-35')).toBe(true)
    })

    it('rejects invalid CPF', () => {
      expect(validateCPF('12345678901')).toBe(false)
      expect(validateCPF('111.111.111-11')).toBe(false)
      expect(validateCPF('123')).toBe(false)
      expect(validateCPF('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true)
      expect(validatePassword('MyP@ssw0rd')).toBe(true)
    })

    it('rejects weak passwords', () => {
      expect(validatePassword('weak')).toBe(false)
      expect(validatePassword('12345678')).toBe(false)
      expect(validatePassword('password')).toBe(false)
      expect(validatePassword('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('validates required fields', () => {
      expect(validateRequired('value')).toBe(true)
      expect(validateRequired('0')).toBe(true)
      expect(validateRequired(0)).toBe(true)
      expect(validateRequired(false)).toBe(true)
    })

    it('rejects empty values', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })
  })
})

describe('Array Utils', () => {
  describe('unique', () => {
    it('removes duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })
  })

  describe('chunk', () => {
    it('chunks array correctly', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })
  })

  describe('flatten', () => {
    it('flattens nested arrays', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5])
      expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('groupBy', () => {
    it('groups array by key', () => {
      const data = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ]
      
      const result = groupBy(data, 'category')
      expect(result.A).toHaveLength(2)
      expect(result.B).toHaveLength(1)
    })
  })

  describe('shuffle', () => {
    it('shuffles array', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffle([...original])
      
      expect(shuffled).toHaveLength(original.length)
      expect(shuffled.sort()).toEqual(original.sort())
    })
  })

  describe('sample', () => {
    it('returns random sample', () => {
      const array = [1, 2, 3, 4, 5]
      const sampled = sample(array, 3)
      
      expect(sampled).toHaveLength(3)
      sampled.forEach(item => {
        expect(array).toContain(item)
      })
    })
  })
})

describe('Object Utils', () => {
  describe('isEmptyObject', () => {
    it('detects empty objects', () => {
      expect(isEmptyObject({})).toBe(true)
      expect(isEmptyObject({ a: 1 })).toBe(false)
      expect(isEmptyObject(null)).toBe(true)
      expect(isEmptyObject(undefined)).toBe(true)
    })
  })

  describe('deepClone', () => {
    it('clones objects deeply', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
    })
  })

  describe('mergeObjects', () => {
    it('merges objects correctly', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 3, c: 4 }
      
      expect(mergeObjects(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 })
    })
  })

  describe('pickProperties', () => {
    it('picks specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(pickProperties(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
    })
  })

  describe('omitProperties', () => {
    it('omits specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(omitProperties(obj, ['b'])).toEqual({ a: 1, c: 3 })
    })
  })
})

describe('Math Utils', () => {
  describe('sum', () => {
    it('calculates sum correctly', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15)
      expect(sum([])).toBe(0)
    })
  })

  describe('average', () => {
    it('calculates average correctly', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3)
      expect(average([2, 4, 6])).toBe(4)
    })
  })

  describe('median', () => {
    it('calculates median correctly', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3)
      expect(median([1, 2, 3, 4])).toBe(2.5)
    })
  })

  describe('clamp', () => {
    it('clamps values correctly', () => {
      expect(clamp(5, 1, 10)).toBe(5)
      expect(clamp(-5, 1, 10)).toBe(1)
      expect(clamp(15, 1, 10)).toBe(10)
    })
  })

  describe('percentage', () => {
    it('calculates percentage correctly', () => {
      expect(percentage(25, 100)).toBe(25)
      expect(percentage(1, 4)).toBe(25)
      expect(percentage(3, 4)).toBe(75)
    })
  })
})

describe('File Utils', () => {
  describe('formatFileSize', () => {
    it('formats file sizes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
      expect(formatFileSize(500)).toBe('500 B')
    })
  })

  describe('getFileExtension', () => {
    it('gets file extensions correctly', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.jpg')).toBe('jpg')
      expect(getFileExtension('file')).toBe('')
    })
  })

  describe('file type detection', () => {
    it('detects image files', () => {
      expect(isImageFile('photo.jpg')).toBe(true)
      expect(isImageFile('image.png')).toBe(true)
      expect(isImageFile('document.pdf')).toBe(false)
    })

    it('detects video files', () => {
      expect(isVideoFile('movie.mp4')).toBe(true)
      expect(isVideoFile('video.avi')).toBe(true)
      expect(isVideoFile('document.pdf')).toBe(false)
    })

    it('detects audio files', () => {
      expect(isAudioFile('song.mp3')).toBe(true)
      expect(isAudioFile('audio.wav')).toBe(true)
      expect(isAudioFile('document.pdf')).toBe(false)
    })

    it('detects PDF files', () => {
      expect(isPdfFile('document.pdf')).toBe(true)
      expect(isPdfFile('image.jpg')).toBe(false)
    })
  })
})

describe('Function Utils', () => {
  describe('debounce', () => {
    it('debounces function calls', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)
      
      debouncedFn()
      debouncedFn()
      debouncedFn()
      
      expect(fn).not.toHaveBeenCalled()
      
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    it('throttles function calls', async () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)
      
      throttledFn()
      throttledFn()
      throttledFn()
      
      expect(fn).toHaveBeenCalledTimes(1)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})

describe('ID Generation', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('generates IDs with specified length', () => {
      const id = generateId(10)
      expect(id).toHaveLength(10)
    })
  })
})

describe('Browser Utils', () => {
  describe('device detection', () => {
    it('detects mobile devices', () => {
      // Mock user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      })
      
      expect(detectMobile()).toBe(true)
    })

    it('detects desktop devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      })
      
      expect(detectDesktop()).toBe(true)
    })
  })

  describe('copyToClipboard', () => {
    it('copies text to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText
        }
      })
      
      await copyToClipboard('test text')
      expect(mockWriteText).toHaveBeenCalledWith('test text')
    })
  })
})

describe('Error Handling', () => {
  describe('formatApiError', () => {
    it('formats API errors correctly', () => {
      const error = {
        status: 400,
        message: 'Bad Request',
        details: 'Invalid input'
      }
      
      const formatted = formatApiError(error)
      expect(formatted).toContain('400')
      expect(formatted).toContain('Bad Request')
    })
  })

  describe('logging functions', () => {
    it('logs errors correctly', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      logError('Test error', { context: 'test' })
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('logs info correctly', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      logInfo('Test info')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })
})