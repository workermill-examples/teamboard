'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWorkspace } from '@/hooks/use-workspace'
import { NavLinks } from './nav-links'
import { UserMenu } from './user-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MenuIcon, XIcon, ChevronDownIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface SidebarProps {
  variant: 'desktop' | 'mobile'
}

export function Sidebar({ variant }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { workspace, loading, error } = useWorkspace()
  const pathname = usePathname()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    if (!mobileOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen])

  if (variant === 'mobile') {
    return (
      <>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card" data-testid="mobile-header">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(true)}
            className="p-2"
            aria-label="Open sidebar"
            data-testid="mobile-menu-button"
          >
            <MenuIcon className="w-5 h-5" />
          </Button>

          {loading ? (
            <Skeleton className="h-6 w-32" />
          ) : workspace ? (
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">{workspace.name}</h2>
              <ChevronDownIcon className="w-4 h-4 text-muted-600" />
            </div>
          ) : (
            <div className="h-6 w-32 flex items-center text-muted-600">Workspace</div>
          )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            data-testid="sidebar-overlay"
          />
        )}

        {/* Mobile Sidebar Panel */}
        <div
          className={cn(
            'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          data-testid="sidebar-mobile"
        >
          <SidebarContent variant="mobile" onClose={() => setMobileOpen(false)} />
        </div>
      </>
    )
  }

  // Desktop variant
  return (
    <div className="flex flex-col flex-1 bg-card border-r border-border" data-testid="sidebar-desktop">
      <SidebarContent variant="desktop" />
    </div>
  )
}

interface SidebarContentProps {
  variant: 'desktop' | 'mobile'
  onClose?: () => void
}

function SidebarContent({ variant, onClose }: SidebarContentProps) {
  const { workspace, loading, error } = useWorkspace()

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        {/* Mobile Close Button */}
        {variant === 'mobile' && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Skeleton className="h-6 w-32" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Workspace Header */}
        {variant === 'desktop' && (
          <div className="p-4 border-b border-border">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}

        {/* Navigation Skeleton */}
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

        {/* User Menu Skeleton */}
        <div className="p-4 border-t border-border">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1">
        {variant === 'mobile' && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="text-sm text-destructive">Error loading workspace</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return null
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Mobile Close Button */}
      {variant === 'mobile' && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">{workspace.name}</h2>
            {workspace.description && (
              <p className="text-sm text-muted-600 truncate">{workspace.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 flex-shrink-0"
            aria-label="Close sidebar"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Workspace Header - Desktop Only */}
      {variant === 'desktop' && (
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{workspace.name}</h2>
          {workspace.description && (
            <p className="text-sm text-muted-600 mt-1">{workspace.description}</p>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <NavLinks workspace={workspace} variant={variant} />
      </div>

      {/* User Menu */}
      <div className="border-t border-border">
        <UserMenu variant={variant} />
      </div>
    </div>
  )
}