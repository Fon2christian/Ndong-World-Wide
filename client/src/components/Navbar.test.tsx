import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Navbar from './Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('rendering', () => {
    it('should render the logo', () => {
      render(<Navbar />)
      expect(screen.getByText('NW')).toBeInTheDocument()
      expect(screen.getByText('Ndong World Wide Trading')).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      render(<Navbar />)
      // Both desktop and mobile nav have these links
      const homeLinks = screen.getAllByRole('link', { name: /home/i })
      const marketLinks = screen.getAllByRole('link', { name: /market/i })
      expect(homeLinks.length).toBeGreaterThanOrEqual(1)
      expect(marketLinks.length).toBeGreaterThanOrEqual(1)
    })

    it('should render language switcher', () => {
      render(<Navbar />)
      expect(screen.getByLabelText('Select language')).toBeInTheDocument()
    })

    it('should render Admin Login button when not logged in', () => {
      render(<Navbar />)
      // Both desktop and mobile nav have admin login link
      const adminLoginLinks = screen.getAllByRole('link', { name: /admin login/i })
      expect(adminLoginLinks.length).toBeGreaterThanOrEqual(1)
    })

    it('should render Dashboard button when logged in', () => {
      localStorage.setItem('isAdmin', 'true')
      render(<Navbar />)
      // Both desktop and mobile nav have dashboard link
      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i })
      expect(dashboardLinks.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('navigation links', () => {
    it('should have correct href for Home link', () => {
      render(<Navbar />)
      // Get first home link (desktop version)
      const homeLinks = screen.getAllByRole('link', { name: /home/i })
      expect(homeLinks[0]).toHaveAttribute('href', '/')
    })

    it('should have correct href for Market link', () => {
      render(<Navbar />)
      // Get first market link (desktop version)
      const marketLinks = screen.getAllByRole('link', { name: /market/i })
      expect(marketLinks[0]).toHaveAttribute('href', '/market')
    })

    it('should have correct href for Admin Login link', () => {
      render(<Navbar />)
      // Get first admin login link (desktop version)
      const loginLinks = screen.getAllByRole('link', { name: /admin login/i })
      expect(loginLinks[0]).toHaveAttribute('href', '/login')
    })
  })

  describe('mobile menu', () => {
    it('should render mobile menu toggle button', () => {
      render(<Navbar />)
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
    })

    it('should toggle mobile menu on click', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const toggleButton = screen.getByLabelText('Toggle menu')

      // Initially closed
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')

      // Click to open
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

      // Click to close
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('admin state', () => {
    it('should show Admin link in desktop nav when logged in', () => {
      localStorage.setItem('isAdmin', 'true')
      render(<Navbar />)

      const adminLinks = screen.getAllByRole('link', { name: /admin/i })
      expect(adminLinks.length).toBeGreaterThan(0)
    })
  })
})
