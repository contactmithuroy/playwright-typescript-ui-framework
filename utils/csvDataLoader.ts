import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

export interface LoginCredentials {
    Login: string;
    Password: string;
}

export function loadLoginCredentials(csvFileName: string = 'loginCredentials.csv'): LoginCredentials[] {
    try {
        const csvFilePath = path.resolve(__dirname, `../test-data/${csvFileName}`);
        
        if (!fs.existsSync(csvFilePath)) {
            throw new Error(`CSV file not found at path: ${csvFilePath}`);
        }

        const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
        
        const credentials = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        }) as LoginCredentials[];

        if (credentials.length === 0) {
            throw new Error(`No credentials found in CSV file: ${csvFileName}`);
        }

        return credentials;
    } catch (error) {
        throw new Error(`Failed to load login credentials: ${error instanceof Error ? error.message : String(error)}`);
    }
}
