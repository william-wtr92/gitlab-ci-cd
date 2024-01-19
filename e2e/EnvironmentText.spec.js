import { test, expect } from "@playwright/test"

test("Test du composant dans Next.js", async ({ page }) => {
  await page.goto("/")

  const element = await page.$("#environmentText")

  await expect(element).toBeTruthy() 
})
