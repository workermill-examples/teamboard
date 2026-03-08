import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBoardWithAccess, handleApiError } from '@/lib/rbac'

// PUT /api/boards/[id]/columns/reorder - Reorder columns
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { board, membership } = await getBoardWithAccess(params.id, 'MEMBER')
    const body = await request.json()
    const { columnIds } = body

    // Validate columnIds
    if (!Array.isArray(columnIds)) {
      return NextResponse.json(
        { error: 'columnIds must be an array' },
        { status: 400 }
      )
    }

    if (columnIds.length === 0) {
      return NextResponse.json(
        { error: 'columnIds array cannot be empty' },
        { status: 400 }
      )
    }

    if (!columnIds.every(id => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'All columnIds must be strings' },
        { status: 400 }
      )
    }

    // Get existing columns for this board
    const existingColumns = await prisma.column.findMany({
      where: {
        boardId: params.id,
      },
      select: {
        id: true,
        title: true,
      },
    })

    // Validate that all provided column IDs belong to this board
    const existingColumnIds = existingColumns.map((col: any) => col.id)
    const invalidColumnIds = columnIds.filter((id: string) => existingColumnIds.indexOf(id) === -1)

    if (invalidColumnIds.length > 0) {
      return NextResponse.json(
        {
          error: 'Some column IDs do not belong to this board',
          invalidIds: invalidColumnIds
        },
        { status: 400 }
      )
    }

    // Check if all columns are included (no missing columns)
    const missingColumnIds = existingColumnIds.filter((id: string) => columnIds.indexOf(id) === -1)

    if (missingColumnIds.length > 0) {
      return NextResponse.json(
        {
          error: 'All board columns must be included in reorder',
          missingIds: missingColumnIds
        },
        { status: 400 }
      )
    }

    // Check for duplicates
    const uniqueColumnIds = [...new Set(columnIds)]
    if (uniqueColumnIds.length !== columnIds.length) {
      return NextResponse.json(
        { error: 'Duplicate column IDs are not allowed' },
        { status: 400 }
      )
    }

    // Perform the reorder in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Update each column's position
      for (let i = 0; i < columnIds.length; i++) {
        await tx.column.update({
          where: {
            id: columnIds[i],
          },
          data: {
            position: i,
          },
        })
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'COLUMNS_REORDERED',
        data: {
          boardId: params.id,
          boardTitle: board.title,
          columnOrder: columnIds,
          columnTitles: columnIds.map((id: string) => {
            const column = existingColumns.find((col: any) => col.id === id)
            return column?.title || 'Unknown'
          }),
        },
        userId: membership.user.id,
        workspaceId: membership.workspaceId,
        boardId: params.id,
      },
    })

    // Get updated columns to return
    const updatedColumns = await prisma.column.findMany({
      where: {
        boardId: params.id,
      },
      include: {
        _count: {
          select: {
            cards: {
              where: {
                isArchived: false,
              },
            },
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    })

    return NextResponse.json({
      message: 'Columns reordered successfully',
      columns: updatedColumns.map((column: any) => ({
        id: column.id,
        title: column.title,
        position: column.position,
        createdAt: column.createdAt,
        updatedAt: column.updatedAt,
        cardCount: column._count.cards,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}