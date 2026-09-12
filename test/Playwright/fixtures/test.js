import { test as base, expect } from '../../../frontend/node_modules/@playwright/test/index.mjs'

export const test = base.extend({
  cleanStore: async ({ page }, use) => {
    await use(page)
  }
})

export { expect }
