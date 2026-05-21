import { test, expect, type Page } from "@playwright/test";

export async function softNavigate(page: Page, url: string) {
  await page.evaluate((url) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
  }, url);
}

export async function querySelector(page: Page, selector: string) {
  const linkLocator = page.locator(selector);
  await expect(linkLocator).toHaveCount(1);

  return linkLocator;
}

export async function clickSelector(page: Page, selector: string) {
  const selectorLocator = await querySelector(page, selector);

  await selectorLocator.click();
}

export async function prepare(page: Page, link: string) {
  await page.goto("/vite-project/dist/");

  const linkLocator = await querySelector(page, link);

  await expect(linkLocator).toHaveText("CompositeSelect Manager Demo");
}

export async function compareSelectedItems(page: Page, selector: string, data: any[]) {
  const selectedItems = await querySelector(page, selector);

  // then extract innerHTML and parse as JSON
  const innerHTML = await selectedItems.innerHTML();
  const json = JSON.parse(innerHTML);

  // and here compare with object
  expect(json).toEqual(data);
}
