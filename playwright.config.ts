import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] || process.env['GEMINI_CLI'] ? 'list' : 'html',
  globalSetup: './tests/config/setup.ts',

  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:4200',
  },

  projects: [
    {
      name: 'brave',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/usr/bin/brave-browser',
        },
      },
    },
  ],
});