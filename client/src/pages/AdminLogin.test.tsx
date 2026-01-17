import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import AdminLogin from './AdminLogin'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AdminLogin', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('should render login form', () => {
      render(<AdminLogin />)
      expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument()
    })

    it('should render username input', () => {
      render(<AdminLogin />)
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    })

    it('should render password input', () => {
      render(<AdminLogin />)
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should render sign in button', () => {
      render(<AdminLogin />)
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<AdminLogin />)
      expect(screen.getByText(/sign in to access the admin dashboard/i)).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should show error message on invalid credentials', async () => {
      const user = userEvent.setup()
      render(<AdminLogin />)

      await user.type(screen.getByLabelText(/username/i), 'wronguser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpass')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
      })
    })

    it('should navigate to admin on valid credentials', async () => {
      const user = userEvent.setup()
      render(<AdminLogin />)

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'admin123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin')
      })
    })

    it('should set isAdmin in localStorage on successful login', async () => {
      const user = userEvent.setup()
      render(<AdminLogin />)

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'admin123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(localStorage.getItem('isAdmin')).toBe('true')
      })
    })
  })

  describe('redirect behavior', () => {
    it('should redirect to admin if already logged in', () => {
      localStorage.setItem('isAdmin', 'true')
      render(<AdminLogin />)

      // When already logged in, the component should render Navigate
      // which means the form should not be present
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument()
    })
  })

  describe('input validation', () => {
    it('should have required attribute on username', () => {
      render(<AdminLogin />)
      expect(screen.getByLabelText(/username/i)).toHaveAttribute('required')
    })

    it('should have required attribute on password', () => {
      render(<AdminLogin />)
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('required')
    })

    it('should have password type on password input', () => {
      render(<AdminLogin />)
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
    })
  })
})
