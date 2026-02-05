import { TestDataRow } from '../../data-models/interfaces';
import { test, expect } from '.././fixtures/customFixtures';

/**
 * Test Factory for generating data-driven tests from CSV
 * This provides a clean, reusable pattern for creating parameterized tests
 */
export class TestFactory {
  /**
   * Create a test suite from CSV data with custom test logic
   * 
   * @param suiteName - Name of the test suite
   * @param csvFileName - Name of the CSV file (without .csv extension)
   * @param testFn - Function that contains the test logic
   * @param options - Configuration options
   */
  static createDataDrivenSuite<T extends TestDataRow>(
    suiteName: string,
    csvFileName: string,
    testFn: (data: T, index: number) => Promise<void>,
    options: {
      titleGenerator?: (data: T, index: number) => string;
      beforeEachTest?: (data: T) => Promise<void>;
      afterEachTest?: (data: T) => Promise<void>;
      filter?: (data: T) => boolean;
      useAuthentication?: boolean;
    } = {}
  ) {
    const {
      titleGenerator = (data, index) => `Test case ${index + 1}`,
      beforeEachTest,
      afterEachTest,
      filter = (data) => data.Test?.toLowerCase() === 'true',
      useAuthentication = true,
    } = options;

    test.describe(suiteName, () => {
      // Dynamically import and filter data
      const DataStore = require('../../data-models/dataStore').DataStore as typeof import('../../data-models/dataStore').DataStore;
      const testData: T[] = DataStore.getAll<T>(csvFileName).filter((d: T) => filter(d));

      if (testData.length === 0) {
        test.skip('No test data available', () => {});
        return;
      }

      testData.forEach((data: T, index: number) => {
        const testTitle = titleGenerator(data, index);

        // Create test with or without authentication
        const testRunner = useAuthentication 
          ? test
          : test;

        testRunner(testTitle, async ({ page, authenticatedPage }) => {
          const activePage = useAuthentication ? authenticatedPage : page;

          try {
            // If not using authentication, clear any previous session
            if (!useAuthentication) {
              await activePage.context().clearCookies();
            } else {
              // For authenticated tests, ensure we're on the dashboard
              // This handles page state consistency between sequential tests
              await activePage.waitForLoadState('networkidle').catch(() => {});
            }

            // Run before hook if provided
            if (beforeEachTest) {
              await beforeEachTest(data);
            }

            // Execute the actual test
            await testFn.call({ page: activePage, expect }, data, index);

            // Run after hook if provided
            if (afterEachTest) {
              await afterEachTest(data);
            }
          } catch (error) {
            console.error(`Test failed for data row ${index + 1}:`, data);
            throw error;
          }
        });
      });
    });
  }
}