// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Hostel Mess Management - Inventory & Food Waste Analytics Module (Shatakshi)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the local server
    await page.goto('/');
  });

  test('1. Dashboard loads successfully with manager title and KPI cards', async ({ page }) => {
    // Check page title and brand header
    await expect(page).toHaveTitle(/Hostel Mess Management/);
    await expect(page.locator('.brand-title')).toContainText('Hostel Mess Management System');
    await expect(page.locator('.badge-owner')).toContainText('Lead: Shatakshi');

    // Verify KPI summary metrics are present and non-empty
    const totalItems = page.locator('#kpi-total-items');
    await expect(totalItems).toBeVisible();
    await expect(totalItems).not.toHaveText('0'); // Should have seeded items > 0

    const lowStock = page.locator('#kpi-low-stock');
    await expect(lowStock).toBeVisible();

    const totalWaste = page.locator('#kpi-total-waste');
    await expect(totalWaste).toBeVisible();
    await expect(totalWaste).toContainText('kg');

    const totalCost = page.locator('#kpi-total-cost');
    await expect(totalCost).toBeVisible();
    await expect(totalCost).toContainText('₹');
  });

  test('2. Inventory Store displays list of items and highlights Low Stock warning', async ({ page }) => {
    // Switch to Inventory tab
    await page.click('#tab-btn-inventory');
    await expect(page.locator('#tab-inventory')).toBeVisible();

    // Verify inventory table has seeded items (e.g., Basmati Rice, Moong Dal)
    const table = page.locator('#inventory-table');
    await expect(table).toBeVisible();
    await expect(page.locator('#inventory-tbody')).toContainText('Basmati Rice');
    await expect(page.locator('#inventory-tbody')).toContainText('Moong Dal');

    // Verify low stock badge exists for items below threshold
    const lowStockBadges = page.locator('.badge-low-stock');
    await expect(lowStockBadges.first()).toBeVisible();
  });

  test('3. Add a new inventory item and verify it is rendered', async ({ page }) => {
    await page.click('#tab-btn-inventory');
    
    // Open Add Item modal
    await page.click('#btn-open-add-item');
    await expect(page.locator('#modal-item')).toHaveClass(/open/);

    // Fill form
    const uniqueItemName = `Test Poha Seeds ${Date.now()}`;
    await page.fill('#item-name', uniqueItemName);
    await page.selectOption('#item-category', 'Grains');
    await page.selectOption('#item-unit', 'kg');
    await page.fill('#item-quantity', '45');
    await page.fill('#item-threshold', '15');
    await page.fill('#item-price', '65');
    await page.fill('#item-supplier', 'Agro Test Supply Co.');

    // Submit form
    await page.click('#btn-save-item');

    // Modal should close and item should be in table
    await expect(page.locator('#modal-item')).not.toHaveClass(/open/);
    await expect(page.locator('#inventory-tbody')).toContainText(uniqueItemName);
  });

  test('4. Adjust stock quantity (Restock) and verify update', async ({ page }) => {
    await page.click('#tab-btn-inventory');

    // Click Adjust on the first item in the table
    const firstAdjustBtn = page.locator('#inventory-tbody tr:first-child button:has-text("Adjust")');
    await firstAdjustBtn.click();

    // Verify adjust modal is open
    await expect(page.locator('#modal-adjust')).toHaveClass(/open/);

    // Restock with +20 units
    await page.selectOption('#adjust-action', 'RESTOCK');
    await page.fill('#adjust-qty', '20');
    await page.fill('#adjust-reason', 'Playwright automated restock test');

    await page.click('#btn-confirm-adjust');

    // Verify modal closes and toast appears
    await expect(page.locator('#modal-adjust')).not.toHaveClass(/open/);
    await expect(page.locator('.toast.success')).toBeVisible();

    // Check movements log tab to verify audit trail
    await page.click('#tab-btn-movements');
    await expect(page.locator('#movements-tbody')).toContainText('Playwright automated restock test');
  });

  test('5. Log new food waste record and verify it reflects in waste table and stats', async ({ page }) => {
    // Switch to Waste tab
    await page.click('#tab-btn-waste');
    await expect(page.locator('#tab-waste')).toBeVisible();

    // Open Log Waste modal
    await page.click('#btn-open-log-waste');
    await expect(page.locator('#modal-waste')).toHaveClass(/open/);

    const testDish = `Dinner Kadhai Paneer ${Date.now()}`;
    await page.selectOption('#waste-meal', 'Dinner');
    await page.fill('#waste-dish', testDish);
    await page.fill('#waste-qty', '7.5');
    await page.fill('#waste-cost', '650');
    await page.selectOption('#waste-reason-select', 'Plate Leftovers');
    await page.fill('#waste-notes', 'Tested via Playwright test runner');

    // Submit
    await page.click('#btn-save-waste');

    // Modal closes & new waste row appears in table
    await expect(page.locator('#modal-waste')).not.toHaveClass(/open/);
    await expect(page.locator('#waste-tbody')).toContainText(testDish);
    await expect(page.locator('#waste-tbody')).toContainText('7.5 kg');
  });

  test('6. Filter food waste table by meal type', async ({ page }) => {
    await page.click('#tab-btn-waste');

    // Filter by 'Breakfast'
    await page.selectOption('#waste-meal-filter', 'Breakfast');

    // Wait for filtered records
    await page.waitForTimeout(300);

    // Table rows should only contain Breakfast badges
    const mealBadges = page.locator('#waste-tbody .badge-category');
    const count = await mealBadges.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(mealBadges.nth(i)).toHaveText('Breakfast');
    }
  });

  test('7. Validation error handling: cannot submit empty item name or negative quantity', async ({ page }) => {
    await page.click('#tab-btn-inventory');
    await page.click('#btn-open-add-item');

    // Attempt to submit with empty name
    await page.fill('#item-name', '');
    await page.click('#btn-save-item');

    // The HTML5 validation will keep modal open
    await expect(page.locator('#modal-item')).toHaveClass(/open/);
  });

});
