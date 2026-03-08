'use client'

import Image from 'next/image'
import { Activity } from '@/hooks/use-activity'
import { formatRelativeTime, cn } from '@/lib/utils'

interface ActivityItemProps {
  activity: Activity
  className?: string
}

export function ActivityItem({ activity, className }: ActivityItemProps) {
  const renderActivityDescription = () => {
    const { type, user, board, card, data } = activity

    // Format the activity description based on type
    switch (type) {
      case 'card_created':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> created card{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_updated':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> updated card{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_moved':
        const fromColumn = data?.fromColumn || 'Unknown'
        const toColumn = data?.toColumn || 'Unknown'
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> moved{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {' '}from <span className="font-medium">{fromColumn}</span> to{' '}
            <span className="font-medium">{toColumn}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_deleted':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> deleted card{' '}
            <span className="font-medium text-muted-600">{data?.cardTitle || 'Untitled'}</span>
            {board && (
              <>
                {' '}from <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_assigned':
        const assigneeName = data?.assignee?.name || 'Unknown'
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> assigned{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {' '}to <span className="font-medium">{assigneeName}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_unassigned':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> unassigned{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_due_date_set':
        const dueDate = data?.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'Unknown'
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> set due date for{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {' '}to <span className="font-medium">{dueDate}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'card_priority_changed':
        const priority = data?.priority || 'Unknown'
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> changed priority of{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {' '}to <span className="font-medium capitalize">{priority.toLowerCase()}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'comment_added':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> commented on{' '}
            <span className="font-medium text-primary">{card?.title || 'Untitled'}</span>
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )

      case 'board_created':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> created board{' '}
            <span className="font-medium text-secondary">{board?.name || 'Untitled'}</span>
          </span>
        )

      case 'board_updated':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> updated board{' '}
            <span className="font-medium text-secondary">{board?.name || 'Untitled'}</span>
          </span>
        )

      case 'board_deleted':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> deleted board{' '}
            <span className="font-medium text-muted-600">{data?.boardName || 'Untitled'}</span>
          </span>
        )

      case 'member_joined':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> joined the workspace
          </span>
        )

      case 'member_left':
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> left the workspace
          </span>
        )

      default:
        // Fallback for unknown activity types
        return (
          <span>
            <strong className="font-medium">{user.name}</strong> performed an action
            {board && (
              <>
                {' '}in <span className="font-medium text-secondary">{board.name}</span>
              </>
            )}
          </span>
        )
    }
  }

  const getActivityIcon = () => {
    const { type } = activity

    // Return appropriate icon based on activity type
    switch (type) {
      case 'card_created':
        return '📋'
      case 'card_updated':
        return '✏️'
      case 'card_moved':
        return '🔄'
      case 'card_deleted':
        return '🗑️'
      case 'card_assigned':
      case 'card_unassigned':
        return '👤'
      case 'card_due_date_set':
        return '📅'
      case 'card_priority_changed':
        return '🔺'
      case 'comment_added':
        return '💬'
      case 'board_created':
        return '📋'
      case 'board_updated':
        return '✏️'
      case 'board_deleted':
        return '🗑️'
      case 'member_joined':
        return '👋'
      case 'member_left':
        return '👋'
      default:
        return '📌'
    }
  }

  return (
    <div className={cn('flex items-start gap-3 py-3 border-b border-border last:border-b-0', className)}>
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {activity.user.avatar ? (
          <Image
            src={activity.user.avatar}
            alt={activity.user.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {activity.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        {/* Activity Description */}
        <div className="text-sm text-foreground leading-relaxed">
          {renderActivityDescription()}
        </div>

        {/* Timestamp and Activity Icon */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-600">
            {formatRelativeTime(activity.createdAt)}
          </span>
          <span className="text-xs opacity-60">
            {getActivityIcon()}
          </span>
        </div>
      </div>
    </div>
  )
}