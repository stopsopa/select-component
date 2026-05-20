import { test, expect, type Page } from "@playwright/test";


async function softNavigate(page: Page, url: string) {
  await page.evaluate((url) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
  }, url);
}

/**
 * /bin/bash playwright.sh vite-project/src/App.e2e.js
 */
test("has title", async ({ page }) => {
  await page.goto("/vite-project/dist/");

  const linkLocator = page.locator('[data-testid="composite-select-demo"]');
  await expect(linkLocator).toHaveCount(1);

  await expect(linkLocator).toHaveText("CompositeSelect Manager Demo");

  // how to then without reloading the page renavigate to 
  // /vite-project/dist/composite-select-demo?emp-1=1&s-1=%5B"google_keep.png"%2C"chatgpt.png"%2C"claude.png"%5D
  await softNavigate(page, '/vite-project/dist/composite-select-demo?emp-1=1&s-1=%5B"google_keep.png"%2C"chatgpt.png"%2C"claude.png"%5D');


  // await linkLocator.click();

  

});
