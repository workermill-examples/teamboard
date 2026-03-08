'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { BoardCard, BoardColumn, useBoard } from '@/hooks/use-board'
import { Column } from './column'
import { BoardDragOverlay } from './drag-overlay'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface BoardViewProps {
  workspaceSlug: string
  boardId: string
  onCardClick?: (card: BoardCard) => void
  className?: string
}

interface BoardSkeletonProps {
  columnCount?: number
}

function BoardSkeleton({ columnCount = 4 }: BoardSkeletonProps) {
  return (
    <div className="flex space-x-6 p-6">
      {Array.from({ length: columnCount }).map((_, index) => (
        <div key={index} className="w-80 flex-shrink-0">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <Skeleton key={cardIndex} className="h-24 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function BoardView({ workspaceSlug, boardId, onCardClick, className }: BoardViewProps) {
  const {
    board,
    loading,
    error,
    refetch,
    moveCard,
    optimisticMoveCard,
    rollbackMove,
    hasPermission,
  } = useBoard(workspaceSlug, boardId)

  const [activeCard, setActiveCard] = useState<BoardCard | null>(null)

  // Haptic feedback for mobile devices
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Short vibration
    }
  }, [])

  // Set up sensors for different input methods
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Minimum distance to start dragging
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // Reduced delay for better responsiveness
      tolerance: 8, // Allow slight movement during long press
    },
  })

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })

  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor)

  // Memoize columns for performance
  const columns = useMemo(() => {
    if (!board) return []
    return board.columns
  }, [board])

  // Find card by ID
  const findCard = useCallback((cardId: string): { card: BoardCard; columnId: string } | null => {
    for (const column of columns) {
      const card = column.cards.find(c => c.id === cardId)
      if (card) {
        return { card, columnId: column.id }
      }
    }
    return null
  }, [columns])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const cardData = findCard(active.id as string)

    if (cardData) {
      setActiveCard(cardData.card)
      triggerHaptic() // Haptic feedback on drag start
    }
  }, [findCard, triggerHaptic])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over || !hasPermission('move')) return

    const activeCardData = findCard(active.id as string)
    if (!activeCardData) return

    const overId = over.id as string

    // Check if we're over a column (not a card)
    const overColumn = columns.find(col => col.id === overId)
    if (overColumn && activeCardData.columnId !== overId) {
      // Moving to a different column - append to the end
      optimisticMoveCard(
        activeCardData.card.id,
        activeCardData.columnId,
        overId,
        overColumn.cards.length
      )
    }
  }, [columns, findCard, hasPermission, optimisticMoveCard])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveCard(null)

    if (!over || !hasPermission('move')) return

    const activeCardData = findCard(active.id as string)
    if (!activeCardData) return

    const overId = over.id as string

    // Determine target column and position
    let targetColumnId: string
    let targetPosition: number

    // Check if dropped over a column
    const overColumn = columns.find(col => col.id === overId)
    if (overColumn) {
      targetColumnId = overId
      targetPosition = overColumn.cards.length
    } else {
      // Dropped over a card - find the card's column and position
      const overCardData = findCard(overId)
      if (!overCardData) return

      targetColumnId = overCardData.columnId
      const targetColumn = columns.find(col => col.id === targetColumnId)
      if (!targetColumn) return

      // Find the position of the card we're dropping on
      const overCardIndex = targetColumn.cards.findIndex(card => card.id === overId)
      targetPosition = overCardIndex + 1 // Insert after the target card
    }

    // If moving within the same column, handle reordering
    if (activeCardData.columnId === targetColumnId) {
      const column = columns.find(col => col.id === targetColumnId)
      if (!column) return

      const oldIndex = column.cards.findIndex(card => card.id === activeCardData.card.id)
      const newIndex = Math.min(targetPosition, column.cards.length - 1)

      if (oldIndex !== newIndex) {
        // Adjust target position for within-column moves
        const adjustedPosition = newIndex > oldIndex ? newIndex : newIndex
        optimisticMoveCard(
          activeCardData.card.id,
          activeCardData.columnId,
          targetColumnId,
          adjustedPosition
        )

        try {
          await moveCard(activeCardData.card.id, targetColumnId, adjustedPosition)
        } catch (error) {
          console.error('Failed to move card:', error)
          // The optimistic update will be rolled back automatically by the hook
        }
      }
    } else {
      // Moving to different column
      optimisticMoveCard(
        activeCardData.card.id,
        activeCardData.columnId,
        targetColumnId,
        targetPosition
      )

      try {
        await moveCard(activeCardData.card.id, targetColumnId, targetPosition)
      } catch (error) {
        console.error('Failed to move card:', error)
        // The optimistic update will be rolled back automatically by the hook
      }
    }
  }, [columns, findCard, hasPermission, moveCard, optimisticMoveCard])

  // Handle card click
  const handleCardClick = useCallback((card: BoardCard) => {
    onCardClick?.(card)
  }, [onCardClick])

  // Handle add card
  const handleAddCard = useCallback((columnId: string) => {
    // TODO: Implement add card functionality
    console.log('Add card to column:', columnId)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault()
          // TODO: Open new card modal/form
          console.log('Keyboard shortcut: New card')
          break
        case 'escape':
          event.preventDefault()
          // Clear any active states
          setActiveCard(null)
          break
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            refetch()
          }
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [refetch])

  // Loading state
  if (loading) {
    return (
      <div className={cn('h-full overflow-hidden', className)}>
        <BoardSkeleton columnCount={board?.stats.columnCount || 4} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('h-full flex items-center justify-center', className)}>
        <ErrorState
          title="Failed to load board"
          description={error}
          action={{
            label: 'Try Again',
            onClick: refetch
          }}
        />
      </div>
    )
  }

  // No board found
  if (!board) {
    return (
      <div className={cn('h-full flex items-center justify-center', className)}>
        <ErrorState
          title="Board not found"
          description="The board you're looking for doesn't exist or you don't have access to it."
          action={{
            label: 'Try Again',
            onClick: refetch
          }}
        />
      </div>
    )
  }

  return (
    <div className={cn('h-full overflow-hidden', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Horizontal scrolling container */}
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="flex space-x-6 p-6 min-w-max">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={column.cards}
                onCardClick={handleCardClick}
                onAddCard={() => handleAddCard(column.id)}
                canAddCard={hasPermission('create')}
              />
            ))}

            {/* Empty state for no columns */}
            {columns.length === 0 && (
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No columns yet</h3>
                  <p className="text-muted-600 mb-4">
                    This board doesn't have any columns. Create your first column to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        <BoardDragOverlay activeCard={activeCard} />
      </DndContext>
    </div>
  )
}