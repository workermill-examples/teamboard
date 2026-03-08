import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withWorkspaceAccess, handleApiError } from '@/lib/rbac'

// GET /api/workspaces/[slug]/stats - Get workspace statistics
export const GET = withWorkspaceAccess('VIEWER')(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }, membership) => {
    try {
      // Get all cards in workspace (through boards)
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
          tasksByStatus: {},
          tasksByAssignee: {},
          tasksOverTime: [],
          overdueCount: 0,
          totalCards: 0,
          completedCards: 0,
        })
      }

      // Get all cards for statistics
      const allCards = await prisma.card.findMany({
        where: {
          column: {
            boardId: {
              in: boardIds,
            },
          },
          isArchived: false,
        },
        include: {
          column: {
            select: {
              title: true,
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
        },
      })

      // Calculate tasks by status (column)
      const tasksByStatus = allCards.reduce((acc: Record<string, number>, card) => {
        const status = card.column.title
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      // Calculate tasks by assignee
      const tasksByAssignee = allCards.reduce((acc: Record<string, { count: number; user: any }>, card) => {
        if (card.assignee) {
          const assigneeId = card.assignee.id
          if (!acc[assigneeId]) {
            acc[assigneeId] = {
              count: 0,
              user: card.assignee,
            }
          }
          acc[assigneeId].count++
        } else {
          acc['unassigned'] = acc['unassigned'] || { count: 0, user: null }
          acc['unassigned'].count++
        }
        return acc
      }, {})

      // Calculate overdue count
      const now = new Date()
      const overdueCount = allCards.filter(card =>
        card.dueDate && new Date(card.dueDate) < now
      ).length

      // Get cards created over time (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const cardsOverTime = await prisma.card.groupBy({
        by: ['createdAt'],
        where: {
          column: {
            boardId: {
              in: boardIds,
            },
          },
          isArchived: false,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        _count: {
          id: true,
        },
      })

      // Process tasks over time into daily buckets
      const tasksOverTime: Array<{ date: string; count: number }> = []
      const dailyGroups: Record<string, number> = {}

      // Initialize all days with 0
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split('T')[0]
        dailyGroups[dateKey] = 0
      }

      // Fill in actual counts
      cardsOverTime.forEach(group => {
        const dateKey = new Date(group.createdAt).toISOString().split('T')[0]
        if (Object.prototype.hasOwnProperty.call(dailyGroups, dateKey)) {
          dailyGroups[dateKey] += group._count.id
        }
      })

      // Convert to array format
      Object.entries(dailyGroups).forEach(([date, count]) => {
        tasksOverTime.push({ date, count })
      })

      // Sort by date
      tasksOverTime.sort((a, b) => a.date.localeCompare(b.date))

      // Calculate completed cards (assuming cards in "Done" or "Completed" columns are complete)
      const completedStatuses = ['done', 'completed', 'finished', 'complete']
      const completedCards = allCards.filter(card =>
        completedStatuses.indexOf(card.column.title.toLowerCase()) >= 0
      ).length

      const totalCards = allCards.length

      return NextResponse.json({
        tasksByStatus,
        tasksByAssignee,
        tasksOverTime,
        overdueCount,
        totalCards,
        completedCards,
      })
    } catch (error) {
      return handleApiError(error)
    }
  }
)