import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireWorkspaceAccess, handleApiError } from '@/lib/rbac'

// PUT /api/workspaces/[slug]/labels/[id] - Update label (Member+ required)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const params = await context.params
    const membership = await requireWorkspaceAccess(params.slug, 'MEMBER')
      const body = await request.json()
      const { name, color } = body

      // Validate required fields
      if (!name || !color) {
        return NextResponse.json(
          { error: 'Name and color are required' },
          { status: 400 }
        )
      }

      // Validate name length
      if (name.length > 50) {
        return NextResponse.json(
          { error: 'Label name must be 50 characters or less' },
          { status: 400 }
        )
      }

      // Validate color format (hex color)
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
      if (!hexColorRegex.test(color)) {
        return NextResponse.json(
          { error: 'Color must be a valid hex color (e.g., #FF0000)' },
          { status: 400 }
        )
      }

      // Find the label to update
      const existingLabel = await prisma.label.findUnique({
        where: { id: params.id },
        include: {
          workspace: {
            select: {
              slug: true,
            },
          },
        },
      })

      if (!existingLabel) {
        return NextResponse.json(
          { error: 'Label not found' },
          { status: 404 }
        )
      }

      // Verify label belongs to the correct workspace
      if (existingLabel.workspace.slug !== params.slug) {
        return NextResponse.json(
          { error: 'Label does not belong to this workspace' },
          { status: 400 }
        )
      }

      // Check if another label with the same name already exists in workspace
      const duplicateLabel = await prisma.label.findFirst({
        where: {
          workspaceId: membership.workspaceId,
          name: name.trim(),
          id: { not: params.id }, // Exclude current label
        },
      })

      if (duplicateLabel) {
        return NextResponse.json(
          { error: 'A label with this name already exists' },
          { status: 409 }
        )
      }

      // Update label
      const updatedLabel = await prisma.label.update({
        where: { id: params.id },
        data: {
          name: name.trim(),
          color,
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'LABEL_UPDATED',
          description: `Updated label "${existingLabel.name}" to "${name}"`,
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          metadata: {
            labelId: updatedLabel.id,
            oldName: existingLabel.name,
            newName: name,
            oldColor: existingLabel.color,
            newColor: color,
          },
        },
      })

      return NextResponse.json(updatedLabel)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/workspaces/[slug]/labels/[id] - Delete label (Member+ required)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const params = await context.params
    const membership = await requireWorkspaceAccess(params.slug, 'MEMBER')

      // Find the label to delete
      const existingLabel = await prisma.label.findUnique({
        where: { id: params.id },
        include: {
          workspace: {
            select: {
              slug: true,
            },
          },
          cards: {
            select: {
              card: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      })

      if (!existingLabel) {
        return NextResponse.json(
          { error: 'Label not found' },
          { status: 404 }
        )
      }

      // Verify label belongs to the correct workspace
      if (existingLabel.workspace.slug !== params.slug) {
        return NextResponse.json(
          { error: 'Label does not belong to this workspace' },
          { status: 400 }
        )
      }

      const cardCount = existingLabel.cards.length

      // Delete label (cascade will remove from cards)
      await prisma.label.delete({
        where: { id: params.id },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'LABEL_DELETED',
          description: `Deleted label "${existingLabel.name}" (was used on ${cardCount} card${cardCount !== 1 ? 's' : ''})`,
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          metadata: {
            labelId: existingLabel.id,
            labelName: existingLabel.name,
            labelColor: existingLabel.color,
            cardCount,
          },
        },
      })

      return NextResponse.json({
        message: 'Label deleted successfully',
        cardCount,
      })
  } catch (error) {
    return handleApiError(error)
  }
}