# Getting Started with Playwright (For C# Developers)

This guide is designed to help developers transitioning from C# backend testing to TypeScript frontend testing with Playwright.

## Key Differences from C# Testing

### 1. Asynchronous vs Synchronous
```typescript
// C# style
[Test]
public void TestMethod()
{
    var result = GetData();
    Assert.That(result, Is.EqualTo(expected));
}

// TypeScript/Playwright style
test('example test', async ({ page }) => {
    const result = await page.getByText('Submit').click();
    await expect(page.locator('.status')).toHaveText('Success');
});
```

### 2. Type System Differences
```typescript
// TypeScript interface (similar to C# interface)
interface UserData {
    id: number;          // Similar to C# 'int'
    name: string;        // Similar to C# 'string'
    email?: string;      // Optional property (similar to C# 'string?')
    roles: string[];     // Array (similar to C# 'string[]')
}

// Type assertions (similar to C# casting)
const userData = response.json() as UserData;
```

### 3. Promise Handling
```typescript
// C# Task handling
public async Task<string> GetDataAsync()
{
    var result = await httpClient.GetAsync(url);
    return await result.Content.ReadAsStringAsync();
}

// TypeScript Promise handling
async function getData(): Promise<string> {
    const response = await fetch(url);
    return await response.text();
}
```

## Common Patterns

### 1. Page Object Model (Similar to C# Selenium Tests)

```typescript
// C# style Page Object
public class LoginPage
{
    private readonly IWebElement usernameField;
    
    public LoginPage(IWebDriver driver)
    {
        usernameField = driver.FindElement(By.Id("username"));
    }
    
    public void EnterUsername(string username)
    {
        usernameField.SendKeys(username);
    }
}

// Playwright style Page Object
class LoginPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async enterUsername(username: string) {
        await this.page.getByLabel('Username').fill(username);
    }

    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.page.getByLabel('Password').fill(password);
        await this.page.getByRole('button', { name: 'Login' }).click();
    }
}
```

### 2. Test Fixtures (Similar to C# TestFixture)

```typescript
// C# style setup
[TestFixture]
public class TestClass
{
    private WebDriver driver;
    
    [SetUp]
    public void Setup()
    {
        driver = new ChromeDriver();
    }
}

// Playwright style fixture
const test = base.extend<{ loginPage: LoginPage }>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
    }
});
```

## Common TypeScript Patterns for Testing

### 1. Type Guards (Similar to C# is operator)
```typescript
// C# style type checking
if (response is ApiResponse apiResponse)
{
    Console.WriteLine(apiResponse.Data);
}

// TypeScript type guard
function isApiResponse(response: any): response is ApiResponse {
    return 'data' in response && 'status' in response;
}

if (isApiResponse(response)) {
    console.log(response.data);
}
```

### 2. Async/Await with Locators
```typescript
// Waiting for elements (similar to C# WebDriverWait)
// C# style
var element = wait.Until(driver => driver.FindElement(By.Id("myElement")));

// Playwright style
const element = page.locator('#myElement');
await element.waitFor({ state: 'visible' });
await element.click();
```

### 3. API Testing Patterns
```typescript
// Similar to C# HttpClient tests
test('API test example', async ({ request }) => {
    const response = await request.post('/api/users', {
        data: {
            name: 'John Doe',
            email: 'john@example.com'
        }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
});
```

## Debugging Tips

### 1. Using Debug Mode
```bash
# Similar to C# debugging in Visual Studio
npx playwright test --debug
```

### 2. Adding Break Points
```typescript
// C# style debugging
Debug.WriteLine("Debug message");

// Playwright debugging
await page.pause(); // Opens Playwright Inspector
console.log('Debug message');
```

### 3. Visual Studio Code Integration
- Install "Playwright Test for VSCode" extension
- Add launch configurations for debugging
- Use the test explorer

## Common Gotchas for C# Developers

1. **Async/Await Everywhere**
   - Almost all Playwright operations are asynchronous
   - Don't forget to await all promises
   ```typescript
   // Wrong
   page.click('.button');
   
   // Correct
   await page.click('.button');
   ```

2. **Type Inference**
   - TypeScript can infer types (unlike C# where types are more explicit)
   ```typescript
   // C# style
   string name = "John";
   
   // TypeScript style
   const name = "John"; // Type is inferred
   ```

3. **Promise Chains**
   - Avoid nested promises (use async/await)
   ```typescript
   // Wrong
   page.click('.button').then(() => {
       page.fill('input', 'text').then(() => {
           // ...
       });
   });
   
   // Correct
   await page.click('.button');
   await page.fill('input', 'text');
   ```

## Best Practices

1. **Use Strong Typing**
   ```typescript
   // Define interfaces for your data
   interface UserResponse {
       id: number;
       name: string;
       roles: string[];
   }
   
   test('fetch user', async ({ request }) => {
       const response = await request.get('/api/user/1');
       const user = await response.json() as UserResponse;
       expect(user.roles).toContain('admin');
   });
   ```

2. **Organize Tests Logically**
   ```typescript
   test.describe('User Management', () => {
       test.describe('Authentication', () => {
           test('successful login', async ({ page }) => {
               // ...
           });
           
           test('failed login', async ({ page }) => {
               // ...
           });
       });
   });
   ```

3. **Reuse Test Context**
   ```typescript
   test.beforeEach(async ({ context }) => {
       // Similar to C# TestInitialize
       await context.addCookies([/* ... */]);
   });
   ```

## Common Testing Scenarios

### 1. Form Submissions
```typescript
test('submit form', async ({ page }) => {
    await page.getByLabel('Name').fill('John Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    await expect(page.getByText('Success')).toBeVisible();
});
```

### 2. API Integration
```typescript
test('integrate with API', async ({ request }) => {
    const response = await request.post('/api/data', {
        data: { key: 'value' }
    });
    
    expect(response.status()).toBe(200);
});
```

### 3. Dynamic Content
```typescript
test('handle dynamic content', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for dynamic content
    await expect(page.getByRole('table')).toBeVisible();
    
    // Verify data loading
    const rows = page.getByRole('row');
    await expect(rows).toHaveCount(5);
});
```

## Additional Resources

1. TypeScript Fundamentals:
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
   - [TypeScript for C# Developers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html)

2. Playwright Documentation:
   - [Getting Started](https://playwright.dev/docs/intro)
   - [API Reference](https://playwright.dev/docs/api/class-playwright)
   - [Test Generator](https://playwright.dev/docs/codegen)

3. Testing Best Practices:
   - [Playwright Testing Guide](https://playwright.dev/docs/test-assertions)
   - [Test Isolation](https://playwright.dev/docs/test-isolation)
   - [Debugging Tests](https://playwright.dev/docs/debug)

Remember: The key to successful testing with Playwright is understanding its asynchronous nature and utilizing TypeScript's type system effectively. Take advantage of Playwright's built-in waiting mechanisms and robust selector engines.
