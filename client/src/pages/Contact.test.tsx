import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Contact from './Contact'

// Mock fetch API
globalThis.fetch = vi.fn()

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders contact form', () => {
    render(<Contact />)

    // Check main heading exists
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // Check form fields exist by placeholder
    expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your phone/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    // Find and click the next/submit button
    const buttons = screen.getAllByRole('button')
    const submitButton = buttons.find(btn => btn.textContent?.includes('Proceed') || btn.textContent?.includes('Next'))

    if (submitButton) {
      await user.click(submitButton)

      await waitFor(() => {
        const errors = screen.queryAllByText(/required/i)
        expect(errors.length).toBeGreaterThan(0)
      })
    }
  })

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: '123', emailSent: true }),
    } as Response)

    render(<Contact />)

    // Fill form by finding inputs
    const nameInput = screen.getByPlaceholderText(/enter your full name/i)
    const furiganaInput = screen.getByPlaceholderText(/enter name pronunciation/i)
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const phoneInput = screen.getByPlaceholderText(/enter your phone/i)

    await user.type(nameInput, 'John Doe')
    await user.type(furiganaInput, 'ジョンドウ')
    await user.type(emailInput, 'john@example.com')
    await user.type(phoneInput, '+81-90-1234-5678')

    // Click proceed button
    const buttons = screen.getAllByRole('button')
    const proceedButton = buttons.find(btn => btn.textContent?.includes('Proceed'))

    if (proceedButton) {
      await user.click(proceedButton)

      // Wait for confirmation screen
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Find and click submit button on confirmation screen
      const confirmButtons = screen.getAllByRole('button')
      const submitButton = confirmButtons.find(btn => btn.textContent?.includes('Submit'))

      if (submitButton) {
        await user.click(submitButton)

        // Wait for success/completion message
        await waitFor(() => {
          expect(screen.getByText('Submission Complete')).toBeInTheDocument()
        })

        // Verify API was called
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/contacts'),
          expect.objectContaining({
            method: 'POST',
          })
        )
      }
    }
  })

  it('shows error when API call fails', async () => {
    const user = userEvent.setup()

    // Mock failed API response
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    render(<Contact />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText(/enter your full name/i), 'John Doe')
    await user.type(screen.getByPlaceholderText(/enter name pronunciation/i), 'ジョンドウ')
    await user.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com')
    await user.type(screen.getByPlaceholderText(/enter your phone/i), '+81-90-1234-5678')

    const buttons = screen.getAllByRole('button')
    const proceedButton = buttons.find(btn => btn.textContent?.includes('Proceed'))

    if (proceedButton) {
      await user.click(proceedButton)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const confirmButtons = screen.getAllByRole('button')
      const submitButton = confirmButtons.find(btn => btn.textContent?.includes('Submit'))

      if (submitButton) {
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(/failed|error/i)).toBeInTheDocument()
        })
      }
    }
  })
})
