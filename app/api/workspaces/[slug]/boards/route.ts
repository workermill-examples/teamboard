import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withWorkspaceAccess, handleApiError } from '@/lib/rbac'

// GET /api/workspaces/[slug]/boards - List workspace boards
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params

      const boards = await prisma.board.findMany({
        where: {
          workspace: {
            slug: params.slug,
          },
          isArchived: false,
        },
        include: {
          _count: {
            select: {
              columns: true,
            },
          },
          stars: {
            where: {
              userId: membership.user.id,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      })

      return NextResponse.json(
        boards.map((board: any) => ({
          id: board.id,
          title: board.title,
          description: board.description,
          position: board.position,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
          isStarred: board.stars.length > 0,
          columnCount: board._count.columns,
        }))
      )
    } catch (error) {
      return handleApiError(error)
    }
  }
)

// POST /api/workspaces/[slug]/boards - Create new board
export const POST = withWorkspaceAccess('MEMBER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params
      const body = await request.json()
      const { title, description } = body

      // Validate required fields
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Board title is required and must be a non-empty string' },
          { status: 400 }
        )
      }

      if (title.trim().length > 255) {
        return NextResponse.json(
          { error: 'Board title must be 255 characters or less' },
          { status: 400 }
        )
      }

      if (description && typeof description !== 'string') {
        return NextResponse.json(
          { error: 'Board description must be a string' },
          { status: 400 }
        )
      }

      // Get the highest position for ordering
      const lastBoard = await prisma.board.findFirst({
        where: {
          workspaceId: membership.workspaceId,
          isArchived: false,
        },
        orderBy: {
          position: 'desc',
        },
        select: {
          position: true,
        },
      })

      const position = lastBoard ? lastBoard.position + 1 : 0

      // Create the board
      const board = await prisma.board.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          workspaceId: membership.workspaceId,
          position,
        },
        include: {
          _count: {
            select: {
              columns: true,
            },
          },
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'BOARD_CREATED',
          data: {
            boardId: board.id,
            boardTitle: board.title,
          },
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          boardId: board.id,
        },
      })

      return NextResponse.json(
        {
          id: board.id,
          title: board.title,
          description: board.description,
          position: board.position,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
          isStarred: false,
          columnCount: board._count.columns,
        },
        { status: 201 }
      )
    } catch (error) {
      return handleApiError(error)
    }
  }
)