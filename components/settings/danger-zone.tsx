'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/hooks/use-workspace'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'

export function DangerZone() {
  const { workspace, isOwner } = useWorkspace()
  const router = useRouter()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteWorkspace = useCallback(async () => {
    if (!workspace || !isOwner) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/workspaces/${workspace.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete workspace')
      }

      // Redirect to workspace list after successful deletion
      router.push('/workspaces')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace')
      setLoading(false)
    }
  }, [workspace, isOwner, router])

  const openConfirmDialog = useCallback(() => {
    setShowConfirmDialog(true)
    setConfirmText('')
    setError(null)
  }, [])

  const closeConfirmDialog = useCallback(() => {
    setShowConfirmDialog(false)
    setConfirmText('')
    setError(null)
  }, [])

  if (!workspace || !isOwner) return null

  const canDelete = confirmText === workspace.name
  const expectedText = workspace.name

  return (
    <Card className="p-6 border-destructive-200 bg-destructive-50/50">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-destructive-900 flex items-center gap-2">
          <Icons.AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-destructive-700 mt-1">
          Irreversible actions that will permanently affect your workspace.
        </p>
      </div>

      {!showConfirmDialog ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-destructive-900 mb-2">Delete Workspace</h3>
            <p className="text-sm text-destructive-700 mb-4">
              Permanently delete this workspace and all of its data. This action cannot be undone.
              All boards, cards, comments, and member associations will be lost forever.
            </p>
            <Button
              variant="destructive"
              onClick={openConfirmDialog}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-600"
            >
              <Icons.Trash className="h-4 w-4 mr-2" />
              Delete Workspace
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-destructive-100 border border-destructive-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icons.AlertTriangle className="h-5 w-5 text-destructive-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-destructive-900 mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-sm text-destructive-700 mb-4">
                  This action <strong>cannot be undone</strong>. This will permanently delete the{' '}
                  <strong>{workspace.name}</strong> workspace and remove all associated data.
                </p>
                <ul className="text-sm text-destructive-700 space-y-1 mb-4 list-disc list-inside">
                  <li>All boards and their columns will be deleted</li>
                  <li>All cards, comments, and attachments will be lost</li>
                  <li>All member associations will be removed</li>
                  <li>All activity history will be deleted</li>
                  <li>All labels and workspace settings will be lost</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive-50 border border-destructive-200 text-destructive-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="confirm-delete" className="text-sm font-medium text-destructive-900">
              Type <span className="font-mono bg-destructive-200 px-1 rounded">{expectedText}</span> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              className="mt-2 border-destructive-300 focus:border-destructive-500 focus:ring-destructive-500"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={!canDelete || loading}
              loading={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-600"
            >
              {loading ? (
                <>
                  <Icons.Loader className="h-4 w-4 mr-2 animate-spin" />
                  Deleting Workspace...
                </>
              ) : (
                <>
                  <Icons.Trash className="h-4 w-4 mr-2" />
                  Delete Workspace
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={closeConfirmDialog}
              disabled={loading}
              className="text-destructive-700 hover:text-destructive-900 hover:bg-destructive-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}