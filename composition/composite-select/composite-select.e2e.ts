import { test, expect, type Page } from "@playwright/test";

import { softNavigate, querySelector, clickSelector, prepare, compareSelectedItems } from "../../test/lib.ts";

test.use({ actionTimeout: 2000 });

/**
 * Test: select two
 * 
 * Verifies immediate selection mode where the footer is hidden.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "select two"
 * /bin/bash playwright.sh -- --debug -g "select two" -- composition/composite-select/composite-select.e2e.ts
 */
test("select two", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Uncheck "Show Footer" to enable immediate selection mode (popover closes on selection).
  const showFooter = page.getByRole("checkbox", { name: "Show Footer" });
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 4: Focus and click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 5: Click the item "agnesi" to select it, which automatically closes the popover.
  await page
    .locator("div")
    .filter({ hasText: /^agnesi$/ })
    .click();

  // Step 6: Click the selected section's input again (which is already focused) to reopen the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 7: Click the item "albattani" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^albattani$/ })
    .click();

  // Step 8: Validate that both "agnesi" and "albattani" are selected and reflected in the data dump.
  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 10,
      label: "agnesi",
      selected: true,
    },
    {
      id: 11,
      label: "albattani",
      selected: true,
    },
  ]);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: show footer
 * 
 * Verifies selection flow when the footer is enabled (multi-select mode with confirmation).
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "show footer"
 * /bin/bash playwright.sh -- --debug -g "show footer" -- composition/composite-select/composite-select.e2e.ts
 */
test("show footer", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Ensure "Show Footer" checkbox is checked (default behavior).
  const showFooter = page.getByRole("checkbox", { name: "Show Footer" });
  if (!(await showFooter.isChecked())) {
    await showFooter.click();
  }
  await expect(showFooter).toBeChecked();

  // Step 4: Click the selected section input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 5: Click the item "almeida" to select it (popover stays open).
  await page
    .locator("div")
    .filter({ hasText: /^almeida$/ })
    .click();

  // Step 6: Click the item "antonelli" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^antonelli$/ })
    .click();

  // Step 7: Click the "OK" button in the footer to apply the selection.
  await page.getByRole("button", { name: "OK" }).click();

  // Step 8: Validate that both selected items are reflected in the data dump.
  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 13,
      label: "almeida",
      selected: true,
    },
    {
      id: 14,
      label: "antonelli",
      selected: true,
    },
  ]);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: search
 * 
 * Verifies searching and filtering options inside the popover.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "search"
 * /bin/bash playwright.sh -- --debug -g "search" -- composition/composite-select/composite-select.e2e.ts
 */
test("search", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Check the "Filter" checkbox to enable the search input in the popover.
  const filterCheckbox = page.getByRole("checkbox", { name: "Filter" });
  if (!(await filterCheckbox.isChecked())) {
    await filterCheckbox.click();
  }
  await expect(filterCheckbox).toBeChecked();

  // Step 4: Uncheck "Show Footer" to ensure immediate selection mode.
  const showFooter = page.getByRole("checkbox", { name: "Show Footer" });
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 5: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 6: Type "ba" into the search textbox.
  await page.getByRole("textbox", { name: "Search fruits..." }).fill("ba");

  // Step 7: Click the item "banach" from the filtered list (closes the popover).
  await page
    .locator("div")
    .filter({ hasText: /^banach$/ })
    .click();

  // Step 8: Click the selected section's input again to reopen the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 9: Click the item "bartik" from the list.
  await page
    .locator("div")
    .filter({ hasText: /^bartik$/ })
    .click();

  // Step 10: Validate that both "banach" and "bartik" are correctly selected.
  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 20,
      label: "banach",
      selected: true,
    },
    {
      id: 23,
      label: "bartik",
      selected: true,
    },
  ]);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: error state
 * 
 * Verifies that the "selected-error" attribute / Error state toggling dynamically
 * adds or removes the "error" CSS class on the selected section wrapper.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "error state"
 * /bin/bash playwright.sh -- --debug -g "error state" -- composition/composite-select/composite-select.e2e.ts
 */
test("error state", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get the selected-section wrapper element.
  const section = await page.locator("composite-select").locator(".selected-section");

  // Step 4: Check that the `.selected-section` wrapper does not have the "error" class.
  {
    const cls = await section.getAttribute("class");
    expect(cls).toEqual("selected-section");
  }

  // Step 5: Check the "Error" checkbox to enable the error state.
  const errorCheckbox = page.getByRole("checkbox", { name: "Error" });
  if (!(await errorCheckbox.isChecked())) {
    await errorCheckbox.click();
  }
  await expect(errorCheckbox).toBeChecked();

  // Step 6: Assert that the `.selected-section` wrapper now contains the "error" class.
  {
    const cls = await section.getAttribute("class");
    expect(cls).toEqual("selected-section error");
  }

  // Step 7: Uncheck the "Error" checkbox.
  if (await errorCheckbox.isChecked()) {
    await errorCheckbox.click();
  }
  await expect(errorCheckbox).not.toBeChecked();

  // Step 8: Assert that the "error" class is successfully removed.
  {
    const cls = await section.getAttribute("class");
    expect(cls).toEqual("selected-section");
  }

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: loading state
 * 
 * Verifies the loading state behavior of the selected section wrapper.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "loading state"
 * /bin/bash playwright.sh -- --debug -g "loading state" -- composition/composite-select/composite-select.e2e.ts
 */
test("loading state", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get the buttons-container element.
  const section = await page.locator("composite-select").locator(".buttons-container");

  // Step 4: Assert that the clear button ("✕") is visible.
  await expect(section.locator(".clear-btn")).toBeVisible();

  // Step 5: Assert that the loader element is hidden.
  await expect(section.locator(".loader")).not.toBeVisible();

  // Step 6: Check the "Loading" checkbox for the top section.
  const loadingCheckbox = page.locator("#loading-sel-1");
  if (!(await loadingCheckbox.isChecked())) {
    await loadingCheckbox.click();
  }
  await expect(loadingCheckbox).toBeChecked();

  // Step 7: Assert that the clear button is hidden.
  await expect(section.locator(".clear-btn")).not.toBeVisible();

  // Step 8: Assert that the loader element is visible.
  await expect(section.locator(".loader")).toBeVisible();

  // Step 9: Uncheck the "Loading" checkbox.
  if (await loadingCheckbox.isChecked()) {
    await loadingCheckbox.click();
  }
  await expect(loadingCheckbox).not.toBeChecked();

  // Step 10: Assert that the clear button is restored (visible).
  await expect(section.locator(".clear-btn")).toBeVisible();

  // Step 11: Assert that the loader element is hidden again.
  await expect(section.locator(".loader")).not.toBeVisible();

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: disabled state
 * 
 * Verifies that the "disabled" state is dynamically applied to the selected section.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "disabled state"
 * /bin/bash playwright.sh -- --debug -g "disabled state" -- composition/composite-select/composite-select.e2e.ts
 */
test("disabled state", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get the selected-section wrapper element.
  const element = await page.locator("composite-select").locator(".selected-section");

  // Step 4: Assert that the `.selected-section` wrapper does not have the "disabled" class.
  await expect(element).not.toHaveClass(/disabled/);

  // Step 5: Check the "Disabled" checkbox for the top section.
  const disabledCheckbox = page.locator("#disabled-sel-1");
  if (!(await disabledCheckbox.isChecked())) {
    await disabledCheckbox.click();
  }
  await expect(disabledCheckbox).toBeChecked();

  // Step 6: Assert that the `.selected-section` wrapper now has the "disabled" class.
  await expect(element).toHaveClass(/disabled/);

  // Step 7: Uncheck the "Disabled" checkbox.
  if (await disabledCheckbox.isChecked()) {
    await disabledCheckbox.click();
  }
  await expect(disabledCheckbox).not.toBeChecked();

  // Step 8: Assert that the wrapper no longer has the "disabled" class.
  await expect(element).not.toHaveClass(/disabled/);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: change label
 * 
 * Verifies that dynamically changing the label attribute updates the floating label text.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "change label"
 * /bin/bash playwright.sh -- --debug -g "change label" -- composition/composite-select/composite-select.e2e.ts
 */
test("change label", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get the input placeholder and floating label elements.
  const placeholder = await page.locator("composite-select").locator(".flex-list [placeholder]");
  const floatingLabel = await page.locator("composite-select").locator(".selected-section .floating-label");

  // Step 4: Confirm the default input value is empty.
  const valueBefore = await placeholder.inputValue();
  expect(valueBefore).toEqual("");

  // Step 5: Confirm the default floating label is "Select Fruit".
  const outerHTMLBefore = await floatingLabel.evaluate((el) => el.innerHTML);
  expect(outerHTMLBefore).toBe(`Select Fruit`);

  // Step 6: Click the "Top Label" text box.
  await page.getByRole("textbox", { name: "Top Label" }).click();

  // Step 7: Fill the "Top Label" text box with "testlabel".
  await page.getByRole("textbox", { name: "Top Label" }).fill("testlabel");

  // Step 8: Confirm the input value is still empty.
  const valueAfter = await placeholder.inputValue();
  expect(valueAfter).toEqual("");

  // Step 9: Assert that the floating label element content is updated to "testlabel".
  const outerHTMLAfter = await floatingLabel.evaluate((el) => el.innerHTML);
  expect(outerHTMLAfter).toBe(`testlabel`);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: clear selection
 * 
 * Verifies the clear selection button ("✕") functionality.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "clear selection"
 * /bin/bash playwright.sh -- --debug -g "clear selection" -- composition/composite-select/composite-select.e2e.ts
 */
test("clear selection", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Uncheck "Show Footer" to ensure immediate selection.
  const showFooter = page.getByRole("checkbox", { name: "Show Footer" });
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 4: Validate that the initial selection state in the dump is empty.
  await compareSelectedItems(page, '[data-role="dump"]', "", {
    decodeJson: false,
  });

  // Step 5: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 6: Click the item "albattani" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^albattani$/ })
    .click();

  // Step 7: Click the selected section's input again to reopen the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 8: Click the item "antonelli" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^antonelli$/ })
    .click();

  // Step 9: Validate both items are selected and reflected in the data dump.
  await compareSelectedItems(page, '[data-role="dump"]', [
    {
      id: 11,
      label: "albattani",
      selected: true,
    },
    {
      id: 14,
      label: "antonelli",
      selected: true,
    },
  ]);

  // Step 10: Click the "✕" (clear) button.
  await page.getByRole("button", { name: "✕" }).click();

  // Step 11: Verify that the selected items list in the dump is empty.
  await compareSelectedItems(page, '[data-role="dump"]', []);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: empty custom template
 * 
 * Verifies the custom rendering capability for the empty state message.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "empty custom template"
 * /bin/bash playwright.sh -- --debug -g "empty custom template" -- composition/composite-select/composite-select.e2e.ts
 */
test("empty custom template", async ({ page }) => {
  // Step 1: Navigate to the demo page with URL parameters that initialize an empty list.
  await page.goto(
    "/composition/composite-select/composite-select.html?l1=100px&c1=600px&h1=auto&ds1=0&do1=0&ls1=0&lo1=0&as1=Select+Fruit&ao1=Search+fruits...&es1=0&si1=1&sf1=1&st1=1&p1=cover-bottom&f1=&x1=&mh1=&el1=1",
  );

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get the options list container element.
  const elementDefault = await querySelector(page, `.options`);

  // Step 4: Get the HTML content of the options list container.
  const htmlDefault = await elementDefault.innerHTML();

  // Step 5: Assert that the default empty list message "No options to display" is visible.
  expect(htmlDefault).toEqual('<div class="empty-msg">No options to display</div>');

  // Step 6: Click "Set Custom Empty" button to set a custom HTML template.
  const customEmptyBtn = await querySelector(page, `[data-role="opt-empty-btn"]`);
  await customEmptyBtn.click();

  // Step 7: Get the options list container element.
  const elementCustom = await querySelector(page, `.options`);

  // Step 8: Get the HTML content of the options list container.
  const htmlCustom = await elementCustom.innerHTML();

  // Step 9: Assert that the custom empty warning message is rendered.
  expect(htmlCustom).toEqual(
    '<div style=\"padding: 40px; text-align: center; color: #ff5252; font-weight: bold; border: 2px dashed #ff5252; border-radius: 8px;\">⚠️ Custom Empty State!</div>',
  );

  // Step 10: Click "Set Default Empty" button.
  const defaultEmptyBtn = await querySelector(page, `[data-role="opt-default-empty-btn"]`);
  await defaultEmptyBtn.click();

  // Step 11: Get the options list container element.
  const elementFallback = await querySelector(page, `.options`);

  // Step 12: Get the HTML content of the options list container.
  const htmlFallback = await elementFallback.innerHTML();

  // Step 13: Assert that the empty state falls back to the default message.
  expect(htmlFallback).toEqual('<div class="empty-msg">No options to display</div>');

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: custom template
 * 
 * Verifies that options list items can be rendered using custom elements or string templates.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "custom template"
 * /bin/bash playwright.sh -- --debug -g "custom template" -- composition/composite-select/composite-select.e2e.ts
 */
test("custom template", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto(
    "/composition/composite-select/composite-select.html?l1=100px&c1=600px&h1=auto&ds1=0&do1=0&ls1=0&lo1=0&as1=Select+Fruit&ao1=Search+fruits...&es1=0&si1=1&sf1=1&st1=1&p1=cover-bottom&f1=&x1=&mh1=&el1=0",
  );

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get option item #12 element.
  const elementDefault = await querySelector(page, `[data-id="12"]`);

  // Step 4: Get HTML content of option item #12.
  const htmlDefault = await elementDefault.innerHTML();

  // Step 5: Assert that the default option format is rendered (e.g. `<label>allen</label>`).
  expect(htmlDefault).toEqual("<label>allen</label>");

  // Step 6: Click "Set Custom Render" button to set an HTMLElement custom renderer.
  const renderBtn = await querySelector(page, `[data-role="opt-render-btn"]`);
  await renderBtn.click();

  // Step 7: Get option item #12 element.
  const elementCustom = await querySelector(page, `[data-id="12"]`);

  // Step 8: Get HTML content of option item #12.
  const htmlCustom = await elementCustom.innerHTML();

  // Step 9: Assert that options are rendered with a prefix icon (e.g. `❄️ allen`).
  expect(htmlCustom).toEqual('<span style=\"margin-right: 10px;\">❄️ </span><label>allen</label>');

  // Step 10: Click "Set String Render" button to use a HTML string template renderer.
  const stringRenderBtn = await querySelector(page, `[data-role="opt-string-render-btn"]`);
  await stringRenderBtn.click();

  // Step 11: Get option item #12 element.
  const elementString = await querySelector(page, `[data-id="12"]`);

  // Step 12: Get HTML content of option item #12.
  const htmlString = await elementString.innerHTML();

  // Step 13: Normalize and assert that options match the custom HTML string template.
  const processed = htmlString
    .split("\n")
    .map((t) => t.trim())
    .join("");
  const expected = `<span style="font-size: 1.2em; vertical-align: middle;">⬜</span><strong style="margin-left: 10px;">allen</strong><small style="margin-left: auto; opacity: 0.5;">#12</small>`;
  expect(processed).toEqual(expected);

  // Step 14: Click "Set Default Render" button.
  const defaultRenderBtn = await querySelector(page, `[data-role="opt-default-render-btn"]`);
  await defaultRenderBtn.click();

  // Step 15: Get option item #12 element.
  const elementFallback = await querySelector(page, `[data-id="12"]`);

  // Step 16: Get HTML content of option item #12.
  const htmlFallback = await elementFallback.innerHTML();

  // Step 17: Assert that options revert to the default template.
  expect(htmlFallback).toEqual("<label>allen</label>");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: height
 * 
 * Verifies that configuring the options max height dynamically updates the options container style.
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "height"
 * /bin/bash playwright.sh -- --debug -g "height" -- composition/composite-select/composite-select.e2e.ts
 */
test("height", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto(
    "/composition/composite-select/composite-select.html?l1=100px&c1=600px&h1=auto&ds1=0&do1=0&ls1=0&lo1=0&as1=Select+Fruit&ao1=Search+fruits...&es1=0&si1=1&sf1=1&st1=1&p1=cover-bottom&f1=&x1=&mh1=&el1=0",
  );

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Get the options-section-manager element.
  const optionsSectionManager = await querySelector(page, `.options-section-manager`);

  // Step 4: Click the Focus button to display the options section.
  const focusBtn = await querySelector(page, `[data-role="focus-btn"]`);
  await focusBtn.click();

  // Step 5: Get style attribute of options section manager.
  const initialStyle = await optionsSectionManager.getAttribute("style");

  // Step 6: Verify that the initial max-height is "300px".
  expect(initialStyle).toEqual("max-height: 300px;");

  // Step 7: Click the "200px" height preset button.
  const preset200 = await querySelector(page, `[data-value="200px"]`);
  await preset200.click();

  // Step 8: Click the Focus button to display the options section.
  const focusBtn2 = await querySelector(page, `[data-role="focus-btn"]`);
  await focusBtn2.click();

  // Step 9: Get style attribute of options section manager.
  const style200 = await optionsSectionManager.getAttribute("style");

  // Step 10: Assert the inline style is "max-height: 200px;".
  expect(style200).toEqual("max-height: 200px;");

  // Step 11: Click the "600px" height preset button.
  const preset600 = await querySelector(page, `[data-value="600px"]`);
  await preset600.click();

  // Step 12: Click the Focus button to display the options section.
  const focusBtn3 = await querySelector(page, `[data-role="focus-btn"]`);
  await focusBtn3.click();

  // Step 13: Get style attribute of options section manager.
  const style600 = await optionsSectionManager.getAttribute("style");

  // Step 14: Assert the inline style is "max-height: 600px;".
  expect(style600).toEqual("max-height: 600px;");

  // Step 15: Click the "Reset" height preset button.
  const presetReset = await querySelector(page, `[data-role="mh-preset"][data-value=""]`);
  await presetReset.click();

  // Step 16: Click the Focus button to display the options section.
  const focusBtn4 = await querySelector(page, `[data-role="focus-btn"]`);
  await focusBtn4.click();

  // Step 17: Get style attribute of options section manager.
  const styleReset = await optionsSectionManager.getAttribute("style");

  // Step 18: Assert the inline style is "max-height: none;".
  expect(styleReset).toEqual("max-height: none;");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: select template
 * 
 * Verifies custom rendering templates for selected items (item templates and list wrappers).
 * 
 * Commands to run:
 * /bin/bash playwright.sh -- composition/composite-select/composite-select.e2e.ts -g "select template"
 * /bin/bash playwright.sh -- --debug -g "select template" -- composition/composite-select/composite-select.e2e.ts
 */
test("select template", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await page.goto("/composition/composite-select/composite-select.html");

  // Step 2: Remove the page description element.
  await page.locator("#page-description").evaluate((el) => el.remove());

  // Step 3: Uncheck "Show Footer" to use immediate selection.
  const showFooter = page.getByRole("checkbox", { name: "Show Footer" });
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 4: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").click();

  // Step 5: Click the item "agnesi" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^agnesi$/ })
    .click();

  // Step 6: Click the "gemini.png" button to add the gemini item.
  await page.getByRole("button", { name: "gemini.png" }).click();

  // Step 7: Click the "google_keep.png" button to add the google_keep item.
  await page.getByRole("button", { name: "google_keep.png" }).click();

  // Step 8: Click the "perplexity.png" button to add the perplexity item.
  await page.getByRole("button", { name: "perplexity.png" }).click();

  // Step 9: Click the "t3chat.png" button to add the t3chat item.
  await page.getByRole("button", { name: "t3chat.png" }).click();

  // Step 10: Get inner HTML content of the selection list wrapper container.
  const containerDefault = await page.locator("composite-select").locator(".flex-list");
  const htmlDefault = await containerDefault.innerHTML();

  // Step 11: Verify that default list rendering contains all five selected elements in the correct order.
  expect(htmlDefault).toEqual(
    `
<div class=\"element\" data-id=\"10\">
  <label>agnesi</label><div data-remove=\"10\"></div>
</div>
<div class=\"element\" data-id=\"223\">
  <label>gemini</label><div data-remove=\"223\"></div>
</div>
<div class=\"element\" data-id=\"224\">
  <label>google_keep</label><div data-remove=\"224\"></div>
</div>
<div class=\"element\" data-id=\"225\">
  <label>perplexity</label><div data-remove=\"225\"></div>
</div>
<div class=\"element\" data-id=\"226\">
  <label>t3chat</label><div data-remove=\"226\"></div>
</div>
<input type=\"text\" placeholder=\" \" size=\"1\">
    `
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(""),
  );

  // Step 12: Click "Set Custom Render Item" to apply custom individual item borders/images.
  await page.getByRole("button", { name: "Set Custom Render Item" }).click();

  // Step 13: Get HTML content of the selection list wrapper container.
  const containerItem = await page.locator("composite-select").locator(".flex-list");
  const htmlItem = await containerItem.innerHTML();

  // Step 14: Verify that item elements are rendered using the custom style/border.
  expect(htmlItem).toEqual(
    `
<div class=\"element\" data-id=\"10\" style=\"border: 2px solid black; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
  <label>agnesi</label><div data-remove=\"10\"></div>
</div>
<div class=\"element\" data-id=\"223\" style=\"border: 2px solid red; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
  <img src=\"../img/gemini.png\" style=\"width: 20px; height: 20px; object-fit: contain;\">
  <label>gemini</label><div data-remove=\"223\"></div>
</div>
<div class="element" data-id="224" style="border: 2px solid blue; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);">
  <img src="../img/google_keep.png" style="width: 20px; height: 20px; object-fit: contain;">
  <label>google_keep</label><div data-remove=\"224\"></div>
</div>
<div class="element" data-id="225" style="border: 2px solid green; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);">
  <img src="../img/perplexity.png" style="width: 20px; height: 20px; object-fit: contain;">
  <label>perplexity</label><div data-remove=\"225\"></div>
</div>
<div class="element" data-id="226" style="border: 2px solid green; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);">
  <img src="../img/t3chat.png" style="width: 20px; height: 20px; object-fit: contain;">
  <label>t3chat</label><div data-remove=\"226\"></div>
</div>
<input type=\"text\" placeholder=\" \" size=\"1\">
    `
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(""),
  );

  // Step 15: Click "Set Custom Render List" to group items in styled chunks of 3 elements.
  await page.getByRole("button", { name: "Set Custom Render List" }).click();

  // Step 16: Get HTML content of the selection list wrapper container.
  const containerList = await page.locator("composite-select").locator(".flex-list");
  const htmlList = await containerList.innerHTML();

  // Step 17: Verify the structural layout matches grouped chunk list containers.
  expect(htmlList).toEqual(
    `
<div style=\"border: 1px solid rgb(26, 115, 232); border-radius: 8px; padding: 8px; margin: 4px; display: flex; gap: 8px; flex-wrap: wrap; background: rgb(232, 240, 254); box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 5px;\">
  <div class=\"element\" data-id=\"10\" style=\"border: 2px solid black; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
    <label>agnesi</label><div data-remove=\"10\"></div>
  </div>
  <div class=\"element\" data-id=\"223\" style=\"border: 2px solid red; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
    <img src=\"../img/gemini.png\" style=\"width: 20px; height: 20px; object-fit: contain;\"><label>gemini</label><div data-remove=\"223\"></div>
  </div>
  <div class=\"element\" data-id=\"224\" style=\"border: 2px solid blue; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
    <img src=\"../img/google_keep.png\" style=\"width: 20px; height: 20px; object-fit: contain;\"><label>google_keep</label><div data-remove=\"224\"></div>
  </div>
</div>
<div style=\"border: 1px solid rgb(26, 115, 232); border-radius: 8px; padding: 8px; margin: 4px; display: flex; gap: 8px; flex-wrap: wrap; background: rgb(232, 240, 254); box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 5px;\">
  <div class=\"element\" data-id=\"225\" style=\"border: 2px solid green; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
    <img src=\"../img/perplexity.png\" style=\"width: 20px; height: 20px; object-fit: contain;\"><label>perplexity</label><div data-remove=\"225\"></div>
  </div>
  <div class=\"element\" data-id=\"226\" style=\"border: 2px solid green; display: flex; align-items: center; gap: 5px; padding: 5px; background: rgb(255, 255, 255);\">
    <img src=\"../img/t3chat.png\" style=\"width: 20px; height: 20px; object-fit: contain;\"><label>t3chat</label><div data-remove=\"226\"></div>
  </div>
</div>
<input type=\"text\" placeholder=\" \" size=\"1\">
    `
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(""),
  );

  // Step 18: Click "Reset Templates".
  await page.getByRole("button", { name: "Reset Templates" }).click();

  // Step 19: Get HTML content of the selection list wrapper container.
  const containerReset = await page.locator("composite-select").locator(".flex-list");
  const htmlReset = await containerReset.innerHTML();

  // Step 20: Verify that rendering reverts to the default markup.
  expect(htmlReset).toEqual(
    `
<div class=\"element\" data-id=\"10\">
  <label>agnesi</label><div data-remove=\"10\"></div>
</div>
<div class=\"element\" data-id=\"223\">
  <label>gemini</label><div data-remove=\"223\"></div>
</div>
<div class=\"element\" data-id=\"224\">
  <label>google_keep</label><div data-remove=\"224\"></div>
</div>
<div class=\"element\" data-id=\"225\">
  <label>perplexity</label><div data-remove=\"225\"></div>
</div>
<div class=\"element\" data-id=\"226\">
  <label>t3chat</label><div data-remove=\"226\"></div>
</div>
<input type=\"text\" placeholder=\" \" size=\"1\">
    `
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(""),
  );

  await expect(page.locator("body")).toHaveCount(1);
});
