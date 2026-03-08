'use client'

import { Suspense } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { MemberList } from '@/components/members/member-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function MembersPageContent() {
  const { workspace, loading, error, canManage } = useWorkspace()

  if (loading) {
    return <MembersSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-destructive text-lg font-medium mb-2">Failed to load members</div>
          <div className="text-muted text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-muted text-lg">Workspace not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Team Members
        </h1>
        <p className="text-muted">
          Manage workspace members and their permissions.
          {canManage && " You can invite new members and change roles."}
        </p>
      </div>

      {/* Member List */}
      <MemberList />
    </div>
  )
}

function MembersSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Invite Form Skeleton */}
      <Card className="p-6 mb-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>

      {/* Member List Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function MembersPage() {
  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersPageContent />
    </Suspense>
  )
}