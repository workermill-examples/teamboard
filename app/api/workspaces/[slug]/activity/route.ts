import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { withWorkspaceAccess, handleApiError } from '../../../../lib/rbac'

// GET /api/workspaces/[slug]/activity - Get workspace activity feed (cursor-based pagination, 20/page)
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const { searchParams } = new URL(request.url)
      const cursor = searchParams.get('cursor')
      const limit = 20

      // Build the query
      const whereClause: any = {
        workspaceId: membership.workspaceId,
      }

      // Add cursor pagination
      if (cursor) {
        whereClause.createdAt = {
          lt: new Date(cursor),
        }
      }

      const activities = await prisma.activity.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          board: {
            select: {
              id: true,
              title: true,
            },
          },
          card: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1, // Take one extra to determine if there are more
      })

      // Determine if there are more activities
      const hasMore = activities.length > limit
      const activityList = hasMore ? activities.slice(0, limit) : activities

      // Get the next cursor (last activity's createdAt)
      const nextCursor = activityList.length > 0
        ? activityList[activityList.length - 1].createdAt.toISOString()
        : null

      return NextResponse.json({
        activities: activityList.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          userId: activity.userId,
          user: activity.user,
          boardId: activity.boardId,
          board: activity.board,
          cardId: activity.cardId,
          card: activity.card,
          metadata: activity.metadata,
          createdAt: activity.createdAt,
        })),
        pagination: {
          hasMore,
          nextCursor,
        },
      })
    } catch (error) {
      return handleApiError(error)
    }
  }
)