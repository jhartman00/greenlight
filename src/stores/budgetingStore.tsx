import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../lib/api';
import type { BudgetProject, Fringe, LineItem, AccountGroup, Account } from '../types/budgeting';
import { sampleBudgetProject } from '../utils/sampleData';
import { calculateAccountSubtotal, calculateGroupSubtotal, calculateGrandTotal, calculateContingency } from '../utils/calculations';

type ActiveView = 'topsheet' | 'accounts' | 'globals' | 'fringes' | 'actuals' | 'reports';

interface BudgetingState {
  project: BudgetProject | null;
  selectedAccountId: string | null;
  activeView: ActiveView;
}

export type BudgetingAction =
  | { type: 'SET_PROJECT'; payload: BudgetProject }
  | { type: 'UPDATE_GLOBALS'; payload: Partial<BudgetProject['globals']> }
  | { type: 'UPDATE_LINE_ITEM'; payload: { accountId: string; lineItem: LineItem } }
  | { type: 'ADD_LINE_ITEM'; payload: { accountId: string } }
  | { type: 'DELETE_LINE_ITEM'; payload: { accountId: string; lineItemId: string } }
  | { type: 'UPDATE_FRINGE'; payload: Fringe }
  | { type: 'ADD_FRINGE' }
  | { type: 'DELETE_FRINGE'; payload: string }
  | { type: 'LOCK_BUDGET' }
  | { type: 'LOAD_SAMPLE' }
  | { type: 'SET_SELECTED_ACCOUNT'; payload: string | null }
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView }
  | { type: 'UPDATE_ACTUAL'; payload: { accountId: string; lineItemId: string; actualSpend: number } };

function recalculate(project: BudgetProject): BudgetProject {
  const fringes = project.fringes;

  const recalcAccount = (account: Account): Account => {
    const lineItems = account.lineItems.map((item: LineItem) => {
      const subtotal = item.units * item.rate * item.quantity;
      const fringeTotal = fringes
        .filter((f: Fringe) => f.enabled && f.appliesTo.includes(account.id))
        .reduce((sum: number, fringe: Fringe) => {
          if (fringe.type === 'percentage') {
            const base = fringe.cap ? Math.min(subtotal, fringe.cap) : subtotal;
            return sum + (base * fringe.value / 100);
          } else {
            return sum + fringe.value;
          }
        }, 0);
      return { ...item, subtotal, fringeTotal, total: subtotal + fringeTotal };
    });
    const subtotal = calculateAccountSubtotal({ ...account, lineItems });
    return { ...account, lineItems, subtotal };
  };

  const accountGroups: AccountGroup[] = project.accountGroups.map((group: AccountGroup) => {
    const accounts = group.accounts.map(recalcAccount);
    const subtotal = calculateGroupSubtotal({ ...group, accounts });
    return { ...group, accounts, subtotal };
  });

  const grandTotal = calculateGrandTotal(accountGroups);
  const contingency = calculateContingency(grandTotal, project.globals.contingencyPercent);

  return {
    ...project,
    accountGroups,
    grandTotal,
    contingency,
    totalWithContingency: grandTotal + contingency,
    updatedAt: new Date().toISOString(),
  };
}

export type { BudgetingState };

export function budgetingReducer(state: BudgetingState, action: BudgetingAction): BudgetingState {
  if (!state.project && action.type !== 'SET_PROJECT' && action.type !== 'LOAD_SAMPLE') {
    return state;
  }

  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: recalculate(action.payload) };

    case 'LOAD_SAMPLE':
      return { ...state, project: recalculate({ ...sampleBudgetProject, id: uuidv4() }) };

    case 'UPDATE_GLOBALS': {
      const project = state.project!;
      const updatedProject = { ...project, globals: { ...project.globals, ...action.payload } };
      return { ...state, project: recalculate(updatedProject) };
    }

    case 'UPDATE_LINE_ITEM': {
      const project = state.project!;
      const updatedGroups = project.accountGroups.map((group: AccountGroup) => ({
        ...group,
        accounts: group.accounts.map((account: Account) => {
          if (account.id !== action.payload.accountId) return account;
          return {
            ...account,
            lineItems: account.lineItems.map((item: LineItem) =>
              item.id === action.payload.lineItem.id ? action.payload.lineItem : item
            ),
          };
        }),
      }));
      return { ...state, project: recalculate({ ...project, accountGroups: updatedGroups }) };
    }

    case 'ADD_LINE_ITEM': {
      const project = state.project!;
      const newItem: LineItem = {
        id: uuidv4(),
        description: 'New Line Item',
        units: 1,
        unitType: 'Flat',
        rate: 0,
        quantity: 1,
        subtotal: 0,
        fringeTotal: 0,
        total: 0,
      };
      const updatedGroups = project.accountGroups.map((group: AccountGroup) => ({
        ...group,
        accounts: group.accounts.map((account: Account) => {
          if (account.id !== action.payload.accountId) return account;
          return { ...account, lineItems: [...account.lineItems, newItem] };
        }),
      }));
      return { ...state, project: recalculate({ ...project, accountGroups: updatedGroups }) };
    }

    case 'DELETE_LINE_ITEM': {
      const project = state.project!;
      const updatedGroups = project.accountGroups.map((group: AccountGroup) => ({
        ...group,
        accounts: group.accounts.map((account: Account) => {
          if (account.id !== action.payload.accountId) return account;
          return {
            ...account,
            lineItems: account.lineItems.filter((item: LineItem) => item.id !== action.payload.lineItemId),
          };
        }),
      }));
      return { ...state, project: recalculate({ ...project, accountGroups: updatedGroups }) };
    }

    case 'UPDATE_FRINGE': {
      const project = state.project!;
      const existingIdx = project.fringes.findIndex((f: Fringe) => f.id === action.payload.id);
      const newFringes = existingIdx >= 0
        ? project.fringes.map((f: Fringe) => f.id === action.payload.id ? action.payload : f)
        : [...project.fringes, action.payload];
      return {
        ...state,
        project: recalculate({ ...project, fringes: newFringes }),
      };
    }

    case 'ADD_FRINGE': {
      const project = state.project!;
      const newFringe: Fringe = {
        id: uuidv4(),
        name: 'New Fringe',
        type: 'percentage',
        value: 0,
        appliesTo: [],
        enabled: true,
      };
      return {
        ...state,
        project: recalculate({ ...project, fringes: [...project.fringes, newFringe] }),
      };
    }

    case 'DELETE_FRINGE': {
      const project = state.project!;
      return {
        ...state,
        project: recalculate({
          ...project,
          fringes: project.fringes.filter((f: Fringe) => f.id !== action.payload),
        }),
      };
    }

    case 'LOCK_BUDGET': {
      const project = state.project!;
      return {
        ...state,
        project: { ...project, lockedBudget: project.totalWithContingency },
      };
    }

    case 'UPDATE_ACTUAL': {
      const project = state.project!;
      const updatedGroups = project.accountGroups.map((group: AccountGroup) => ({
        ...group,
        accounts: group.accounts.map((account: Account) => {
          if (account.id !== action.payload.accountId) return account;
          return {
            ...account,
            lineItems: account.lineItems.map((item: LineItem) =>
              item.id === action.payload.lineItemId
                ? { ...item, actualSpend: action.payload.actualSpend }
                : item
            ),
          };
        }),
      }));
      return { ...state, project: { ...project, accountGroups: updatedGroups } };
    }

    case 'SET_SELECTED_ACCOUNT':
      return { ...state, selectedAccountId: action.payload };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    default:
      return state;
  }
}

interface BudgetingContextValue {
  state: BudgetingState;
  dispatch: React.Dispatch<BudgetingAction>;
}

const BudgetingContext = createContext<BudgetingContextValue | null>(null);

export function BudgetingProvider({ children, projectId }: { children: React.ReactNode; projectId: string }) {
  const [state, dispatch] = useReducer(budgetingReducer, {
    project: null,
    selectedAccountId: null,
    activeView: 'topsheet' as ActiveView,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    if (!projectId) return;
    isLoadingRef.current = true;
    api.getProject(projectId).then(row => {
      const data = row.budgeting_data;
      if (data && data.accountGroups) {
        dispatch({ type: 'SET_PROJECT', payload: data });
      } else {
        const now = new Date().toISOString();
        dispatch({ type: 'SET_PROJECT', payload: { id: projectId, name: row.name, globals: { currency: 'USD', currencySymbol: '$', prepWeeks: 4, shootWeeks: 8, wrapWeeks: 2, payDaysPerWeek: 5, overtimeRate: 1.5, taxRate: 0, contingencyPercent: 10 }, fringes: [], accountGroups: [], grandTotal: 0, contingency: 0, totalWithContingency: 0, createdAt: row.created_at ?? now, updatedAt: now } });
      }
    }).finally(() => {
      isLoadingRef.current = false;
    });
  }, [projectId]);

  useEffect(() => {
    if (isLoadingRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (state.project) {
        api.saveBudgeting(projectId, state.project);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.project]);

  return (
    <BudgetingContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetingContext.Provider>
  );
}

export function useBudgeting() {
  const ctx = useContext(BudgetingContext);
  if (!ctx) throw new Error('useBudgeting must be used within BudgetingProvider');
  return ctx;
}
