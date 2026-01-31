import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './LanguageContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should default to English when localStorage is empty', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('en')
    })

    it('should restore English from localStorage', () => {
      localStorage.setItem('language', 'en')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('en')
    })

    it('should restore French from localStorage', () => {
      localStorage.setItem('language', 'fr')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('fr')
    })

    it('should restore Japanese from localStorage', () => {
      localStorage.setItem('language', 'ja')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('ja')
    })

    it('should default to English when localStorage has invalid value', () => {
      localStorage.setItem('language', 'invalid')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('en')
    })

    it('should default to English when localStorage has empty string', () => {
      localStorage.setItem('language', '')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('en')
    })
  })

  describe('setLanguage', () => {
    it('should change language to French', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('fr')
      })

      expect(result.current.language).toBe('fr')
      expect(localStorage.getItem('language')).toBe('fr')
    })

    it('should change language to Japanese', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('ja')
      })

      expect(result.current.language).toBe('ja')
      expect(localStorage.getItem('language')).toBe('ja')
    })

    it('should change language back to English', () => {
      localStorage.setItem('language', 'fr')
      const { result } = renderHook(() => useLanguage(), { wrapper })

      act(() => {
        result.current.setLanguage('en')
      })

      expect(result.current.language).toBe('en')
      expect(localStorage.getItem('language')).toBe('en')
    })
  })

  describe('translations', () => {
    it('should provide English translations', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t.nav.home).toBe('Home')
      expect(result.current.t.nav.market).toBe('Market')
      expect(result.current.t.hero.welcome).toBe('Welcome to Ndong World Wide Trading')
    })

    it('should provide French translations', () => {
      localStorage.setItem('language', 'fr')
      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t.nav.home).toBe('Accueil')
      expect(result.current.t.nav.market).toBe('Marché')
      expect(result.current.t.hero.welcome).toBe('Bienvenue chez Ndong World Wide Trading')
    })

    it('should provide Japanese translations', () => {
      localStorage.setItem('language', 'ja')
      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t.nav.home).toBe('ホーム')
      expect(result.current.t.nav.market).toBe('マーケット')
      expect(result.current.t.hero.welcome).toBe('Ndong World Wide Tradingへようこそ')
    })

    it('should update translations when language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })

      expect(result.current.t.nav.home).toBe('Home')

      act(() => {
        result.current.setLanguage('fr')
      })

      expect(result.current.t.nav.home).toBe('Accueil')
    })
  })

  describe('useLanguage hook', () => {
    it('should throw error when used outside LanguageProvider', () => {
      expect(() => {
        renderHook(() => useLanguage())
      }).toThrow('useLanguage must be used within a LanguageProvider')
    })
  })
})
