import { test, expect } from '@playwright/test';

test.describe('UI Interaction Examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
  });

  test('Drag and drop interaction', async ({ page }) => {
    // Create items for drag and drop
    await page.getByPlaceholder('What needs to be done?').fill('Item 1');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder('What needs to be done?').fill('Item 2');
    await page.keyboard.press('Enter');

    // Get the list items
    const items = await page.locator('.todo-list li');
    const firstItem = items.nth(0);
    const secondItem = items.nth(1);

    // Perform drag and drop
    await firstItem.dragTo(secondItem);

    // Verify the order has changed
    const newItems = await page.locator('.todo-list li').allInnerTexts();
    expect(newItems[0]).toBe('Item 2');
    expect(newItems[1]).toBe('Item 1');
  });

  test('Complex form interactions', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');

    await test.step('Fill personal information', async () => {
      await page.getByPlaceholder('First Name').fill('John');
      await page.getByPlaceholder('Last Name').fill('Doe');
      await page.getByPlaceholder('name@example.com').fill('john.doe@example.com');
      await page.getByText('Male').click();
      await page.getByPlaceholder('Mobile Number').fill('1234567890');
    });

    await test.step('Date picker interaction', async () => {
      await page.locator('#dateOfBirthInput').click();
      await page.selectOption('.react-datepicker__month-select', '0'); // January
      await page.selectOption('.react-datepicker__year-select', '1990');
      await page.click('.react-datepicker__day--001'); // Select 1st day
    });

    await test.step('File upload', async () => {
      // Example of file upload (commented out as it requires actual file)
      // await page.setInputFiles('input[type="file"]', 'path/to/file.jpg');
    });
  });

  test('Keyboard and mouse interactions', async ({ page }) => {
    await test.step('Keyboard shortcuts', async () => {
      await page.getByPlaceholder('What needs to be done?').fill('Task 1');
      await page.keyboard.press('Enter');
      
      // Select all text using keyboard shortcut
      await page.keyboard.press('Meta+A');
      // Copy text
      await page.keyboard.press('Meta+C');
      // Create new item and paste
      await page.getByPlaceholder('What needs to be done?').click();
      await page.keyboard.press('Meta+V');
      await page.keyboard.press('Enter');
    });

    await test.step('Mouse interactions', async () => {
      const firstItem = page.locator('.todo-list li').first();
      
      // Hover over item
      await firstItem.hover();
      
      // Double click to edit
      await firstItem.dblclick();
      
      // Right click (context menu)
      await firstItem.click({ button: 'right' });
    });
  });

  test('Visual comparison', async ({ page }) => {
    // Create a few todo items
    const todos = ['Buy groceries', 'Pay bills', 'Call mom'];
    for (const todo of todos) {
      await page.getByPlaceholder('What needs to be done?').fill(todo);
      await page.keyboard.press('Enter');
    }

    // Take screenshot of specific element
    await page.locator('.todo-list').screenshot({
      path: 'test-results/todo-list.png'
    });

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/full-page.png',
      fullPage: true
    });

    // Compare with baseline (requires baseline to be created first)
    await expect(page).toHaveScreenshot('todo-app.png');
  });

  test('Accessibility interactions', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('What needs to be done?')).toBeFocused();

    // Create todo using keyboard only
    await page.keyboard.type('New task');
    await page.keyboard.press('Enter');

    // Verify aria labels
    const todoItem = page.locator('.todo-list li').first();
    await expect(todoItem.locator('input[type="checkbox"]')).toHaveAttribute('aria-label', 'Toggle Todo');
  });

  test('Responsive design testing', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await expect(page).toHaveScreenshot('mobile-view.png');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await expect(page).toHaveScreenshot('tablet-view.png');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await expect(page).toHaveScreenshot('desktop-view.png');
  });
});
