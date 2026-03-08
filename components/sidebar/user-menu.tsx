'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useWorkspace } from '@/hooks/use-workspace'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  UsersIcon,
  CrownIcon,
  ShieldIcon,
  EyeIcon
} from '@/components/ui/icons'

interface UserMenuProps {
  variant: 'desktop' | 'mobile'
}

export function UserMenu({ variant }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { workspace, canManage } = useWorkspace()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const testIdSuffix = variant === 'mobile' ? '-mobile' : '-desktop'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <CrownIcon className="w-4 h-4 text-warning-600" />
      case 'ADMIN':
        return <ShieldIcon className="w-4 h-4 text-primary-600" />
      case 'MEMBER':
        return <UsersIcon className="w-4 h-4 text-success-600" />
      case 'VIEWER':
        return <EyeIcon className="w-4 h-4 text-muted-600" />
      default:
        return <UserIcon className="w-4 h-4 text-muted-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'text-warning-700 bg-warning-50 border-warning-200'
      case 'ADMIN':
        return 'text-primary-700 bg-primary-50 border-primary-200'
      case 'MEMBER':
        return 'text-success-700 bg-success-50 border-success-200'
      case 'VIEWER':
        return 'text-muted-700 bg-muted-50 border-muted-200'
      default:
        return 'text-muted-700 bg-muted-50 border-muted-200'
    }
  }

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-4 relative">
      {/* User Menu Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 p-3 h-auto justify-start hover:bg-muted-100',
          isOpen && 'bg-muted-100'
        )}
        data-testid={`user-menu${testIdSuffix}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-500 text-primary-50 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {(user as any)?.avatar ? (
            <img
              src={(user as any).avatar}
              alt={user.name || ''}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getAvatarInitials(user.name || '')
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name || ''}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-600 truncate">{user.email || ''}</p>
            {workspace?.userRole && (
              <div className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border',
                getRoleColor(workspace.userRole)
              )}>
                {getRoleIcon(workspace.userRole)}
                <span>{workspace.userRole}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronDownIcon
          className={cn(
            'w-4 h-4 text-muted-600 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg py-2 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.name || ''}</p>
            <p className="text-xs text-muted-600">{user.email || ''}</p>
            {workspace?.userRole && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border mt-2 w-fit',
                getRoleColor(workspace.userRole)
              )}>
                {getRoleIcon(workspace.userRole)}
                <span>{workspace.userRole} in {workspace?.name || ''}</span>
              </div>
            )}
          </div>

          <div className="py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false)
                // Navigate to profile/account settings if implemented
              }}
              className="w-full justify-start px-3 py-2 text-sm hover:bg-muted-100"
              role="menuitem"
            >
              <UserIcon className="w-4 h-4 mr-3" />
              Profile Settings
            </Button>

            {canManage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to workspace settings
                  if (workspace) window.location.href = `/${workspace.slug}/settings`
                }}
                className="w-full justify-start px-3 py-2 text-sm hover:bg-muted-100"
                role="menuitem"
              >
                <SettingsIcon className="w-4 h-4 mr-3" />
                Workspace Settings
              </Button>
            )}
          </div>

          <div className="border-t border-border py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start px-3 py-2 text-sm text-destructive hover:bg-destructive-50 hover:text-destructive-700"
              role="menuitem"
            >
              <LogOutIcon className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}