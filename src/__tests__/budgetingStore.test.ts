import { budgetingReducer } from '../stores/budgetingStore';
import type { BudgetingState } from '../stores/budgetingStore';
import type { BudgetProject, Account, AccountGroup, LineItem, Fringe } from '../types/budgeting';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = '2024-01-01T00:00:00.000Z';

const defaultGlobals: BudgetProject['globals'] = {
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

function makeLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: 'li-1',
    description: 'Test Item',
    units: 1,
    unitType: 'Flat',
    rate: 1000,
    quantity: 1,
    subtotal: 1000,
    fringeTotal: 0,
    total: 1000,
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
    accounts: [makeAccount()],
    subtotal: 0,
    ...overrides,
  };
}

function makeProject(overrides: Partial<BudgetProject> = {}): BudgetProject {
  return {
    id: 'proj-1',
    name: 'Test Project',
    globals: { ...defaultGlobals },
    fringes: [],
    accountGroups: [makeGroup()],
    grandTotal: 0,
    contingency: 0,
    totalWithContingency: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

const baseState: BudgetingState = {
  project: makeProject(),
  selectedAccountId: null,
  activeView: 'topsheet',
};

const noProjectState: BudgetingState = {
  project: null,
  selectedAccountId: null,
  activeView: 'topsheet',
};

// ── Guard ─────────────────────────────────────────────────────────────────────

describe('budgetingReducer guard', () => {
  it('returns unchanged state when project is null and action is not SET_PROJECT/LOAD_SAMPLE', () => {
    const result = budgetingReducer(noProjectState, { type: 'SET_ACTIVE_VIEW', payload: 'fringes' });
    expect(result).toBe(noProjectState);
  });
});

// ── SET_PROJECT ───────────────────────────────────────────────────────────────

describe('SET_PROJECT', () => {
  it('sets and recalculates the project', () => {
    const project = makeProject({
      accountGroups: [
        makeGroup({
          accounts: [
            makeAccount({
              lineItems: [makeLineItem({ units: 2, rate: 1000, quantity: 1 })],
            }),
          ],
        }),
      ],
    });
    const result = budgetingReducer(noProjectState, { type: 'SET_PROJECT', payload: project });
    // recalculate should update subtotals
    expect(result.project).not.toBeNull();
  });
});

// ── LOAD_SAMPLE ───────────────────────────────────────────────────────────────

describe('LOAD_SAMPLE', () => {
  it('loads sample budget with account groups', () => {
    const result = budgetingReducer(noProjectState, { type: 'LOAD_SAMPLE' });
    expect(result.project).not.toBeNull();
    expect(result.project!.accountGroups.length).toBeGreaterThan(0);
  });

  it('calculates grand total greater than 0 for sample data', () => {
    const result = budgetingReducer(noProjectState, { type: 'LOAD_SAMPLE' });
    expect(result.project!.grandTotal).toBeGreaterThan(0);
  });
});

// ── UPDATE_GLOBALS ────────────────────────────────────────────────────────────

describe('UPDATE_GLOBALS', () => {
  it('updates specified globals fields', () => {
    const result = budgetingReducer(baseState, {
      type: 'UPDATE_GLOBALS',
      payload: { shootWeeks: 8, contingencyPercent: 15 },
    });
    expect(result.project!.globals.shootWeeks).toBe(8);
    expect(result.project!.globals.contingencyPercent).toBe(15);
  });

  it('does not overwrite unspecified globals fields', () => {
    const result = budgetingReducer(baseState, {
      type: 'UPDATE_GLOBALS',
      payload: { shootWeeks: 8 },
    });
    expect(result.project!.globals.prepWeeks).toBe(4);
  });

  it('triggers recalculation (contingency updates)', () => {
    const projectWithTotal = makeProject({
      accountGroups: [
        makeGroup({
          accounts: [
            makeAccount({
              lineItems: [makeLineItem({ units: 1, rate: 10000, quantity: 1 })],
            }),
          ],
        }),
      ],
    });
    let state: BudgetingState = budgetingReducer(
      { ...baseState, project: projectWithTotal },
      { type: 'SET_PROJECT', payload: projectWithTotal }
    );
    state = budgetingReducer(state, { type: 'UPDATE_GLOBALS', payload: { contingencyPercent: 20 } });
    // grand total = 10000, contingency = 20% = 2000
    expect(state.project!.contingency).toBe(2000);
  });
});

// ── ADD_LINE_ITEM ─────────────────────────────────────────────────────────────

describe('ADD_LINE_ITEM', () => {
  it('adds a new default line item to the account', () => {
    const result = budgetingReducer(baseState, {
      type: 'ADD_LINE_ITEM',
      payload: { accountId: 'acct-1' },
    });
    const lineItems = result.project!.accountGroups[0].accounts[0].lineItems;
    expect(lineItems).toHaveLength(1);
    expect(lineItems[0].description).toBe('New Line Item');
    expect(lineItems[0].rate).toBe(0);
  });

  it('does not add to other accounts', () => {
    const project = makeProject({
      accountGroups: [
        makeGroup({
          accounts: [
            makeAccount({ id: 'acct-1' }),
            makeAccount({ id: 'acct-2', code: '200', name: 'Other' }),
          ],
        }),
      ],
    });
    const state = { ...baseState, project };
    const result = budgetingReducer(state, {
      type: 'ADD_LINE_ITEM',
      payload: { accountId: 'acct-1' },
    });
    expect(result.project!.accountGroups[0].accounts[1].lineItems).toHaveLength(0);
  });
});

// ── UPDATE_LINE_ITEM ──────────────────────────────────────────────────────────

describe('UPDATE_LINE_ITEM', () => {
  it('updates the matching line item and recalculates', () => {
    const li = makeLineItem({ id: 'li-1', units: 1, rate: 1000, quantity: 1 });
    const project = makeProject({
      accountGroups: [makeGroup({ accounts: [makeAccount({ lineItems: [li] })] })],
    });
    const state = budgetingReducer({ ...baseState, project }, { type: 'SET_PROJECT', payload: project });
    const updatedLi = { ...li, rate: 2000 };
    const result = budgetingReducer(state, {
      type: 'UPDATE_LINE_ITEM',
      payload: { accountId: 'acct-1', lineItem: updatedLi },
    });
    const items = result.project!.accountGroups[0].accounts[0].lineItems;
    expect(items[0].rate).toBe(2000);
    expect(items[0].subtotal).toBe(2000);
  });
});

// ── DELETE_LINE_ITEM ──────────────────────────────────────────────────────────

describe('DELETE_LINE_ITEM', () => {
  it('removes the specified line item', () => {
    const li1 = makeLineItem({ id: 'li-1' });
    const li2 = makeLineItem({ id: 'li-2', description: 'Item 2' });
    const project = makeProject({
      accountGroups: [makeGroup({ accounts: [makeAccount({ lineItems: [li1, li2] })] })],
    });
    const state = budgetingReducer({ ...baseState, project }, { type: 'SET_PROJECT', payload: project });
    const result = budgetingReducer(state, {
      type: 'DELETE_LINE_ITEM',
      payload: { accountId: 'acct-1', lineItemId: 'li-1' },
    });
    const items = result.project!.accountGroups[0].accounts[0].lineItems;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('li-2');
  });
});

// ── ADD_FRINGE ────────────────────────────────────────────────────────────────

describe('ADD_FRINGE', () => {
  it('adds a new default fringe', () => {
    const result = budgetingReducer(baseState, { type: 'ADD_FRINGE' });
    expect(result.project!.fringes).toHaveLength(1);
    expect(result.project!.fringes[0].name).toBe('New Fringe');
    expect(result.project!.fringes[0].type).toBe('percentage');
    expect(result.project!.fringes[0].enabled).toBe(true);
  });
});

// ── UPDATE_FRINGE ─────────────────────────────────────────────────────────────

describe('UPDATE_FRINGE', () => {
  it('updates an existing fringe', () => {
    const fringe: Fringe = {
      id: 'f-1', name: 'Health', type: 'percentage', value: 10,
      appliesTo: [], enabled: true,
    };
    const project = makeProject({ fringes: [fringe] });
    const state = { ...baseState, project };
    const result = budgetingReducer(state, {
      type: 'UPDATE_FRINGE',
      payload: { ...fringe, value: 15 },
    });
    expect(result.project!.fringes[0].value).toBe(15);
  });

  it('appends fringe if id does not exist', () => {
    const fringe: Fringe = {
      id: 'f-new', name: 'New', type: 'flat', value: 100,
      appliesTo: [], enabled: true,
    };
    const result = budgetingReducer(baseState, { type: 'UPDATE_FRINGE', payload: fringe });
    expect(result.project!.fringes).toHaveLength(1);
    expect(result.project!.fringes[0].id).toBe('f-new');
  });
});

// ── DELETE_FRINGE ─────────────────────────────────────────────────────────────

describe('DELETE_FRINGE', () => {
  it('removes fringe by id', () => {
    const fringe: Fringe = {
      id: 'f-1', name: 'Pension', type: 'percentage', value: 5,
      appliesTo: [], enabled: true,
    };
    const project = makeProject({ fringes: [fringe] });
    const state = { ...baseState, project };
    const result = budgetingReducer(state, { type: 'DELETE_FRINGE', payload: 'f-1' });
    expect(result.project!.fringes).toHaveLength(0);
  });
});

// ── LOCK_BUDGET ───────────────────────────────────────────────────────────────

describe('LOCK_BUDGET', () => {
  it('sets lockedBudget to totalWithContingency', () => {
    const project = makeProject({ totalWithContingency: 1234567 });
    const state = { ...baseState, project };
    const result = budgetingReducer(state, { type: 'LOCK_BUDGET' });
    expect(result.project!.lockedBudget).toBe(1234567);
  });
});

// ── UPDATE_ACTUAL ─────────────────────────────────────────────────────────────

describe('UPDATE_ACTUAL', () => {
  it('sets actualSpend on the specified line item', () => {
    const li = makeLineItem({ id: 'li-1' });
    const project = makeProject({
      accountGroups: [makeGroup({ accounts: [makeAccount({ lineItems: [li] })] })],
    });
    const state = { ...baseState, project };
    const result = budgetingReducer(state, {
      type: 'UPDATE_ACTUAL',
      payload: { accountId: 'acct-1', lineItemId: 'li-1', actualSpend: 850 },
    });
    const items = result.project!.accountGroups[0].accounts[0].lineItems;
    expect(items[0].actualSpend).toBe(850);
  });
});

// ── SET_SELECTED_ACCOUNT ──────────────────────────────────────────────────────

describe('SET_SELECTED_ACCOUNT', () => {
  it('sets the selected account id', () => {
    const result = budgetingReducer(baseState, { type: 'SET_SELECTED_ACCOUNT', payload: 'acct-5' });
    expect(result.selectedAccountId).toBe('acct-5');
  });

  it('can be set to null', () => {
    const state: BudgetingState = { ...baseState, selectedAccountId: 'acct-1' };
    const result = budgetingReducer(state, { type: 'SET_SELECTED_ACCOUNT', payload: null });
    expect(result.selectedAccountId).toBeNull();
  });
});

// ── SET_ACTIVE_VIEW ───────────────────────────────────────────────────────────

describe('SET_ACTIVE_VIEW', () => {
  it('changes the active view', () => {
    const result = budgetingReducer(baseState, { type: 'SET_ACTIVE_VIEW', payload: 'fringes' });
    expect(result.activeView).toBe('fringes');
  });
});
