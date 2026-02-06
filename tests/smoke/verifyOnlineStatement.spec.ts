import { NavigationPage } from '../../pages/MainPages/NavigationPage';
import { OnlineStatementsPage } from '../../pages/MainPages/OnlineStatementPage';
import { OnlineStatementData } from '../../data-models/interfaces';
import { TestFactory } from '../factories/testFactory';
import { DownloadUtil } from '../../utils/downloadUtil';
import fs from 'fs';

TestFactory.createDataDrivenSuite<OnlineStatementData>(
    'Test:',
    'OnlineStatementData',
    async function (this: { page: any; expect: any }, data: OnlineStatementData, index: number) {
        const navigationPage = new NavigationPage(this.page);
        const onlineStatementsPage = new OnlineStatementsPage(this.page);

        console.log(`✅ Starting test: ${data.Account} - ${data.Year}`);

        // Navigate to the page
        if (data.SubMenu && data.SubMenu.trim()) {
            await navigationPage.navigationMenu(data.MainMenu, data.SubMenu);
        } else {
            await navigationPage.navigationMenu(data.MainMenu);
        }

        // Download the statement (returns file path)
        const filePath = await onlineStatementsPage.downloadStatement(data.Account, data.Year);

        console.log(`✅ Downloaded statement saved to: ${filePath}`);

        // Verify the file exists and has content
        const fileExists = fs.existsSync(filePath);
        (this.expect as any)(fileExists).toBe(true);

        if (fileExists) {
            const fileStats = fs.statSync(filePath);
            console.log(`✅ File size: ${fileStats.size} bytes`);
            (this.expect as any)(fileStats.size).toBeGreaterThan(0);
        }

        // Optional: Wait before cleanup
        await this.page.waitForTimeout(1000);

        // Delete the downloaded file
        await onlineStatementsPage.deleteDownloadedStatement(filePath);
        console.log(`✅ Test completed and cleaned up: ${data.Account} - ${data.Year}`);
    },
    {
        titleGenerator: (data, index) =>
            `${data.TestId}: ${data.TestTitle}`,
        useAuthentication: true,
    }
);