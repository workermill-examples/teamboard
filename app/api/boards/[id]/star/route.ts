import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBoardWithAccess, handleApiError } from '@/lib/rbac'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { board, membership } = await getBoardWithAccess(params.id, 'VIEWER')

    // Check if already starred
    const existingStar = await prisma.boardStar.findUnique({
      where: {
        userId_boardId: {
          userId: membership.user.id,
          boardId: params.id,
        },
      },
    })

    if (existingStar) {
      return NextResponse.json(
        { error: 'Board is already starred' },
        { status: 409 }
      )
    }

    // Create the star
    const star = await prisma.boardStar.create({
      data: {
        userId: membership.user.id,
        boardId: params.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'BOARD_UPDATED',
        description: `Starred board "${board.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: board.id,
        metadata: {
          boardTitle: board.title,
          action: 'starred',
        },
      },
    })

    return NextResponse.json({ starred: true, starId: star.id })
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
    const { board, membership } = await getBoardWithAccess(params.id, 'VIEWER')

    // Find the star
    const star = await prisma.boardStar.findUnique({
      where: {
        userId_boardId: {
          userId: membership.user.id,
          boardId: params.id,
        },
      },
    })

    if (!star) {
      return NextResponse.json(
        { error: 'Board is not starred' },
        { status: 404 }
      )
    }

    // Delete the star
    await prisma.boardStar.delete({
      where: {
        id: star.id,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'BOARD_UPDATED',
        description: `Unstarred board "${board.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: board.id,
        metadata: {
          boardTitle: board.title,
          action: 'unstarred',
        },
      },
    })

    return NextResponse.json({ starred: false })
  } catch (error) {
    return handleApiError(error)
  }
}