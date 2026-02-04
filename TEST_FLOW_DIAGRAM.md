# Playwright Test Execution Flow Diagram

## Overview - How Files Call Each Other

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         npx playwright test                             │
│                      (Or: npm run test:login)                           │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  playwright.config.ts       │ ◄─── Loads environment variables
        │  ─────────────────────────  │      from .env.development
        │  - testDir: './tests'       │      (.env.staging, .env.production)
        │  - timeout: 60_000ms        │
        │  - workers: 1               │
        │  - globalSetup: ...         │
        │  - globalTeardown: ...      │
        │  - reporters: [...]         │
        └──────────┬──────────────────┘
                   │
       ┌───────────┴────────────┐
       ▼                        ▼
  ┌──────────────────┐   ┌─────────────────────┐
  │ globalSetup.ts   │   │ (Runs only once at  │
  │ ─────────────── │   │  the start)         │
  │ • Create dirs    │   └─────────────────────┘
  │ • Validate env   │
  │ • Preload data   │
  │ • Log config     │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────────────────────────────┐
  │  DataStore.preloadFiles()                │
  │  ─────────────────────────────────────   │
  │  Loads CSV files into memory:            │
  │  • test-data/loginCredentials.csv        │
  │  • test-data/MakeATransferData.csv       │
  │  • test-data/PayBillsData.csv            │
  └────────┬─────────────────────────────────┘
           │
           ▼
  ┌──────────────────────────────────────────┐
  │  Test Discovery & Execution              │
  │  ──────────────────────────────────────  │
  │  Scans: tests/**/*.spec.ts               │
  └────────┬─────────────────────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    ▼             ▼          ▼          ▼
┌─────────┐  ┌────────┐  ┌────────┐  ┌──────────────┐
│verifyLogin│ │verifyAccount│ │verifyTransfer│ │comprehensive.│
│.spec.ts │  │Summary.spec.ts│ │Money.spec.ts│ │example.spec.ts│
└────┬────┘  └───┬────┘  └───┬────┘  └──────┬──────┘
     │           │           │             │
     └───────────┼───────────┼─────────────┘
                 ▼
      ┌──────────────────────────────┐
      │  customFixtures.ts           │
      │  ─────────────────────────── │
      │  Provides fixtures:          │
      │  • authenticatedPage         │
      │  • loginPage                 │
      │  • testContext               │
      └─────────┬────────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  (For tests that use  (For tests that)
   authenticatedPage)  (don't use fixture)
    │           │           │
    ▼           ▼           ▼
┌─────────┐  ┌────────┐  ┌──────────────┐
│Before   │  │LoginPage│ │TestFactory   │
│• Clear  │  │Create   │ │             │
│ cookies │  │        │ │(.createData  │
│• Login  │  │        │ │DrivenSuite)  │
│ auto    │  │        │ │              │
│        │  │        │ │              │
└─────────┘  └────────┘  └──────┬──────┘
    │           │               │
    │           │      ┌────────┴─────────┐
    │           │      ▼                  ▼
    │           │   ┌────────────┐   ┌─────────────────┐
    │           │   │DataStore   │   │For each CSV row:│
    │           │   │.getAll()   │   │                 │
    │           │   │.getRunnableTests│ • Clear cookies │
    │           │   │            │   │ • beforeEachTest│
    │           │   │            │   │ • Test function │
    │           │   │            │   │ • afterEachTest │
    │           │   └────────────┘   └─────────────────┘
    │           │                             │
    └───────────┴─────────────────────────────┘
                │
                ▼
      ┌──────────────────────────────────────┐
      │  Page Objects (BasePage, LoginPage,  │
      │  NavigationPage, MoneyTransferPage)  │
      │  ──────────────────────────────────  │
      │  Encapsulate UI interactions:        │
      │  • Locators                          │
      │  • Navigation methods                │
      │  • Action methods                    │
      │  • Verification methods              │
      └────────┬─────────────────────────────┘
               │
               ▼
      ┌──────────────────────────────────────┐
      │  Browser Automation (Playwright)     │
      │  ──────────────────────────────────  │
      │  • Navigate pages                    │
      │  • Fill forms                        │
      │  • Click buttons                     │
      │  • Wait for elements                 │
      │  • Take screenshots                  │
      │  • Verify assertions                 │
      └────────┬─────────────────────────────┘
               │
               ▼
      ┌──────────────────────────────────────┐
      │  Test Reports Generation             │
      │  ──────────────────────────────────  │
      │  • test-results/junit.xml            │
      │  • test-results/results.json         │
      │  • playwright-report/index.html      │
      │  • allure-results/                   │
      └────────┬─────────────────────────────┘
               │
               ▼
      ┌──────────────────────────────────────┐
      │  globalTeardown.ts                   │
      │  ──────────────────────────────────  │
      │  (Runs only once at the end)        │
      │  • Archive results                   │
      │  • Clean up temp files               │
      │  • Generate summary                  │
      │  • Remove .auth folder               │
      └──────────────────────────────────────┘
```

---

## Detailed Call Flow - Step by Step

### 1️⃣ **Initialization Phase**
```
npx playwright test tests/smoke/verifyLogin.spec.ts --headed
        │
        ▼
playwright.config.ts (loads)
        │
        ├─ process.env.TEST_ENV = 'development'
        ├─ dotenv.config('.env')
        ├─ dotenv.config('.env.development')
        │
        ▼
globalSetup() executes:
        │
        ├─ Create directories: test-results/, screenshots/
        ├─ Validate BASE_URL env var
        ├─ DataStore.preloadFiles(['loginCredentials', 'MakeATransferData'])
        │    │
        │    ▼
        │   CsvReader.read() x2 (loads CSV into memory)
        │
        └─ Log test configuration
```

### 2️⃣ **Test Discovery Phase**
```
Playwright finds all test files matching: **/*.spec.ts

For each *.spec.ts file:
        │
        ├─ import { test } from '../fixtures/customFixtures'
        │   (Extends test with custom fixtures)
        │
        ├─ test.describe() or TestFactory.createDataDrivenSuite()
        │   (Registers test groups and individual tests)
        │
        └─ Each test is queued with fixtures attached
```

### 3️⃣ **Test Execution Phase (1 worker = Sequential)**

#### Example: verifyLogin.spec.ts

```
TEST 1: CSV-Driven Login Tests › Login test 1: User "username" - Password "password"
        │
        ├─ Fixture Setup: authenticatedPage
        │   ├─ page.goto('/login.html')
        │   ├─ loginPage.login('username', 'password')
        │   ├─ loginPage.submitLoginForm()
        │   └─ page.waitForURL(/account-summary.html/)
        │
        ├─ Fixture provides: testContext.authenticated = true
        │
        ├─ Test Body (if it used authenticatedPage fixture)
        │   └─ Test logic runs with authenticated page
        │
        └─ Fixture Cleanup (After hook)
            ├─ loginPage.logout()
            ├─ testContext.authenticated = false

TEST 2: CSV-Driven Login Tests › Login test 2: User "username" - Password "pass1"
        │
        ├─ NEW PAGE CONTEXT CREATED (fresh browser context)
        │
        ├─ TestFactory.createDataDrivenSuite() handles:
        │   ├─ activePage.context().clearCookies()
        │   ├─ beforeEachTest(data)
        │   ├─ await testFn.call({page, expect}, data, index)
        │   │   └─ loginPage.navigateToLoginPage()
        │   │   └─ loginPage.login(data.Login, data.Password)
        │   │   └─ loginPage.submitLoginForm()
        │   │   └─ expect(isLoggedIn).toBe(true)
        │   │   └─ loginPage.logout()
        │   │
        │   └─ afterEachTest(data)
        │
        └─ Test passes or fails
```

### 4️⃣ **Report Generation Phase**
```
After all tests complete:

Reports generated:
├─ test-results/junit.xml
│   (JUnit XML format for CI/CD)
│
├─ test-results/results.json
│   (JSON format with detailed results)
│
├─ playwright-report/index.html
│   (Interactive HTML report)
│
└─ allure-results/ (if USE_ALLURE=true)
    (Allure report format)
```

### 5️⃣ **Cleanup Phase**
```
globalTeardown() executes:
        │
        ├─ Archive test results to: allTestResult/run-TIMESTAMP/
        │
        ├─ Clean up temporary files:
        │   ├─ Remove .auth/ folder
        │   └─ Remove .cache/ if needed
        │
        ├─ Log summary:
        │   ├─ Results location: test-results/
        │   └─ Report location: playwright-report/
        │
        └─ End test run
```

---

## File Structure and Their Roles

```
📦 Project Root
│
├─ 📄 playwright.config.ts
│  └─ Configures Playwright, loads env, sets workers=1, timeouts, retries
│
├─ 📁 tests/
│  │
│  ├─ 📁 config/
│  │  ├─ globalSetup.ts    (Runs ONCE at start)
│  │  └─ globalTeardown.ts (Runs ONCE at end)
│  │
│  ├─ 📁 fixtures/
│  │  └─ customFixtures.ts
│  │     ├─ authenticatedPage (auto-logs in)
│  │     ├─ loginPage (provides LoginPage instance)
│  │     └─ testContext (provides test state)
│  │
│  ├─ 📁 factories/
│  │  └─ testFactory.ts
│  │     ├─ createDataDrivenSuite() (generates tests from CSV)
│  │     ├─ createGroupedTests() (generates grouped tests)
│  │     └─ createParameterizedTest() (single parameterized test)
│  │
│  ├─ 📁 smoke/
│  │  ├─ verifyLogin.spec.ts (Data-driven login tests)
│  │  ├─ verifyAccountSummary.spec.ts (Uses authenticatedPage fixture)
│  │  └─ verifyTransferMoney.spec.ts (Uses authenticatedPage fixture)
│  │
│  └─ 📁 examples/
│     └─ comprehensive.example.spec.ts (Example test suites)
│
├─ 📁 pages/ (Page Objects)
│  ├─ 📁 Common/
│  │  ├─ basePage.ts (Base class with utilities)
│  │  └─ LoginPage.ts (Login page object)
│  │
│  └─ 📁 MainPages/
│     ├─ NavigationPage.ts
│     └─ MoneyTransferPage.ts
│
├─ 📁 data-models/
│  ├─ dataStore.ts (Loads CSV data)
│  └─ interfaces.ts (TypeScript interfaces)
│
├─ 📁 test-data/
│  ├─ loginCredentials.csv
│  ├─ MakeATransferData.csv
│  └─ PayBillsData.csv
│
├─ 📁 utils/
│  └─ csvReader.ts (Reads CSV files)
│
├─ 📄 .env.development (Dev env variables)
├─ 📄 .env.staging
├─ 📄 .env.production
│
└─ 📁 test-results/ (Generated)
   ├─ junit.xml
   ├─ results.json
   └─ ...

```

---

## Key Functions and What They Do

### 🔧 **globalSetup.ts**
```typescript
globalSetup(config: FullConfig) {
  // 1. Create directories
  // 2. Validate environment variables
  // 3. Log configuration
  // 4. Preload test data (CSV files)
  // 5. Optional: Create authenticated state for reuse
}
```

### 🔧 **globalTeardown.ts**
```typescript
globalTeardown(config: FullConfig) {
  // 1. Archive test results to timestamped folder
  // 2. Clean up temporary files (.auth folder)
  // 3. Generate summary report
  // 4. Log final message
}
```

### 🔧 **customFixtures.ts**
```typescript
test.extend<CustomFixtures>({
  
  // Runs BEFORE each test that uses it
  authenticatedPage: async ({ page, testContext }, use) => {
    // 1. Navigate to login page
    // 2. Fill credentials from env
    // 3. Submit login form
    // 4. Update testContext.authenticated = true
    
    await use(page);  // Provide page to test
    
    // Runs AFTER test completes
    // 1. Logout
    // 2. Clear session
  },
  
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  
  testContext: async ({}, use) => {
    const context = { authenticated: false, sessionData: {} };
    await use(context);
    // Cleanup after test
  }
})
```

### 🔧 **TestFactory.createDataDrivenSuite()**
```typescript
static createDataDrivenSuite<T>(
  suiteName: string,
  csvFileName: string,
  testFn: (data: T, index: number) => Promise<void>,
  options: {
    titleGenerator?: (data, index) => string,
    filter?: (data) => boolean,
    useAuthentication?: boolean,
    beforeEachTest?: (data) => Promise<void>,
    afterEachTest?: (data) => Promise<void>,
  }
) {
  // 1. Get CSV data using DataStore.getAll()
  // 2. Filter data using filter() function
  // 3. For each data row:
  //    a. Generate unique test title
  //    b. Create test with fixtures
  //    c. If useAuthentication=false: clear cookies
  //    d. Run beforeEachTest hook
  //    e. Run testFn with data
  //    f. Run afterEachTest hook
}
```

### 🔧 **DataStore.getAll()**
```typescript
static getAll<T>(fileName: string): T[] {
  // 1. Resolve path: test-data/{fileName}.csv
  // 2. Call CsvReader.read()
  // 3. Return array of test data objects
}
```

### 🔧 **Page Object Pattern (LoginPage.ts)**
```typescript
class LoginPage extends BasePage {
  usernameInput: Locator;
  passwordInput: Locator;
  signInButton: Locator;
  
  async login(username: string, password: string) {
    // Fill username input
    // Fill password input
  }
  
  async submitLoginForm() {
    // Click submit button
    // Wait for navigation
    // Handle redirects
  }
  
  async verifyLoginSuccess(): Promise<boolean> {
    // Check if logged in
    // Return true/false
  }
}
```

---

## Example: Running a Test

### Command:
```bash
npm run test:login
# Which runs: playwright test tests/smoke/verifyLogin.spec.ts
```

### Sequence:

```
1. playwright.config.ts loads
   └─ Detects TEST_ENV='development'
   └─ Loads .env.development (gets BASE_URL, PLAYWRIGHT_TEST_USERNAME, etc)
   └─ Sets workers: 1
   └─ Registers globalSetup.ts and globalTeardown.ts

2. globalSetup.ts runs (once before all tests)
   └─ Creates test-results/, screenshots/ directories
   └─ Validates BASE_URL env var
   └─ DataStore.preloadFiles(['loginCredentials', ...])
   └─ Logs config: "Running 7 tests using 1 worker"

3. Test discovery
   └─ Finds: tests/smoke/verifyLogin.spec.ts
   └─ Finds 3 data-driven suites (3 calls to TestFactory.createDataDrivenSuite)
   └─ CSV has 4 rows (1 invalid, 3 valid)
   └─ Suite 1 (valid only): 3 tests
   └─ Suite 2 (invalid only): 1 test
   └─ Suite 3 (grouped): 3 tests grouped by Login name
   └─ Total: 7 tests queued

4. Test 1 of 7: "CSV-Driven Login Tests › Login test 1: User "username" - Password "password""
   └─ Fixture: authenticatedPage setup
   └─ Test body runs (if it uses authenticatedPage)
   └─ Fixture: authenticatedPage teardown

5. Test 2 of 7: "CSV-Driven Login Tests › Login test 2: User "username" - Password "pass1""
   └─ NEW fresh page context
   └─ TestFactory clears cookies
   └─ Runs: beforeEachTest()
   └─ Test logic: navigate, login, verify, logout
   └─ Runs: afterEachTest()

6. ... (Tests 3-7 follow same pattern)

7. All tests complete

8. globalTeardown.ts runs (once after all tests)
   └─ Archives results to: allTestResult/run-2026-02-05T...
   └─ Removes .auth folder
   └─ Reports results location

9. Test run complete
   └─ playwright-report/index.html available to view
```

---

## Environment Variables Flow

```
.env.development (Loaded by dotenv in playwright.config.ts)
    │
    ├─ BASE_URL = http://zero.webappsecurity.com
    │  └─ Used by: playwright.config.ts use.baseURL
    │
    ├─ PLAYWRIGHT_TEST_PATH = /login.html
    │  └─ Used by: customFixtures.ts authenticatedPage setup
    │
    ├─ PLAYWRIGHT_TEST_USERNAME = username
    │  └─ Used by: customFixtures.ts authenticatedPage setup
    │
    └─ PLAYWRIGHT_TEST_PASSWORD = password
       └─ Used by: customFixtures.ts authenticatedPage setup
```

---

## Summary

| Phase | Who | What | When |
|-------|-----|------|------|
| **Initialization** | playwright.config.ts | Loads env, sets config | Start |
| **Setup** | globalSetup.ts | Create dirs, preload data | Once before all tests |
| **Discovery** | Playwright | Find *.spec.ts files | Before test run |
| **Fixtures** | customFixtures.ts | Provide page, login, context | Before each test |
| **Execution** | Test spec files | Run test logic, TestFactory generates tests from CSV | For each test |
| **Page Objects** | LoginPage, etc | Encapsulate UI interactions | Called by test logic |
| **Reports** | Reporters | Generate XML, JSON, HTML | After tests complete |
| **Teardown** | globalTeardown.ts | Archive results, cleanup | Once after all tests |

