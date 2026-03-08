import { test as base } from '@playwright/test'

export interface AuthFixture {
  loginAs: (email: string, password: string) => Promise<void>
}

export const test = base.extend<AuthFixture>({
  loginAs: async ({ page }, use) => {
    const loginAs = async (email: string, password: string) => {
      await page.goto('/login')

      await page.fill('[data-testid="email"]', email)
      await page.fill('[data-testid="password"]', password)
      await page.click('[data-testid="login-button"]')

      // Wait for redirect and verify login success
      await page.waitForURL('/workspaces')

      // Verify user menu is visible to confirm authentication
      await page.waitForSelector('[data-testid="user-menu-desktop"]')
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginAs)
  }
})

export const expect = test.expect