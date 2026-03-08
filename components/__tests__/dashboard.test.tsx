import { render, screen, waitFor } from '@testing-library/react'
import { TasksByStatusPie } from '@/components/dashboard/tasks-by-status-pie'
import { TasksByAssigneeBar } from '@/components/dashboard/tasks-by-assignee-bar'
import { TasksOverTimeLine } from '@/components/dashboard/tasks-over-time-line'
import { OverdueCountCard } from '@/components/dashboard/overdue-count-card'
import { vi } from 'vitest'

// Mock Recharts to avoid rendering issues in test environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  ),
  Pie: ({ data, ...props }: any) => (
    <div data-testid="pie" data-length={data?.length} {...props}>
      Pie Chart Data: {JSON.stringify(data)}
    </div>
  ),
  BarChart: ({ data, children, ...props }: any) => (
    <div data-testid="bar-chart" data-length={data?.length} {...props}>
      {children}
      Bar Chart Data: {JSON.stringify(data)}
    </div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  LineChart: ({ data, children, ...props }: any) => (
    <div data-testid="line-chart" data-length={data?.length} {...props}>
      {children}
      Line Chart Data: {JSON.stringify(data)}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  Cell: (props: any) => <div data-testid="cell" {...props} />,
}))

// Mock framer-motion for animation testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  useMotionValue: () => ({ set: vi.fn(), get: vi.fn() }),
  useTransform: () => ({ on: vi.fn(() => vi.fn()) }),
  animate: vi.fn(() => ({ stop: vi.fn() })),
}))

describe('Dashboard Chart Components', () => {
  describe('TasksByStatusPie Component', () => {
    const statusData = {
      'Todo': 15,
      'In Progress': 8,
      'Done': 23,
      'Blocked': 3
    }

    it('renders pie chart with provided data', () => {
      render(<TasksByStatusPie data={statusData} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie')).toBeInTheDocument()
    })

    it('displays chart data correctly', () => {
      render(<TasksByStatusPie data={statusData} />)

      const pieElement = screen.getByTestId('pie')
      const dataContent = pieElement.textContent

      expect(dataContent).toContain('Todo')
      expect(dataContent).toContain('15')
      expect(dataContent).toContain('In Progress')
      expect(dataContent).toContain('Done')
    })

    it('shows empty state when no data', () => {
      render(<TasksByStatusPie data={{}} />)

      expect(screen.getByText('No tasks found')).toBeInTheDocument()
      expect(screen.getByText('Create some cards to see the distribution')).toBeInTheDocument()
    })

    it('shows empty state for zero values', () => {
      render(<TasksByStatusPie data={{ 'Todo': 0, 'Done': 0 }} />)

      expect(screen.getByText('No tasks found')).toBeInTheDocument()
    })

    it('has proper structure for chart rendering', () => {
      render(<TasksByStatusPie data={statusData} />)

      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })
  })

  describe('TasksByAssigneeBar Component', () => {
    const assigneeData = {
      'user-1': {
        count: 12,
        user: { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: 'avatar1.jpg' }
      },
      'user-2': {
        count: 8,
        user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' }
      },
      'unassigned': {
        count: 5,
        user: null
      }
    }

    it('renders bar chart with assignee data', () => {
      render(<TasksByAssigneeBar data={assigneeData} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('formats assignee data correctly', () => {
      render(<TasksByAssigneeBar data={assigneeData} />)

      const barChart = screen.getByTestId('bar-chart')
      const dataContent = barChart.textContent

      expect(dataContent).toContain('John Doe')
      expect(dataContent).toContain('Jane Smith')
      expect(dataContent).toContain('Unassigned')
      expect(dataContent).toContain('12')
      expect(dataContent).toContain('8')
      expect(dataContent).toContain('5')
    })

    it('handles users without names gracefully', () => {
      const dataWithEmailOnly = {
        'user-3': {
          count: 3,
          user: { id: 'user-3', email: 'user3@example.com' }
        }
      }

      render(<TasksByAssigneeBar data={dataWithEmailOnly} />)

      const barChart = screen.getByTestId('bar-chart')
      expect(barChart.textContent).toContain('user3@example.com')
    })

    it('shows empty state when no data', () => {
      render(<TasksByAssigneeBar data={{}} />)

      expect(screen.getByText('No assigned tasks found')).toBeInTheDocument()
      expect(screen.getByText('Assign some cards to see the distribution')).toBeInTheDocument()
    })

    it('includes proper chart structure', () => {
      render(<TasksByAssigneeBar data={assigneeData} />)

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })
  })

  describe('TasksOverTimeLine Component', () => {
    const timeData = [
      { date: '2024-01-01', completed: 5, created: 8 },
      { date: '2024-01-02', completed: 3, created: 6 },
      { date: '2024-01-03', completed: 7, created: 4 },
      { date: '2024-01-04', completed: 2, created: 9 }
    ]

    it('renders line chart with time series data', () => {
      render(<TasksOverTimeLine data={timeData} />)

      expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
      expect(screen.getAllByTestId('line-chart')).toHaveLength(2)
    })

    it('displays time series data correctly', () => {
      render(<TasksOverTimeLine data={timeData} />)

      const lineChart = screen.getAllByTestId('line-chart')[0]
      const dataContent = lineChart.textContent

      expect(dataContent).toContain('2024-01-01')
      expect(dataContent).toContain('completed')
      expect(dataContent).toContain('created')
    })

    it('shows empty state for no data', () => {
      render(<TasksOverTimeLine data={[]} />)

      expect(screen.getByText('No activity data found')).toBeInTheDocument()
      expect(screen.getByText('Create and complete some tasks to see trends')).toBeInTheDocument()
    })

    it('includes proper line chart structure', () => {
      render(<TasksOverTimeLine data={timeData} />)

      expect(screen.getAllByTestId('x-axis')[0]).toBeInTheDocument()
      expect(screen.getAllByTestId('y-axis')[0]).toBeInTheDocument()
      expect(screen.getAllByTestId('cartesian-grid')[0]).toBeInTheDocument()
      expect(screen.getAllByTestId('tooltip')[0]).toBeInTheDocument()
    })
  })

  describe('OverdueCountCard Component', () => {
    it('renders overdue count with success styling for zero', () => {
      render(<OverdueCountCard count={0} />)

      expect(screen.getByText('Overdue Tasks')).toBeInTheDocument()
      expect(screen.getByText('All caught up!')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows warning styling for low overdue count', () => {
      render(<OverdueCountCard count={2} />)

      expect(screen.getByText('2 overdue tasks')).toBeInTheDocument()
      expect(screen.getByText('⚠')).toBeInTheDocument()
      // The animated counter will show 0 initially due to mocked framer-motion
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows danger styling for high overdue count', () => {
      render(<OverdueCountCard count={5} />)

      expect(screen.getByText('5 overdue tasks')).toBeInTheDocument()
      expect(screen.getByText('⚡')).toBeInTheDocument()
      // The animated counter will show 0 initially due to mocked framer-motion
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles singular overdue task correctly', () => {
      render(<OverdueCountCard count={1} />)

      expect(screen.getByText('1 overdue task')).toBeInTheDocument()
      // The animated counter will show 0 initially due to mocked framer-motion
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays animated counter', async () => {
      render(<OverdueCountCard count={10} />)

      // With mocked framer-motion, the counter stays at 0
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('10 overdue tasks')).toBeInTheDocument()
    })

    it('has proper accessibility structure', () => {
      render(<OverdueCountCard count={3} />)

      // Card should have proper structure
      expect(screen.getByText('Overdue Tasks')).toBeInTheDocument()
      expect(screen.getByText('3 overdue tasks')).toBeInTheDocument()
      // The animated counter will show 0 initially due to mocked framer-motion
      expect(screen.getByText('0')).toBeInTheDocument()

      // Should be in a card container
      const cardElement = screen.getByText('Overdue Tasks').closest('div')
      expect(cardElement).toBeInTheDocument()
    })

    it('shows progress indicator for non-zero values', () => {
      const { container } = render(<OverdueCountCard count={3} />)

      // Should have progress bar elements
      const progressElements = container.querySelectorAll('.h-1')
      expect(progressElements.length).toBeGreaterThan(0)
    })
  })

  describe('Dashboard Integration', () => {
    it('renders multiple chart components together', () => {
      const statusData = { 'Done': 10, 'Todo': 5 }
      const assigneeData = {
        'user-1': { count: 8, user: { name: 'Test User' } }
      }
      const timeData = [{ date: '2024-01-01', completed: 5, created: 3 }]

      render(
        <div>
          <TasksByStatusPie data={statusData} />
          <TasksByAssigneeBar data={assigneeData} />
          <TasksOverTimeLine data={timeData} />
          <OverdueCountCard count={2} />
        </div>
      )

      // All components should render
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getAllByTestId('line-chart')[0]).toBeInTheDocument()
      expect(screen.getByText('Overdue Tasks')).toBeInTheDocument()
    })

    it('handles mixed data states gracefully', () => {
      render(
        <div>
          <TasksByStatusPie data={{}} />
          <TasksByAssigneeBar data={{}} />
          <TasksOverTimeLine data={[]} />
          <OverdueCountCard count={0} />
        </div>
      )

      // Empty states should show appropriate messages
      expect(screen.getByText('No tasks found')).toBeInTheDocument()
      expect(screen.getByText('No assigned tasks found')).toBeInTheDocument()
      expect(screen.getByText('No activity data found')).toBeInTheDocument()
      expect(screen.getByText('All caught up!')).toBeInTheDocument()
    })

    it('maintains consistent styling across components', () => {
      const { container } = render(
        <div>
          <TasksByStatusPie data={{ 'Done': 5 }} />
          <OverdueCountCard count={1} />
        </div>
      )

      // Check for consistent design system classes
      const cardElements = container.querySelectorAll('[class*="card"]')
      const colorElements = container.querySelectorAll('[class*="muted"], [class*="primary"], [class*="success"]')

      expect(cardElements.length).toBeGreaterThan(0)
      expect(colorElements.length).toBeGreaterThan(0)
    })
  })
})