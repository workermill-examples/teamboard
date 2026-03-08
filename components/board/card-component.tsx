'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { BoardCard } from '@/hooks/use-board'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isAfter } from 'date-fns'

interface PriorityBadgeProps {
  priority: BoardCard['priority']
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    URGENT: { label: 'Urgent', className: 'bg-destructive-100 text-destructive-700 border-destructive-200' },
    HIGH: { label: 'High', className: 'bg-warning-100 text-warning-700 border-warning-200' },
    MEDIUM: { label: 'Medium', className: 'bg-primary-100 text-primary-700 border-primary-200' },
    LOW: { label: 'Low', className: 'bg-muted-100 text-muted-700 border-muted-200' },
  }

  const { label, className } = config[priority]

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      className
    )}>
      {label}
    </span>
  )
}

interface DueDateChipProps {
  dueDate: string
}

function DueDateChip({ dueDate }: DueDateChipProps) {
  const date = new Date(dueDate)
  const isOverdue = isAfter(new Date(), date)
  const isNearDue = !isOverdue && date <= new Date(Date.now() + 24 * 60 * 60 * 1000) // Within 24 hours

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
        isOverdue && 'bg-destructive-100 text-destructive-700',
        isNearDue && 'bg-warning-100 text-warning-700',
        !isOverdue && !isNearDue && 'bg-muted-100 text-muted-600'
      )}
      title={format(date, 'PPP')}
    >
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {formatDistanceToNow(date, { addSuffix: true })}
    </span>
  )
}

interface LabelPillProps {
  label: { name: string; color: string }
}

function LabelPill({ label }: LabelPillProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  )
}

interface ChecklistProgressProps {
  checklistCount: number
}

function ChecklistProgress({ checklistCount }: ChecklistProgressProps) {
  if (checklistCount === 0) return null

  return (
    <span className="inline-flex items-center text-xs text-muted-600">
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      {checklistCount}
    </span>
  )
}

interface AssigneeAvatarProps {
  assignee: { name: string; avatar?: string }
}

function AssigneeAvatar({ assignee }: AssigneeAvatarProps) {
  const initials = assignee.name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="w-6 h-6 rounded-full bg-primary-500 text-primary-50 text-xs font-medium flex items-center justify-center"
      title={assignee.name}
    >
      {assignee.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={assignee.avatar}
          alt={assignee.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}

interface CardComponentProps {
  card: BoardCard
  isDragging?: boolean
  onClick?: () => void
}

export function CardComponent({ card, isDragging, onClick }: CardComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCurrentlyDragging = isDragging || sortableIsDragging

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'p-3 mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200',
        isCurrentlyDragging && 'opacity-50 shadow-lg',
        card.coverColor && 'border-t-4'
      )}
      style={{
        ...style,
        borderTopColor: card.coverColor || undefined,
      }}
      onClick={(e) => {
        // Call onClick only if not dragging and onClick is provided
        if (!isCurrentlyDragging && onClick) {
          onClick()
        }
      }}
      role="button"
      tabIndex={0}
    >
        {/* Card Title */}
        <div className="mb-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-3 leading-tight">
            {card.title}
          </h4>
        </div>

      {/* Description Preview */}
      {card.description && (
        <div className="mb-2">
          <p className="text-xs text-muted-600 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        </div>
      )}

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.slice(0, 3).map((label) => (
            <LabelPill key={label.id} label={label} />
          ))}
          {card.labels.length > 3 && (
            <span className="text-xs text-muted-600 bg-muted-100 px-2 py-1 rounded-full">
              +{card.labels.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {card.dueDate && (
        <div className="mb-2">
          <DueDateChip dueDate={card.dueDate} />
        </div>
      )}

      {/* Priority Badge */}
      {card.priority !== 'MEDIUM' && (
        <div className="mb-2">
          <PriorityBadge priority={card.priority} />
        </div>
      )}

      {/* Footer with Meta Info */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
        {/* Left side - Checklist & Comments */}
        <div className="flex items-center space-x-3">
          {card.checklistCount > 0 && (
            <ChecklistProgress checklistCount={card.checklistCount} />
          )}
          {card.commentCount > 0 && (
            <span className="inline-flex items-center text-xs text-muted-600" data-testid="comment-count">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {card.commentCount}
            </span>
          )}
        </div>

        {/* Right side - Assignee */}
        {card.assignee && (
          <AssigneeAvatar assignee={card.assignee} />
        )}
      </div>
    </Card>
  )
}