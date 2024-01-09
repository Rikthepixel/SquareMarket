import { test, expect } from '@playwright/test';

test('has root', async ({ page }) => {
  await page.goto('/');
  expect(page.locator("id=\"root\"")).toBeDefined();
});
