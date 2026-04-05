export interface BudgetGlobals {
  currency: string;
  currencySymbol: string;
  prepWeeks: number;
  shootWeeks: number;
  wrapWeeks: number;
  payDaysPerWeek: number;
  overtimeRate: number;
  taxRate: number;
  contingencyPercent: number;
}

export interface Fringe {
  id: string;
  name: string;
  type: 'percentage' | 'flat';
  value: number;
  cap?: number;
  appliesTo: string[];
  enabled: boolean;
}

export interface LineItem {
  id: string;
  description: string;
  units: number;
  unitType: string;
  rate: number;
  quantity: number;
  subtotal: number;
  fringeTotal: number;
  total: number;
  notes?: string;
  actualSpend?: number;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  lineItems: LineItem[];
  subtotal: number;
}

export interface AccountGroup {
  id: string;
  code: string;
  name: string;
  accounts: Account[];
  subtotal: number;
}

export interface BudgetProject {
  id: string;
  name: string;
  globals: BudgetGlobals;
  fringes: Fringe[];
  accountGroups: AccountGroup[];
  grandTotal: number;
  contingency: number;
  totalWithContingency: number;
  lockedBudget?: number;
  createdAt: string;
  updatedAt: string;
}
