import { useState } from 'react';
import { useBudgeting } from '../../stores/budgetingStore';
import type { Fringe } from '../../types/budgeting';
import { v4 as uuidv4 } from 'uuid';

export default function FringesEditor() {
  const { state, dispatch } = useBudgeting();
  const [showPresets, setShowPresets] = useState(false);

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project } = state;
  const { fringes } = project;
  const allAccountIds = project.accountGroups.flatMap(g => g.accounts.map(a => a.id));

  const updateFringe = (fringe: Fringe) => dispatch({ type: 'UPDATE_FRINGE', payload: fringe });

  const deleteFringe = (id: string) => {
    if (window.confirm('Delete this fringe?')) dispatch({ type: 'DELETE_FRINGE', payload: id });
  };

  const handleApplyPreset = (presets: Array<Omit<Fringe, 'id' | 'appliesTo'>>) => {
    presets.forEach(p => {
      const newFringe: Fringe = { ...p, id: uuidv4(), appliesTo: allAccountIds };
      dispatch({ type: 'UPDATE_FRINGE', payload: newFringe });
    });
    setShowPresets(false);
  };

  const toggleAccountApplied = (fringe: Fringe, accountId: string) => {
    const has = fringe.appliesTo.includes(accountId);
    updateFringe({ ...fringe, appliesTo: has ? fringe.appliesTo.filter(id => id !== accountId) : [...fringe.appliesTo, accountId] });
  };

  const toggleAllAccounts = (fringe: Fringe) => {
    const allApplied = allAccountIds.every(id => fringe.appliesTo.includes(id));
    updateFringe({ ...fringe, appliesTo: allApplied ? [] : allAccountIds });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Fringes Editor</h2>
          <p className="text-gray-500 text-xs">{fringes.length} fringes defined</p>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setShowPresets(v => !v)} className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">Presets</button>
          <button onClick={() => dispatch({ type: 'ADD_FRINGE' })} className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">+ Add Fringe</button>
          {showPresets && (
            <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 z-10 min-w-48">
              <button onClick={() => handleApplyPreset([
                { name: 'Social Security (FICA)', type: 'percentage', value: 6.2, cap: 160200, enabled: true },
                { name: 'Medicare', type: 'percentage', value: 1.45, enabled: true },
                { name: 'Workers Compensation', type: 'percentage', value: 4.0, enabled: true },
              ])} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">US Standard Fringes</button>
              <button onClick={() => handleApplyPreset([
                { name: 'SAG-AFTRA Pension & Health', type: 'percentage', value: 19.0, enabled: true },
                { name: 'SAG-AFTRA Vacation Pay', type: 'percentage', value: 9.5, enabled: true },
              ])} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">SAG-AFTRA Package</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-4 max-w-3xl">
          {fringes.length === 0 && <div className="text-center text-gray-500 py-12">No fringes defined. Click "+ Add Fringe" or use Presets.</div>}
          {fringes.map(fringe => (
            <div key={fringe.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => updateFringe({ ...fringe, enabled: !fringe.enabled })}
                  className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${fringe.enabled ? 'bg-amber-500' : 'bg-gray-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${fringe.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <input value={fringe.name} onChange={e => updateFringe({ ...fringe, name: e.target.value })}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
                <select value={fringe.type} onChange={e => updateFringe({ ...fringe, type: e.target.value as Fringe['type'] })}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none">
                  <option value="percentage">%</option><option value="flat">Flat</option>
                </select>
                <input type="number" value={fringe.value} step={0.01} onChange={e => updateFringe({ ...fringe, value: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none text-right" />
                <span className="text-gray-400 text-sm">{fringe.type === 'percentage' ? '%' : '$'}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Cap:</span>
                  <input type="number" value={fringe.cap || ''} placeholder="None"
                    onChange={e => updateFringe({ ...fringe, cap: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none text-right" />
                </div>
                <button onClick={() => deleteFringe(fringe.id)} className="text-red-500 hover:text-red-400 px-2">x</button>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 font-medium">Applies to:</span>
                  <button onClick={() => toggleAllAccounts(fringe)} className="text-xs text-amber-400 hover:text-amber-300">
                    {allAccountIds.every(id => fringe.appliesTo.includes(id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.accountGroups.flatMap(g => g.accounts).map(acct => {
                    const applied = fringe.appliesTo.includes(acct.id);
                    return (
                      <button key={acct.id} onClick={() => toggleAccountApplied(fringe, acct.id)}
                        className={`text-xs px-2 py-0.5 rounded transition-colors ${applied ? 'bg-amber-500 text-gray-900 font-semibold' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                        {acct.code} {acct.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
