import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global Setup - Runs once before all tests
 * Used for:
 * - Creating directories
 * - Validating environment
 * - Pre-loading data
 * - Setting up authentication state (optional)
 */
async function globalSetup(config: FullConfig) {
  console.log('\n========================================');
  console.log('🚀 Starting Global Setup');
  console.log('========================================\n');

  // Create necessary directories
  const dirs = [
    'test-results',
    'screenshots',
    'playwright-report',
    'allure-results',
  ];

  dirs.forEach((dir) => {
    const dirPath = path.resolve(__dirname, '../../', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  // Validate environment variables
  const requiredEnvVars = ['BASE_URL'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`
    );
  }

  // Log configuration
  console.log('\n📋 Test Configuration:');
  console.log(`   Environment: ${process.env.TEST_ENV || 'development'}`);
  console.log(`   Base URL: ${(config as any).use?.baseURL}`);
  console.log(`   Workers: ${(config as any).workers}`);
  console.log(`   Retries: ${(config as any).retries}`);
  console.log(`   Timeout: ${(config as any).timeout}ms`);

  // Preload test data (optional)
  console.log('\n📊 Preloading test data...');
  try {
    const { DataStore } = require('../../data-models/dataStore');
    DataStore.preloadFiles(['loginCredentials', 'MakeATransferData']);
    console.log('✅ Test data preloaded successfully');
  } catch (error) {
    console.warn('⚠️  Failed to preload test data:', error);
  }

  // Optional: Create authenticated state for reuse
  // This can speed up tests by skipping login for each test
  if (process.env.CREATE_AUTH_STATE === 'true') {
    console.log('\n🔐 Creating authenticated state...');
    try {
      await createAuthState(config);
      console.log('✅ Authenticated state created');
    } catch (error) {
      console.warn('⚠️  Failed to create authenticated state:', error);
    }
  }

  console.log('\n========================================');
  console.log('✅ Global Setup Completed');
  console.log('========================================\n');
}

/**
 * Create authenticated state for reuse across tests
 */
async function createAuthState(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: (config as any).use?.baseURL,
  });
  const page = await context.newPage();

  // Login
  const username = process.env.PLAYWRIGHT_TEST_USERNAME || 'username';
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD || 'password';

  await page.goto('/login.html');
  await page.getByLabel('Login').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.locator('[name="submit"]').click();
  await page.waitForURL(/.*account-summary.html/);

  // Save authenticated state
  await context.storageState({
    path: path.resolve(__dirname, '../../', '.auth', 'state.json'),
  });

  await browser.close();
}

export default globalSetup;