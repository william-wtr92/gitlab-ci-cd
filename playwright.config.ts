import { defineConfig } from "@playwright/test"

export default defineConfig({
  // Run your local dev server before starting the tests
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  }
})