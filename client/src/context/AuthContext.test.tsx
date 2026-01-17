import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should initialize with isAdmin false when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.isAdmin).toBe(false)
    })

    it('should initialize with isAdmin true when localStorage has admin session', () => {
      localStorage.setItem('isAdmin', 'true')
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.isAdmin).toBe(true)
    })

    it('should initialize with isAdmin false when localStorage has invalid value', () => {
      localStorage.setItem('isAdmin', 'invalid')
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.isAdmin).toBe(false)
    })
  })

  describe('login', () => {
    it('should return true and set isAdmin on valid credentials', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: boolean
      act(() => {
        loginResult = result.current.login('admin', 'admin123')
      })

      expect(loginResult!).toBe(true)
      expect(result.current.isAdmin).toBe(true)
      expect(localStorage.getItem('isAdmin')).toBe('true')
    })

    it('should return false and keep isAdmin false on invalid username', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: boolean
      act(() => {
        loginResult = result.current.login('wronguser', 'admin123')
      })

      expect(loginResult!).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(localStorage.getItem('isAdmin')).toBeNull()
    })

    it('should return false and keep isAdmin false on invalid password', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: boolean
      act(() => {
        loginResult = result.current.login('admin', 'wrongpassword')
      })

      expect(loginResult!).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(localStorage.getItem('isAdmin')).toBeNull()
    })

    it('should return false on empty credentials', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult: boolean
      act(() => {
        loginResult = result.current.login('', '')
      })

      expect(loginResult!).toBe(false)
      expect(result.current.isAdmin).toBe(false)
    })
  })

  describe('logout', () => {
    it('should set isAdmin to false and clear localStorage', () => {
      localStorage.setItem('isAdmin', 'true')
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAdmin).toBe(true)

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAdmin).toBe(false)
      expect(localStorage.getItem('isAdmin')).toBeNull()
    })

    it('should work even if not logged in', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAdmin).toBe(false)
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })
})
