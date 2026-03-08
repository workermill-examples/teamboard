import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getColumnWithAccess, handleApiError } from '@/lib/rbac'
import { Priority } from '@prisma/client'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { column, membership } = await getColumnWithAccess(params.id, 'MEMBER')

    const body = await request.json()
    const { title, description, assigneeId, priority, dueDate, coverColor } = body

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate optional fields
    if (priority && !Object.values(Priority).includes(priority as Priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      )
    }

    if (assigneeId) {
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

    // Get the next position for the card in this column
    const lastCard = await prisma.card.findFirst({
      where: { columnId: params.id },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = (lastCard?.position || 0) + 1

    // Create the card
    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        position,
        columnId: params.id,
        assigneeId: assigneeId || null,
        priority: priority || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        coverColor: coverColor || null,
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
        type: 'CARD_CREATED',
        description: `Created card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: column.boardId,
        cardId: card.id,
        metadata: {
          cardTitle: card.title,
          columnTitle: column.title,
        },
      },
    })

    return NextResponse.json({
      ...card,
      commentsCount: card._count.comments,
      checklistCount: card._count.checklist,
      checklistCompleted: 0, // New cards have no completed checklist items
    })
  } catch (error) {
    return handleApiError(error)
  }
}