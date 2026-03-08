import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar/sidebar'
import { NavLinks } from '@/components/sidebar/nav-links'
import { useWorkspace } from '@/hooks/use-workspace'
import { useAuth } from '@/hooks/use-auth'

// Mock Next.js hooks
vi.mock('next/navigation')
vi.mock('@/hooks/use-workspace')
vi.mock('@/hooks/use-auth')
vi.mock('next/link', () => ({
  default: function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return <a href={href} {...props}>{children}</a>
  }
}))

const mockUsePathname = usePathname as vi.MockedFunction<typeof usePathname>
const mockUseWorkspace = useWorkspace as vi.MockedFunction<typeof useWorkspace>
const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>

const mockWorkspace = {
  id: '1',
  name: 'Acme Product',
  slug: 'acme-product',
  description: 'Product development workspace',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userRole: 'ADMIN' as const,
  memberCount: 5,
  boardCount: 3,
  members: [],
  boards: [
    {
      id: 'board-1',
      name: 'Product Roadmap',
      description: 'High level product planning',
      position: 0,
      createdAt: '2024-01-01T00:00:00Z',
      starred: true
    },
    {
      id: 'board-2',
      name: 'Sprint 14',
      description: 'Current sprint',
      position: 1,
      createdAt: '2024-01-01T00:00:00Z',
      starred: false
    },
    {
      id: 'board-3',
      name: 'Bug Tracker',
      position: 2,
      createdAt: '2024-01-01T00:00:00Z',
      starred: false
    }
  ]
}

const mockWorkspaceContext = {
  workspace: mockWorkspace,
  loading: false,
  error: null,
  refetch: vi.fn(),
  updateWorkspace: vi.fn(),
  hasPermission: vi.fn(),
  isOwner: false,
  isAdmin: true,
  canEdit: true,
  canManage: true,
  starBoard: vi.fn(),
  unstarBoard: vi.fn(),
}

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUsePathname.mockReturnValue('/acme-product/dashboard')
    mockUseWorkspace.mockReturnValue(mockWorkspaceContext)
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'demo@workermill.com', name: 'Demo User' },
      session: null,
      isLoading: false,
      isAuthenticated: true,
      signOut: vi.fn(),
      updateSession: vi.fn(),
    })
  })

  describe('Desktop Sidebar', () => {
    it('renders workspace information', () => {
      render(<Sidebar variant="desktop" />)

      expect(screen.getByText('Acme Product')).toBeInTheDocument()
      expect(screen.getByText('Product development workspace')).toBeInTheDocument()
    })

    it('displays main navigation items', () => {
      render(<Sidebar variant="desktop" />)

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /activity/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /members/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    })

    it('highlights active navigation item', () => {
      render(<Sidebar variant="desktop" />)

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('bg-primary-50', 'text-primary-700')

      const activityLink = screen.getByRole('link', { name: /activity/i })
      expect(activityLink).not.toHaveClass('bg-primary-50')
    })

    it('shows settings link for admins', () => {
      render(<Sidebar variant="desktop" />)

      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    })

    it('hides settings link for non-admin users', () => {
      mockUseWorkspace.mockReturnValue({
        ...mockWorkspaceContext,
        canManage: false,
        isAdmin: false,
        hasPermission: (action) => action !== 'manage'
      })

      render(<Sidebar variant="desktop" />)

      expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument()
    })
  })

  describe('Mobile Sidebar', () => {
    it('renders mobile header with workspace name', () => {
      render(<Sidebar variant="mobile" />)

      expect(screen.getByText('Acme Product')).toBeInTheDocument()
      expect(screen.getByLabelText('Open sidebar')).toBeInTheDocument()
    })

    it('opens and closes mobile sidebar', async () => {
      const user = userEvent.setup()
      render(<Sidebar variant="mobile" />)

      const openButton = screen.getByLabelText('Open sidebar')
      await user.click(openButton)

      // Sidebar content should be visible
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()

      const closeButton = screen.getByLabelText('Close sidebar')
      await user.click(closeButton)

      // Sidebar should close
      expect(screen.queryByLabelText('Close sidebar')).not.toBeInTheDocument()
    })

    it('closes sidebar with escape key', async () => {
      const user = userEvent.setup()
      render(<Sidebar variant="mobile" />)

      // Open sidebar
      const openButton = screen.getByLabelText('Open sidebar')
      await user.click(openButton)

      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()

      // Press escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByLabelText('Close sidebar')).not.toBeInTheDocument()
      })
    })
  })

  describe('Navigation Links Component', () => {
    it('renders all navigation items with correct hrefs', () => {
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      expect(screen.getByRole('link', { name: /dashboard/i }))
        .toHaveAttribute('href', '/acme-product/dashboard')
      expect(screen.getByRole('link', { name: /activity/i }))
        .toHaveAttribute('href', '/acme-product/activity')
      expect(screen.getByRole('link', { name: /members/i }))
        .toHaveAttribute('href', '/acme-product/members')
      expect(screen.getByRole('link', { name: /settings/i }))
        .toHaveAttribute('href', '/acme-product/settings')
    })

    it('displays board count correctly', () => {
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      expect(screen.getByText('Boards (3)')).toBeInTheDocument()
    })

    it('expands and collapses boards section', async () => {
      const user = userEvent.setup()
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      // Boards should be expanded by default
      expect(screen.getByText('Product Roadmap')).toBeInTheDocument()
      expect(screen.getByText('Sprint 14')).toBeInTheDocument()

      // Click to collapse
      const boardsToggle = screen.getByRole('button', { name: /boards \(3\)/i })
      await user.click(boardsToggle)

      // Boards should be hidden
      expect(screen.queryByText('Product Roadmap')).not.toBeInTheDocument()
      expect(screen.queryByText('Sprint 14')).not.toBeInTheDocument()

      // Click to expand again
      await user.click(boardsToggle)

      // Boards should be visible
      expect(screen.getByText('Product Roadmap')).toBeInTheDocument()
      expect(screen.getByText('Sprint 14')).toBeInTheDocument()
    })

    it('separates starred and unstarred boards', () => {
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      // Starred board should appear first
      const boardLinks = screen.getAllByRole('link', { name: /product roadmap|sprint 14|bug tracker/i })
      expect(boardLinks[0]).toHaveTextContent('Product Roadmap')
    })

    it('allows starring and unstarring boards', async () => {
      const user = userEvent.setup()
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      // Find the star button for an unstarred board
      const starButton = screen.getByTestId('star-board-board-2-desktop')
      await user.click(starButton)

      expect(mockWorkspaceContext.starBoard).toHaveBeenCalledWith('board-2')

      // Find the star button for a starred board
      const unstarButton = screen.getByTestId('star-board-board-1-desktop')
      await user.click(unstarButton)

      expect(mockWorkspaceContext.unstarBoard).toHaveBeenCalledWith('board-1')
    })

    it('shows create board link for users with edit permissions', () => {
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      const createBoardLink = screen.getByLabelText('Create new board')
      expect(createBoardLink).toBeInTheDocument()
      expect(createBoardLink).toHaveAttribute('href', '/acme-product/boards/new')
    })

    it('hides create board link for users without edit permissions', () => {
      mockUseWorkspace.mockReturnValue({
        ...mockWorkspaceContext,
        canEdit: false,
      })

      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      expect(screen.queryByLabelText('Create new board')).not.toBeInTheDocument()
    })

    it('shows appropriate message when no boards exist', () => {
      const emptyWorkspace = {
        ...mockWorkspace,
        boards: [],
        boardCount: 0
      }

      render(<NavLinks workspace={emptyWorkspace} variant="desktop" />)

      expect(screen.getByText('Boards (0)')).toBeInTheDocument()
      expect(screen.getByText(/no boards yet/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument()
    })

    it('uses distinct test IDs for desktop and mobile variants', () => {
      const { rerender } = render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      // Check desktop test IDs
      expect(screen.getByTestId('board-link-board-1-desktop')).toBeInTheDocument()
      expect(screen.getByTestId('star-board-board-1-desktop')).toBeInTheDocument()

      rerender(<NavLinks workspace={mockWorkspace} variant="mobile" />)

      // Check mobile test IDs
      expect(screen.getByTestId('board-link-board-1-mobile')).toBeInTheDocument()
      expect(screen.getByTestId('star-board-board-1-mobile')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows skeleton loading when workspace is loading', () => {
      mockUseWorkspace.mockReturnValue({
        ...mockWorkspaceContext,
        workspace: null,
        loading: true,
      })

      render(<Sidebar variant="desktop" />)

      // Should have skeleton elements
      const skeletons = screen.getAllByRole('generic').filter(el =>
        el.className?.includes('animate-pulse') || el.className?.includes('skeleton')
      )
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows error state when workspace fails to load', () => {
      mockUseWorkspace.mockReturnValue({
        ...mockWorkspaceContext,
        workspace: null,
        loading: false,
        error: 'Failed to load workspace',
      })

      render(<Sidebar variant="desktop" />)

      expect(screen.getByText('Failed to load workspace')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(<Sidebar variant="mobile" />)

      expect(screen.getByLabelText('Open sidebar')).toBeInTheDocument()
    })

    it('maintains keyboard navigation support', () => {
      render(<Sidebar variant="desktop" />)

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href')
      })
    })

    it('provides meaningful button labels for star/unstar actions', () => {
      render(<NavLinks workspace={mockWorkspace} variant="desktop" />)

      expect(screen.getByLabelText('Unstar board')).toBeInTheDocument() // starred board
      expect(screen.getByLabelText('Star board')).toBeInTheDocument() // unstarred board
    })
  })
})