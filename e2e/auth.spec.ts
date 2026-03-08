import { test, expect } from './fixtures/auth.fixture'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      // Check page title and description
      await expect(page.locator('h1, h2').filter({ hasText: 'Welcome back' })).toBeVisible()
      await expect(page.locator('text=Sign in to your TeamBoard account')).toBeVisible()

      // Check form fields
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]').filter({ hasText: 'Sign in' })).toBeVisible()

      // Check navigation links
      await expect(page.locator('a[href="/signup"]').filter({ hasText: 'Sign up' })).toBeVisible()
      await expect(page.locator('a[href="/"]').filter({ hasText: 'Try the demo' })).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/login')

      // Try to submit without filling fields
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('text=Email is required')).toBeVisible()
      await expect(page.locator('text=Password is required')).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/login')

      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email')
      await page.click('button[type="submit"]')

      // Should show email validation error
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page, loginAs }) => {
      await loginAs('demo@workermill.com', 'wrongpassword')

      // Should show authentication error
      await expect(page.locator('text=Invalid email or password')).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({ page, loginAs }) => {
      await loginAs('demo@workermill.com', 'demo1234')

      // Should redirect to workspaces page
      await expect(page).toHaveURL('/workspaces')

      // Should show user menu indicating successful auth
      await expect(page.locator('[data-testid="user-menu-desktop"]').first()).toBeVisible()
    })

    test('should clear field errors when user starts typing', async ({ page }) => {
      await page.goto('/login')

      // Trigger validation errors
      await page.click('button[type="submit"]')
      await expect(page.locator('text=Email is required')).toBeVisible()

      // Start typing in email field
      await page.fill('input[type="email"]', 'test')

      // Error should disappear
      await expect(page.locator('text=Email is required')).not.toBeVisible()
    })

    test('should redirect authenticated users away from login', async ({ authenticatedPage }) => {
      // Try to visit login page when already authenticated
      await authenticatedPage.goto('/login')

      // Should redirect to workspaces
      await expect(authenticatedPage).toHaveURL('/workspaces')
    })
  })

  test.describe('Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup')

      // Check page title and description
      await expect(page.locator('h1, h2').filter({ hasText: 'Create your account' })).toBeVisible()
      await expect(page.locator('text=Join TeamBoard and start collaborating with your team')).toBeVisible()

      // Check form fields
      await expect(page.locator('input[name="name"], input#name')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]').filter({ hasText: 'Create account' })).toBeVisible()

      // Check navigation links
      await expect(page.locator('a[href="/login"]').filter({ hasText: 'Sign in' })).toBeVisible()
      await expect(page.locator('a[href="/"]').filter({ hasText: 'Try the demo' })).toBeVisible()

      // Check password requirements
      await expect(page.locator('text=Must be at least 8 characters long')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/signup')

      // Try to submit without filling fields
      await page.click('button[type="submit"]')

      // Should show validation errors
      await expect(page.locator('text=Name is required')).toBeVisible()
      await expect(page.locator('text=Email is required')).toBeVisible()
      await expect(page.locator('text=Password is required')).toBeVisible()
    })

    test('should validate password length', async ({ page }) => {
      await page.goto('/signup')

      // Enter short password
      await page.fill('input[name="name"], input#name', 'Test User')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'short')
      await page.click('button[type="submit"]')

      // Should show password validation error
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
    })

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/signup')

      // Try to signup with existing demo user email
      await page.fill('input[name="name"], input#name', 'Test User')
      await page.fill('input[type="email"]', 'demo@workermill.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')

      // Should show error about existing email
      await expect(page.locator('text=User already exists with this email')).toBeVisible()
    })

    test('should redirect authenticated users away from signup', async ({ authenticatedPage }) => {
      // Try to visit signup page when already authenticated
      await authenticatedPage.goto('/signup')

      // Should redirect to workspaces
      await expect(authenticatedPage).toHaveURL('/workspaces')
    })
  })

  test.describe('Authentication Flow', () => {
    test('should handle callback URLs correctly', async ({ page }) => {
      // Visit protected page while unauthenticated
      await page.goto('/acme-product/dashboard')

      // Should redirect to login with callback URL
      await expect(page).toHaveURL(/\/login/)
      await expect(page.url()).toContain('callbackUrl')

      // Login successfully
      await page.fill('input[type="email"]', 'demo@workermill.com')
      await page.fill('input[type="password"]', 'demo1234')
      await page.click('button[type="submit"]')

      // Should redirect back to the original URL
      await expect(page).toHaveURL(/\/acme-product/)
    })

    test('should maintain authentication across page reloads', async ({ authenticatedPage }) => {
      // Reload the page
      await authenticatedPage.reload()

      // Should still be authenticated
      await expect(authenticatedPage.locator('[data-testid="user-menu-desktop"]').first()).toBeVisible()
    })
  })

  test.describe('Form Accessibility', () => {
    test('login form should be accessible', async ({ page }) => {
      await page.goto('/login')

      // Check form has proper labels
      const emailInput = page.locator('input[type="email"]')
      const passwordInput = page.locator('input[type="password"]')

      await expect(emailInput).toHaveAttribute('required')
      await expect(emailInput).toHaveAttribute('autoComplete', 'email')
      await expect(passwordInput).toHaveAttribute('required')
      await expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')

      // Check that fields are properly labeled
      await expect(page.locator('label[for="email"]')).toBeVisible()
      await expect(page.locator('label[for="password"]')).toBeVisible()
    })

    test('signup form should be accessible', async ({ page }) => {
      await page.goto('/signup')

      // Check form has proper labels and attributes
      const nameInput = page.locator('input[name="name"], input#name')
      const emailInput = page.locator('input[type="email"]')
      const passwordInput = page.locator('input[type="password"]')

      await expect(nameInput).toHaveAttribute('required')
      await expect(nameInput).toHaveAttribute('autoComplete', 'name')
      await expect(emailInput).toHaveAttribute('required')
      await expect(emailInput).toHaveAttribute('autoComplete', 'email')
      await expect(passwordInput).toHaveAttribute('required')
      await expect(passwordInput).toHaveAttribute('autoComplete', 'new-password')

      // Check that fields are properly labeled
      await expect(page.locator('label[for="name"]')).toBeVisible()
      await expect(page.locator('label[for="email"]')).toBeVisible()
      await expect(page.locator('label[for="password"]')).toBeVisible()
    })
  })
})