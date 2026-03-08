'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { useRouter } from 'next/navigation'

export interface WorkspaceUser {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface WorkspaceMember {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  user: WorkspaceUser
  joinedAt: string
}

export interface WorkspaceBoard {
  id: string
  name: string
  description?: string
  position: number
  createdAt: string
  starred?: boolean
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
  members: WorkspaceMember[]
  boards: WorkspaceBoard[]
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  memberCount: number
  boardCount: number
}

interface WorkspaceContextValue {
  workspace: Workspace | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateWorkspace: (updates: Partial<Workspace>) => void
  hasPermission: (action: 'create' | 'edit' | 'delete' | 'manage') => boolean
  isOwner: boolean
  isAdmin: boolean
  canEdit: boolean
  canManage: boolean
  starBoard: (boardId: string) => Promise<void>
  unstarBoard: (boardId: string) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}

interface WorkspaceProviderProps {
  children: React.ReactNode
  slug: string
}

export function WorkspaceProvider({ children, slug }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const fetchWorkspace = useCallback(async () => {
    if (!isAuthenticated || !slug) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/workspaces/${slug}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        if (response.status === 403) {
          throw new Error('You do not have access to this workspace')
        }
        if (response.status === 404) {
          throw new Error('Workspace not found')
        }
        throw new Error('Failed to load workspace')
      }

      const workspaceData = await response.json()

      // For now, use boards from workspace response or empty array
      // This can be expanded when the boards endpoint is implemented
      const boards = workspaceData.boards || []

      // Mark all boards as unstarred for now (can implement starred boards later)
      const boardsWithStarred = boards.map((board: any) => ({
        ...board,
        starred: false
      }))

      const completeWorkspace: Workspace = {
        ...workspaceData,
        boards: boardsWithStarred,
        userRole: workspaceData.role,
        memberCount: workspaceData.members?.length || 0,
        boardCount: boards.length
      }

      setWorkspace(completeWorkspace)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [slug, isAuthenticated, router])

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && slug) {
      fetchWorkspace()
    }
  }, [fetchWorkspace, isAuthenticated, slug])

  const updateWorkspace = useCallback((updates: Partial<Workspace>) => {
    setWorkspace(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const hasPermission = useCallback((action: 'create' | 'edit' | 'delete' | 'manage') => {
    if (!workspace) return false

    const role = workspace.userRole

    switch (action) {
      case 'create':
        return ['OWNER', 'ADMIN', 'MEMBER'].includes(role)
      case 'edit':
        return ['OWNER', 'ADMIN', 'MEMBER'].includes(role)
      case 'delete':
        return ['OWNER', 'ADMIN'].includes(role)
      case 'manage':
        return ['OWNER', 'ADMIN'].includes(role)
      default:
        return false
    }
  }, [workspace])

  const isOwner = workspace?.userRole === 'OWNER'
  const isAdmin = workspace?.userRole === 'ADMIN' || isOwner
  const canEdit = hasPermission('edit')
  const canManage = hasPermission('manage')

  const starBoard = useCallback(async (boardId: string) => {
    if (!workspace) return

    try {
      const response = await fetch(`/api/boards/${boardId}/star`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to star board')
      }

      // Update local state
      setWorkspace(prev => {
        if (!prev) return prev
        return {
          ...prev,
          boards: prev.boards.map(board =>
            board.id === boardId ? { ...board, starred: true } : board
          )
        }
      })
    } catch (err) {
      console.error('Failed to star board:', err)
    }
  }, [workspace])

  const unstarBoard = useCallback(async (boardId: string) => {
    if (!workspace) return

    try {
      const response = await fetch(`/api/boards/${boardId}/star`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to unstar board')
      }

      // Update local state
      setWorkspace(prev => {
        if (!prev) return prev
        return {
          ...prev,
          boards: prev.boards.map(board =>
            board.id === boardId ? { ...board, starred: false } : board
          )
        }
      })
    } catch (err) {
      console.error('Failed to unstar board:', err)
    }
  }, [workspace])

  const value: WorkspaceContextValue = {
    workspace,
    loading,
    error,
    refetch: fetchWorkspace,
    updateWorkspace,
    hasPermission,
    isOwner,
    isAdmin,
    canEdit,
    canManage,
    starBoard,
    unstarBoard,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}