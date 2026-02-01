import { describe, it, expect, beforeAll } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import ImageSlideshow from './ImageSlideshow'

// Mock IntersectionObserver
beforeAll(() => {
  class MockIntersectionObserver {
    readonly root: Element | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []

    constructor() {}

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

describe('ImageSlideshow', () => {
  describe('rendering', () => {
    it('should render the hero section with welcome text', () => {
      render(<ImageSlideshow />)
      expect(screen.getByText(/Welcome to Ndong World Wide/i)).toBeInTheDocument()
    })

    it('should render the mission section', () => {
      render(<ImageSlideshow />)
      const missionSection = document.getElementById('mission')
      expect(missionSection).toBeInTheDocument()
    })

    it('should render the CEO section', () => {
      render(<ImageSlideshow />)
      expect(screen.getByText(/Message from Our Leadership/i)).toBeInTheDocument()
    })

    it('should render provision sections', () => {
      render(<ImageSlideshow />)
      expect(screen.getByText(/Car Provision/i)).toBeInTheDocument()
      expect(screen.getByText(/Tyres Provision/i)).toBeInTheDocument()
      expect(screen.getByText(/Wheels Provision/i)).toBeInTheDocument()
    })
  })

  describe('CEO Section', () => {
    it('should render CEO names', () => {
      render(<ImageSlideshow />)
      expect(screen.getByText('Yoko Hitomi')).toBeInTheDocument()
      expect(screen.getByText('Tebit Fidglas Fon')).toBeInTheDocument()
    })

    it('should render CEO positions', () => {
      render(<ImageSlideshow />)
      expect(screen.getByText('CEO')).toBeInTheDocument()
      expect(screen.getByText('Co-CEO')).toBeInTheDocument()
    })

    it('should render navigation dots for CEOs', () => {
      render(<ImageSlideshow />)
      const dots = screen.getAllByRole('button', { name: /View .+'s message/i })
      expect(dots.length).toBe(2)
    })

    it('should render pause/play button', () => {
      render(<ImageSlideshow />)
      expect(screen.getByRole('button', { name: /Pause slideshow/i })).toBeInTheDocument()
    })

    it('should toggle pause state when pause button is clicked', async () => {
      const user = userEvent.setup()
      render(<ImageSlideshow />)

      const pauseButton = screen.getByRole('button', { name: /Pause slideshow/i })
      await user.click(pauseButton)

      expect(screen.getByRole('button', { name: /Resume slideshow/i })).toBeInTheDocument()
    })

    it('should pause slideshow when navigation dot is clicked', async () => {
      const user = userEvent.setup()
      render(<ImageSlideshow />)

      const dots = screen.getAllByRole('button', { name: /View .+'s message/i })
      await user.click(dots[1])

      // After clicking a dot, slideshow should pause (showing resume button)
      expect(screen.getByRole('button', { name: /Resume slideshow/i })).toBeInTheDocument()
    })

    it('should show first CEO (Yoko) initially with correct theme', () => {
      render(<ImageSlideshow />)

      const ceoSection = document.getElementById('ceo')
      expect(ceoSection).toHaveClass('ceo-section--yoko')
    })

    it('should render CEO images', () => {
      render(<ImageSlideshow />)

      const yokoImage = screen.getByAltText('Yoko Hitomi')
      const tebitImage = screen.getByAltText('Tebit Fidglas Fon')

      expect(yokoImage).toHaveAttribute('src', '/assets/images/yoko.JPG')
      expect(tebitImage).toHaveAttribute('src', '/assets/images/Fon.JPG')
    })

    it('should render CEO messages in blockquotes', () => {
      render(<ImageSlideshow />)

      const blockquotes = document.querySelectorAll('blockquote')
      expect(blockquotes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('slideshow navigation', () => {
    it('should render slideshow navigation arrows', () => {
      render(<ImageSlideshow />)
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
    })

    it('should render slideshow dots', () => {
      render(<ImageSlideshow />)
      const dots = screen.getAllByLabelText(/Go to slide/i)
      expect(dots.length).toBe(5)
    })
  })

  describe('scroll to top button', () => {
    it('should render scroll to top button', () => {
      render(<ImageSlideshow />)
      expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument()
    })
  })
})
