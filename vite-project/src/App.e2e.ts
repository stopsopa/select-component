import { test, expect, type Page } from "@playwright/test";

async function softNavigate(page: Page, url: string) {
  await page.evaluate((url) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
  }, url);
}

async function querySelector(page: Page, selector: string) {
  const linkLocator = page.locator(selector);
  await expect(linkLocator).toHaveCount(1);

  return linkLocator;
}

async function prepare(page: Page) {
  await page.goto("/vite-project/dist/");

  const linkLocator = await querySelector(page, '[data-testid="composite-select-demo"]');

  await expect(linkLocator).toHaveText("CompositeSelect Manager Demo");
}

async function compareSelectedItems(page: Page, selector: string, data: any[]) {
  const selectedItems = await querySelector(page, selector);

  // then extract innerHTML and parse as JSON
  const innerHTML = await selectedItems.innerHTML();
  const json = JSON.parse(innerHTML);

  // and here compare with object
  expect(json).toEqual([
    { color: "#4285f4", id: "google_keep.png", img: "google_keep.png", label: "google_keep", selected: true },
    { color: "#0f9d58", id: "chatgpt.png", img: "chatgpt.png", label: "chatgpt", selected: true },
    { color: "#0f9d58", id: "claude.png", img: "claude.png", label: "claude", selected: true },
  ]);
}

/**
 * /bin/bash playwright.sh vite-project/src/App.e2e.ts
 * /bin/bash playwright.sh -- vite-project/src/App.e2e.ts
 * /bin/bash playwright.sh -- --debug -- vite-project/src/App.e2e.ts
 *
 */
test("has title", async ({ page }) => {
  await prepare(page);

  await softNavigate(
    page,
    '/vite-project/dist/composite-select-demo?emp-1=1&s-1=%5B"google_keep.png"%2C"chatgpt.png"%2C"claude.png"%5D',
  );

  await compareSelectedItems(page, '[data-testid="selectedItems"]', [
    { color: "#4285f4", id: "google_keep.png", img: "google_keep.png", label: "google_keep", selected: true },
    { color: "#0f9d58", id: "chatgpt.png", img: "chatgpt.png", label: "chatgpt", selected: true },
    { color: "#0f9d58", id: "claude.png", img: "claude.png", label: "claude", selected: true },
  ]);
});
