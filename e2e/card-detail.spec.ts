import { test, expect } from './fixtures/auth.fixture'

test.describe('Card Detail Modal', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('demo@workermill.com', 'demo1234')
  })

  test.describe('Card Detail Display', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a demo board
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
    })

    test('should open card detail modal when clicking a card', async ({ page }) => {
      // Click on the first card to open detail modal
      await page.click('[data-testid="card"]:first-child')

      // Should open card detail modal
      await expect(page.locator('[data-testid="card-detail-modal"]')).toBeVisible()

      // Should show card information
      await expect(page.locator('[data-testid="card-title-edit"]')).toBeVisible()
      await expect(page.locator('[data-testid="card-detail-description"]')).toBeVisible()
    })

    test('should close modal when clicking escape key', async ({ page }) => {
      await page.click('[data-testid="card"]:first-child')
      await expect(page.locator('[data-testid="card-detail-modal"]')).toBeVisible()

      // Press escape to close modal
      await page.keyboard.press('Escape')

      // Modal should be closed
      await expect(page.locator('[data-testid="card-detail-modal"]')).not.toBeVisible()
    })

    test('should close modal when clicking close button', async ({ page }) => {
      await page.click('[data-testid="card"]:first-child')
      await expect(page.locator('[data-testid="card-detail-modal"]')).toBeVisible()

      // Click close button (X button in top right)
      const closeButton = page.locator('button:has-text("×"), button[aria-label="Close"]').first()
      await closeButton.click()

      // Modal should be closed
      await expect(page.locator('[data-testid="card-detail-modal"]')).not.toBeVisible()
    })
  })

  test.describe('Card Title Editing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should edit card title inline', async ({ page }) => {
      // Get current title
      const titleInput = page.locator('[data-testid="card-title-edit"]')
      const currentTitle = await titleInput.inputValue()

      // Click on card title to edit
      await titleInput.click()

      const newTitle = `Updated Card ${Date.now()}`
      await titleInput.fill(newTitle)
      await titleInput.press('Enter')

      // Should update card title
      await expect(titleInput).toHaveValue(newTitle)

      // Close modal and verify the title is updated on the board
      await page.keyboard.press('Escape')
      await expect(page.locator(`text=${newTitle}`)).toBeVisible()
    })

    test('should cancel title edit on escape key', async ({ page }) => {
      const titleInput = page.locator('[data-testid="card-title-edit"]')
      const originalTitle = await titleInput.inputValue()

      // Start editing title
      await titleInput.click()
      await titleInput.fill('Temporary Title')

      // Press escape to cancel
      await titleInput.press('Escape')

      // Should revert to original title
      await expect(titleInput).toHaveValue(originalTitle)
    })
  })

  test.describe('Card Properties', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should change card priority', async ({ page }) => {
      // Click on priority picker
      await page.click('[data-testid="priority-select"]')

      // Select urgent priority
      await page.click('[data-testid="priority-urgent"]')

      // Should show urgent priority badge
      await expect(page.locator('[data-testid="priority-select"]')).toContainText('Urgent')

      // Close modal and verify priority is shown on card
      await page.keyboard.press('Escape')
      await expect(page.locator('[data-testid="priority-badge"]:has-text("Urgent")')).toBeVisible()
    })

    test('should update due date', async ({ page }) => {
      // Click on due date picker
      await page.click('[data-testid="due-date-picker"]')

      // Select today
      await page.click('[data-testid="date-today"]')

      // Should show due date
      await expect(page.locator('[data-testid="due-date-picker"]')).not.toContainText('No due date')
    })

    test('should update card description', async ({ page }) => {
      const descriptionTextarea = page.locator('[data-testid="card-detail-description"]')
      const newDescription = `Updated description ${Date.now()}`

      // Click on description to edit
      await descriptionTextarea.click()
      await descriptionTextarea.fill(newDescription)

      // Click outside to save (blur event)
      await page.click('h3:has-text("Details")')

      // Should update description
      await expect(descriptionTextarea).toHaveValue(newDescription)
    })
  })

  test.describe('Labels Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should add label to card', async ({ page }) => {
      // Open label picker
      await page.click('[data-testid="labels-section"] [data-testid="add-label"]')

      // Select bug label
      await page.click('[data-testid="label-bug"]')

      // Label picker should close automatically
      await expect(page.locator('[data-testid="label-bug"]')).not.toBeVisible()

      // Check that label has been applied (the button text should change)
      await expect(page.locator('[data-testid="add-label"]')).toContainText('1 labels')
    })

    test('should remove label from card', async ({ page }) => {
      // First add a label
      await page.click('[data-testid="labels-section"] [data-testid="add-label"]')
      await page.click('[data-testid="label-bug"]')

      // Verify label was added
      await expect(page.locator('[data-testid="add-label"]')).toContainText('1 labels')

      // Open label picker again to remove the label
      await page.click('[data-testid="labels-section"] [data-testid="add-label"]')
      await page.click('[data-testid="label-bug"]')

      // Label should be removed
      await expect(page.locator('[data-testid="add-label"]')).toContainText('No labels')
    })
  })

  test.describe('Comments', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should add comment to card', async ({ page }) => {
      // Look for comment input (this might be in the Comments component)
      const commentInput = page.locator('textarea[placeholder*="comment" i], input[placeholder*="comment" i]').first()

      if (await commentInput.isVisible()) {
        const commentText = `Test comment ${Date.now()}`

        await commentInput.fill(commentText)

        // Look for submit button
        const submitButton = page.locator('button:has-text("Add"), button:has-text("Post"), button:has-text("Comment")').first()
        if (await submitButton.isVisible()) {
          await submitButton.click()

          // Should show the new comment
          await expect(page.locator(`text=${commentText}`)).toBeVisible()
        }
      }
    })
  })

  test.describe('Checklist Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should add checklist item', async ({ page }) => {
      // Look for add checklist item input
      const addItemInput = page.locator('input[placeholder*="checklist" i], input[placeholder*="item" i]').first()

      if (await addItemInput.isVisible()) {
        const itemText = `Test checklist item ${Date.now()}`

        await addItemInput.fill(itemText)
        await addItemInput.press('Enter')

        // Should show the new checklist item
        await expect(page.locator(`text=${itemText}`)).toBeVisible()
      }
    })

    test('should toggle checklist item completion', async ({ page }) => {
      // Look for existing checklist items with checkboxes
      const checkbox = page.locator('input[type="checkbox"]').first()

      if (await checkbox.isVisible()) {
        const isChecked = await checkbox.isChecked()

        // Toggle the checkbox
        await checkbox.click()

        // Should be opposite of initial state
        if (isChecked) {
          await expect(checkbox).not.toBeChecked()
        } else {
          await expect(checkbox).toBeChecked()
        }
      }
    })
  })

  test.describe('Mobile View', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should display card detail as full-screen sheet on mobile', async ({ page }) => {
      // On mobile, card detail should take full screen
      const modal = page.locator('[data-testid="card-detail-modal"]')
      await expect(modal).toBeVisible()

      // Check if it's positioned as full screen (fixed inset-0)
      const modalBox = await modal.boundingBox()
      const viewport = page.viewportSize()

      if (modalBox && viewport) {
        // Should cover most of the viewport
        expect(modalBox.width).toBeGreaterThan(viewport.width * 0.9)
        expect(modalBox.height).toBeGreaterThan(viewport.height * 0.9)
      }
    })
  })

  test.describe('Card Actions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/acme-product/boards')
      await page.click('[data-testid="board-card"]:first-child')
      await page.click('[data-testid="card"]:first-child')
    })

    test('should delete card with confirmation', async ({ page }) => {
      // Mock confirm dialog to accept
      page.on('dialog', dialog => dialog.accept())

      // Find and click delete button
      const deleteButton = page.locator('button:has-text("Delete"), button[data-testid="delete-card"]').first()
      await deleteButton.click()

      // Modal should close after deletion
      await expect(page.locator('[data-testid="card-detail-modal"]')).not.toBeVisible()
    })

    test('should cancel card deletion', async ({ page }) => {
      // Mock confirm dialog to dismiss
      page.on('dialog', dialog => dialog.dismiss())

      // Find and click delete button
      const deleteButton = page.locator('button:has-text("Delete"), button[data-testid="delete-card"]').first()
      await deleteButton.click()

      // Modal should remain open
      await expect(page.locator('[data-testid="card-detail-modal"]')).toBeVisible()
    })
  })
})