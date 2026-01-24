import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import TireForm from './TireForm'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

// Mock window.alert
const mockAlert = vi.fn()
window.alert = mockAlert

describe('TireForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAlert.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<TireForm />)

      expect(screen.getByLabelText(/brand/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/size/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/condition/i)).toBeInTheDocument()
    })

    it('should render Create Tire button when no tireId', () => {
      render(<TireForm />)
      expect(screen.getByRole('button', { name: /create tire/i })).toBeInTheDocument()
    })

    it('should render Update Tire button when tireId is provided', () => {
      render(<TireForm tireId="123" />)
      expect(screen.getByRole('button', { name: /update tire/i })).toBeInTheDocument()
    })

    it('should render file upload area', () => {
      render(<TireForm />)
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
    })

    it('should display placeholders', () => {
      render(<TireForm />)
      expect(screen.getByPlaceholderText('e.g. Bridgestone')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 205/55R16')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 150')).toBeInTheDocument()
    })
  })

  describe('default condition', () => {
    it('should default to "new" condition', () => {
      render(<TireForm />)
      const conditionSelect = screen.getByLabelText(/condition/i) as HTMLSelectElement
      expect(conditionSelect.value).toBe('new')
    })

    it('should use defaultCondition prop when provided', () => {
      render(<TireForm defaultCondition="used" />)
      const conditionSelect = screen.getByLabelText(/condition/i) as HTMLSelectElement
      expect(conditionSelect.value).toBe('used')
    })
  })

  describe('initial data', () => {
    const initialData = {
      brand: 'Michelin',
      size: '225/45R17',
      price: 200,
      condition: 'used' as const,
      images: [],
    }

    it('should populate form with initial data', () => {
      render(<TireForm initialData={initialData} />)

      expect(screen.getByLabelText(/brand/i)).toHaveValue('Michelin')
      expect(screen.getByLabelText(/size/i)).toHaveValue('225/45R17')
      expect(screen.getByLabelText(/price/i)).toHaveValue(200)
      expect(screen.getByLabelText(/condition/i)).toHaveValue('used')
    })
  })

  describe('form input', () => {
    it('should update brand field on input', async () => {
      const user = userEvent.setup()
      render(<TireForm />)

      const brandInput = screen.getByLabelText(/brand/i)
      await user.type(brandInput, 'Bridgestone')

      expect(brandInput).toHaveValue('Bridgestone')
    })

    it('should update size field on input', async () => {
      const user = userEvent.setup()
      render(<TireForm />)

      const sizeInput = screen.getByLabelText(/size/i)
      await user.type(sizeInput, '205/55R16')

      expect(sizeInput).toHaveValue('205/55R16')
    })

    it('should update price field on input', async () => {
      const user = userEvent.setup()
      render(<TireForm />)

      const priceInput = screen.getByLabelText(/price/i)
      await user.clear(priceInput)
      await user.type(priceInput, '150')

      expect(priceInput).toHaveValue(150)
    })

    it('should update condition field on change', async () => {
      const user = userEvent.setup()
      render(<TireForm />)

      const conditionSelect = screen.getByLabelText(/condition/i)
      await user.selectOptions(conditionSelect, 'used')

      expect(conditionSelect).toHaveValue('used')
    })
  })

  describe('form submission - create', () => {
    it('should call axios.post when creating new tire', async () => {
      const user = userEvent.setup()
      const onSaved = vi.fn()
      mockedAxios.post.mockResolvedValue({ data: { _id: '123' } })

      render(<TireForm onSaved={onSaved} />)

      await user.type(screen.getByLabelText(/brand/i), 'Bridgestone')
      await user.type(screen.getByLabelText(/size/i), '205/55R16')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '150')

      const submitButton = screen.getByRole('button', { name: /create tire/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/tires'),
          expect.objectContaining({
            brand: 'Bridgestone',
            size: '205/55R16',
            price: 150,
            condition: 'new',
          })
        )
      })

      expect(mockAlert).toHaveBeenCalledWith('Tire created! ID: 123')
      expect(onSaved).toHaveBeenCalled()
    })

    it('should reset form after successful creation', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({ data: { _id: '123' } })

      render(<TireForm />)

      await user.type(screen.getByLabelText(/brand/i), 'Bridgestone')
      await user.type(screen.getByLabelText(/size/i), '205/55R16')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '150')

      const submitButton = screen.getByRole('button', { name: /create tire/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/brand/i)).toHaveValue('')
        expect(screen.getByLabelText(/size/i)).toHaveValue('')
        expect(screen.getByLabelText(/price/i)).toHaveValue(0)
      })
    })
  })

  describe('form submission - update', () => {
    it('should call axios.put when updating existing tire', async () => {
      const user = userEvent.setup()
      const onSaved = vi.fn()
      mockedAxios.put.mockResolvedValue({ data: { _id: '123' } })

      const initialData = {
        brand: 'Michelin',
        size: '225/45R17',
        price: 200,
        condition: 'used' as const,
        images: [],
      }

      render(<TireForm initialData={initialData} tireId="123" onSaved={onSaved} />)

      // Update brand
      const brandInput = screen.getByLabelText(/brand/i)
      await user.clear(brandInput)
      await user.type(brandInput, 'Bridgestone')

      const submitButton = screen.getByRole('button', { name: /update tire/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          expect.stringContaining('/api/tires/123'),
          expect.objectContaining({
            brand: 'Bridgestone',
          })
        )
      })

      expect(mockAlert).toHaveBeenCalledWith('Tire updated! ID: 123')
      expect(onSaved).toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('should show validation error when brand is empty', async () => {
      const user = userEvent.setup()
      render(<TireForm />)

      // Only fill size and price
      await user.type(screen.getByLabelText(/size/i), '205/55R16')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '150')

      const submitButton = screen.getByRole('button', { name: /create tire/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Validation error'))
      })

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })

    it('should show validation error when size is empty', async () => {
      const user = userEvent.setup()
      render(<TireForm />)

      // Only fill brand and price
      await user.type(screen.getByLabelText(/brand/i), 'Bridgestone')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '150')

      const submitButton = screen.getByRole('button', { name: /create tire/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Validation error'))
      })

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should show error alert when API call fails', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockRejectedValue(new Error('Network error'))

      render(<TireForm />)

      await user.type(screen.getByLabelText(/brand/i), 'Bridgestone')
      await user.type(screen.getByLabelText(/size/i), '205/55R16')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '150')

      const submitButton = screen.getByRole('button', { name: /create tire/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to save tire. Check server logs.')
      })
    })
  })
})
