'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChecklistItem } from '@/hooks/use-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChecklistProps {
  items: ChecklistItem[]
  onAddItem: (text: string) => Promise<void>
  onUpdateItem: (itemId: string, updates: Partial<ChecklistItem>) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
  disabled?: boolean
}

function ChecklistItemComponent({
  item,
  onUpdate,
  onDelete,
  disabled
}: {
  item: ChecklistItem
  onUpdate: (itemId: string, updates: Partial<ChecklistItem>) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
  disabled?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(item.text)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggleComplete = async () => {
    try {
      setUpdating(true)
      await onUpdate(item.id, { completed: !item.completed })
    } catch (error) {
      // Error handling is managed by parent
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateText = async () => {
    if (!text.trim() || text === item.text) {
      setEditing(false)
      setText(item.text)
      return
    }

    try {
      setUpdating(true)
      await onUpdate(item.id, { text: text.trim() })
      setEditing(false)
    } catch (error) {
      setText(item.text)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this checklist item?')) return

    try {
      setDeleting(true)
      await onDelete(item.id)
    } catch (error) {
      // Error handling is managed by parent
    } finally {
      setDeleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUpdateText()
    }
    if (e.key === 'Escape') {
      setEditing(false)
      setText(item.text)
    }
  }

  return (
    <div className={cn(
      'flex items-center space-x-3 group py-2 px-2 rounded hover:bg-secondary-50 transition-colors',
      item.completed && 'opacity-75'
    )}>
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        disabled={disabled || updating}
        className={cn(
          'flex-shrink-0 w-4 h-4 border-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          item.completed
            ? 'bg-primary-500 border-primary-500 text-primary-50'
            : 'border-border hover:border-primary-300',
          (disabled || updating) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {item.completed && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleUpdateText}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            autoFocus
            disabled={updating}
          />
        ) : (
          <span
            onClick={() => !disabled && setEditing(true)}
            className={cn(
              'block text-sm cursor-pointer',
              item.completed && 'line-through text-muted-600',
              !disabled && 'hover:bg-transparent'
            )}
          >
            {item.text}
          </span>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={disabled || deleting}
        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive-600 transition-all p-1 rounded"
        title="Delete item"
      >
        {deleting ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  )
}

function AddItemForm({
  onAdd,
  disabled
}: {
  onAdd: (text: string) => Promise<void>
  disabled?: boolean
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || submitting) return

    try {
      setSubmitting(true)
      await onAdd(text.trim())
      setText('')
      setIsAdding(false)
    } catch (error) {
      // Error handling is managed by parent
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false)
      setText('')
    }
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add checklist item..."
          autoFocus
          disabled={submitting}
          className="text-sm"
        />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false)
              setText('')
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || submitting}
            loading={submitting}
          >
            Add
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsAdding(true)}
      disabled={disabled}
      className="w-full justify-start text-muted-600 hover:text-foreground"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Add an item
    </Button>
  )
}

export function Checklist({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  disabled
}: ChecklistProps) {
  // Sort items by position
  const sortedItems = [...items].sort((a, b) => a.position - b.position)

  // Calculate progress
  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">
          Checklist ({completedCount}/{totalCount})
        </h3>
        {totalCount > 0 && (
          <span className="text-sm text-muted-600">
            {Math.round(progress)}% complete
          </span>
        )}
      </div>

      {totalCount > 0 && (
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="space-y-1">
        {sortedItems.map((item) => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            disabled={disabled}
          />
        ))}
      </div>

      <AddItemForm
        onAdd={onAddItem}
        disabled={disabled}
      />

      {items.length === 0 && (
        <div className="text-center py-6">
          <svg className="w-12 h-12 mx-auto text-muted-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-muted-600 text-sm">No checklist items yet</p>
          <p className="text-muted-500 text-xs mt-1">Add items to track progress</p>
        </div>
      )}
    </div>
  )
}