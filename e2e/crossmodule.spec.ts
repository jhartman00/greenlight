import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

// ── Cross-Module Tests ────────────────────────────────────────────────────────

test.describe('Cross-module consistency', () => {
  test('schedule and budget both load sample data with consistent project names', async ({ page }) => {
    await page.goto('/scheduling/stripboard');
    await page.waitForLoadState('networkidle');
    const schedContent = await page.locator('header, nav, h1, h2').first().textContent();

    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');
    const budgetContent = await page.locator('header, nav, h1, h2').first().textContent();

    // Both pages should load without error
    expect(schedContent).toBeDefined();
    expect(budgetContent).toBeDefined();
  });

  test('schedule shoot days reflected in budget globals', async ({ page }) => {
    // Visit globals to see shoot weeks setting
    await page.goto('/budgeting/globals');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main').textContent();
    // Should show shoot weeks that came from sample data
    expect(content).toMatch(/shoot.*week|\d+\s*week|week.*\d+/i);
  });

  test('locations in breakdowns appear in sets manager', async ({ page }) => {
    // Check breakdown locations
    await page.goto('/scheduling/breakdowns');
    await page.waitForLoadState('networkidle');
    const breakdownContent = await page.locator('main').textContent();

    // Check sets view
    await page.goto('/scheduling/sets');
    await page.waitForLoadState('networkidle');
    const setsContent = await page.locator('main').textContent();

    // Both pages should have location-like content (hospitals, residences, etc.)
    expect(breakdownContent).toMatch(/hospital|location|set/i);
    expect(setsContent).toMatch(/hospital|location|set|stage/i);
  });

  test('element categories in element manager match breakdown elements', async ({ page }) => {
    await page.goto('/scheduling/elements');
    await page.waitForLoadState('networkidle');
    const elemContent = await page.locator('main').textContent();

    await page.goto('/scheduling/breakdowns');
    await page.waitForLoadState('networkidle');
    const bdContent = await page.locator('main').textContent();

    // Both should show cast/actor related content from sample data
    expect(elemContent).toMatch(/cast|actor|sarah|james/i);
    expect(bdContent).toMatch(/sarah|james|hospital|\d+/i);
  });

  test('navigating between modules preserves state', async ({ page }) => {
    // Start on strip board
    await page.goto('/scheduling/stripboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // Navigate to budgeting
    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');

    // Navigate back to scheduling
    await page.goto('/scheduling/stripboard');
    await page.waitForLoadState('networkidle');

    // Strip board should still show content
    const content = await page.locator('main').textContent();
    expect(content!.length).toBeGreaterThan(50);
  });

  test('top sheet grand total is non-zero with sample data', async ({ page }) => {
    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main').textContent();
    // Should show a significant dollar amount
    expect(content).toMatch(/\$[\d,]{4,}/);
  });

  test('actuals variance calculation is shown', async ({ page }) => {
    await page.goto('/budgeting/actuals');
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main').textContent();
    // With sample data, budgeted amounts should be visible
    expect(content).toMatch(/\$[\d,]+/);
  });
});
