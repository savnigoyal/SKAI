// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Hostel Mess Management - Food Reviews & Quality Analytics (Savni Module)', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display Rate Today\'s Food screen with initial breakfast tab active', async ({ page }) => {
    // Verify main page title
    await expect(page.locator('h1')).toHaveText("Rate Today's Food");

    // Verify Breakfast tab is active
    const breakfastTab = page.getByTestId('tab-breakfast');
    await expect(breakfastTab).toHaveClass(/active/);

    // Verify Star Rating component is visible
    await expect(page.getByTestId('star-rating')).toBeVisible();

    // Verify Review Form Submit Button exists
    await expect(page.getByTestId('submit-review-btn')).toBeVisible();
  });

  test('should allow student to select star rating and update label', async ({ page }) => {
    // Click on 5th star
    const star5 = page.getByTestId('star-5');
    await star5.click();

    // Verify rating label is 'Excellent'
    const label = page.getByTestId('rating-label');
    await expect(label).toHaveText('Excellent');

    // Click on 3rd star
    const star3 = page.getByTestId('star-3');
    await star3.click();

    // Verify rating label updates to 'Good'
    await expect(label).toHaveText('Good');
  });

  test('should allow entering comments and enforce max length counter', async ({ page }) => {
    const textarea = page.getByTestId('comment-textarea');
    const comment = 'The breakfast poha was fresh and tasty, but tea could be warmer.';
    await textarea.fill(comment);

    // Verify character count updates
    await expect(page.locator('.textarea-footer')).toContainText(`${comment.length}/200`);
  });

  test('should switch between meal tabs (Breakfast, Lunch, Dinner)', async ({ page }) => {
    const lunchTab = page.getByTestId('tab-lunch');
    await lunchTab.click();
    await expect(lunchTab).toHaveClass(/active/);
    await expect(page.locator('.card-title')).toContainText('lunch');

    const dinnerTab = page.getByTestId('tab-dinner');
    await dinnerTab.click();
    await expect(dinnerTab).toHaveClass(/active/);
    await expect(page.locator('.card-title')).toContainText('dinner');
  });

  test('should navigate to Manager Food Reviews page and filter reviews', async ({ page }) => {
    // Navigate via sidebar
    await page.getByTestId('nav-manager-reviews').click();

    // Verify heading
    await expect(page.locator('h1')).toHaveText('Student Food Reviews');

    // Verify filter dropdowns exist
    await expect(page.getByTestId('filter-meal')).toBeVisible();
    await expect(page.getByTestId('filter-rating')).toBeVisible();
  });

  test('should navigate to Quality Analytics page and display metrics and timeframe filters', async ({ page }) => {
    // Navigate via sidebar
    await page.getByTestId('nav-analytics').click();

    // Verify heading
    await expect(page.locator('h1')).toHaveText('Food Quality Analytics');

    // Verify timeframe filters exist
    await expect(page.getByTestId('filter-last-7-days')).toBeVisible();
    await expect(page.getByTestId('filter-last-30-days')).toBeVisible();
    await expect(page.getByTestId('filter-custom-range')).toBeVisible();

    // Switching to 30 days
    await page.getByTestId('filter-last-30-days').click();
    await expect(page.getByTestId('filter-last-30-days')).toHaveClass(/active/);
  });

  test('should navigate to Student Dashboard preview and display menu and voting', async ({ page }) => {
    await page.getByTestId('nav-student-dashboard').click();
    await expect(page.locator('h1')).toContainText('Good Morning, Ananya');
    await expect(page.locator('.card-title').first()).toHaveText("Today's Menu");
  });

  test('should navigate to Manager Overview preview and display stats and charts', async ({ page }) => {
    await page.getByTestId('nav-manager-dashboard').click();
    await expect(page.locator('h1')).toContainText('Welcome, Mess Manager');
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });
});
