import { test, expect } from '@playwright/test';

test.describe('Tags filter tests', () => {
  test('should filter breeds by tags', async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:5173');

    // Make sure we have 15 breeds initially in Simulator A
    const allBreeds = await page.locator('text=日本スピッツ').count();
    expect(allBreeds).toBeGreaterThan(0);

    // Enter a tag that matches something specific
    await page.locator('input[placeholder="犬種名や特徴で検索..."]').first().fill('一人暮らし向け');

    // Chihuahua has 一人暮らし向け
    const chihuahua = await page.locator('text=チワワ').count();
    expect(chihuahua).toBeGreaterThan(0);

    // Golden Retriever doesn't have 一人暮らし向け
    const golden = await page.locator('text=ゴールデンレトリバー').count();
    expect(golden).toBe(0);
  });
});
