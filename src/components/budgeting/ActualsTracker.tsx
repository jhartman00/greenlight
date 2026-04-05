import React from 'react';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';

export default function ActualsTracker() {
  const { state, dispatch } = useBudgeting();

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project } = state;
  const sym = project.globals.currencySymbol;

  const handleActualChange = (accountId: string, lineItemId: string, value: number) => {
    dispatch({ type: 'UPDATE_ACTUAL', payload: { accountId, lineItemId, actualSpend: value } });
  };

  const getVarianceColor = (budget: number, actual: number): string => {
    if (actual === 0) return 'text-gray-500';
    const pct = ((actual - budget) / budget) * 100;
    if (pct > 10) return 'text-red-400';
    if (pct > 0) return 'text-yellow-400';
    return 'text-green-400';
  };

  const totalBudget = project.grandTotal;
  const totalActuals = project.accountGroups.reduce((sum, group) =>
    sum + group.accounts.reduce((aSum, acct) =>
      aSum + acct.lineItems.reduce((iSum, item) => iSum + (item.actualSpend ?? 0), 0), 0), 0);
  const totalVariance = totalActuals - totalBudget;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-gray-100 font-semibold text-sm">Actuals Tracker</h2>
        <p className="text-gray-500 text-xs">Enter actual spend per line item to track against budget</p>
      </div>

      <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div><div className="text-xs text-gray-400 mb-0.5">Total Budget</div><div className="text-base font-bold text-gray-200 font-mono">{formatCurrency(totalBudget, sym)}</div></div>
        <div><div className="text-xs text-gray-400 mb-0.5">Total Actuals</div><div className="text-base font-bold text-amber-400 font-mono">{formatCurrency(totalActuals, sym)}</div></div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Variance</div>
          <div className={`text-base font-bold font-mono ${totalVariance > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {totalVariance > 0 ? '+' : ''}{formatCurrency(totalVariance, sym)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
            <tr className="text-gray-400 font-semibold">
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-right w-28">Budget</th>
              <th className="px-4 py-2 text-right w-36">Actual Spend</th>
              <th className="px-4 py-2 text-right w-28">Variance</th>
              <th className="px-4 py-2 text-right w-16">%</th>
            </tr>
          </thead>
          <tbody>
            {project.accountGroups.map(group => (
              <React.Fragment key={group.id}>
                <tr className="bg-gray-800 border-t border-gray-600">
                  <td colSpan={5} className="px-4 py-2 text-xs font-bold text-gray-300 uppercase tracking-wide">{group.code} - {group.name}</td>
                </tr>
                {group.accounts.map(account => {
                  const accountActuals = account.lineItems.reduce((s, i) => s + (i.actualSpend ?? 0), 0);
                  const accountVariance = accountActuals - account.subtotal;
                  return (
                    <React.Fragment key={account.id}>
                      <tr className="bg-gray-800 border-y border-gray-700">
                        <td className="px-4 py-2 pl-8 font-semibold text-gray-300" colSpan={2}>{account.code} - {account.name}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-amber-400">{formatCurrency(accountActuals, sym)}</td>
                        <td className={`px-4 py-2 text-right font-mono font-semibold ${getVarianceColor(account.subtotal, accountActuals)}`}>
                          {accountActuals > 0 ? `${accountVariance > 0 ? '+' : ''}${formatCurrency(accountVariance, sym)}` : '-'}
                        </td>
                        <td className={`px-4 py-2 text-right ${getVarianceColor(account.subtotal, accountActuals)}`}>
                          {accountActuals > 0 && account.subtotal > 0 ? `${((accountActuals / account.subtotal) * 100).toFixed(0)}%` : '-'}
                        </td>
                      </tr>
                      {account.lineItems.map(item => {
                        const actual = item.actualSpend ?? 0;
                        const variance = actual - item.total;
                        const pct = item.total > 0 ? ((actual / item.total) * 100).toFixed(0) : '0';
                        return (
                          <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="px-4 py-1.5 pl-12 text-gray-400">{item.description}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-500">{formatCurrency(item.total, sym)}</td>
                            <td className="px-4 py-1.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-gray-500 text-xs">{sym}</span>
                                <input type="number" value={actual || ''} placeholder="0"
                                  onChange={e => handleActualChange(account.id, item.id, parseFloat(e.target.value) || 0)}
                                  className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-right text-gray-100 focus:outline-none focus:border-amber-500" />
                              </div>
                            </td>
                            <td className={`px-4 py-1.5 text-right font-mono ${actual > 0 ? getVarianceColor(item.total, actual) : 'text-gray-600'}`}>
                              {actual > 0 ? `${variance > 0 ? '+' : ''}${formatCurrency(variance, sym)}` : '-'}
                            </td>
                            <td className={`px-4 py-1.5 text-right ${actual > 0 ? getVarianceColor(item.total, actual) : 'text-gray-600'}`}>
                              {actual > 0 ? `${pct}%` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
