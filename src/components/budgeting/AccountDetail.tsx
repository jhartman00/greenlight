
import { useNavigate } from 'react-router-dom';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';
import type { LineItem } from '../../types/budgeting';



export default function AccountDetail() {
  const { state, dispatch } = useBudgeting();
  const navigate = useNavigate();

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project, selectedAccountId } = state;
  const sym = project.globals.currencySymbol;

  let foundAccount = null;
  let foundGroup = null;
  for (const group of project.accountGroups) {
    for (const account of group.accounts) {
      if (account.id === selectedAccountId) { foundAccount = account; foundGroup = group; break; }
    }
    if (foundAccount) break;
  }

  if (!foundAccount || !foundGroup) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
        <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-gray-100 font-semibold text-sm">Account Detail</h2>
          <p className="text-gray-500 text-xs">Select an account from the Top Sheet</p>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {project.accountGroups.map(group => (
            <div key={group.id} className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{group.code} — {group.name}</h3>
              <div className="space-y-1">
                {group.accounts.map(acct => (
                  <button key={acct.id} onClick={() => dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: acct.id })}
                    className="w-full text-left flex items-center justify-between px-4 py-2.5 bg-gray-800 rounded border border-gray-700 hover:border-amber-500 hover:bg-gray-700 group">
                    <div>
                      <span className="text-xs text-gray-500 mr-2">{acct.code}</span>
                      <span className="text-sm text-gray-200 group-hover:text-amber-400">{acct.name}</span>
                    </div>
                    <span className="text-sm font-mono text-gray-300">{formatCurrency(acct.subtotal, sym)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const account = foundAccount;
  const group = foundGroup;

  const handleUpdateItem = (item: LineItem) => dispatch({ type: 'UPDATE_LINE_ITEM', payload: { accountId: account.id, lineItem: item } });
  const handleAddItem = () => dispatch({ type: 'ADD_LINE_ITEM', payload: { accountId: account.id } });
  const handleDeleteItem = (lineItemId: string) => dispatch({ type: 'DELETE_LINE_ITEM', payload: { accountId: account.id, lineItemId } });

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/budgeting/topsheet')} className="text-gray-400 hover:text-amber-400">Top Sheet</button>
          <span className="text-gray-600">›</span>
          <span className="text-gray-500 text-xs">{group.name}</span>
          <span className="text-gray-600">›</span>
          <span className="text-gray-100 font-semibold">{account.code} — {account.name}</span>
        </div>
        <button onClick={handleAddItem} className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
          + Add Line Item
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
            <tr className="text-gray-400 font-semibold">
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-right w-16">Units</th>
              <th className="px-3 py-2 text-left w-24">Unit Type</th>
              <th className="px-3 py-2 text-right w-24">Rate</th>
              <th className="px-3 py-2 text-right w-16">Qty</th>
              <th className="px-3 py-2 text-right w-24">Subtotal</th>
              <th className="px-3 py-2 text-right w-24">Fringes</th>
              <th className="px-3 py-2 text-right w-24">Total</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {account.lineItems.map(item => (
              <LineItemRow key={item.id} item={item} sym={sym} onUpdate={handleUpdateItem} onDelete={() => handleDeleteItem(item.id)} />
            ))}
          </tbody>
          <tfoot className="bg-gray-800 border-t border-gray-600">
            <tr>
              <td colSpan={5} className="px-3 py-3 text-right text-sm font-bold text-gray-200">Account Total:</td>
              <td className="px-3 py-3 text-right text-sm font-mono text-gray-300">{formatCurrency(account.lineItems.reduce((s, i) => s + i.subtotal, 0), sym)}</td>
              <td className="px-3 py-3 text-right text-sm font-mono text-gray-300">{formatCurrency(account.lineItems.reduce((s, i) => s + i.fringeTotal, 0), sym)}</td>
              <td className="px-3 py-3 text-right text-sm font-bold font-mono text-amber-400">{formatCurrency(account.subtotal, sym)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border-t border-gray-700 px-4 py-2 flex gap-2 flex-wrap flex-shrink-0 bg-gray-800">
        {project.accountGroups.flatMap(g => g.accounts).map(acct => (
          <button key={acct.id} onClick={() => dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: acct.id })}
            className={`text-xs px-2 py-1 rounded transition-colors ${acct.id === account.id ? 'bg-amber-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-600'}`}>
            {acct.code}
          </button>
        ))}
      </div>
    </div>
  );
}

function LineItemRow({ item, sym, onUpdate, onDelete }: { item: LineItem; sym: string; onUpdate: (i: LineItem) => void; onDelete: () => void }) {
  const handleChange = <K extends keyof LineItem>(key: K, value: LineItem[K]) => onUpdate({ ...item, [key]: value });

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800 group">
      <td className="px-3 py-1.5">
        <input value={item.description} onChange={e => handleChange('description', e.target.value)}
          className="w-full bg-transparent border-b border-transparent focus:border-amber-500 outline-none text-gray-200 py-0.5 focus:bg-gray-700 rounded-sm px-1 min-w-32" />
      </td>
      <td className="px-3 py-1.5">
        <input type="number" value={item.units} onChange={e => handleChange('units', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5" />
      </td>
      <td className="px-3 py-1.5">
        <select value={item.unitType} onChange={e => handleChange('unitType', e.target.value)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-gray-200 py-0.5 text-xs">
          {['Days', 'Weeks', 'Flat', 'Allow', 'Lot', 'Hours', 'Miles'].map(t => <option key={t} value={t} className="bg-gray-800">{t}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5">
        <input type="number" value={item.rate} onChange={e => handleChange('rate', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5" />
      </td>
      <td className="px-3 py-1.5">
        <input type="number" value={item.quantity} onChange={e => handleChange('quantity', parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5" />
      </td>
      <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{formatCurrency(item.subtotal, sym)}</td>
      <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{formatCurrency(item.fringeTotal, sym)}</td>
      <td className="px-3 py-1.5 text-right text-gray-200 font-mono font-semibold">{formatCurrency(item.total, sym)}</td>
      <td className="px-1 py-1.5">
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 px-1">x</button>
      </td>
    </tr>
  );
}
