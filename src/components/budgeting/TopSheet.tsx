import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';

export default function TopSheet() {
  const { state, dispatch } = useBudgeting();
  const navigate = useNavigate();

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project } = state;
  const { grandTotal, contingency, totalWithContingency, lockedBudget } = project;
  const sym = project.globals.currencySymbol;

  const handleSelectAccount = (accountId: string) => {
    dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: accountId });
    navigate('/budgeting/accounts');
  };

  const handleLock = () => {
    if (window.confirm('Lock budget at current total?')) dispatch({ type: 'LOCK_BUDGET' });
  };

  const fringesTotal = project.accountGroups.reduce((sum, group) =>
    sum + group.accounts.reduce((aSum, acct) =>
      aSum + acct.lineItems.reduce((iSum, item) => iSum + item.fringeTotal, 0), 0), 0);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Top Sheet</h2>
          <p className="text-gray-500 text-xs">{project.name}</p>
        </div>
        <div className="flex gap-3">
          {lockedBudget && <div className="text-xs text-gray-400">Locked: <span className="text-amber-400 font-semibold">{formatCurrency(lockedBudget, sym)}</span></div>}
          <button onClick={handleLock} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
            {lockedBudget ? 'Re-lock Budget' : 'Lock Budget'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
            <tr className="text-gray-400 text-xs font-semibold">
              <th className="px-4 py-2 text-left w-20">Code</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-right w-32">Subtotal</th>
              {lockedBudget && <th className="px-4 py-2 text-right w-32">Variance</th>}
            </tr>
          </thead>
          <tbody>
            {project.accountGroups.map(group => (
              <React.Fragment key={group.id}>
                <tr className="bg-gray-800 border-t-2 border-gray-600">
                  <td className="px-4 py-2.5 text-gray-300 font-bold text-xs">{group.code}</td>
                  <td className="px-4 py-2.5 text-gray-100 font-bold text-xs uppercase tracking-wide">{group.name}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-100">{formatCurrency(group.subtotal, sym)}</td>
                  {lockedBudget && <td className="px-4 py-2.5 text-right text-gray-500">-</td>}
                </tr>
                {group.accounts.map(account => (
                  <tr key={account.id} onClick={() => handleSelectAccount(account.id)}
                    className="border-b border-gray-800 cursor-pointer hover:bg-gray-700 group">
                    <td className="px-4 py-2 text-gray-500 pl-8 text-xs">{account.code}</td>
                    <td className="px-4 py-2 text-gray-300 group-hover:text-amber-400">{account.name}</td>
                    <td className="px-4 py-2 text-right text-gray-300 font-mono text-xs">{formatCurrency(account.subtotal, sym)}</td>
                    {lockedBudget && <td className="px-4 py-2 text-right font-mono text-xs text-gray-500">-</td>}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="border-t-2 border-gray-600 bg-gray-800">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <span className="text-sm text-gray-400">Subtotal (Before Fringes)</span>
            <span className="text-sm text-gray-300 font-mono">{formatCurrency(grandTotal - fringesTotal, sym)}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <span className="text-sm text-gray-400">Fringes Total</span>
            <span className="text-sm text-gray-300 font-mono">{formatCurrency(fringesTotal, sym)}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <span className="text-sm text-gray-400">Grand Total</span>
            <span className="text-sm text-gray-200 font-mono">{formatCurrency(grandTotal, sym)}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <span className="text-sm text-gray-400">Contingency ({project.globals.contingencyPercent}%)</span>
            <span className="text-sm text-gray-300 font-mono">{formatCurrency(contingency, sym)}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-base font-bold text-gray-100">TOTAL WITH CONTINGENCY</span>
            <span className="text-base font-bold text-amber-400 font-mono">{formatCurrency(totalWithContingency, sym)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
