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

    it('should render Contact link', () => {
      render(<Navbar />)
      const contactLinks = screen.getAllByRole('link', { name: /contact/i })
      expect(contactLinks.length).toBeGreaterThanOrEqual(1)
    })

    it('should render Business link', () => {
      render(<Navbar />)
      const businessLinks = screen.getAllByRole('link', { name: /business/i })
      expect(businessLinks.length).toBeGreaterThanOrEqual(1)
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

    it('should have correct href for Contact link', () => {
      render(<Navbar />)
      const contactLinks = screen.getAllByRole('link', { name: /contact/i })
      expect(contactLinks[0]).toHaveAttribute('href', '/contact')
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

    it('should close mobile menu when a navigation link is clicked', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const toggleButton = screen.getByLabelText('Toggle menu')

      // Open the menu
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

      // Find a link in the mobile dropdown (has navbar__dropdown-link class)
      const mobileHomeLink = screen.getAllByRole('link', { name: /home/i }).find(
        link => link.classList.contains('navbar__dropdown-link')
      )

      // Click the mobile menu link
      await user.click(mobileHomeLink!)

      // Menu should close
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should close mobile menu when Market link is clicked', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const toggleButton = screen.getByLabelText('Toggle menu')

      // Open the menu
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

      // Find Market link in the mobile dropdown
      const mobileMarketLink = screen.getAllByRole('link', { name: /market/i }).find(
        link => link.classList.contains('navbar__dropdown-link')
      )

      // Click the mobile menu link
      await user.click(mobileMarketLink!)

      // Menu should close
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should close mobile menu when Contact link is clicked', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const toggleButton = screen.getByLabelText('Toggle menu')

      // Open the menu
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

      // Find Contact link in the mobile dropdown
      const mobileContactLink = screen.getAllByRole('link', { name: /contact/i }).find(
        link => link.classList.contains('navbar__dropdown-link')
      )

      // Click the mobile menu link
      await user.click(mobileContactLink!)

      // Menu should close
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should show Business link in mobile menu', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const toggleButton = screen.getByLabelText('Toggle menu')

      // Open the menu
      await user.click(toggleButton)

      // Find Business link in the mobile dropdown
      const mobileBusinessLink = screen.getAllByRole('link', { name: /business/i }).find(
        link => link.classList.contains('navbar__dropdown-link')
      )

      expect(mobileBusinessLink).toBeInTheDocument()
      expect(mobileBusinessLink).toHaveAttribute('href', '/business')
    })

    it('should close mobile menu when Business link is clicked', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const toggleButton = screen.getByLabelText('Toggle menu')

      // Open the menu
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')

      // Find Business link in the mobile dropdown
      const mobileBusinessLink = screen.getAllByRole('link', { name: /business/i }).find(
        link => link.classList.contains('navbar__dropdown-link')
      )

      // Click the mobile menu link
      await user.click(mobileBusinessLink!)

      // Menu should close
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('active state', () => {
    it('should apply navbar__link class to navigation links', () => {
      render(<Navbar />)

      // Verify home link has the base navbar__link class
      const homeLinks = screen.getAllByRole('link', { name: /home/i })
      expect(homeLinks[0]).toHaveClass('navbar__link')
    })
  })
})
