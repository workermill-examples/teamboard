'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspace } from '@/hooks/use-workspace'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface WorkspaceLabel {
  id: string
  name: string
  color: string
}

interface LabelFormData {
  name: string
  color: string
}

const predefinedColors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#14B8A6', // Teal
]

export function LabelsCrud() {
  const { workspace } = useWorkspace()
  const [labels, setLabels] = useState<WorkspaceLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processingLabelId, setProcessingLabelId] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLabel, setEditingLabel] = useState<WorkspaceLabel | null>(null)
  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    color: predefinedColors[0],
  })

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const fetchLabels = useCallback(async () => {
    if (!workspace) return

    try {
      setLoading(true)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/labels`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch labels')
      }

      const labelsData = await response.json()
      setLabels(labelsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load labels')
    } finally {
      setLoading(false)
    }
  }, [workspace, clearMessages])

  // Initial fetch
  useEffect(() => {
    if (workspace) {
      fetchLabels()
    }
  }, [workspace, fetchLabels])

  const handleCreateLabel = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return

    try {
      setProcessingLabelId('new')
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create label')
      }

      setSuccess(`Label "${formData.name}" created successfully`)
      setFormData({ name: '', color: predefinedColors[0] })
      setShowCreateForm(false)
      await fetchLabels()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create label')
    } finally {
      setProcessingLabelId(null)
    }
  }, [workspace, formData, fetchLabels, clearMessages])

  const handleUpdateLabel = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !editingLabel) return

    try {
      setProcessingLabelId(editingLabel.id)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/labels/${editingLabel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update label')
      }

      setSuccess(`Label "${formData.name}" updated successfully`)
      setEditingLabel(null)
      setFormData({ name: '', color: predefinedColors[0] })
      await fetchLabels()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update label')
    } finally {
      setProcessingLabelId(null)
    }
  }, [workspace, editingLabel, formData, fetchLabels, clearMessages])

  const handleDeleteLabel = useCallback(async (label: WorkspaceLabel) => {
    if (!workspace) return

    if (!window.confirm(`Are you sure you want to delete the label "${label.name}"? This will remove it from all cards.`)) {
      return
    }

    try {
      setProcessingLabelId(label.id)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/labels/${label.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete label')
      }

      const responseData = await response.json()
      setSuccess(responseData.message || `Label "${label.name}" deleted successfully`)
      await fetchLabels()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label')
    } finally {
      setProcessingLabelId(null)
    }
  }, [workspace, fetchLabels, clearMessages])

  const startEditing = useCallback((label: WorkspaceLabel) => {
    setEditingLabel(label)
    setFormData({ name: label.name, color: label.color })
    setShowCreateForm(false)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingLabel(null)
    setFormData({ name: '', color: predefinedColors[0] })
  }, [])

  const startCreating = useCallback(() => {
    setShowCreateForm(true)
    setEditingLabel(null)
    setFormData({ name: '', color: predefinedColors[0] })
  }, [])

  if (!workspace) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Labels</h2>
          <p className="text-sm text-muted mt-1">
            Create and manage labels for organizing cards.
          </p>
        </div>
        <Button onClick={startCreating} disabled={showCreateForm || !!editingLabel}>
          <Icons.Plus className="h-4 w-4 mr-2" />
          Add Label
        </Button>
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

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-foreground mb-3">Create New Label</h3>
          <form onSubmit={handleCreateLabel}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="create-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Label name"
                  required
                  maxLength={50}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Color</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        'w-8 h-8 rounded border-2 transition-all',
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                loading={processingLabelId === 'new'}
                size="sm"
              >
                Create Label
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
                disabled={processingLabelId === 'new'}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingLabel && (
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-foreground mb-3">Edit Label</h3>
          <form onSubmit={handleUpdateLabel}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Label name"
                  required
                  maxLength={50}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Color</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={cn(
                        'w-8 h-8 rounded border-2 transition-all',
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                loading={processingLabelId === editingLabel.id}
                size="sm"
              >
                Update Label
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                disabled={processingLabelId === editingLabel.id}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Labels List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : labels.length === 0 ? (
        <div className="text-center py-8 text-muted">
          No labels yet. Create your first label to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-6 w-6 rounded border border-gray-300"
                  style={{ backgroundColor: label.color }}
                  title={`${label.name} (${label.color})`}
                />
                <span className="font-medium text-foreground">{label.name}</span>
                <span className="text-xs text-muted">{label.color}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(label)}
                  disabled={!!processingLabelId || showCreateForm}
                >
                  <Icons.Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteLabel(label)}
                  disabled={!!processingLabelId || showCreateForm}
                  className="text-destructive hover:text-destructive hover:bg-destructive-50"
                >
                  {processingLabelId === label.id ? (
                    <Icons.Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.Trash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}