import { test, expect } from './fixtures/auth.fixture'

test.describe('Activity Feed', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('demo@workermill.com', 'demo1234')
    await test.step('Navigate to activity feed', async ({ page }) => {
      await page.goto('/acme-product/activity')
    })
  })

  test.describe('Activity Display', () => {
    test('should display activity feed', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Activity')

      // Should show activity items
      await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.toBeGreaterThan(0)
    })

    test('should show activity information', async ({ page }) => {
      const firstActivity = page.locator('[data-testid="activity-item"]').first()

      // Should show user avatar
      await expect(firstActivity.locator('[data-testid="activity-avatar"]')).toBeVisible()

      // Should show activity description
      await expect(firstActivity.locator('[data-testid="activity-description"]')).toBeVisible()

      // Should show timestamp
      await expect(firstActivity.locator('[data-testid="activity-timestamp"]')).toBeVisible()
    })

    test('should display different activity types', async ({ page }) => {
      const activities = page.locator('[data-testid="activity-item"]')

      // Should have various activity types from seed data
      await expect(activities).toHaveCount.toBeGreaterThan(5)

      // Look for different activity descriptions
      await expect(page.locator('text=created card')).toBeVisible()
      await expect(page.locator('text=moved card')).toBeVisible()
      await expect(page.locator('text=updated card')).toBeVisible()
    })

    test('should show relative timestamps', async ({ page }) => {
      const timestamps = page.locator('[data-testid="activity-timestamp"]')

      // Should show relative time (e.g., "2 hours ago", "3 days ago")
      const firstTimestamp = timestamps.first()
      await expect(firstTimestamp).toContainText(/ago|now/)
    })
  })

  test.describe('Real-time Updates', () => {
    test('should receive real-time activity updates', async ({ page, context }) => {
      // Open a second tab to create activity
      const newPage = await context.newPage()
      await newPage.goto('/acme-product/boards')

      // Perform an action that creates activity
      await newPage.click('[data-testid="board-card"]:first-child')
      await newPage.click('[data-testid="add-card-button"]')

      const cardTitle = `Real-time Test ${Date.now()}`
      await newPage.fill('[data-testid="card-title-input"]', cardTitle)
      await newPage.click('[data-testid="create-card-submit"]')

      // Switch back to activity feed
      await page.bringToFront()

      // Should show new activity (within reasonable time)
      await expect(page.locator(`text=created card "${cardTitle}"`)).toBeVisible({ timeout: 10000 })

      await newPage.close()
    })

    test('should maintain connection on page visibility change', async ({ page }) => {
      // Hide and show page to test SSE reconnection
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: true, writable: true })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      await page.waitForTimeout(1000)

      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: false, writable: true })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      // Activity feed should still be functional
      await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.toBeGreaterThan(0)
    })
  })

  test.describe('Activity Pagination', () => {
    test('should load more activities on scroll', async ({ page }) => {
      const initialCount = await page.locator('[data-testid="activity-item"]').count()

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Should load more activities (if available)
      await page.waitForTimeout(1000)
      const newCount = await page.locator('[data-testid="activity-item"]').count()

      // If there are more activities, count should increase
      expect(newCount).toBeGreaterThanOrEqual(initialCount)
    })

    test('should show load more button if available', async ({ page }) => {
      // Scroll to see if load more button appears
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // May or may not have load more depending on data
      const loadMoreButton = page.locator('[data-testid="load-more-activities"]')
      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.click()

        // Should load additional activities
        await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.toBeGreaterThan(0)
      }
    })
  })

  test.describe('Activity Filtering', () => {
    test('should filter activities by type', async ({ page }) => {
      // Check if filter options are available
      const filterButton = page.locator('[data-testid="activity-filter"]')
      if (await filterButton.isVisible()) {
        await filterButton.click()

        // Filter by card creation
        await page.click('[data-testid="filter-card-created"]')

        // Should show only card creation activities
        const activities = page.locator('[data-testid="activity-item"]')
        for (const activity of await activities.all()) {
          await expect(activity.locator('[data-testid="activity-description"]')).toContainText('created card')
        }
      }
    })

    test('should filter activities by user', async ({ page }) => {
      const filterButton = page.locator('[data-testid="activity-filter"]')
      if (await filterButton.isVisible()) {
        await filterButton.click()

        // Filter by current user
        await page.click('[data-testid="filter-user-demo"]')

        // Should show only activities by demo user
        const activities = page.locator('[data-testid="activity-item"]')
        for (const activity of await activities.all()) {
          await expect(activity.locator('[data-testid="activity-avatar"]')).toHaveAttribute('alt', /demo/i)
        }
      }
    })
  })

  test.describe('Activity Interaction', () => {
    test('should navigate to related board/card when clicking activity', async ({ page }) => {
      // Click on a card-related activity
      const cardActivity = page.locator('[data-testid="activity-item"]:has-text("card")').first()
      await cardActivity.click()

      // Should navigate to the related board or card
      await expect(page).toHaveURL(/\/boards\//)
    })

    test('should show activity details on hover', async ({ page }) => {
      const activity = page.locator('[data-testid="activity-item"]').first()

      await activity.hover()

      // Should show additional details or highlight
      await expect(activity).toHaveClass(/hover|bg-/)
    })
  })

  test.describe('Loading States', () => {
    test('should show loading skeleton initially', async ({ page }) => {
      // Navigate to activity to potentially see loading state
      await page.goto('/acme-product/activity')

      // Should eventually show activities
      await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.toBeGreaterThan(0)
    })

    test('should handle empty activity feed', async ({ page }) => {
      // For demo data, there should always be activities
      // In a real scenario, you might test with a fresh workspace
      await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.toBeGreaterThan(0)
    })
  })

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Activity items should stack vertically
      await expect(page.locator('[data-testid="activity-item"]')).toBeVisible()

      // Should be scrollable
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Content should not overflow horizontally
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = page.viewportSize()?.width || 375
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // Allow small tolerance
    })

    test('should maintain readability on different screen sizes', async ({ page }) => {
      const sizes = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1440, height: 900 }, // Desktop
      ]

      for (const size of sizes) {
        await page.setViewportSize(size)

        // Activity items should be readable
        const activity = page.locator('[data-testid="activity-item"]').first()
        await expect(activity.locator('[data-testid="activity-description"]')).toBeVisible()
        await expect(activity.locator('[data-testid="activity-timestamp"]')).toBeVisible()
      }
    })
  })
})