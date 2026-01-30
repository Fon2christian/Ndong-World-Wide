import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import LanguageSwitcher from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('rendering', () => {
    it('should render toggle button with aria-label', () => {
      render(<LanguageSwitcher />)
      expect(screen.getByLabelText('Select language')).toBeInTheDocument()
    })

    it('should display English flag and name by default', () => {
      render(<LanguageSwitcher />)
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should display French flag and name when French is selected', () => {
      localStorage.setItem('language', 'fr')
      render(<LanguageSwitcher />)
      expect(screen.getByText('Français')).toBeInTheDocument()
    })

    it('should display Japanese flag and name when Japanese is selected', () => {
      localStorage.setItem('language', 'ja')
      render(<LanguageSwitcher />)
      expect(screen.getByText('日本語')).toBeInTheDocument()
    })
  })

  describe('dropdown behavior', () => {
    it('should not show dropdown initially', () => {
      render(<LanguageSwitcher />)
      // Dropdown options should not be visible initially
      const dropdownOptions = screen.queryAllByRole('button').filter(
        btn => btn.className.includes('option')
      )
      expect(dropdownOptions.length).toBe(0)
    })

    it('should show dropdown when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)

      await user.click(screen.getByLabelText('Select language'))

      // Should show all three language options
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
    })

    it('should close dropdown when option is selected', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)

      // Open dropdown
      await user.click(screen.getByLabelText('Select language'))

      // Find and click French option
      const frenchButton = screen.getByText('Français')
      await user.click(frenchButton)

      // Verify language changed
      expect(localStorage.getItem('language')).toBe('fr')
    })
  })

  describe('language selection', () => {
    it('should change to French when French option is clicked', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)

      // Open dropdown
      await user.click(screen.getByLabelText('Select language'))

      // Find and click French option
      const frenchButton = screen.getByText('Français')
      await user.click(frenchButton)

      expect(localStorage.getItem('language')).toBe('fr')
    })

    it('should change to Japanese when Japanese option is clicked', async () => {
      const user = userEvent.setup()
      render(<LanguageSwitcher />)

      // Open dropdown
      await user.click(screen.getByLabelText('Select language'))

      // Find and click Japanese option
      const japaneseButton = screen.getByText('日本語')
      await user.click(japaneseButton)

      expect(localStorage.getItem('language')).toBe('ja')
    })

    it('should change back to English when English option is clicked', async () => {
      localStorage.setItem('language', 'fr')
      const user = userEvent.setup()
      render(<LanguageSwitcher />)

      // Open dropdown
      await user.click(screen.getByLabelText('Select language'))

      // Find and click English option
      const englishButton = screen.getByText('English')
      await user.click(englishButton)

      expect(localStorage.getItem('language')).toBe('en')
    })
  })
})
