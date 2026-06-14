import { test, expect } from './config/fixtures';
import { credentials } from './config/credentials';

const ADMIN_EMAIL = credentials.admin.email;
const ADMIN_PASS = credentials.admin.password;
const USER_EMAIL = credentials.user.email;
const USER_PASS = credentials.user.password;

test.describe('Flujo de Autenticación y Redirección', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' });
  });

  test('Debería redirigir a /admin al iniciar sesión como Administrador', async ({ page }) => {
    await page.fill('input[formControlName="email"]', ADMIN_EMAIL);
    await page.fill('input[formControlName="contrasena"]', ADMIN_PASS);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/admin/);

    await expect(page.locator('h2')).toContainText('Panel de Administración', { timeout: 5000 });
  });

  test('Debería redirigir a / al iniciar sesión como Usuario Normal', async ({ page }) => {
    await page.fill('input[formControlName="email"]', USER_EMAIL);
    await page.fill('input[formControlName="contrasena"]', USER_PASS);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\//);
  });

  test('Debería mostrar error y mantenerse en /login con credenciales inválidas', async ({ page }) => {
    await page.fill('input[formControlName="email"]', 'no_existo@citadel.com');
    await page.fill('input[formControlName="contrasena"]', 'clave_falsa');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/login/);

    const errorMessage = page.locator('.bg-red-100');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Credenciales incorrectas');
  });

});