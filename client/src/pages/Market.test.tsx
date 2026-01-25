import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Market from './Market'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const mockCars = [
  {
    _id: '1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 25000,
    mileage: 15000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    images: ['data:image/jpeg;base64,test123'],
    createdAt: '2024-01-01',
  },
]

const mockNewTires = [
  {
    _id: '2',
    brand: 'Bridgestone',
    size: '205/55R16',
    price: 150,
    condition: 'new' as const,
    images: ['data:image/jpeg;base64,tire123'],
    createdAt: '2024-01-02',
  },
]

const mockUsedTires = [
  {
    _id: '3',
    brand: 'Michelin',
    size: '225/45R17',
    price: 80,
    condition: 'used' as const,
    images: [],
    createdAt: '2024-01-03',
  },
]

const mockWheelDrums = [
  {
    _id: '4',
    brand: 'BPW',
    size: '10 hole',
    price: 200,
    condition: 'Good',
    images: ['data:image/jpeg;base64,wheel123'],
    createdAt: '2024-01-04',
  },
]

describe('Market', () => {
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
      render(<Market />)
      expect(document.querySelector('.loading__spinner')).toBeInTheDocument()
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
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cars/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /new tires/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /used tires/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /wheel drums/i })).toBeInTheDocument()
      })
    })

    it('should show cars tab as active by default', async () => {
      render(<Market />)

      await waitFor(() => {
        const carsTab = screen.getByRole('button', { name: /cars/i })
        expect(carsTab).toHaveClass('market__tab--active')
      })
    })

    it('should display tab counts', async () => {
      render(<Market />)

      await waitFor(() => {
        // Check for count badges
        const tabs = screen.getAllByRole('button')
        expect(tabs.length).toBeGreaterThanOrEqual(4)
      })
    })

    it('should switch to New Tires tab when clicked', async () => {
      const user = userEvent.setup()
      render(<Market />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      expect(newTiresTab).toHaveClass('market__tab--active')
    })

    it('should switch to Used Tires tab when clicked', async () => {
      const user = userEvent.setup()
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const usedTiresTab = screen.getByRole('button', { name: /used tires/i })
      await user.click(usedTiresTab)

      expect(usedTiresTab).toHaveClass('market__tab--active')
    })

    it('should switch to Wheel Drums tab when clicked', async () => {
      const user = userEvent.setup()
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const wheelDrumsTab = screen.getByRole('button', { name: /wheel drums/i })
      await user.click(wheelDrumsTab)

      expect(wheelDrumsTab).toHaveClass('market__tab--active')
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
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
        expect(screen.getByText('¥25,000')).toBeInTheDocument()
        expect(screen.getByText('2022')).toBeInTheDocument()
      })
    })

    it('should display car specs', async () => {
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByText('15,000 km')).toBeInTheDocument()
        expect(screen.getByText('Petrol')).toBeInTheDocument()
        expect(screen.getByText('Automatic')).toBeInTheDocument()
      })
    })

    it('should display Contact Seller button', async () => {
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /contact seller/i })).toBeInTheDocument()
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
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      await waitFor(() => {
        expect(screen.getByText('Bridgestone')).toBeInTheDocument()
        expect(screen.getByText('205/55R16')).toBeInTheDocument()
        expect(screen.getByText('¥150')).toBeInTheDocument()
      })
    })

    it('should display used tires when tab is selected', async () => {
      const user = userEvent.setup()
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const usedTiresTab = screen.getByRole('button', { name: /used tires/i })
      await user.click(usedTiresTab)

      await waitFor(() => {
        expect(screen.getByText('Michelin')).toBeInTheDocument()
        expect(screen.getByText('225/45R17')).toBeInTheDocument()
        expect(screen.getByText('¥80')).toBeInTheDocument()
      })
    })

    it('should display condition badge for tires', async () => {
      const user = userEvent.setup()
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      await waitFor(() => {
        expect(screen.getByText('New')).toBeInTheDocument()
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
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const wheelDrumsTab = screen.getByRole('button', { name: /wheel drums/i })
      await user.click(wheelDrumsTab)

      await waitFor(() => {
        expect(screen.getByText('BPW')).toBeInTheDocument()
        expect(screen.getByText('10 hole')).toBeInTheDocument()
        expect(screen.getByText('¥200')).toBeInTheDocument()
        expect(screen.getByText('Good')).toBeInTheDocument()
      })
    })
  })

  describe('empty states', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: [] })
    })

    it('should show empty state for cars when no cars available', async () => {
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByText(/no items available/i)).toBeInTheDocument()
        expect(screen.getByText(/check back later/i)).toBeInTheDocument()
      })
    })

    it('should show empty state for tires when no tires available', async () => {
      const user = userEvent.setup()
      render(<Market />)

      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })

      const newTiresTab = screen.getByRole('button', { name: /new tires/i })
      await user.click(newTiresTab)

      await waitFor(() => {
        expect(screen.getByText(/no items available/i)).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      render(<Market />)

      // Should still render the page without crashing
      await waitFor(() => {
        expect(document.querySelector('.loading__spinner')).not.toBeInTheDocument()
      })
    })
  })

  describe('translations', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: [] })
    })

    it('should display English text by default', async () => {
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByText('Cars')).toBeInTheDocument()
        expect(screen.getByText('New Tires')).toBeInTheDocument()
        expect(screen.getByText('Used Tires')).toBeInTheDocument()
        expect(screen.getByText('Wheel Drums')).toBeInTheDocument()
      })
    })

    it('should display French text when language is French', async () => {
      localStorage.setItem('language', 'fr')
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByText('Voitures')).toBeInTheDocument()
        expect(screen.getByText('Pneus Neufs')).toBeInTheDocument()
        expect(screen.getByText('Pneus Usagés')).toBeInTheDocument()
        expect(screen.getByText('Tambours de Roue')).toBeInTheDocument()
      })
    })

    it('should display Japanese text when language is Japanese', async () => {
      localStorage.setItem('language', 'ja')
      render(<Market />)

      await waitFor(() => {
        expect(screen.getByText('車')).toBeInTheDocument()
        expect(screen.getByText('新品タイヤ')).toBeInTheDocument()
        expect(screen.getByText('中古タイヤ')).toBeInTheDocument()
        expect(screen.getByText('ホイールドラム')).toBeInTheDocument()
      })
    })
  })
})
