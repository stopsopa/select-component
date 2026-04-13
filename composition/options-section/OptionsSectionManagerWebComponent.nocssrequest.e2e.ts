import { test, expect, type Page } from "@playwright/test";

import { softNavigate, querySelector, clickSelector, prepare, compareSelectedItems } from "../../test/lib.ts";

/**
 * /bin/bash playwright.sh composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.e2e.ts
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.e2e.ts
 * /bin/bash playwright.sh -- --debug -- composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.e2e.ts
 *
 * ./node_modules/.bin/playwright codegen http://0.0.0.0:5678/composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.html
 *
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.e2e.ts -g "check style if loaded"
 * /bin/bash playwright.sh -- --debug -g "check style if loaded" -- composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.e2e.ts
 *
 */


test("check style if loaded", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManagerWebComponent.nocssrequest.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  const button = await page.getByRole("button", { name: "OK" });

  const backgroundColor = await button.evaluate((el) => {
    return {
      bg: window.getComputedStyle(el).getPropertyValue("background-color"),
      height: window.getComputedStyle(el).getPropertyValue("height"),
    };
  });

  expect(backgroundColor).toEqual({
    bg: "rgb(26, 115, 232)",
    height: "36px",
  });

  await expect(page.locator("body")).toHaveCount(1);
});
