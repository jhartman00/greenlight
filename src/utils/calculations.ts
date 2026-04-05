import type { LineItem, Fringe, Account, AccountGroup, BudgetProject } from '../types/budgeting';

export function calculateLineItemSubtotal(item: LineItem): number {
  return item.units * item.rate * item.quantity;
}

// Alias for consistency
export function calcLineItemSubtotal(item: LineItem): number {
  return calculateLineItemSubtotal(item);
}

export function calculateFringeTotal(subtotal: number, fringes: Fringe[], accountId: string): number {
  return fringes
    .filter(f => f.enabled && (f.appliesTo.length === 0 || f.appliesTo.includes(accountId)))
    .reduce((sum, fringe) => {
      if (fringe.type === 'percentage') {
        const base = fringe.cap ? Math.min(subtotal, fringe.cap) : subtotal;
        return sum + (base * fringe.value / 100);
      } else {
        return sum + fringe.value;
      }
    }, 0);
}

export function calcLineItemFringes(item: LineItem, fringes: Fringe[], accountId: string): number {
  const subtotal = calcLineItemSubtotal(item);
  return calculateFringeTotal(subtotal, fringes, accountId);
}

export function calcLineItemTotal(item: LineItem, fringes: Fringe[], accountId: string): number {
  return calcLineItemSubtotal(item) + calcLineItemFringes(item, fringes, accountId);
}

export function calculateAccountSubtotal(account: Account): number {
  return account.lineItems.reduce((sum, item) => sum + item.total, 0);
}

export function calcAccountSubtotal(account: Account): number {
  return calculateAccountSubtotal(account);
}

export function calculateGroupSubtotal(group: AccountGroup): number {
  return group.accounts.reduce((sum, account) => sum + account.subtotal, 0);
}

export function calcGroupSubtotal(group: AccountGroup): number {
  return calculateGroupSubtotal(group);
}

export function calculateGrandTotal(groups: AccountGroup[]): number {
  return groups.reduce((sum, group) => sum + group.subtotal, 0);
}

export function calcGrandTotal(groups: AccountGroup[]): number {
  return calculateGrandTotal(groups);
}

export function calculateContingency(grandTotal: number, percent: number): number {
  return grandTotal * (percent / 100);
}

export function calcContingency(grandTotal: number, percent: number): number {
  return calculateContingency(grandTotal, percent);
}

export function recalcProject(project: BudgetProject): BudgetProject {
  const updatedGroups = project.accountGroups.map(group => {
    const updatedAccounts = group.accounts.map(account => {
      const updatedItems = account.lineItems.map(item => {
        const subtotal = calcLineItemSubtotal(item);
        const fringeTotal = calcLineItemFringes(item, project.fringes, account.id);
        const total = subtotal + fringeTotal;
        return { ...item, subtotal, fringeTotal, total };
      });
      const subtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
      return { ...account, lineItems: updatedItems, subtotal };
    });
    const subtotal = updatedAccounts.reduce((sum, a) => sum + a.subtotal, 0);
    return { ...group, accounts: updatedAccounts, subtotal };
  });

  const grandTotal = updatedGroups.reduce((sum, g) => sum + g.subtotal, 0);
  const contingency = calcContingency(grandTotal, project.globals.contingencyPercent);
  const totalWithContingency = grandTotal + contingency;

  return {
    ...project,
    accountGroups: updatedGroups,
    grandTotal,
    contingency,
    totalWithContingency,
    updatedAt: new Date().toISOString(),
  };
}

export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatCurrencyDecimal(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
