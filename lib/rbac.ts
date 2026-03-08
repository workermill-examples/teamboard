import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkspaceRole } from '@prisma/client'

// Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
const ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
} as const

export type RequiredRole = keyof typeof ROLE_HIERARCHY

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

export interface WorkspaceMembership {
  user: AuthenticatedUser
  role: WorkspaceRole
  workspaceId: string
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

/**
 * Get the current authenticated user from the session
 */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const session = await auth()

  if (!session?.user?.id) {
    throw new UnauthorizedError('Authentication required')
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  }
}

/**
 * Check if a role meets the minimum required role
 */
export function hasRequiredRole(userRole: WorkspaceRole, requiredRole: RequiredRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Get user's membership in a specific workspace
 */
export async function getWorkspaceMembership(
  userId: string,
  workspaceSlug: string
): Promise<WorkspaceMembership | null> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        slug: workspaceSlug,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      },
      workspace: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!membership) {
    return null
  }

  return {
    user: {
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      image: membership.user.avatar,
    },
    role: membership.role,
    workspaceId: membership.workspace.id,
  }
}

/**
 * Require workspace access with minimum role
 */
export async function requireWorkspaceAccess(
  workspaceSlug: string,
  requiredRole: RequiredRole = 'VIEWER'
): Promise<WorkspaceMembership> {
  const user = await getCurrentUser()
  const membership = await getWorkspaceMembership(user.id, workspaceSlug)

  if (!membership) {
    throw new NotFoundError('Workspace not found or access denied')
  }

  if (!hasRequiredRole(membership.role, requiredRole)) {
    throw new ForbiddenError(
      `${requiredRole} role or higher required. Current role: ${membership.role}`
    )
  }

  return membership
}

/**
 * Check if user is the workspace creator/owner
 */
export async function isWorkspaceOwner(userId: string, workspaceSlug: string): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { creatorId: true },
  })

  return workspace?.creatorId === userId
}

/**
 * Require workspace ownership
 */
export async function requireWorkspaceOwnership(workspaceSlug: string): Promise<WorkspaceMembership> {
  const user = await getCurrentUser()
  const isOwner = await isWorkspaceOwner(user.id, workspaceSlug)

  if (!isOwner) {
    throw new ForbiddenError('Workspace owner access required')
  }

  const membership = await getWorkspaceMembership(user.id, workspaceSlug)
  if (!membership) {
    throw new NotFoundError('Workspace not found')
  }

  return membership
}

/**
 * Get board with workspace access check
 */
export async function getBoardWithAccess(
  boardId: string,
  requiredRole: RequiredRole = 'VIEWER'
): Promise<{ board: any; membership: WorkspaceMembership }> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: {
        select: {
          slug: true,
        },
      },
    },
  })

  if (!board) {
    throw new NotFoundError('Board not found')
  }

  const membership = await requireWorkspaceAccess(board.workspace.slug, requiredRole)

  return { board, membership }
}

/**
 * Get card with workspace access check
 */
export async function getCardWithAccess(
  cardId: string,
  requiredRole: RequiredRole = 'VIEWER'
): Promise<{ card: any; membership: WorkspaceMembership }> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: {
          board: {
            include: {
              workspace: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!card) {
    throw new NotFoundError('Card not found')
  }

  const membership = await requireWorkspaceAccess(
    card.column.board.workspace.slug,
    requiredRole
  )

  return { card, membership }
}

/**
 * Get column with workspace access check
 */
export async function getColumnWithAccess(
  columnId: string,
  requiredRole: RequiredRole = 'VIEWER'
): Promise<{ column: any; membership: WorkspaceMembership }> {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: {
        include: {
          workspace: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  })

  if (!column) {
    throw new NotFoundError('Column not found')
  }

  const membership = await requireWorkspaceAccess(column.board.workspace.slug, requiredRole)

  return { column, membership }
}

/**
 * Express-like middleware for API routes with workspace access
 */
export function withWorkspaceAccess(
  requiredRole: RequiredRole = 'VIEWER'
) {
  return function (
    handler: (
      request: NextRequest,
      context: { params: Promise<{ slug: string }> },
      membership: WorkspaceMembership
    ) => Promise<NextResponse>
  ) {
    return async function (
      request: NextRequest,
      context: { params: Promise<{ slug: string }> }
    ): Promise<NextResponse> {
      try {
        const params = await context.params
        const membership = await requireWorkspaceAccess(params.slug, requiredRole)
        return await handler(request, context, membership)
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
        if (error instanceof ForbiddenError) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        if (error instanceof NotFoundError) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        console.error('RBAC Error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Express-like middleware for API routes with authentication only
 */
export function withAuth() {
  return function (
    handler: (
      request: NextRequest,
      context: any,
      user: AuthenticatedUser
    ) => Promise<NextResponse>
  ) {
    return async function (
      request: NextRequest,
      context: any
    ): Promise<NextResponse> {
      try {
        const user = await getCurrentUser()
        return await handler(request, context, user)
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
        console.error('Auth Error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Helper to handle common API errors
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}