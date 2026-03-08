'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { CardComment } from '@/hooks/use-card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

interface CommentsProps {
  comments: CardComment[]
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  currentUserId: string
  disabled?: boolean
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  canDelete
}: {
  comment: CardComment
  currentUserId: string
  onDelete: (commentId: string) => Promise<void>
  canDelete: boolean
}) {
  const [deleting, setDeleting] = useState(false)
  const isOwnComment = comment.user.id === currentUserId

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return

    try {
      setDeleting(true)
      await onDelete(comment.id)
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex space-x-3 group">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-500 text-primary-50 text-sm font-medium flex items-center justify-center">
          {comment.user.avatar ? (
            <img
              src={comment.user.avatar}
              alt={comment.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(comment.user.name)
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-secondary-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">
              {comment.user.name}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-600">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {(isOwnComment || canDelete) && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive-600 transition-all p-1 rounded"
                  title="Delete comment"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
        {comment.updatedAt !== comment.createdAt && (
          <div className="text-xs text-muted-600 mt-1 ml-3">
            edited {formatRelativeTime(comment.updatedAt)}
          </div>
        )}
      </div>
    </div>
  )
}

function CommentForm({
  onSubmit,
  disabled
}: {
  onSubmit: (content: string) => Promise<void>
  disabled?: boolean
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    try {
      setSubmitting(true)
      await onSubmit(content.trim())
      setContent('')
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          disabled={disabled || submitting}
          className={cn(
            'w-full min-h-[80px] px-3 py-2 border border-border rounded-lg resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'placeholder-muted-600 text-sm leading-relaxed',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          rows={3}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-600">
          ⌘+Enter to send
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || submitting || disabled}
          loading={submitting}
        >
          Add comment
        </Button>
      </div>
    </form>
  )
}

export function Comments({
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
  disabled
}: CommentsProps) {
  // Sort comments by creation date, newest first
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">
          Comments ({comments.length})
        </h3>
      </div>

      <CommentForm
        onSubmit={onAddComment}
        disabled={disabled}
      />

      {sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={onDeleteComment}
              canDelete={true} // Assuming users can delete any comment for now
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-muted-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-muted-600 text-sm">No comments yet</p>
          <p className="text-muted-500 text-xs mt-1">Be the first to add a comment</p>
        </div>
      )}
    </div>
  )
}