import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'

// Mock Next.js router and Link
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
}))

describe('Landing Page Components', () => {
  describe('Hero Component', () => {
    it('renders main heading correctly', () => {
      render(<Hero />)

      expect(screen.getByText('Streamline your')).toBeInTheDocument()
      expect(screen.getByText('team\'s workflow')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<Hero />)

      expect(screen.getByText(/Transform the way your team collaborates/)).toBeInTheDocument()
      expect(screen.getByText(/real-time updates/)).toBeInTheDocument()
      expect(screen.getByText(/intuitive project management/)).toBeInTheDocument()
    })

    it('has "Try the Demo" CTA button with correct link', () => {
      render(<Hero />)

      const ctaButton = screen.getByRole('link', { name: /try the demo/i })
      expect(ctaButton).toBeInTheDocument()
      expect(ctaButton).toHaveAttribute('href', '/login')
    })

    it('has "Learn more" button with anchor link', () => {
      render(<Hero />)

      const learnMoreButton = screen.getByRole('link', { name: /learn more/i })
      expect(learnMoreButton).toBeInTheDocument()
      expect(learnMoreButton).toHaveAttribute('href', '#features')
    })

    it('displays trust indicators', () => {
      render(<Hero />)

      expect(screen.getByText('Trusted by teams at')).toBeInTheDocument()
      expect(screen.getByText('WorkerMill')).toBeInTheDocument()
      expect(screen.getByText('Startups')).toBeInTheDocument()
      expect(screen.getByText('Enterprises')).toBeInTheDocument()
    })

    it('renders dashboard preview mockup', () => {
      render(<Hero />)

      // Check for mockup structure elements
      expect(screen.getByText('teamboard.workermill.com')).toBeInTheDocument()
    })
  })

  describe('Features Component', () => {
    it('renders features section correctly', () => {
      render(<Features />)

      // Check for features text
      expect(screen.getByText(/Features/i)).toBeInTheDocument()
    })

    it('displays feature cards with realistic content', () => {
      render(<Features />)

      // Look for common feature-related keywords
      expect(screen.getByText(/kanban/i) || screen.getByText(/board/i) || screen.getByText(/collaboration/i)).toBeInTheDocument()
    })
  })

  describe('How It Works Component', () => {
    it('renders how it works section', () => {
      render(<HowItWorks />)

      // Check for section header
      expect(screen.getByText(/how it works/i) || screen.getByText(/getting started/i) || screen.getByText(/workflow/i)).toBeInTheDocument()
    })

    it('has structured workflow steps', () => {
      render(<HowItWorks />)

      // Look for numbered content or workflow-related elements
      const container = document.body
      const numberedElements = container.querySelectorAll('[class*="rounded-full"]')
      // Should have some step-like structure
      expect(numberedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Landing Page Integration', () => {
    it('uses professional copy without placeholder text', () => {
      render(
        <div>
          <Hero />
          <Features />
          <HowItWorks />
        </div>
      )

      // Ensure no placeholder text is used
      expect(screen.queryByText(/lorem ipsum/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/todo/i)).not.toBeInTheDocument()
    })

    it('has consistent design system styling', () => {
      const { container } = render(<Hero />)

      // Check for consistent class patterns indicating design system usage
      const elementsWithPrimary = container.querySelectorAll('[class*="primary"]')
      const elementsWithShadow = container.querySelectorAll('[class*="shadow"]')
      const elementsWithRounded = container.querySelectorAll('[class*="rounded"]')

      expect(elementsWithPrimary.length).toBeGreaterThan(0)
      expect(elementsWithShadow.length).toBeGreaterThan(0)
      expect(elementsWithRounded.length).toBeGreaterThan(0)
    })

    it('maintains accessibility standards', () => {
      render(<Hero />)

      // Check for proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()

      // Check for proper link accessibility
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeVisible()
      })
    })
  })
})