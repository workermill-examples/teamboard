import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBoardWithAccess, handleApiError } from '@/lib/rbac'

// POST /api/boards/[id]/columns - Create new column
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { board, membership } = await getBoardWithAccess(params.id, 'MEMBER')
    const body = await request.json()
    const { title, position } = body

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Column title is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (title.trim().length > 255) {
      return NextResponse.json(
        { error: 'Column title must be 255 characters or less' },
        { status: 400 }
      )
    }

    // Determine position
    let columnPosition: number
    if (position !== undefined && typeof position === 'number') {
      columnPosition = position
    } else {
      // Get the highest position for ordering
      const lastColumn = await prisma.column.findFirst({
        where: {
          boardId: params.id,
        },
        orderBy: {
          position: 'desc',
        },
        select: {
          position: true,
        },
      })

      columnPosition = lastColumn ? lastColumn.position + 1 : 0
    }

    // If position is specified and there are existing columns at that position or higher,
    // we need to shift them
    if (position !== undefined) {
      await prisma.column.updateMany({
        where: {
          boardId: params.id,
          position: {
            gte: columnPosition,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      })
    }

    // Create the column
    const column = await prisma.column.create({
      data: {
        title: title.trim(),
        position: columnPosition,
        boardId: params.id,
      },
      include: {
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
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'COLUMN_CREATED',
        data: {
          columnId: column.id,
          columnTitle: column.title,
          boardId: params.id,
          boardTitle: board.title,
        },
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: params.id,
      },
    })

    return NextResponse.json(
      {
        id: column.id,
        title: column.title,
        position: column.position,
        createdAt: column.createdAt,
        updatedAt: column.updatedAt,
        cardCount: column._count.cards,
        cards: [],
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}