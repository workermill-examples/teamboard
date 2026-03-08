import { test as base, expect, Page } from '@playwright/test'

// Demo user credentials - must match the ones in seed data and README
const DEMO_EMAIL = 'demo@workermill.com'
const DEMO_PASSWORD = 'demo1234'

export interface AuthFixtures {
  authenticatedPage: Page
  loginAs: (email: string, password: string) => Promise<void>
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login as demo user
    await page.goto('/login')

    await page.fill('input[type="email"]', DEMO_EMAIL)
    await page.fill('input[type="password"]', DEMO_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for successful login redirect
    await page.waitForURL('/workspaces')

    // Verify user menu is present
    await expect(page.locator('[data-testid="user-menu-desktop"]').first()).toBeVisible()

    await use(page)
  },

  loginAs: async ({ page }, use) => {
    const loginAs = async (email: string, password: string) => {
      await page.goto('/login')

      await page.fill('input[type="email"]', email)
      await page.fill('input[type="password"]', password)
      await page.click('button[type="submit"]')

      // Wait for either success or error
      try {
        await page.waitForURL('/workspaces', { timeout: 5000 })
      } catch {
        // Login may have failed, that's ok for testing error cases
      }
    }

    await use(loginAs)
  },
})

export { expect }