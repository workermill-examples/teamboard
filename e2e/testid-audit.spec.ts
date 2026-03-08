import { test, expect } from '@playwright/test'

test.describe('Data TestID Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login as demo user for authenticated pages
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo@workermill.com')
    await page.fill('input[type="password"]', 'demo1234')
    await page.click('button[type="submit"]')
    await page.waitForURL('/workspaces')
  })

  test('validates critical auth testids exist', async ({ page }) => {
    // Logout to test login page
    await page.locator('[data-testid="user-menu-desktop"]').click()
    await page.click('text=Sign Out')
    await page.waitForURL('/login')

    // Validate login form testids
    await expect(page.locator('[data-testid="email"]')).toBeVisible()
    await expect(page.locator('[data-testid="password"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('validates user menu testids exist', async ({ page }) => {
    // Desktop user menu
    await expect(page.locator('[data-testid="user-menu-desktop"]')).toBeVisible()

    // Check mobile user menu exists (even if not visible on desktop)
    await expect(page.locator('[data-testid="user-menu-mobile"]')).toHaveCount(1)
  })

  test('validates dashboard chart testids exist', async ({ page }) => {
    await page.goto('/acme-product/dashboard')

    // Critical dashboard chart testids
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="line-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="overdue-count"]')).toBeVisible()
  })

  test('validates board view testids exist', async ({ page }) => {
    await page.goto('/acme-product/boards')
    await page.click('[data-testid="board-card"]')

    // Board components
    await expect(page.locator('[data-testid="board-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="column"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="card"]').first()).toBeVisible()
  })

  test('validates mobile navigation testids exist', async ({ page }) => {
    // Test mobile-specific testids exist
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="sidebar-overlay"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="bottom-nav"]')).toHaveCount(1)
  })

  test('validates workspace management testids exist', async ({ page }) => {
    await page.goto('/workspaces')

    // Workspace list
    await expect(page.locator('[data-testid="workspace-card"]').first()).toBeVisible()

    // Create workspace form (if visible)
    if (await page.locator('[data-testid="create-workspace-button"]').count() > 0) {
      await page.click('[data-testid="create-workspace-button"]')
      await expect(page.locator('[data-testid="workspace-name-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="create-workspace-submit"]')).toBeVisible()
    }
  })

  test('validates activity feed testids exist', async ({ page }) => {
    await page.goto('/acme-product/activity')

    await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="activity-avatar"]').first()).toBeVisible()
  })

  test('validates member management testids exist', async ({ page }) => {
    await page.goto('/acme-product/members')

    await expect(page.locator('[data-testid="member-item"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="member-role"]').first()).toBeVisible()

    // Invite functionality (Admin+)
    if (await page.locator('[data-testid="invite-member-button"]').count() > 0) {
      await expect(page.locator('[data-testid="invite-member-button"]')).toBeVisible()
    }
  })

  test('validates PWA testids exist', async ({ page }) => {
    // PWA-specific elements
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    const syncQueue = page.locator('[data-testid="sync-queue"]')

    // These may not be visible but should exist in DOM
    await expect(offlineIndicator).toHaveCount(1)
    await expect(syncQueue).toHaveCount(1)
  })

  test('validates unique testids (no duplicates)', async ({ page }) => {
    // Navigate to a representative page with most components
    await page.goto('/acme-product/dashboard')

    // Critical testids that must be unique
    const criticalTestIds = [
      'user-menu-desktop',
      'user-menu-mobile',
      'pie-chart',
      'bar-chart',
      'line-chart',
      'overdue-count'
    ]

    for (const testId of criticalTestIds) {
      const count = await page.locator(`[data-testid="${testId}"]`).count()
      expect(count, `${testId} should exist exactly once, found ${count}`).toBe(1)
    }
  })

  test('validates sidebar navigation testids exist', async ({ page }) => {
    await page.goto('/acme-product/dashboard')

    // Sidebar navigation
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-boards"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-activity"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-members"]')).toBeVisible()
  })
})