import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define configuration schema
const configSchema = z.object({
  // Base URLs
  BASE_URL: z.string().url(),
  API_URL: z.string().url(),

  // Authentication
  AUTH_USERNAME: z.string(),
  AUTH_PASSWORD: z.string(),
  AUTH_TOKEN: z.string().optional(),

  // API Keys
  API_KEY: z.string(),
  API_SECRET: z.string(),

  // Test Data
  TEST_USER_EMAIL: z.string().email(),
  TEST_USER_PASSWORD: z.string(),

  // External Services
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // Test Configuration
  HEADLESS: z.string().transform(val => val === 'true'),
  SCREENSHOT_ON_FAILURE: z.string().transform(val => val === 'true'),
  RETRY_COUNT: z.string().transform(val => parseInt(val, 10)),
  TIMEOUT: z.string().transform(val => parseInt(val, 10)),

  // Browser Configuration
  BROWSER: z.enum(['chromium', 'firefox', 'webkit']),
  VIEWPORT_WIDTH: z.string().transform(val => parseInt(val, 10)),
  VIEWPORT_HEIGHT: z.string().transform(val => parseInt(val, 10)),

  // Test Environment
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
});

// Helper function to get environment variables with type checking
function getConfig() {
  try {
    return configSchema.parse({
      // Base URLs
      BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
      API_URL: process.env.API_URL || 'http://localhost:3001',

      // Authentication
      AUTH_USERNAME: process.env.AUTH_USERNAME || 'test-user',
      AUTH_PASSWORD: process.env.AUTH_PASSWORD || 'test-pass',
      AUTH_TOKEN: process.env.AUTH_TOKEN,

      // API Keys
      API_KEY: process.env.API_KEY || 'default-key',
      API_SECRET: process.env.API_SECRET || 'default-secret',

      // Test Data
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'password123',

      // External Services
      SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
      SENTRY_DSN: process.env.SENTRY_DSN,

      // Test Configuration
      HEADLESS: process.env.HEADLESS || 'true',
      SCREENSHOT_ON_FAILURE: process.env.SCREENSHOT_ON_FAILURE || 'true',
      RETRY_COUNT: process.env.RETRY_COUNT || '3',
      TIMEOUT: process.env.TIMEOUT || '30000',

      // Browser Configuration
      BROWSER: process.env.BROWSER || 'chromium',
      VIEWPORT_WIDTH: process.env.VIEWPORT_WIDTH || '1280',
      VIEWPORT_HEIGHT: process.env.VIEWPORT_HEIGHT || '720',

      // Test Environment
      NODE_ENV: process.env.NODE_ENV || 'test',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      console.error(error.errors);
      process.exit(1);
    }
    throw error;
  }
}

// Export typed configuration
export const config = getConfig();

// Export type for use in tests
export type TestConfig = z.infer<typeof configSchema>;
