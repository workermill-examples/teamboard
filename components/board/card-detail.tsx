'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { cn } from '@/lib/utils'
import { useCard, CardDetails } from '@/hooks/use-card'
import { BoardAssignee, BoardLabel } from '@/hooks/use-board'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Comments } from './comments'
import { Checklist } from './checklist'
import {
  PriorityPicker,
  AssigneePicker,
  DueDatePicker,
  LabelPicker,
  CoverColorPicker
} from './pickers'

interface CardDetailProps {
  cardId: string | null
  isOpen: boolean
  onClose: () => void
  availableAssignees: BoardAssignee[]
  availableLabels: BoardLabel[]
  onCardUpdated?: () => void
  onCardDeleted?: () => void
}

function CardDetailContent({
  cardId,
  onClose,
  availableAssignees,
  availableLabels,
  onCardUpdated,
  onCardDeleted
}: Omit<CardDetailProps, 'isOpen'>) {
  const { user } = useAuth()
  const {
    cardDetails,
    loading,
    error,
    fetchCardDetails,
    updateCard,
    addComment,
    deleteComment,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    deleteCard
  } = useCard()

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Fetch card details when cardId changes
  useEffect(() => {
    if (cardId) {
      fetchCardDetails(cardId)
    }
  }, [cardId, fetchCardDetails])

  // Update local state when card details change
  useEffect(() => {
    if (cardDetails) {
      setTitle(cardDetails.title)
      setDescription(cardDetails.description || '')
    }
  }, [cardDetails])

  // Auto-resize description textarea
  useEffect(() => {
    const textarea = descriptionRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [description])

  const handleSaveTitle = async () => {
    if (!cardDetails || title === cardDetails.title || !title.trim()) {
      setTitle(cardDetails?.title || '')
      return
    }

    try {
      setSaving(true)
      await updateCard({ title: title.trim() })
      onCardUpdated?.()
    } catch (error) {
      setTitle(cardDetails?.title || '')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDescription = async () => {
    if (!cardDetails || description === (cardDetails.description || '')) {
      setDescription(cardDetails?.description || '')
      return
    }

    try {
      setSaving(true)
      await updateCard({ description: description.trim() || undefined })
      onCardUpdated?.()
    } catch (error) {
      setDescription(cardDetails?.description || '')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCard = async (updates: Partial<CardDetails>) => {
    if (!cardDetails) return

    try {
      setSaving(true)
      await updateCard(updates)
      onCardUpdated?.()
    } catch (error) {
      // Error handled by the hook
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCard = async () => {
    if (!cardDetails) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${cardDetails.title}"? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteCard()
      onCardDeleted?.()
      onClose()
    } catch (error) {
      // Error handled by the hook
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Loading skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-muted-200 rounded animate-shimmer" />
          <div className="h-20 bg-muted-200 rounded animate-shimmer" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-muted-200 rounded animate-shimmer" />
            <div className="h-8 bg-muted-200 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !cardDetails) {
    return (
      <div className="p-6 text-center">
        <div className="text-destructive mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{error || 'Card not found'}</p>
          <p className="text-sm text-muted-600 mt-1">This card may have been deleted or moved.</p>
        </div>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cover Color */}
      {cardDetails.coverColor && (
        <div
          className="h-20 w-full rounded-t-lg"
          style={{ backgroundColor: cardDetails.coverColor }}
        />
      )}

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-muted-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-muted-700">Title</span>
              </div>
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                  if (e.key === 'Escape') {
                    setTitle(cardDetails.title)
                    e.currentTarget.blur()
                  }
                }}
                disabled={saving}
                className={cn(
                  'w-full text-xl font-semibold bg-transparent border-none outline-none resize-none',
                  'focus:bg-white focus:border focus:border-primary-500 focus:rounded-md focus:px-2 focus:py-1',
                  'transition-all duration-200'
                )}
                placeholder="Card title..."
                data-testid="card-title-edit"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-muted-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="text-sm font-medium text-muted-700">Description</span>
              </div>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  setIsEditing(false)
                  handleSaveDescription()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setDescription(cardDetails.description || '')
                    e.currentTarget.blur()
                  }
                }}
                disabled={saving}
                className={cn(
                  'w-full bg-transparent border-none outline-none resize-none min-h-[80px]',
                  'focus:bg-white focus:border focus:border-primary-500 focus:rounded-md focus:px-3 focus:py-2',
                  'transition-all duration-200',
                  !description && !isEditing && 'text-muted-600'
                )}
                placeholder="Add a description..."
                data-testid="card-detail-description"
                onFocus={() => setIsEditing(true)}
              />
            </div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-600 hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Checklist */}
            <div className="space-y-4">
              <Checklist
                items={cardDetails.checklist}
                onAddItem={addChecklistItem}
                onUpdateItem={updateChecklistItem}
                onDeleteItem={deleteChecklistItem}
                disabled={saving}
              />
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <Comments
                comments={cardDetails.comments}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
                currentUserId={user?.id || ''}
                disabled={saving}
              />
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium text-foreground">Details</h3>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-700">Priority</label>
                  <PriorityPicker
                    value={cardDetails.priority}
                    onChange={(priority) => handleUpdateCard({ priority })}
                    disabled={saving}
                  />
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-700">Assignee</label>
                  <AssigneePicker
                    value={cardDetails.assignee || null}
                    onChange={(assignee) => handleUpdateCard({ assignee: assignee || undefined })}
                    availableAssignees={availableAssignees}
                    disabled={saving}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-700">Due Date</label>
                  <DueDatePicker
                    value={cardDetails.dueDate || null}
                    onChange={(dueDate) => handleUpdateCard({ dueDate: dueDate || undefined })}
                    disabled={saving}
                  />
                </div>

                {/* Labels */}
                <div className="space-y-2" data-testid="labels-section">
                  <label className="text-sm font-medium text-muted-700">Labels</label>
                  <LabelPicker
                    selectedLabels={cardDetails.labels}
                    availableLabels={availableLabels}
                    onChange={(labels) => handleUpdateCard({ labels })}
                    disabled={saving}
                  />
                </div>

                {/* Cover Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-700">Cover</label>
                  <CoverColorPicker
                    value={cardDetails.coverColor || null}
                    onChange={(coverColor) => handleUpdateCard({ coverColor: coverColor || undefined })}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-foreground">Actions</h3>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCard}
                  disabled={deleting || saving}
                  loading={deleting}
                  className="w-full"
                >
                  Delete Card
                </Button>

                {/* Card ID for debugging */}
                <div className="text-xs text-muted-600 pt-2 border-t">
                  ID: {cardDetails.id}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardDetail({
  cardId,
  isOpen,
  onClose,
  availableAssignees,
  availableLabels,
  onCardUpdated,
  onCardDeleted
}: CardDetailProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen || !cardId) return null

  if (isMobile) {
    // Mobile: Full-screen sheet
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
          <CardDetailContent
            cardId={cardId}
            onClose={onClose}
            availableAssignees={availableAssignees}
            availableLabels={availableLabels}
            onCardUpdated={onCardUpdated}
            onCardDeleted={onCardDeleted}
          />
        </Suspense>
      </div>
    )
  }

  // Desktop: Modal dialog
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-background rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95" data-testid="card-detail-modal">
        <div className="h-full overflow-y-auto">
          <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <CardDetailContent
              cardId={cardId}
              onClose={onClose}
              availableAssignees={availableAssignees}
              availableLabels={availableLabels}
              onCardUpdated={onCardUpdated}
              onCardDeleted={onCardDeleted}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}