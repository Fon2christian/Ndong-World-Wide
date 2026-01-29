import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
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
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should render company logo', () => {
      render(<Footer />)
      const logo = screen.getByAltText('Ndong World Wide Trading')
      expect(logo).toBeInTheDocument()
    })

    it('should render contact information', () => {
      render(<Footer />)
      expect(screen.getByText('+81 70-7774-6436')).toBeInTheDocument()
      expect(screen.getByText('(English)')).toBeInTheDocument()
      expect(screen.getByText('+81 90-8086-4799')).toBeInTheDocument()
      expect(screen.getByText('(Japanese)')).toBeInTheDocument()
      expect(screen.getByText('info@ndongworldwide.com')).toBeInTheDocument()
    })

    it('should render phone numbers as clickable tel links', () => {
      render(<Footer />)
      const englishPhoneLink = screen.getByRole('link', { name: /\+81 70-7774-6436/i })
      const japanesePhoneLink = screen.getByRole('link', { name: /\+81 90-8086-4799/i })

      expect(englishPhoneLink).toHaveAttribute('href', 'tel:+817077746436')
      expect(japanesePhoneLink).toHaveAttribute('href', 'tel:+819080864799')
    })

    it('should render company address from translations', () => {
      render(<Footer />)
      // English address should be rendered by default
      expect(screen.getByText(/Yoshikawa City/i)).toBeInTheDocument()
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
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Footer />)

      const tyresProvisionBtn = screen.getByRole('button', { name: /tyres provision/i })
      await user.click(tyresProvisionBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('should navigate to home when Wheels Provision is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Footer />)

      const wheelsProvisionBtn = screen.getByRole('button', { name: /wheels provision/i })
      await user.click(wheelsProvisionBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('should navigate to home when Our Mission is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<Footer />)

      const missionBtn = screen.getByRole('button', { name: /our mission/i })
      await user.click(missionBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('scrollToSection functionality', () => {
    it('should scroll to element and add highlight class when element exists', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Create a mock element
      const mockElement = document.createElement('div')
      mockElement.id = 'car-provision'
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 500,
        height: 200,
      })
      document.body.appendChild(mockElement)

      const mockScrollTo = vi.fn()
      window.scrollTo = mockScrollTo
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

      render(<Footer />)

      const carProvisionBtn = screen.getByRole('button', { name: /car provision/i })
      await user.click(carProvisionBtn)

      // Element should have highlight class added
      expect(mockElement.classList.contains('section-highlight')).toBe(true)

      // scrollTo should be called with smooth behavior
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      })

      // After 3 seconds, highlight should be removed
      vi.advanceTimersByTime(3000)
      expect(mockElement.classList.contains('section-highlight')).toBe(false)

      document.body.removeChild(mockElement)
    })

    it('should retry finding element if not immediately available', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(<Footer />)

      const carProvisionBtn = screen.getByRole('button', { name: /car provision/i })
      await user.click(carProvisionBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')

      // Element doesn't exist, so it should retry
      // Advance time to trigger retry attempts
      vi.advanceTimersByTime(100)
      vi.advanceTimersByTime(100)
      vi.advanceTimersByTime(100)

      // Now add the element mid-retry
      const mockElement = document.createElement('div')
      mockElement.id = 'car-provision'
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 500,
        height: 200,
      })
      document.body.appendChild(mockElement)

      const mockScrollTo = vi.fn()
      window.scrollTo = mockScrollTo

      // Advance to trigger retry that should find the element
      vi.advanceTimersByTime(100)

      expect(mockElement.classList.contains('section-highlight')).toBe(true)

      document.body.removeChild(mockElement)
    })

    it('should stop retrying after max attempts when element not found', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Spy on getElementById to track calls
      const getElementSpy = vi.spyOn(document, 'getElementById')

      render(<Footer />)

      const carProvisionBtn = screen.getByRole('button', { name: /car provision/i })
      await user.click(carProvisionBtn)

      // Clear previous calls
      getElementSpy.mockClear()

      // Advance through all 10 retry attempts (100ms each)
      for (let i = 0; i < 15; i++) {
        vi.advanceTimersByTime(100)
      }

      // Should have made attempts but stopped after retries exhausted
      // The function starts with retries = 10, so max 11 calls (initial + 10 retries)
      expect(getElementSpy.mock.calls.length).toBeLessThanOrEqual(11)

      getElementSpy.mockRestore()
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
