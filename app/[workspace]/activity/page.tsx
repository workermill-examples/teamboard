'use client'

import { Suspense, use } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityItem } from '@/components/activity/activity-item'
import { useActivity } from '@/hooks/use-activity'
import { useSSE } from '@/hooks/use-sse'

interface ActivityPageProps {
  params: Promise<{ workspace: string }>
}

function ActivityContent() {
  const { workspace } = useWorkspace()
  const {
    activities,
    loading,
    error,
    hasMore,
    loadMore,
    retry,
    addActivity
  } = useActivity(workspace?.slug)

  // Set up SSE for real-time activity updates
  useSSE(workspace?.slug, {
    onActivity: (activityData) => {
      addActivity(activityData)
    }
  })

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-muted-600">Recent workspace activity</p>
        </div>
        <ErrorState
          title="Failed to load activity"
          description={error}
          action={{ label: 'Try Again', onClick: retry }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-muted-600">Recent workspace activity</p>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && activities.length === 0 ? (
            <ActivitySkeleton />
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-600 text-sm">
                No activity yet. Start creating boards and cards to see activity here.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}

              {/* Loading indicator for pagination */}
              {loading && activities.length > 0 && (
                <div className="py-4">
                  <ActivitySkeleton count={3} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ActivitySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityPageWrapper({ params }: ActivityPageProps) {
  const { workspace } = use(params)
  return <ActivityContent />
}

export default function ActivityPage({ params }: ActivityPageProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <ActivitySkeleton />
          </CardContent>
        </Card>
      </div>
    }>
      <ActivityPageWrapper params={params} />
    </Suspense>
  )
}