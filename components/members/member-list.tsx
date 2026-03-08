'use client'

import { useState, useCallback } from 'react'
import { useWorkspace, WorkspaceMember } from '@/hooks/use-workspace'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface InviteFormData {
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
}

const roleOptions = [
  { value: 'VIEWER' as const, label: 'Viewer', description: 'Can view boards and cards' },
  { value: 'MEMBER' as const, label: 'Member', description: 'Can create and edit cards' },
  { value: 'ADMIN' as const, label: 'Admin', description: 'Can manage members and boards' },
  { value: 'OWNER' as const, label: 'Owner', description: 'Full workspace access' },
]

const roleColors = {
  OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
  MEMBER: 'bg-green-100 text-green-800 border-green-200',
  VIEWER: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function MemberList() {
  const { workspace, refetch, isAdmin, isOwner } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null)

  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: '',
    role: 'MEMBER',
  })

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const handleInviteMember = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace || !isAdmin) return

    try {
      setLoading(true)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inviteForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to invite member')
      }

      setSuccess(`Successfully invited ${inviteForm.email} as ${inviteForm.role}`)
      setInviteForm({ email: '', role: 'MEMBER' })
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member')
    } finally {
      setLoading(false)
    }
  }, [workspace, isAdmin, inviteForm, refetch, clearMessages])

  const handleRoleChange = useCallback(async (memberId: string, newRole: string) => {
    if (!workspace || !isAdmin) return

    try {
      setProcessingMemberId(memberId)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update member role')
      }

      setSuccess(`Successfully updated member role to ${newRole}`)
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role')
    } finally {
      setProcessingMemberId(null)
    }
  }, [workspace, isAdmin, refetch, clearMessages])

  const handleRemoveMember = useCallback(async (member: WorkspaceMember) => {
    if (!workspace || !isAdmin) return

    const isCurrentUser = member.user.id === workspace.members.find(m => m.role === workspace.userRole)?.user.id
    const confirmMessage = isCurrentUser
      ? 'Are you sure you want to leave this workspace?'
      : `Are you sure you want to remove ${member.user.name || member.user.email} from this workspace?`

    if (!window.confirm(confirmMessage)) return

    try {
      setProcessingMemberId(member.id)
      clearMessages()

      const response = await fetch(`/api/workspaces/${workspace.slug}/members/${member.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove member')
      }

      const responseData = await response.json()
      setSuccess(responseData.message || 'Member removed successfully')

      if (isCurrentUser) {
        // If user removed themselves, redirect to workspace list
        window.location.href = '/workspaces'
      } else {
        await refetch()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    } finally {
      setProcessingMemberId(null)
    }
  }, [workspace, isAdmin, refetch, clearMessages])

  if (!workspace) return null

  const canInvite = isAdmin
  const currentUserMember = workspace.members.find(m => m.role === workspace.userRole)

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive-50 border border-destructive-200 text-destructive-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Invite Form */}
      {canInvite && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Invite New Member</h2>
          <form onSubmit={handleInviteMember}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="invite-email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="invite-role" className="text-sm font-medium text-foreground">
                  Role
                </Label>
                <select
                  id="invite-role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="mt-1 w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {roleOptions.map(option => {
                    // Only allow owners to assign owner role
                    if (option.value === 'OWNER' && !isOwner) return null
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" loading={loading} className="w-full md:w-auto">
                  <Icons.Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Member List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Members ({workspace.members.length})
        </h2>

        <div className="space-y-4">
          {workspace.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-3 px-4 bg-secondary-50 rounded-lg border border-secondary-200"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  {member.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.user.avatar}
                      alt={member.user.name || member.user.email}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-700 font-medium">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div>
                  <div className="font-medium text-foreground">
                    {member.user.name || member.user.email}
                    {member.user.id === currentUserMember?.user.id && (
                      <span className="ml-2 text-xs text-muted">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-muted">
                    {member.user.email}
                    {member.user.name && member.user.email !== member.user.name && (
                      <span className="ml-2">• Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role and Actions */}
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded border",
                  roleColors[member.role]
                )}>
                  {member.role}
                </span>

                {/* Role Change Dropdown */}
                {isAdmin && member.user.id !== currentUserMember?.user.id && (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={processingMemberId === member.id}
                    className="text-xs px-2 py-1 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {roleOptions.map(option => {
                      // Only allow owners to assign owner role
                      if (option.value === 'OWNER' && !isOwner) return null
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )
                    })}
                  </select>
                )}

                {/* Remove Button */}
                {(isAdmin || member.user.id === currentUserMember?.user.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member)}
                    disabled={processingMemberId === member.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive-50"
                  >
                    {processingMemberId === member.id ? (
                      <Icons.Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.Trash className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}