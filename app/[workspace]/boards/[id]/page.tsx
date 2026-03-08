'use client'

import React, { Suspense, useState } from 'react'
import { use } from 'react'
import { BoardView } from '@/components/board/board-view'
import { CardDetail } from '@/components/board/card-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspace } from '@/hooks/use-workspace'

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

function BoardPageContent({ workspaceSlug, boardId }: { workspaceSlug: string; boardId: string }) {
  const { workspace } = useWorkspace()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const handleCardClick = (card: any) => {
    setSelectedCardId(card.id)
  }

  const handleCloseCardDetail = () => {
    setSelectedCardId(null)
  }

  const handleCardUpdated = () => {
    // Card was updated, possibly refetch board data
  }

  const handleCardDeleted = () => {
    setSelectedCardId(null)
    // Card was deleted, possibly refetch board data
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

      {/* Card Detail Modal */}
      <CardDetail
        cardId={selectedCardId}
        isOpen={!!selectedCardId}
        onClose={handleCloseCardDetail}
        availableAssignees={workspace?.members?.map(member => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar
        })) || []}
        availableLabels={[]}
        onCardUpdated={handleCardUpdated}
        onCardDeleted={handleCardDeleted}
      />
    </div>
  )
}

function BoardPageWrapper({ params }: BoardPageProps) {
  const { workspace, id } = use(params)

  return (
    <main className="h-full overflow-hidden">
      <Suspense fallback={<BoardPageSkeleton />}>
        <BoardPageContent workspaceSlug={workspace} boardId={id} />
      </Suspense>
    </main>
  )
}

export default function BoardPage({ params }: BoardPageProps) {
  return <BoardPageWrapper params={params} />
}