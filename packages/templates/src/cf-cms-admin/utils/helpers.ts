/**
 * CF-CMS.js Utility Functions
 * 
 * Helper functions for template rendering, validation, and common operations
 */

// ============================================================================
// String Utilities
// ============================================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function camelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

export function kebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function truncate(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) return text
  return text.substring(0, length - suffix.length) + suffix
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function unescapeHtml(text: string): string {
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || div.innerText || ''
}

// ============================================================================
// Date Utilities
// ============================================================================

export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function timeAgo(date: Date | string): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
}

export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

// ============================================================================
// Number Utilities
// ============================================================================

export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function clamp(number: number, min: number, max: number): number {
  return Math.min(Math.max(number, min), max)
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// ============================================================================
// Array Utilities
// ============================================================================

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item)
  }, [])
}

// ============================================================================
// Object Utilities
// ============================================================================

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()
  
  if (source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {} as any
        deepMerge(target[key], source[key])
      } else {
        target[key] = source[key] as any
      }
    }
  }
  
  return deepMerge(target, ...sources)
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function isUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(password)
}

export function isValidJSON(json: string): boolean {
  try {
    JSON.parse(json)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Color Utilities
// ============================================================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const factor = percent / 100
  const r = Math.round(rgb.r + (255 - rgb.r) * factor)
  const g = Math.round(rgb.g + (255 - rgb.g) * factor)
  const b = Math.round(rgb.b + (255 - rgb.b) * factor)
  
  return rgbToHex(r, g, b)
}

export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const factor = percent / 100
  const r = Math.round(rgb.r * (1 - factor))
  const g = Math.round(rgb.g * (1 - factor))
  const b = Math.round(rgb.b * (1 - factor))
  
  return rgbToHex(r, g, b)
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000000'
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// ============================================================================
// Storage Utilities
// ============================================================================

export function storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type]
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function setStorageItem(key: string, value: any, type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
  if (!storageAvailable(type)) return false
  
  try {
    const storage = window[type]
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function getStorageItem<T>(key: string, defaultValue: T, type: 'localStorage' | 'sessionStorage' = 'localStorage'): T {
  if (!storageAvailable(type)) return defaultValue
  
  try {
    const storage = window[type]
    const item = storage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function removeStorageItem(key: string, type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
  if (!storageAvailable(type)) return false
  
  try {
    const storage = window[type]
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function clearStorage(type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
  if (!storageAvailable(type)) return false
  
  try {
    const storage = window[type]
    storage.clear()
    return true
  } catch {
    return false
  }
}

// ============================================================================
// URL Utilities
// ============================================================================

export function getQueryParams(url?: string): Record<string, string> {
  const urlString = url || window.location.href
  const urlObj = new URL(urlString)
  const params: Record<string, string> = {}
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

export function setQueryParam(key: string, value: string, url?: string): string {
  const urlString = url || window.location.href
  const urlObj = new URL(urlString)
  urlObj.searchParams.set(key, value)
  return urlObj.toString()
}

export function removeQueryParam(key: string, url?: string): string {
  const urlString = url || window.location.href
  const urlObj = new URL(urlString)
  urlObj.searchParams.delete(key)
  return urlObj.toString()
}

export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, base)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  return url.toString()
}

// ============================================================================
// Device/Browser Utilities
// ============================================================================

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isTablet(): boolean {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
}

export function isDesktop(): boolean {
  return !isMobile() && !isTablet()
}

export function getBrowser(): string {
  const userAgent = navigator.userAgent
  
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox'
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome'
  if (userAgent.indexOf('Safari') > -1) return 'Safari'
  if (userAgent.indexOf('Edge') > -1) return 'Edge'
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera'
  
  return 'Unknown'
}

export function getOS(): string {
  const userAgent = navigator.userAgent
  
  if (userAgent.indexOf('Windows') > -1) return 'Windows'
  if (userAgent.indexOf('Mac') > -1) return 'macOS'
  if (userAgent.indexOf('Linux') > -1) return 'Linux'
  if (userAgent.indexOf('Android') > -1) return 'Android'
  if (userAgent.indexOf('iOS') > -1) return 'iOS'
  
  return 'Unknown'
}

// ============================================================================
// Debounce and Throttle
// ============================================================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// ============================================================================
// Event Utilities
// ============================================================================

export function addEventListeners(
  element: Element | Window | Document,
  events: Record<string, EventListener>
): void {
  Object.entries(events).forEach(([event, handler]) => {
    element.addEventListener(event, handler)
  })
}

export function removeEventListeners(
  element: Element | Window | Document,
  events: Record<string, EventListener>
): void {
  Object.entries(events).forEach(([event, handler]) => {
    element.removeEventListener(event, handler)
  })
}

export function dispatchCustomEvent(element: Element, eventName: string, detail?: any): void {
  const event = new CustomEvent(eventName, { detail })
  element.dispatchEvent(event)
}

// ============================================================================
// Class Utilities
// ============================================================================

export function addClass(element: Element, className: string): void {
  element.classList.add(className)
}

export function removeClass(element: Element, className: string): void {
  element.classList.remove(className)
}

export function toggleClass(element: Element, className: string): void {
  element.classList.toggle(className)
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className)
}

export function setAttributes(element: Element, attributes: Record<string, string>): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

// ============================================================================
// Animation Utilities
// ============================================================================

export function animate(
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation {
  return element.animate(keyframes, options)
}

export function fadeIn(element: Element, duration = 300): Promise<void> {
  return new Promise(resolve => {
    element.style.opacity = '0'
    element.style.display = 'block'
    
    const animation = element.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration,
      easing: 'ease-in-out'
    })
    
    animation.onfinish = () => {
      element.style.opacity = '1'
      resolve()
    }
  })
}

export function fadeOut(element: Element, duration = 300): Promise<void> {
  return new Promise(resolve => {
    const animation = element.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration,
      easing: 'ease-in-out'
    })
    
    animation.onfinish = () => {
      element.style.display = 'none'
      element.style.opacity = '0'
      resolve()
    }
  })
}

export function slideIn(element: Element, direction: 'up' | 'down' | 'left' | 'right' = 'down', duration = 300): Promise<void> {
  return new Promise(resolve => {
    const transforms = {
      up: 'translateY(-20px)',
      down: 'translateY(20px)',
      left: 'translateX(-20px)',
      right: 'translateX(20px)'
    }
    
    element.style.transform = transforms[direction]
    element.style.opacity = '0'
    element.style.display = 'block'
    
    const animation = element.animate([
      { transform: transforms[direction], opacity: 0 },
      { transform: 'translate(0)', opacity: 1 }
    ], {
      duration,
      easing: 'ease-out'
    })
    
    animation.onfinish = () => {
      element.style.transform = 'translate(0)'
      element.style.opacity = '1'
      resolve()
    }
  })
}