import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Smoke', () => {

    test('should open Playwright homepage error', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.goto();
        await homePage.assertLoaded();

        await expect(page.getByText('THIS SHOULD FAIL')).toBeVisible();
    });
});