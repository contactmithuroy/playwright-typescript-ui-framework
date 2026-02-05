import {expect } from '@playwright/test';
import { NavigationPage } from "@pages/MainPages/NavigationPage";
import { TestFactory } from "../factories/testFactory";
import { PurchaseForeignCurrencyData } from "../../data-models/interfaces";
import { PurchaseCurrencyPage } from '@pages/MainPages/PurchaseCurrencyPage';

TestFactory.createDataDrivenSuite<PurchaseForeignCurrencyData>(
    'Test:',
    'PurchaseForeignCurrencyData',
    async function (this: { page: any; expect: any }, data: PurchaseForeignCurrencyData, index: number) {
        const navigationPage = new NavigationPage(this.page);
        const purchaseCurrencyPage = new PurchaseCurrencyPage(this.page);

        if (data.SubMenu && data.SubMenu.trim()) {
            await navigationPage.navigationMenu(data.MainMenu, data.SubMenu);
        } else {
            await navigationPage.navigationMenu(data.MainMenu);
        }   

        await purchaseCurrencyPage.fillPurchaseCurrencyDetails(
            data.Currency,
            data.Amount,
            data.CurrencyInUSDorOthers  
        );  

        await purchaseCurrencyPage.submitPurchase();
        const isSuccess = await purchaseCurrencyPage.verifyPurchaseSuccess();
        expect(isSuccess).toBe(true);
    },

    {
        titleGenerator: (data, index) =>
            `${data.TestId}: ${data.TestTitle}`,
        useAuthentication: true,
    }
);