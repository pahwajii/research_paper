import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage.js';
import { credentials } from '../utils/testData.js';

test('User can log in and access the add paper page', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    const request = route.request();
    const body = JSON.parse(request.postData() || '{}');
    expect(body.email).toBe(credentials.email);
    expect(body.password).toBe(credentials.password);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'fake-token', user: { name: 'Test User', email: credentials.email } })
    });
  });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(credentials.email, credentials.password);
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
  await expect(page.getByText(/add research paper/i)).toBeVisible();
});
