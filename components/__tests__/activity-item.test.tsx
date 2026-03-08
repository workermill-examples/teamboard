import { render, screen } from '@testing-library/react'
import { ActivityItem } from '@/components/activity/activity-item'
import { Activity } from '@/hooks/use-activity'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
}))

// Mock date formatting utility
vi.mock('@/lib/utils', () => ({
  formatRelativeTime: vi.fn((date) => {
    const now = new Date('2024-01-15T12:00:00Z')
    const activityDate = new Date(date)
    const diff = now.getTime() - activityDate.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' '))
}))

const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg'
}

const mockBoard = {
  id: 'board-1',
  name: 'Product Roadmap'
}

const mockCard = {
  id: 'card-1',
  title: 'Implement authentication'
}

describe('ActivityItem Component', () => {
  describe('User Avatar and Information', () => {
    it('displays user avatar when provided', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('displays user initials when no avatar', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: { ...mockUser, avatar: null },
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText('J')).toBeInTheDocument()
      expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument()
    })

    it('displays relative timestamp', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText('90 minutes ago')).toBeInTheDocument()
    })
  })

  describe('Activity Type Descriptions', () => {
    it('renders card created activity correctly', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText('John Doe', { exact: false })).toBeInTheDocument()
      expect(screen.getByText(/created card/)).toBeInTheDocument()
      expect(screen.getByText('Implement authentication')).toBeInTheDocument()
      expect(screen.getByText('Product Roadmap')).toBeInTheDocument()
    })

    it('renders card moved activity with column information', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_moved',
        entityType: 'card',
        entityId: 'card-1',
        data: {
          fromColumn: 'Todo',
          toColumn: 'In Progress'
        },
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/moved/)).toBeInTheDocument()
      expect(screen.getByText('Todo')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('renders card assigned activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_assigned',
        entityType: 'card',
        entityId: 'card-1',
        data: {
          assignee: { name: 'Jane Smith' }
        },
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/assigned/)).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('renders card due date set activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_due_date_set',
        entityType: 'card',
        entityId: 'card-1',
        data: {
          dueDate: '2024-12-31T23:59:59Z'
        },
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/set due date/)).toBeInTheDocument()
      expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument()
    })

    it('renders card priority changed activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_priority_changed',
        entityType: 'card',
        entityId: 'card-1',
        data: {
          priority: 'HIGH'
        },
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/changed priority/)).toBeInTheDocument()
      expect(screen.getByText(/high/)).toBeInTheDocument()
    })

    it('renders comment added activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'comment_added',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/commented on/)).toBeInTheDocument()
    })

    it('renders board created activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'board_created',
        entityType: 'board',
        entityId: 'board-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/created board/)).toBeInTheDocument()
      expect(screen.getByText('Product Roadmap')).toBeInTheDocument()
    })

    it('renders member joined activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'member_joined',
        entityType: 'workspace',
        entityId: 'workspace-1',
        data: {},
        user: mockUser,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/joined the workspace/)).toBeInTheDocument()
    })

    it('renders card deleted activity with title from data', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_deleted',
        entityType: 'card',
        entityId: 'card-1',
        data: {
          cardTitle: 'Deleted Card Title'
        },
        user: mockUser,
        board: mockBoard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/deleted card/)).toBeInTheDocument()
      expect(screen.getByText('Deleted Card Title')).toBeInTheDocument()
    })

    it('handles unknown activity types with fallback', () => {
      const activity: Activity = {
        id: '1',
        type: 'unknown_action',
        entityType: 'unknown',
        entityId: 'unknown-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/performed an action/)).toBeInTheDocument()
    })
  })

  describe('Activity Icons', () => {
    it('displays appropriate icons for different activity types', () => {
      const cardCreatedActivity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={cardCreatedActivity} />)

      expect(screen.getByText('📋')).toBeInTheDocument()
    })

    it('shows correct icon for card moved activity', () => {
      const cardMovedActivity: Activity = {
        id: '1',
        type: 'card_moved',
        entityType: 'card',
        entityId: 'card-1',
        data: { fromColumn: 'Todo', toColumn: 'Done' },
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={cardMovedActivity} />)

      expect(screen.getByText('🔄')).toBeInTheDocument()
    })

    it('shows correct icon for comment activity', () => {
      const commentActivity: Activity = {
        id: '1',
        type: 'comment_added',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={commentActivity} />)

      expect(screen.getByText('💬')).toBeInTheDocument()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles missing card information gracefully', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/created card/)).toBeInTheDocument()
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('handles missing board information gracefully', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/created card/)).toBeInTheDocument()
      expect(screen.queryByText('in Product Roadmap')).not.toBeInTheDocument()
    })

    it('handles missing assignee data in assignment activity', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_assigned',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      render(<ActivityItem activity={activity} />)

      expect(screen.getByText(/assigned/)).toBeInTheDocument()
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      const { container } = render(<ActivityItem activity={activity} className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Layout and Styling', () => {
    it('has proper structure with avatar and content areas', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      const { container } = render(<ActivityItem activity={activity} />)

      // Should have main container
      expect(container.firstChild).toHaveClass('flex', 'items-start', 'gap-3')

      // Should have avatar section
      const avatarSection = container.querySelector('.flex-shrink-0')
      expect(avatarSection).toBeInTheDocument()

      // Should have content section
      const contentSection = container.querySelector('.flex-1')
      expect(contentSection).toBeInTheDocument()
    })

    it('maintains consistent typography and spacing', () => {
      const activity: Activity = {
        id: '1',
        type: 'card_created',
        entityType: 'card',
        entityId: 'card-1',
        data: {},
        user: mockUser,
        board: mockBoard,
        card: mockCard,
        createdAt: '2024-01-15T10:30:00Z'
      }

      const { container } = render(<ActivityItem activity={activity} />)

      // Check for proper text sizing
      const description = container.querySelector('.text-sm')
      expect(description).toBeInTheDocument()

      // Check for proper timestamp styling
      const timestamp = container.querySelector('.text-xs')
      expect(timestamp).toBeInTheDocument()
    })
  })
})