import {
  calculateLineItemSubtotal,
  calcLineItemSubtotal,
  calculateFringeTotal,
  calcLineItemTotal,
  calculateAccountSubtotal,
  calculateGroupSubtotal,
  calculateGrandTotal,
  calculateContingency,
  recalcProject,
  formatCurrency,
  formatCurrencyDecimal,
} from '../utils/calculations';
import type { LineItem, Fringe, Account, AccountGroup, BudgetProject } from '../types/budgeting';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: 'li-1',
    description: 'Test Item',
    units: 1,
    unitType: 'Flat',
    rate: 1000,
    quantity: 1,
    subtotal: 0,
    fringeTotal: 0,
    total: 0,
    ...overrides,
  };
}

function makeFringe(overrides: Partial<Fringe> = {}): Fringe {
  return {
    id: 'f-1',
    name: 'Test Fringe',
    type: 'percentage',
    value: 10,
    appliesTo: [],
    enabled: true,
    ...overrides,
  };
}

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'acct-1',
    code: '100',
    name: 'Test Account',
    lineItems: [],
    subtotal: 0,
    ...overrides,
  };
}

function makeGroup(overrides: Partial<AccountGroup> = {}): AccountGroup {
  return {
    id: 'grp-1',
    code: '1',
    name: 'Test Group',
    accounts: [],
    subtotal: 0,
    ...overrides,
  };
}

const defaultGlobals = {
  currency: 'USD',
  currencySymbol: '$',
  prepWeeks: 4,
  shootWeeks: 6,
  wrapWeeks: 2,
  payDaysPerWeek: 5,
  overtimeRate: 1.5,
  taxRate: 0,
  contingencyPercent: 10,
};

// ── calculateLineItemSubtotal ─────────────────────────────────────────────────

describe('calculateLineItemSubtotal', () => {
  it('returns units × rate × quantity', () => {
    expect(calculateLineItemSubtotal(makeLineItem({ units: 2, rate: 1000, quantity: 3 }))).toBe(6000);
  });

  it('returns 0 when rate is 0', () => {
    expect(calculateLineItemSubtotal(makeLineItem({ units: 5, rate: 0, quantity: 4 }))).toBe(0);
  });

  it('handles fractional units', () => {
    expect(calculateLineItemSubtotal(makeLineItem({ units: 0.5, rate: 200, quantity: 1 }))).toBe(100);
  });

  it('alias calcLineItemSubtotal returns same result', () => {
    const item = makeLineItem({ units: 3, rate: 500, quantity: 2 });
    expect(calcLineItemSubtotal(item)).toBe(calculateLineItemSubtotal(item));
  });
});

// ── calculateFringeTotal ──────────────────────────────────────────────────────

describe('calculateFringeTotal', () => {
  it('calculates percentage fringe', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 10, appliesTo: [] })];
    expect(calculateFringeTotal(1000, fringes, 'any-account')).toBe(100);
  });

  it('calculates flat fringe', () => {
    const fringes = [makeFringe({ type: 'flat', value: 250, appliesTo: [] })];
    expect(calculateFringeTotal(1000, fringes, 'any-account')).toBe(250);
  });

  it('applies percentage cap', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 20, cap: 500, appliesTo: [] })];
    // subtotal=2000, cap=500 → base=500, fringe = 500 * 20/100 = 100
    expect(calculateFringeTotal(2000, fringes, 'any-account')).toBe(100);
  });

  it('does not apply cap when subtotal is below cap', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 20, cap: 5000, appliesTo: [] })];
    // subtotal=1000 < cap=5000 → base=1000, fringe = 200
    expect(calculateFringeTotal(1000, fringes, 'any-account')).toBe(200);
  });

  it('skips disabled fringes', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 10, enabled: false, appliesTo: [] })];
    expect(calculateFringeTotal(1000, fringes, 'any-account')).toBe(0);
  });

  it('applies fringe when appliesTo is empty (applies to all)', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 15, appliesTo: [] })];
    expect(calculateFringeTotal(1000, fringes, 'specific-account')).toBe(150);
  });

  it('applies fringe when account is in appliesTo', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 15, appliesTo: ['acct-target'] })];
    expect(calculateFringeTotal(1000, fringes, 'acct-target')).toBe(150);
  });

  it('skips fringe when account is not in appliesTo', () => {
    const fringes = [makeFringe({ type: 'percentage', value: 15, appliesTo: ['acct-target'] })];
    expect(calculateFringeTotal(1000, fringes, 'other-account')).toBe(0);
  });

  it('sums multiple fringes', () => {
    const fringes = [
      makeFringe({ id: 'f-1', type: 'percentage', value: 10, appliesTo: [] }),
      makeFringe({ id: 'f-2', type: 'flat', value: 50, appliesTo: [] }),
    ];
    expect(calculateFringeTotal(1000, fringes, 'acct')).toBe(150);
  });

  it('returns 0 for empty fringes array', () => {
    expect(calculateFringeTotal(1000, [], 'acct')).toBe(0);
  });
});

// ── calcLineItemTotal ─────────────────────────────────────────────────────────

describe('calcLineItemTotal', () => {
  it('returns subtotal + fringe total', () => {
    const item = makeLineItem({ units: 1, rate: 1000, quantity: 1 });
    const fringes = [makeFringe({ type: 'percentage', value: 10, appliesTo: [] })];
    // subtotal=1000, fringe=100 → total=1100
    expect(calcLineItemTotal(item, fringes, 'acct')).toBe(1100);
  });

  it('returns subtotal when no fringes', () => {
    const item = makeLineItem({ units: 2, rate: 500, quantity: 3 });
    expect(calcLineItemTotal(item, [], 'acct')).toBe(3000);
  });
});

// ── calculateAccountSubtotal ──────────────────────────────────────────────────

describe('calculateAccountSubtotal', () => {
  it('sums line item totals', () => {
    const account = makeAccount({
      lineItems: [
        makeLineItem({ id: 'li-1', total: 500 }),
        makeLineItem({ id: 'li-2', total: 300 }),
        makeLineItem({ id: 'li-3', total: 200 }),
      ],
    });
    expect(calculateAccountSubtotal(account)).toBe(1000);
  });

  it('returns 0 for empty account', () => {
    expect(calculateAccountSubtotal(makeAccount())).toBe(0);
  });
});

// ── calculateGroupSubtotal ────────────────────────────────────────────────────

describe('calculateGroupSubtotal', () => {
  it('sums account subtotals', () => {
    const group = makeGroup({
      accounts: [
        makeAccount({ id: 'a1', subtotal: 1000 }),
        makeAccount({ id: 'a2', subtotal: 2000 }),
      ],
    });
    expect(calculateGroupSubtotal(group)).toBe(3000);
  });

  it('returns 0 for empty group', () => {
    expect(calculateGroupSubtotal(makeGroup())).toBe(0);
  });
});

// ── calculateGrandTotal ───────────────────────────────────────────────────────

describe('calculateGrandTotal', () => {
  it('sums all group subtotals', () => {
    const groups = [
      makeGroup({ id: 'g1', subtotal: 10000 }),
      makeGroup({ id: 'g2', subtotal: 20000 }),
      makeGroup({ id: 'g3', subtotal: 5000 }),
    ];
    expect(calculateGrandTotal(groups)).toBe(35000);
  });

  it('returns 0 for empty groups', () => {
    expect(calculateGrandTotal([])).toBe(0);
  });
});

// ── calculateContingency ──────────────────────────────────────────────────────

describe('calculateContingency', () => {
  it('calculates percentage of grand total', () => {
    expect(calculateContingency(100000, 10)).toBe(10000);
  });

  it('handles 0%', () => {
    expect(calculateContingency(100000, 0)).toBe(0);
  });

  it('handles 0 grand total', () => {
    expect(calculateContingency(0, 10)).toBe(0);
  });

  it('handles fractional percent', () => {
    expect(calculateContingency(1000, 7.5)).toBeCloseTo(75);
  });
});

// ── recalcProject ─────────────────────────────────────────────────────────────

describe('recalcProject', () => {
  it('recalculates line item subtotals, account subtotals, grand total, and contingency', () => {
    const project: BudgetProject = {
      id: 'proj-1',
      name: 'Test',
      globals: { ...defaultGlobals, contingencyPercent: 10 },
      fringes: [],
      accountGroups: [
        {
          id: 'g1',
          code: '1',
          name: 'Group 1',
          subtotal: 0,
          accounts: [
            {
              id: 'acct-1',
              code: '100',
              name: 'Account 1',
              subtotal: 0,
              lineItems: [
                makeLineItem({ id: 'li-1', units: 2, rate: 1000, quantity: 1 }),
                makeLineItem({ id: 'li-2', units: 1, rate: 500, quantity: 3 }),
              ],
            },
          ],
        },
      ],
      grandTotal: 0,
      contingency: 0,
      totalWithContingency: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = recalcProject(project);

    const acct = result.accountGroups[0].accounts[0];
    expect(acct.lineItems[0].subtotal).toBe(2000); // 2 * 1000 * 1
    expect(acct.lineItems[1].subtotal).toBe(1500); // 1 * 500 * 3
    expect(acct.subtotal).toBe(3500);
    expect(result.accountGroups[0].subtotal).toBe(3500);
    expect(result.grandTotal).toBe(3500);
    expect(result.contingency).toBe(350); // 10%
    expect(result.totalWithContingency).toBe(3850);
  });

  it('applies fringes to line items', () => {
    const project: BudgetProject = {
      id: 'proj-1',
      name: 'Test',
      globals: { ...defaultGlobals, contingencyPercent: 0 },
      fringes: [
        { id: 'f-1', name: 'F1', type: 'percentage', value: 20, appliesTo: [], enabled: true },
      ],
      accountGroups: [
        {
          id: 'g1',
          code: '1',
          name: 'G1',
          subtotal: 0,
          accounts: [
            {
              id: 'acct-1',
              code: '100',
              name: 'A1',
              subtotal: 0,
              lineItems: [makeLineItem({ id: 'li-1', units: 1, rate: 1000, quantity: 1 })],
            },
          ],
        },
      ],
      grandTotal: 0,
      contingency: 0,
      totalWithContingency: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const result = recalcProject(project);
    const li = result.accountGroups[0].accounts[0].lineItems[0];
    expect(li.subtotal).toBe(1000);
    expect(li.fringeTotal).toBe(200); // 20% of 1000
    expect(li.total).toBe(1200);
  });
});

// ── formatCurrency ────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats with default $ symbol', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('formats with custom symbol', () => {
    expect(formatCurrency(1000, '€')).toBe('€1,000');
  });

  it('formats 0', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('does not show decimals', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });
});

describe('formatCurrencyDecimal', () => {
  it('formats with 2 decimal places', () => {
    expect(formatCurrencyDecimal(1234.5)).toBe('$1,234.50');
  });

  it('formats 0 with decimals', () => {
    expect(formatCurrencyDecimal(0)).toBe('$0.00');
  });
});
