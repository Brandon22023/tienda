import { defineConfig, devices } from '../../frontend/node_modules/@playwright/test/index.mjs'

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  outputDir: './results/test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: './results/html-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome']
  },
  expect: { timeout: 10000 },
  timeout: 30000
})
