/**
 * Core interfaces for data-driven testing
 */

export interface TestDataRow {
  Test: string;
  [key: string]: string | undefined;
}

export interface LoginCredentials extends TestDataRow {
  Login: string;
  Password: string;
}

export interface TransferData extends TestDataRow {
  TestId: string;
  TestTitle: string;
  MainMenu: string;
  SubMenu?: string;
  FromAccount: string;
  ToAccount: string;
  Amount: string;
  Description: string;
}

export interface PayBillsData extends TestDataRow {
  TestId: string;
  TestTitle: string;
  MainMenu: string;
  SubMenu?: string;
  Payee: string;
  Account: string;
  Amount: string;
  Date: string;
  Description: string;
}

export interface PurchaseForeignCurrencyData extends TestDataRow {
  TestId: string;
  TestTitle: string;
  MainMenu: string;
  SubMenu?: string;
  Currency: string;   
  Amount: string;
  CurrencyInUSDorOthers: string;
}

export interface OnlineStatementData extends TestDataRow {
  TestId: string;
  TestTitle: string;
  MainMenu: string; 
  SubMenu?: string;
  Account: string;
  Year: string;
}

/**
 * Test execution metadata
 */
export interface TestMetadata {
  testId: string;
  dataRow: number;
  shouldRun: boolean;
  tags?: string[];
}

/**
 * Test context for fixtures
 */
export interface TestContext {
  authenticated: boolean;
  username?: string;
  sessionData?: Record<string, any>;
}