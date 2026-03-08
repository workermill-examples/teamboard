import { test, expect } from './fixtures/auth.fixture'

test.describe('Workspace Management', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('demo@workermill.com', 'demo1234')
  })

  test.describe('Workspace List', () => {
    test('should display user workspaces', async ({ page }) => {
      await expect(page).toHaveURL('/workspaces')

      // Should show page title
      await expect(page.locator('h1')).toContainText('Workspaces')

      // Should show demo workspace
      await expect(page.locator('text=Acme Product')).toBeVisible()

      // Should show workspace description if available
      await expect(page.locator('[data-testid="workspace-card"]')).toBeVisible()
    })

    test('should navigate to workspace dashboard when clicked', async ({ page }) => {
      await page.click('[data-testid="workspace-card"]')

      // Should navigate to workspace dashboard
      await expect(page).toHaveURL('/acme-product/dashboard')
    })

    test('should show create workspace button for authorized users', async ({ page }) => {
      await expect(page.getByRole('button', { name: /create workspace/i })).toBeVisible()
    })
  })

  test.describe('Workspace Creation', () => {
    test('should create a new workspace', async ({ page }) => {
      const workspaceName = `Test Workspace ${Date.now()}`

      await page.click('button:has-text("Create Workspace")')

      // Should open create workspace modal
      await expect(page.locator('[role="dialog"]')).toBeVisible()

      await page.fill('[data-testid="workspace-name-input"]', workspaceName)
      await page.fill('[data-testid="workspace-description-input"]', 'Test description')

      await page.click('[data-testid="create-workspace-submit"]')

      // Should redirect to new workspace
      await expect(page).toHaveURL(new RegExp(`/${workspaceName.toLowerCase().replace(/\\s+/g, '-')}/dashboard`))

      // Should show workspace name in sidebar
      await expect(page.locator('[data-testid="workspace-name"]')).toContainText(workspaceName)
    })

    test('should validate workspace creation form', async ({ page }) => {
      await page.click('button:has-text("Create Workspace")')

      // Try to submit empty form
      await page.click('[data-testid="create-workspace-submit"]')

      // Should show validation error
      await expect(page.locator('text=Workspace name is required')).toBeVisible()
    })

    test('should prevent duplicate workspace names', async ({ page }) => {
      await page.click('button:has-text("Create Workspace")')

      // Try to create workspace with existing name
      await page.fill('[data-testid="workspace-name-input"]', 'Acme Product')

      await page.click('[data-testid="create-workspace-submit"]')

      // Should show error for duplicate name
      await expect(page.locator('text=Workspace name already exists')).toBeVisible()
    })
  })

  test.describe('Workspace Navigation', () => {
    test('should navigate to demo workspace', async ({ page }) => {
      await page.click('text=Acme Product')

      await expect(page).toHaveURL('/acme-product/dashboard')

      // Should show workspace name in sidebar
      await expect(page.locator('[data-testid="workspace-name"]')).toContainText('Acme Product')
    })

    test('should show workspace navigation in sidebar', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Check sidebar navigation links
      await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
      await expect(page.locator('[data-testid="nav-boards"]')).toBeVisible()
      await expect(page.locator('[data-testid="nav-activity"]')).toBeVisible()
      await expect(page.locator('[data-testid="nav-members"]')).toBeVisible()
      await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible()
    })

    test('should highlight active navigation item', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Dashboard should be active
      await expect(page.locator('[data-testid="nav-dashboard"]')).toHaveClass(/active|bg-primary/)

      // Navigate to activity
      await page.click('[data-testid="nav-activity"]')

      // Activity should be active
      await expect(page.locator('[data-testid="nav-activity"]')).toHaveClass(/active|bg-primary/)
    })
  })

  test.describe('Workspace Context', () => {
    test('should show correct workspace information', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Should show workspace name in title
      await expect(page.locator('title')).toHaveText(/Acme Product/)

      // Should show workspace name in sidebar
      await expect(page.locator('[data-testid="workspace-name"]')).toContainText('Acme Product')
    })

    test('should handle workspace not found', async ({ page }) => {
      await page.goto('/non-existent-workspace/dashboard')

      // Should show 404 or redirect to workspaces list
      const url = page.url()
      expect(url).toMatch(/\/workspaces|404/)
    })

    test('should enforce workspace permissions', async ({ page }) => {
      // This would test RBAC, but for the demo user who is OWNER,
      // all features should be available
      await page.goto('/acme-product/settings')

      // Settings should be accessible for workspace owner
      await expect(page).toHaveURL('/acme-product/settings')
    })
  })
})