import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import WheelDrumForm from './WheelDrumForm'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

// Mock window.alert
const mockAlert = vi.fn()
window.alert = mockAlert

describe('WheelDrumForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAlert.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<WheelDrumForm />)

      expect(screen.getByLabelText(/brand/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/size/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/condition/i)).toBeInTheDocument()
    })

    it('should render Create Wheel Drum button when no wheelDrumId', () => {
      render(<WheelDrumForm />)
      expect(screen.getByRole('button', { name: /create wheel drum/i })).toBeInTheDocument()
    })

    it('should render Update Wheel Drum button when wheelDrumId is provided', () => {
      render(<WheelDrumForm wheelDrumId="123" />)
      expect(screen.getByRole('button', { name: /update wheel drum/i })).toBeInTheDocument()
    })

    it('should render file upload area', () => {
      render(<WheelDrumForm />)
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
    })

    it('should display placeholders', () => {
      render(<WheelDrumForm />)
      expect(screen.getByPlaceholderText('e.g. BPW')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 10 hole')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 200')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. Good, Excellent')).toBeInTheDocument()
    })
  })

  describe('initial data', () => {
    const initialData = {
      brand: 'BPW',
      size: '10 hole',
      price: 200,
      condition: 'Good',
      images: [],
      displayLocation: 'market' as const,
    }

    it('should populate form with initial data', () => {
      render(<WheelDrumForm initialData={initialData} />)

      expect(screen.getByLabelText(/brand/i)).toHaveValue('BPW')
      expect(screen.getByLabelText(/size/i)).toHaveValue('10 hole')
      expect(screen.getByLabelText(/price/i)).toHaveValue(200)
      expect(screen.getByLabelText(/condition/i)).toHaveValue('Good')
    })
  })

  describe('form input', () => {
    it('should update brand field on input', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      const brandInput = screen.getByLabelText(/brand/i)
      await user.type(brandInput, 'BPW')

      expect(brandInput).toHaveValue('BPW')
    })

    it('should update size field on input', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      const sizeInput = screen.getByLabelText(/size/i)
      await user.type(sizeInput, '10 hole')

      expect(sizeInput).toHaveValue('10 hole')
    })

    it('should update price field on input', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      const priceInput = screen.getByLabelText(/price/i)
      await user.clear(priceInput)
      await user.type(priceInput, '200')

      expect(priceInput).toHaveValue(200)
    })

    it('should update condition field on input', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      const conditionInput = screen.getByLabelText(/condition/i)
      await user.type(conditionInput, 'Excellent')

      expect(conditionInput).toHaveValue('Excellent')
    })
  })

  describe('form submission - create', () => {
    it('should call axios.post when creating new wheel drum', async () => {
      const user = userEvent.setup()
      const onSaved = vi.fn()
      mockedAxios.post.mockResolvedValue({ data: { _id: '123' } })

      render(<WheelDrumForm onSaved={onSaved} />)

      await user.type(screen.getByLabelText(/brand/i), 'BPW')
      await user.type(screen.getByLabelText(/size/i), '10 hole')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')
      await user.type(screen.getByLabelText(/condition/i), 'Good')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/wheel-drums'),
          expect.objectContaining({
            brand: 'BPW',
            size: '10 hole',
            price: 200,
            condition: 'Good',
          })
        )
      })

      expect(mockAlert).toHaveBeenCalledWith('Wheel Drum created! ID: 123')
      expect(onSaved).toHaveBeenCalled()
    })

    it('should reset form after successful creation', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({ data: { _id: '123' } })

      render(<WheelDrumForm />)

      await user.type(screen.getByLabelText(/brand/i), 'BPW')
      await user.type(screen.getByLabelText(/size/i), '10 hole')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')
      await user.type(screen.getByLabelText(/condition/i), 'Good')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/brand/i)).toHaveValue('')
        expect(screen.getByLabelText(/size/i)).toHaveValue('')
        expect(screen.getByLabelText(/price/i)).toHaveValue(0)
        expect(screen.getByLabelText(/condition/i)).toHaveValue('')
      })
    })
  })

  describe('form submission - update', () => {
    it('should call axios.put when updating existing wheel drum', async () => {
      const user = userEvent.setup()
      const onSaved = vi.fn()
      mockedAxios.put.mockResolvedValue({ data: { _id: '123' } })

      const initialData = {
        brand: 'BPW',
        size: '10 hole',
        price: 200,
        condition: 'Good',
        images: [],
        displayLocation: 'market' as const,
      }

      render(<WheelDrumForm initialData={initialData} wheelDrumId="123" onSaved={onSaved} />)

      // Update brand
      const brandInput = screen.getByLabelText(/brand/i)
      await user.clear(brandInput)
      await user.type(brandInput, 'SAF')

      const submitButton = screen.getByRole('button', { name: /update wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          expect.stringContaining('/api/wheel-drums/123'),
          expect.objectContaining({
            brand: 'SAF',
          })
        )
      })

      expect(mockAlert).toHaveBeenCalledWith('Wheel Drum updated! ID: 123')
      expect(onSaved).toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('should show validation error when brand is empty', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      // Only fill size, price, and condition
      await user.type(screen.getByLabelText(/size/i), '10 hole')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')
      await user.type(screen.getByLabelText(/condition/i), 'Good')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Validation error'))
      })

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })

    it('should show validation error when size is empty', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      // Only fill brand, price, and condition
      await user.type(screen.getByLabelText(/brand/i), 'BPW')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')
      await user.type(screen.getByLabelText(/condition/i), 'Good')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Validation error'))
      })

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })

    it('should show validation error when condition is empty', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      // Only fill brand, size, and price
      await user.type(screen.getByLabelText(/brand/i), 'BPW')
      await user.type(screen.getByLabelText(/size/i), '10 hole')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
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

      render(<WheelDrumForm />)

      await user.type(screen.getByLabelText(/brand/i), 'BPW')
      await user.type(screen.getByLabelText(/size/i), '10 hole')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')
      await user.type(screen.getByLabelText(/condition/i), 'Good')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to save wheel drum. Check server logs.')
      })
    })
  })

  describe('displayLocation', () => {
    it('should render displayLocation select field', () => {
      render(<WheelDrumForm />)
      expect(screen.getByLabelText(/display location/i)).toBeInTheDocument()
    })

    it('should default to "market" displayLocation', () => {
      render(<WheelDrumForm />)
      const locationSelect = screen.getByLabelText(/display location/i) as HTMLSelectElement
      expect(locationSelect.value).toBe('market')
    })

    it('should update displayLocation field on change', async () => {
      const user = userEvent.setup()
      render(<WheelDrumForm />)

      const locationSelect = screen.getByLabelText(/display location/i)
      await user.selectOptions(locationSelect, 'business')

      expect(locationSelect).toHaveValue('business')
    })

    it('should include displayLocation in form submission', async () => {
      const user = userEvent.setup()
      mockedAxios.post.mockResolvedValue({ data: { _id: '123' } })

      render(<WheelDrumForm />)

      await user.type(screen.getByLabelText(/brand/i), 'BPW')
      await user.type(screen.getByLabelText(/size/i), '10 hole')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '200')
      await user.type(screen.getByLabelText(/condition/i), 'Good')
      await user.selectOptions(screen.getByLabelText(/display location/i), 'both')

      const submitButton = screen.getByRole('button', { name: /create wheel drum/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/wheel-drums'),
          expect.objectContaining({
            displayLocation: 'both',
          })
        )
      })
    })
  })
})
