import { test, expect } from '@playwright/test';

test.describe('Authentication Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
  });

  test('successful login flow', async ({ page }) => {
    // Example of testing a login flow
    await test.step('Navigate to login page', async () => {
      await page.goto('https://github.com/login');
      await expect(page).toHaveTitle(/Sign in to GitHub/);
    });

    // Note: Using demo credentials for illustration
    await test.step('Fill login form', async () => {
      await page.getByLabel('Username or email address').fill('test@example.com');
      await page.getByLabel('Password').fill('password123');
    });

    // Demonstrating form submission without actually submitting
    await test.step('Submit login form', async () => {
      // Comment out actual submission to avoid real login attempts
      // await page.getByRole('button', { name: 'Sign in' }).click();
      // await expect(page).toHaveURL(/github.com/);
    });
  });

  test('validate login error messages', async ({ page }) => {
    await page.goto('https://github.com/login');
    await page.getByLabel('Username or email address').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrong');
    
    // Example of error validation
    await test.step('Submit with invalid credentials', async () => {
      await page.getByRole('button', { name: 'Sign in' }).click();
      // Example assertion for error message
      await expect(page.getByText('Incorrect username or password.')).toBeVisible();
    });
  });
});
