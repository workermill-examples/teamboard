'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './use-auth'
import { BoardCard, BoardAssignee, BoardLabel } from './use-board'

export interface CardComment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    avatar?: string
  }
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  position: number
}

export interface CardDetails extends BoardCard {
  comments: CardComment[]
  checklist: ChecklistItem[]
}

export interface UseCard {
  cardDetails: CardDetails | null
  loading: boolean
  error: string | null
  fetchCardDetails: (cardId: string) => Promise<void>
  updateCard: (updates: Partial<CardDetails>) => Promise<void>
  addComment: (content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  addChecklistItem: (text: string) => Promise<void>
  updateChecklistItem: (itemId: string, updates: Partial<ChecklistItem>) => Promise<void>
  deleteChecklistItem: (itemId: string) => Promise<void>
  deleteCard: () => Promise<void>
}

export function useCard(): UseCard {
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()

  const fetchCardDetails = useCallback(async (cardId: string) => {
    if (!isAuthenticated || !cardId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cards/${cardId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You are not logged in')
        }
        if (response.status === 403) {
          throw new Error('You do not have access to this card')
        }
        if (response.status === 404) {
          throw new Error('Card not found')
        }
        throw new Error('Failed to load card details')
      }

      const data = await response.json()
      setCardDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const updateCard = useCallback(async (updates: Partial<CardDetails>) => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update card')
      }

      const updatedCard = await response.json()
      setCardDetails(updatedCard)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card')
      throw err
    }
  }, [cardDetails])

  const addComment = useCallback(async (content: string) => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add comment')
      }

      const newComment = await response.json()
      setCardDetails(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment],
        commentCount: prev.commentCount + 1
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
      throw err
    }
  }, [cardDetails])

  const deleteComment = useCallback(async (commentId: string) => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete comment')
      }

      setCardDetails(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== commentId),
        commentCount: prev.commentCount - 1
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
      throw err
    }
  }, [cardDetails])

  const addChecklistItem = useCallback(async (text: string) => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}/checklist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add checklist item')
      }

      const newItem = await response.json()
      setCardDetails(prev => prev ? {
        ...prev,
        checklist: [...prev.checklist, newItem],
        checklistCount: prev.checklistCount + 1
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add checklist item')
      throw err
    }
  }, [cardDetails])

  const updateChecklistItem = useCallback(async (itemId: string, updates: Partial<ChecklistItem>) => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}/checklist/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update checklist item')
      }

      const updatedItem = await response.json()
      setCardDetails(prev => prev ? {
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        )
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update checklist item')
      throw err
    }
  }, [cardDetails])

  const deleteChecklistItem = useCallback(async (itemId: string) => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}/checklist/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete checklist item')
      }

      setCardDetails(prev => prev ? {
        ...prev,
        checklist: prev.checklist.filter(item => item.id !== itemId),
        checklistCount: prev.checklistCount - 1
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete checklist item')
      throw err
    }
  }, [cardDetails])

  const deleteCard = useCallback(async () => {
    if (!cardDetails) return

    try {
      setError(null)

      const response = await fetch(`/api/cards/${cardDetails.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete card')
      }

      setCardDetails(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card')
      throw err
    }
  }, [cardDetails])

  return {
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
    deleteCard,
  }
}