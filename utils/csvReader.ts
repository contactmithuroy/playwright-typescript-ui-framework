import fs from 'fs';
import path from 'path';
import { TestDataRow } from '../data-models/interfaces';

/**
 *  CSV Reader with validation 
 */
export class CsvReader {
  private static cache: Map<string, TestDataRow[]> = new Map();

  /**
   * Read CSV file with caching
   */
  static read<T extends TestDataRow>(filePath: string, useCache: boolean = true): T[] {
    const absolutePath = path.resolve(filePath);

    if (useCache && this.cache.has(absolutePath)) {
      return this.cache.get(absolutePath) as T[];
    }

    try {
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`CSV file not found: ${absolutePath}`);
      }

      const data = fs.readFileSync(absolutePath, 'utf-8');
      const parsedData = this.parseCSV<T>(data);

      if (useCache) {
        this.cache.set(absolutePath, parsedData);
      }

      return parsedData;
    } catch (error) {
      throw new Error(
        `Error reading CSV file at ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Parse CSV content into typed objects
   */
  private static parseCSV<T extends TestDataRow>(csvContent: string): T[] {
    const lines = csvContent.trim().split('\n');

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const [headerLine, ...dataLines] = lines;
    const headers = this.parseCSVLine(headerLine);

    if (headers.length === 0) {
      throw new Error('CSV file has no headers');
    }

    return dataLines
      .filter((line) => line.trim().length > 0) // Skip empty lines
      .map((line, index) => {
        const values = this.parseCSVLine(line);

        if (values.length !== headers.length) {
          console.warn(
            `Row ${index + 2} has ${values.length} columns but expected ${headers.length}. Skipping.`
          );
          return null;
        }

        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i];
        });

        return row as T;
      })
      .filter((row): row is T => row !== null);
  }

  /**
   * Parse a single CSV line (handles quoted values with commas)
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get runnable test rows (where Test flag is 'true')
   */
  static getRunnableTests<T extends TestDataRow>(
    filePath: string,
    testFlag: string = 'Test'
  ): T[] {
    const allData = this.read<T>(filePath);
    return allData.filter((row) => row[testFlag]?.toLowerCase() === 'true');
  }

  /**
   * Get test by index
   */
  static getTestByIndex<T extends TestDataRow>(
    filePath: string,
    index: number
  ): T | undefined {
    const allData = this.read<T>(filePath);
    return allData[index];
  }

  /**
   * Get tests by custom filter
   */
  static filterTests<T extends TestDataRow>(
    filePath: string,
    filterFn: (row: T) => boolean
  ): T[] {
    const allData = this.read<T>(filePath);
    return allData.filter(filterFn);
  }
}