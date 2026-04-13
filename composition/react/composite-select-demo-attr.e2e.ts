import { test, expect, type Page } from "@playwright/test";

import { softNavigate, querySelector, clickSelector, prepare, compareSelectedItems } from "../../test/lib.ts";

test.use({ actionTimeout: 2000 });

/**
 * Helper: navigate to the home page, click the "composite-select-demo-attr" link, then click
 * "Initialize New Instance" so there is exactly one DemoInstance rendered on the page.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts
 * /bin/bash playwright.sh -- --debug -- composition/react/composite-select-demo-attr.e2e.ts
 */
async function gotoDemo(page: Page) {
  // Navigate to the vite dist home page.
  await page.goto("/vite-project/dist/");

  // Click the "CompositeSelect Demo with Attributes" link.
  await page.getByTestId("composite-select-demo-attr").click();
}

/**
 * Test: select two
 *
 * Verifies immediate selection mode where the footer is hidden.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "select two"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "select two"
 * /bin/bash playwright.sh -- --debug -g "select two" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("select two", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Uncheck "Show Footer" to enable immediate selection mode (popover closes on selection).
  await page.getByLabel("Show Footer").click();

  // Step 3: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 4: Click the item "agnesi" to select it, which automatically closes the popover.
  await page
    .locator("div")
    .filter({ hasText: /^agnesi$/ })
    .click();

  // Step 5: Click the selected section's input again to reopen the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 6: Click the item "albattani" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^albattani$/ })
    .click();

  // Step 7: Validate that both "agnesi" and "albattani" are selected and reflected in the data dump.
  await compareSelectedItems(page, '[data-testid="selectedItems"]', [
    {
      id: 10,
      label: "agnesi",
      color: "#4285f4",
      img: "google_drive.png",
      selected: true,
    },
    {
      id: 11,
      label: "albattani",
      color: "#4285f4",
      img: "google_drive.png",
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
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "show footer"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "show footer"
 * /bin/bash playwright.sh -- --debug -g "show footer" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("show footer", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Ensure "Show Footer" checkbox is checked (default behavior).
  const showFooter = page.getByLabel("Show Footer");
  if (!(await showFooter.isChecked())) {
    await showFooter.click();
  }
  await expect(showFooter).toBeChecked();

  // Step 3: Click the selected section input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 4: Click the item "almeida" to select it (popover stays open).
  await page
    .locator("div")
    .filter({ hasText: /^almeida$/ })
    .click();

  // Step 5: Click the item "antonelli" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^antonelli$/ })
    .click();

  // Step 6: Click the "OK" button in the footer to apply the selection.
  await page.getByRole("button", { name: "OK" }).click();

  // Step 7: Validate that both selected items are reflected in the data dump.
  await compareSelectedItems(
    page,
    '[data-testid="selectedItems"]',
    [
      {
        id: 13,
        label: "almeida",
        color: "#4285f4",
        img: "google_drive.png",
      },
      {
        id: 14,
        label: "antonelli",
        color: "#4285f4",
        img: "google_drive.png",
      },
    ],
    {
      decodeJson: true,
      formatter: (data: any[]) => {
        return data.map((d: any) => {
          delete d.selected;
          return d;
        });
      },
    },
  );

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: search
 *
 * Verifies searching and filtering options inside the popover.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "search"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "search"
 * /bin/bash playwright.sh -- --debug -g "search" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("search", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Uncheck "Show Footer" to ensure immediate selection mode.
  const showFooter = page.getByLabel("Show Footer");
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 3: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 4: Type "ba" into the search textbox (Show Filter is enabled by default).
  await page.getByRole("textbox", { name: "options label" }).fill("ba");

  // Step 5: Click the item "banach" from the filtered list (closes the popover).
  await page
    .locator("div")
    .filter({ hasText: /^banach$/ })
    .click();

  // Step 6: Click the selected section's input again to reopen the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 7: Click the item "bartik" from the list.
  await page
    .locator("div")
    .filter({ hasText: /^bartik$/ })
    .click();

  // Step 8: Validate that both "banach" and "bartik" are correctly selected.
  await compareSelectedItems(
    page,
    '[data-testid="selectedItems"]',
    [
      {
        id: 20,
        label: "banach",
        color: "#4285f4",
        img: "google_drive.png",
      },
      {
        id: 23,
        label: "bartik",
        color: "#4285f4",
        img: "google_drive.png",
      },
    ],
    {
      decodeJson: true,
      formatter: (data: any[]) => {
        return data.map((d: any) => {
          delete d.selected;
          return d;
        });
      },
    },
  );

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: error state
 *
 * Verifies that toggling "Error" checkbox dynamically adds or removes the "error"
 * CSS class on the selected section wrapper.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "error state"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "error state"
 * /bin/bash playwright.sh -- --debug -g "error state" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("error state", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Get the selected-section wrapper element.
  const section = page.locator("composite-select").locator(".selected-section");

  // Step 3: Check that the `.selected-section` wrapper does not have the "error" class.
  await expect(section).toHaveClass("selected-section");

  // Step 4: Check the "Error" checkbox to enable the error state.
  const errorCheckbox = page.getByLabel("Error");
  if (!(await errorCheckbox.isChecked())) {
    await errorCheckbox.click();
  }
  await expect(errorCheckbox).toBeChecked();

  // Step 5: Assert that the `.selected-section` wrapper now contains the "error" class.
  await expect(section).toHaveClass("selected-section error");

  // Step 6: Uncheck the "Error" checkbox.
  if (await errorCheckbox.isChecked()) {
    await errorCheckbox.click();
  }
  await expect(errorCheckbox).not.toBeChecked();

  // Step 7: Assert that the "error" class is successfully removed.
  await expect(section).toHaveClass("selected-section");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: loading state
 *
 * Verifies the loading state behavior of the selected section wrapper.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "loading state"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "loading state"
 * /bin/bash playwright.sh -- --debug -g "loading state" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("loading state", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Get the buttons-container element.
  const section = page.locator("composite-select").locator(".buttons-container");

  // Step 3: Assert that the clear button ("✕") is visible.
  await expect(section.locator(".clear-btn")).toBeVisible();

  // Step 4: Assert that the loader element is hidden.
  await expect(section.locator(".loader")).not.toBeVisible();

  // Step 5: Check the "Loading" checkbox under SelectedSection (Top).
  await page.getByLabel("Loading").first().click();

  // Step 6: Assert that the clear button is hidden.
  await expect(section.locator(".clear-btn")).not.toBeVisible();

  // Step 7: Assert that the loader element is visible.
  await expect(section.locator(".loader")).toBeVisible();

  // Step 8: Uncheck the "Loading" checkbox.
  await page.getByLabel("Loading").first().click();

  // Step 9: Assert that the clear button is restored (visible).
  await expect(section.locator(".clear-btn")).toBeVisible();

  // Step 10: Assert that the loader element is hidden again.
  await expect(section.locator(".loader")).not.toBeVisible();

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: disabled state
 *
 * Verifies that the "disabled" state is dynamically applied to the selected section.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "disabled state"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "disabled state"
 * /bin/bash playwright.sh -- --debug -g "disabled state" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("disabled state", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Get the selected-section wrapper element.
  const element = page.locator("composite-select").locator(".selected-section");

  // Step 3: Assert that the `.selected-section` wrapper does not have the "disabled" class.
  await expect(element).not.toHaveClass(/disabled/);

  // Step 4: Check the "Disabled" checkbox under SelectedSection (Top).
  const disabledCheckbox = page.getByLabel("Disabled").first();
  if (!(await disabledCheckbox.isChecked())) {
    await disabledCheckbox.click();
  }
  await expect(disabledCheckbox).toBeChecked();

  // Step 5: Assert that the `.selected-section` wrapper now has the "disabled" class.
  await expect(element).toHaveClass(/disabled/);

  // Step 6: Uncheck the "Disabled" checkbox.
  if (await disabledCheckbox.isChecked()) {
    await disabledCheckbox.click();
  }
  await expect(disabledCheckbox).not.toBeChecked();

  // Step 7: Assert that the wrapper no longer has the "disabled" class.
  await expect(element).not.toHaveClass(/disabled/);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: change label
 *
 * Verifies that dynamically changing the label input updates the floating label text.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "change label"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "change label"
 * /bin/bash playwright.sh -- --debug -g "change label" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("change label", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Get the input placeholder and floating label elements.
  const placeholder = page.locator("composite-select").locator(".flex-list [placeholder]");
  const floatingLabel = page.locator("composite-select").locator(".selected-section .floating-label");

  // Step 3: Confirm the default input value is "" (the attr demo does not pre-populate via URL param
  // unlike composite-select-demo which sets sv-1=default+value via "Initialize New Instance").
  const valueBefore = await placeholder.inputValue();
  expect(valueBefore).toEqual("");

  // Step 4: Confirm the default floating label is "selected label".
  const outerHTMLBefore = await floatingLabel.evaluate((el) => el.innerHTML);
  expect(outerHTMLBefore).toBe(`selected label`);

  // Step 5: Get the "Label:" input under SelectedSection (Top) and fill with "testlabel".
  const labelInput = page
    .locator("label")
    .filter({ hasText: /^Label:/ })
    .first()
    .locator("input");
  await labelInput.click();
  await labelInput.fill("testlabel");

  await expect(async () => {
    // Step 6: Confirm the text input value is still "" (unchanged by the label update).
    const valueAfter = await placeholder.inputValue();
    expect(valueAfter).toEqual("");
  }).toPass({
    timeout: 3000,
    intervals: [500],
  });

  await expect(async () => {
    // Step 7: Assert that the floating label element content is updated to "testlabel".
    const outerHTMLAfter = await floatingLabel.evaluate((el) => el.innerHTML);
    expect(outerHTMLAfter).toBe(`testlabel`);
  }).toPass({
    timeout: 3000,
    intervals: [500],
  });

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: clear selection
 *
 * Verifies the clear selection button ("✕") functionality.
 * Note: the React demo triggers a confirm() dialog before clearing — accepted automatically.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "clear selection"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "clear selection"
 * /bin/bash playwright.sh -- --debug -g "clear selection" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("clear selection", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Uncheck "Show Footer" to ensure immediate selection.
  const showFooter = page.getByLabel("Show Footer");
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 3: Validate that the initial selection state in the dump is empty array.
  await compareSelectedItems(page, '[data-testid="selectedItems"]', []);

  // Step 4: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 5: Click the item "albattani" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^albattani$/ })
    .click();

  // Step 6: Click the selected section's input again to reopen the popover.
  await page.locator("composite-select").getByRole("textbox").first().click();

  // Step 7: Click the item "antonelli" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^antonelli$/ })
    .click();

  // Step 8: Validate both items are selected and reflected in the data dump.
  await compareSelectedItems(page, '[data-testid="selectedItems"]', [
    {
      id: 11,
      label: "albattani",
      color: "#4285f4",
      img: "google_drive.png",
      selected: true,
    },
    {
      id: 14,
      label: "antonelli",
      color: "#4285f4",
      img: "google_drive.png",
      selected: true,
    },
  ]);

  // Step 9: Accept the confirm() dialog triggered by the clear button.
  page.once("dialog", (dialog) => dialog.accept());

  // Step 10: Click the "✕" (clear) button.
  await page.getByRole("button", { name: "✕" }).click();

  // Step 11: Verify that the selected items list in the dump is empty.
  await compareSelectedItems(page, '[data-testid="selectedItems"]', []);

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: empty custom template
 *
 * Verifies the custom rendering capability for the empty state message.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "empty custom template"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "empty custom template"
 * /bin/bash playwright.sh -- --debug -g "empty custom template" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("empty custom template", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Check "Empty list" to make the options list empty.
  const emptyCheckbox = page.getByLabel("Empty list");
  if (!(await emptyCheckbox.isChecked())) {
    await emptyCheckbox.click();
  }
  await expect(emptyCheckbox).toBeChecked();

  // Step 3: Click "Focus Input" button to open the options popover.
  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 4: Get the options list container element.
  const elementDefault = await querySelector(page, `.options`);

  // Step 5: Get the HTML content of the options list container.
  const htmlDefault = await elementDefault.innerHTML();

  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 6: Assert that the default empty list message "No options to display" is visible.
  await expect
    .poll(async () => await page.locator(".options").innerHTML())
    .toEqual('<div class="empty-msg">No options to display</div>');

  // Step 7: Click "Set Custom Empty" button to set a custom HTML template.
  await page.getByRole("button", { name: "Set Custom Empty" }).click();

  // Step 10: Assert that the custom empty warning message is rendered.
  await expect
    .poll(async () => await page.locator(".options").innerHTML())
    .toEqual(
      '<div style="padding: 40px; text-align: center; color: #ff5252; font-weight: bold; border: 2px dashed #ff5252; border-radius: 8px;">⚠️ Custom Empty State!</div>',
    );

  // Step 11: Click "Set Default Empty" button.
  await page.getByRole("button", { name: "Set Default Empty" }).click();

  // Step 14: Assert that the empty state falls back to the default message.
  await expect
    .poll(async () => await page.locator(".options").innerHTML())
    .toEqual('<div class="empty-msg">No options to display</div>');

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: custom template
 *
 * Verifies that options list items can be rendered using custom elements or string templates.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "custom template"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "custom template"
 * /bin/bash playwright.sh -- --debug -g "custom template" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("custom template", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Click "Focus Input" button to open the options popover.
  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 3: Get option item #12 element.
  const elementDefault = await querySelector(page, `[data-id="12"]`);

  // Step 4: Get HTML content of option item #12.
  const htmlDefault = await elementDefault.innerHTML();

  // Step 5: Assert that the default option format is rendered (e.g. `<label>allen</label>`).
  const item12 = page.locator(`[data-id="12"]`);
  await expect.poll(async () => await item12.innerHTML()).toEqual("<label>allen</label>");

  // Step 6: Click "Set Custom Render" button to set an HTMLElement custom renderer.
  await page.getByRole("button", { name: "Set Custom Render", exact: true }).click();

  // Step 9: Assert that options are rendered with a fire icon prefix (unselected = ❄️).
  await expect.poll(async () => await item12.innerHTML()).toContain("❄️");
  await expect.poll(async () => await item12.innerHTML()).toContain("allen");

  // Step 10: Click "Set String Render" button to use a HTML string template renderer.
  await page.getByRole("button", { name: "Set String Render" }).click();

  // Step 13: Normalize and assert that options match the custom HTML string template.
  await expect
    .poll(async () => {
      const htmlString = await item12.innerHTML();
      return htmlString
        .split("\n")
        .map((t) => t.trim())
        .join("");
    })
    .toContain("allen");
  await expect
    .poll(async () => {
      const htmlString = await item12.innerHTML();
      return htmlString
        .split("\n")
        .map((t) => t.trim())
        .join("");
    })
    .toContain("#12");
  await expect
    .poll(async () => {
      const htmlString = await item12.innerHTML();
      return htmlString
        .split("\n")
        .map((t) => t.trim())
        .join("");
    })
    .toContain("⬜");

  // Step 14: Click "Set Default Render" button.
  await page.getByRole("button", { name: "Set Default Render" }).click();

  // Step 17: Assert that options revert to the default template.
  await expect.poll(async () => await item12.innerHTML()).toEqual("<label>allen</label>");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: height
 *
 * Verifies that configuring the options max height dynamically updates the options container style.
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "height"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "height"
 * /bin/bash playwright.sh -- --debug -g "height" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("height", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Get the options-section-manager element.
  const optionsSectionManager = await querySelector(page, `.options-section-manager`);

  // Step 3: Click the "Focus Input" button to display the options section.
  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 4: Get style attribute of options section manager.
  const initialStyle = await optionsSectionManager.getAttribute("style");

  // Step 5: Verify that the initial max-height is "300px".
  expect(initialStyle).toEqual("max-height: 300px;");

  // Close the dropdown so we can click subsequent buttons.
  await page.getByRole("button", { name: "Cancel" }).click();

  // Step 6: Click the "200px" height preset button.
  await page.getByRole("button", { name: "200px" }).click();

  // Step 7: Click the "Focus Input" button to redisplay the options section.
  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 8: Get style attribute of options section manager.
  const style200 = await optionsSectionManager.getAttribute("style");

  // Step 9: Assert the inline style is "max-height: 200px;".
  expect(style200).toEqual("max-height: 200px;");

  // Close the dropdown so we can click subsequent buttons.
  await page.getByRole("button", { name: "Cancel" }).click();

  // Step 10: Click the "600px" height preset button.
  await page.getByRole("button", { name: "600px" }).click();

  // Step 11: Click the "Focus Input" button to redisplay the options section.
  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 12: Get style attribute of options section manager.
  const style600 = await optionsSectionManager.getAttribute("style");

  // Step 13: Assert the inline style is "max-height: 600px;".
  expect(style600).toEqual("max-height: 600px;");

  // Close the dropdown so we can click subsequent buttons.
  await page.getByRole("button", { name: "Cancel" }).click();

  // Step 14: Click the "Reset" height preset button.
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  // Step 15: Click the "Focus Input" button to redisplay the options section.
  await page.getByRole("button", { name: "Focus Input" }).click();

  // Step 16: Get style attribute of options section manager.
  const styleReset = await optionsSectionManager.getAttribute("style");

  // Step 17: Assert the inline style is "max-height: none;".
  expect(styleReset).toEqual("max-height: none;");

  await expect(page.locator("body")).toHaveCount(1);
});

/**
 * Test: select template
 *
 * Verifies custom rendering templates for selected items (item templates and list wrappers).
 *
 * Commands to run:
 * /bin/bash playwright.sh           -- composition/react/composite-select-demo-attr.e2e.ts -g "select template"
 * /bin/bash playwright.sh -t docker -- composition/react/composite-select-demo-attr.e2e.ts -g "select template"
 * /bin/bash playwright.sh -- --debug -g "select template" -- composition/react/composite-select-demo-attr.e2e.ts
 */
test("select template", async ({ page }) => {
  // Step 1: Navigate to the demo page.
  await gotoDemo(page);

  // Step 2: Uncheck "Show Footer" to use immediate selection.
  const showFooter = page.getByLabel("Show Footer");
  if (await showFooter.isChecked()) {
    await showFooter.click();
  }
  await expect(showFooter).not.toBeChecked();

  // Step 3: Click the selected section's input to open the popover.
  await page.locator("composite-select").getByRole("textbox").click();

  // Step 4: Click the item "agnesi" to select it.
  await page
    .locator("div")
    .filter({ hasText: /^agnesi$/ })
    .click();

  // Step 5: Click the "gemini.png" button to add the gemini item.
  await page.getByRole("button", { name: "gemini.png" }).click();

  // Step 6: Click the "google_keep.png" button to add the google_keep item.
  await page.getByRole("button", { name: "google_keep.png" }).click();

  // Step 7: Click the "perplexity.png" button to add the perplexity item.
  await page.getByRole("button", { name: "perplexity.png" }).click();

  // Step 8: Click the "t3chat.png" button to add the t3chat item.
  await page.getByRole("button", { name: "t3chat.png" }).click();

  // Step 9: Get inner HTML content of the selection list wrapper container.
  const containerDefault = page.locator("composite-select").locator(".flex-list");

  const expectedHTML = `
<div class=\"element\" data-id=\"10\">
  <label>agnesi</label><div data-remove=\"10\"></div>
</div>
<div class=\"element\" data-id=\"gemini.png\">
  <label>gemini</label><div data-remove=\"gemini.png\"></div>
</div>
<div class=\"element\" data-id=\"google_keep.png\">
  <label>google_keep</label><div data-remove=\"google_keep.png\"></div>
</div>
<div class=\"element\" data-id=\"perplexity.png\">
  <label>perplexity</label><div data-remove=\"perplexity.png\"></div>
</div>
<div class=\"element\" data-id=\"t3chat.png\">
  <label>t3chat</label><div data-remove=\"t3chat.png\"></div>
</div>
<input type=\"text\" placeholder=\" \" size=\"1\">
  `
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .join("");

  // Step 10: Verify that default list rendering contains all five selected elements in the correct order.
  await expect
    .poll(async () => {
      const htmlDefault = await containerDefault.innerHTML();
      return htmlDefault
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .join("");
    })
    .toEqual(expectedHTML);

  // Step 11: Click "Set Custom Render Item" to apply custom individual item borders/images.
  await page.getByRole("button", { name: "Set Custom Render Item" }).click();

  // Step 13: Verify that item elements are rendered using the custom style/border.
  await expect.poll(async () => await containerDefault.innerHTML()).toContain('data-id="10"');
  await expect.poll(async () => await containerDefault.innerHTML()).toContain("border: 2px solid");
  await expect.poll(async () => await containerDefault.innerHTML()).toContain("agnesi");
  await expect.poll(async () => await containerDefault.innerHTML()).toContain('src="/img/gemini.png"');

  // Step 14: Click "Set Custom Render List" to group items in styled chunks of 3 elements.
  await page.getByRole("button", { name: "Set Custom Render List" }).click();

  // Step 16: Verify the structural layout uses grouped chunk list containers.
  await expect.poll(async () => await containerDefault.innerHTML()).toContain("border: 1px solid rgb(26, 115, 232)");
  await expect.poll(async () => await containerDefault.innerHTML()).toContain("border-radius: 8px");
  await expect.poll(async () => await containerDefault.innerHTML()).toContain("agnesi");
  await expect.poll(async () => await containerDefault.innerHTML()).toContain("gemini");

  // Step 17: Click "Reset Templates".
  await page.getByRole("button", { name: "Reset Templates" }).click();

  // Step 19: Verify that rendering reverts to the default markup.
  await expect
    .poll(async () => {
      const htmlReset = await containerDefault.innerHTML();
      return htmlReset
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .join("");
    })
    .toEqual(expectedHTML);

  await expect(page.locator("body")).toHaveCount(1);
});
