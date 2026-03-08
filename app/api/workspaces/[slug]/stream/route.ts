import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireWorkspaceAccess, handleApiError } from '@/lib/rbac'

// GET /api/workspaces/[slug]/stream - SSE stream for real-time workspace updates
export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params

    // Verify workspace access
    const membership = await requireWorkspaceAccess(params.slug, 'VIEWER')

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder()
    let isClientConnected = true
    let pollingInterval: NodeJS.Timeout

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'connected',
              workspaceId: membership.workspaceId,
              timestamp: new Date().toISOString(),
            })}\n\n`
          )
        )

        // Keep track of last activity timestamp to avoid sending duplicates
        let lastActivityTimestamp = new Date()

        // Polling function to check for new activities
        const pollForUpdates = async () => {
          if (!isClientConnected) {
            return
          }

          try {
            // Get recent activities (last 30 seconds)
            const recentActivityCutoff = new Date(Date.now() - 30 * 1000)

            const activities = await prisma.activity.findMany({
              where: {
                workspaceId: membership.workspaceId,
                createdAt: {
                  gt: recentActivityCutoff > lastActivityTimestamp ? lastActivityTimestamp : recentActivityCutoff,
                },
              },
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
              take: 10, // Limit to prevent overwhelming the client
            })

            // Send activity events
            for (const activity of activities) {
              if (!isClientConnected) {
                break
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'activity',
                    data: {
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
                    },
                  })}\n\n`
                )
              )
            }

            // Update last activity timestamp if we found activities
            if (activities.length > 0) {
              lastActivityTimestamp = activities[0].createdAt
            }

            // Get recent card updates (for card events)
            const recentCards = await prisma.card.findMany({
              where: {
                column: {
                  board: {
                    workspaceId: membership.workspaceId,
                  },
                },
                updatedAt: {
                  gt: recentActivityCutoff,
                },
              },
              include: {
                column: {
                  select: {
                    id: true,
                    title: true,
                    boardId: true,
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
              orderBy: {
                updatedAt: 'desc',
              },
              take: 5,
            })

            // Send card update events
            for (const card of recentCards) {
              if (!isClientConnected) {
                break
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'card_updated',
                    data: {
                      id: card.id,
                      title: card.title,
                      description: card.description,
                      position: card.position,
                      columnId: card.columnId,
                      column: card.column,
                      assigneeId: card.assigneeId,
                      assignee: card.assignee,
                      priority: card.priority,
                      dueDate: card.dueDate,
                      coverColor: card.coverColor,
                      isArchived: card.isArchived,
                      createdAt: card.createdAt,
                      updatedAt: card.updatedAt,
                    },
                  })}\n\n`
                )
              )
            }

            // Get recent board updates (for board events)
            const recentBoards = await prisma.board.findMany({
              where: {
                workspaceId: membership.workspaceId,
                updatedAt: {
                  gt: recentActivityCutoff,
                },
              },
              select: {
                id: true,
                title: true,
                description: true,
                position: true,
                isArchived: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: {
                updatedAt: 'desc',
              },
              take: 3,
            })

            // Send board update events
            for (const board of recentBoards) {
              if (!isClientConnected) {
                break
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'board_updated',
                    data: board,
                  })}\n\n`
                )
              )
            }
          } catch (error) {
            console.error('SSE polling error:', error)
            // Continue polling despite errors
          }
        }

        // Start polling every 1.5 seconds
        pollingInterval = setInterval(pollForUpdates, 1500)

        // Send keep-alive every 20 seconds
        const keepAliveInterval = setInterval(() => {
          if (!isClientConnected) {
            clearInterval(keepAliveInterval)
            return
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'keep-alive',
                timestamp: new Date().toISOString(),
              })}\n\n`
            )
          )
        }, 20000)

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          isClientConnected = false
          clearInterval(pollingInterval)
          clearInterval(keepAliveInterval)
          controller.close()
        })
      },

      cancel() {
        isClientConnected = false
        if (pollingInterval) {
          clearInterval(pollingInterval)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })
  } catch (error) {
    console.error('SSE stream error:', error)
    return handleApiError(error)
  }
}