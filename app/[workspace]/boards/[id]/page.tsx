import React, { Suspense } from 'react'
import { BoardView } from '@/components/board/board-view'
import { Skeleton } from '@/components/ui/skeleton'

interface BoardPageProps {
  params: Promise<{
    workspace: string
    id: string
  }>
}

function BoardPageSkeleton() {
  return (
    <div className="h-full flex space-x-6 p-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-80 flex-shrink-0">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <Skeleton key={cardIndex} className="h-24 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

async function BoardPageContent({ workspaceSlug, boardId }: { workspaceSlug: string; boardId: string }) {
  const handleCardClick = (card: any) => {
    // TODO: Open card detail modal/drawer
    console.log('Card clicked:', card)
  }

  return (
    <div className="h-full">
      {/* Board header can be added here in the future */}
      <BoardView
        workspaceSlug={workspaceSlug}
        boardId={boardId}
        onCardClick={handleCardClick}
        className="h-full"
      />
    </div>
  )
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { workspace, id } = await params

  return (
    <main className="h-full overflow-hidden">
      <Suspense fallback={<BoardPageSkeleton />}>
        <BoardPageContent workspaceSlug={workspace} boardId={id} />
      </Suspense>
    </main>
  )
}