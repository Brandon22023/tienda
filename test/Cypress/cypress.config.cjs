const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: true,
  screenshotsFolder: 'results/screenshots',
  videosFolder: 'results/videos',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    specPattern: 'e2e/**/*.cy.js',
    supportFile: 'support/e2e.js',
    retries: {
      runMode: 1,
      openMode: 0
    }
  }
})
