# Playwright TypeScript Example Framework

A comprehensive test automation framework using Playwright with TypeScript, designed to help developers transition from C# backend testing to frontend testing.

## Documentation

- [Getting Started Guide (for C# developers)](docs/GETTING_STARTED.md)
- [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md)

## Features

- **E2E Tests**: End-to-end testing scenarios
  - Authentication flows
  - Form submissions
  - Error validations

- **API Tests**: Comprehensive API testing
  - REST API testing (GET, POST, PUT, DELETE)
  - Mock Service Worker (MSW) integration
  - Response validation
  - Error handling

- **UI Interaction Tests**: Advanced UI testing
  - Drag and drop operations
  - Form interactions
  - Keyboard/mouse events
  - Visual regression testing
  - Responsive design testing

- **Accessibility Testing**: Automated a11y checks
  - WCAG 2.0 and 2.1 compliance
  - Axe DevTools integration
  - Custom rule configurations
  - Detailed violation reporting

- **Network Tests**: Advanced request handling
  - Request mocking
  - Response interception
  - Network monitoring
  - MSW request handlers

- **Test Utilities**: Helper functions
  - Network request waiting
  - Element visibility checks
  - Action retrying
  - Screenshot capture
  - Storage management

## Project Structure

```
playwright-ts-examples/
├── tests/
│   ├── e2e/                  # End-to-end tests
│   ├── api/                  # API tests
│   ├── ui/                   # UI interaction tests
│   ├── network/             # Network mocking tests
│   ├── accessibility/       # Accessibility tests
│   ├── msw/                # Mock Service Worker tests
│   ├── fixtures/           # Custom fixtures
│   └── utils/              # Test utilities
├── config/
│   └── test-config.ts      # Configuration management
├── docs/
│   ├── GETTING_STARTED.md  # Guide for C# developers
│   └── ENVIRONMENT_SETUP.md # Environment configuration
├── .github/
│   └── workflows/          # GitHub Actions config
├── playwright.config.ts    # Playwright configuration
└── package.json           # Project dependencies
```

## Getting Started

1. **Installation**
   ```bash
   # Install dependencies
   npm install

   # Install Playwright browsers
   npx playwright install
   ```

2. **Environment Setup**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Update environment variables
   # See docs/ENVIRONMENT_SETUP.md for details
   ```

3. **Running Tests**
   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npx playwright test tests/e2e/auth.spec.ts

   # Run with UI mode
   npx playwright test --ui

   # Run with debug mode
   npx playwright test --debug
   ```

## Key Features

### 1. Environment Management
- Typed configuration with validation
- Environment-specific settings
- Secret management in GitHub Actions
- Automatic variable mapping

### 2. Mock Service Worker Integration
```typescript
test('mock API response', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: { username: 'test', password: 'pass' }
  });
  expect(response.ok()).toBeTruthy();
});
```

### 3. Accessibility Testing
```typescript
test('check accessibility', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### 4. Custom Test Fixtures
```typescript
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
    await logout(page);
  }
});
```

## CI/CD Integration

The framework includes a GitHub Actions workflow that:

1. **Parallel Execution**
   - Runs tests across multiple shards
   - Automatically distributes tests
   - Merges test results

2. **Environment Handling**
   - Automatic secrets mapping
   - Environment variable management
   - Configuration validation

3. **Reporting**
   - HTML test reports
   - Screenshots and videos
   - GitHub Pages deployment
   - Slack notifications

## Best Practices

1. **Code Organization**
   - Group tests by feature/type
   - Use page objects for UI interactions
   - Implement reusable utilities
   - Maintain type safety

2. **Test Independence**
   - Isolated test environments
   - Clean state between tests
   - Mock external dependencies
   - Handle async operations

3. **Error Handling**
   - Proper error messages
   - Retry mechanisms
   - Screenshot on failure
   - Detailed logging

4. **Performance**
   - Parallel execution
   - Resource cleanup
   - Efficient selectors
   - Conditional waiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Add tests
5. Submit a pull request

## Dependencies

- Playwright
- TypeScript
- Mock Service Worker
- Axe DevTools
- Zod
- dotenv

## License

MIT
