import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCardWithAccess, handleApiError } from '@/lib/rbac'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { card, membership } = await getCardWithAccess(params.id, 'MEMBER')

    const body = await request.json()
    const { text } = body

    // Validate required fields
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Checklist item text is required' },
        { status: 400 }
      )
    }

    // Get the next position for the checklist item
    const lastItem = await prisma.checklistItem.findFirst({
      where: { cardId: params.id },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = (lastItem?.position || 0) + 1

    // Create the checklist item
    const checklistItem = await prisma.checklistItem.create({
      data: {
        text: text.trim(),
        position,
        cardId: params.id,
        completed: false,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CARD_UPDATED',
        description: `Added checklist item to card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        cardId: card.id,
        metadata: {
          cardTitle: card.title,
          action: 'checklist_item_added',
          checklistItemText: text.trim(),
        },
      },
    })

    return NextResponse.json(checklistItem)
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
    const { checklistItemId, text, completed } = body

    // Validate required fields
    if (!checklistItemId) {
      return NextResponse.json(
        { error: 'Checklist item ID is required' },
        { status: 400 }
      )
    }

    // Find the checklist item
    const existingItem = await prisma.checklistItem.findFirst({
      where: {
        id: checklistItemId,
        cardId: params.id,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json(
          { error: 'Checklist item text cannot be empty' },
          { status: 400 }
        )
      }
      updateData.text = text.trim()
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Completed must be a boolean value' },
          { status: 400 }
        )
      }
      updateData.completed = completed
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the checklist item
    const updatedItem = await prisma.checklistItem.update({
      where: { id: checklistItemId },
      data: updateData,
    })

    // Log activity
    const changes = Object.keys(updateData)
    let actionDescription = 'Updated checklist item'
    if (changes.includes('completed')) {
      actionDescription = completed ? 'Completed checklist item' : 'Unchecked checklist item'
    }

    await prisma.activity.create({
      data: {
        type: 'CARD_UPDATED',
        description: `${actionDescription} in card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        cardId: card.id,
        metadata: {
          cardTitle: card.title,
          action: 'checklist_item_updated',
          checklistItemId: checklistItemId,
          changes,
        },
      },
    })

    return NextResponse.json(updatedItem)
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

    // Get checklist item ID from search params
    const { searchParams } = new URL(request.url)
    const checklistItemId = searchParams.get('checklistItemId')

    if (!checklistItemId) {
      return NextResponse.json(
        { error: 'Checklist item ID is required' },
        { status: 400 }
      )
    }

    // Find the checklist item
    const checklistItem = await prisma.checklistItem.findFirst({
      where: {
        id: checklistItemId,
        cardId: params.id,
      },
    })

    if (!checklistItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      )
    }

    // Delete the checklist item and reorder positions
    await prisma.$transaction(async (tx) => {
      // Delete the item
      await tx.checklistItem.delete({
        where: { id: checklistItemId },
      })

      // Reorder remaining items
      await tx.checklistItem.updateMany({
        where: {
          cardId: params.id,
          position: {
            gt: checklistItem.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      })
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CARD_UPDATED',
        description: `Removed checklist item from card "${card.title}"`,
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: card.column.board.id,
        cardId: card.id,
        metadata: {
          cardTitle: card.title,
          action: 'checklist_item_deleted',
          checklistItemText: checklistItem.text,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}