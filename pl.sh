#!/bin/bash

# Ensure we are in a fresh directory (or at least provide a warning if not, but the user said "take to different fresh directory")
echo "Preparing Playwright debug environment..."

# 1. Create .tool-versions for asdf
echo "nodejs v24.14.1" > .tool-versions
echo "Created .tool-versions"

# 2. Create package.json
cat <<EOF > package.json
{
  "name": "playwright-debug",
  "version": "1.0.0",
  "type": "module",
  "devDependencies": {
    "@playwright/test": "1.45.0",
    "playwright": "1.45.0"
  }
}
EOF
echo "Created package.json"

# 3. Install dependencies
echo "Installing dependencies..."
npm install

# 4. Install Playwright browsers and system dependencies
echo "Installing Playwright browsers and system dependencies..."
npx playwright install --with-deps chromium

# 5. Create a simple test file
cat <<EOF > debug.spec.js
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  console.log('Navigating to playwright.dev...');
  await page.goto('https://playwright.dev/');
  
  const title = page.locator('.navbar__inner .navbar__title');
  await expect(title).toHaveText('Playwright');
  
  console.log('Test passed! Keeping browser open for 5 seconds...');
  await page.waitForTimeout(5000);
});
EOF
echo "Created debug.spec.js"

# 6. Run the test in headed mode
echo "Running Playwright test in headed mode..."
npx playwright test --headed
