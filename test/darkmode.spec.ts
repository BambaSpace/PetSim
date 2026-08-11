import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test('should toggle dark mode class on document element', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // initially not dark mode
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // click dark mode toggle
    await page.getByTitle('ダークモードにする').click();

    // expect dark class on html
    await expect(page.locator('html')).toHaveClass(/dark/);

    // check persistence
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
