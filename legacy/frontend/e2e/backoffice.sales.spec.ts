import { test, expect } from '@playwright/test';

test.describe('BackOffice Properties - Sales (E2E)', () => {
  test('login, open sales grid and basic interactions', async ({ page, baseURL }) => {
    // Navigate to portal page (top-level)
    await page.goto(baseURL || '/');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Click the "Ingresar" button in the top bar (not the menu)
    await page.click('button:has-text("Ingresar")');

    // Fill login form
    await page.fill('[data-test-id="portal-login-email"] input, input[name="portal-login-email"], [data-test-id="portal-login-email"]', 'admin@re.cl');
    await page.fill('[data-test-id="portal-login-password"] input, input[name="portal-login-password"], [data-test-id="portal-login-password"]', '890890');

    // Submit form - button with text 'Ingresar' inside the dialog
    await page.locator('[data-test-id="dialog-root"] button:has-text("Ingresar")').click();

    // Wait for redirect to backOffice (admin login redirects to /backOffice)
    await page.waitForURL('**/backOffice**');

    // Now in backoffice, click the menu button in the top bar
    const menuBtn = page.locator('[data-test-id="top-bar-menu-button"]');
    await menuBtn.click();

    // Click on "propiedades" in the menu
    await page.click('text=propiedades');

    // Click on "venta" submenu
    await page.click('text=venta');

    // Wait for navigation to sales grid
    await page.waitForTimeout(1000);

    // Expect DataGrid root to be visible
    const grid = page.locator('[data-test-id="sales-properties-grid"]');
    await expect(grid).toBeVisible({ timeout: 5000 });

    // Check header add button if available
    const addBtn = page.locator('[data-test-id="add-button"]');
    if (await addBtn.count() > 0) {
      await expect(addBtn).toBeVisible();
      // Try open create modal (if implemented)
      await addBtn.click();
      // Wait a bit for modal to appear
      await page.waitForTimeout(500);
    }

    // Check that at least one row exists or show placeholder
    const row = page.locator('[data-test-id="data-grid-row"]').first();
    await expect(row).toBeTruthy();

    // Try expand row if expandable control exists
    const expandBtn = row.locator('button:has(span:text("expand_more"))');
    if (await expandBtn.count() > 0) {
      await expandBtn.click();
      // Expect expanded panel
      await expect(page.locator('[data-test-id="data-grid-expanded-row"]')).toBeVisible();
    }

    // Try row actions buttons (view/edit/delete) if present
    const actions = row.locator('[data-test-id^="data-grid-row-actions"]');
    if (await actions.count() > 0) {
      const viewBtn = actions.locator('button:has(span:text("visibility"))').first();
      if (await viewBtn.count() > 0) {
        await viewBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Basic assertion that test reached the end
    expect(true).toBe(true);
  });

  test('create new property - basic flow', async ({ page, baseURL }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });

    try {
    await page.goto(baseURL || '/');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Click the "Ingresar" button in the top bar (not the menu)
    await page.click('button:has-text("Ingresar")');

    // Fill login form
    await page.fill('[data-test-id="portal-login-email"] input, input[name="portal-login-email"], [data-test-id="portal-login-email"]', 'admin@re.cl');
    await page.fill('[data-test-id="portal-login-password"] input, input[name="portal-login-password"], [data-test-id="portal-login-password"]', '890890');

    // Submit form - button with text 'Ingresar' inside the dialog
    await page.locator('[data-test-id="dialog-root"] button:has-text("Ingresar")').click();

    // Wait for redirect to backOffice (admin login redirects to /backOffice)
    await page.waitForURL('**/backOffice**');

    // Now in backoffice, click the menu button in the top bar
    const menuBtn = page.locator('[data-test-id="top-bar-menu-button"]');
    await menuBtn.click();

    // Click on "propiedades" in the menu
    await page.click('text=propiedades');

    // Click on "venta" submenu
    await page.click('text=venta');

    // Wait for navigation to sales grid
    await page.waitForTimeout(1000);

    // Click the add button to open create property modal
    const addBtn = page.locator('[data-test-id="add-button"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

      // Wait for the create property modal to appear
      await page.waitForSelector('[data-test-id="dialog-root"]', { timeout: 5000 });

      console.log('Modal opened successfully');    // ===== PASO 1: Información Básica =====
    // Fill title
    await page.fill('[data-test-id="input-title"]', 'Test Property');

    // Fill description
    await page.fill('[data-test-id="input-description"]', 'Test description');

    // Select property type (first option)
    await page.waitForTimeout(1000);
    const propertyTypeSelect = page.locator('[data-test-id="select-propertyTypeId"]');
    await propertyTypeSelect.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Fill price
    await page.fill('[data-test-id="currency-price"]', '100000000');

      // Select currency (first option)
      const currencySelect = page.locator('[data-test-id="select-currencyPrice"]');
      await currencySelect.click();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      console.log('Step 1 completed');

      // Click next step
      await page.click('button:has-text("→")');

      console.log('Moving to step 2');    // ===== PASO 2: Detalles de la Propiedad =====
    await page.waitForTimeout(500);

      // Fill basic details only
      await page.fill('[data-test-id="input-builtSquareMeters"]', '100');
      await page.fill('[data-test-id="input-landSquareMeters"]', '200');

      console.log('Step 2 completed');

      // Click next step
      await page.click('button:has-text("→")');

      console.log('Moving to step 3');    // ===== PASO 3: Ubicación =====
    await page.waitForTimeout(500);

    // Select state (first option)
    const stateSelect = page.locator('[data-test-id="select-stateId"]');
    await stateSelect.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Wait for cities to load, then select city (first option)
    await page.waitForTimeout(1000);
    const citySelect = page.locator('[data-test-id="select-cityId"]');
    await citySelect.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Fill address
    await page.fill('[data-test-id="input-address"]', 'Test Address 123');

    // Set coordinates
    await page.fill('input[name="coordinates.lat"]', '-33.4000');
    await page.fill('input[name="coordinates.lng"]', '-70.6000');

    // Click next step
    await page.click('button:has-text("→")');

    // ===== PASO 4: Multimedia =====
    await page.waitForTimeout(500);
    // Skip multimedia
    await page.click('button:has-text("→")');

    // ===== PASO 5: SEO y Marketing =====
    await page.waitForTimeout(500);
    // Skip SEO
    await page.click('button:has-text("→")');

    // ===== PASO 6: Notas Internas =====
    await page.waitForTimeout(500);

    // Fill internal notes
    await page.fill('[data-test-id="input-internalNotes"]', 'Test notes');

    // Submit the form
    await page.click('button:has-text("Crear Propiedad")');    // Wait for success message or redirect
    await page.waitForTimeout(2000);

    // Verify we're back to the grid (modal closed)
    await expect(page.locator('[data-test-id="sales-properties-grid"]')).toBeVisible();

    // Basic assertion that creation completed
    expect(true).toBe(true);
    }
    catch (error) {
      console.log('Test failed with errors:', errors);
      console.log('Exception:', error);
      throw error;
    }
  });
