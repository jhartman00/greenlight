import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';

type ReportType = 'summary' | 'detail' | 'variance';

import { useState } from 'react';

export default function BudgetReports() {
  const { state } = useBudgeting();
  const [reportType, setReportType] = useState<ReportType>('summary');

  const project = state.project;
  if (!project) return <div className="p-6 text-gray-400">No project loaded.</div>;

  const sym = project.globals.currencySymbol;
  const { accountGroups, grandTotal, contingency, totalWithContingency, lockedBudget } = project;

  const fringesTotal = accountGroups.reduce((sum, g) =>
    sum + g.accounts.reduce((aSum, a) =>
      aSum + a.lineItems.reduce((iSum, i) => iSum + i.fringeTotal, 0), 0), 0);

  const totalActual = accountGroups.reduce((sum, g) =>
    sum + g.accounts.reduce((aSum, a) =>
      aSum + a.lineItems.reduce((iSum, i) => iSum + (i.actualSpend ?? 0), 0), 0), 0);

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 no-print">
        <div>
          <h1 className="text-xl font-bold text-white">Budget Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">{project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-700 rounded-lg p-1 gap-1">
            {([['summary', 'Summary'], ['detail', 'Detail'], ['variance', 'Variance']] as [ReportType, string][]).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${reportType === type ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Report title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {reportType === 'summary' ? 'Budget Summary Report' : reportType === 'detail' ? 'Budget Detail Report' : 'Budget vs Actuals Variance Report'}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Generated {new Date().toLocaleDateString()}</p>
        </div>

        {/* Summary report */}
        {reportType === 'summary' && (
          <div className="max-w-3xl mx-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-600">
                  <th className="text-left py-2 text-gray-400 font-semibold">Code</th>
                  <th className="text-left py-2 text-gray-400 font-semibold">Account</th>
                  <th className="text-right py-2 text-gray-400 font-semibold">Total</th>
                  <th className="text-right py-2 text-gray-400 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {accountGroups.map(group => (
                  <>
                    <tr key={group.id} className="bg-gray-800 border-t border-gray-600">
                      <td className="py-2 px-2 text-gray-300 font-bold text-xs">{group.code}</td>
                      <td className="py-2 px-2 text-gray-100 font-bold uppercase tracking-wide">{group.name}</td>
                      <td className="py-2 px-2 text-right font-bold text-gray-100 font-mono">{formatCurrency(group.subtotal, sym)}</td>
                      <td className="py-2 px-2 text-right text-gray-400 text-xs">
                        {grandTotal > 0 ? ((group.subtotal / grandTotal) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    {group.accounts.map(acct => (
                      <tr key={acct.id} className="border-b border-gray-800">
                        <td className="py-1.5 pl-6 text-gray-500 text-xs">{acct.code}</td>
                        <td className="py-1.5 px-2 text-gray-300">{acct.name}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-gray-300">{formatCurrency(acct.subtotal, sym)}</td>
                        <td className="py-1.5 px-2 text-right text-gray-500 text-xs">
                          {grandTotal > 0 ? ((acct.subtotal / grandTotal) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-600">
                <tr className="border-b border-gray-700"><td className="py-2 text-gray-400 text-sm" colSpan={2}>Grand Total</td><td className="py-2 text-right font-mono text-gray-200 font-semibold">{formatCurrency(grandTotal, sym)}</td><td /></tr>
                <tr className="border-b border-gray-700"><td className="py-2 text-gray-400 text-sm" colSpan={2}>Fringes Total</td><td className="py-2 text-right font-mono text-gray-300">{formatCurrency(fringesTotal, sym)}</td><td /></tr>
                <tr className="border-b border-gray-700"><td className="py-2 text-gray-400 text-sm" colSpan={2}>Contingency ({project.globals.contingencyPercent}%)</td><td className="py-2 text-right font-mono text-gray-300">{formatCurrency(contingency, sym)}</td><td /></tr>
                <tr className="bg-gray-800"><td className="py-3 text-base font-bold text-gray-100" colSpan={2}>TOTAL WITH CONTINGENCY</td><td className="py-3 text-right font-mono text-amber-400 font-bold text-base">{formatCurrency(totalWithContingency, sym)}</td><td /></tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Detail report */}
        {reportType === 'detail' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {accountGroups.map(group => (
              <div key={group.id}>
                <div className="bg-gray-800 px-4 py-2 rounded-t border-b-2 border-amber-600">
                  <span className="font-bold text-white text-sm">{group.code} — {group.name}</span>
                  <span className="float-right font-mono text-amber-400 font-bold">{formatCurrency(group.subtotal, sym)}</span>
                </div>
                {group.accounts.map(acct => (
                  <div key={acct.id} className="border border-gray-700 border-t-0 last:rounded-b overflow-hidden">
                    <div className="bg-gray-800/60 px-6 py-1.5 flex justify-between text-xs font-semibold text-gray-300 border-b border-gray-700">
                      <span>{acct.code} — {acct.name}</span>
                      <span className="font-mono">{formatCurrency(acct.subtotal, sym)}</span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-900/40">
                          <th className="text-left pl-8 pr-3 py-1.5 text-gray-500">Description</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Units</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Rate</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Qty</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Subtotal</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Fringes</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acct.lineItems.map(item => (
                          <tr key={item.id} className="border-b border-gray-800/60">
                            <td className="pl-8 pr-3 py-1.5 text-gray-300">{item.description}</td>
                            <td className="px-3 py-1.5 text-right text-gray-400">{item.units} {item.unitType}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-400">{formatCurrency(item.rate, sym)}</td>
                            <td className="px-3 py-1.5 text-right text-gray-400">{item.quantity}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-300">{formatCurrency(item.subtotal, sym)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-400">{formatCurrency(item.fringeTotal, sym)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-200 font-semibold">{formatCurrency(item.total, sym)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Variance report */}
        {reportType === 'variance' && (
          <div className="max-w-4xl mx-auto">
            {!lockedBudget && (
              <div className="mb-4 p-3 bg-amber-900/30 border border-amber-700 rounded-lg text-sm text-amber-300">
                No locked budget. Go to the Top Sheet and click "Lock Budget" to enable variance tracking.
              </div>
            )}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-600">
                  <th className="text-left py-2 text-gray-400">Account</th>
                  <th className="text-right py-2 text-gray-400">Budget</th>
                  <th className="text-right py-2 text-gray-400">Actual</th>
                  <th className="text-right py-2 text-gray-400">Variance</th>
                  <th className="text-right py-2 text-gray-400">%</th>
                </tr>
              </thead>
              <tbody>
                {accountGroups.map(group => (
                  <>
                    <tr key={group.id} className="bg-gray-800 border-t border-gray-600">
                      <td className="py-2 px-2 text-gray-100 font-bold" colSpan={5}>{group.code} — {group.name}</td>
                    </tr>
                    {group.accounts.map(acct => {
                      const actual = acct.lineItems.reduce((s, i) => s + (i.actualSpend ?? 0), 0);
                      const variance = actual - acct.subtotal;
                      const pct = acct.subtotal > 0 ? (variance / acct.subtotal) * 100 : 0;
                      return (
                        <tr key={acct.id} className="border-b border-gray-800">
                          <td className="py-1.5 pl-6 text-gray-300">{acct.code} {acct.name}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-gray-300">{formatCurrency(acct.subtotal, sym)}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-gray-300">{formatCurrency(actual, sym)}</td>
                          <td className={`py-1.5 px-2 text-right font-mono font-semibold ${variance > 0 ? 'text-red-400' : variance < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                            {variance !== 0 ? (variance > 0 ? '+' : '') + formatCurrency(variance, sym) : '—'}
                          </td>
                          <td className={`py-1.5 px-2 text-right text-xs ${variance > 0 ? 'text-red-400' : variance < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                            {pct !== 0 ? (pct > 0 ? '+' : '') + pct.toFixed(1) + '%' : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-600">
                <tr className="bg-gray-800">
                  <td className="py-2.5 px-2 font-bold text-gray-100">TOTAL</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-100">{formatCurrency(grandTotal, sym)}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-100">{formatCurrency(totalActual, sym)}</td>
                  <td className={`py-2.5 px-2 text-right font-mono font-bold ${(totalActual - grandTotal) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(totalActual - grandTotal) > 0 ? '+' : ''}{formatCurrency(totalActual - grandTotal, sym)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
