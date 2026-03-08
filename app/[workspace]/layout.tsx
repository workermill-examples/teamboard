'use client'

import { Suspense, use } from 'react'
import { WorkspaceProvider } from '@/hooks/use-workspace'
import { Sidebar } from '@/components/sidebar/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ workspace: string }>
}

function WorkspaceLayoutContent({ children, workspace }: { children: React.ReactNode; workspace: string }) {
  return (
    <WorkspaceProvider slug={workspace}>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
          <Sidebar variant="desktop" />
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Mobile Sidebar - Rendered by Sidebar component when needed */}
          <Sidebar variant="mobile" />

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  )
}

function WorkspaceLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-card border-r border-border">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="pt-4">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>

          {/* User Menu */}
          <div className="p-4 border-t border-border">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border bg-card">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Page Content Skeleton */}
        <main className="flex-1 p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  return (
    <Suspense fallback={<WorkspaceLayoutSkeleton />}>
      <WorkspaceLayoutContentWrapper params={params}>
        {children}
      </WorkspaceLayoutContentWrapper>
    </Suspense>
  )
}

function WorkspaceLayoutContentWrapper({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ workspace: string }>
}) {
  const { workspace } = use(params)

  return (
    <WorkspaceLayoutContent workspace={workspace}>
      {children}
    </WorkspaceLayoutContent>
  )
}