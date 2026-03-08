import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Desktop Chrome - run in all environments
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile tests - only run locally, not in CI
    ...(!process.env.CI ? [
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 13'] },
      },
    ] : []),
  ],
  webServer: {
    command: 'npm run build && node .next/standalone/server.js',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})