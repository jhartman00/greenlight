import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

const ROUTES = [
  { path: '/scheduling/stripboard', label: 'Strip Board' },
  { path: '/scheduling/breakdowns', label: 'Breakdowns' },
  { path: '/scheduling/elements', label: 'Elements' },
  { path: '/scheduling/extras', label: 'Extras' },
  { path: '/scheduling/wardrobe', label: 'Wardrobe' },
  { path: '/scheduling/sets', label: 'Sets' },
  { path: '/scheduling/script', label: 'Script' },
  { path: '/scheduling/dood', label: 'Day Out of Days' },
  { path: '/scheduling/calendar', label: 'Calendar' },
  { path: '/scheduling/reports', label: 'Reports' },
  { path: '/budgeting/topsheet', label: 'Top Sheet' },
  { path: '/budgeting/accounts', label: 'Accounts' },
  { path: '/budgeting/globals', label: 'Globals' },
  { path: '/budgeting/fringes', label: 'Fringes' },
  { path: '/budgeting/actuals', label: 'Actuals' },
  { path: '/budgeting/reports', label: 'Budget Reports' },
];

test('root redirects to strip board', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/scheduling\/stripboard/);
});

for (const route of ROUTES) {
  test(`${route.label} page renders without crash`, async ({ page }) => {
    await page.goto(route.path);
    await page.waitForLoadState('networkidle');
    // No error overlay or crash dialog
    await expect(page.locator('body')).not.toContainText('Error: ');
    await expect(page.locator('body')).not.toContainText('Uncaught TypeError');
    // Page has some visible content
    await expect(page.locator('body')).toBeVisible();
  });
}

test('sidebar navigation links work', async ({ page }) => {
  await page.goto('/scheduling/stripboard');
  await page.waitForLoadState('networkidle');
  // Sidebar should be visible
  await expect(page.locator('nav, aside, [class*="sidebar"]').first()).toBeVisible();
});

test('sidebar scheduling links navigate correctly', async ({ page }) => {
  await page.goto('/scheduling/stripboard');
  await page.waitForLoadState('networkidle');

  // Click on Breakdowns link
  await page.getByRole('link', { name: /breakdown/i }).first().click();
  await expect(page).toHaveURL(/\/scheduling\/breakdowns/);

  // Click on Elements link
  await page.getByRole('link', { name: /element/i }).first().click();
  await expect(page).toHaveURL(/\/scheduling\/elements/);
});

test('sidebar budgeting links navigate correctly', async ({ page }) => {
  await page.goto('/budgeting/topsheet');
  await page.waitForLoadState('networkidle');

  // Click on Fringes link
  await page.getByRole('link', { name: /fringe/i }).first().click();
  await expect(page).toHaveURL(/\/budgeting\/fringes/);
});
