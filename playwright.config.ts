import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// ===============================
// ENV CONFIG
// ===============================
const environment = process.env.TEST_ENV || 'development';

// Load base env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Load env-specific file (optional)
dotenv.config({
  path: path.resolve(__dirname, `.env.${environment}`),
});

// ===============================
// PLAYWRIGHT CONFIG
// ===============================
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,

  // ===============================
  // REPORTERS
  // ===============================
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(process.env.USE_ALLURE === 'true'
      ? [['allure-playwright', { outputFolder: 'allure-results' }] as [string, any]]
      : ([] as any[])),
  ] as any[],

  // ===============================
  // GLOBAL SETUP / TEARDOWN
  // ===============================
  globalSetup: require.resolve('./tests/config/globalSetup.ts'),
  globalTeardown: require.resolve('./tests/config/globalTeardown.ts'),

  // ===============================
  // SHARED USE CONFIG
  // ===============================
  use: {
    baseURL: process.env.BASE_URL || 'http://zero.webappsecurity.com',

    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.RECORD_VIDEO === 'true' ? 'retain-on-failure' : 'off',

    navigationTimeout: 30_000,
    actionTimeout: 15_000,

    ignoreHTTPSErrors: true,

    viewport: { width: 1280, height: 720 },

    userAgent: process.env.USER_AGENT,

    locale: 'en-US',
    timezoneId: 'America/New_York',

    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // ===============================
  // PROJECTS
  // ===============================
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.CHROME_CHANNEL as any,
      },
    },
/*
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },

    },
          */
  ].filter(project => {
    const enabledBrowsers = process.env.BROWSERS
      ? process.env.BROWSERS.split(',').map(b => b.trim())
      : null;

    return !enabledBrowsers || enabledBrowsers.includes(project.name);
  }),

  outputDir: 'test-results',
  snapshotDir: 'test-snapshots',
});
