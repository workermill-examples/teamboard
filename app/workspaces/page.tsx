'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { PlusIcon, UsersIcon, FolderIcon } from '@/components/ui/icons'

interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  memberCount: number
  boardCount: number
  createdAt: string
  updatedAt: string
}

function WorkspaceListContent() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', slug: '', description: '' })

  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch workspaces
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces()
    }
  }, [isAuthenticated])

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/workspaces', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch workspaces')
      }

      const data = await response.json()
      setWorkspaces(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newWorkspace.name.trim()) {
      setCreateError('Workspace name is required')
      return
    }

    // Generate slug if not provided
    let slug = newWorkspace.slug.trim()
    if (!slug) {
      slug = newWorkspace.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newWorkspace.name.trim(),
          slug,
          description: newWorkspace.description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create workspace')
      }

      const createdWorkspace = await response.json()
      setWorkspaces(prev => [createdWorkspace, ...prev])
      setShowCreateDialog(false)
      setNewWorkspace({ name: '', slug: '', description: '' })

      // Navigate to the new workspace
      router.push(`/${createdWorkspace.slug}/dashboard`)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleWorkspaceClick = (slug: string) => {
    router.push(`/${slug}/dashboard`)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'text-primary-600 bg-primary-50'
      case 'ADMIN': return 'text-accent-600 bg-accent-50'
      case 'MEMBER': return 'text-success-600 bg-success-50'
      case 'VIEWER': return 'text-muted-600 bg-muted-50'
      default: return 'text-muted-600 bg-muted-50'
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <WorkspaceListSkeleton />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <WorkspaceListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            title="Failed to load workspaces"
            description={error}
            action={{
              label: 'Try Again',
              onClick: fetchWorkspaces
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Your Workspaces</h1>
            <p className="text-muted-600 mt-2">
              Choose a workspace to start collaborating with your team
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Workspace
          </Button>
        </div>

        {/* Workspace Grid */}
        {workspaces.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-muted-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No workspaces yet</h3>
            <p className="text-muted-600 mb-6">
              Create your first workspace to start organizing your projects
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Your First Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border"
                onClick={() => handleWorkspaceClick(workspace.slug)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(workspace.role)}`}>
                      {workspace.role}
                    </span>
                  </div>
                  {workspace.description && (
                    <CardDescription className="mt-2">
                      {workspace.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-600">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderIcon className="w-4 h-4" />
                      <span>{workspace.boardCount} {workspace.boardCount === 1 ? 'board' : 'boards'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-500 mt-2">
                    Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Workspace Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Workspace</CardTitle>
                <CardDescription>
                  Set up a new workspace for your team to collaborate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  {createError && (
                    <div className="text-destructive text-sm bg-destructive-50 p-3 rounded-md border border-destructive-200">
                      {createError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name *</Label>
                    <Input
                      id="workspace-name"
                      type="text"
                      placeholder="My Team Workspace"
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                      disabled={createLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workspace-slug">Workspace URL</Label>
                    <Input
                      id="workspace-slug"
                      type="text"
                      placeholder="my-team (leave empty to auto-generate)"
                      value={newWorkspace.slug}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, slug: e.target.value }))}
                      disabled={createLoading}
                    />
                    <p className="text-xs text-muted-600">
                      This will be part of your workspace URL: teamboard.com/{newWorkspace.slug || 'workspace-slug'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workspace-description">Description</Label>
                    <Input
                      id="workspace-description"
                      type="text"
                      placeholder="A brief description of your workspace"
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                      disabled={createLoading}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowCreateDialog(false)
                        setCreateError(null)
                        setNewWorkspace({ name: '', slug: '', description: '' })
                      }}
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createLoading || !newWorkspace.name.trim()}
                    >
                      {createLoading ? 'Creating...' : 'Create Workspace'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function WorkspaceListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function WorkspacesPage() {
  return (
    <Suspense fallback={<WorkspaceListSkeleton />}>
      <WorkspaceListContent />
    </Suspense>
  )
}