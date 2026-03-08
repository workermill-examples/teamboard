'use client'

import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { BoardCard } from '@/hooks/use-board'
import { CardComponent } from './card-component'

interface DragOverlayProps {
  activeCard: BoardCard | null
}

export function BoardDragOverlay({ activeCard }: DragOverlayProps) {
  return (
    <DragOverlay
      adjustScale={false}
      style={{
        transformOrigin: '0 0',
      }}
    >
      {activeCard && (
        <div className="rotate-3 shadow-2xl">
          <CardComponent
            card={activeCard}
            isDragging
          />
        </div>
      )}
    </DragOverlay>
  )
}