import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withWorkspaceAccess, requireWorkspaceOwnership, handleApiError } from '@/lib/rbac'

// GET /api/workspaces/[slug] - Get workspace details
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params

      const workspace = await prisma.workspace.findUnique({
        where: { slug: params.slug },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          members: {
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
            orderBy: {
              joinedAt: 'asc',
            },
          },
          boards: {
            where: {
              isArchived: false,
            },
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  columns: true,
                },
              },
            },
            orderBy: {
              position: 'asc',
            },
          },
          _count: {
            select: {
              boards: true,
              members: true,
            },
          },
        },
      })

      if (!workspace) {
        return NextResponse.json(
          { error: 'Workspace not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        avatar: workspace.avatar,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        creator: workspace.creator,
        members: workspace.members.map((member: any) => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: member.user,
        })),
        boards: workspace.boards,
        userRole: membership.role,
        stats: {
          memberCount: workspace._count.members,
          boardCount: workspace._count.boards,
        },
      })
    } catch (error) {
      return handleApiError(error)
    }
  }
)

// PUT /api/workspaces/[slug] - Update workspace (Admin+ required)
export const PUT = withWorkspaceAccess('ADMIN')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params
      const body = await request.json()
      const { name, description, avatar } = body

      // Validate at least one field to update
      if (!name && !description && avatar === undefined) {
        return NextResponse.json(
          { error: 'At least one field (name, description, avatar) must be provided' },
          { status: 400 }
        )
      }

      // Prepare update data
      const updateData: any = {}
      if (name) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (avatar !== undefined) updateData.avatar = avatar

      const workspace = await prisma.workspace.update({
        where: { slug: params.slug },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              boards: true,
              members: true,
            },
          },
        },
      })

      return NextResponse.json({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        avatar: workspace.avatar,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        creator: workspace.creator,
        userRole: membership.role,
        stats: {
          memberCount: workspace._count.members,
          boardCount: workspace._count.boards,
        },
      })
    } catch (error) {
      return handleApiError(error)
    }
  }
)

// DELETE /api/workspaces/[slug] - Delete workspace (Owner only)
export const DELETE = async (request: NextRequest, context: { params: Promise<{ slug: string }> }) => {
  try {
    const params = await context.params

    // Require workspace ownership
    const membership = await requireWorkspaceOwnership(params.slug)

    // Delete workspace (cascade will handle related records)
    await prisma.workspace.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({ message: 'Workspace deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}