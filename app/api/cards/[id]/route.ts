import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCardWithAccess, handleApiError } from '@/lib/rbac'
import { Priority } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { card, membership } = await getCardWithAccess(params.id, 'VIEWER')

    // Get detailed card information
    const detailedCard = await prisma.card.findUnique({
      where: { id: params.id },
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        checklist: {
          orderBy: {
            position: 'asc',
          },
        },
        column: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
                workspace: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
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
    })

    if (!detailedCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    const checklistCompleted = detailedCard.checklist.filter(item => item.completed).length

    return NextResponse.json({
      ...detailedCard,
      commentsCount: detailedCard._count.comments,
      checklistCount: detailedCard._count.checklist,
      checklistCompleted,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { card, membership } = await getCardWithAccess(params.id, 'MEMBER')

    const body = await request.json()
    const { title, description, assigneeId, priority, dueDate, coverColor } = body

    // Validate fields if provided
    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        )
      }
    }

    if (priority !== undefined && priority !== null) {
      if (!Object.values(Priority).includes(priority as Priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value' },
          { status: 400 }
        )
      }
    }

    if (assigneeId !== undefined && assigneeId !== null) {
      // Verify assignee is a member of the workspace
      const assignee = await prisma.workspaceMember.findFirst({
        where: {
          userId: assigneeId,
          workspaceId: membership.workspaceId,
        },
      })

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee must be a workspace member' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {}

    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (coverColor !== undefined) updateData.coverColor = coverColor

    // Update the card
    const updatedCard = await prisma.card.update({
      where: { id: params.id },
      data: updateData,
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
        _count: {
          select: {
            comments: true,
            checklist: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CARD_UPDATED',
        description: `Updated card "${updatedCard.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        cardId: updatedCard.id,
        metadata: {
          cardTitle: updatedCard.title,
          changes: Object.keys(updateData),
        },
      },
    })

    const checklistCompleted = await prisma.checklistItem.count({
      where: {
        cardId: params.id,
        completed: true,
      },
    })

    return NextResponse.json({
      ...updatedCard,
      commentsCount: updatedCard._count.comments,
      checklistCount: updatedCard._count.checklist,
      checklistCompleted,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { card, membership } = await getCardWithAccess(params.id, 'MEMBER')

    // Delete the card (cascade will handle related records)
    await prisma.card.delete({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CARD_DELETED',
        description: `Deleted card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        metadata: {
          cardTitle: card.title,
          columnTitle: card.column.title,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}