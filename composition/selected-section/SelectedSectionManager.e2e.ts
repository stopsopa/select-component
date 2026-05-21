import { test, expect, type Page } from "@playwright/test";

import { softNavigate, querySelector, clickSelector, prepare, compareSelectedItems } from "../../test/lib.ts";

/**
 * /bin/bash playwright.sh composition/selected-section/SelectedSectionManager.e2e.ts
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts
 * /bin/bash playwright.sh -- --debug -- composition/selected-section/SelectedSectionManager.e2e.ts
 *
 * ./node_modules/.bin/playwright codegen http://0.0.0.0:5678/composition/selected-section/SelectedSectionManager.html
 *
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "build list"
 * /bin/bash playwright.sh -- --debug -g "build list" -- composition/selected-section/SelectedSectionManager.e2e.ts
 *
 */
test("clear default selection", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");
  await page.getByPlaceholder(" ").click();
  await page.locator(".flex-list > div:nth-child(2) > div").click();
  await page.locator(".element > div").click();

  await compareSelectedItems(page, '[data-role="dump"]', []);
});
test("add 2 manual and one clicked", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");
  await page.getByPlaceholder(" ").click();
  await page.getByPlaceholder(" ").fill("abc");
  await page.getByPlaceholder(" ").press("Enter");
  await page.getByPlaceholder(" ").fill("test");
  await page.getByPlaceholder(" ").press("Enter");
  await page.getByRole("button", { name: "t3chat.png" }).click();

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial 1",
      selected: true,
    },
    {
      id: 2,
      label: "Initial 2",
      selected: true,
    },
    {
      id: 223,
      label: "abc",
      selected: true,
    },
    {
      id: 224,
      label: "test",
      selected: true,
    },
    {
      color: "green",
      id: 225,
      img: "t3chat.png",
      label: "t3chat",
      selected: true,
    },
  ]);
});

/**
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "check disabled"
 * /bin/bash playwright.sh -- --debug -g "check disabled" -- composition/selected-section/SelectedSectionManager.e2e.ts
 */
test("check disabled", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");

  const element = await querySelector(page, ".selected-section");

  // on start it shoulnd't have disabled class
  await expect(element).not.toHaveClass(/disabled/);

  await page.getByRole("checkbox", { name: "Disabled" }).check();

  // and after check it should have disabled class
  await expect(element).toHaveClass(/disabled/);

  const url = await page.evaluate(() => {
    return window.location.pathname + window.location.search;
  });

  expect(url).toBe(
    "/composition/selected-section/SelectedSectionManager.html?v1=Initial+1&v1=Initial+2&l1=50px&c1=350px&d1=1&o1=0&as1=Select+options&s1=&e1=0&i1=1",
  );

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial 1",
    },
    {
      id: 2,
      label: "Initial 2",
    },
  ]);
});

/**
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "check error"
 * /bin/bash playwright.sh -- --debug -g "check error" -- composition/selected-section/SelectedSectionManager.e2e.ts
 */
test("check error", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");

  const element = await querySelector(page, ".selected-section");

  // on start it shoulnd't have disabled class
  await expect(element).not.toHaveClass(/error/);

  await page.getByRole("checkbox", { name: "Error" }).check();

  // and after check it should have disabled class
  await expect(element).toHaveClass(/error/);

  const url = await page.evaluate(() => {
    return window.location.pathname + window.location.search;
  });

  expect(url).toBe(
    "/composition/selected-section/SelectedSectionManager.html?v1=Initial+1&v1=Initial+2&l1=50px&c1=350px&d1=0&o1=0&as1=Select+options&s1=&e1=1&i1=1",
  );

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial 1",
    },
    {
      id: 2,
      label: "Initial 2",
    },
  ]);
});

/**
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "loading state"
 * /bin/bash playwright.sh -- --debug -g "loading state" -- composition/selected-section/SelectedSectionManager.e2e.ts
 */
test("loading state", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");

  const element = await querySelector(page, ".buttons-container");

  await expect(element.locator(".clear-btn")).toBeVisible();
  await expect(element.locator(".loader")).not.toBeVisible();

  await page.getByRole("checkbox", { name: "Loading" }).check();

  await expect(element.locator(".clear-btn")).not.toBeVisible();
  await expect(element.locator(".loader")).toBeVisible();

  const url = await page.evaluate(() => {
    return window.location.pathname + window.location.search;
  });

  expect(url).toBe(
    "/composition/selected-section/SelectedSectionManager.html?v1=Initial+1&v1=Initial+2&l1=50px&c1=350px&d1=0&o1=1&as1=Select+options&s1=&e1=0&i1=1",
  );

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial 1",
    },
    {
      id: 2,
      label: "Initial 2",
    },
  ]);
});

/**
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "show input"
 * /bin/bash playwright.sh -- --debug -g "show input" -- composition/selected-section/SelectedSectionManager.e2e.ts
 */
test("show input", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");

  const element = await querySelector(page, ".flex-list [placeholder]");

  let style: string | null = "empty";

  style = await element.getAttribute("style");
  expect(style || "").toBe("");

  await page.getByRole("checkbox", { name: "Show Input" }).click();

  const styleAfter = await element.getAttribute("style");
  expect(styleAfter).toBe("display: none;");

  await page.getByRole("checkbox", { name: "Show Input" }).click();

  style = await element.getAttribute("style");
  expect(style || "").toBe("");

  await page.getByRole("checkbox", { name: "Show Input" }).click();

  const url = await page.evaluate(() => {
    return window.location.pathname + window.location.search;
  });

  expect(url).toBe(
    "/composition/selected-section/SelectedSectionManager.html?l1=50px&c1=350px&d1=0&o1=0&as1=Select+options&s1=&e1=0&i1=0&v1=Initial+1&v1=Initial+2",
  );

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial 1",
    },
    {
      id: 2,
      label: "Initial 2",
    },
  ]);
});

/**
 * /bin/bash playwright.sh -- composition/selected-section/SelectedSectionManager.e2e.ts -g "clear button"
 * /bin/bash playwright.sh -- --debug -g "clear button" -- composition/selected-section/SelectedSectionManager.e2e.ts
 */
test("clear button", async ({ page }) => {
  await page.goto("/composition/selected-section/SelectedSectionManager.html");

  await page.getByRole("button", { name: "google_calendar.png" }).click();

  await page.getByRole("button", { name: "ai.png" }).click();

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial 1",
      selected: true,
    },
    {
      id: 2,
      label: "Initial 2",
      selected: true,
    },
    {
      color: "blue",
      id: 223,
      img: "google_calendar.png",
      label: "google_calendar",
      selected: true,
    },
    {
      color: "red",
      id: 224,
      img: "ai.png",
      label: "ai",
      selected: true,
    },
  ]);

  await page.getByRole("button", { name: "✕" }).click();

  await compareSelectedItems(page, '[data-role="dump"]', []);

  const url = await page.evaluate(() => {
    return window.location.pathname + window.location.search;
  });

  expect(url).toBe(
    "/composition/selected-section/SelectedSectionManager.html?l1=50px&c1=350px&d1=0&o1=0&as1=Select+options&s1=&e1=0&i1=1",
  );
});
