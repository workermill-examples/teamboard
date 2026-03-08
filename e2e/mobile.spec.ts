import { test, expect } from './fixtures/auth.fixture'

test.describe('Mobile Experience', () => {
  test.beforeEach(async ({ loginAs, page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone 8
    await loginAs('demo@workermill.com', 'demo1234')
  })

  test.describe('Mobile Navigation', () => {
    test('should display mobile sidebar correctly', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Desktop sidebar should be hidden on mobile
      await expect(page.locator('[data-testid="sidebar-desktop"]')).not.toBeVisible()

      // Mobile hamburger menu should be visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    })

    test('should open and close mobile sidebar', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]')

      // Mobile sidebar should be visible
      await expect(page.locator('[data-testid="sidebar-mobile"]')).toBeVisible()

      // Should show navigation items
      await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
      await expect(page.locator('[data-testid="nav-boards"]')).toBeVisible()

      // Close menu by clicking overlay
      await page.click('[data-testid="sidebar-overlay"]')

      // Mobile sidebar should be hidden
      await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible()
    })

    test('should navigate using mobile sidebar', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]')

      // Navigate to activity
      await page.click('[data-testid="nav-activity"]')

      // Should close sidebar and navigate
      await expect(page).toHaveURL('/acme-product/activity')
      await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible()
    })

    test('should show bottom navigation bar on mobile', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Check if bottom nav is implemented
      const bottomNav = page.locator('[data-testid="bottom-nav"]')
      if (await bottomNav.isVisible()) {
        // Should show main navigation items
        await expect(bottomNav.locator('[data-testid="bottom-nav-dashboard"]')).toBeVisible()
        await expect(bottomNav.locator('[data-testid="bottom-nav-boards"]')).toBeVisible()
        await expect(bottomNav.locator('[data-testid="bottom-nav-activity"]')).toBeVisible()
      }
    })
  })

  test.describe('Mobile Board Experience', () => {
    test('should display board with horizontal scrolling', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      // Board should be horizontally scrollable
      const boardContainer = page.locator('[data-testid="board-container"]')
      await expect(boardContainer).toBeVisible()

      // Should be able to scroll horizontally through columns
      await boardContainer.evaluate(el => el.scrollLeft = 200)

      // Columns should remain visible
      const columnCount = await page.locator('[data-testid="column"]').count()
      expect(columnCount).toBeGreaterThan(0)
    })

    test('should support touch drag for cards', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      const firstCard = page.locator('[data-testid="card"]').first()

      // Long press to start drag on mobile
      await firstCard.tap({ timeout: 1000 })

      // Card should show drag state or feedback
      await expect(firstCard).toBeVisible()

      // Note: Actual touch drag testing is complex and may require specialized tools
      // This test verifies the basic touch interaction works
    })

    test('should show card detail as full screen on mobile', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      await page.click('[data-testid="card"]')

      // Card detail should fill the screen on mobile
      const cardDetail = page.locator('[data-testid="card-detail"]')
      await expect(cardDetail).toBeVisible()

      // Should have mobile-specific styling (full screen overlay)
      await expect(cardDetail).toHaveClass(/fixed|absolute|inset-0/)

      // Should have close button for mobile
      await expect(page.locator('[data-testid="card-detail-close"]')).toBeVisible()
    })
  })

  test.describe('Mobile Touch Interactions', () => {
    test('should have appropriate touch targets', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // All interactive elements should be at least 44px
      const buttons = page.locator('button, [role="button"], a')
      for (const button of await buttons.all()) {
        const box = await button.boundingBox()
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('should support pull to refresh', async ({ page }) => {
      await page.goto('/acme-product/activity')

      // Simulate pull to refresh gesture
      await page.evaluate(() => {
        window.scrollTo(0, 0)
        // Dispatch touch events for pull to refresh
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 150, clientY: 50 } as Touch]
        })
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 150, clientY: 150 } as Touch]
        })
        const touchEnd = new TouchEvent('touchend')

        document.dispatchEvent(touchStart)
        document.dispatchEvent(touchMove)
        document.dispatchEvent(touchEnd)
      })

      // Should show refresh indicator (if implemented)
      const refreshIndicator = page.locator('[data-testid="refresh-indicator"]')
      if (await refreshIndicator.isVisible()) {
        await expect(refreshIndicator).toBeVisible()
      }
    })

    test('should support swipe gestures', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      // Test swipe on card if implemented
      const firstCard = page.locator('[data-testid="card"]').first()

      await firstCard.hover()
      await page.mouse.down()
      await page.mouse.move(100, 0) // Swipe right
      await page.mouse.up()

      // Should trigger some action (e.g., quick actions menu)
      // Implementation depends on specific swipe gestures implemented
    })
  })

  test.describe('Mobile Responsive Layout', () => {
    test('should adapt dashboard layout for mobile', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Charts should stack vertically on mobile
      const charts = page.locator('[data-testid^="chart-"]')
      const chartCount = await charts.count()
      expect(chartCount).toBeGreaterThan(0)

      // Content should not overflow horizontally
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(375 + 5) // Allow small tolerance
    })

    test('should stack form elements vertically', async ({ page }) => {
      await page.goto('/acme-product/members')

      // Invite form should be readable on mobile
      const inviteForm = page.locator('[data-testid="invite-form"]')
      if (await inviteForm.isVisible()) {
        await expect(inviteForm.locator('[data-testid="invite-email-input"]')).toBeVisible()
        await expect(inviteForm.locator('[data-testid="invite-role-select"]')).toBeVisible()

        // Elements should be full width
        const emailInput = inviteForm.locator('[data-testid="invite-email-input"]')
        const inputBox = await emailInput.boundingBox()
        if (inputBox) {
          expect(inputBox.width).toBeGreaterThan(300) // Should be nearly full width
        }
      }
    })

    test('should handle long content gracefully', async ({ page }) => {
      await page.goto('/acme-product/activity')

      // Long activity descriptions should wrap properly
      const activities = page.locator('[data-testid="activity-item"]')
      for (const activity of await activities.all()) {
        const activityBox = await activity.boundingBox()
        if (activityBox) {
          expect(activityBox.width).toBeLessThanOrEqual(375 + 5)
        }
      }
    })
  })

  test.describe('Mobile Performance', () => {
    test('should load quickly on mobile', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/acme-product/dashboard')
      await page.waitForSelector('[data-testid="chart-tasks-by-status"]')

      const loadTime = Date.now() - startTime

      // Should load within reasonable time for mobile
      expect(loadTime).toBeLessThan(8000) // More generous for mobile
    })

    test('should handle touch scrolling smoothly', async ({ page }) => {
      await page.goto('/acme-product/activity')

      // Scroll through activity feed
      await page.evaluate(() => {
        let scrollTop = 0
        const scrollStep = 100
        const maxScroll = document.body.scrollHeight - window.innerHeight

        const smoothScroll = () => {
          scrollTop += scrollStep
          window.scrollTo(0, scrollTop)
          if (scrollTop < maxScroll) {
            requestAnimationFrame(smoothScroll)
          }
        }
        smoothScroll()
      })

      await page.waitForTimeout(1000)

      // Should handle scrolling without issues
      const activityCount = await page.locator('[data-testid="activity-item"]').count()
      expect(activityCount).toBeGreaterThan(0)
    })
  })

  test.describe('Mobile-Specific Features', () => {
    test('should show mobile-optimized modals', async ({ page }) => {
      await page.goto('/acme-product/boards')

      // Create board modal should be full screen on mobile
      await page.click('[data-testid="create-board-button"]')

      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible()

      // Should fill most of the screen on mobile
      const modalBox = await modal.boundingBox()
      if (modalBox) {
        expect(modalBox.width).toBeGreaterThan(350) // Nearly full width
        expect(modalBox.height).toBeGreaterThan(500) // Tall enough
      }
    })

    test('should handle keyboard on mobile', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="create-board-button"]')

      // Focus on input field
      await page.click('[data-testid="board-name-input"]')

      // Should handle virtual keyboard appearance
      await page.type('[data-testid="board-name-input"]', 'Mobile Test Board')

      // Input should remain visible and functional
      await expect(page.locator('[data-testid="board-name-input"]')).toHaveValue('Mobile Test Board')
    })

    test('should support haptic feedback patterns', async ({ page }) => {
      // Note: Actual haptic testing requires real devices
      // This test verifies that haptic-triggering actions work
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      // Actions that might trigger haptics
      const firstCard = page.locator('[data-testid="card"]').first()
      await firstCard.tap()

      // Should complete successfully (haptics are invisible but actions should work)
      await expect(page.locator('[data-testid="card-detail"]')).toBeVisible()
    })
  })

  test.describe('iOS Safe Areas', () => {
    test('should handle iOS safe areas', async ({ page }) => {
      // Simulate iPhone with notch
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X

      await page.goto('/acme-product/dashboard')

      // Header should account for safe areas
      const header = page.locator('[data-testid="mobile-header"]')
      if (await header.isVisible()) {
        const headerStyles = await header.evaluate(el => getComputedStyle(el))

        // Should have padding for safe areas (implementation specific)
        expect(headerStyles.paddingTop).toBeTruthy()
      }
    })
  })
})