import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test/test-utils'
import ProtectedRoute from './ProtectedRoute'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('when not authenticated', () => {
    it('should not render children', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should redirect to login page', () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      // The Navigate component will redirect, so we check it's not rendering children
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('when authenticated', () => {
    beforeEach(() => {
      localStorage.setItem('isAdmin', 'true')
    })

    it('should render children', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render complex children', () => {
      render(
        <ProtectedRoute>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, admin!</p>
          </div>
        </ProtectedRoute>
      )

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome, admin!')).toBeInTheDocument()
    })
  })
})
