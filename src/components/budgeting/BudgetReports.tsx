import { useState } from 'react';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';

type ReportTab = 'summary' | 'detail' | 'variance';

export default function BudgetReports() {
  const { state } = useBudgeting();
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project } = state;
  const sym = project.globals.currencySymbol;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Budget Reports</h2>
          <p className="text-gray-500 text-xs">{project.name}</p>
        </div>
        <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 no-print">Print</button>
      </div>

      <div className="flex border-b border-gray-700 bg-gray-800 flex-shrink-0 no-print">
        {(['summary', 'detail', 'variance'] as ReportTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 capitalize ${activeTab === tab ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5">
        {activeTab === 'summary' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-gray-100 mb-1">{project.name}</h3>
            <p className="text-xs text-gray-500 mb-6">Budget Summary - {new Date().toLocaleDateString()}</p>
            <table className="w-full text-sm mb-6">
              <thead className="border-b border-gray-700">
                <tr className="text-xs text-gray-400 font-semibold">
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">%</th>
                </tr>
              </thead>
              <tbody>
                {project.accountGroups.map(group => (
                  <tr key={group.id} className="border-b border-gray-800">
                    <td className="py-2.5 text-gray-200 font-semibold">{group.code} - {group.name}</td>
                    <td className="py-2.5 text-right text-gray-200 font-mono">{formatCurrency(group.subtotal, sym)}</td>
                    <td className="py-2.5 text-right text-gray-400">{project.grandTotal > 0 ? ((group.subtotal / project.grandTotal) * 100).toFixed(1) : '0'}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-600">
                <tr><td className="py-2.5 font-bold text-gray-200">Grand Total</td><td className="py-2.5 text-right font-bold text-gray-200 font-mono">{formatCurrency(project.grandTotal, sym)}</td><td className="py-2.5 text-right text-gray-400">100%</td></tr>
                <tr><td className="py-1 text-gray-400">Contingency ({project.globals.contingencyPercent}%)</td><td className="py-1 text-right text-gray-400 font-mono">{formatCurrency(project.contingency, sym)}</td><td /></tr>
                <tr><td className="py-2.5 font-bold text-amber-400 text-base">Total with Contingency</td><td className="py-2.5 text-right font-bold text-amber-400 text-base font-mono">{formatCurrency(project.totalWithContingency, sym)}</td><td /></tr>
              </tfoot>
            </table>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm">
              <h4 className="font-semibold text-gray-300 mb-3">Production Schedule</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold text-amber-400">{project.globals.prepWeeks}</div><div className="text-xs text-gray-400">Prep Weeks</div></div>
                <div><div className="text-2xl font-bold text-amber-400">{project.globals.shootWeeks}</div><div className="text-xs text-gray-400">Shoot Weeks</div></div>
                <div><div className="text-2xl font-bold text-amber-400">{project.globals.wrapWeeks}</div><div className="text-xs text-gray-400">Wrap Weeks</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="max-w-4xl">
            <h3 className="text-lg font-bold text-gray-100 mb-1">{project.name}</h3>
            <p className="text-xs text-gray-500 mb-6">Budget Detail - {new Date().toLocaleDateString()}</p>
            {project.accountGroups.map(group => (
              <div key={group.id} className="mb-6">
                <div className="bg-gray-800 px-4 py-2 rounded-t border border-gray-700 flex justify-between">
                  <span className="font-bold text-gray-100">{group.code} - {group.name}</span>
                  <span className="font-bold text-gray-100 font-mono">{formatCurrency(group.subtotal, sym)}</span>
                </div>
                {group.accounts.map(account => (
                  <div key={account.id} className="border-b border-x border-gray-700">
                    <div className="px-4 py-2 bg-gray-800 flex justify-between text-sm">
                      <span className="text-gray-300 font-semibold">{account.code} - {account.name}</span>
                      <span className="text-gray-300 font-mono font-semibold">{formatCurrency(account.subtotal, sym)}</span>
                    </div>
                    {account.lineItems.map(item => (
                      <div key={item.id} className="px-8 py-1.5 flex items-center gap-4 text-xs text-gray-400 hover:bg-gray-800">
                        <span className="flex-1">{item.description}</span>
                        <span className="w-12 text-right">{item.units}</span>
                        <span className="w-16">{item.unitType}</span>
                        <span className="w-20 text-right font-mono">{formatCurrency(item.rate, sym)}</span>
                        <span className="w-8 text-right">x{item.quantity}</span>
                        <span className="w-24 text-right font-mono text-gray-300">{formatCurrency(item.total, sym)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'variance' && (
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-gray-100 mb-1">{project.name}</h3>
            <p className="text-xs text-gray-500 mb-6">Budget vs Actuals - {new Date().toLocaleDateString()}</p>
            {!project.lockedBudget && (
              <div className="bg-amber-900 border border-amber-700 rounded p-3 mb-4 text-sm text-amber-200">
                No locked budget found. Lock the budget from the Top Sheet to enable variance tracking.
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-xs text-gray-400 font-semibold">
                  <th className="text-left py-2">Account</th>
                  <th className="text-right py-2">Budget</th>
                  <th className="text-right py-2">Actuals</th>
                  <th className="text-right py-2">Variance</th>
                </tr>
              </thead>
              <tbody>
                {project.accountGroups.flatMap(g => g.accounts).map(account => {
                  const actuals = account.lineItems.reduce((s, i) => s + (i.actualSpend ?? 0), 0);
                  const variance = actuals - account.subtotal;
                  return (
                    <tr key={account.id} className="border-b border-gray-800">
                      <td className="py-2 text-gray-300">{account.code} - {account.name}</td>
                      <td className="py-2 text-right font-mono text-gray-400">{formatCurrency(account.subtotal, sym)}</td>
                      <td className="py-2 text-right font-mono text-gray-300">{formatCurrency(actuals, sym)}</td>
                      <td className={`py-2 text-right font-mono font-semibold ${variance > 0 ? 'text-red-400' : variance < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                        {variance > 0 ? '+' : ''}{formatCurrency(variance, sym)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
