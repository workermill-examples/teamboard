'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface BoardAssignee {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface BoardLabel {
  id: string
  name: string
  color: string
}

export interface BoardCard {
  id: string
  title: string
  description?: string
  position: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  coverColor?: string
  createdAt: string
  updatedAt: string
  assignee?: BoardAssignee
  labels: BoardLabel[]
  commentCount: number
  checklistCount: number
}

export interface BoardColumn {
  id: string
  title: string
  position: number
  createdAt: string
  updatedAt: string
  cardCount: number
  cards: BoardCard[]
}

export interface BoardWorkspace {
  id: string
  name: string
  slug: string
}

export interface Board {
  id: string
  title: string
  description?: string
  position: number
  createdAt: string
  updatedAt: string
  isStarred: boolean
  workspace: BoardWorkspace
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  columns: BoardColumn[]
  stats: {
    columnCount: number
    totalCards: number
  }
}

export interface UseBoard {
  board: Board | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  moveCard: (cardId: string, targetColumnId: string, targetPosition: number) => Promise<void>
  optimisticMoveCard: (cardId: string, sourceColumnId: string, targetColumnId: string, targetPosition: number) => void
  rollbackMove: () => void
  hasPermission: (action: 'create' | 'edit' | 'delete' | 'move') => boolean
}

export function useBoard(workspaceSlug: string, boardId: string): UseBoard {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previousBoardState, setPreviousBoardState] = useState<Board | null>(null)

  const { isAuthenticated } = useAuth()

  const fetchBoard = useCallback(async () => {
    if (!isAuthenticated || !workspaceSlug || !boardId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/workspaces/${workspaceSlug}/boards/${boardId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not logged in')
        }
        if (response.status === 403) {
          throw new Error('You do not have access to this board')
        }
        if (response.status === 404) {
          throw new Error('Board not found')
        }
        throw new Error('Failed to load board')
      }

      const boardData = await response.json()
      setBoard(boardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [workspaceSlug, boardId, isAuthenticated])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const optimisticMoveCard = useCallback((
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetPosition: number
  ) => {
    if (!board) return

    // Store the current state for potential rollback
    setPreviousBoardState({ ...board })

    // Find the card and remove it from source column
    const sourceColumn = board.columns.find(col => col.id === sourceColumnId)
    const targetColumn = board.columns.find(col => col.id === targetColumnId)

    if (!sourceColumn || !targetColumn) return

    const cardToMove = sourceColumn.cards.find(card => card.id === cardId)
    if (!cardToMove) return

    // Create updated columns
    const updatedColumns = board.columns.map(column => {
      if (column.id === sourceColumnId) {
        // Remove card from source column and update positions
        const cardsWithoutMoved = column.cards.filter(card => card.id !== cardId)
        const reorderedCards = cardsWithoutMoved.map((card, index) => ({
          ...card,
          position: index
        }))
        return {
          ...column,
          cards: reorderedCards,
          cardCount: reorderedCards.length
        }
      }

      if (column.id === targetColumnId) {
        // Add card to target column at specified position
        const targetCards = [...column.cards]
        const updatedCard = { ...cardToMove, position: targetPosition }

        // Insert the card at the target position
        targetCards.splice(targetPosition, 0, updatedCard)

        // Update positions for all cards
        const reorderedCards = targetCards.map((card, index) => ({
          ...card,
          position: index
        }))

        return {
          ...column,
          cards: reorderedCards,
          cardCount: reorderedCards.length
        }
      }

      return column
    })

    setBoard({
      ...board,
      columns: updatedColumns,
      stats: {
        ...board.stats,
        totalCards: updatedColumns.reduce((sum, col) => sum + col.cardCount, 0)
      }
    })
  }, [board])

  const rollbackMove = useCallback(() => {
    if (previousBoardState) {
      setBoard(previousBoardState)
      setPreviousBoardState(null)
    }
  }, [previousBoardState])

  const moveCard = useCallback(async (
    cardId: string,
    targetColumnId: string,
    targetPosition: number
  ) => {
    if (!board) return

    try {
      const response = await fetch('/api/cards/move', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          targetColumnId,
          targetPosition,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to move card')
      }

      // Clear the previous state since the move was successful
      setPreviousBoardState(null)

      // Optionally refetch to ensure consistency
      // await fetchBoard()
    } catch (err) {
      // Rollback the optimistic update
      rollbackMove()
      throw err
    }
  }, [board, rollbackMove])

  const hasPermission = useCallback((action: 'create' | 'edit' | 'delete' | 'move') => {
    if (!board) return false

    const role = board.userRole

    switch (action) {
      case 'create':
      case 'edit':
      case 'move':
        return ['OWNER', 'ADMIN', 'MEMBER'].includes(role)
      case 'delete':
        return ['OWNER', 'ADMIN'].includes(role)
      default:
        return false
    }
  }, [board])

  return {
    board,
    loading,
    error,
    refetch: fetchBoard,
    moveCard,
    optimisticMoveCard,
    rollbackMove,
    hasPermission,
  }
}