import { test, expect } from "@playwright/test"

test("Test du composant FighterCard dans Next.js", async ({ page }) => {
  await page.goto("/")

  // Vérification de la présence des éléments rendus par le composant
  const cardElement = await page.$("#fighterCard")  
  const nameElement = await page.$('[data-testid="fighter-name"]')
  const ageElement = await page.$('[data-testid="fighter-age"]')
  const recordElement = await page.$('[data-testid="fighter-record"]')
  const weightElement = await page.$('[data-testid="fighter-weight"]')
  const stanceElement = await page.$('[data-testid="fighter-stance"]')    

  // Vérification si les éléments existent
  await expect(cardElement).toBeTruthy()
  await expect(nameElement).toBeTruthy()
  await expect(ageElement).toBeTruthy()
  await expect(recordElement).toBeTruthy()
  await expect(weightElement).toBeTruthy()
  await expect(stanceElement).toBeTruthy()
})
