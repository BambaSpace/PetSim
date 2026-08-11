import { test, expect } from '@playwright/test';

test.describe('Quiz and URL encoding tests', () => {
  test('should display quiz and allow selection', async ({ page }) => {
    // Navigate to local dev server (make sure to run `npm run dev` first)
    await page.goto('http://localhost:5173');

    // Open quiz
    await page.getByRole('button', { name: /迷ったらこれ！ワンコ相性診断/ }).click();
    await expect(page.getByText('休日の過ごし方は？')).toBeVisible();

    // Answer questions
    await page.getByRole('button', { name: '外でアクティブに遊びたい！' }).click();
    await page.getByRole('button', { name: 'なるべく手間がかからない方がいい' }).click();
    await page.getByRole('button', { name: '一戸建て（お庭がある、広い）' }).click();
    await page.getByRole('button', { name: 'あまりない（常に誰かいる）' }).click();
    await page.getByRole('button', { name: 'ある！' }).click();

    // Result screen
    await expect(page.getByText('🎉 診断完了！')).toBeVisible();

    // Click "これで計算する" on the first recommendation
    await page.getByRole('button', { name: 'これで計算する' }).first().click();

    // Verify modal closed
    await expect(page.getByText('🎉 診断完了！')).not.toBeVisible();
  });
});
