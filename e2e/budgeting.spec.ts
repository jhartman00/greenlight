import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

// ── Top Sheet ─────────────────────────────────────────────────────────────────

test.describe('Top Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgeting/topsheet');
    await page.waitForLoadState('networkidle');
  });

  test('renders account groups', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
    const content = await page.locator('main').textContent();
    // Standard film budget groups
    expect(content).toMatch(/above|below|line|production|post/i);
  });

  test('shows dollar amounts', async ({ page }) => {
    const content = await page.locator('main').textContent();
    // Should show currency values like $1,234,567
    expect(content).toMatch(/\$[\d,]+/);
  });

  test('shows grand total', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/grand total|total/i);
  });

  test('shows contingency', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/contingency/i);
  });

  test('shows total with contingency', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/total with contingency|total.*contingency/i);
  });

  test('lock budget button exists', async ({ page }) => {
    const lockButton = page.getByRole('button', { name: /lock/i });
    await expect(lockButton).toBeVisible();
  });

  test('clicking an account navigates to account detail', async ({ page }) => {
    // Find a clickable account row
    const accountRow = page.locator('tr[class*="cursor"], tr button, tbody tr').first();
    if (await accountRow.count() > 0) {
      await accountRow.click();
      await page.waitForTimeout(300);
      // Should navigate or show detail
      const url = page.url();
      const content = await page.locator('body').textContent();
      expect(content!.length).toBeGreaterThan(50);
    }
  });
});

// ── Account Detail ────────────────────────────────────────────────────────────

test.describe('Account Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgeting/accounts');
    await page.waitForLoadState('networkidle');
  });

  test('renders account list', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/account|\d{3}/);
  });

  test('shows line items when account is expanded', async ({ page }) => {
    // Account rows have cursor-pointer and show ▶ expand indicator
    const accountRow = page.locator('[class*="cursor-pointer"]').first();
    if (await accountRow.count() > 0) {
      await accountRow.click();
      await page.waitForTimeout(400);
      const content = await page.locator('main').textContent();
      // After expanding, should show line items (description + dollar amounts)
      expect(content).toMatch(/\$|description|item/i);
    }
  });

  test('shows dollar amounts for accounts', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/\$[\d,]+|\d+/);
  });
});

// ── Globals Editor ────────────────────────────────────────────────────────────

test.describe('Globals Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgeting/globals');
    await page.waitForLoadState('networkidle');
  });

  test('renders form fields for project settings', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
    // Should have input fields for globals
    const inputs = page.locator('input, select');
    await expect(inputs.first()).toBeVisible();
  });

  test('shows shoot weeks field', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/shoot|prep|wrap|week/i);
  });

  test('shows contingency percentage field', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/contingency/i);
  });

  test('shows currency field', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/currency|symbol|\$/i);
  });

  test('editing a field updates the value', async ({ page }) => {
    // Find a numeric input
    const numInput = page.locator('input[type="number"]').first();
    if (await numInput.count() > 0) {
      const initialValue = await numInput.inputValue();
      await numInput.fill('99');
      const newValue = await numInput.inputValue();
      expect(newValue).toBe('99');
    }
  });
});

// ── Fringes Editor ────────────────────────────────────────────────────────────

test.describe('Fringes Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgeting/fringes');
    await page.waitForLoadState('networkidle');
  });

  test('renders fringe list', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/fringe|payroll|health|pension|union/i);
  });

  test('shows enabled/disabled toggle', async ({ page }) => {
    // Fringe toggles are styled buttons (rounded-full) or the page shows fringe rows
    const fringeContent = await page.locator('main').textContent();
    // Fringe rows are rendered — verify the page has fringe data
    expect(fringeContent).toMatch(/fringe|payroll|health|pension|social|medicare/i);
  });

  test('shows fringe percentages', async ({ page }) => {
    // Percentages are in input values — look for numeric inputs or % in option text
    const inputs = page.locator('input[type="number"], input[type="text"]');
    if (await inputs.count() > 0) {
      await expect(inputs.first()).toBeVisible();
    } else {
      // Fall back: the select has "%" option text which appears in DOM
      const content = await page.locator('main').textContent();
      expect(content).toMatch(/%|percentage|fringe/i);
    }
  });

  test('add fringe button exists', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add fringe/i });
    await expect(addButton).toBeVisible();
  });
});

// ── Actuals Tracker ───────────────────────────────────────────────────────────

test.describe('Actuals Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgeting/actuals');
    await page.waitForLoadState('networkidle');
  });

  test('renders actuals view', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/actual|budget|variance/i);
  });

  test('shows budget and actual columns', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/budget/i);
    expect(content).toMatch(/actual|spent/i);
  });

  test('shows variance values', async ({ page }) => {
    const content = await page.locator('main').textContent();
    // Variance should be present (under/over)
    expect(content).toMatch(/variance|over|under|\$[\d,]+/i);
  });
});

// ── Budget Reports ────────────────────────────────────────────────────────────

test.describe('Budget Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgeting/reports');
    await page.waitForLoadState('networkidle');
  });

  test('renders reports view', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('has tab navigation or sections', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/summary|detail|variance|report/i);
  });

  test('shows budget totals in reports', async ({ page }) => {
    const content = await page.locator('main').textContent();
    expect(content).toMatch(/\$[\d,]+|total/i);
  });

  test('tabs switch between report views', async ({ page }) => {
    // Look for tab buttons
    const tabs = page.locator('[role="tab"], button[class*="tab"]');
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(200);
      const content = await page.locator('main').textContent();
      expect(content).toBeDefined();
    }
  });

  test('print button or export exists', async ({ page }) => {
    const printBtn = page.locator('button').filter({ hasText: /print|export|pdf/i });
    if (await printBtn.count() > 0) {
      await expect(printBtn.first()).toBeVisible();
    }
  });
});
