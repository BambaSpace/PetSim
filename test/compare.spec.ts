import { test, expect } from '@playwright/test';

test.describe('Compare Mode Tests', () => {
  test('should allow selecting different breeds in compare mode', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Toggle compare mode by checking the checkbox forcibly since it's hidden under visual UI
    await page.getByRole('checkbox', { name: /2匹並べて比較する/ }).check({ force: true });

    // The text in the component might just be "1匹目" or "2匹目" based on ID suffix
    // Click '柴犬' in Simulator A
    const labelAShiba = page.locator('input[type="radio"][name="breed_A"][value="shiba"]');
    await labelAShiba.locator('..').click();

    // Check if the change didn't break things.
    await expect(labelAShiba).toBeChecked();

    // Click golden in B
    const labelBGolden = page.locator('input[type="radio"][name="breed_B"][value="golden"]');
    await labelBGolden.locator('..').click(); // Click parent to trigger radio

    await expect(labelBGolden).toBeChecked();
    await expect(labelAShiba).toBeChecked(); // A should STILL be checked
  });
});
