import { test, expect } from "@playwright/test";

/**
 * /bin/bash playwright.sh vite-project/src/App.e2e.js
 */
test("has title", async ({ page }) => {
  await page.goto("/vite-project/dist/");

  const linkLocator = page.locator('[data-testid="composite-select-demo"]');
  await expect(linkLocator).toHaveCount(1);

  await expect(linkLocator).toHaveText("CompositeSelect Manager Demo");

  await linkLocator.click();

  

});
