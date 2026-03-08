import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError } from '@/lib/rbac'

// GET /api/workspaces - List user's workspaces
export const GET = withAuth()(async (request: NextRequest, context: any, user) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            boards: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Add user's role to each workspace
    const workspacesWithRole = workspaces.map((workspace) => {
      const userMember = workspace.members.find((member: any) => member.user.id === user.id)
      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        avatar: workspace.avatar,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        role: userMember?.role,
        memberCount: workspace._count.members,
        boardCount: workspace._count.boards,
      }
    })

    return NextResponse.json(workspacesWithRole)
  } catch (error) {
    return handleApiError(error)
  }
})

// POST /api/workspaces - Create new workspace
export const POST = withAuth()(async (request: NextRequest, context: any, user) => {
  try {
    const body = await request.json()
    const { name, slug, description, avatar } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug },
    })

    if (existingWorkspace) {
      return NextResponse.json(
        { error: 'A workspace with this slug already exists' },
        { status: 409 }
      )
    }

    // Create workspace and add creator as OWNER
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        avatar,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
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

    // Format response
    const response = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      avatar: workspace.avatar,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      role: 'OWNER',
      memberCount: workspace._count.members,
      boardCount: workspace._count.boards,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
})