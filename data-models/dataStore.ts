import path from 'path';
import { TestDataRow } from '../data-models/interfaces';
import { CsvReader } from '../utils/csvReader';

/**
 * Enhanced DataStore with lazy loading and better organization
 */
export class DataStore {
  private static readonly DATA_DIR = path.resolve(__dirname, '../test-data');
  private static dataCache: Map<string, TestDataRow[]> = new Map();

  /**
   * Get all data from a CSV file
   */
  static getAll<T extends TestDataRow>(fileName: string): T[] {
    const filePath = this.getFilePath(fileName);
    return CsvReader.read<T>(filePath);
  }

  /**
   * Get only runnable tests (where Test='true')
   */
  static getRunnableTests<T extends TestDataRow>(fileName: string): T[] {
    const filePath = this.getFilePath(fileName);
    return CsvReader.getRunnableTests<T>(filePath);
  }

  /**
   * Get test data by row index
   */
  static getByIndex<T extends TestDataRow>(
    fileName: string,
    index: number
  ): T | undefined {
    const filePath = this.getFilePath(fileName);
    return CsvReader.getTestByIndex<T>(filePath, index);
  }

  /**
   * Get filtered test data
   */
  static getFiltered<T extends TestDataRow>(
    fileName: string,
    filterFn: (row: T) => boolean
  ): T[] {
    const filePath = this.getFilePath(fileName);
    return CsvReader.filterTests<T>(filePath, filterFn);
  }

  /**
   * Get test data with metadata
   */
  static getWithMetadata<T extends TestDataRow>(fileName: string): Array<{
    data: T;
    metadata: {
      index: number;
      shouldRun: boolean;
      testId: string;
    };
  }> {
    const allData = this.getAll<T>(fileName);
    return allData.map((data, index) => ({
      data,
      metadata: {
        index,
        shouldRun: data.Test?.toLowerCase() === 'true',
        testId: `${fileName}_${index + 1}`,
      },
    }));
  }

  /**
   * Get file path with proper extension handling
   */
  private static getFilePath(fileName: string): string {
    const hasExtension = fileName.endsWith('.csv');
    const fullFileName = hasExtension ? fileName : `${fileName}.csv`;
    return path.join(this.DATA_DIR, fullFileName);
  }

  /**
   * Clear all cached data
   */
  static clearCache(): void {
    CsvReader.clearCache();
    this.dataCache.clear();
  }

  /**
   * Preload data files for better performance
   */
  static preloadFiles(fileNames: string[]): void {
    fileNames.forEach((fileName) => {
      this.getAll(fileName);
    });
  }

  /**
   * Validate required fields in data
   */
  static validateRequiredFields<T extends TestDataRow>(
    fileName: string,
    requiredFields: (keyof T)[]
  ): { valid: boolean; errors: string[] } {
    const data = this.getAll<T>(fileName);
    const errors: string[] = [];

    data.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(
            `Row ${index + 2}: Missing required field '${String(field)}'`
          );
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}