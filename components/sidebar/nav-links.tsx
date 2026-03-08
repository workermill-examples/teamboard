'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboardIcon,
  FolderIcon,
  ActivityIcon,
  UsersIcon,
  SettingsIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  StarIcon
} from '@/components/ui/icons'
import type { Workspace } from '@/hooks/use-workspace'
import { useWorkspace } from '@/hooks/use-workspace'

interface NavLinksProps {
  workspace: Workspace
  variant: 'desktop' | 'mobile'
}

export function NavLinks({ workspace, variant }: NavLinksProps) {
  const [boardsExpanded, setBoardsExpanded] = useState(true)
  const pathname = usePathname()
  const { canManage, canEdit, starBoard, unstarBoard } = useWorkspace()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: `/${workspace.slug}/dashboard`,
      icon: LayoutDashboardIcon,
      active: isActive(`/${workspace.slug}/dashboard`)
    },
    {
      name: 'Activity',
      href: `/${workspace.slug}/activity`,
      icon: ActivityIcon,
      active: isActive(`/${workspace.slug}/activity`)
    },
    {
      name: 'Members',
      href: `/${workspace.slug}/members`,
      icon: UsersIcon,
      active: isActive(`/${workspace.slug}/members`)
    },
    {
      name: 'Settings',
      href: `/${workspace.slug}/settings`,
      icon: SettingsIcon,
      active: isActive(`/${workspace.slug}/settings`),
      show: canManage
    }
  ]

  const starredBoards = workspace.boards.filter(board => board.starred)
  const otherBoards = workspace.boards.filter(board => !board.starred)

  const handleToggleStar = async (e: React.MouseEvent, boardId: string, starred: boolean) => {
    e.preventDefault()
    e.stopPropagation()

    if (starred) {
      await unstarBoard(boardId)
    } else {
      await starBoard(boardId)
    }
  }

  return (
    <nav className="p-4 space-y-1">
      {/* Main Navigation */}
      {navItems.map((item) => {
        if (item.show === false) return null

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              item.active
                ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                : 'text-muted-700 hover:bg-muted-100 hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
            {item.active && (
              <div className="ml-auto w-1 h-4 bg-primary-500 rounded-full" />
            )}
          </Link>
        )
      })}

      {/* Boards Section */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBoardsExpanded(!boardsExpanded)}
            className="flex items-center gap-1 p-1 h-auto text-sm font-medium text-muted-700 hover:text-foreground"
          >
            {boardsExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
            <span>Boards ({workspace.boards.length})</span>
          </Button>

          {canEdit && (
            <Link
              href={`/${workspace.slug}/boards/new`}
              className="p-1 h-auto text-muted-600 hover:text-foreground rounded transition-colors"
              aria-label="Create new board"
            >
              <PlusIcon className="w-4 h-4" />
            </Link>
          )}
        </div>

        {boardsExpanded && (
          <div className="space-y-1">
            {/* Starred Boards */}
            {starredBoards.length > 0 && (
              <div className="space-y-1 mb-3">
                {starredBoards.map((board) => (
                  <BoardLink
                    key={board.id}
                    board={board}
                    workspace={workspace}
                    isActive={isActive(`/${workspace.slug}/boards/${board.id}`)}
                    onToggleStar={handleToggleStar}
                    variant={variant}
                  />
                ))}
                {otherBoards.length > 0 && (
                  <hr className="border-muted-200 my-2" />
                )}
              </div>
            )}

            {/* Other Boards */}
            {otherBoards.length > 0 ? (
              <div className="space-y-1">
                {otherBoards.map((board) => (
                  <BoardLink
                    key={board.id}
                    board={board}
                    workspace={workspace}
                    isActive={isActive(`/${workspace.slug}/boards/${board.id}`)}
                    onToggleStar={handleToggleStar}
                    variant={variant}
                  />
                ))}
              </div>
            ) : starredBoards.length === 0 ? (
              <div className="text-sm text-muted-600 py-2 px-3">
                {canEdit ? (
                  <>
                    No boards yet.{' '}
                    <Link
                      href={`/${workspace.slug}/boards/new`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Create one
                    </Link>
                  </>
                ) : (
                  'No boards available'
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  )
}

interface BoardLinkProps {
  board: any
  workspace: Workspace
  isActive: boolean
  onToggleStar: (e: React.MouseEvent, boardId: string, starred: boolean) => void
  variant: 'desktop' | 'mobile'
}

function BoardLink({ board, workspace, isActive, onToggleStar, variant }: BoardLinkProps) {
  const testIdSuffix = variant === 'mobile' ? '-mobile' : '-desktop'

  return (
    <div className="group relative">
      <Link
        href={`/${workspace.slug}/boards/${board.id}`}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full pr-8',
          isActive
            ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
            : 'text-muted-700 hover:bg-muted-100 hover:text-foreground'
        )}
        data-testid={`board-link-${board.id}${testIdSuffix}`}
      >
        <FolderIcon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate flex-1">{board.name}</span>
        {isActive && (
          <div className="absolute right-8 w-1 h-4 bg-primary-500 rounded-full" />
        )}
      </Link>

      {/* Star Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => onToggleStar(e, board.id, board.starred)}
        className={cn(
          'absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity',
          board.starred && 'opacity-100'
        )}
        data-testid={`star-board-${board.id}${testIdSuffix}`}
        aria-label={board.starred ? 'Unstar board' : 'Star board'}
      >
        <StarIcon
          className={cn(
            'w-3.5 h-3.5',
            board.starred
              ? 'text-warning-500'
              : 'text-muted-500 hover:text-warning-500'
          )}
          filled={board.starred}
        />
      </Button>
    </div>
  )
}