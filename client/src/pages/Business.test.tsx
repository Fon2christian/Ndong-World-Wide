import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Business from './Business'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const mockCars = [
  {
    _id: '1',
    brand: 'Honda',
    model: 'Accord',
    year: 2023,
    price: 28000,
    mileage: 10000,
    fuel: 'Hybrid',
    transmission: 'CVT',
    images: ['data:image/jpeg;base64,honda123'],
  },
  {
    _id: '2',
    brand: 'Nissan',
    model: 'Altima',
    year: 2022,
    price: 22000,
    mileage: 25000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    images: [],
  },
]

const mockNewTires = [
  {
    _id: '3',
    brand: 'Goodyear',
    size: '215/60R16',
    price: 180,
    condition: 'new',
    images: ['data:image/jpeg;base64,tire456'],
  },
]

const mockUsedTires = [
  {
    _id: '4',
    brand: 'Dunlop',
    size: '195/65R15',
    price: 99,
    condition: 'used',
    images: [],
  },
]

const mockWheelDrums = [
  {
    _id: '5',
    brand: 'SAF',
    size: '8 hole',
    price: 180,
    condition: 'Excellent',
    images: ['data:image/jpeg;base64,drum789'],
  },
]

describe('Business', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('loading state', () => {
    it('should show loading spinner initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})) // Never resolves
      render(<Business />)
      expect(document.querySelector('.loading__spinner')).toBeInTheDocument()
    })

    it('should display loading text', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}))
      render(<Business />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('hero section', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: [] })
    })

    it('should render hero title', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(screen.getByText('Our Business')).toBeInTheDocument()
      })
    })

    it('should render hero subtitle', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(
          screen.getByText(/explore our complete inventory/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('tabs navigation', () => {
    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/cars')) return Promise.resolve({ data: mockCars })
        if (url.includes('condition=new')) return Promise.resolve({ data: mockNewTires })
        if (url.includes('condition=used')) return Promise.resolve({ data: mockUsedTires })
        if (url.includes('/wheel-drums')) return Promise.resolve({ data: mockWheelDrums })
        return Promise.resolve({ data: [] })
      })
    })

    it('should render all four tabs', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cars/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /new tires/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /used tires/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /wheel drums/i })).toBeInTheDocument()
      })
    })

    it('should show cars tab as active by default', async () => {
      render(<Business />)

      await waitFor(() => {
        const carsTab = screen.getByRole('button', { name: /cars/i })
        expect(carsTab).toHaveClass('business-tab--active')
      })
    })

    it('should display tab counts', async () => {
      render(<Business />)

      await waitFor(() => {
        const tabs = screen.getAllByRole('button')
        const carTab = tabs.find(tab => tab.textContent?.includes('Cars'))
        const newTiresTab = tabs.find(tab => tab.textContent?.includes('New Tires'))

        // Cars tab should show count of 2
        expect(carTab?.textContent).toContain('2')
        // New Tires should show count of 1
        expect(newTiresTab?.textContent).toContain('1')
      })
    })

    it('should display tab icons', async () => {
      render(<Business />)

      await waitFor(() => {
        const tabs = screen.getAllByRole('button')
        const carTabIcon = tabs.find(tab => tab.textContent?.includes('🚗'))
        const tireTabIcon = tabs.find(tab => tab.textContent?.includes('🛞'))
        const wheelTabIcon = tabs.find(tab => tab.textContent?.includes('⚙️'))

        expect(carTabIcon).toBeInTheDocument()
        expect(tireTabIcon).toBeInTheDocument()
        expect(wheelTabIcon).toBeInTheDocument()
      })
    })

    it('should switch to New Tires tab when clicked', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      expect(newTiresTab).toHaveClass('business-tab--active')
    })

    it('should switch to Used Tires tab when clicked', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const usedTiresTab = screen.getByRole('button', { name: /used tires/i })
      await user.click(usedTiresTab)

      expect(usedTiresTab).toHaveClass('business-tab--active')
    })

    it('should switch to Wheel Drums tab when clicked', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const wheelDrumsTab = screen.getByRole('button', { name: /wheel drums/i })
      await user.click(wheelDrumsTab)

      expect(wheelDrumsTab).toHaveClass('business-tab--active')
    })

    it('should remove active class from previous tab when switching', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const carsTab = screen.getByRole('button', { name: /cars/i })
      const newTiresTab = screen.getByRole('button', { name: /new tires/i })

      expect(carsTab).toHaveClass('business-tab--active')

      await user.click(newTiresTab)

      expect(newTiresTab).toHaveClass('business-tab--active')
      expect(carsTab).not.toHaveClass('business-tab--active')
    })
  })

  describe('cars content', () => {
    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/cars')) return Promise.resolve({ data: mockCars })
        if (url.includes('condition=new')) return Promise.resolve({ data: [] })
        if (url.includes('condition=used')) return Promise.resolve({ data: [] })
        if (url.includes('/wheel-drums')) return Promise.resolve({ data: [] })
        return Promise.resolve({ data: [] })
      })
    })

    it('should display car cards', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(screen.getByText('Honda Accord')).toBeInTheDocument()
        expect(screen.getByText('Nissan Altima')).toBeInTheDocument()
      })
    })

    it('should display car year badge', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(screen.getByText('2023')).toBeInTheDocument()
        expect(screen.getByText('2022')).toBeInTheDocument()
      })
    })

    it('should display car mileage', async () => {
      render(<Business />)

      await waitFor(() => {
        // Use locale-agnostic regex to match formatted mileage numbers
        expect(screen.getByText(/10[,.\s]?000 km/)).toBeInTheDocument()
        expect(screen.getByText(/25[,.\s]?000 km/)).toBeInTheDocument()
      })
    })

    it('should display car prices', async () => {
      render(<Business />)

      await waitFor(() => {
        // Use locale-agnostic regex to match formatted price numbers
        expect(screen.getByText(/28[,.\s]?000/)).toBeInTheDocument()
        expect(screen.getByText(/22[,.\s]?000/)).toBeInTheDocument()
      })
    })

    it('should display placeholder icon when no image', async () => {
      render(<Business />)

      await waitFor(() => {
        const placeholders = document.querySelectorAll('.business-card__placeholder')
        expect(placeholders.length).toBeGreaterThan(0)
      })
    })
  })

  describe('tires content', () => {
    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/cars')) return Promise.resolve({ data: [] })
        if (url.includes('condition=new')) return Promise.resolve({ data: mockNewTires })
        if (url.includes('condition=used')) return Promise.resolve({ data: mockUsedTires })
        if (url.includes('/wheel-drums')) return Promise.resolve({ data: [] })
        return Promise.resolve({ data: [] })
      })
    })

    it('should display new tires when tab is selected', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      await waitFor(() => {
        expect(screen.getByText('Goodyear')).toBeInTheDocument()
        expect(screen.getByText('215/60R16')).toBeInTheDocument()
        expect(screen.getByText(/180/)).toBeInTheDocument()
      })
    })

    it('should display used tires when tab is selected', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const usedTiresTab = screen.getByRole('button', { name: /used tires/i })
      await user.click(usedTiresTab)

      await waitFor(() => {
        expect(screen.getByText('Dunlop')).toBeInTheDocument()
        expect(screen.getByText('195/65R15')).toBeInTheDocument()
        // Check that the price is displayed (using unique price value that doesn't overlap with size)
        expect(screen.getByText(/99/)).toBeInTheDocument()
      })
    })

    it('should display condition badge for new tires', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      await waitFor(() => {
        expect(screen.getByText('new')).toBeInTheDocument()
      })
    })

    it('should display condition badge for used tires', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const usedTiresTab = screen.getByRole('button', { name: /used tires/i })
      await user.click(usedTiresTab)

      await waitFor(() => {
        expect(screen.getByText('used')).toBeInTheDocument()
      })
    })
  })

  describe('wheel drums content', () => {
    beforeEach(() => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/cars')) return Promise.resolve({ data: [] })
        if (url.includes('condition=new')) return Promise.resolve({ data: [] })
        if (url.includes('condition=used')) return Promise.resolve({ data: [] })
        if (url.includes('/wheel-drums')) return Promise.resolve({ data: mockWheelDrums })
        return Promise.resolve({ data: [] })
      })
    })

    it('should display wheel drums when tab is selected', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const wheelDrumsTab = screen.getByRole('button', { name: /wheel drums/i })
      await user.click(wheelDrumsTab)

      await waitFor(() => {
        expect(screen.getByText('SAF')).toBeInTheDocument()
        expect(screen.getByText('8 hole')).toBeInTheDocument()
        expect(screen.getByText(/180/)).toBeInTheDocument()
        expect(screen.getByText('Excellent')).toBeInTheDocument()
      })
    })
  })

  describe('empty states', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: [] })
    })

    it('should show empty state for cars when no cars available', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(screen.getByText(/no items available/i)).toBeInTheDocument()
        expect(screen.getByText(/check back soon for new vehicles/i)).toBeInTheDocument()
      })
    })

    it('should show empty state icon for cars', async () => {
      render(<Business />)

      await waitFor(() => {
        const emptyIcon = document.querySelector('.business-empty__icon')
        expect(emptyIcon).toHaveTextContent('🚗')
      })
    })

    it('should show empty state for new tires when no new tires available', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      await waitFor(() => {
        expect(screen.getByText(/no items available/i)).toBeInTheDocument()
        expect(screen.getByText(/check back soon for new tires/i)).toBeInTheDocument()
      })
    })

    it('should show empty state for used tires when no used tires available', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const usedTiresTab = screen.getByRole('button', { name: /used tires/i })
      await user.click(usedTiresTab)

      await waitFor(() => {
        expect(screen.getByText(/no items available/i)).toBeInTheDocument()
        expect(screen.getByText(/check back soon for used tires/i)).toBeInTheDocument()
      })
    })

    it('should show empty state for wheel drums when no wheel drums available', async () => {
      const user = userEvent.setup()
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const wheelDrumsTab = screen.getByRole('button', { name: /wheel drums/i })
      await user.click(wheelDrumsTab)

      await waitFor(() => {
        expect(screen.getByText(/no items available/i)).toBeInTheDocument()
        expect(screen.getByText(/check back soon for wheel drums/i)).toBeInTheDocument()
      })
    })
  })

  describe('API calls', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: [] })
    })

    it('should fetch business items with correct query parameters', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/cars?location=business')
      )
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/tires?condition=new&location=business')
      )
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/tires?condition=used&location=business')
      )
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/wheel-drums?location=business')
      )
    })

    it('should fetch all data in parallel on mount', async () => {
      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      // Should make 4 API calls (cars, new tires, used tires, wheel drums)
      expect(mockedAxios.get).toHaveBeenCalledTimes(4)
    })
  })

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      render(<Business />)

      // Should still render the page without crashing
      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      // Should render the business page structure
      expect(screen.getByText('Our Business')).toBeInTheDocument()
    })

    it('should log error to console when API fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      render(<Business />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching business data:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
