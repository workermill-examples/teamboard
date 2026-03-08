'use client'

import { Suspense } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { LabelsCrud } from '@/components/settings/labels-crud'
import { WorkspaceSettings } from '@/components/settings/workspace-settings'
import { DangerZone } from '@/components/settings/danger-zone'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function SettingsPageContent() {
  const { workspace, loading, error, isAdmin, isOwner } = useWorkspace()

  if (loading) {
    return <SettingsSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-destructive text-lg font-medium mb-2">Failed to load settings</div>
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

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-muted text-lg font-medium mb-2">Access Denied</div>
          <div className="text-muted text-sm">
            You need admin permissions to access workspace settings.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Workspace Settings
        </h1>
        <p className="text-muted">
          Manage workspace preferences, labels, and advanced settings.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Workspace Settings */}
        <WorkspaceSettings />

        {/* Labels Management */}
        <LabelsCrud />

        {/* Danger Zone - Only for owners */}
        {isOwner && <DangerZone />}
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Workspace Settings Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Card>

        {/* Labels Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone Skeleton */}
        <Card className="p-6 border-destructive-200">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-80 mb-4" />
          <Skeleton className="h-10 w-40" />
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  )
}