import {defineConfig, devices} from '@playwright/test';

const projects = [
  {name: 'desktop', use: {...devices['Desktop Chrome']}},
  {name: 'mobile', use: {...devices['iPhone 13'], defaultBrowserType: 'chromium'}},
];
// Keep the default CI install small; opt in to engine coverage during release review.
if (process.env.MERIDIAN_EXTENDED_BROWSERS === '1') {
  projects.push(
    {name: 'firefox', use: {...devices['Desktop Firefox'], launchOptions: {}}},
    {name: 'webkit', use: {...devices['Desktop Safari'], launchOptions: {}}},
  );
}

export default defineConfig({
  testDir: 'tests/browser',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {},
    baseURL: 'http://127.0.0.1:4173/meridian/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173/meridian/',
    reuseExistingServer: !process.env.CI,
  },
  projects,
});
