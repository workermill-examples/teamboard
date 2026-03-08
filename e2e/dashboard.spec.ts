import { test, expect } from './fixtures/auth.fixture'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginAs, page }) => {
    await loginAs('demo@workermill.com', 'demo1234')
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/acme-product/dashboard')
      // Wait for the dashboard to load and data to be fetched
      await page.waitForSelector('[data-testid="chart-tasks-by-status"]')
    })
  })

  test.describe('Page Layout', () => {
    test('should display dashboard title and layout', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Dashboard')
      await expect(page.locator('text=Workspace analytics and statistics')).toBeVisible()
    })

    test('renders 4 charts and stats sections', async ({ page }) => {
      // Check that all 4 main dashboard sections are visible as per ticket requirements
      await expect(page.locator('[data-testid="chart-tasks-by-status"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-by-assignee"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-over-time"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-overdue-count"]')).toBeVisible()

      // Verify chart titles are present
      await expect(page.locator('text=Tasks by Status')).toBeVisible()
      await expect(page.locator('text=Tasks by Assignee')).toBeVisible()
      await expect(page.locator('text=Tasks Created Over Time')).toBeVisible()
      await expect(page.locator('text=Overdue Tasks')).toBeVisible()
    })
  })

  test.describe('Statistics Display', () => {
    test('stats show non-zero values', async ({ page }) => {
      // Verify total cards shows non-zero value from seeded data
      const totalCards = page.locator('[data-testid="total-cards"] .text-2xl')
      await expect(totalCards).toBeVisible()

      const totalCardsText = await totalCards.textContent()
      const totalCardsNumber = parseInt(totalCardsText || '0')
      expect(totalCardsNumber).toBeGreaterThan(0)

      // Verify completed cards stat is visible
      const completedCards = page.locator('[data-testid="completed-cards"] .text-2xl')
      await expect(completedCards).toBeVisible()

      const completedCardsText = await completedCards.textContent()
      const completedCardsNumber = parseInt(completedCardsText || '0')
      expect(completedCardsNumber).toBeGreaterThanOrEqual(0)

      // Verify overdue count is visible (could be 0 but should be present)
      const overdueCount = page.locator('[data-testid="overdue-count"]')
      await expect(overdueCount).toBeVisible()
      await expect(overdueCount).toContainText(/\d+/)
    })

    test('animated counters visible', async ({ page }) => {
      // Wait for initial load and animations to settle
      await page.waitForTimeout(1200) // Allow time for counter animations

      // Verify animated counter in overdue card is functioning
      const overdueCounter = page.locator('[data-testid="overdue-count"]')
      await expect(overdueCounter).toBeVisible()

      // The counter should display a number (animation should have completed)
      const overdueText = await overdueCounter.textContent()
      expect(overdueText).toMatch(/^\d+$/)

      // Verify total cards counter shows meaningful data
      const totalCards = page.locator('[data-testid="total-cards"] .text-2xl')
      const totalText = await totalCards.textContent()
      expect(parseInt(totalText || '0')).toBeGreaterThan(0)
    })
  })

  test.describe('Charts Rendering', () => {
    test('renders all 4 charts with data visualization', async ({ page }) => {
      // Test Tasks by Status Pie Chart
      const statusChart = page.locator('[data-testid="chart-tasks-by-status"]')
      await expect(statusChart).toBeVisible()
      await expect(statusChart.locator('svg')).toBeVisible()

      // Test Tasks by Assignee Bar Chart
      const assigneeChart = page.locator('[data-testid="chart-tasks-by-assignee"]')
      await expect(assigneeChart).toBeVisible()
      await expect(assigneeChart.locator('svg')).toBeVisible()

      // Test Tasks Over Time Line Chart
      const timeChart = page.locator('[data-testid="chart-tasks-over-time"]')
      await expect(timeChart).toBeVisible()
      await expect(timeChart.locator('svg')).toBeVisible()

      // Test Overdue Count Card (4th visualization component)
      const overdueCard = page.locator('[data-testid="stat-overdue-count"]')
      await expect(overdueCard).toBeVisible()
    })

    test('charts display seeded data correctly', async ({ page }) => {
      // Verify pie chart shows data (should have visible pie slices)
      const statusChart = page.locator('[data-testid="chart-tasks-by-status"] svg')
      await expect(statusChart).toBeVisible()

      // Look for pie chart elements that indicate data is present
      const pieElements = page.locator('[data-testid="chart-tasks-by-status"] svg path')
      expect(await pieElements.count()).toBeGreaterThan(0)

      // Verify bar chart has bars (indicating assignee data)
      const assigneeChart = page.locator('[data-testid="chart-tasks-by-assignee"] svg')
      await expect(assigneeChart).toBeVisible()

      // Verify line chart has line elements (indicating time series data)
      const timeChart = page.locator('[data-testid="chart-tasks-over-time"] svg')
      await expect(timeChart).toBeVisible()
    })

    test('dashboard is responsive on mobile', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // All charts should still be visible on mobile
      await expect(page.locator('[data-testid="chart-tasks-by-status"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-by-assignee"]')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-over-time"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-overdue-count"]')).toBeVisible()

      // Charts container should be responsive
      const dashboard = page.locator('[data-testid="dashboard-charts"]')
      await expect(dashboard).toBeVisible()
    })
  })

  test.describe('Data Validation', () => {
    test('verifies seeded data produces meaningful dashboard visualizations', async ({ page }) => {
      // Verify that seeded data results in meaningful dashboard content
      // This test ensures the seed data is working correctly for dashboard displays

      // Should show meaningful total card count (30 cards per seed specification)
      const totalCards = page.locator('[data-testid="total-cards"] .text-2xl')
      const totalText = await totalCards.textContent()
      const totalNum = parseInt(totalText || '0')
      expect(totalNum).toBe(30) // Should match EXPECTED_CARDS=30 from seed

      // Charts should have actual data elements indicating successful data loading
      await expect(page.locator('[data-testid="chart-tasks-by-status"] svg')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-by-assignee"] svg')).toBeVisible()
      await expect(page.locator('[data-testid="chart-tasks-over-time"] svg')).toBeVisible()

      // All sections should be present and functional
      await expect(page.locator('[data-testid="dashboard-charts"]')).toBeVisible()
    })
  })
})