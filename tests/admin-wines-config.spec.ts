import { test, expect } from "./config/fixtures";
import { credentials } from './config/credentials';

const ADMIN_EMAIL = credentials.admin.email;
const ADMIN_PASS = credentials.admin.password;

test.describe.configure({ mode: 'serial' });

test.describe('Admin Wines Configuration CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto('/login');

    await page.fill(
      'input[formControlName="email"]',
      ADMIN_EMAIL
    );

    await page.fill(
      'input[formControlName="contrasena"]',
      ADMIN_PASS
    );

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/admin/);
    await page.waitForLoadState('networkidle');

    // Navigate to Wines Config
    await page.goto('/admin/wines/config');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Configuraciones de Vinos', exact: true })).toBeVisible();
  });

  test.describe('Flavors (Sabores)', () => {
    const flavorName = `Test Flavor ${Date.now()}`;
    const updatedFlavorName = `${flavorName} Updated`;

    test('should create, edit and delete a flavor', async ({ page }) => {
      // Create
      const flavorSection = page
        .locator('section')
        .filter({ hasText: 'Sabores' });

      await flavorSection
        .locator('input[formControlName="nombre"]')
        .fill(flavorName);

      await flavorSection
        .locator('button[type="submit"]')
        .click();

      await expect(
        page.locator('text=Sabor creado')
      ).toBeVisible();

      await expect(
        flavorSection.locator('table')
      ).toContainText(flavorName);

      // Edit
      const row = flavorSection
        .locator('tr')
        .filter({ hasText: flavorName });

      await row.locator('button').first().click();

      await flavorSection
        .locator('input[formControlName="nombre"]')
        .fill(updatedFlavorName);

      await flavorSection
        .locator('button[type="submit"]')
        .click();

      await expect(
        page.locator('text=Sabor actualizado')
      ).toBeVisible();

      await expect(
        flavorSection.locator('table')
      ).toContainText(updatedFlavorName);

      // Delete
      await flavorSection
        .locator('tr')
        .filter({ hasText: updatedFlavorName })
        .locator('button')
        .last()
        .click();

      await page
        .locator('button')
        .filter({ hasText: 'Confirmar' })
        .click();

      await expect(
        page.locator('text=Sabor eliminado')
      ).toBeVisible();

      await expect(
        flavorSection.locator('table')
      ).not.toContainText(updatedFlavorName);
    });
  });

  test.describe('Sweets (Dulzores)', () => {
    const sweetName = `Test Sweet ${Date.now()}`;
    const updatedSweetName = `${sweetName} Updated`;

    test('should create, edit and delete a sweet', async ({ page }) => {
      // Create
      const sweetSection = page
        .locator('section')
        .filter({ hasText: 'Dulzores' });

      await sweetSection
        .locator('input[formControlName="nombre"]')
        .fill(sweetName);

      await sweetSection
        .locator('button[type="submit"]')
        .click();

      await expect(
        page.locator('text=Dulzor creado')
      ).toBeVisible();

      await expect(
        sweetSection.locator('table')
      ).toContainText(sweetName);

      // Edit
      const row = sweetSection
        .locator('tr')
        .filter({ hasText: sweetName });

      await row.locator('button').first().click();

      await sweetSection
        .locator('input[formControlName="nombre"]')
        .fill(updatedSweetName);

      await sweetSection
        .locator('button[type="submit"]')
        .click();

      await expect(
        page.locator('text=Dulzor actualizado')
      ).toBeVisible();

      await expect(
        sweetSection.locator('table')
      ).toContainText(updatedSweetName);

      // Delete
      await sweetSection
        .locator('tr')
        .filter({ hasText: updatedSweetName })
        .locator('button')
        .last()
        .click();

      await page
        .locator('button')
        .filter({ hasText: 'Confirmar' })
        .click();

      await expect(
        page.locator('text=Dulzor eliminado')
      ).toBeVisible();

      await expect(
        sweetSection.locator('table')
      ).not.toContainText(updatedSweetName);
    });
  });

  test.describe('Presentations (Presentaciones)', () => {
    const vol = 1234;
    const count = 12;
    const updatedVol = 4321;

    test(
      'should create, edit and delete a presentation',
      async ({ page }) => {
        // Create
        const presSection = page
          .locator('section')
          .filter({ hasText: 'Presentaciones' });

        await presSection
          .locator('input[formControlName="volumen_ml"]')
          .fill(vol.toString());

        await presSection
          .locator('input[formControlName="botellas_por_caja"]')
          .fill(count.toString());

        await presSection
          .locator('button[type="submit"]')
          .click();

        await expect(
          page.locator('text=Presentación creada')
        ).toBeVisible();

        await expect(
          presSection.locator('table')
        ).toContainText(`${vol} ml`);

        await expect(
          presSection.locator('table')
        ).toContainText(`${count} unid.`);

        // Edit
        const row = presSection
          .locator('tr')
          .filter({ hasText: `${vol} ml` });

        await row.locator('button').first().click();

        await presSection
          .locator('input[formControlName="volumen_ml"]')
          .fill(updatedVol.toString());

        await presSection
          .locator('button[type="submit"]')
          .click();

        await expect(
          page.locator('text=Presentación actualizada')
        ).toBeVisible();

        await expect(
          presSection.locator('table')
        ).toContainText(`${updatedVol} ml`);

        // Delete
        await presSection
          .locator('tr')
          .filter({ hasText: `${updatedVol} ml` })
          .locator('button')
          .last()
          .click();

        await page
          .locator('button')
          .filter({ hasText: 'Confirmar' })
          .click();

        await expect(
          page.locator('text=Presentación eliminada')
        ).toBeVisible();

        await expect(
          presSection.locator('table')
        ).not.toContainText(`${updatedVol} ml`);
      }
    );
  });
});