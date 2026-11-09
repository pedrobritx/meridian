import { defineConfig } from '@playwright/test';

// Uses the installed Google Chrome (preinstalled on GitHub's runners), so no browser download is needed.
export default defineConfig({
  testDir: 'tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8765',
    channel: process.env.MERIDIAN_BROWSER_CHANNEL || 'chrome',
  },
  projects: [
    { name: 'desk', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
  ],
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:8765/components/',
    reuseExistingServer: !process.env.CI,
  },
});
