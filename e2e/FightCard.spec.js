import { test, expect } from "@playwright/test"

test("Test du composant FighterCard dans Next.js", async ({ page }) => {
  await page.goto("/")

  // Vérification de la présence des éléments rendus par le composant
  const cardElement = await page.$("#fight-card")  
  const fightImageElement = await page.$('[data-testid="fight-image"]')   

  // Vérification si les éléments existent
  await expect(cardElement).toBeTruthy()
  await expect(fightImageElement).toBeTruthy()
})
