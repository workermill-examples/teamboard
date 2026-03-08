'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BoardColumn, BoardCard } from '@/hooks/use-board'
import { CardComponent } from './card-component'
import { cn } from '@/lib/utils'

interface ColumnHeaderProps {
  title: string
  cardCount: number
  color?: string
  wipLimit?: number
  onAddCard?: () => void
  canAddCard?: boolean
}

function ColumnHeader({
  title,
  cardCount,
  color = '#6B7280',
  wipLimit,
  onAddCard,
  canAddCard = true
}: ColumnHeaderProps) {
  const isWipLimitWarning = wipLimit && cardCount >= wipLimit * 0.8
  const isWipLimitExceeded = wipLimit && cardCount >= wipLimit

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        {/* Color indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* Title and count */}
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-foreground" data-testid="column-title">{title}</h3>
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              isWipLimitExceeded && 'bg-destructive-100 text-destructive-700',
              isWipLimitWarning && !isWipLimitExceeded && 'bg-warning-100 text-warning-700',
              !isWipLimitWarning && 'bg-muted-100 text-muted-600'
            )}
            data-testid="column-count"
          >
            {cardCount}
            {wipLimit && ` / ${wipLimit}`}
          </span>
        </div>
      </div>

      {/* Add card button */}
      {canAddCard && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddCard}
          className="h-8 w-8 p-0 hover:bg-muted-100"
          data-testid="add-card-button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="sr-only">Add card</span>
        </Button>
      )}
    </div>
  )
}

interface ColumnProps {
  column: BoardColumn
  cards: BoardCard[]
  onCardClick?: (card: BoardCard) => void
  onAddCard?: () => void
  canAddCard?: boolean
  isDragOverlay?: boolean
}

export function Column({
  column,
  cards,
  onCardClick,
  onAddCard,
  canAddCard = true,
  isDragOverlay = false
}: ColumnProps) {
  const {
    isOver,
    setNodeRef: setDropRef,
  } = useDroppable({
    id: column.id,
  })

  // Get card IDs for SortableContext
  const cardIds = cards.map(card => card.id)

  return (
    <Card
      ref={setDropRef}
      className={cn(
        'w-80 flex-shrink-0 p-4 bg-card',
        isOver && 'ring-2 ring-primary-500 ring-opacity-50',
        isDragOverlay && 'opacity-90 shadow-xl'
      )}
      data-testid="column"
    >
      <ColumnHeader
        title={column.title}
        cardCount={cards.length}
        onAddCard={onAddCard}
        canAddCard={canAddCard}
      />

      {/* Cards container */}
      <div className={cn(
        'min-h-[200px] max-h-[calc(100vh-320px)] overflow-y-auto',
        'scrollbar-thin scrollbar-track-muted-100 scrollbar-thumb-muted-300'
      )}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-muted-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-600 mb-2">No cards yet</p>
              {canAddCard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddCard}
                  className="text-xs"
                  data-testid="add-card-button"
                >
                  Add your first card
                </Button>
              )}
            </div>
          ) : (
            <>
              {cards.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick?.(card)}
                />
              ))}

              {/* Add card at bottom */}
              {canAddCard && (
                <Button
                  variant="ghost"
                  onClick={onAddCard}
                  className="w-full mt-2 h-8 text-xs text-muted-600 hover:text-foreground border-2 border-dashed border-muted-200 hover:border-muted-300"
                  data-testid="add-card-button"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add a card
                </Button>
              )}
            </>
          )}
        </SortableContext>
      </div>
    </Card>
  )
}