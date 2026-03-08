import { chromium } from '@playwright/test'

async function globalSetup() {
  // Start database and seed demo data
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Call seed API to ensure demo data is available
    const response = await page.request.post('/api/seed', {
      headers: {
        'Authorization': 'Bearer test-seed-token-for-local-development'
      }
    })

    if (!response.ok()) {
      console.log('Seed API response:', response.status(), await response.text())
    }
  } catch (error) {
    console.log('Seed setup error:', error)
  } finally {
    await browser.close()
  }
}

export default globalSetup