import { PrismaClient } from '@prisma/client'

async function globalSetup() {
  const prisma = new PrismaClient()

  try {
    // Ensure demo user exists for tests
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@workermill.com' },
    })

    if (!demoUser) {
      console.log('Demo user not found, seeding database...')

      // Call the seed API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SEED_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('Database seeded successfully')
      } else {
        console.log('Database already seeded or seed failed')
      }
    }
  } catch (error) {
    console.log('Global setup warning:', error)
  } finally {
    await prisma.$disconnect()
  }
}

export default globalSetup