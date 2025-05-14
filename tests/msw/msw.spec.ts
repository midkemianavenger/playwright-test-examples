import { test, expect } from '@playwright/test';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

const server = setupServer(...handlers);

test.beforeAll(() => server.listen());
test.afterAll(() => server.close());
test.afterEach(() => server.resetHandlers());

test.describe('MSW API Mocking Examples', () => {
  test('fetch user data', async ({ request }) => {
    const response = await request.get('https://api.example.com/users/1');
    const data = await response.json();
    
    expect(response.ok()).toBeTruthy();
    expect(data).toEqual({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    });
  });

  test('successful login', async ({ request }) => {
    const response = await request.post('https://api.example.com/auth/login', {
      data: {
        username: 'testuser',
        password: 'password123'
      }
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.token).toBe('mock-jwt-token');
    expect(data.user.username).toBe('testuser');
  });

  test('failed login', async ({ request }) => {
    const response = await request.post('https://api.example.com/auth/login', {
      data: {
        username: 'wronguser',
        password: 'wrongpass'
      }
    });

    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe('Unauthorized');
  });

  test('update user profile', async ({ request }) => {
    const userId = '123';
    const updates = {
      name: 'Updated Name',
      email: 'updated@example.com'
    };

    const response = await request.put(`https://api.example.com/users/${userId}`, {
      data: updates
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.name).toBe(updates.name);
    expect(data.email).toBe(updates.email);
    expect(data).toHaveProperty('updatedAt');
  });

  test('fetch products with query parameters', async ({ request }) => {
    const response = await request.get('https://api.example.com/products?category=electronics&limit=5');
    const data = await response.json();
    
    expect(response.ok()).toBeTruthy();
    expect(data.products).toHaveLength(5);
    expect(data.products[0]).toHaveProperty('category', 'electronics');
  });

  test('file upload simulation', async ({ request }) => {
    const formData = new FormData();
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    formData.append('file', file);

    const response = await request.post('https://api.example.com/upload', {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test content')
        }
      }
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.success).toBeTruthy();
    expect(data.filename).toBe('test.txt');
  });

  test('delete user - success case', async ({ request }) => {
    const response = await request.delete('https://api.example.com/users/123');
    expect(response.status()).toBe(204);
  });

  test('delete user - not found case', async ({ request }) => {
    const response = await request.delete('https://api.example.com/users/404');
    expect(response.status()).toBe(404);
    expect(response.statusText()).toBe('User not found');
  });

  test('partial update with PATCH', async ({ request }) => {
    const userId = '123';
    const updates = {
      name: 'Partially Updated Name'
    };

    const response = await request.patch(`https://api.example.com/users/${userId}`, {
      data: updates
    });

    const data = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(data.name).toBe(updates.name);
    expect(data.partiallyUpdated).toBeTruthy();
    expect(data).toHaveProperty('updatedAt');
  });

  test('dynamic response based on request', async ({ request }) => {
    // Test with different user IDs
    const responses = await Promise.all([
      request.get('https://api.example.com/users/1'),
      request.get('https://api.example.com/users/2'),
      request.get('https://api.example.com/users/3')
    ]);

    for (let i = 0; i < responses.length; i++) {
      const data = await responses[i].json();
      expect(data.id).toBe(`${i + 1}`);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('email');
    }
  });
});
