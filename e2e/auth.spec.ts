import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should render login form with all required elements', async ({ page }) => {
      await page.goto('/login')

      // Check page title and description
      await expect(page.locator('h3')).toContainText('Welcome back')
      await expect(page.locator('text=Sign in to your TeamBoard account')).toBeVisible()

      // Check form elements
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

      // Check navigation links
      await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Try the demo' })).toBeVisible()
    })

    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.goto('/login')

      const submitButton = page.getByRole('button', { name: 'Sign in' })
      await submitButton.click()

      // Should show validation errors
      await expect(page.locator('text=Email is required')).toBeVisible()
      await expect(page.locator('text=Password is required')).toBeVisible()
    })

    test('should show validation errors for invalid email format', async ({ page }) => {
      await page.goto('/login')

      await page.fill('[id="email"]', 'invalid-email')
      await page.fill('[id="password"]', 'password123')

      const submitButton = page.getByRole('button', { name: 'Sign in' })
      await submitButton.click()

      await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.fill('[id="email"]', 'wrong@example.com')
      await page.fill('[id="password"]', 'wrongpassword')

      const submitButton = page.getByRole('button', { name: 'Sign in' })
      await submitButton.click()

      // Wait for error message to appear
      await expect(page.locator('text=Invalid email or password')).toBeVisible()
    })

    test('should successfully login with valid demo credentials', async ({ page }) => {
      await page.goto('/login')

      // Use demo credentials from seed data
      await page.fill('[id="email"]', 'demo@workermill.com')
      await page.fill('[id="password"]', 'demo1234')

      const submitButton = page.getByRole('button', { name: 'Sign in' })
      await submitButton.click()

      // Should redirect to workspaces
      await expect(page).toHaveURL('/workspaces')

      // Should show user is logged in
      await expect(page.locator('[data-testid="user-menu-desktop"]')).toBeVisible()
    })
  })

  test.describe('Signup Page', () => {
    test('should render signup form with all required elements', async ({ page }) => {
      await page.goto('/signup')

      // Check page title and description
      await expect(page.locator('h3')).toContainText('Create your account')
      await expect(page.locator('text=Get started with TeamBoard')).toBeVisible()

      // Check form elements
      await expect(page.getByLabel('Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()

      // Check navigation links
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Try the demo' })).toBeVisible()
    })

    test('should show validation errors for invalid signup data', async ({ page }) => {
      await page.goto('/signup')

      const submitButton = page.getByRole('button', { name: 'Create account' })
      await submitButton.click()

      // Should show validation errors for empty form
      await expect(page.locator('text=Name is required')).toBeVisible()
      await expect(page.locator('text=Email is required')).toBeVisible()
      await expect(page.locator('text=Password is required')).toBeVisible()
    })

    test('should create account and login automatically', async ({ page }) => {
      await page.goto('/signup')

      // Use unique test email
      const testEmail = `test-${Date.now()}@example.com`

      await page.fill('[id="name"]', 'Test User')
      await page.fill('[id="email"]', testEmail)
      await page.fill('[id="password"]', 'testpassword123')

      const submitButton = page.getByRole('button', { name: 'Create account' })
      await submitButton.click()

      // Should redirect to workspaces after successful signup
      await expect(page).toHaveURL('/workspaces')

      // Should show user is logged in
      await expect(page.locator('[data-testid="user-menu-desktop"]')).toBeVisible()
    })
  })

  test.describe('Authentication State', () => {
    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      // First login
      await page.goto('/login')
      await page.fill('[id="email"]', 'demo@workermill.com')
      await page.fill('[id="password"]', 'demo1234')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL('/workspaces')

      // Try to visit login page while authenticated
      await page.goto('/login')
      await expect(page).toHaveURL('/workspaces') // Should redirect

      // Try to visit signup page while authenticated
      await page.goto('/signup')
      await expect(page).toHaveURL('/workspaces') // Should redirect
    })

    test('should redirect unauthenticated users to login from protected pages', async ({ page }) => {
      // Try to access workspace page without authentication
      await page.goto('/acme-product/dashboard')

      // Should be redirected to login with callback URL
      await expect(page).toHaveURL(/\/login/)
    })

    test('should logout successfully', async ({ page }) => {
      // First login
      await page.goto('/login')
      await page.fill('[id="email"]', 'demo@workermill.com')
      await page.fill('[id="password"]', 'demo1234')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL('/workspaces')

      // Click user menu
      await page.click('[data-testid="user-menu-desktop"]')

      // Click logout
      await page.click('text=Sign out')

      // Should redirect to home page
      await expect(page).toHaveURL('/')

      // Should not be able to access protected pages
      await page.goto('/workspaces')
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await page.goto('/login')
      await page.fill('[id="email"]', 'demo@workermill.com')
      await page.fill('[id="password"]', 'demo1234')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL('/workspaces')

      // Refresh page
      await page.reload()

      // Should still be authenticated
      await expect(page).toHaveURL('/workspaces')
      await expect(page.locator('[data-testid="user-menu-desktop"]')).toBeVisible()
    })

    test('should handle callback URL redirect after login', async ({ page }) => {
      const callbackUrl = '/acme-product/dashboard'

      // Try to access protected page
      await page.goto(callbackUrl)

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/)

      // Login
      await page.fill('[id="email"]', 'demo@workermill.com')
      await page.fill('[id="password"]', 'demo1234')
      await page.click('button[type="submit"]')

      // Should redirect back to original URL
      await expect(page).toHaveURL(callbackUrl)
    })
  })
})