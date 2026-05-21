import { test, expect } from "@playwright/test";
export async function softNavigate(page, url) {
    await page.evaluate((url) => {
        window.history.pushState({}, "", url);
        window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
    }, url);
}
export async function querySelector(page, selector) {
    const linkLocator = page.locator(selector);
    await expect(linkLocator).toHaveCount(1);
    return linkLocator;
}
export async function clickSelector(page, selector) {
    const selectorLocator = await querySelector(page, selector);
    await selectorLocator.click();
}
export async function prepare(page, link) {
    await page.goto("/vite-project/dist/");
    const linkLocator = await querySelector(page, link);
    await expect(linkLocator).toHaveText("CompositeSelect Manager Demo");
}
export async function compareSelectedItems(page, selector, data) {
    const selectedItems = await querySelector(page, selector);
    // then extract innerHTML and parse as JSON
    const innerHTML = await selectedItems.innerHTML();
    const json = JSON.parse(innerHTML);
    // and here compare with object
    expect(json).toEqual(data);
}
