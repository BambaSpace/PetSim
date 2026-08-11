import { test, expect } from '@playwright/test';

test.describe('Quiz behavior test', () => {
  test('should show multiple top results and allow user to choose', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open quiz
    await page.getByRole('button', { name: /迷ったらこれ！ワンコ相性診断/ }).click();

    // Answer questions
    await page.getByRole('button', { name: '外でアクティブに遊びたい！' }).click();
    await page.getByRole('button', { name: 'なるべく手間がかからない方がいい' }).click();
    await page.getByRole('button', { name: '一戸建て（お庭がある、広い）' }).click();
    await page.getByRole('button', { name: 'あまりない（常に誰かいる）' }).click();
    await page.getByRole('button', { name: 'ある！' }).click();
    await page.getByRole('button', { name: '犬（人懐っこい・愛情深い）' }).click();
    await page.getByRole('button', { name: '1万円程度まで（なるべく抑えたい）' }).click();
    await page.getByRole('button', { name: '抱っこしやすい小型犬' }).click();

    // Result screen should have multiple elements with text '位'
    await expect(page.getByText('🎉 診断完了！')).toBeVisible();
    const rankElements = await page.locator('text=/\\d+位/').count();
    expect(rankElements).toBe(3); // Expecting top 3 results

    // We can select the second one for instance
    await page.getByRole('button', { name: 'これで計算する' }).nth(1).click();

    // Modal should be closed
    await expect(page.getByText('🎉 診断完了！')).not.toBeVisible();
  });
});
