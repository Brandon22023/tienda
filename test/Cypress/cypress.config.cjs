// Keep the external test project independent from frontend/node_modules.
// Cypress accepts a plain configuration object, so no package import is
// needed when this file is loaded from ../test/Cypress.
module.exports = {
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
}
