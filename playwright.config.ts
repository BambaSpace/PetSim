import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
