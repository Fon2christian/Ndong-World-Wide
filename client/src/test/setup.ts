import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock VITE_API_URL for all tests
beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:5002')
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => { const keys = Object.keys(store); return keys[index] || null },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  localStorageMock.clear()
})

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  })

  // Mock IntersectionObserver
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })
  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
})

// Clean up any remaining timers
afterAll(() => {
  vi.clearAllTimers()
})
