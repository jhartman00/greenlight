import { useNavigate, useParams } from 'react-router-dom';
import { useBudgeting } from '../../stores/budgetingStore';
import { formatCurrency } from '../../utils/calculations';
import type { LineItem } from '../../types/budgeting';

const UNIT_TYPES = ['Days', 'Weeks', 'Flat', 'Allow', 'Lot', 'Hours', 'Miles'];

export default function AccountDetail() {
  const { state, dispatch } = useBudgeting();
  const navigate = useNavigate();
  const { accountId } = useParams<{ groupId: string; accountId: string }>();

  if (!state.project) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>
  );

  const { project } = state;
  const sym = project.globals.currencySymbol;

  // Find the account using URL params (fall back to selectedAccountId)
  const resolvedAccountId = accountId || state.selectedAccountId;
  let foundAccount = null;
  let foundGroup = null;
  for (const group of project.accountGroups) {
    for (const account of group.accounts) {
      if (account.id === resolvedAccountId) {
        foundAccount = account;
        foundGroup = group;
        break;
      }
    }
    if (foundAccount) break;
  }

  if (!foundAccount || !foundGroup) {
    // Show selector
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
                  <button
                    key={acct.id}
                    onClick={() => { dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: acct.id }); }}
                    className="w-full text-left flex items-center justify-between px-4 py-2.5 bg-gray-800 rounded border border-gray-700 hover:border-amber-500 hover:bg-gray-700 transition-colors group"
                  >
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

  const handleUpdateItem = (item: LineItem) => {
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: { accountId: account.id, lineItem: item } });
  };

  const handleAddItem = () => {
    dispatch({ type: 'ADD_LINE_ITEM', payload: { accountId: account.id } });
  };

  const handleDeleteItem = (lineItemId: string) => {
    dispatch({ type: 'DELETE_LINE_ITEM', payload: { accountId: account.id, lineItemId } });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      {/* Header / breadcrumb */}
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/budgeting')}
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            Top Sheet
          </button>
          <span className="text-gray-600">›</span>
          <span className="text-gray-500 text-xs">{group.name}</span>
          <span className="text-gray-600">›</span>
          <span className="text-gray-100 font-semibold">{account.code} — {account.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddItem}
            className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400 transition-colors"
          >
            + Add Line Item
          </button>
        </div>
      </div>

      {/* Table */}
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
              <LineItemRow
                key={item.id}
                item={item}
                sym={sym}
                onUpdate={handleUpdateItem}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-800 border-t border-gray-600">
            <tr>
              <td colSpan={5} className="px-3 py-3 text-right text-sm font-bold text-gray-200">Account Total:</td>
              <td className="px-3 py-3 text-right text-sm font-mono text-gray-300">
                {formatCurrency(account.lineItems.reduce((s, i) => s + i.subtotal, 0), sym)}
              </td>
              <td className="px-3 py-3 text-right text-sm font-mono text-gray-300">
                {formatCurrency(account.lineItems.reduce((s, i) => s + i.fringeTotal, 0), sym)}
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold font-mono text-amber-400">
                {formatCurrency(account.subtotal, sym)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Account selector buttons */}
      <div className="border-t border-gray-700 px-4 py-2 flex gap-2 flex-wrap flex-shrink-0 bg-gray-800">
        {project.accountGroups.flatMap(g => g.accounts.map(a => ({ group: g, acct: a }))).map(({ group: g, acct }) => (
          <button
            key={acct.id}
            onClick={() => navigate(`/budgeting/account/${g.id}/${acct.id}`)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              acct.id === account.id
                ? 'bg-amber-500 text-gray-900 font-semibold'
                : 'bg-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
            }`}
          >
            {acct.code}
          </button>
        ))}
      </div>
    </div>
  );
}

interface LineItemRowProps {
  item: LineItem;
  sym: string;
  onUpdate: (item: LineItem) => void;
  onDelete: () => void;
}

function LineItemRow({ item, sym, onUpdate, onDelete }: LineItemRowProps) {
  const handleChange = <K extends keyof LineItem>(key: K, value: LineItem[K]) => {
    onUpdate({ ...item, [key]: value });
  };

  const numInput = (key: keyof LineItem, value: number) => (
    <input
      type="number"
      value={value}
      onChange={e => handleChange(key, parseFloat(e.target.value) || 0 as any)}
      className="w-full bg-transparent border-0 border-b border-gray-700 focus:border-amber-500 outline-none text-right text-gray-200 py-0.5 focus:bg-gray-700 rounded-sm px-1"
    />
  );

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800 group transition-colors">
      <td className="px-3 py-1.5">
        <input
          value={item.description}
          onChange={e => handleChange('description', e.target.value)}
          className="w-full bg-transparent border-0 border-b border-transparent focus:border-amber-500 outline-none text-gray-200 py-0.5 focus:bg-gray-700 rounded-sm px-1 min-w-32"
        />
      </td>
      <td className="px-3 py-1.5">{numInput('units', item.units)}</td>
      <td className="px-3 py-1.5">
        <select
          value={item.unitType}
          onChange={e => handleChange('unitType', e.target.value)}
          className="w-full bg-transparent border-0 border-b border-gray-700 focus:border-amber-500 outline-none text-gray-200 py-0.5 text-xs focus:bg-gray-700 rounded-sm"
        >
          {UNIT_TYPES.map(t => <option key={t} value={t} className="bg-gray-800">{t}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5">{numInput('rate', item.rate)}</td>
      <td className="px-3 py-1.5">{numInput('quantity', item.quantity)}</td>
      <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{formatCurrency(item.subtotal, sym)}</td>
      <td className="px-3 py-1.5 text-right text-gray-400 font-mono">{formatCurrency(item.fringeTotal, sym)}</td>
      <td className="px-3 py-1.5 text-right text-gray-200 font-mono font-semibold">{formatCurrency(item.total, sym)}</td>
      <td className="px-1 py-1.5">
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all px-1"
          title="Delete line item"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
