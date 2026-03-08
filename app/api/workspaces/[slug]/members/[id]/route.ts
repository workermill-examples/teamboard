import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireWorkspaceAccess, handleApiError } from '@/lib/rbac'
import { WorkspaceRole } from '@prisma/client'

// PUT /api/workspaces/[slug]/members/[id] - Change member role (Admin+ required)
export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) => {
  try {
    const params = await context.params
    const membership = await requireWorkspaceAccess(params.slug, 'ADMIN')
    const body = await request.json()
    const { role } = body

    // Validate role
    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const validRoles: WorkspaceRole[] = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']
    if (!validRoles.includes(role as WorkspaceRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: OWNER, ADMIN, MEMBER, VIEWER' },
        { status: 400 }
      )
    }

    // Only owners can assign OWNER role
    if (role === 'OWNER' && membership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only workspace owners can assign OWNER role' },
        { status: 403 }
      )
    }

    // Find the member to update
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        workspace: {
          select: {
            slug: true,
            creatorId: true,
          },
        },
      },
    })

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Verify this member belongs to the correct workspace
    if (targetMember.workspace.slug !== params.slug) {
      return NextResponse.json(
        { error: 'Member does not belong to this workspace' },
        { status: 400 }
      )
    }

    // Prevent changing role of workspace creator unless they're transferring ownership
    if (targetMember.workspace.creatorId === targetMember.userId && role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change role of workspace creator. Transfer ownership first.' },
        { status: 400 }
      )
    }

    // Prevent users from changing their own role (except owners transferring ownership)
    if (targetMember.userId === membership.user.id && membership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    const oldRole = targetMember.role

    // Update member role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: params.id },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    // If transferring ownership, update workspace creator
    if (role === 'OWNER') {
      await prisma.workspace.update({
        where: { slug: params.slug },
        data: { creatorId: targetMember.userId },
      })

      // If current user was the owner, downgrade them to ADMIN
      if (membership.role === 'OWNER') {
        await prisma.workspaceMember.update({
          where: {
            userId_workspaceId: {
              userId: membership.user.id,
              workspaceId: membership.workspaceId,
            },
          },
          data: { role: 'ADMIN' },
        })
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'MEMBER_UPDATED',
        description: `${targetMember.user.name || targetMember.user.email} role changed from ${oldRole} to ${role}`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        metadata: {
          targetUserId: targetMember.userId,
          targetUserEmail: targetMember.user.email,
          oldRole,
          newRole: role,
        },
      },
    })

    return NextResponse.json({
      id: updatedMember.id,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt,
      user: updatedMember.user,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/workspaces/[slug]/members/[id] - Remove member (Admin+ required)
export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) => {
  try {
    const params = await context.params
    const membership = await requireWorkspaceAccess(params.slug, 'ADMIN')

    // Find the member to remove
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        workspace: {
          select: {
            slug: true,
            creatorId: true,
          },
        },
      },
    })

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Verify this member belongs to the correct workspace
    if (targetMember.workspace.slug !== params.slug) {
      return NextResponse.json(
        { error: 'Member does not belong to this workspace' },
        { status: 400 }
      )
    }

    // Prevent removing workspace creator
    if (targetMember.workspace.creatorId === targetMember.userId) {
      return NextResponse.json(
        { error: 'Cannot remove workspace creator. Transfer ownership first.' },
        { status: 400 }
      )
    }

    // Only owners can remove admins
    if (targetMember.role === 'ADMIN' && membership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only workspace owners can remove admins' },
        { status: 403 }
      )
    }

    // Only owners can remove other owners
    if (targetMember.role === 'OWNER' && membership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only workspace owners can remove other owners' },
        { status: 403 }
      )
    }

    // Allow users to remove themselves (except workspace creator)
    const isSelfRemoval = targetMember.userId === membership.user.id

    // Remove member
    await prisma.workspaceMember.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'MEMBER_REMOVED',
        description: isSelfRemoval
          ? `${targetMember.user.name || targetMember.user.email} left the workspace`
          : `${targetMember.user.name || targetMember.user.email} was removed from the workspace`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        metadata: {
          removedUserId: targetMember.userId,
          removedUserEmail: targetMember.user.email,
          removedUserRole: targetMember.role,
          isSelfRemoval,
        },
      },
    })

    return NextResponse.json({
      message: isSelfRemoval
        ? 'Successfully left workspace'
        : 'Member removed successfully',
    })
  } catch (error) {
    return handleApiError(error)
  }
}