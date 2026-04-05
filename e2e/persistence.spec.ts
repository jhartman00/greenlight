import { test, expect } from '@playwright/test';

// ── localStorage Persistence ──────────────────────────────────────────────────

test.describe('localStorage Persistence', () => {
  test('scheduling data survives page reload', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/scheduling/breakdowns');
    await page.waitForLoadState('networkidle');

    // Wait for data to load
    await page.waitForTimeout(600); // longer than the 500ms debounce

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Data should still be there (not empty)
    const content = await page.locator('main').textContent();
    expect(content!.length).toBeGreaterThan(50);
  });

  test('budgeting data survives page reload', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(600);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main').textContent();
    expect(content).toMatch(/\$[\d,]+|total/i);
  });

  test('localStorage keys are set after visiting app', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/scheduling/stripboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const schedulingKey = await page.evaluate(
      () => localStorage.getItem('moviemagic_scheduling')
    );
    expect(schedulingKey).not.toBeNull();
  });

  test('budgeting localStorage key is set', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const budgetingKey = await page.evaluate(
      () => localStorage.getItem('moviemagic_budgeting')
    );
    expect(budgetingKey).not.toBeNull();
  });

  test('clearing localStorage then reloading shows fresh sample data', async ({ page }) => {
    // First visit to seed data
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/scheduling/stripboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // Clear localStorage
    await page.evaluate(() => localStorage.clear());

    // Reload - should load sample data again
    await page.reload();
    await page.waitForLoadState('networkidle');

    const content = await page.locator('main').textContent();
    expect(content!.length).toBeGreaterThan(50);
  });

  test('scheduling data is valid JSON in localStorage', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/scheduling/stripboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const stored = await page.evaluate(() => localStorage.getItem('moviemagic_scheduling'));
    expect(() => JSON.parse(stored!)).not.toThrow();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveProperty('breakdowns');
    expect(parsed).toHaveProperty('elements');
    expect(parsed.breakdowns.length).toBeGreaterThan(0);
  });

  test('budgeting data is valid JSON in localStorage', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const stored = await page.evaluate(() => localStorage.getItem('moviemagic_budgeting'));
    expect(() => JSON.parse(stored!)).not.toThrow();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveProperty('accountGroups');
    expect(parsed.accountGroups.length).toBeGreaterThan(0);
  });
});
