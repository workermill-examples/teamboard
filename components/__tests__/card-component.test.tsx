import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { CardComponent } from '@/components/board/card-component'
import { BoardCard } from '@/hooks/use-board'

// Mock date-fns functions
vi.mock('date-fns', () => ({
  format: vi.fn((date) => new Date(date).toLocaleDateString()),
  formatDistanceToNow: vi.fn((date) => '2 days ago'),
  isAfter: vi.fn((date1, date2) => new Date(date1) > new Date(date2)),
}))

// Helper to render card with DnD context
function renderCard(card: BoardCard, props = {}) {
  return render(
    <DndContext onDragEnd={() => {}}>
      <SortableContext items={[card.id]}>
        <CardComponent card={card} {...props} />
      </SortableContext>
    </DndContext>
  )
}

const mockCard: BoardCard = {
  id: 'card-1',
  title: 'Implement user authentication',
  description: 'Add NextAuth.js with email/password login and session management',
  position: 1,
  priority: 'HIGH',
  dueDate: '2024-12-31T23:59:59Z',
  coverColor: '#6366f1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z',
  assignee: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  },
  labels: [
    { id: 'label-1', name: 'Frontend', color: '#3b82f6' },
    { id: 'label-2', name: 'Backend', color: '#ef4444' }
  ],
  commentCount: 3,
  checklistCount: 5
}

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('renders card title and description', () => {
      renderCard(mockCard)

      expect(screen.getByText('Implement user authentication')).toBeInTheDocument()
      expect(screen.getByText(/Add NextAuth.js with email\/password/)).toBeInTheDocument()
    })

    it('renders without description when not provided', () => {
      const cardWithoutDescription = {
        ...mockCard,
        description: undefined
      }

      renderCard(cardWithoutDescription)

      expect(screen.getByText('Implement user authentication')).toBeInTheDocument()
      expect(screen.queryByText(/Add NextAuth.js/)).not.toBeInTheDocument()
    })

    it('applies cover color as border style', () => {
      const { container } = renderCard(mockCard)

      const cardElement = container.querySelector('[style*="border-top-color"]')
      expect(cardElement).toHaveStyle({ borderTopColor: '#6366f1' })
    })

    it('handles cards without cover color', () => {
      const cardWithoutCover = {
        ...mockCard,
        coverColor: undefined
      }

      const { container } = renderCard(cardWithoutCover)

      const cardElement = container.querySelector('.border-t-4')
      expect(cardElement).toBeNull()
    })
  })

  describe('Priority Badge', () => {
    it('displays high priority badge', () => {
      renderCard(mockCard)

      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('High')).toHaveClass('bg-warning-100', 'text-warning-700')
    })

    it('displays urgent priority badge with correct styling', () => {
      const urgentCard = { ...mockCard, priority: 'URGENT' as const }
      renderCard(urgentCard)

      expect(screen.getByText('Urgent')).toBeInTheDocument()
      expect(screen.getByText('Urgent')).toHaveClass('bg-destructive-100', 'text-destructive-700')
    })

    it('displays low priority badge', () => {
      const lowCard = { ...mockCard, priority: 'LOW' as const }
      renderCard(lowCard)

      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Low')).toHaveClass('bg-muted-100', 'text-muted-700')
    })

    it('does not show priority badge for medium priority', () => {
      const mediumCard = { ...mockCard, priority: 'MEDIUM' as const }
      renderCard(mediumCard)

      expect(screen.queryByText('Medium')).not.toBeInTheDocument()
    })
  })

  describe('Due Date', () => {
    it('displays due date with relative format', () => {
      renderCard(mockCard)

      expect(screen.getByText('2 days ago')).toBeInTheDocument()
    })

    it('shows calendar icon with due date', () => {
      renderCard(mockCard)

      const dueDateChip = screen.getByText('2 days ago').closest('span')
      expect(dueDateChip?.querySelector('svg')).toBeInTheDocument()
    })

    it('does not show due date when not set', () => {
      const cardWithoutDueDate = {
        ...mockCard,
        dueDate: undefined
      }

      renderCard(cardWithoutDueDate)

      expect(screen.queryByText('2 days ago')).not.toBeInTheDocument()
    })
  })

  describe('Labels', () => {
    it('displays labels with correct colors', () => {
      renderCard(mockCard)

      const frontendLabel = screen.getByText('Frontend')
      const backendLabel = screen.getByText('Backend')

      expect(frontendLabel).toBeInTheDocument()
      expect(backendLabel).toBeInTheDocument()

      // Check that labels have background colors applied
      expect(frontendLabel).toHaveStyle({ backgroundColor: '#3b82f6' })
      expect(backendLabel).toHaveStyle({ backgroundColor: '#ef4444' })
    })

    it('limits displayed labels to 3 and shows count for overflow', () => {
      const cardWithManyLabels = {
        ...mockCard,
        labels: [
          ...mockCard.labels,
          { id: 'label-3', name: 'Bug', color: '#f59e0b' },
          { id: 'label-4', name: 'Feature', color: '#22c55e' },
          { id: 'label-5', name: 'Urgent', color: '#ef4444' }
        ]
      }

      renderCard(cardWithManyLabels)

      expect(screen.getByText('Frontend')).toBeInTheDocument()
      expect(screen.getByText('Backend')).toBeInTheDocument()
      expect(screen.getByText('Bug')).toBeInTheDocument()
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('handles cards with no labels', () => {
      const cardWithoutLabels = {
        ...mockCard,
        labels: []
      }

      renderCard(cardWithoutLabels)

      expect(screen.queryByText('Frontend')).not.toBeInTheDocument()
      expect(screen.queryByText('Backend')).not.toBeInTheDocument()
    })
  })

  describe('Assignee Avatar', () => {
    it('displays assignee avatar with image', () => {
      renderCard(mockCard)

      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('displays initials when no avatar image', () => {
      const cardWithoutAvatar = {
        ...mockCard,
        assignee: {
          ...mockCard.assignee!,
          avatar: undefined
        }
      }

      renderCard(cardWithoutAvatar)

      expect(screen.getByText('JD')).toBeInTheDocument()
      expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument()
    })

    it('handles single name for initials', () => {
      const cardWithSingleName = {
        ...mockCard,
        assignee: {
          ...mockCard.assignee!,
          name: 'Madonna',
          avatar: undefined
        }
      }

      renderCard(cardWithSingleName)

      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('limits initials to 2 characters', () => {
      const cardWithLongName = {
        ...mockCard,
        assignee: {
          ...mockCard.assignee!,
          name: 'John Michael Smith Johnson',
          avatar: undefined
        }
      }

      renderCard(cardWithLongName)

      expect(screen.getByText('JM')).toBeInTheDocument()
    })

    it('does not show assignee section when card is unassigned', () => {
      const unassignedCard = {
        ...mockCard,
        assignee: undefined
      }

      renderCard(unassignedCard)

      expect(screen.queryByAltText(/john doe/i)).not.toBeInTheDocument()
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
    })
  })

  describe('Meta Information', () => {
    it('displays comment count with icon', () => {
      renderCard(mockCard)

      expect(screen.getByText('3')).toBeInTheDocument()

      // Check for comment icon
      const commentSection = screen.getByText('3').closest('span')
      expect(commentSection?.querySelector('svg')).toBeInTheDocument()
    })

    it('displays checklist count with icon', () => {
      renderCard(mockCard)

      expect(screen.getByText('5')).toBeInTheDocument()

      // Check for checklist icon
      const checklistSection = screen.getByText('5').closest('span')
      expect(checklistSection?.querySelector('svg')).toBeInTheDocument()
    })

    it('hides comment count when zero', () => {
      const cardWithoutComments = {
        ...mockCard,
        commentCount: 0
      }

      renderCard(cardWithoutComments)

      // Should not show comment count section
      const textContent = screen.getByRole('generic').textContent
      expect(textContent).not.toMatch(/\b0\b.*comment/)
    })

    it('hides checklist count when zero', () => {
      const cardWithoutChecklist = {
        ...mockCard,
        checklistCount: 0
      }

      renderCard(cardWithoutChecklist)

      // Should not show checklist icon
      expect(screen.queryByTestId('checklist-progress')).not.toBeInTheDocument()
    })
  })

  describe('Interaction and States', () => {
    it('calls onClick when card is clicked', async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()

      renderCard(mockCard, { onClick })

      const cardElement = screen.getByText('Implement user authentication').closest('[role="button"]')
        || screen.getByText('Implement user authentication').closest('div')

      if (cardElement) {
        await user.click(cardElement)
        expect(onClick).toHaveBeenCalled()
      }
    })

    it('applies dragging styles when isDragging is true', () => {
      const { container } = renderCard(mockCard, { isDragging: true })

      const cardElement = container.querySelector('.opacity-50')
      expect(cardElement).toBeInTheDocument()
    })

    it('applies hover styles for interactive feedback', () => {
      const { container } = renderCard(mockCard)

      const cardElement = container.querySelector('.hover\\:shadow-md')
      expect(cardElement).toBeInTheDocument()
    })

    it('is accessible as a clickable element', () => {
      renderCard(mockCard)

      const cardElement = screen.getByText('Implement user authentication').closest('div')
      expect(cardElement).toHaveClass('cursor-pointer')
    })
  })

  describe('Content Truncation', () => {
    it('truncates long titles appropriately', () => {
      const longTitleCard = {
        ...mockCard,
        title: 'This is an extremely long card title that should be truncated after a certain number of lines to maintain card layout consistency'
      }

      renderCard(longTitleCard)

      const titleElement = screen.getByText(/This is an extremely long card title/)
      expect(titleElement).toHaveClass('line-clamp-3')
    })

    it('truncates long descriptions appropriately', () => {
      const longDescCard = {
        ...mockCard,
        description: 'This is a very long description that contains many details about the implementation requirements and should be truncated to maintain card size'
      }

      renderCard(longDescCard)

      const descElement = screen.getByText(/This is a very long description/)
      expect(descElement).toHaveClass('line-clamp-2')
    })
  })

  describe('Visual Design', () => {
    it('maintains proper spacing and layout structure', () => {
      const { container } = renderCard(mockCard)

      // Check for proper card structure
      const cardElement = container.querySelector('.p-3')
      expect(cardElement).toBeInTheDocument()

      // Check for footer with border
      const footer = container.querySelector('.border-t')
      expect(footer).toBeInTheDocument()
    })

    it('uses consistent color scheme', () => {
      renderCard(mockCard)

      const priorityBadge = screen.getByText('High')
      expect(priorityBadge).toHaveClass('bg-warning-100', 'text-warning-700')
    })
  })
})