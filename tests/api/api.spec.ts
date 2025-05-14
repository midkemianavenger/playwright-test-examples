import { test, expect } from '@playwright/test';

test.describe('API Testing Examples', () => {
  const baseUrl = 'https://jsonplaceholder.typicode.com';

  test('GET request example', async ({ request }) => {
    const response = await request.get(`${baseUrl}/posts/1`);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body).toHaveProperty('id', 1);
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('body');
  });

  test('POST request with body', async ({ request }) => {
    const data = {
      title: 'New Post',
      body: 'This is a test post',
      userId: 1
    };

    const response = await request.post(`${baseUrl}/posts`, {
      data: data,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.title).toBe(data.title);
    expect(responseBody.body).toBe(data.body);
  });

  test('PUT request example', async ({ request }) => {
    const updatedData = {
      title: 'Updated Post',
      body: 'This post has been updated',
      userId: 1
    };

    const response = await request.put(`${baseUrl}/posts/1`, {
      data: updatedData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.title).toBe(updatedData.title);
  });

  test('DELETE request example', async ({ request }) => {
    const response = await request.delete(`${baseUrl}/posts/1`);
    expect(response.ok()).toBeTruthy();
  });

  test('Error handling - 404 Not Found', async ({ request }) => {
    const response = await request.get(`${baseUrl}/posts/999`);
    expect(response.status()).toBe(404);
  });

  test('Query parameters example', async ({ request }) => {
    const response = await request.get(`${baseUrl}/posts`, {
      params: {
        userId: '1',
        _limit: '5'
      }
    });

    expect(response.ok()).toBeTruthy();
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeLessThanOrEqual(5);
    expect(posts.every(post => post.userId === 1)).toBeTruthy();
  });

  test('Multiple requests in sequence', async ({ request }) => {
    // Get all posts by user
    const userResponse = await request.get(`${baseUrl}/posts`, {
      params: { userId: '1' }
    });
    const posts = await userResponse.json();

    // Get comments for first post
    const commentsResponse = await request.get(`${baseUrl}/posts/${posts[0].id}/comments`);
    const comments = await commentsResponse.json();

    expect(Array.isArray(comments)).toBeTruthy();
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty('email');
  });

  test('Response header validation', async ({ request }) => {
    const response = await request.get(`${baseUrl}/posts/1`);
    
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()['cache-control']).toBeTruthy();
  });
});
