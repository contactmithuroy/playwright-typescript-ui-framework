import fs from 'fs';
import path from 'path';

export function csvReader(filePath: string){
    try {
        const absolutePath = path.resolve(filePath);
        const data = fs.readFileSync(absolutePath, 'utf-8');
        
        const [headerLine, ...lines] = data.trim().split('\n');
        const headers = headerLine.split(',').map(header => header.trim());

        return lines.map(line => {
            const values = line.split(',').map(value => value.trim());
            return Object.fromEntries(
                headers.map((header, index) => [header, values[index]])
            );
        }   
            )
    } catch (error) {
        throw new Error(`Error reading CSV file at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
} 