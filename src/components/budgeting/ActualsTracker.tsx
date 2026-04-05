import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';

export default function ActualsTracker() {
  const { state, dispatch } = useBudgeting();
  const project = state.project;

  if (!project) return <div className="p-6 text-gray-400">No project loaded.</div>;

  const sym = project.globals.currencySymbol;

  const totalBudget = project.grandTotal;
  const totalActual = project.accountGroups.reduce((sum, g) =>
    sum + g.accounts.reduce((aSum, a) =>
      aSum + a.lineItems.reduce((iSum, i) => iSum + (i.actualSpend ?? 0), 0), 0), 0);
  const totalVariance = totalActual - totalBudget;

  const varClass = (v: number) => v > 0 ? 'text-red-400' : v < 0 ? 'text-green-400' : 'text-gray-400';

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white">Actuals Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Budget vs actual spend</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-right">
            <div className="text-gray-400 text-xs">Budget</div>
            <div className="text-white font-mono font-semibold">{formatCurrency(totalBudget, sym)}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs">Actual</div>
            <div className="text-white font-mono font-semibold">{formatCurrency(totalActual, sym)}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs">Variance</div>
            <div className={`font-mono font-semibold ${varClass(totalVariance)}`}>
              {totalVariance > 0 ? '+' : ''}{formatCurrency(totalVariance, sym)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0}% spent</span>
          <span>{sym}{(totalBudget - totalActual).toLocaleString()} remaining</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${totalActual > totalBudget ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min((totalActual / Math.max(totalBudget, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
            <tr className="text-gray-400 font-semibold uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left">Account / Line Item</th>
              <th className="px-4 py-2.5 text-right w-28">Budget</th>
              <th className="px-4 py-2.5 text-right w-28">Actual</th>
              <th className="px-4 py-2.5 text-right w-28">Variance</th>
              <th className="px-4 py-2.5 text-center w-24">%</th>
            </tr>
          </thead>
          <tbody>
            {project.accountGroups.map(group => (
              group.accounts.map(account => {
                const acctBudget = account.subtotal;
                const acctActual = account.lineItems.reduce((s, i) => s + (i.actualSpend ?? 0), 0);
                const acctVar = acctActual - acctBudget;
                const acctPct = acctBudget > 0 ? (acctActual / acctBudget) * 100 : 0;

                return [
                  // Account row
                  <tr key={`acct-${account.id}`} className="bg-gray-800 border-b border-gray-700">
                    <td className="px-4 py-2 font-semibold text-gray-200">
                      <span className="text-gray-500 mr-2">{account.code}</span>
                      {account.name}
                      <span className="ml-2 text-gray-500 font-normal">{account.lineItems.length} items</span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-300">{formatCurrency(acctBudget, sym)}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-200">{formatCurrency(acctActual, sym)}</td>
                    <td className={`px-4 py-2 text-right font-mono font-semibold ${varClass(acctVar)}`}>
                      {acctVar !== 0 ? (acctVar > 0 ? '+' : '') + formatCurrency(acctVar, sym) : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${acctPct > 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(acctPct, 100)}%` }}
                          />
                        </div>
                        <span className={`w-10 text-right ${varClass(acctVar)}`}>{acctPct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>,
                  // Line item rows
                  ...account.lineItems.map(item => {
                    const v = (item.actualSpend ?? 0) - item.total;
                    return (
                      <tr key={item.id} className="border-b border-gray-800/60 hover:bg-gray-800/30">
                        <td className="pl-10 pr-4 py-1.5 text-gray-400">{item.description}</td>
                        <td className="px-4 py-1.5 text-right font-mono text-gray-500">{formatCurrency(item.total, sym)}</td>
                        <td className="px-4 py-1.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <span className="text-gray-400 mr-0.5">{sym}</span>
                            <input
                              type="number"
                              value={item.actualSpend ?? ''}
                              placeholder="0"
                              onChange={e => dispatch({
                                type: 'UPDATE_ACTUAL',
                                payload: {
                                  accountId: account.id,
                                  lineItemId: item.id,
                                  actualSpend: parseFloat(e.target.value) || 0,
                                },
                              })}
                              className="w-24 bg-transparent border-b border-gray-600 focus:border-amber-500 outline-none text-gray-200 py-0.5 text-right focus:bg-gray-700 rounded-sm px-1"
                            />
                          </div>
                        </td>
                        <td className={`px-4 py-1.5 text-right font-mono ${varClass(v)}`}>
                          {item.actualSpend !== undefined ? (v > 0 ? '+' : '') + formatCurrency(v, sym) : '—'}
                        </td>
                        <td className="px-4 py-1.5" />
                      </tr>
                    );
                  })
                ];
              })
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
