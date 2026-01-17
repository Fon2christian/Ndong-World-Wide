import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test/test-utils'
import CarDashboard from './CarDashboard'
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
    updatedAt: '2024-01-01',
  },
  {
    _id: '2',
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22000,
    mileage: 20000,
    fuel: 'Petrol',
    transmission: 'Manual',
    images: [],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
]

describe('CarDashboard', () => {
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
      render(<CarDashboard />)
      expect(document.querySelector('.loading__spinner')).toBeInTheDocument()
    })
  })

  describe('with cars data', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockCars })
    })

    it('should render Car Market header', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /car market/i })).toBeInTheDocument()
      })
    })

    it('should display car count', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })

    it('should render car cards', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
        expect(screen.getByText('Honda Civic')).toBeInTheDocument()
      })
    })

    it('should display car prices', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('$25,000')).toBeInTheDocument()
        expect(screen.getByText('$22,000')).toBeInTheDocument()
      })
    })

    it('should display car years', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('2022')).toBeInTheDocument()
        expect(screen.getByText('2021')).toBeInTheDocument()
      })
    })

    it('should display car specs', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('15,000 km')).toBeInTheDocument()
        expect(screen.getByText('20,000 km')).toBeInTheDocument()
        expect(screen.getAllByText('Petrol').length).toBe(2)
        expect(screen.getByText('Automatic')).toBeInTheDocument()
        expect(screen.getByText('Manual')).toBeInTheDocument()
      })
    })

    it('should render Contact Seller buttons', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        const contactButtons = screen.getAllByRole('link', { name: /contact seller/i })
        expect(contactButtons.length).toBe(2)
      })
    })

    it('should have correct mailto href on Contact Seller', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        const contactButtons = screen.getAllByRole('link', { name: /contact seller/i })
        expect(contactButtons[0]).toHaveAttribute('href', expect.stringContaining('mailto:'))
        expect(contactButtons[0]).toHaveAttribute('href', expect.stringContaining('Toyota'))
        expect(contactButtons[0]).toHaveAttribute('href', expect.stringContaining('Camry'))
      })
    })

    it('should show image count badge for cars with multiple images', async () => {
      const carsWithMultipleImages = [
        {
          ...mockCars[0],
          images: ['img1', 'img2', 'img3'],
        },
      ]
      mockedAxios.get.mockResolvedValue({ data: carsWithMultipleImages })

      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('+2 photos')).toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: [] })
    })

    it('should show empty state message', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/no cars available/i)).toBeInTheDocument()
      })
    })

    it('should show empty state description', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/check back later/i)).toBeInTheDocument()
      })
    })

    it('should show zero count', async () => {
      render(<CarDashboard />)

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      render(<CarDashboard />)

      // Should still render the page without crashing
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /car market/i })).toBeInTheDocument()
      })
    })
  })
})
