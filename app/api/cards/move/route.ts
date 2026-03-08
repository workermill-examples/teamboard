import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCardWithAccess, handleApiError } from '@/lib/rbac'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardId, targetColumnId, targetPosition } = body

    // Validate required fields
    if (!cardId || !targetColumnId || typeof targetPosition !== 'number') {
      return NextResponse.json(
        { error: 'cardId, targetColumnId, and targetPosition are required' },
        { status: 400 }
      )
    }

    // Get the card with access check
    const { card, membership } = await getCardWithAccess(cardId, 'MEMBER')

    // Get the target column and verify it's in the same workspace
    const targetColumn = await prisma.column.findUnique({
      where: { id: targetColumnId },
      include: {
        board: {
          include: {
            workspace: {
              select: {
                id: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!targetColumn) {
      return NextResponse.json(
        { error: 'Target column not found' },
        { status: 404 }
      )
    }

    // Verify target column is in the same workspace
    if (targetColumn.board.workspace.id !== membership.workspaceId) {
      return NextResponse.json(
        { error: 'Cannot move card to different workspace' },
        { status: 403 }
      )
    }

    const sourceColumnId = card.columnId
    const sourcePosition = card.position

    // Perform the move operation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If moving within the same column
      if (sourceColumnId === targetColumnId) {
        // Moving within same column - reorder cards
        if (targetPosition < sourcePosition) {
          // Moving up - increment positions of cards between target and source
          await tx.card.updateMany({
            where: {
              columnId: sourceColumnId,
              position: {
                gte: targetPosition,
                lt: sourcePosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          })
        } else if (targetPosition > sourcePosition) {
          // Moving down - decrement positions of cards between source and target
          await tx.card.updateMany({
            where: {
              columnId: sourceColumnId,
              position: {
                gt: sourcePosition,
                lte: targetPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          })
        }
      } else {
        // Moving to different column
        // 1. Decrement positions of cards after the source position in source column
        await tx.card.updateMany({
          where: {
            columnId: sourceColumnId,
            position: {
              gt: sourcePosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        })

        // 2. Increment positions of cards at or after target position in target column
        await tx.card.updateMany({
          where: {
            columnId: targetColumnId,
            position: {
              gte: targetPosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        })
      }

      // 3. Update the card position and column
      const updatedCard = await tx.card.update({
        where: { id: cardId },
        data: {
          columnId: targetColumnId,
          position: targetPosition,
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
              label: true,
            },
          },
          column: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              comments: true,
              checklist: true,
            },
          },
        },
      })

      return updatedCard
    })

    // Log activity after transaction
    const sourceColumnTitle = card.column.title
    const targetColumnTitle = targetColumn.title
    const activityDescription = sourceColumnId === targetColumnId
      ? `Reordered card "${result.title}" in column "${targetColumnTitle}"`
      : `Moved card "${result.title}" from "${sourceColumnTitle}" to "${targetColumnTitle}"`

    await prisma.activity.create({
      data: {
        type: 'CARD_MOVED',
        description: activityDescription,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: targetColumn.board.id,
        cardId: result.id,
        metadata: {
          cardTitle: result.title,
          sourceColumnId,
          sourceColumnTitle,
          targetColumnId,
          targetColumnTitle,
          sourcePosition,
          targetPosition,
        },
      },
    })

    const checklistCompleted = await prisma.checklistItem.count({
      where: {
        cardId: result.id,
        completed: true,
      },
    })

    return NextResponse.json({
      ...result,
      commentsCount: result._count.comments,
      checklistCount: result._count.checklist,
      checklistCompleted,
    })
  } catch (error) {
    return handleApiError(error)
  }
}