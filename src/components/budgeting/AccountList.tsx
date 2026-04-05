import { useState, useEffect, useRef } from 'react';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';
import type { LineItem, Account, AccountGroup } from '../../types/budgeting';

export default function AccountList() {
  const { state, dispatch } = useBudgeting();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Fix 1: Auto-expand + scroll to selectedAccountId when set (e.g. from TopSheet)
  useEffect(() => {
    if (state.selectedAccountId) {
      setExpandedIds(prev => new Set([...prev, state.selectedAccountId!]));
      setTimeout(() => {
        rowRefs.current.get(state.selectedAccountId!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [state.selectedAccountId]);

  if (!state.project) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;
  }

  const { project } = state;
  const sym = project.globals.currencySymbol;

  const toggleExpand = (accountId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
        dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: accountId });
      }
      return next;
    });
  };

  const handleAddItem = (accountId: string) => dispatch({ type: 'ADD_LINE_ITEM', payload: { accountId } });
  const handleUpdateItem = (accountId: string, item: LineItem) => dispatch({ type: 'UPDATE_LINE_ITEM', payload: { accountId, lineItem: item } });
  const handleDeleteItem = (accountId: string, lineItemId: string) => dispatch({ type: 'DELETE_LINE_ITEM', payload: { accountId, lineItemId } });

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-gray-100 font-semibold text-sm">Accounts</h2>
        <p className="text-gray-500 text-xs">{project.name} — click an account to expand line items</p>
      </div>

      <div className="flex-1 overflow-auto">
        {project.accountGroups.map((group: AccountGroup) => (
          <div key={group.id}>
            {/* Group header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-600 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">{group.code}</span>
                <span className="text-sm font-bold text-gray-100 uppercase tracking-wide">{group.name}</span>
              </div>
              <span className="text-sm font-bold text-amber-400 font-mono">{formatCurrency(group.subtotal, sym)}</span>
            </div>

            {/* Accounts */}
            {group.accounts.map((account: Account) => {
              const isExpanded = expandedIds.has(account.id);
              const isSelected = state.selectedAccountId === account.id;
              return (
                <div
                  key={account.id}
                  ref={el => { if (el) rowRefs.current.set(account.id, el); }}
                >
                  {/* Account row */}
                  <div
                    onClick={() => toggleExpand(account.id)}
                    className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-800 cursor-pointer group transition-colors ${
                      isSelected || isExpanded ? 'bg-gray-750 border-l-2 border-l-amber-500' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 text-xs w-4 text-center font-bold select-none">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono w-12">{account.code}</span>
                      <span className={`text-sm ${isSelected || isExpanded ? 'text-amber-400 font-semibold' : 'text-gray-300 group-hover:text-gray-100'}`}>
                        {account.name}
                      </span>
                      <span className="text-xs text-gray-600">{account.lineItems.length} items</span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-gray-200">{formatCurrency(account.subtotal, sym)}</span>
                  </div>

                  {/* Inline expanded line items */}
                  {isExpanded && (
                    <div className="bg-gray-850 border-b border-gray-700">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-800 border-b border-gray-700">
                          <tr className="text-gray-400 font-semibold">
                            <th className="px-4 py-2 text-left pl-12">Description</th>
                            <th className="px-3 py-2 text-right w-16">Units</th>
                            <th className="px-3 py-2 text-left w-24">Unit Type</th>
                            <th className="px-3 py-2 text-right w-24">Rate</th>
                            <th className="px-3 py-2 text-right w-16">Qty</th>
                            <th className="px-3 py-2 text-right w-28">Subtotal</th>
                            <th className="px-3 py-2 text-right w-24">Fringes</th>
                            <th className="px-3 py-2 text-right w-28">Total</th>
                            <th className="px-3 py-2 w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {account.lineItems.map((item: LineItem) => (
                            <InlineLineItemRow
                              key={item.id}
                              item={item}
                              sym={sym}
                              onUpdate={(updated) => handleUpdateItem(account.id, updated)}
                              onDelete={() => handleDeleteItem(account.id, item.id)}
                            />
                          ))}
                          {account.lineItems.length === 0 && (
                            <tr>
                              <td colSpan={9} className="px-4 py-3 text-gray-600 italic text-center">No line items — click Add to create one</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-gray-800 border-t border-gray-600">
                          <tr>
                            <td colSpan={5} className="px-4 py-2 text-right text-xs font-bold text-gray-300">Account Total:</td>
                            <td className="px-3 py-2 text-right text-xs font-mono text-gray-300">
                              {formatCurrency(account.lineItems.reduce((s, i) => s + i.subtotal, 0), sym)}
                            </td>
                            <td className="px-3 py-2 text-right text-xs font-mono text-gray-300">
                              {formatCurrency(account.lineItems.reduce((s, i) => s + i.fringeTotal, 0), sym)}
                            </td>
                            <td className="px-3 py-2 text-right text-sm font-bold font-mono text-amber-400">
                              {formatCurrency(account.subtotal, sym)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                      <div className="px-4 py-2 border-t border-gray-700 flex justify-end bg-gray-800">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddItem(account.id); }}
                          className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400"
                        >
                          + Add Line Item
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Grand total footer */}
        <div className="border-t-2 border-gray-600 bg-gray-800 sticky bottom-0">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Grand Total</span>
            <span className="text-sm font-mono font-bold text-gray-200">{formatCurrency(project.grandTotal, sym)}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2.5">
            <span className="text-sm font-bold text-gray-100">With Contingency ({project.globals.contingencyPercent}%)</span>
            <span className="text-base font-bold text-amber-400 font-mono">{formatCurrency(project.totalWithContingency, sym)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineLineItemRow({ item, sym, onUpdate, onDelete }: {
  item: LineItem; sym: string;
  onUpdate: (item: LineItem) => void;
  onDelete: () => void;
}) {
  const set = <K extends keyof LineItem>(key: K, val: LineItem[K]) => onUpdate({ ...item, [key]: val });

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800 group">
      <td className="px-3 py-1.5 pl-12">
        <input
          value={item.description}
          onChange={e => set('description', e.target.value)}
          className="w-full bg-transparent border-b border-transparent focus:border-amber-500 outline-none text-gray-200 py-0.5 px-1 focus:bg-gray-700 rounded-sm min-w-36"
        />
      </td>
      <td className="px-3 py-1.5">
        <input type="number" value={item.units} onChange={e => set('units', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5" />
      </td>
      <td className="px-3 py-1.5">
        <select value={item.unitType} onChange={e => set('unitType', e.target.value)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-gray-200 py-0.5">
          {['Days', 'Weeks', 'Flat', 'Allow', 'Lot', 'Hours', 'Miles'].map(t => (
            <option key={t} value={t} className="bg-gray-800">{t}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-1.5">
        <input type="number" value={item.rate} onChange={e => set('rate', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5" />
      </td>
      <td className="px-3 py-1.5">
        <input type="number" value={item.quantity} onChange={e => set('quantity', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5" />
      </td>
      <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{formatCurrency(item.subtotal, sym)}</td>
      <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{formatCurrency(item.fringeTotal, sym)}</td>
      <td className="px-3 py-1.5 text-right text-gray-200 font-mono font-semibold">{formatCurrency(item.total, sym)}</td>
      <td className="px-1 py-1.5">
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 px-1 text-xs">✕</button>
      </td>
    </tr>
  );
}
