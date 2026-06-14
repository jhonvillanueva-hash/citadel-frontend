import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(
      /https:\/\/(accounts\.google\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|js\.culqi\.com)\//,
      route => route.abort()
    );

    await use(context);
  },
});

export { expect };