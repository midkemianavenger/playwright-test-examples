import { http, HttpResponse, delay } from 'msw';

interface LoginRequest {
  username: string;
  password: string;
}

interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export const handlers = [
  // Mock GET user endpoint
  http.get('https://api.example.com/users/:userId', async ({ params }) => {
    await delay(100); // Simulate network delay
    const { userId } = params;

    return HttpResponse.json({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    });
  }),

  // Mock POST authentication endpoint
  http.post('https://api.example.com/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest;
    
    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'user'
        }
      });
    }

    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized'
    });
  }),

  // Mock PUT update user endpoint
  http.put('https://api.example.com/users/:userId', async ({ request, params }) => {
    const body = await request.json() as UserUpdateRequest;
    const { userId } = params;

    return HttpResponse.json({
      id: userId,
      name: body.name,
      email: body.email,
      role: body.role,
      updatedAt: new Date().toISOString()
    });
  }),

  // Mock GET products with query parameters
  http.get('https://api.example.com/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = Number(url.searchParams.get('limit')) || 10;

    const products = Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      category: category || 'general',
      price: Math.floor(Math.random() * 100) + 1
    }));

    return HttpResponse.json({ products });
  }),

  // Mock POST file upload
  http.post('https://api.example.com/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'No file provided'
      });
    }

    return HttpResponse.json({
      success: true,
      filename: file instanceof File ? file.name : 'unknown',
      size: file instanceof File ? file.size : 0
    });
  }),

  // Mock DELETE endpoint with error scenario
  http.delete('https://api.example.com/users/:userId', ({ params }) => {
    const { userId } = params;

    if (userId === '404') {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'User not found'
      });
    }

    return new HttpResponse(null, {
      status: 204
    });
  }),

  // Mock PATCH endpoint
  http.patch('https://api.example.com/users/:userId', async ({ request, params }) => {
    const updates = await request.json() as UserUpdateRequest;
    const { userId } = params;

    return HttpResponse.json({
      id: userId,
      ...updates,
      partiallyUpdated: true,
      updatedAt: new Date().toISOString()
    });
  })
];
