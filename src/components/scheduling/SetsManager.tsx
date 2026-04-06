import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduling } from '../../stores/schedulingStore';
import type { ProductionSet, SetStatus } from '../../types/scheduling';

type Tab = 'overview' | 'timeline' | 'budget';

const STATUS_COLORS: Record<SetStatus, string> = {
  'Planned': 'bg-gray-600 text-gray-200',
  'In Construction': 'bg-yellow-700 text-yellow-100',
  'Ready': 'bg-green-700 text-green-100',
  'In Use': 'bg-blue-700 text-blue-100',
  'Strike Scheduled': 'bg-orange-700 text-orange-100',
  'Struck': 'bg-red-800 text-red-100',
  'Permanent': 'bg-purple-700 text-purple-100',
};

const STATUS_BAR_COLORS: Record<SetStatus, string> = {
  'Planned': '#4b5563',
  'In Construction': '#b45309',
  'Ready': '#15803d',
  'In Use': '#1d4ed8',
  'Strike Scheduled': '#c2410c',
  'Struck': '#991b1b',
  'Permanent': '#7c3aed',
};

const TYPE_ICONS: Record<string, string> = {
  'Studio Build': '🏗',
  'Practical Location': '📍',
  'Hybrid': '🔀',
  'Virtual/LED': '💡',
  'Green Screen': '🟩',
};

const EMPTY_SET: Omit<ProductionSet, 'id'> = {
  name: '',
  type: 'Studio Build',
  location: '',
  status: 'Planned',
  estimatedCost: 0,
  linkedScenes: [],
  linkedLocationName: '',
  departments: {},
  photos: [],
};

export default function SetsManager() {
  const { state, dispatch } = useScheduling();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<ProductionSet | null>(null);

  if (!state.project) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;
  }

  const { project } = state;
  const sets = project.sets ?? [];
  const { breakdowns } = project;

  const autoLinkedScenes = (set: ProductionSet | Omit<ProductionSet, 'id'>) =>
    breakdowns
      .filter(b => b.setName === set.linkedLocationName || b.location === set.linkedLocationName)
      .map(b => b.sceneNumber);

  const openNew = () => {
    setEditingSet({ ...EMPTY_SET, id: uuidv4() });
    setShowForm(true);
    setSelectedSetId(null);
  };

  const openEdit = (set: ProductionSet) => {
    setEditingSet({ ...set });
    setShowForm(true);
  };

  const saveSet = (set: ProductionSet) => {
    const withLinked = { ...set, linkedScenes: autoLinkedScenes(set) };
    if (sets.find(s => s.id === set.id)) {
      dispatch({ type: 'UPDATE_SET', payload: withLinked });
    } else {
      dispatch({ type: 'ADD_SET', payload: withLinked });
    }
    setShowForm(false);
    setEditingSet(null);
  };

  const deleteSet = (id: string) => {
    if (window.confirm('Delete this set?')) {
      dispatch({ type: 'DELETE_SET', payload: id });
      if (selectedSetId === id) setSelectedSetId(null);
    }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-xs font-semibold transition-colors ${activeTab === t ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`;

  const totalEstimated = sets.reduce((s, set) => s + set.estimatedCost, 0);
  const totalActual = sets.reduce((s, set) => s + (set.actualCost ?? 0), 0);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Sets Manager</h2>
          <p className="text-gray-500 text-xs">{sets.length} sets — Est. ${totalEstimated.toLocaleString()}</p>
        </div>
        <button onClick={openNew} className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
          + New Set
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 px-4 flex-shrink-0">
        <button className={tabClass('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={tabClass('timeline')} onClick={() => setActiveTab('timeline')}>Timeline</button>
        <button className={tabClass('budget')} onClick={() => setActiveTab('budget')}>Budget</button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-3 max-w-5xl">
              {sets.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No sets yet</p>
                  <p className="text-sm">Click + New Set to add a production set</p>
                </div>
              )}
              {sets.map(set => {
                const linked = autoLinkedScenes(set);
                const isSelected = selectedSetId === set.id;
                return (
                  <div
                    key={set.id}
                    onClick={() => setSelectedSetId(isSelected ? null : set.id)}
                    className={`bg-gray-800 rounded border cursor-pointer transition-colors hover:border-amber-500/50 ${isSelected ? 'border-amber-500' : 'border-gray-700'}`}
                  >
                    <div className="flex items-start justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{TYPE_ICONS[set.type] ?? '🎬'}</span>
                          <h3 className="text-gray-100 font-semibold">{set.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${STATUS_COLORS[set.status]}`}>
                            {set.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1">
                          <span>{set.type}</span>
                          <span>📍 {set.location}</span>
                          {linked.length > 0 && <span>🎬 Scenes: {linked.join(', ')}</span>}
                          <span>Est. ${set.estimatedCost.toLocaleString()}</span>
                          {set.actualCost != null && <span>Actual: ${set.actualCost.toLocaleString()}</span>}
                          {set.sqFootage && <span>{set.sqFootage} sq ft</span>}
                        </div>
                        {set.buildDate && (
                          <div className="flex gap-4 text-xs text-gray-500 mt-2">
                            {set.buildDate && <span>Build: {set.buildDate}</span>}
                            {set.readyDate && <span>Ready: {set.readyDate}</span>}
                            {set.strikeDate && <span>Strike: {set.strikeDate}</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button onClick={e => { e.stopPropagation(); openEdit(set); }}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">Edit</button>
                        <button onClick={e => { e.stopPropagation(); deleteSet(set.id); }}
                          className="px-2 py-1 bg-red-900/50 text-red-400 rounded text-xs hover:bg-red-800/50">Del</button>
                      </div>
                    </div>

                    {/* Department notes */}
                    {isSelected && Object.entries(set.departments).some(([, v]) => v) && (
                      <div className="px-4 pb-4 border-t border-gray-700 pt-3">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Department Notes</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(set.departments).map(([dept, note]) => note ? (
                            <div key={dept} className="bg-gray-700 rounded p-2">
                              <div className="text-xs font-semibold text-amber-400 capitalize mb-0.5">{dept}</div>
                              <div className="text-xs text-gray-300">{note}</div>
                            </div>
                          ) : null)}
                        </div>
                        {set.notes && (
                          <div className="mt-2 bg-gray-700 rounded p-2">
                            <div className="text-xs font-semibold text-amber-400 mb-0.5">Notes</div>
                            <div className="text-xs text-gray-300">{set.notes}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'timeline' && <TimelineView sets={sets} />}

          {activeTab === 'budget' && (
            <BudgetSummary sets={sets} totalEstimated={totalEstimated} totalActual={totalActual} />
          )}
        </div>

        {/* Edit panel */}
        {showForm && editingSet && (
          <SetDetailPanel
            set={editingSet}
            onChange={setEditingSet}
            onSave={() => saveSet(editingSet)}
            onClose={() => { setShowForm(false); setEditingSet(null); }}
          />
        )}
      </div>
    </div>
  );
}

function TimelineView({ sets }: { sets: ProductionSet[] }) {
  const setsWithDates = sets.filter(s => s.buildDate || s.readyDate || s.strikeDate);
  if (setsWithDates.length === 0) {
    return <div className="text-center py-12 text-gray-500">No sets have dates assigned yet.</div>;
  }

  // Find date range
  const allDates = setsWithDates.flatMap(s => [s.buildDate, s.readyDate, s.strikeDate].filter(Boolean) as string[]);
  const minDate = new Date(allDates.reduce((a, b) => a < b ? a : b));
  const maxDate = new Date(allDates.reduce((a, b) => a > b ? a : b));
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000)) + 7;

  const dateToX = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.max(0, Math.ceil((d.getTime() - minDate.getTime()) / 86400000));
  };

  return (
    <div className="max-w-5xl overflow-x-auto">
      <h3 className="text-gray-100 font-semibold text-sm mb-4">Build / Ready / Strike Timeline</h3>
      <div className="space-y-3">
        {setsWithDates.map(set => {
          const buildX = set.buildDate ? dateToX(set.buildDate) : (set.readyDate ? dateToX(set.readyDate) : 0);
          const readyX = set.readyDate ? dateToX(set.readyDate) : buildX;
          const strikeX = set.strikeDate ? dateToX(set.strikeDate) : readyX + 3;
          const barColor = STATUS_BAR_COLORS[set.status];

          return (
            <div key={set.id} className="flex items-center gap-3">
              <div className="w-40 flex-shrink-0">
                <div className="text-xs text-gray-200 font-medium truncate">{set.name}</div>
                <div className="text-xs text-gray-500">{set.location}</div>
              </div>
              <div className="flex-1 relative h-8 bg-gray-800 rounded overflow-hidden" style={{ minWidth: '300px' }}>
                {/* Build → Ready bar */}
                {set.buildDate && set.readyDate && (
                  <div
                    className="absolute h-4 top-0 rounded opacity-60"
                    style={{
                      left: `${(buildX / totalDays) * 100}%`,
                      width: `${((readyX - buildX) / totalDays) * 100}%`,
                      backgroundColor: '#b45309',
                    }}
                    title={`Build: ${set.buildDate} → Ready: ${set.readyDate}`}
                  />
                )}
                {/* Ready → Strike bar */}
                {set.readyDate && (
                  <div
                    className="absolute h-4 bottom-0 rounded opacity-80"
                    style={{
                      left: `${(readyX / totalDays) * 100}%`,
                      width: `${((strikeX - readyX) / totalDays) * 100}%`,
                      backgroundColor: barColor,
                    }}
                    title={`In use: ${set.readyDate} → ${set.strikeDate ?? 'ongoing'}`}
                  />
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0 ${STATUS_COLORS[set.status]}`}>
                {set.status}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 text-xs text-gray-500">
        <span>Start: {minDate.toLocaleDateString()}</span>
        <span>End: {maxDate.toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function BudgetSummary({ sets, totalEstimated, totalActual }: { sets: ProductionSet[]; totalEstimated: number; totalActual: number }) {
  const variance = totalActual - totalEstimated;
  return (
    <div className="max-w-3xl">
      <h3 className="text-gray-100 font-semibold text-sm mb-4">Budget Summary</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 rounded border border-gray-700 p-3">
          <div className="text-xs text-gray-400">Total Estimated</div>
          <div className="text-xl font-bold text-gray-100 font-mono mt-1">${totalEstimated.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 rounded border border-gray-700 p-3">
          <div className="text-xs text-gray-400">Total Actual</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">${totalActual.toLocaleString()}</div>
        </div>
        <div className={`bg-gray-800 rounded border p-3 ${variance > 0 ? 'border-red-700' : 'border-green-700'}`}>
          <div className="text-xs text-gray-400">Variance</div>
          <div className={`text-xl font-bold font-mono mt-1 ${variance > 0 ? 'text-red-400' : variance < 0 ? 'text-green-400' : 'text-gray-300'}`}>
            {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
          </div>
        </div>
      </div>

      <table className="w-full text-xs">
        <thead className="bg-gray-800 border-b border-gray-600">
          <tr className="text-gray-400 font-semibold">
            <th className="px-3 py-2 text-left">Set Name</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-right">Estimated</th>
            <th className="px-3 py-2 text-right">Actual</th>
            <th className="px-3 py-2 text-right">Variance</th>
          </tr>
        </thead>
        <tbody>
          {sets.map(set => {
            const v = (set.actualCost ?? 0) - set.estimatedCost;
            return (
              <tr key={set.id} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="px-3 py-2 text-gray-200 font-medium">{set.name}</td>
                <td className="px-3 py-2 text-gray-400">{set.type}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[set.status]}`}>{set.status}</span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-gray-300">${set.estimatedCost.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-300">
                  {set.actualCost != null ? `$${set.actualCost.toLocaleString()}` : '—'}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${set.actualCost != null ? (v > 0 ? 'text-red-400' : 'text-green-400') : 'text-gray-600'}`}>
                  {set.actualCost != null ? `${v >= 0 ? '+' : ''}$${v.toLocaleString()}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-800 border-t border-gray-600">
          <tr>
            <td colSpan={3} className="px-3 py-2 text-right font-bold text-gray-200">Total</td>
            <td className="px-3 py-2 text-right font-bold font-mono text-gray-200">${totalEstimated.toLocaleString()}</td>
            <td className="px-3 py-2 text-right font-bold font-mono text-amber-400">${totalActual.toLocaleString()}</td>
            <td className={`px-3 py-2 text-right font-bold font-mono ${variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SetDetailPanel({ set, onChange, onSave, onClose }: {
  set: ProductionSet;
  onChange: (s: ProductionSet) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const f = <K extends keyof ProductionSet>(key: K, val: ProductionSet[K]) => onChange({ ...set, [key]: val });
  const fd = (key: keyof ProductionSet['departments'], val: string) =>
    onChange({ ...set, departments: { ...set.departments, [key]: val || undefined } });

  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none";
  const labelClass = "block text-xs text-gray-400 mb-1";

  const statuses: SetStatus[] = ['Planned', 'In Construction', 'Ready', 'In Use', 'Strike Scheduled', 'Struck', 'Permanent'];
  const types = ['Studio Build', 'Practical Location', 'Hybrid', 'Virtual/LED', 'Green Screen'] as const;

  return (
    <div className="w-96 border-l border-gray-700 bg-gray-850 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-gray-100 font-semibold text-sm">{set.name || 'New Set'}</h3>
        <div className="flex gap-2">
          <button onClick={onSave} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">Save</button>
          <button onClick={onClose} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div>
          <label className={labelClass}>Set Name</label>
          <input value={set.name} onChange={e => f('name', e.target.value)} className={inputClass} placeholder="ICU Room 412" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Type</label>
            <select value={set.type} onChange={e => f('type', e.target.value as ProductionSet['type'])} className={inputClass}>
              {types.map(t => <option key={t} value={t} className="bg-gray-800">{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={set.status} onChange={e => f('status', e.target.value as SetStatus)} className={inputClass}>
              {statuses.map(s => <option key={s} value={s} className="bg-gray-800">{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Location / Stage</label>
          <input value={set.location} onChange={e => f('location', e.target.value)} className={inputClass} placeholder="Stage A — Lot" />
        </div>
        <div>
          <label className={labelClass}>Linked Location Name (for auto-scene matching)</label>
          <input value={set.linkedLocationName} onChange={e => f('linkedLocationName', e.target.value)} className={inputClass} placeholder="Matches breakdown set/location name" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Estimated Cost ($)</label>
            <input type="number" value={set.estimatedCost} onChange={e => f('estimatedCost', parseFloat(e.target.value) || 0)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Actual Cost ($)</label>
            <input type="number" value={set.actualCost ?? ''} onChange={e => f('actualCost', e.target.value ? parseFloat(e.target.value) : undefined)} className={inputClass} placeholder="—" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Square Footage</label>
          <input type="number" value={set.sqFootage ?? ''} onChange={e => f('sqFootage', e.target.value ? parseInt(e.target.value) : undefined)} className={inputClass} placeholder="—" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>Build Date</label>
            <input type="date" value={set.buildDate ?? ''} onChange={e => f('buildDate', e.target.value || undefined)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ready Date</label>
            <input type="date" value={set.readyDate ?? ''} onChange={e => f('readyDate', e.target.value || undefined)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Strike Date</label>
            <input type="date" value={set.strikeDate ?? ''} onChange={e => f('strikeDate', e.target.value || undefined)} className={inputClass} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">Department Notes</h4>
          {(['art', 'construction', 'paint', 'greens', 'electric', 'grip', 'props', 'setDressing'] as const).map(dept => (
            <div key={dept} className="mb-2">
              <label className={labelClass}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</label>
              <textarea
                rows={2}
                value={set.departments[dept] ?? ''}
                onChange={e => fd(dept, e.target.value)}
                className={`${inputClass} resize-none text-xs`}
                placeholder={`${dept} notes…`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className={labelClass}>General Notes</label>
          <textarea rows={3} value={set.notes ?? ''} onChange={e => f('notes', e.target.value || undefined)} className={`${inputClass} resize-none`} />
        </div>
      </div>
    </div>
  );
}
