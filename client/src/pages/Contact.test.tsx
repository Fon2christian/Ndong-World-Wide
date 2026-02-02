import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Contact from './Contact'

// Helper to find button by text content
const getButtonByText = (text: string | RegExp): HTMLElement => {
  const buttons = screen.getAllByRole('button')
  const button = buttons.find(btn => {
    const content = btn.textContent || ''
    return typeof text === 'string' ? content.includes(text) : text.test(content)
  })
  if (!button) {
    throw new Error(`Button with text "${text}" not found`)
  }
  return button
}

describe('Contact Page', () => {
  beforeEach(() => {
    // Properly stub fetch to prevent test pollution
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    // Restore all globals after each test
    vi.unstubAllGlobals()
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

    // Find and click the proceed button
    const proceedButton = getButtonByText('Proceed')
    await user.click(proceedButton)

    await waitFor(() => {
      const errors = screen.queryAllByText(/required/i)
      expect(errors.length).toBeGreaterThan(0)
    })

    // Ensure no API call is made when validation fails
    expect(globalThis.fetch).not.toHaveBeenCalled()
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
    const proceedButton = getButtonByText('Proceed')
    await user.click(proceedButton)

    // Wait for confirmation screen
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Find and click submit button on confirmation screen
    const submitButton = getButtonByText('Submit')
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
  })

  it('shows error when API call fails', async () => {
    const user = userEvent.setup()

    // Mock failed API response
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error occurred' }),
    } as Response)

    render(<Contact />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText(/enter your full name/i), 'John Doe')
    await user.type(screen.getByPlaceholderText(/enter name pronunciation/i), 'ジョンドウ')
    await user.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com')
    await user.type(screen.getByPlaceholderText(/enter your phone/i), '+81-90-1234-5678')

    const proceedButton = getButtonByText('Proceed')
    await user.click(proceedButton)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const submitButton = getButtonByText('Submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/failed|error/i)).toBeInTheDocument()
    })
  })

  it('allows form submission without furigana (optional field)', async () => {
    const user = userEvent.setup()

    // Mock successful API response
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: '123', emailSent: true }),
    } as Response)

    render(<Contact />)

    // Fill form WITHOUT furigana
    const nameInput = screen.getByPlaceholderText(/enter your full name/i)
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const phoneInput = screen.getByPlaceholderText(/enter your phone/i)

    await user.type(nameInput, 'John Smith')
    await user.type(emailInput, 'john.smith@example.com')
    await user.type(phoneInput, '+81-70-1234-5678')

    // Click proceed button without filling furigana
    const proceedButton = getButtonByText('Proceed')
    await user.click(proceedButton)

    // Should successfully move to confirmation screen
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('john.smith@example.com')).toBeInTheDocument()
    })

    // Find and click submit button on confirmation screen
    const submitButton = getButtonByText('Submit')
    await user.click(submitButton)

    // Wait for success/completion message
    await waitFor(() => {
      expect(screen.getByText('Submission Complete')).toBeInTheDocument()
    })

    // Verify API was called with empty furigana
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/contacts'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"furigana":""'),
      })
    )
  })

  it('displays "-" for empty furigana in confirmation screen', async () => {
    const user = userEvent.setup()

    render(<Contact />)

    // Fill form WITHOUT furigana
    await user.type(screen.getByPlaceholderText(/enter your full name/i), 'Jane Doe')
    await user.type(screen.getByPlaceholderText(/enter your email/i), 'jane@example.com')
    await user.type(screen.getByPlaceholderText(/enter your phone/i), '+81-80-9876-5432')

    // Click proceed button
    const proceedButton = getButtonByText('Proceed')
    await user.click(proceedButton)

    // Wait for confirmation screen and check that furigana shows "-"
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()

      // Find all elements that could contain the furigana value
      const confirmValues = screen.getAllByText('-')
      // Verify at least one "-" exists (the furigana placeholder)
      expect(confirmValues.length).toBeGreaterThan(0)
    })
  })
})
