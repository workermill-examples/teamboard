import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getColumnWithAccess, handleApiError } from '@/lib/rbac'

// PUT /api/columns/[id] - Update column
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { column, membership } = await getColumnWithAccess(params.id, 'MEMBER')
    const body = await request.json()
    const { title } = body

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

    // Update the column
    const updatedColumn = await prisma.column.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
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

    // Log activity if title changed
    if (title.trim() !== column.title) {
      await prisma.activity.create({
        data: {
          type: 'COLUMN_UPDATED',
          data: {
            columnId: updatedColumn.id,
            columnTitle: updatedColumn.title,
            boardId: column.boardId,
            boardTitle: column.board.title,
            changes: { title: { from: column.title, to: updatedColumn.title } },
          },
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          boardId: column.boardId,
        },
      })
    }

    return NextResponse.json({
      id: updatedColumn.id,
      title: updatedColumn.title,
      position: updatedColumn.position,
      createdAt: updatedColumn.createdAt,
      updatedAt: updatedColumn.updatedAt,
      cardCount: updatedColumn._count.cards,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/columns/[id] - Delete column
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { column, membership } = await getColumnWithAccess(params.id, 'MEMBER')

    // Check if column has cards - we should archive or move them first
    const cardCount = await prisma.card.count({
      where: {
        columnId: params.id,
        isArchived: false,
      },
    })

    if (cardCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete column with cards. Please move or archive cards first.',
          cardCount
        },
        { status: 400 }
      )
    }

    // Update positions of subsequent columns
    await prisma.column.updateMany({
      where: {
        boardId: column.boardId,
        position: {
          gt: column.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    })

    // Delete the column (this will also delete any archived cards in it due to cascade)
    await prisma.column.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'COLUMN_DELETED',
        data: {
          columnId: column.id,
          columnTitle: column.title,
          boardId: column.boardId,
          boardTitle: column.board.title,
        },
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: column.boardId,
      },
    })

    return NextResponse.json({ message: 'Column deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}