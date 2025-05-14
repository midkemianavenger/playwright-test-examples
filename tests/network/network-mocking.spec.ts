import { test, expect } from '@playwright/test';

test.describe('Network Mocking and Interception Examples', () => {
  test('Mock API response', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/users', async route => {
      const mockedData = {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ]
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockedData)
      });
    });

    // Navigate to page and verify mocked data
    await page.goto('https://example.com');
    const responseData = await page.evaluate(() => 
      fetch('/api/users').then(r => r.json())
    );
    expect(responseData.users).toHaveLength(2);
    expect(responseData.users[0].name).toBe('John Doe');
  });

  test('Simulate network error', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/data', route => 
      route.abort('failed')
    );

    // Verify error handling
    const response = await page.evaluate(() => 
      fetch('/api/data')
        .then(r => 'success')
        .catch(e => 'error')
    );
    expect(response).toBe('error');
  });

  test('Modify request headers', async ({ page }) => {
    await page.route('**/api/protected', async route => {
      const headers = {
        ...route.request().headers(),
        'Authorization': 'Bearer mock-token',
        'Custom-Header': 'test-value'
      };
      await route.continue({ headers });
    });

    // Verify modified headers
    const headers = await page.evaluate(() => 
      fetch('/api/protected').then(r => 
        Object.fromEntries(r.headers)
      )
    );
    expect(headers['custom-header']).toBe('test-value');
  });

  test('Mock different HTTP methods', async ({ page }) => {
    // Mock POST request
    await page.route('**/api/create', async route => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...requestBody, id: 123 })
      });
    });

    // Mock DELETE request
    await page.route('**/api/delete/*', async route => {
      await route.fulfill({
        status: 204
      });
    });

    // Test POST request
    const createResponse = await page.evaluate(() =>
      fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Item' })
      }).then(r => r.json())
    );
    expect(createResponse.id).toBe(123);
    expect(createResponse.name).toBe('New Item');

    // Test DELETE request
    const deleteResponse = await page.evaluate(() =>
      fetch('/api/delete/123', { method: 'DELETE' })
    );
    expect(deleteResponse.status).toBe(204);
  });

  test('Conditional response mocking', async ({ page }) => {
    await page.route('**/api/items/**', async route => {
      const url = route.request().url();
      const itemId = url.split('/').pop();

      if (itemId === '404') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Item not found' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: itemId, name: `Item ${itemId}` })
        });
      }
    });

    // Test successful response
    const successResponse = await page.evaluate(() =>
      fetch('/api/items/123').then(r => r.json())
    );
    expect(successResponse.name).toBe('Item 123');

    // Test error response
    const errorResponse = await page.evaluate(() =>
      fetch('/api/items/404').then(r => r.json())
    );
    expect(errorResponse.error).toBe('Item not found');
  });

  test('Mock response with delay', async ({ page }) => {
    await page.route('**/api/slow-endpoint', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'Delayed response' })
      });
    });

    const startTime = Date.now();
    const response = await page.evaluate(() =>
      fetch('/api/slow-endpoint').then(r => r.json())
    );
    const endTime = Date.now();

    expect(response.data).toBe('Delayed response');
    expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
  });

  test('Network request monitoring', async ({ page }) => {
    const requests: string[] = [];
    const responses: number[] = [];

    // Monitor network requests
    page.on('request', request => requests.push(request.url()));
    page.on('response', response => responses.push(response.status()));

    await page.goto('https://example.com');

    expect(requests.length).toBeGreaterThan(0);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses).toContain(200);
  });
});
