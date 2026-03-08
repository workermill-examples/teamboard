import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { withWorkspaceAccess, handleApiError } from '../../../../lib/rbac'

// GET /api/workspaces/[slug]/search - Search cards by title/description
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('q')

      if (!query || query.trim().length === 0) {
        return NextResponse.json({
          cards: [],
          query: '',
        })
      }

      const searchTerm = query.trim()

      // Get all boards in workspace first
      const workspaceBoards = await prisma.board.findMany({
        where: {
          workspaceId: membership.workspaceId,
          isArchived: false,
        },
        select: {
          id: true,
        },
      })

      const boardIds = workspaceBoards.map(board => board.id)

      if (boardIds.length === 0) {
        return NextResponse.json({
          cards: [],
          query: searchTerm,
        })
      }

      // Search cards by title and description
      const cards = await prisma.card.findMany({
        where: {
          column: {
            boardId: {
              in: boardIds,
            },
          },
          isArchived: false,
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          column: {
            select: {
              id: true,
              title: true,
              board: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
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
              label: {
                select: {
                  id: true,
                  name: true,
                  color: true,
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
        orderBy: [
          {
            // Prioritize title matches over description matches
            title: 'asc',
          },
          {
            updatedAt: 'desc',
          },
        ],
        take: 50, // Limit search results
      })

      return NextResponse.json({
        cards: cards.map(card => ({
          id: card.id,
          title: card.title,
          description: card.description,
          position: card.position,
          assigneeId: card.assigneeId,
          assignee: card.assignee,
          priority: card.priority,
          dueDate: card.dueDate,
          coverColor: card.coverColor,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          column: {
            id: card.column.id,
            title: card.column.title,
            board: card.column.board,
          },
          labels: card.labels.map(cl => cl.label),
          counts: {
            comments: card._count.comments,
            checklist: card._count.checklist,
          },
        })),
        query: searchTerm,
      })
    } catch (error) {
      return handleApiError(error)
    }
  }
)