import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Footer from './Footer'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Footer', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('should render company logo', () => {
      render(<Footer />)
      const logo = screen.getByAltText('Ndong World Wide Trading')
      expect(logo).toBeInTheDocument()
    })

    it('should render contact information', () => {
      render(<Footer />)
      expect(screen.getByText('+81 123-456-7890')).toBeInTheDocument()
      expect(screen.getByText('info@ndongworldwide.com')).toBeInTheDocument()
    })

    it('should render Quick Links section', () => {
      render(<Footer />)
      expect(screen.getByText('Quick Links')).toBeInTheDocument()
    })

    it('should render Our Services section', () => {
      render(<Footer />)
      expect(screen.getByText('Our Services')).toBeInTheDocument()
    })

    it('should render copyright text with current year', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
    })
  })

  describe('navigation links', () => {
    it('should render Home link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    })

    it('should render Market link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /market/i })).toHaveAttribute('href', '/market')
    })
  })

  describe('service buttons', () => {
    it('should render Car Provision button', () => {
      render(<Footer />)
      expect(screen.getByRole('button', { name: /car provision/i })).toBeInTheDocument()
    })

    it('should render Tyres Provision button', () => {
      render(<Footer />)
      expect(screen.getByRole('button', { name: /tyres provision/i })).toBeInTheDocument()
    })

    it('should render Wheels Provision button', () => {
      render(<Footer />)
      expect(screen.getByRole('button', { name: /wheels provision/i })).toBeInTheDocument()
    })

    it('should render Our Mission button', () => {
      render(<Footer />)
      expect(screen.getByRole('button', { name: /our mission/i })).toBeInTheDocument()
    })

    it('should navigate to home and scroll when Car Provision is clicked', async () => {
      const user = userEvent.setup()
      render(<Footer />)

      const carProvisionBtn = screen.getByRole('button', { name: /car provision/i })
      await user.click(carProvisionBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('should navigate to home and scroll when Tyres Provision is clicked', async () => {
      const user = userEvent.setup()
      render(<Footer />)

      const tyresProvisionBtn = screen.getByRole('button', { name: /tyres provision/i })
      await user.click(tyresProvisionBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('translations', () => {
    it('should display English text by default', () => {
      render(<Footer />)
      expect(screen.getByText('Quick Links')).toBeInTheDocument()
      expect(screen.getByText('Our Services')).toBeInTheDocument()
    })

    it('should display French text when language is French', () => {
      localStorage.setItem('language', 'fr')
      render(<Footer />)
      expect(screen.getByText('Liens Rapides')).toBeInTheDocument()
      expect(screen.getByText('Nos Services')).toBeInTheDocument()
    })

    it('should display Japanese text when language is Japanese', () => {
      localStorage.setItem('language', 'ja')
      render(<Footer />)
      expect(screen.getByText('クイックリンク')).toBeInTheDocument()
      expect(screen.getByText('サービス')).toBeInTheDocument()
    })
  })
})
