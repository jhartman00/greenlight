import { useBudgeting } from '../../stores/budgetingStore';
import type { Fringe } from '../../types/budgeting';

const PRESETS: { name: string; fringes: Omit<Fringe, 'id' | 'appliesTo' | 'enabled'>[] }[] = [
  {
    name: 'US Standard',
    fringes: [
      { name: 'Social Security (FICA)', type: 'percentage', value: 6.2, cap: 160200 },
      { name: 'Medicare', type: 'percentage', value: 1.45 },
      { name: 'Federal Unemployment (FUI)', type: 'percentage', value: 0.6, cap: 7000 },
      { name: 'State Unemployment (SUI)', type: 'percentage', value: 3.4, cap: 7000 },
    ],
  },
  {
    name: 'SAG-AFTRA',
    fringes: [
      { name: 'SAG Pension', type: 'percentage', value: 19 },
      { name: 'SAG H&W', type: 'percentage', value: 1 },
    ],
  },
  {
    name: 'DGA',
    fringes: [
      { name: 'DGA Pension', type: 'percentage', value: 15 },
      { name: 'DGA H&W', type: 'percentage', value: 6 },
    ],
  },
  {
    name: 'IATSE',
    fringes: [
      { name: 'IATSE Pension', type: 'percentage', value: 8 },
      { name: 'IATSE H&W', type: 'percentage', value: 8.5 },
    ],
  },
];

export default function FringesEditor() {
  const { state, dispatch } = useBudgeting();
  const project = state.project;

  if (!project) return <div className="p-6 text-gray-400">No project loaded.</div>;

  const { fringes } = project;
  const sym = project.globals.currencySymbol;

  const handleUpdate = (fringe: Fringe) => dispatch({ type: 'UPDATE_FRINGE', payload: fringe });
  const handleAdd = () => dispatch({ type: 'ADD_FRINGE' });
  const handleDelete = (id: string) => dispatch({ type: 'DELETE_FRINGE', payload: id });
  const handleToggle = (fringe: Fringe) => handleUpdate({ ...fringe, enabled: !fringe.enabled });

  const handleLoadPreset = (presetIdx: number) => {
    const preset = PRESETS[presetIdx];
    if (!preset) return;
    if (!window.confirm(`Load "${preset.name}" fringe preset? This will add ${preset.fringes.length} fringes.`)) return;
    preset.fringes.forEach(() => dispatch({ type: 'ADD_FRINGE' }));
    // We need to update them after adding — simplify by using SET_PROJECT
    const { v4: uuidv4 } = { v4: () => Math.random().toString(36).slice(2) };
    const newFringes: Fringe[] = preset.fringes.map(f => ({
      ...f,
      id: uuidv4(),
      appliesTo: [],
      enabled: true,
    }));
    dispatch({
      type: 'SET_PROJECT',
      payload: { ...project, fringes: [...fringes, ...newFringes] },
    });
  };

  const totalFringeImpact = project.accountGroups.reduce((sum, g) =>
    sum + g.accounts.reduce((aSum, a) =>
      aSum + a.lineItems.reduce((iSum, i) => iSum + i.fringeTotal, 0), 0), 0);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-white">Fringe Benefits</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {fringes.filter(f => f.enabled).length} active fringes · Total impact:{' '}
            <span className="text-amber-400 font-mono">{sym}{totalFringeImpact.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
              Load Preset ▾
            </button>
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 hidden group-hover:block min-w-40">
              {PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => handleLoadPreset(i)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-400 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
          >
            + Add Fringe
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {fringes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No fringes configured.</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded text-sm"
            >
              Add First Fringe
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-8">On</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left w-28">Type</th>
                <th className="px-4 py-3 text-right w-24">Value</th>
                <th className="px-4 py-3 text-right w-32">Cap ({sym})</th>
                <th className="px-4 py-3 text-right w-24">Impact</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {fringes.map(fringe => {
                const impact = project.accountGroups.reduce((sum, g) =>
                  sum + g.accounts.reduce((aSum, a) => {
                    if (fringe.appliesTo.length > 0 && !fringe.appliesTo.includes(a.id)) return aSum;
                    return aSum + a.lineItems.reduce((iSum, item) => {
                      if (!fringe.enabled) return iSum;
                      const sub = item.subtotal;
                      if (fringe.type === 'percentage') {
                        const base = fringe.cap ? Math.min(sub, fringe.cap) : sub;
                        return iSum + (base * fringe.value / 100);
                      }
                      return iSum + fringe.value;
                    }, 0);
                  }, 0), 0);

                return (
                  <tr key={fringe.id} className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${!fringe.enabled ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleToggle(fringe)}
                        className={`w-8 h-5 rounded-full transition-colors relative ${fringe.enabled ? 'bg-amber-500' : 'bg-gray-600'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${fringe.enabled ? 'translate-x-3' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={fringe.name}
                        onChange={e => handleUpdate({ ...fringe, name: e.target.value })}
                        className="bg-transparent border-0 border-b border-transparent focus:border-amber-500 outline-none text-gray-200 py-0.5 px-1 w-full focus:bg-gray-700 rounded-sm"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={fringe.type}
                        onChange={e => handleUpdate({ ...fringe, type: e.target.value as Fringe['type'] })}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat ($)</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={fringe.value}
                          onChange={e => handleUpdate({ ...fringe, value: parseFloat(e.target.value) || 0 })}
                          className="w-20 bg-transparent border-0 border-b border-gray-700 focus:border-amber-500 outline-none text-gray-200 py-0.5 text-right focus:bg-gray-700 rounded-sm px-1"
                          step={fringe.type === 'percentage' ? 0.01 : 1}
                        />
                        <span className="text-gray-500 text-xs">{fringe.type === 'percentage' ? '%' : sym}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <input
                        type="number"
                        value={fringe.cap ?? ''}
                        placeholder="No cap"
                        onChange={e => {
                          const v = parseFloat(e.target.value);
                          handleUpdate({ ...fringe, cap: isNaN(v) ? undefined : v });
                        }}
                        className="w-28 bg-transparent border-0 border-b border-gray-700 focus:border-amber-500 outline-none text-gray-200 py-0.5 text-right focus:bg-gray-700 rounded-sm px-1 placeholder-gray-600"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300 text-xs">
                      {sym}{impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => handleDelete(fringe.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                        title="Delete fringe"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700 px-6 py-3 bg-gray-800 flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
        <span>Fringes with no accounts in "Applies To" apply to all accounts.</span>
        <span className="ml-auto">Total fringe burden: <span className="text-amber-400 font-mono">{sym}{totalFringeImpact.toLocaleString()}</span></span>
      </div>
    </div>
  );
}
