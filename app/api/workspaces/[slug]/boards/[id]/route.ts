import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBoardWithAccess, requireWorkspaceAccess, handleApiError } from '@/lib/rbac'

// GET /api/workspaces/[slug]/boards/[id] - Get board details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const params = await context.params
    const { board, membership } = await getBoardWithAccess(params.id, 'VIEWER')

    // Get detailed board information with columns and cards
    const detailedBoard = await prisma.board.findUnique({
      where: { id: params.id },
      include: {
        columns: {
          include: {
            cards: {
              where: {
                isArchived: false,
              },
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
                labels: {
                  include: {
                    label: {
                      select: {
                        id: true,
                        name: true,
                        color: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    checklist: true,
                  },
                },
              },
              orderBy: {
                position: 'asc',
              },
            },
            _count: {
              select: {
                cards: {
                  where: {
                    isArchived: false,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
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
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            columns: true,
          },
        },
      },
    })

    if (!detailedBoard) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: detailedBoard.id,
      title: detailedBoard.title,
      description: detailedBoard.description,
      position: detailedBoard.position,
      createdAt: detailedBoard.createdAt,
      updatedAt: detailedBoard.updatedAt,
      isStarred: detailedBoard.stars.length > 0,
      workspace: detailedBoard.workspace,
      userRole: membership.role,
      columns: detailedBoard.columns.map((column: any) => ({
        id: column.id,
        title: column.title,
        position: column.position,
        createdAt: column.createdAt,
        updatedAt: column.updatedAt,
        cardCount: column._count.cards,
        cards: column.cards.map((card: any) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          position: card.position,
          priority: card.priority,
          dueDate: card.dueDate,
          coverColor: card.coverColor,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          assignee: card.assignee,
          labels: card.labels.map((cl: any) => cl.label),
          commentCount: card._count.comments,
          checklistCount: card._count.checklist,
        })),
      })),
      stats: {
        columnCount: detailedBoard._count.columns,
        totalCards: detailedBoard.columns.reduce((sum: number, col: any) => sum + col._count.cards, 0),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/workspaces/[slug]/boards/[id] - Update board
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const params = await context.params
    const { board, membership } = await getBoardWithAccess(params.id, 'MEMBER')
    const body = await request.json()
    const { title, description } = body

    // Validate at least one field to update
    if (!title && description === undefined) {
      return NextResponse.json(
        { error: 'At least one field (title, description) must be provided' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Board title must be a non-empty string' },
          { status: 400 }
        )
      }

      if (title.trim().length > 255) {
        return NextResponse.json(
          { error: 'Board title must be 255 characters or less' },
          { status: 400 }
        )
      }

      updateData.title = title.trim()
    }

    if (description !== undefined) {
      if (description && typeof description !== 'string') {
        return NextResponse.json(
          { error: 'Board description must be a string' },
          { status: 400 }
        )
      }
      updateData.description = description?.trim() || null
    }

    // Update the board
    const updatedBoard = await prisma.board.update({
      where: { id: params.id },
      data: updateData,
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
    })

    // Log activity if title changed
    if (updateData.title && updateData.title !== board.title) {
      await prisma.activity.create({
        data: {
          type: 'BOARD_UPDATED',
          data: {
            boardId: updatedBoard.id,
            boardTitle: updatedBoard.title,
            changes: { title: { from: board.title, to: updatedBoard.title } },
          },
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          boardId: updatedBoard.id,
        },
      })
    }

    return NextResponse.json({
      id: updatedBoard.id,
      title: updatedBoard.title,
      description: updatedBoard.description,
      position: updatedBoard.position,
      createdAt: updatedBoard.createdAt,
      updatedAt: updatedBoard.updatedAt,
      isStarred: updatedBoard.stars.length > 0,
      columnCount: updatedBoard._count.columns,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/workspaces/[slug]/boards/[id] - Delete board (Admin+ required)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const params = await context.params
    const { board, membership } = await getBoardWithAccess(params.id, 'ADMIN')

    // Delete the board (cascade will handle columns, cards, etc.)
    await prisma.board.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'BOARD_DELETED',
        data: {
          boardId: board.id,
          boardTitle: board.title,
        },
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
      },
    })

    return NextResponse.json({ message: 'Board deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}