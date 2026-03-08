'use client'

import { useState, useCallback } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WorkspaceFormData {
  name: string
  description: string
}

export function WorkspaceSettings() {
  const { workspace, refetch, isAdmin } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<WorkspaceFormData>({
    name: workspace?.name || '',
    description: workspace?.description || '',
  })

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !isAdmin) return

    try {
      setLoading(true)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update workspace')
      }

      setSuccess('Workspace settings updated successfully')
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workspace')
    } finally {
      setLoading(false)
    }
  }, [workspace, isAdmin, formData, refetch, clearMessages])

  const handleReset = useCallback(() => {
    setFormData({
      name: workspace?.name || '',
      description: workspace?.description || '',
    })
    clearMessages()
  }, [workspace, clearMessages])

  if (!workspace || !isAdmin) return null

  const hasChanges =
    formData.name !== workspace.name ||
    formData.description !== (workspace.description || '')

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
        <p className="text-sm text-muted mt-1">
          Update your workspace name and description.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive-50 border border-destructive-200 text-destructive-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workspace Name */}
        <div>
          <Label htmlFor="workspace-name" className="text-sm font-medium text-foreground">
            Workspace Name
          </Label>
          <Input
            id="workspace-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter workspace name"
            required
            maxLength={100}
            className="mt-1"
          />
          <p className="text-xs text-muted mt-1">
            This is the display name for your workspace.
          </p>
        </div>

        {/* Workspace Description */}
        <div>
          <Label htmlFor="workspace-description" className="text-sm font-medium text-foreground">
            Description
          </Label>
          <textarea
            id="workspace-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this workspace is used for (optional)"
            rows={3}
            maxLength={500}
            className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[80px]"
          />
          <p className="text-xs text-muted mt-1">
            Optional description to help team members understand the workspace purpose.
          </p>
        </div>

        {/* Workspace Slug (Read-only) */}
        <div>
          <Label htmlFor="workspace-slug" className="text-sm font-medium text-foreground">
            Workspace URL
          </Label>
          <Input
            id="workspace-slug"
            value={`/${workspace.slug}`}
            readOnly
            className="mt-1 bg-secondary-50 cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">
            This is the permanent URL for your workspace. It cannot be changed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={loading || !hasChanges}
          >
            Reset
          </Button>
        </div>
      </form>
    </Card>
  )
}