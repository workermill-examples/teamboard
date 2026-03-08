'use client'

import { Suspense, use, useState, useEffect } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { TasksByStatusPie } from '@/components/dashboard/tasks-by-status-pie'
import { TasksByAssigneeBar } from '@/components/dashboard/tasks-by-assignee-bar'
import { TasksOverTimeLine } from '@/components/dashboard/tasks-over-time-line'
import { OverdueCountCard } from '@/components/dashboard/overdue-count-card'

interface DashboardStats {
  tasksByStatus: Record<string, number>
  tasksByAssignee: Record<string, { count: number; user: any }>
  tasksOverTime: Array<{ date: string; count: number }>
  overdueCount: number
  totalCards: number
  completedCards: number
}

interface DashboardPageProps {
  params: Promise<{ workspace: string }>
}

function DashboardContent() {
  const { workspace } = useWorkspace()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!workspace?.slug) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/workspaces/${workspace.slug}/stats`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to load dashboard statistics')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [workspace?.slug])

  const retryFetch = async () => {
    if (!workspace?.slug) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/workspaces/${workspace.slug}/stats`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load dashboard statistics')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-600">Workspace analytics and statistics</p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
          description={error}
          action={{ label: 'Try Again', onClick: retryFetch }}
        />
      </div>
    )
  }

  if (loading || !stats) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-600">Workspace analytics and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Cards */}
        <Card data-testid="total-cards">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-600">
              {stats.completedCards} completed
            </p>
          </CardContent>
        </Card>

        {/* Completed Cards */}
        <Card data-testid="completed-cards">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCards}</div>
            <p className="text-xs text-muted-600">
              {stats.totalCards > 0
                ? `${Math.round((stats.completedCards / stats.totalCards) * 100)}% completion rate`
                : 'No cards yet'
              }
            </p>
          </CardContent>
        </Card>

        {/* Overdue Count with Animation */}
        <div data-testid="stat-overdue-count">
          <OverdueCountCard count={stats.overdueCount} />
        </div>

        {/* Active Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCards - stats.completedCards}
            </div>
            <p className="text-xs text-muted-600">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="dashboard-charts">
        {/* Tasks by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>
              Distribution of cards across different columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="chart-tasks-by-status">
              <TasksByStatusPie data={stats.tasksByStatus} />
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Assignee Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Assignee</CardTitle>
            <CardDescription>
              Number of cards assigned to each team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="chart-tasks-by-assignee">
              <TasksByAssigneeBar data={stats.tasksByAssignee} />
            </div>
          </CardContent>
        </Card>

        {/* Tasks Over Time Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tasks Created Over Time</CardTitle>
            <CardDescription>
              Number of cards created per day (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="chart-tasks-over-time">
              <TasksOverTimeLine data={stats.tasksOverTime} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}

        {/* Large chart skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardPageWrapper({ params }: DashboardPageProps) {
  const { workspace } = use(params)
  return <DashboardContent />
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageWrapper params={params} />
    </Suspense>
  )
}