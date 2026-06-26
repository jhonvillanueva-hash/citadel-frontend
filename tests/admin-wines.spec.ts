import { test, expect } from './config/fixtures';
import { credentials } from './config/credentials';
import path from 'path';

const ADMIN_EMAIL = credentials.admin.email;
const ADMIN_PASS = credentials.admin.password;

test.describe.configure({ mode: 'serial' });

test.describe('Admin Wines CRUD', () => {

  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.fill('input[formControlName="email"]', ADMIN_EMAIL);
    await page.fill('input[formControlName="contrasena"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('should create, edit and delete a wine', async ({ page }) => {
    test.setTimeout(60000);

    const successToast = page.locator('.bg-green-800');
    const errorToast = page.locator('.bg-red-800');
    const toast = successToast.or(errorToast).last();
    
    const wineName = `Wine Test ${Date.now()}`;
    const updatedWineName = `${wineName} Updated`;
    const sku = `SKU-${Date.now()}`;
    
    // 1. Create dependencies
    await page.goto('/admin/wines/config');
    await expect(page.getByRole('heading', { name: 'Configuraciones de Vinos' })).toBeVisible();
    
    // Add Flavor
    const flavorSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Sabores' }) });
    await flavorSection.locator('input[formControlName="nombre"]').fill(`Flavor ${wineName}`);
    await flavorSection.locator('button[type="submit"]').click();
    await expect(page.locator('.bg-green-800').filter({ hasText: 'Sabor creado' }).or(errorToast)).toBeVisible({ timeout: 15000 });
    
    // Add Sweet
    const sweetSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Dulzores' }) });
    await sweetSection.locator('input[formControlName="nombre"]').fill(`Sweet ${wineName}`);
    await sweetSection.locator('button[type="submit"]').click();
    await expect(page.locator('.bg-green-800').filter({ hasText: 'Dulzor creado' }).or(errorToast)).toBeVisible({ timeout: 15000 });

    // Add Presentation
    const presSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Presentaciones' }) });
    await presSection.locator('input[formControlName="volumen_ml"]').fill('750');
    await presSection.locator('input[formControlName="botellas_por_caja"]').fill('6');
    await presSection.locator('button[type="submit"]').click();
    await expect(page.locator('.bg-green-800').filter({ hasText: 'Presentación creada' }).or(errorToast)).toBeVisible({ timeout: 15000 });

    // 2. Navigate to Create Wine
    await page.goto('/admin/wines/create');
    await expect(page.getByRole('heading', { name: 'Registro de Vino' })).toBeVisible();
    
    await page.getByPlaceholder('Ej: VINO-001').fill(sku);
    await page.getByPlaceholder('Nombre del producto').fill(wineName);
    await page.getByPlaceholder('0', { exact: true }).fill('100');
    await page.getByPlaceholder('Notas de cata, origen, maridaje...').fill('Test description');
    
    await page.locator('select').nth(0).selectOption({ label: `Flavor ${wineName}` });
    await page.locator('select').nth(1).selectOption({ label: `Sweet ${wineName}` });
    await page.locator('select').nth(2).selectOption({ label: '750 ml - 6 uds/caja' });

    await page.getByPlaceholder('Precio base por unidad').fill('50');
    await page.locator('input[type="file"]').first().setInputFiles(path.join(__dirname, 'assets/test-image.png'));

    await page.getByRole('button', { name: 'Registrar Vino' }).click();
    await expect(page.locator('.bg-green-800').filter({ hasText: 'Vino registrado correctamente' }).or(errorToast)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/.*\/admin\/wines/);

    // 3. Edit Wine
    const wineCard = page.locator('div.bg-white').filter({ has: page.locator('h3', { hasText: wineName }) });
    await expect(wineCard).toBeVisible();
    await wineCard.getByRole('link', { name: 'Editar' }).click();
    
    await expect(page.getByRole('heading', { name: 'Editar Vino' })).toBeVisible();
    const nameInput = page.getByPlaceholder('Nombre del producto');
    await expect(nameInput).not.toHaveValue('', { timeout: 10000 });
    await nameInput.fill(updatedWineName);
    await page.keyboard.press('Tab');
    
    await page.getByRole('button', { name: 'Actualizar Vino' }).click();
    await expect(page.locator('.bg-green-800').filter({ hasText: 'Vino actualizado correctamente' }).or(errorToast)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/.*\/admin\/wines/);

    // 4. Delete Wine
    const updatedWineCard = page.locator('div.bg-white').filter({ has: page.locator('h3', { hasText: updatedWineName }) });
    await expect(updatedWineCard).toBeVisible();
    await updatedWineCard.getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    
    await expect(page.locator('.bg-green-800').filter({ hasText: 'Vino eliminado' }).or(errorToast)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(updatedWineName)).not.toBeVisible();
  });

});
