import { test, expect, type Page } from "@playwright/test";

import { softNavigate, querySelector, clickSelector, prepare, compareSelectedItems } from "../../test/lib.ts";

/**
 * /bin/bash playwright.sh composition/selected-section/SelectedSectionManager.e2e.ts
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts
 * /bin/bash playwright.sh -- --debug -- composition/selected-section/SelectedSectionManager.e2e.ts
 *
 * ./node_modules/.bin/playwright codegen http://0.0.0.0:5678/vite-project/dist/
 *
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "build list"
 * /bin/bash playwright.sh -- --debug -g "build list" -- composition/selected-section/SelectedSectionManager.e2e.ts
 *
 */
test("nvaite to preselect 3", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");
  await page.getByPlaceholder(" ").click();
  await page.locator(".flex-list > div:nth-child(2) > div").click();
  await page.locator(".element > div").click();

  await compareSelectedItems(page, '[data-role="dump"]', []);
});
