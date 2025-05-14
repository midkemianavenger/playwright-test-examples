import { test as base, chromium, Browser, BrowserContext } from '@playwright/test';
import type { Page } from '@playwright/test';

// Extend base test fixture with custom properties
export type TestFixtures = {
  authenticatedPage: Page;
  mockApi: MockApiUtils;
  testUser: UserData;
};

// Define worker fixtures
export type WorkerFixtures = {
  sharedBrowser: Browser;
  globalConfig: AppConfig;
};

// Type definitions
type UserData = {
  username: string;
  password: string;
  token: string;
};

type AppConfig = {
  apiUrl: string;
  timeouts: {
    navigation: number;
    action: number;
  };
};

class MockApiUtils {
  constructor(private page: Page) {}

  async mockAuthResponse() {
    await this.page.route('**/api/auth', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ token: 'mock-jwt-token' })
      });
    });
  }

  async mockUserProfile() {
    await this.page.route('**/api/profile', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        })
      });
    });
  }
}

// Create test fixture with custom fixtures
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Define worker-level fixture for shared browser instance
  sharedBrowser: [async ({}, use) => {
    const browser = await chromium.launch();
    await use(browser);
    await browser.close();
  }, { scope: 'worker' }],

  // Define worker-level fixture for global config
  globalConfig: [async ({}, use) => {
    const config: AppConfig = {
      apiUrl: 'https://api.example.com',
      timeouts: {
        navigation: 30000,
        action: 5000
      }
    };
    await use(config);
  }, { scope: 'worker' }],

  // Test-level fixture for authenticated page
  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('https://example.com/login');
    await page.fill('[name="username"]', testUser.username);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await use(page);
  },

  // Test-level fixture for mock API utilities
  mockApi: async ({ page }, use) => {
    const mockApi = new MockApiUtils(page);
    await use(mockApi);
  },

  // Test-level fixture for test user data
  testUser: async ({}, use) => {
    const userData: UserData = {
      username: 'testuser',
      password: 'testpass123',
      token: 'mock-jwt-token'
    };
    await use(userData);
  },
});

// Export expect from the custom test
export { expect } from '@playwright/test';

// Example of using the fixtures:
test('example test with custom fixtures', async ({ 
  authenticatedPage, 
  mockApi, 
  testUser, 
  globalConfig 
}) => {
  // Mock API responses
  await mockApi.mockAuthResponse();
  await mockApi.mockUserProfile();

  // Navigate to protected route
  await authenticatedPage.goto(`${globalConfig.apiUrl}/dashboard`);

  // Use test user data
  await authenticatedPage.fill('#search', testUser.username);
});

// Example of a test group using fixtures
test.describe('Protected Routes', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.mockAuthResponse();
  });

  test('access protected content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/protected');
    await authenticatedPage.waitForSelector('#protected-content');
  });
});

// Example of using worker fixtures
test('use shared browser', async ({ sharedBrowser }) => {
  const context = await sharedBrowser.newContext();
  const page = await context.newPage();
  await page.goto('https://example.com');
  await context.close();
});
