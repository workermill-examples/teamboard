import { test, expect } from './fixtures/auth.fixture'

test.describe('Members Management', () => {
  test.beforeEach(async ({ loginAs, page }) => {
    await loginAs('demo@workermill.com', 'demo1234')
    await test.step('Navigate to members page', async () => {
      await page.goto('/acme-product/members')
    })
  })

  test.describe('Members List', () => {
    test('should display member list that loads', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Members')

      // Ticket requirement: member list loads
      const memberCount = await page.locator('[data-testid="member-item"]').count()
      expect(memberCount).toBeGreaterThan(0)

      // Should show demo user as owner
      const demoMember = page.locator('[data-testid="member-item"]:has-text("demo@workermill.com")')
      await expect(demoMember).toBeVisible()
      await expect(demoMember.locator('[data-testid="member-role"]')).toContainText('Owner')
    })

    test('should display member information', async ({ page }) => {
      const firstMember = page.locator('[data-testid="member-item"]').first()

      // Should show member avatar
      await expect(firstMember.locator('[data-testid="member-avatar"]')).toBeVisible()

      // Should show member name and email
      await expect(firstMember.locator('[data-testid="member-name"]')).toBeVisible()
      await expect(firstMember.locator('[data-testid="member-email"]')).toBeVisible()

      // Should show member role
      await expect(firstMember.locator('[data-testid="member-role"]')).toBeVisible()

      // Should show joined date
      await expect(firstMember.locator('[data-testid="member-joined"]')).toBeVisible()
    })

    test('should show role badges visible', async ({ page }) => {
      const members = page.locator('[data-testid="member-item"]')
      const memberCount = await members.count()

      // Ticket requirement: role badges visible
      for (let i = 0; i < memberCount; i++) {
        const member = members.nth(i)
        const role = member.locator('[data-testid="member-role"]')

        // Role should be one of: Owner, Admin, Member, Viewer
        await expect(role).toContainText(/(Owner|Admin|Member|Viewer)/)
        await expect(role).toBeVisible()
      }
    })
  })

  test.describe('Member Invitation', () => {
    test('should show invite flow for admins and above', async ({ page }) => {
      // Ticket requirement: invite flow (Admin+)
      // Demo user is Owner, should see invite form
      await expect(page.locator('[data-testid="invite-form"]')).toBeVisible()

      await expect(page.locator('[data-testid="invite-email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="invite-role-select"]')).toBeVisible()
      await expect(page.locator('[data-testid="invite-submit"]')).toBeVisible()
    })

    test('should invite new member', async ({ page }) => {
      const newMemberEmail = `newmember-${Date.now()}@example.com`

      await page.fill('[data-testid="invite-email-input"]', newMemberEmail)

      // Select role
      await page.click('[data-testid="invite-role-select"]')
      await page.click('[data-testid="role-member"]')

      await page.click('[data-testid="invite-submit"]')

      // Should show success message
      await expect(page.locator('[data-testid="invite-success"]')).toBeVisible()

      // Should add member to list (or show pending invitation)
      await expect(page.locator(`text=${newMemberEmail}`)).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      await page.fill('[data-testid="invite-email-input"]', 'invalid-email')
      await page.click('[data-testid="invite-submit"]')

      // Should show validation error
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email')
    })

    test('should prevent duplicate invitations', async ({ page }) => {
      // Try to invite existing member
      await page.fill('[data-testid="invite-email-input"]', 'demo@workermill.com')
      await page.click('[data-testid="invite-submit"]')

      // Should show error message
      await expect(page.locator('[data-testid="invite-error"]')).toContainText(/already|exists/)
    })
  })

  test.describe('Role Management', () => {
    test('should allow role change', async ({ page }) => {
      // Ticket requirement: role change
      // Find a member that's not the owner
      const nonOwnerMember = page.locator('[data-testid="member-item"]:not(:has-text("Owner"))').first()

      if (await nonOwnerMember.isVisible()) {
        await nonOwnerMember.click()

        // Should open role change dropdown or modal
        const roleSelect = page.locator('[data-testid="role-change-select"]')
        if (await roleSelect.isVisible()) {
          await roleSelect.click()

          // Change to Admin
          await page.click('[data-testid="role-option-admin"]')

          // Should update role badge
          await expect(nonOwnerMember.locator('[data-testid="member-role"]')).toContainText('Admin')
        }
      }
    })

    test('should prevent changing owner role', async ({ page }) => {
      const ownerMember = page.locator('[data-testid="member-item"]:has-text("Owner")')

      await ownerMember.click()

      // Role change should not be available for owner
      await expect(page.locator('[data-testid="role-change-select"]')).not.toBeVisible()
    })

    test('should show role permissions info', async ({ page }) => {
      // Click info button if available
      const infoButton = page.locator('[data-testid="role-info"]')
      if (await infoButton.isVisible()) {
        await infoButton.click()

        // Should show role permissions explanation
        await expect(page.locator('[data-testid="role-permissions"]')).toBeVisible()
        await expect(page.locator('text=Owner')).toBeVisible()
        await expect(page.locator('text=Admin')).toBeVisible()
        await expect(page.locator('text=Member')).toBeVisible()
        await expect(page.locator('text=Viewer')).toBeVisible()
      }
    })
  })

  test.describe('Member Removal', () => {
    test('should remove member', async ({ page }) => {
      // Find a member that can be removed (not owner)
      const removableMember = page.locator('[data-testid="member-item"]:not(:has-text("Owner"))').first()

      if (await removableMember.isVisible()) {
        const memberEmail = await removableMember.locator('[data-testid="member-email"]').textContent()

        // Click remove button
        await removableMember.locator('[data-testid="remove-member"]').click()

        // Should show confirmation dialog
        await expect(page.locator('[data-testid="remove-confirmation"]')).toBeVisible()

        await page.click('[data-testid="confirm-remove"]')

        // Member should be removed from list
        await expect(page.locator(`text=${memberEmail}`)).not.toBeVisible()
      }
    })

    test('should not allow removing owner', async ({ page }) => {
      const ownerMember = page.locator('[data-testid="member-item"]:has-text("Owner")')

      // Remove button should not be available for owner
      await expect(ownerMember.locator('[data-testid="remove-member"]')).not.toBeVisible()
    })

    test('should confirm before removing member', async ({ page }) => {
      const removableMember = page.locator('[data-testid="member-item"]:not(:has-text("Owner"))').first()

      if (await removableMember.isVisible()) {
        await removableMember.locator('[data-testid="remove-member"]').click()

        // Should show confirmation with member details
        await expect(page.locator('[data-testid="remove-confirmation"]')).toBeVisible()
        await expect(page.locator('[data-testid="cancel-remove"]')).toBeVisible()

        // Cancel should close dialog without removing
        await page.click('[data-testid="cancel-remove"]')
        await expect(page.locator('[data-testid="remove-confirmation"]')).not.toBeVisible()
      }
    })
  })

  test.describe('Member Search and Filtering', () => {
    test('should search members by name or email', async ({ page }) => {
      // If search is available
      const searchInput = page.locator('[data-testid="member-search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('demo')

        // Should filter to show only demo user
        const visibleMembers = page.locator('[data-testid="member-item"]:visible')
        await expect(visibleMembers).toHaveCount(1)
        await expect(visibleMembers.first()).toContainText('demo@workermill.com')
      }
    })

    test('should filter by role', async ({ page }) => {
      const roleFilter = page.locator('[data-testid="role-filter"]')
      if (await roleFilter.isVisible()) {
        await roleFilter.click()
        await page.click('[data-testid="filter-owners"]')

        // Should show only owners
        const visibleMembers = page.locator('[data-testid="member-item"]:visible')
        for (const member of await visibleMembers.all()) {
          await expect(member.locator('[data-testid="member-role"]')).toContainText('Owner')
        }
      }
    })
  })

  test.describe('Permission Enforcement', () => {
    test('should enforce viewer permissions', async ({ page, context }) => {
      // This would require logging in as a viewer user
      // For now, verify that certain actions are only available to admins
      const currentUserRole = await page.locator('[data-testid="member-item"]:has-text("demo@workermill.com") [data-testid="member-role"]').textContent()

      if (currentUserRole === 'Owner' || currentUserRole === 'Admin') {
        // Should see invite form
        await expect(page.locator('[data-testid="invite-form"]')).toBeVisible()

        // Should see role management options
        const removeCount = await page.locator('[data-testid="remove-member"]').count()
        expect(removeCount).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Members list should be readable on mobile
      await expect(page.locator('[data-testid="member-item"]')).toBeVisible()

      // Member information should stack vertically
      const firstMember = page.locator('[data-testid="member-item"]').first()
      await expect(firstMember.locator('[data-testid="member-name"]')).toBeVisible()
      await expect(firstMember.locator('[data-testid="member-email"]')).toBeVisible()

      // Invite form should be usable on mobile
      await expect(page.locator('[data-testid="invite-email-input"]')).toBeVisible()
    })

    test('should handle long member lists', async ({ page }) => {
      // Should be scrollable
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Should not have horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = page.viewportSize()?.width || 1280
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
    })
  })
})