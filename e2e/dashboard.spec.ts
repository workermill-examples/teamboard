import { test, expect } from './fixtures/auth.fixture'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginAs, page }) => {
    await loginAs('demo@workermill.com', 'demo1234')
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/acme-product/dashboard')
    })
  })

  test.describe('Page Layout', () => {
    test('should display dashboard title and layout', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Dashboard')
    })

    test('should show all dashboard components', async ({ page }) => {
      // Check for chart containers
      await expect(page.locator('[data-testid="chart-tasks-by-status"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-by-assignee"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-over-time"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-overdue-count"]')).toBeVisible()

      // Check for chart titles
      await expect(page.locator('text=Tasks by Status')).toBeVisible()
      await expect(page.locator('text=Tasks by Assignee')).toBeVisible()
      await expect(page.locator('text=Tasks Over Time')).toBeVisible()
      await expect(page.locator('text=Overdue Tasks')).toBeVisible()
    })
  })

  test.describe('Statistics Display', () => {
    test('should display task statistics', async ({ page }) => {
      // Should show total cards count
      await expect(page.locator('[data-testid="total-cards"]')).toBeVisible()
      await expect(page.locator('[data-testid="completed-cards"]')).toBeVisible()

      // Should show numeric values
      const totalCards = page.locator('[data-testid="total-cards"] .text-2xl')
      const completedCards = page.locator('[data-testid="completed-cards"] .text-2xl')

      await expect(totalCards).toContainText(/\d+/)
      await expect(completedCards).toContainText(/\d+/)
    })

    test('should show overdue tasks count', async ({ page }) => {
      const overdueCount = page.locator('[data-testid="overdue-count"]')
      await expect(overdueCount).toBeVisible()

      // Should be a number (could be 0)
      await expect(overdueCount).toContainText(/\d+/)
    })

    test('should display animated counters', async ({ page }) => {
      // Wait for animations to complete
      await page.waitForTimeout(1000)

      // Counters should show final values
      const totalCards = page.locator('[data-testid="total-cards"] .text-2xl')
      const text = await totalCards.textContent()

      // Should be a valid number
      expect(Number(text)).toBeGreaterThan(0)
    })
  })

  test.describe('Charts Rendering', () => {
    test('should render tasks by status pie chart', async ({ page }) => {
      const chart = page.locator('[data-testid="chart-tasks-by-status"]')
      await expect(chart).toBeVisible()

      // Should contain SVG chart elements
      await expect(chart.locator('svg')).toBeVisible()

      // Should show legend with status labels
      await expect(page.locator('text=To Do')).toBeVisible()
      await expect(page.locator('text=In Progress')).toBeVisible()
      await expect(page.locator('text=Done')).toBeVisible()
    })

    test('should render tasks by assignee bar chart', async ({ page }) => {
      const chart = page.locator('[data-testid="chart-tasks-by-assignee"]')
      await expect(chart).toBeVisible()

      // Should contain SVG chart elements
      await expect(chart.locator('svg')).toBeVisible()

      // Should show bars for assignees
      await expect(chart.locator('.recharts-bar')).toBeVisible()
    })

    test('should render tasks over time line chart', async ({ page }) => {
      const chart = page.locator('[data-testid="chart-tasks-over-time"]')
      await expect(chart).toBeVisible()

      // Should contain SVG chart elements
      await expect(chart.locator('svg')).toBeVisible()

      // Should show line chart elements
      await expect(chart.locator('.recharts-line')).toBeVisible()
    })

    test('should be responsive on different screen sizes', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Charts should still be visible and properly sized
      await expect(page.locator('[data-testid="chart-tasks-by-status"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-by-assignee"]')).toBeVisible()

      // Charts might stack vertically on mobile
      const dashboard = page.locator('[data-testid="dashboard-charts"]')
      await expect(dashboard).toBeVisible()
    })
  })

  test.describe('Data Loading States', () => {
    test('should show loading states initially', async ({ page }) => {
      // Navigate to dashboard to trigger loading
      await page.goto('/acme-product/dashboard')

      // Should show skeleton loading initially (if visible before data loads)
      // This might be too fast to catch in a real app, but we test the structure
      await page.waitForSelector('[data-testid="chart-tasks-by-status"]')

      // Eventually all charts should be loaded
      await expect(page.locator('[data-testid="chart-tasks-by-status"] svg')).toBeVisible()
    })

    test('should handle empty data gracefully', async ({ page }) => {
      // For this test, we assume there's always some seeded data
      // In a real scenario, you might want to test with a fresh workspace
      await expect(page.locator('[data-testid="chart-tasks-by-status"]')).toBeVisible()
    })
  })

  test.describe('Interactivity', () => {
    test('should allow navigation from dashboard', async ({ page }) => {
      // Click on boards navigation
      await page.click('[data-testid="nav-boards"]')
      await expect(page).toHaveURL(/\/boards/)

      // Go back to dashboard
      await page.click('[data-testid="nav-dashboard"]')
      await expect(page).toHaveURL('/acme-product/dashboard')
    })

    test('should refresh data when revisiting page', async ({ page }) => {
      // Navigate away and back
      await page.click('[data-testid="nav-activity"]')
      await page.click('[data-testid="nav-dashboard"]')

      // Charts should reload with fresh data
      await expect(page.locator('[data-testid="chart-tasks-by-status"] svg')).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load dashboard quickly', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/acme-product/dashboard')
      await page.waitForSelector('[data-testid="chart-tasks-by-status"]')

      const loadTime = Date.now() - startTime

      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000)
    })
  })
})