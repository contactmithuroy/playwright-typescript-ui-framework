# Playwright TypeScript UI Framework

A robust end-to-end UI automation framework built with **Playwright** and **TypeScript** for testing the Zero banking demo application. This framework provides a scalable, maintainable structure for cross-browser testing with support for data-driven testing through CSV files.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Data](#test-data)
- [Page Object Model](#page-object-model)
- [Contributing](#contributing)

## 🎯 Overview

This framework automates UI testing for the Zero banking application, a demo banking system with features like:
- User login/logout
- Account summary viewing
- Money transfer between accounts
- Bill payment operations

The framework follows industry best practices including:
- **Page Object Model (POM)** pattern for maintainability
- **Data-driven testing** using CSV files
- **Cross-browser testing** support
- **TypeScript** for type safety and better code quality
- **Parallel test execution** for faster feedback

## 📁 Project Structure

```
playwright-typescript-ui-framework/
│
├── 📄 README.md                           # This file - Project documentation
├── 📄 package.json                        # Project dependencies and scripts
├── 📄 playwright.config.ts                # Playwright configuration
├── 📄 .env                                # Environment variables
├── 📄 .env.example                        # Example environment file
│
├── 📂 tests/                              # Test files directory
│   ├── 📄 baseTest.ts                     # Base test setup and configurations
│   └── 📂 smoke/                          # Smoke tests suite
│       ├── 📄 verifyLoginTest.spec.ts     # Login/Logout test cases
│       ├── 📄 VerifyAccuntSummary.spec.ts # Account summary test cases
│       └── 📄 verifyTransferMoney.spec.ts # Money transfer test cases
│
├── 📂 pages/                              # Page Object Model classes
│   ├── 📂 Common/                         # Shared page objects
│   │   ├── 📄 base.page.ts                # Base page class (parent for all pages)
│   │   └── 📄 LoginPage.ts                # Login page object model
│   │
│   └── 📂 MainPages/                      # Application main pages
│       ├── 📄 NevigationPage.ts           # Navigation/Menu page object
│       └── 📄 MoneyTransferPage.ts        # Money transfer page object
│
├── 📂 test-data/                          # Test data files
│   ├── 📄 loginCredentials.csv            # Login test data
│   ├── 📄 MakeATransferData.csv           # Money transfer test data
│   └── 📄 PayBillsData.csv                # Bill payment test data
│
├── 📂 data-models/                        # Data handling and models
│   └── 📄 dataStore.ts                    # CSV data loader and storage
│
├── 📂 utils/                              # Utility functions
│   ├── 📄 csvReader.ts                    # CSV file parsing utility
│   └── 📄 csvDataLoader.ts                # Data loading helper functions
│
├── 📂 test-results/                       # Test execution results
│   └── 📂 [test-name]-[browser]/          # Individual test result folders
│       ├── 📄 test-failed-1.png           # Failed test screenshot
│       └── 📄 error-context.md            # Error details and logs
│
├── 📂 playwright-report/                  # HTML test report
│   ├── 📄 index.html                      # Report entry point
│   └── 📂 data/                           # Report data files
│
├── 📂 allTestResult/                      # Archived test results
│
└── 📂 .github/                            # GitHub configuration
    └── 📂 workflows/                      # CI/CD workflows (if configured)
```

## ✨ Features

- ✅ **Page Object Model Pattern** - Clean, maintainable test code
- ✅ **Data-Driven Testing** - CSV-based test data management
- ✅ **Cross-Browser Testing** - Chromium support (Firefox/WebKit configurable)
- ✅ **TypeScript Support** - Strong typing for better code quality
- ✅ **Parallel Execution** - Run tests in parallel for faster feedback
- ✅ **HTML Test Reports** - Comprehensive test execution reports
- ✅ **Screenshot on Failure** - Automatic screenshot capture for failed tests
- ✅ **Trace Recording** - Record traces on first test retry
- ✅ **Environment Configuration** - Easy setup via .env files
- ✅ **Reusable Test Utilities** - CSV reading and data loading helpers

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git** (for version control)
- Modern browser (Chrome, Firefox, or Safari)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/contactmithuroy/playwright-typescript-ui-framework.git
   cd playwright-typescript-ui-framework
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuration

### Environment Variables (.env)

Create a `.env` file in the root directory:

```env
# Application URL
PLAYWRIGHT_TEST_PATH=/login.html

# Login Credentials (overrides CSV values)
PLAYWRIGHT_TEST_USERNAME=username
PLAYWRIGHT_TEST_PASSWORD=password

# Playwright Configuration
CI=false
```

### Playwright Configuration (playwright.config.ts)

Key configurations:
- **Base URL**: `http://zero.webappsecurity.com`
- **Test Directory**: `./tests`
- **Reporter**: HTML report
- **Timeout**: 30 seconds per test
- **Navigation Timeout**: 50 seconds
- **Screenshot**: On failure only
- **Trace**: On first retry

## 🧪 Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test file
```bash
npx playwright test tests/smoke/verifyLoginTest.spec.ts
```

### Run tests with specific browser
```bash
npx playwright test --project=chromium
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests with UI mode (visual debugging)
```bash
npx playwright test --ui
```

### Generate and view test report
```bash
npx playwright show-report
```

## 📊 Test Data

Test data is managed through CSV files in the `test-data/` directory:

### loginCredentials.csv
Contains login credentials for authentication:
```csv
Login,Password,Test
demo,mode,true
admin,admin,true
```

### MakeATransferData.csv
Contains money transfer test scenarios:
```csv
FromAccount,ToAccount,Amount,Description,Test
Checking,Savings,100,Monthly savings transfer,true
Savings,Checking,250,Rent payment,true
```

### PayBillsData.csv
Contains bill payment test scenarios (if needed)

## 🏗️ Page Object Model

### Base Page Class
All page objects extend `BasePage`:
```typescript
export class BasePage {
    constructor(protected page: Page) {}
    protected async navigateTo(path: string): Promise<void> {
        await this.page.goto(path);
    }
}
```

### Page Object Example
```typescript
export class LoginPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async login(username: string, password: string): Promise<void> {
        // Page interactions
    }
}
```

## 📝 Test Structure

Tests follow Playwright's test structure with descriptive names:

```typescript
test.describe('Test Suite Name', () => {
    test.beforeEach(async ({ page }) => {
        // Setup before each test
    });

    test('Test case description', async ({ page }) => {
        // Test implementation
        expect(result).toBeTruthy();
    });

    test.afterEach(async ({ page }) => {
        // Cleanup after each test
    });
});
```

## 🐛 Troubleshooting

### Tests failing with timeout errors
- Check if the application is accessible
- Increase timeout values in `playwright.config.ts`
- Verify network connectivity

### CSV data not loading
- Ensure CSV files are in the correct directory
- Check file encoding (should be UTF-8)
- Verify column names match the code

### Browser not found
```bash
npx playwright install
```

### Port conflicts with report server
```bash
npx playwright show-report --port=3000
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Zero Banking Demo](http://zero.webappsecurity.com)

## 👤 Author

Mithun Roy

## 📄 License

ISC License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on [GitHub Issues](https://github.com/contactmithuroy/playwright-typescript-ui-framework/issues)
- Check existing issues for solutions

---

**Last Updated**: February 2026  
**Framework Version**: 1.0.0  
**Playwright Version**: ^1.58.1
