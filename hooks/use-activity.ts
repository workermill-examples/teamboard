'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ActivityUser {
  id: string
  name: string
  email: string
  avatar: string | null
}

export interface ActivityBoard {
  id: string
  name: string
}

export interface ActivityCard {
  id: string
  title: string
}

export interface Activity {
  id: string
  type: string
  entityType: string
  entityId: string
  data: any
  user: ActivityUser
  board?: ActivityBoard | null
  card?: ActivityCard | null
  createdAt: string
}

interface ActivityResponse {
  activities: Activity[]
  pagination: {
    hasMore: boolean
    nextCursor: string | null
  }
}

interface UseActivityResult {
  activities: Activity[]
  loading: boolean
  error: string | null
  hasMore: boolean
  nextCursor: string | null
  loadMore: () => Promise<void>
  retry: () => Promise<void>
  addActivity: (activity: Activity) => void
}

export function useActivity(workspaceSlug?: string): UseActivityResult {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const fetchActivities = useCallback(async (cursor?: string, reset = false) => {
    if (!workspaceSlug) return

    try {
      setLoading(true)
      if (reset) {
        setError(null)
      }

      const url = new URL(`/api/workspaces/${workspaceSlug}/activity`, window.location.origin)
      if (cursor) {
        url.searchParams.set('cursor', cursor)
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load activity')
      }

      const data: ActivityResponse = await response.json()

      if (reset || !cursor) {
        setActivities(data.activities)
      } else {
        setActivities(prev => [...prev, ...data.activities])
      }

      setHasMore(data.pagination.hasMore)
      setNextCursor(data.pagination.nextCursor)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activity'
      setError(errorMessage)
      console.error('Activity fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [workspaceSlug])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !nextCursor) return
    await fetchActivities(nextCursor, false)
  }, [hasMore, loading, nextCursor, fetchActivities])

  const retry = useCallback(async () => {
    await fetchActivities(undefined, true)
  }, [fetchActivities])

  const addActivity = useCallback((newActivity: Activity) => {
    setActivities(prev => {
      // Check if activity already exists to prevent duplicates
      if (prev.some(activity => activity.id === newActivity.id)) {
        return prev
      }

      // Add to the beginning since activities are chronological (newest first)
      return [newActivity, ...prev]
    })
  }, [])

  // Initial fetch
  useEffect(() => {
    if (workspaceSlug) {
      fetchActivities()
    }
  }, [workspaceSlug, fetchActivities])

  return {
    activities,
    loading,
    error,
    hasMore,
    nextCursor,
    loadMore,
    retry,
    addActivity,
  }
}