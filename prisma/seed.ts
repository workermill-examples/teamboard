import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Check if data is already seeded (idempotent)
  const existingUser = await prisma.user.findFirst({
    where: { email: 'demo@workermill.com' }
  })

  if (existingUser) {
    console.log('Database already seeded')
    return
  }

  // Create demo user with hashed password
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@workermill.com',
      name: 'Demo User',
      password: hashedPassword,
      avatar: null,
    },
  })

  console.log('Created demo user:', demoUser.email)

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Product',
      slug: 'acme-product',
      description: 'Product development workspace for Acme Corporation',
      avatar: null,
      creatorId: demoUser.id,
    },
  })

  console.log('Created workspace:', workspace.slug)

  // Add creator as owner
  await prisma.workspaceMember.create({
    data: {
      userId: demoUser.id,
      workspaceId: workspace.id,
      role: 'OWNER',
    },
  })

  // Create additional members
  const members = [
    {
      email: 'alice@acme.com',
      name: 'Alice Johnson',
      role: 'ADMIN' as const,
    },
    {
      email: 'bob@acme.com',
      name: 'Bob Smith',
      role: 'MEMBER' as const,
    },
    {
      email: 'carol@acme.com',
      name: 'Carol Davis',
      role: 'MEMBER' as const,
    },
  ]

  const memberUsers = []
  for (const member of members) {
    const user = await prisma.user.create({
      data: {
        email: member.email,
        name: member.name,
        password: await bcrypt.hash('password123', 12),
      },
    })

    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: member.role,
      },
    })

    memberUsers.push(user)
  }

  console.log(`Created ${members.length} additional members`)

  // Create labels
  const labelData = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#10b981' },
    { name: 'Documentation', color: '#f59e0b' },
    { name: 'Critical', color: '#dc2626' },
  ]

  const labels = []
  for (const labelInfo of labelData) {
    const label = await prisma.label.create({
      data: {
        name: labelInfo.name,
        color: labelInfo.color,
        workspaceId: workspace.id,
      },
    })
    labels.push(label)
  }

  console.log(`Created ${labels.length} labels`)

  // Create boards with columns and cards
  const allUsers = [demoUser, ...memberUsers]

  // Board 1: Product Roadmap
  const roadmapBoard = await prisma.board.create({
    data: {
      title: 'Product Roadmap',
      description: 'Long-term product planning and feature roadmap',
      workspaceId: workspace.id,
      position: 0,
    },
  })

  // Roadmap columns
  const roadmapColumns = [
    { title: 'Backlog', position: 0 },
    { title: 'Planning', position: 1 },
    { title: 'In Development', position: 2 },
    { title: 'Testing', position: 3 },
    { title: 'Released', position: 4 },
  ]

  const roadmapColumnsCreated = []
  for (const col of roadmapColumns) {
    const column = await prisma.column.create({
      data: {
        title: col.title,
        position: col.position,
        boardId: roadmapBoard.id,
      },
    })
    roadmapColumnsCreated.push(column)
  }

  // Roadmap cards (12 total)
  const roadmapCards = [
    { title: 'User Authentication System', column: 0, priority: 'HIGH', assignee: 0 },
    { title: 'Dashboard Analytics', column: 0, priority: 'MEDIUM', assignee: 1 },
    { title: 'Mobile App MVP', column: 1, priority: 'HIGH', assignee: 2 },
    { title: 'API Rate Limiting', column: 1, priority: 'MEDIUM', assignee: 3 },
    { title: 'Real-time Notifications', column: 2, priority: 'HIGH', assignee: 0 },
    { title: 'File Upload System', column: 2, priority: 'MEDIUM', assignee: 1 },
    { title: 'Search Functionality', column: 3, priority: 'LOW', assignee: 2 },
    { title: 'User Profile Management', column: 3, priority: 'MEDIUM', assignee: 3 },
    { title: 'Email Templates', column: 4, priority: 'LOW', assignee: 0 },
    { title: 'Basic CRUD Operations', column: 4, priority: 'HIGH', assignee: 1 },
    { title: 'Password Reset Flow', column: 4, priority: 'MEDIUM', assignee: 2 },
    { title: 'Landing Page', column: 4, priority: 'LOW', assignee: 3 },
  ]

  let cardCount = 0
  for (const cardInfo of roadmapCards) {
    const card = await prisma.card.create({
      data: {
        title: cardInfo.title,
        description: `Detailed description for ${cardInfo.title}`,
        position: cardCount % 3,
        columnId: roadmapColumnsCreated[cardInfo.column].id,
        assigneeId: allUsers[cardInfo.assignee].id,
        priority: cardInfo.priority as any,
        coverColor: cardCount % 2 === 0 ? '#e0f2fe' : null,
        dueDate: cardInfo.column < 3 ? new Date(Date.now() + (cardCount + 1) * 7 * 24 * 60 * 60 * 1000) : null,
      },
    })

    // Add some labels to cards
    if (cardCount % 3 === 0) {
      await prisma.cardLabel.create({
        data: {
          cardId: card.id,
          labelId: labels[cardCount % labels.length].id,
        },
      })
    }

    cardCount++
  }

  // Board 2: Sprint 14
  const sprintBoard = await prisma.board.create({
    data: {
      title: 'Sprint 14',
      description: 'Current sprint planning and task management',
      workspaceId: workspace.id,
      position: 1,
    },
  })

  // Sprint columns
  const sprintColumns = [
    { title: 'Todo', position: 0 },
    { title: 'In Progress', position: 1 },
    { title: 'Review', position: 2 },
    { title: 'Done', position: 3 },
  ]

  const sprintColumnsCreated = []
  for (const col of sprintColumns) {
    const column = await prisma.column.create({
      data: {
        title: col.title,
        position: col.position,
        boardId: sprintBoard.id,
      },
    })
    sprintColumnsCreated.push(column)
  }

  // Sprint cards (10 total)
  const sprintCards = [
    { title: 'Fix login validation bug', column: 0, priority: 'URGENT', assignee: 1 },
    { title: 'Update user profile UI', column: 0, priority: 'MEDIUM', assignee: 2 },
    { title: 'Add loading states to forms', column: 1, priority: 'LOW', assignee: 0 },
    { title: 'Implement forgot password', column: 1, priority: 'HIGH', assignee: 3 },
    { title: 'Write unit tests for auth', column: 1, priority: 'MEDIUM', assignee: 1 },
    { title: 'Code review: API endpoints', column: 2, priority: 'HIGH', assignee: 2 },
    { title: 'Deploy staging environment', column: 2, priority: 'URGENT', assignee: 0 },
    { title: 'Database backup script', column: 3, priority: 'MEDIUM', assignee: 3 },
    { title: 'Update documentation', column: 3, priority: 'LOW', assignee: 1 },
    { title: 'Performance optimization', column: 3, priority: 'HIGH', assignee: 2 },
  ]

  for (const cardInfo of sprintCards) {
    const card = await prisma.card.create({
      data: {
        title: cardInfo.title,
        description: `Sprint task: ${cardInfo.title}`,
        position: cardCount % 3,
        columnId: sprintColumnsCreated[cardInfo.column].id,
        assigneeId: allUsers[cardInfo.assignee].id,
        priority: cardInfo.priority as any,
        coverColor: cardCount % 4 === 1 ? '#fef3c7' : null,
        dueDate: cardInfo.column < 2 ? new Date(Date.now() + (cardCount + 1) * 2 * 24 * 60 * 60 * 1000) : null,
      },
    })

    // Add labels to some cards
    if (cardCount % 2 === 1) {
      await prisma.cardLabel.create({
        data: {
          cardId: card.id,
          labelId: labels[(cardCount + 1) % labels.length].id,
        },
      })
    }

    cardCount++
  }

  // Board 3: Bug Tracker
  const bugBoard = await prisma.board.create({
    data: {
      title: 'Bug Tracker',
      description: 'Track and resolve application bugs',
      workspaceId: workspace.id,
      position: 2,
    },
  })

  // Bug tracker columns
  const bugColumns = [
    { title: 'Reported', position: 0 },
    { title: 'Investigating', position: 1 },
    { title: 'Fixed', position: 2 },
  ]

  const bugColumnsCreated = []
  for (const col of bugColumns) {
    const column = await prisma.column.create({
      data: {
        title: col.title,
        position: col.position,
        boardId: bugBoard.id,
      },
    })
    bugColumnsCreated.push(column)
  }

  // Bug cards (8 total)
  const bugCards = [
    { title: 'User cannot login with special characters', column: 0, priority: 'HIGH', assignee: 0 },
    { title: 'Dashboard loading timeout', column: 0, priority: 'MEDIUM', assignee: 1 },
    { title: 'Email notifications not sending', column: 0, priority: 'URGENT', assignee: 2 },
    { title: 'Mobile layout broken on iOS', column: 1, priority: 'HIGH', assignee: 3 },
    { title: 'Search results pagination error', column: 1, priority: 'MEDIUM', assignee: 0 },
    { title: 'File upload fails for large files', column: 1, priority: 'HIGH', assignee: 1 },
    { title: 'Memory leak in real-time updates', column: 2, priority: 'URGENT', assignee: 2 },
    { title: 'CORS error on API calls', column: 2, priority: 'LOW', assignee: 3 },
  ]

  for (const cardInfo of bugCards) {
    const card = await prisma.card.create({
      data: {
        title: cardInfo.title,
        description: `Bug report: ${cardInfo.title}`,
        position: cardCount % 3,
        columnId: bugColumnsCreated[cardInfo.column].id,
        assigneeId: allUsers[cardInfo.assignee].id,
        priority: cardInfo.priority as any,
        coverColor: cardInfo.priority === 'URGENT' ? '#fee2e2' : null,
        dueDate: cardInfo.column === 0 ? new Date(Date.now() + (cardCount + 1) * 24 * 60 * 60 * 1000) : null,
      },
    })

    // Add bug label to all bug cards
    await prisma.cardLabel.create({
      data: {
        cardId: card.id,
        labelId: labels[0].id, // Bug label
      },
    })

    cardCount++
  }

  console.log(`Created ${cardCount} cards across 3 boards`)

  // Create some comments and checklist items
  const allCards = await prisma.card.findMany({
    where: { column: { board: { workspaceId: workspace.id } } },
    take: 10,
  })

  for (let i = 0; i < Math.min(5, allCards.length); i++) {
    const card = allCards[i]
    const commenter = allUsers[i % allUsers.length]

    await prisma.comment.create({
      data: {
        content: `This is a sample comment on ${card.title}. Great progress so far!`,
        cardId: card.id,
        authorId: commenter.id,
      },
    })

    // Add checklist items
    await prisma.checklistItem.create({
      data: {
        text: 'Review requirements',
        completed: true,
        position: 0,
        cardId: card.id,
      },
    })

    await prisma.checklistItem.create({
      data: {
        text: 'Write implementation',
        completed: i < 2,
        position: 1,
        cardId: card.id,
      },
    })

    await prisma.checklistItem.create({
      data: {
        text: 'Add tests',
        completed: false,
        position: 2,
        cardId: card.id,
      },
    })
  }

  // Create activities (25 activities as specified)
  const activityTypes = [
    'CARD_CREATED',
    'CARD_UPDATED',
    'CARD_MOVED',
    'COMMENT_ADDED',
    'MEMBER_ADDED',
    'BOARD_CREATED',
  ]

  for (let i = 0; i < 25; i++) {
    const activityType = activityTypes[i % activityTypes.length] as any
    const user = allUsers[i % allUsers.length]
    const card = i < allCards.length ? allCards[i] : allCards[i % allCards.length]

    await prisma.activity.create({
      data: {
        type: activityType,
        description: `${user.name} ${activityType.toLowerCase().replace('_', ' ')} ${card.title}`,
        userId: user.id,
        workspaceId: workspace.id,
        boardId: i % 3 === 0 ? roadmapBoard.id : i % 3 === 1 ? sprintBoard.id : bugBoard.id,
        cardId: activityType.includes('CARD') || activityType === 'COMMENT_ADDED' ? card.id : null,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'prisma_seed',
        },
      },
    })
  }

  // Add some board stars
  await prisma.boardStar.create({
    data: {
      userId: demoUser.id,
      boardId: roadmapBoard.id,
    },
  })

  await prisma.boardStar.create({
    data: {
      userId: memberUsers[0].id,
      boardId: sprintBoard.id,
    },
  })

  console.log('Seeding completed successfully')
  console.log(`Total cards created: ${cardCount}`)
  console.log('Demo user:', demoUser.email)
  console.log('Workspace:', workspace.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })