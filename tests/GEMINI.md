# Playwright E2E Testing

## Purpose

This directory contains end-to-end tests for Citadel using Playwright.

Tests should validate real user behavior, navigation flows, authentication, authorization, form submissions, and critical business workflows.

Prefer testing observable behavior over implementation details.

---

## Project Configuration

- Test Runner: Playwright
- Base URL: `http://localhost:4200`
- Browser: Brave
- Reporter: HTML
- Global Setup: `tests/config/setup.ts`
- Shared Fixtures: `tests/config/fixtures.ts`

The database is automatically reset before the test suite executes.

---

## Shared Fixtures

All tests must import `test` and `expect` from the shared fixtures file instead of directly from Playwright:

```ts
import { test, expect } from './config/fixtures';
```

The shared fixture is responsible for common test setup, including:

- Blocking third-party requests that are not relevant to E2E validation.
- Providing a consistent browser context across tests.
- Centralizing reusable Playwright configuration.

Currently the fixture blocks requests to:

- `accounts.google.com`
- `fonts.googleapis.com`
- `fonts.gstatic.com`
- `js.culqi.com`

This improves test stability, speed, and isolation from third-party services.

Do not duplicate route interception logic inside individual test files unless a test requires additional custom behavior.

---

## Authentication

Always use credentials from:

```ts
import { credentials } from './config/credentials';
```

Examples:

```ts
const ADMIN_EMAIL = credentials.admin.email;
const ADMIN_PASS = credentials.admin.password;
```

Never hardcode:

- Emails
- Passwords
- Tokens

---

## Test Structure

Follow the existing project pattern:

```ts
import { test, expect } from '../config/fixtures';

test.describe('Feature Name', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/route', {
      waitUntil: 'load'
    });
  });

  test('Should perform expected behavior', async ({ page }) => {

  });

});
```

Use descriptive test names that explain the expected outcome.

Keep shared setup in fixtures whenever possible.

---

## Assertions

Prefer:

```ts
await expect(page).toHaveURL(...);

await expect(locator).toBeVisible();

await expect(locator).toContainText(...);
```

Avoid:

```ts
waitForTimeout(...);

setTimeout(...);
```

Rely on Playwright's automatic waiting whenever possible.

---

## Selectors

Preferred order:

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByTestId()`
5. CSS selectors

Example:

```ts
page.getByRole('button', {
  name: 'Iniciar sesión'
});
```

Only use CSS selectors when no better selector exists.

---

## Navigation Tests

When testing navigation flows:

1. Perform the user action.
2. Verify the URL.
3. Verify visible page content.

Example:

```ts
await page.click('button[type="submit"]');

await expect(page).toHaveURL(/.*\/admin/);

await expect(
  page.locator('h2')
).toContainText('Panel de Administración');
```

---

## Database Rules

The database is reset through:

```ts
tests/config/setup.ts
```

Tests should:

- Assume a clean initial state.
- Be independent.
- Not rely on execution order.
- Create their own required data when necessary.

---

## Authentication & Authorization

Important scenarios to cover:

- Successful login
- Failed login
- Logout
- Admin-only routes
- Authenticated routes
- Public routes
- Role-based redirections

---

## Test Writing Guidelines

- One behavior per test.
- Keep tests deterministic.
- Keep tests isolated.
- Avoid duplicated setup logic.
- Use `beforeEach()` only for test-specific setup.
- Prefer shared fixtures for reusable configuration.
- Verify both navigation and UI state.
- Keep tests readable and concise.

---

## AI Instructions

When generating Playwright tests:

- Import `test` and `expect` from the shared fixtures file.
- Follow patterns already present in this directory.
- Reuse shared credentials.
- Prefer semantic selectors.
- Avoid arbitrary waits.
- Use Playwright assertions.
- Validate user-visible outcomes.
- Keep tests maintainable and independent.
- Do not duplicate global route interception logic already defined in fixtures.