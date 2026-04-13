import { test, expect, type Page } from "@playwright/test";

import { softNavigate, querySelector, clickSelector, prepare, compareSelectedItems } from "../../test/lib.ts";

/**
 * /bin/bash playwright.sh composition/options-section/OptionsSectionManager.e2e.ts
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts
 * /bin/bash playwright.sh -- --debug -- composition/options-section/OptionsSectionManager.e2e.ts
 *
 * ./node_modules/.bin/playwright codegen http://0.0.0.0:5678/composition/options-section/OptionsSectionManager.html
 *
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "just select"
 * /bin/bash playwright.sh -- --debug -g "just select" -- composition/options-section/OptionsSectionManager.e2e.ts
 *
 */
test("just select", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  await page
    .locator("div")
    .filter({ hasText: /^Initial Option 1$/ })
    .click();

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 1,
      label: "Initial Option 1",
      selected: true,
    },
  ]);
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "check disabled"
 * /bin/bash playwright.sh -- --debug -g "check disabled" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("check disabled", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  let classAttr;

  const element = await querySelector(page, `.options`);

  classAttr = await element.getAttribute("class");

  expect(classAttr).toBe("options");

  const checkbox = await querySelector(page, `[data-role="disabled-opt"]`);

  await checkbox.click();

  classAttr = await element.getAttribute("class");

  expect(classAttr).toBe("options disabled");

  await checkbox.click();

  classAttr = await element.getAttribute("class");

  expect(classAttr).toBe("options");
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "check disabled"
 * /bin/bash playwright.sh -- --debug -g "check disabled" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("check loading", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  let classAttr;

  const element = await querySelector(page, `.spinner`);

  classAttr = await element.getAttribute("class");

  expect(classAttr).toBe("spinner");

  const checkbox = await querySelector(page, `[data-role="loading-opt"]`);

  await checkbox.click();

  classAttr = await element.getAttribute("class");

  expect(classAttr).toBe("spinner loading");

  await checkbox.click();

  classAttr = await element.getAttribute("class");

  expect(classAttr).toBe("spinner");
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "show footer"
 * /bin/bash playwright.sh -- --debug -g "show footer" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("show footer", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  let classAttr;

  const element = await querySelector(page, `.footer`);

  classAttr = await element.getAttribute("style");

  expect(classAttr).toBe("display: flex;");

  const checkbox = await querySelector(page, `[data-role="footer-opt"]`);

  await checkbox.click();

  classAttr = await element.getAttribute("style");

  expect(classAttr).toBe("display: none;");

  await checkbox.click();

  classAttr = await element.getAttribute("style");

  expect(classAttr).toBe("display: flex;");
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "input type"
 * /bin/bash playwright.sh -- --debug -g "input type" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("input type", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  const input = await page.getByRole("textbox", { name: "Search..." });

  await input.click();
  await input.fill("abc");
  await input.press("Enter");

  const outsideInput = await querySelector(page, `[data-role="value-input-opt"]`);

  const inputValue = await outsideInput.inputValue();

  expect(inputValue).toBe("abc");

  await outsideInput.click();
  await outsideInput.fill("zayber");

  const wcInputValue = await input.inputValue();

  expect(wcInputValue).toBe("zayber");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "click ok cancel"
 * /bin/bash playwright.sh -- --debug -g "click ok cancel" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("click ok cancel", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  const onOkCount = await querySelector(page, `[data-role="onok-count"]`);

  {
    const before = await onOkCount.innerText();

    expect(before).toBe("0");
  }

  await page.getByRole("button", { name: "OK" }).click();

  {
    const after = await onOkCount.innerText();

    expect(after).toBe("1");
  }

  const onCancelCount = await querySelector(page, `[data-role="oncancel-count"]`);

  {
    const before = await onCancelCount.innerText();

    expect(before).toBe("0");
  }

  await page.getByRole("button", { name: "Cancel" }).click();

  {
    const after = await onCancelCount.innerText();

    expect(after).toBe("1");
  }

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "height"
 * /bin/bash playwright.sh -- --debug -g "height" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("height", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");
  await page.locator("#page-description").evaluate((el) => el.remove());

  const resizerBottom = await querySelector(page, `#resizer-bottom`);

  const box = await resizerBottom.boundingBox();

  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y);
    await page.mouse.down(); // hold left mouse button

    await page.mouse.move(x, y + 400, { steps: 10 }); // drag down 200px

    await page.mouse.up(); // release
  }

  const container = await querySelector(page, `[data-role="container"]`);

  const style = await container.getAttribute("style");

  expect(style).toBe("height: 100%;");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "height from link"
 * /bin/bash playwright.sh -- --debug -g "height from link" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("height from link", async ({ page }) => {
  await page.goto(
    "/composition/options-section/OptionsSectionManager.html?l1=50px&c1=350px&h1=613px&d1=0&o1=0&f1=1&e1=1&el1=0&a1=&s1=&m1=&y1=&v1=1%7CInitial+Option+1%7C0&v1=2%7CInitial+Option+2%7C0",
  );

  await page.locator("#page-description").evaluate((el) => el.remove());

  const container = await querySelector(page, `[data-role="container"]`);

  {
    const style = await container.getAttribute("style");

    expect(style).toBe("height: 100%;");
  }

  const resizerBottom = await querySelector(page, `[data-value="300px"]`);

  await resizerBottom.click();

  {
    const element = await querySelector(page, `[data-reset]`);

    await element.click();
  }

  {
    const style = await container.getAttribute("style");

    expect(style).toBe("height: 100%; max-height: none;");
  }

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "two random elements"
 * /bin/bash playwright.sh -- --debug -g "two random elements" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("two random elements", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");

  await page.locator("#page-description").evaluate((el) => el.remove());

  const button = await page.getByRole("button", { name: "Add Random" });

  await button.click();
  await button.click();

  await page
    .locator("div")
    .filter({ hasText: /^Option 223$/ })
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Initial Option 2$/ })
    .click();

  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 2,
      label: "Initial Option 2",
      selected: true,
    },
    {
      id: 223,
      label: "Option 223",
      selected: true,
    },
  ]);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * /bin/bash playwright.sh -- composition/options-section/OptionsSectionManager.e2e.ts -g "custom render fn"
 * /bin/bash playwright.sh -- --debug -g "custom render fn" -- composition/options-section/OptionsSectionManager.e2e.ts
 */
test("custom render fn", async ({ page }) => {
  await page.goto("/composition/options-section/OptionsSectionManager.html");

  await page.locator("#page-description").evaluate((el) => el.remove());

  const firstElement = await querySelector(page, `[data-id="1"]`);

  {
    const outerHTML = await firstElement.evaluate((el) => el.outerHTML);

    expect(outerHTML).toBe(`<div class=\"element\" data-id=\"1\"><label>Initial Option 1</label></div>`);
  }

  {
    const button = await querySelector(page, `[data-role="opt-render-btn"]`);

    await button.click();
  }

  {
    const outerHTML = await firstElement.evaluate((el) => el.outerHTML);

    expect(outerHTML).toBe(
      `<div class=\"element\" data-id=\"1\" style=\"padding: 8px; border-left: 4px solid transparent;\"><strong>Initial Option 1</strong> </div>`,
    );
  }

  {
    const button = await querySelector(page, `[data-role="opt-string-render-btn"]`);

    await button.click();
  }

  {
    const outerHTML = await firstElement.evaluate((el) => el.outerHTML);

    expect(outerHTML).toBe(
      `<div class=\"element\" data-id=\"1\" style=\"color: blue;\">STRING: Initial Option 1</div>`,
    );
  }

  {
    const button = await querySelector(page, `[data-role="opt-default-render-btn"]`);

    await button.click();
  }

  {
    const outerHTML = await firstElement.evaluate((el) => el.outerHTML);

    expect(outerHTML).toBe(`<div class=\"element\" data-id=\"1\"><label>Initial Option 1</label></div>`);
  }

  await expect(page.locator("body")).toHaveCount(1);
});
