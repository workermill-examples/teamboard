import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withWorkspaceAccess, handleApiError } from '@/lib/rbac'
import { WorkspaceRole } from '@prisma/client'

// GET /api/workspaces/[slug]/members - List workspace members
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params

      const members = await prisma.workspaceMember.findMany({
        where: {
          workspace: {
            slug: params.slug,
          },
        },
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
        orderBy: [
          { role: 'desc' }, // OWNER > ADMIN > MEMBER > VIEWER
          { joinedAt: 'asc' },
        ],
      })

      const formattedMembers = members.map((member: any) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user,
      }))

      return NextResponse.json(formattedMembers)
    } catch (error) {
      return handleApiError(error)
    }
  }
)

// POST /api/workspaces/[slug]/members - Invite new member (Admin+ required)
export const POST = withWorkspaceAccess('ADMIN')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params
      const body = await request.json()
      const { email, role } = body

      // Validate required fields
      if (!email || !role) {
        return NextResponse.json(
          { error: 'Email and role are required' },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Validate role
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

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User with this email does not exist' },
          { status: 404 }
        )
      }

      // Check if user is already a member
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: membership.workspaceId,
          },
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this workspace' },
          { status: 409 }
        )
      }

      // Create new membership
      const newMember = await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: membership.workspaceId,
          role,
        },
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

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'MEMBER_ADDED',
          description: `${user.name || user.email} was added to the workspace as ${role}`,
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          metadata: {
            addedUserId: user.id,
            addedUserEmail: user.email,
            role,
          },
        },
      })

      return NextResponse.json({
        id: newMember.id,
        role: newMember.role,
        joinedAt: newMember.joinedAt,
        user: newMember.user,
      }, { status: 201 })
    } catch (error) {
      return handleApiError(error)
    }
  }
)