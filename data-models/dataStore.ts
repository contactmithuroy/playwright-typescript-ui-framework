import { csvReader } from '../utils/csvReader';
import path from 'path';

const store: Record<string, Record<string, string>[]> = {
  MakeATransferData: csvReader(path.resolve(__dirname, '../test-data/MakeATransferData.csv')),
  PayBillsData: csvReader(path.resolve(__dirname, '../test-data/PayBillsData.csv')),
};

export const DataStore = {
  getAll(fileKey: "MakeATransferData" | "PayBillsData") {
    return store[fileKey];
  },

  getRow(fileKey: "MakeATransferData" | "PayBillsData", rowIndex: number) {
    return store[fileKey][rowIndex];
  },

  getCell(
    fileKey: "MakeATransferData" | "PayBillsData",rowIndex: number, columnName: string) {
    return store[fileKey][rowIndex]?.[columnName];
  }
};
