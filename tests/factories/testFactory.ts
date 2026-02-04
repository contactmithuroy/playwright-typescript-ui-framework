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

  /**
   * Create a single parameterized test (without describe block)
   */
  static createParameterizedTest<T extends TestDataRow>(
    csvFileName: string,
    testNamePrefix: string,
    testFn: (data: T, index: number) => Promise<void>,
    options: {
      filter?: (data: T) => boolean;
      useAuthentication?: boolean;
    } = {}
  ) {
    const {
      filter = (data) => data.Test?.toLowerCase() === 'true',
      useAuthentication = true,
    } = options;

    const DataStore = require('../../data-models/dataStore').DataStore as typeof import('../../data-models/dataStore').DataStore;
    const testData: T[] = DataStore.getAll<T>(csvFileName).filter((d: T) => filter(d));

    testData.forEach((data: T, index: number) => {
      const testRunner = useAuthentication ? test : test;

      testRunner(
        `${testNamePrefix} - Row ${index + 1}`,
        async ({ page, authenticatedPage }) => {
          const activePage = useAuthentication ? authenticatedPage : page;
          await testFn.call({ page: activePage, expect }, data, index);
        }
      );
    });
  }

  /**
   * Create tests with custom grouping by a field
   */
  static createGroupedTests<T extends TestDataRow>(
    suiteName: string,
    csvFileName: string,
    groupByField: keyof T,
    testFn: (data: T, index: number) => Promise<void>,
    options: {
      useAuthentication?: boolean;
    } = {}
  ) {
    const { useAuthentication = true } = options;
    const DataStore = require('../../data-models/dataStore').DataStore as typeof import('../../data-models/dataStore').DataStore;
    const testData: T[] = DataStore.getRunnableTests<T>(csvFileName);

    // Group data by field
    const groups = testData.reduce((acc: Record<string, T[]>, data: T) => {
      const key = String(data[groupByField]);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(data);
      return acc;
    }, {} as Record<string, T[]>);

    test.describe(suiteName, () => {
      Object.entries(groups).forEach(([groupName, groupData]: [string, T[]]) => {
        test.describe(`Group: ${groupName}`, () => {
          groupData.forEach((data: T, index: number) => {
            const testRunner = useAuthentication ? test : test;

            testRunner(
              `Test ${index + 1} - ${groupName}`,
              async ({ page, authenticatedPage }) => {
                const activePage = useAuthentication ? authenticatedPage : page;

                // If not using authentication, clear any previous session
                if (!useAuthentication) {
                  await activePage.context().clearCookies();
                }

                await testFn.call({ page: activePage, expect }, data, index);
              }
            );
          });
        });
      });
    });
  }
}

/**
 * Decorator for test data validation
 */
export function validateTestData<T extends TestDataRow>(
  requiredFields: (keyof T)[]
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (data: T, index: number) {
      // Validate required fields
      for (const field of requiredFields) {
        if (!data[field] || String(data[field]).trim() === '') {
          throw new Error(
            `Missing required field '${String(field)}' in test data row ${index + 1}`
          );
        }
      }

      // Call original method
      return originalMethod.call(this, data, index);
    };

    return descriptor;
  };
}