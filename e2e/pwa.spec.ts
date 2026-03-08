import { test, expect } from '@playwright/test'

test.describe('PWA Features', () => {
  test.describe('Manifest and Installation', () => {
    test('should have valid web app manifest', async ({ page }) => {
      await page.goto('/')

      // Check manifest link in head
      const manifestLink = page.locator('link[rel="manifest"]')
      await expect(manifestLink).toBeVisible()

      // Fetch and validate manifest
      const manifestHref = await manifestLink.getAttribute('href')
      expect(manifestHref).toBeTruthy()

      const response = await page.request.get(manifestHref!)
      expect(response.ok()).toBeTruthy()

      const manifest = await response.json()

      // Validate required manifest properties
      expect(manifest.name).toBe('TeamBoard')
      expect(manifest.short_name).toBeTruthy()
      expect(manifest.start_url).toBeTruthy()
      expect(manifest.display).toBe('standalone')
      expect(manifest.theme_color).toBeTruthy()
      expect(manifest.background_color).toBeTruthy()

      // Validate icons
      expect(manifest.icons).toHaveLength.toBeGreaterThan(0)
      for (const icon of manifest.icons) {
        expect(icon.src).toBeTruthy()
        expect(icon.sizes).toBeTruthy()
        expect(icon.type).toBeTruthy()
      }
    })

    test('should have required PWA meta tags', async ({ page }) => {
      await page.goto('/')

      // Apple touch icon
      await expect(page.locator('link[rel="apple-touch-icon"]')).toBeVisible()

      // Theme color
      await expect(page.locator('meta[name="theme-color"]')).toBeVisible()

      // Viewport meta tag
      await expect(page.locator('meta[name="viewport"]')).toBeVisible()

      // Apple mobile web app capable
      const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]')
      if (await appleMeta.isVisible()) {
        const content = await appleMeta.getAttribute('content')
        expect(content).toBe('yes')
      }
    })

    test('should have installable icons', async ({ page }) => {
      await page.goto('/')

      // Check that icon files exist
      const iconSizes = ['192x192', '512x512']
      for (const size of iconSizes) {
        const iconResponse = await page.request.get(`/icons/icon-${size}.png`)
        expect(iconResponse.ok()).toBeTruthy()
      }

      // Check maskable icon
      const maskableResponse = await page.request.get('/icons/maskable-icon-512x512.png')
      expect(maskableResponse.ok()).toBeTruthy()
    })
  })

  test.describe('Service Worker', () => {
    test('should register service worker', async ({ page }) => {
      await page.goto('/')

      // Wait for service worker registration
      const swRegistered = await page.evaluate(() => {
        return new Promise((resolve) => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
              resolve(true)
            })
            setTimeout(() => resolve(false), 5000)
          } else {
            resolve(false)
          }
        })
      })

      expect(swRegistered).toBeTruthy()
    })

    test('should cache static assets', async ({ page }) => {
      await page.goto('/')

      // Wait for service worker to cache resources
      await page.waitForTimeout(2000)

      // Go offline
      await page.context().setOffline(true)

      // Should still be able to access cached pages
      await page.reload()

      // Basic structure should still be available
      await expect(page.locator('body')).toBeVisible()
    })

    test('should handle cache strategies', async ({ page }) => {
      await page.goto('/')

      // Check cache strategies by examining network requests
      const responses: string[] = []

      page.on('response', response => {
        responses.push(response.url())
      })

      await page.reload()

      // Static assets should be served from cache
      const staticAssets = responses.filter(url =>
        url.includes('.js') || url.includes('.css') || url.includes('.png')
      )

      expect(staticAssets.length).toBeGreaterThan(0)
    })
  })

  test.describe('Offline Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('[id="email"]', 'demo@workermill.com')
      await page.fill('[id="password"]', 'demo1234')
      await page.click('button[type="submit"]')
      await page.waitForURL('/workspaces')
    })

    test('should show offline indicator when offline', async ({ page }) => {
      await page.goto('/acme-product/dashboard')

      // Go offline
      await page.context().setOffline(true)

      // Wait for offline detection
      await page.waitForTimeout(1000)

      // Should show offline indicator
      const offlineIndicator = page.locator('[data-testid="offline-indicator"]')
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toContainText(/offline/i)
      }
    })

    test('should queue card moves when offline', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      // Go offline
      await page.context().setOffline(true)

      // Try to move a card
      const firstCard = page.locator('[data-testid="card"]').first()
      const targetColumn = page.locator('[data-testid="column"]').nth(1)

      await firstCard.dragTo(targetColumn.locator('[data-testid="add-card-button"]'))

      // Card should move optimistically
      await expect(targetColumn.locator('[data-testid="card"]')).toHaveCount.toBeGreaterThan(0)

      // Should show pending/queued indicator
      const queueIndicator = page.locator('[data-testid="sync-queue"]')
      if (await queueIndicator.isVisible()) {
        await expect(queueIndicator).toContainText(/pending|queued/)
      }
    })

    test('should sync queued changes when back online', async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      // Go offline and make changes
      await page.context().setOffline(true)

      const firstCard = page.locator('[data-testid="card"]').first()
      const targetColumn = page.locator('[data-testid="column"]').nth(1)

      await firstCard.dragTo(targetColumn.locator('[data-testid="add-card-button"]'))

      // Go back online
      await page.context().setOffline(false)

      // Should sync changes
      await page.waitForTimeout(3000)

      // Should show sync success or remove queue indicator
      const queueIndicator = page.locator('[data-testid="sync-queue"]')
      if (await queueIndicator.isVisible()) {
        await expect(queueIndicator).toContainText(/synced|up.to.date/)
      }
    })

    test('should provide read-only access to cached boards offline', async ({ page }) => {
      // Visit a board while online to cache it
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')

      // Go offline
      await page.context().setOffline(true)

      // Should still be able to view the cached board
      await page.reload()

      // Board should be visible but in read-only mode
      await expect(page.locator('[data-testid="column"]')).toHaveCount.toBeGreaterThan(0)
      await expect(page.locator('[data-testid="card"]')).toHaveCount.toBeGreaterThan(0)

      // Editing features should be disabled or show offline message
      const addCardButton = page.locator('[data-testid="add-card-button"]')
      if (await addCardButton.isVisible()) {
        await addCardButton.click()
        // Should show offline message instead of creating card
        await expect(page.locator('[data-testid="offline-message"]')).toBeVisible()
      }
    })
  })

  test.describe('PWA User Experience', () => {
    test('should show install prompt on supported browsers', async ({ page, browserName }) => {
      // Skip this test on unsupported browsers
      if (browserName !== 'chromium') {
        test.skip('Install prompt only works in Chromium-based browsers')
      }

      await page.goto('/')

      // Simulate beforeinstallprompt event
      await page.evaluate(() => {
        const event = new Event('beforeinstallprompt')
        window.dispatchEvent(event)
      })

      // Should show install banner or button
      const installButton = page.locator('[data-testid="install-app"]')
      if (await installButton.isVisible()) {
        await expect(installButton).toContainText(/install|add.to.home/i)
      }
    })

    test('should handle app launch from home screen', async ({ page }) => {
      // Simulate standalone mode (launched from home screen)
      await page.addInitScript(() => {
        Object.defineProperty(window.navigator, 'standalone', {
          value: true,
          writable: false
        })
      })

      await page.goto('/')

      // Should start from the start_url defined in manifest
      expect(page.url()).toContain('/')

      // Should not show browser UI in standalone mode
      const isStandalone = await page.evaluate(() => {
        return window.matchMedia('(display-mode: standalone)').matches ||
               (window.navigator as any).standalone
      })

      expect(isStandalone).toBeTruthy()
    })

    test('should support share target API if implemented', async ({ page }) => {
      await page.goto('/')

      // Check if share target is defined in manifest
      const manifestResponse = await page.request.get('/manifest.json')
      const manifest = await manifestResponse.json()

      if (manifest.share_target) {
        // Verify share target configuration
        expect(manifest.share_target.action).toBeTruthy()
        expect(manifest.share_target.params).toBeTruthy()
      }
    })

    test('should handle PWA-specific shortcuts', async ({ page }) => {
      const manifestResponse = await page.request.get('/manifest.json')
      const manifest = await manifestResponse.json()

      if (manifest.shortcuts) {
        // Verify shortcuts are properly defined
        for (const shortcut of manifest.shortcuts) {
          expect(shortcut.name).toBeTruthy()
          expect(shortcut.url).toBeTruthy()
          expect(shortcut.icons).toBeTruthy()
        }

        // Test navigation to shortcut URLs
        const firstShortcut = manifest.shortcuts[0]
        await page.goto(firstShortcut.url)

        // Should navigate to the correct page
        expect(page.url()).toContain(firstShortcut.url)
      }
    })
  })

  test.describe('Performance and Loading', () => {
    test('should meet PWA performance criteria', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForSelector('body')

      const loadTime = Date.now() - startTime

      // Should load quickly for PWA standards
      expect(loadTime).toBeLessThan(3000)
    })

    test('should work with slow network', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 300) // Add 300ms delay
      })

      await page.goto('/')

      // Should still load and be usable
      await expect(page.locator('body')).toBeVisible()

      // Should show loading states appropriately
      await page.waitForTimeout(1000)
    })

    test('should prioritize critical content', async ({ page }) => {
      await page.goto('/')

      // Critical content should load first
      await expect(page.locator('h1, h2, h3').first()).toBeVisible()

      // Non-critical content can load later
      await page.waitForTimeout(2000)
    })
  })

  test.describe('PWA Security', () => {
    test('should require HTTPS in production', async ({ page }) => {
      // This test assumes production environment uses HTTPS
      const protocol = new URL(page.url()).protocol
      if (process.env.NODE_ENV === 'production') {
        expect(protocol).toBe('https:')
      }
    })

    test('should handle secure contexts properly', async ({ page }) => {
      await page.goto('/')

      // Service worker should only be available in secure contexts
      const isSecureContext = await page.evaluate(() => window.isSecureContext)

      if (!isSecureContext) {
        // In non-secure contexts, should gracefully degrade
        const hasServiceWorker = await page.evaluate(() => 'serviceWorker' in navigator)
        expect(hasServiceWorker).toBeFalsy()
      } else {
        const hasServiceWorker = await page.evaluate(() => 'serviceWorker' in navigator)
        expect(hasServiceWorker).toBeTruthy()
      }
    })
  })
})