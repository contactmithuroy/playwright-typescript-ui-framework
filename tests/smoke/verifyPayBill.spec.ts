import { NavigationPage } from "@pages/MainPages/NavigationPage";
import { PayBillPage } from "@pages/MainPages/PayBillPage";
import { TestFactory } from "../factories/testFactory";
import { PayBillsData } from "../../data-models/interfaces";
import { test } from "../fixtures/customFixtures";

TestFactory.createDataDrivenSuite<PayBillsData>(
    'Test:',
    'PayBillsData',
    async function (this: { page: any; expect: any }, data: PayBillsData, index: number) {
        const navigationPage = new NavigationPage(this.page);
        const payBillPage = new PayBillPage(this.page);

        if (data.SubMenu && data.SubMenu.trim()) {
            await navigationPage.navigationMenu(data.MainMenu, data.SubMenu);
        } else {
            await navigationPage.navigationMenu(data.MainMenu);
        }

        await payBillPage.fillPayBillDetails(
            data.Payee,
            data.Account,
            data.Amount,
            data.Date,
            data.Description
        );

        await payBillPage.submitPayment();
        await payBillPage.verifyPayBillSuccess();
    },
    {
        titleGenerator: (data, index) =>
            `${data.TestId}: ${data.TestTitle}`,
        useAuthentication: true,
    }
);