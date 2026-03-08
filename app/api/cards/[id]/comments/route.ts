import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCardWithAccess, getCurrentUser, handleApiError, ForbiddenError } from '@/lib/rbac'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { card, membership } = await getCardWithAccess(params.id, 'MEMBER')

    const body = await request.json()
    const { content } = body

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        cardId: params.id,
        authorId: membership.user.id,
      },
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
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'COMMENT_ADDED',
        description: `Added comment to card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        cardId: card.id,
        metadata: {
          cardTitle: card.title,
          commentId: comment.id,
          commentPreview: content.length > 50 ? content.substring(0, 50) + '...' : content,
        },
      },
    })

    return NextResponse.json(comment)
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
    const { card, membership } = await getCardWithAccess(params.id, 'VIEWER')

    // Get comment ID from search params
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Find the comment
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        cardId: params.id,
      },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user is the comment author or has admin privileges
    const isAuthor = comment.author.id === membership.user.id
    const hasAdminRole = ['ADMIN', 'OWNER'].includes(membership.role)

    if (!isAuthor && !hasAdminRole) {
      throw new ForbiddenError('You can only delete your own comments or must have admin privileges')
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'COMMENT_ADDED', // Note: There's no COMMENT_DELETED in the enum
        description: `Deleted comment from card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        cardId: card.id,
        metadata: {
          cardTitle: card.title,
          commentId: comment.id,
          action: 'deleted',
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}