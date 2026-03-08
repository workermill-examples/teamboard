import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withWorkspaceAccess, handleApiError } from '@/lib/rbac'

// GET /api/workspaces/[slug]/labels - List workspace labels
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params

      const labels = await prisma.label.findMany({
        where: {
          workspaceId: membership.workspaceId,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return NextResponse.json(labels)
    } catch (error) {
      return handleApiError(error)
    }
  }
)

// POST /api/workspaces/[slug]/labels - Create new label (Member+ required)
export const POST = withWorkspaceAccess('MEMBER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const params = await context.params
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

      // Check if label name already exists in workspace
      const existingLabel = await prisma.label.findFirst({
        where: {
          workspaceId: membership.workspaceId,
          name: name.trim(),
        },
      })

      if (existingLabel) {
        return NextResponse.json(
          { error: 'A label with this name already exists' },
          { status: 409 }
        )
      }

      // Create new label
      const newLabel = await prisma.label.create({
        data: {
          name: name.trim(),
          color,
          workspaceId: membership.workspaceId,
        },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'LABEL_CREATED',
          description: `Created label "${name}"`,
          userId: membership.user.id,
          workspaceId: membership.workspaceId,
          metadata: {
            labelId: newLabel.id,
            labelName: name,
            labelColor: color,
          },
        },
      })

      return NextResponse.json(newLabel, { status: 201 })
    } catch (error) {
      return handleApiError(error)
    }
  }
)