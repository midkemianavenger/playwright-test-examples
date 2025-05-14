import { Page, Locator, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Waits for a specific network request to complete
   * @param urlPattern URL pattern to match
   * @param options Optional configuration
   */
  async waitForRequest(urlPattern: string, options: { timeout?: number } = {}): Promise<void> {
    await this.page.waitForResponse(
      response => response.url().includes(urlPattern),
      { timeout: options.timeout || 30000 }
    );
  }

  /**
   * Checks if an element is visible and scrolls it into view
   * @param selector Element selector
   */
  async ensureElementVisible(selector: string): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeVisible();
    return element;
  }

  /**
   * Retries an action until it succeeds or times out
   * @param action Action to retry
   * @param options Retry options
   */
  async retryAction<T>(
    action: () => Promise<T>,
    options: { maxAttempts?: number; interval?: number } = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts || 3;
    const interval = options.interval || 1000;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(interval);
        }
      }
    }

    throw new Error(`Action failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Waits for all network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Takes a screenshot with timestamp
   * @param name Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`
    });
  }

  /**
   * Clears browser storage (localStorage, sessionStorage, cookies)
   */
  async clearBrowserStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.context().clearCookies();
  }

  /**
   * Sets up request interception for specified URLs
   * @param urlPatterns URL patterns to intercept
   * @param handler Custom handler for intercepted requests
   */
  async setupRequestInterception(
    urlPatterns: string[],
    handler: (route: any, request: any) => Promise<void>
  ): Promise<void> {
    for (const pattern of urlPatterns) {
      await this.page.route(pattern, handler);
    }
  }

  /**
   * Checks if page has console errors
   * @returns boolean indicating if errors were found
   */
  async checkConsoleErrors(): Promise<boolean> {
    let hasErrors = false;
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        hasErrors = true;
        console.error(`Console Error: ${msg.text()}`);
      }
    });
    return hasErrors;
  }

  /**
   * Waits for an element and performs action
   * @param selector Element selector
   * @param action Action to perform
   */
  async waitAndAct(selector: string, action: (element: Locator) => Promise<void>): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    await action(element);
  }

  /**
   * Sets up mobile viewport and user agent
   * @param deviceName Name of the device to emulate
   */
  async setupMobileEmulation(deviceName: string): Promise<void> {
    const devices: Record<string, { viewport: { width: number; height: number }; userAgent: string }> = {
      'iPhone12': {
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
      },
      'Pixel5': {
        viewport: { width: 393, height: 851 },
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36'
      }
    };

    const device = devices[deviceName];
    if (!device) {
      throw new Error(`Device ${deviceName} not found in device configurations`);
    }

    await this.page.setViewportSize(device.viewport);
    await this.page.setExtraHTTPHeaders({
      'User-Agent': device.userAgent
    });
  }

  /**
   * Verifies accessibility for current page
   * @param options Accessibility check options
   */
  async checkAccessibility(options: { 
    includeLabels?: boolean;
    includeAltText?: boolean;
  } = {}): Promise<void> {
    if (options.includeLabels) {
      const inputs = this.page.locator('input:not([type="hidden"])');
      const inputsCount = await inputs.count();
      
      for (let i = 0; i < inputsCount; i++) {
        const input = inputs.nth(i);
        const hasLabel = await input.evaluate(el => {
          const id = el.id;
          return id ? !!document.querySelector(`label[for="${id}"]`) : false;
        });
        expect(hasLabel, `Input ${await input.getAttribute('name')} should have a label`).toBeTruthy();
      }
    }

    if (options.includeAltText) {
      const images = this.page.locator('img');
      const imagesCount = await images.count();

      for (let i = 0; i < imagesCount; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        expect(alt, 'Image should have alt text').toBeTruthy();
      }
    }
  }
}

// Example usage:
/*
const utils = new TestUtils(page);

// Retry clicking an element
await utils.retryAction(async () => {
  await page.click('#submit-button');
});

// Wait for network request and check visibility
await utils.waitForRequest('/api/data');
await utils.ensureElementVisible('#results');

// Mobile testing
await utils.setupMobileEmulation('iPhone12');
await utils.checkAccessibility({ includeLabels: true, includeAltText: true });
*/
