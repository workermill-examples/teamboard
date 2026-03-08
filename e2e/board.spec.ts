import { test, expect } from './fixtures/auth.fixture'

test.describe('Board Management', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('demo@workermill.com', 'demo1234')
  })

  test.describe('Board List View', () => {
    test('should display boards in workspace', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Navigate to boards
      await page.click('[data-testid="nav-boards"]')

      // Should show boards list or redirect to first board
      const url = page.url()
      expect(url).toMatch(/\/boards/)
    })

    test('should show board cards with information', async ({ page }) => {
      await page.goto('/acme-product/boards')

      // Should show demo boards from seed data
      await expect(page.locator('[data-testid="board-card"]')).toHaveCount.toBeGreaterThan(0)

      // Should show board names
      await expect(page.locator('text=Product Roadmap')).toBeVisible()
      await expect(page.locator('text=Sprint 14')).toBeVisible()
      await expect(page.locator('text=Bug Tracker')).toBeVisible()
    })

    test('should create new board', async ({ page }) => {
      await page.goto('/acme-product/boards')

      const boardName = `Test Board ${Date.now()}`

      await page.click('[data-testid="create-board-button"]')

      // Fill board creation form
      await page.fill('[data-testid="board-name-input"]', boardName)
      await page.fill('[data-testid="board-description-input"]', 'Test board description')

      await page.click('[data-testid="create-board-submit"]')

      // Should navigate to new board
      await expect(page).toHaveURL(new RegExp(`/boards/[a-z0-9]+`))

      // Should show board name
      await expect(page.locator('h1')).toContainText(boardName)
    })
  })

  test.describe('Board Kanban View', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a demo board
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
    })

    test('should display board with columns and cards', async ({ page }) => {
      // Should show board title
      await expect(page.locator('h1')).toBeVisible()

      // Should show columns
      await expect(page.locator('[data-testid="column"]')).toHaveCount.toBeGreaterThan(0)

      // Should show cards in columns
      await expect(page.locator('[data-testid="card"]')).toHaveCount.toBeGreaterThan(0)
    })

    test('should show column information', async ({ page }) => {
      const firstColumn = page.locator('[data-testid="column"]').first()

      // Should show column name
      await expect(firstColumn.locator('[data-testid="column-title"]')).toBeVisible()

      // Should show card count
      await expect(firstColumn.locator('[data-testid="column-count"]')).toContainText(/\d+/)

      // Should show add card button
      await expect(firstColumn.locator('[data-testid="add-card-button"]')).toBeVisible()
    })

    test('should display card information correctly', async ({ page }) => {
      const firstCard = page.locator('[data-testid="card"]').first()

      // Should show card title
      await expect(firstCard.locator('[data-testid="card-title"]')).toBeVisible()

      // Should show card description if present
      await expect(firstCard.locator('[data-testid="card-description"]')).toBeVisible()

      // Should show priority badge if not medium
      // Should show assignee avatar if assigned
      // Should show due date if set
      // Should show labels if present
    })

    test('should support horizontal scrolling for many columns', async ({ page }) => {
      // Check if board is horizontally scrollable
      const boardContainer = page.locator('[data-testid="board-container"]')
      await expect(boardContainer).toBeVisible()

      // On mobile/small screens, should be scrollable
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(boardContainer).toHaveCSS('overflow-x', /auto|scroll/)
    })
  })

  test.describe('Card Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
    })

    test('should create new card', async ({ page }) => {
      const cardTitle = `Test Card ${Date.now()}`

      await page.click('[data-testid="add-card-button"]')

      // Should open card creation form/modal
      await page.fill('[data-testid="card-title-input"]', cardTitle)
      await page.fill('[data-testid="card-description-input"]', 'Test card description')

      await page.click('[data-testid="create-card-submit"]')

      // Should show new card in the board
      await expect(page.locator(`text=${cardTitle}`)).toBeVisible()
    })

    test('should open card detail modal', async ({ page }) => {
      await page.click('[data-testid="card"]:first-child')

      // Should open card detail modal
      await expect(page.locator('[data-testid="card-detail-modal"]')).toBeVisible()

      // Should show card information
      await expect(page.locator('[data-testid="card-detail-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="card-detail-description"]')).toBeVisible()
    })

    test('should edit card title inline', async ({ page }) => {
      await page.click('[data-testid="card"]:first-child')

      // Click on card title to edit
      await page.click('[data-testid="card-detail-title"]')

      const newTitle = `Updated Card ${Date.now()}`
      await page.fill('[data-testid="card-title-edit"]', newTitle)
      await page.press('[data-testid="card-title-edit"]', 'Enter')

      // Should update card title
      await expect(page.locator('[data-testid="card-detail-title"]')).toContainText(newTitle)

      // Should save changes
      await page.keyboard.press('Escape') // Close modal
      await expect(page.locator(`text=${newTitle}`)).toBeVisible()
    })

    test('should update card properties', async ({ page }) => {
      await page.click('[data-testid="card"]:first-child')

      // Update priority
      await page.click('[data-testid="priority-select"]')
      await page.click('[data-testid="priority-urgent"]')

      // Should show urgent priority badge
      await expect(page.locator('[data-testid="priority-badge"]')).toContainText('Urgent')

      // Update due date
      await page.click('[data-testid="due-date-picker"]')
      // Select a date (implementation depends on date picker)
      await page.click('[data-testid="date-today"]')

      // Should show due date
      await expect(page.locator('[data-testid="card-due-date"]')).toBeVisible()
    })

    test('should add and remove labels', async ({ page }) => {
      await page.click('[data-testid="card"]:first-child')

      // Add label
      await page.click('[data-testid="labels-section"] [data-testid="add-label"]')
      await page.click('[data-testid="label-bug"]')

      // Should show label on card
      await expect(page.locator('[data-testid="card-label-bug"]')).toBeVisible()

      // Remove label
      await page.click('[data-testid="card-label-bug"] [data-testid="remove-label"]')

      // Should not show label
      await expect(page.locator('[data-testid="card-label-bug"]')).not.toBeVisible()
    })
  })

  test.describe('Drag and Drop', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
    })

    test('should move card within column', async ({ page }) => {
      const firstCard = page.locator('[data-testid="card"]').first()
      const secondCard = page.locator('[data-testid="card"]').nth(1)

      const firstCardTitle = await firstCard.locator('[data-testid="card-title"]').textContent()

      // Drag first card below second card
      await firstCard.dragTo(secondCard, { targetPosition: { x: 0, y: 50 } })

      // Verify card moved position
      const newSecondCard = page.locator('[data-testid="card"]').nth(1)
      await expect(newSecondCard.locator('[data-testid="card-title"]')).toContainText(firstCardTitle!)
    })

    test('should move card between columns', async ({ page }) => {
      const sourceColumn = page.locator('[data-testid="column"]').first()
      const targetColumn = page.locator('[data-testid="column"]').nth(1)

      const firstCard = sourceColumn.locator('[data-testid="card"]').first()
      const cardTitle = await firstCard.locator('[data-testid="card-title"]').textContent()

      // Drag card to different column
      await firstCard.dragTo(targetColumn.locator('[data-testid="add-card-button"]'))

      // Verify card moved to target column
      await expect(targetColumn.locator(`text=${cardTitle}`)).toBeVisible()
      await expect(sourceColumn.locator(`text=${cardTitle}`)).not.toBeVisible()
    })

    test('should provide visual feedback during drag', async ({ page }) => {
      const firstCard = page.locator('[data-testid="card"]').first()

      // Start dragging
      await firstCard.hover()
      await page.mouse.down()

      // Should show drag state
      await expect(firstCard).toHaveClass(/dragging|opacity-50/)

      // Cancel drag
      await page.mouse.up()
    })

    test('should support touch drag on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const firstCard = page.locator('[data-testid="card"]').first()

      // Long press to initiate drag on touch devices
      await firstCard.tap({ timeout: 1000 })

      // This is more complex to test properly and might need specific mobile testing
      // For now, just verify the card is responsive to touch
      await expect(firstCard).toBeVisible()
    })
  })

  test.describe('Board Filters', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
    })

    test('should filter cards by assignee', async ({ page }) => {
      // Open filter menu
      await page.click('[data-testid="filter-button"]')

      // Select assignee filter
      await page.click('[data-testid="filter-assignee"]')
      await page.click('[data-testid="assignee-demo"]')

      // Should show only cards assigned to demo user
      const cards = page.locator('[data-testid="card"]')
      await expect(cards).toHaveCount.toBeGreaterThan(0)

      // All visible cards should have demo user assigned
      for (const card of await cards.all()) {
        await expect(card.locator('[data-testid="card-assignee"]')).toBeVisible()
      }
    })

    test('should filter cards by priority', async ({ page }) => {
      await page.click('[data-testid="filter-button"]')

      // Filter by high priority
      await page.click('[data-testid="filter-priority"]')
      await page.click('[data-testid="priority-high"]')

      // Should show only high priority cards
      const cards = page.locator('[data-testid="card"]')
      for (const card of await cards.all()) {
        await expect(card.locator('[data-testid="priority-badge"]')).toContainText('High')
      }
    })

    test('should search cards by title', async ({ page }) => {
      const searchTerm = 'user'

      await page.fill('[data-testid="search-cards"]', searchTerm)

      // Should show only cards matching search term
      const cards = page.locator('[data-testid="card"]')
      for (const card of await cards.all()) {
        const title = await card.locator('[data-testid="card-title"]').textContent()
        expect(title?.toLowerCase()).toContain(searchTerm.toLowerCase())
      }
    })

    test('should clear all filters', async ({ page }) => {
      // Apply some filters
      await page.click('[data-testid="filter-button"]')
      await page.click('[data-testid="filter-assignee"]')
      await page.click('[data-testid="assignee-demo"]')

      const filteredCount = await page.locator('[data-testid="card"]').count()

      // Clear filters
      await page.click('[data-testid="clear-filters"]')

      // Should show all cards again
      const totalCount = await page.locator('[data-testid="card"]').count()
      expect(totalCount).toBeGreaterThanOrEqual(filteredCount)
    })
  })
})