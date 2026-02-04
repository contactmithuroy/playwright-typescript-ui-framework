import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global Teardown - Runs once after all tests
 * Used for:
 * - Cleaning up temporary files
 * - Generating final reports
 * - Archiving test results
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n========================================');
  console.log('🧹 Starting Global Teardown');
  console.log('========================================\n');

  // Archive test results if configured
  if (process.env.ARCHIVE_RESULTS === 'true') {
    console.log('📦 Archiving test results...');
    try {
      await archiveResults();
      console.log('✅ Test results archived');
    } catch (error) {
      console.warn('⚠️  Failed to archive results:', error);
    }
  }

  // Clean up temporary files
  console.log('🗑️  Cleaning up temporary files...');
  try {
    cleanupTempFiles();
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.warn('⚠️  Cleanup failed:', error);
  }

  // Generate summary
  console.log('\n📊 Test Execution Summary:');
  console.log(`   Results location: test-results/`);
  console.log(`   Report location: playwright-report/`);

  console.log('\n========================================');
  console.log('✅ Global Teardown Completed');
  console.log('========================================\n');
}

/**
 * Archive test results to timestamped folder
 */
async function archiveResults() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveDir = path.resolve(
    __dirname,
    '../../allTestResult',
    `run-${timestamp}`
  );

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  // Copy test results
  const resultsDir = path.resolve(__dirname, '../../test-results');
  if (fs.existsSync(resultsDir)) {
    copyDirectory(resultsDir, path.join(archiveDir, 'test-results'));
  }

  // Copy HTML report
  const reportDir = path.resolve(__dirname, '../../playwright-report');
  if (fs.existsSync(reportDir)) {
    copyDirectory(reportDir, path.join(archiveDir, 'playwright-report'));
  }
}

/**
 * Clean up temporary files
 */
function cleanupTempFiles() {
  const tempDirs = [
    path.resolve(__dirname, '../../.auth'),
    // Add other temp directories as needed
  ];

  tempDirs.forEach((dir) => {
    if (fs.existsSync(dir) && process.env.KEEP_AUTH_STATE !== 'true') {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default globalTeardown;