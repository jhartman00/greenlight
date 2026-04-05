import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduling } from '../../stores/schedulingStore';
import type { ExtraGroup, ExtrasVoucher } from '../../types/scheduling';

type MainTab = 'assignment' | 'vouchers';

const CATEGORY_COLORS: Record<ExtraGroup['category'], string> = {
  'SAG': 'bg-red-900 text-red-200',
  'Non-Union': 'bg-blue-900 text-blue-200',
  'Special Ability': 'bg-purple-900 text-purple-200',
  'Stand-In': 'bg-yellow-900 text-yellow-200',
  'Photo Double': 'bg-green-900 text-green-200',
};

const EMPTY_GROUP: Omit<ExtraGroup, 'id'> = {
  name: '',
  category: 'Non-Union',
  defaultRate: 182,
  defaultOvertimeRate: 273,
};

export default function ExtrasManager() {
  const { state, dispatch } = useScheduling();
  const [activeTab, setActiveTab] = useState<MainTab>('assignment');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<ExtraGroup | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);

  if (!state.project) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;
  }

  const { project } = state;
  const extraGroups = project.extraGroups ?? [];
  const sceneExtras = project.sceneExtras ?? [];
  const extrasVouchers = project.extrasVouchers ?? [];
  const { breakdowns } = project;

  const totalExtras = sceneExtras.reduce((s, se) => s + se.groups.reduce((gs, g) => gs + g.headcount, 0), 0);
  const sagGroups = extraGroups.filter(g => g.category === 'SAG');
  const nonUnionGroups = extraGroups.filter(g => g.category !== 'SAG');

  const getSceneExtras = (sceneId: string) => sceneExtras.find(se => se.sceneId === sceneId);

  const handleSaveGroup = (group: ExtraGroup) => {
    if (extraGroups.find(g => g.id === group.id)) {
      dispatch({ type: 'UPDATE_EXTRA_GROUP', payload: group });
    } else {
      dispatch({ type: 'ADD_EXTRA_GROUP', payload: group });
    }
    setShowGroupForm(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    if (window.confirm('Delete this extras group?')) {
      dispatch({ type: 'DELETE_EXTRA_GROUP', payload: id });
      if (selectedGroupId === id) setSelectedGroupId(null);
    }
  };

  const handleUpdateSceneExtras = (sceneId: string, groupId: string, field: string, value: string | number | boolean) => {
    const existing = sceneExtras.find(se => se.sceneId === sceneId);
    if (existing) {
      const updatedGroups = existing.groups.map(g =>
        g.groupId === groupId ? { ...g, [field]: value } : g
      );
      dispatch({ type: 'UPDATE_SCENE_EXTRAS', payload: { ...existing, groups: updatedGroups } });
    }
  };

  const handleAddGroupToScene = (sceneId: string, groupId: string) => {
    const existing = sceneExtras.find(se => se.sceneId === sceneId);
    const group = extraGroups.find(g => g.id === groupId);
    if (!group) return;
    const newGroupEntry = { groupId, headcount: 1, callTime: '7:00 AM', wrapTime: '6:00 PM', rate: group.defaultRate };
    if (existing) {
      if (existing.groups.find(g => g.groupId === groupId)) return;
      dispatch({ type: 'UPDATE_SCENE_EXTRAS', payload: { ...existing, groups: [...existing.groups, newGroupEntry] } });
    } else {
      dispatch({ type: 'UPDATE_SCENE_EXTRAS', payload: { sceneId, groups: [newGroupEntry] } });
    }
  };

  const handleRemoveGroupFromScene = (sceneId: string, groupId: string) => {
    const existing = sceneExtras.find(se => se.sceneId === sceneId);
    if (!existing) return;
    dispatch({ type: 'UPDATE_SCENE_EXTRAS', payload: { ...existing, groups: existing.groups.filter(g => g.groupId !== groupId) } });
  };

  const tabClass = (t: MainTab) =>
    `px-4 py-2 text-xs font-semibold transition-colors ${activeTab === t ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-100 font-semibold text-sm">Extras Manager</h2>
            <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
              <span>Groups: {extraGroups.length}</span>
              <span>Total extras (all scenes): {totalExtras}</span>
              <span>SAG: {sagGroups.length} groups</span>
              <span>Non-Union: {nonUnionGroups.length} groups</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-700 px-4 flex-shrink-0">
        <button className={tabClass('assignment')} onClick={() => setActiveTab('assignment')}>Scene Assignment</button>
        <button className={tabClass('vouchers')} onClick={() => setActiveTab('vouchers')}>Vouchers</button>
      </div>

      {activeTab === 'assignment' && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Groups panel */}
          <div className="w-72 border-r border-gray-700 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Extras Groups</span>
              <button
                onClick={() => { setEditingGroup({ ...EMPTY_GROUP, id: uuidv4() }); setShowGroupForm(true); }}
                className="px-2 py-1 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400"
              >
                + Add
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {extraGroups.length === 0 && (
                <p className="p-4 text-gray-500 text-xs italic">No groups yet</p>
              )}
              {extraGroups.map(group => {
                const totalInGroup = sceneExtras.reduce((s, se) => {
                  const g = se.groups.find(g => g.groupId === group.id);
                  return s + (g?.headcount ?? 0);
                }, 0);
                const isSelected = selectedGroupId === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(isSelected ? null : group.id)}
                    className={`px-3 py-2.5 border-b border-gray-700 cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-gray-800'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-200 font-medium">{group.name}</span>
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); setEditingGroup({ ...group }); setShowGroupForm(true); }}
                          className="text-xs text-gray-500 hover:text-amber-400 px-1">✎</button>
                        <button onClick={e => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                          className="text-xs text-gray-500 hover:text-red-400 px-1">✕</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${CATEGORY_COLORS[group.category]}`}>
                        {group.category}
                      </span>
                      <span className="text-xs text-gray-500">${group.defaultRate}/day</span>
                      {totalInGroup > 0 && <span className="text-xs text-amber-300 font-semibold">{totalInGroup} total</span>}
                    </div>
                    {group.notes && <p className="text-xs text-gray-600 mt-1 truncate">{group.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Scene assignment */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-gray-300 font-semibold text-xs uppercase tracking-wide mb-3">Scene Assignments</h3>
            <div className="space-y-3 max-w-3xl">
              {breakdowns.map(scene => {
                const se = getSceneExtras(scene.id);
                const totalHere = se?.groups.reduce((s, g) => s + g.headcount, 0) ?? 0;
                const isOpen = selectedSceneId === scene.id;
                return (
                  <div key={scene.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
                    <div
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-750"
                      onClick={() => setSelectedSceneId(isOpen ? null : scene.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-bold text-xs w-8">Sc {scene.sceneNumber}</span>
                        <span className="text-gray-300 text-sm">{scene.setName}</span>
                        <span className="text-gray-500 text-xs">{scene.intExt} {scene.dayNight}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {totalHere > 0 && (
                          <span className="text-xs bg-amber-500/20 text-amber-300 rounded px-2 py-0.5 font-semibold">
                            {totalHere} extras
                          </span>
                        )}
                        <span className="text-gray-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-700 p-3">
                        {/* Existing groups */}
                        {se && se.groups.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {se.groups.map(sg => {
                              const group = extraGroups.find(g => g.id === sg.groupId);
                              if (!group) return null;
                              return (
                                <div key={sg.groupId} className="bg-gray-700 rounded p-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-200">{group.name}</span>
                                    <button
                                      onClick={() => handleRemoveGroupFromScene(scene.id, sg.groupId)}
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >Remove</button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <label className="block text-gray-400 mb-0.5">Headcount</label>
                                      <input type="number" min={1} value={sg.headcount}
                                        onChange={e => handleUpdateSceneExtras(scene.id, sg.groupId, 'headcount', parseInt(e.target.value) || 1)}
                                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-gray-200 text-center" />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 mb-0.5">Call Time</label>
                                      <input value={sg.callTime ?? ''} placeholder="7:00 AM"
                                        onChange={e => handleUpdateSceneExtras(scene.id, sg.groupId, 'callTime', e.target.value)}
                                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-gray-200" />
                                    </div>
                                    <div>
                                      <label className="block text-gray-400 mb-0.5">Wrap Time</label>
                                      <input value={sg.wrapTime ?? ''} placeholder="6:00 PM"
                                        onChange={e => handleUpdateSceneExtras(scene.id, sg.groupId, 'wrapTime', e.target.value)}
                                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-gray-200" />
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <label className="block text-gray-400 text-xs mb-0.5">Wardrobe</label>
                                    <input value={sg.wardrobe ?? ''} placeholder="Business casual, etc."
                                      onChange={e => handleUpdateSceneExtras(scene.id, sg.groupId, 'wardrobe', e.target.value)}
                                      className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-gray-200 text-xs" />
                                  </div>
                                  <div className="mt-2 flex items-center gap-3">
                                    <label className="text-xs text-gray-400">Meal Penalty</label>
                                    <input type="checkbox" checked={sg.mealPenalty ?? false}
                                      onChange={e => handleUpdateSceneExtras(scene.id, sg.groupId, 'mealPenalty', e.target.checked)}
                                      className="accent-amber-500" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add group button */}
                        <div className="flex flex-wrap gap-2">
                          {extraGroups.filter(g => !se?.groups.find(sg => sg.groupId === g.id)).map(g => (
                            <button key={g.id}
                              onClick={() => handleAddGroupToScene(scene.id, g.id)}
                              className={`text-xs px-2 py-1 rounded border ${CATEGORY_COLORS[g.category]} border-transparent hover:border-amber-500`}>
                              + {g.name}
                            </button>
                          ))}
                          {extraGroups.length === 0 && <span className="text-xs text-gray-500 italic">Add groups in the panel on the left</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vouchers' && (
        <VouchersTab
          vouchers={extrasVouchers}
          extraGroups={extraGroups}
          breakdowns={breakdowns}
          dispatch={dispatch}
        />
      )}

      {/* Group form modal */}
      {showGroupForm && editingGroup && (
        <GroupFormModal
          group={editingGroup}
          onChange={setEditingGroup}
          onSave={() => handleSaveGroup(editingGroup)}
          onClose={() => { setShowGroupForm(false); setEditingGroup(null); }}
        />
      )}
    </div>
  );
}

function VouchersTab({ vouchers, extraGroups, breakdowns, dispatch }: {
  vouchers: ExtrasVoucher[];
  extraGroups: ExtraGroup[];
  breakdowns: import('../../types/scheduling').BreakdownSheet[];
  dispatch: ReturnType<typeof useScheduling>['dispatch'];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<ExtrasVoucher | null>(null);

  const totalPay = vouchers.reduce((s, v) => s + v.totalPay, 0);
  const mealPenalties = vouchers.filter(v => v.mealPenalty).length;

  const openNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingVoucher({
      id: uuidv4(), date: today, sceneId: breakdowns[0]?.id ?? '',
      groupId: extraGroups[0]?.id ?? '', name: '', callTime: '7:00 AM', wrapTime: '6:00 PM',
      hoursWorked: 10, mealPenalty: false, rate: extraGroups[0]?.defaultRate ?? 182, totalPay: extraGroups[0]?.defaultRate ?? 182,
    });
    setShowForm(true);
  };

  const handleSave = (v: ExtrasVoucher) => {
    const withTotal = { ...v, totalPay: v.rate * (v.mealPenalty ? 1.17 : 1) };
    if (vouchers.find(x => x.id === v.id)) {
      dispatch({ type: 'UPDATE_EXTRAS_VOUCHER', payload: withTotal });
    } else {
      dispatch({ type: 'ADD_EXTRAS_VOUCHER', payload: withTotal });
    }
    setShowForm(false);
    setEditingVoucher(null);
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4 max-w-4xl">
        <div className="flex gap-6 text-xs text-gray-400">
          <span>Vouchers: <span className="text-gray-200 font-semibold">{vouchers.length}</span></span>
          <span>Total Pay: <span className="text-amber-400 font-bold font-mono">${totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          <span>Meal Penalties: <span className="text-orange-400 font-semibold">{mealPenalties}</span></span>
        </div>
        <button onClick={openNew} className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
          + Add Voucher
        </button>
      </div>

      <table className="w-full text-xs max-w-4xl">
        <thead className="bg-gray-800 border-b border-gray-600 sticky top-0">
          <tr className="text-gray-400 font-semibold">
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Group</th>
            <th className="px-3 py-2 text-left">Scene</th>
            <th className="px-3 py-2 text-right">Call</th>
            <th className="px-3 py-2 text-right">Wrap</th>
            <th className="px-3 py-2 text-right">Hours</th>
            <th className="px-3 py-2 text-right">Rate</th>
            <th className="px-3 py-2 text-center">Meal</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2 w-16" />
          </tr>
        </thead>
        <tbody>
          {vouchers.map(v => {
            const group = extraGroups.find(g => g.id === v.groupId);
            const scene = breakdowns.find(b => b.id === v.sceneId);
            return (
              <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="px-3 py-1.5 text-gray-300">{v.date}</td>
                <td className="px-3 py-1.5 text-gray-200">{v.name}</td>
                <td className="px-3 py-1.5 text-gray-400">{group?.name ?? '—'}</td>
                <td className="px-3 py-1.5 text-amber-300">Sc {scene?.sceneNumber ?? '?'}</td>
                <td className="px-3 py-1.5 text-right text-gray-400">{v.callTime}</td>
                <td className="px-3 py-1.5 text-right text-gray-400">{v.wrapTime}</td>
                <td className="px-3 py-1.5 text-right text-gray-300 font-mono">{v.hoursWorked}</td>
                <td className="px-3 py-1.5 text-right text-gray-300 font-mono">${v.rate}</td>
                <td className="px-3 py-1.5 text-center">{v.mealPenalty ? <span className="text-orange-400">✓</span> : '—'}</td>
                <td className="px-3 py-1.5 text-right text-green-400 font-mono font-semibold">${v.totalPay.toFixed(2)}</td>
                <td className="px-1 py-1.5">
                  <button onClick={() => { setEditingVoucher({ ...v }); setShowForm(true); }}
                    className="text-gray-500 hover:text-amber-400 px-1">✎</button>
                  <button onClick={() => dispatch({ type: 'DELETE_EXTRAS_VOUCHER', payload: v.id })}
                    className="text-gray-500 hover:text-red-400 px-1">✕</button>
                </td>
              </tr>
            );
          })}
          {vouchers.length === 0 && (
            <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-500 italic">No vouchers yet</td></tr>
          )}
        </tbody>
        {vouchers.length > 0 && (
          <tfoot className="bg-gray-800 border-t border-gray-600">
            <tr>
              <td colSpan={9} className="px-3 py-2 text-right font-bold text-gray-300">Total:</td>
              <td className="px-3 py-2 text-right font-bold font-mono text-amber-400">${totalPay.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>

      {showForm && editingVoucher && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 w-96 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-100 font-semibold">Extras Voucher</h3>
            {([
              ['Date', 'date', 'date'],
              ['Extra\'s Name', 'name', 'text'],
              ['Call Time', 'callTime', 'text'],
              ['Wrap Time', 'wrapTime', 'text'],
            ] as [string, keyof ExtrasVoucher, string][]).map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input type={type} value={String(editingVoucher[key] ?? '')}
                  onChange={e => setEditingVoucher({ ...editingVoucher, [key]: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hours Worked</label>
                <input type="number" step="0.5" value={editingVoucher.hoursWorked}
                  onChange={e => setEditingVoucher({ ...editingVoucher, hoursWorked: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rate ($/day)</label>
                <input type="number" value={editingVoucher.rate}
                  onChange={e => setEditingVoucher({ ...editingVoucher, rate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Scene</label>
              <select value={editingVoucher.sceneId}
                onChange={e => setEditingVoucher({ ...editingVoucher, sceneId: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none">
                {breakdowns.map(b => <option key={b.id} value={b.id} className="bg-gray-800">Sc {b.sceneNumber} — {b.setName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Group</label>
              <select value={editingVoucher.groupId}
                onChange={e => {
                  const g = extraGroups.find(x => x.id === e.target.value);
                  setEditingVoucher({ ...editingVoucher, groupId: e.target.value, rate: g?.defaultRate ?? editingVoucher.rate });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none">
                {extraGroups.map(g => <option key={g.id} value={g.id} className="bg-gray-800">{g.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="mp" checked={editingVoucher.mealPenalty}
                onChange={e => setEditingVoucher({ ...editingVoucher, mealPenalty: e.target.checked })}
                className="accent-amber-500" />
              <label htmlFor="mp" className="text-xs text-gray-300">Meal Penalty</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleSave(editingVoucher)}
                className="flex-1 py-2 bg-amber-500 text-gray-900 rounded font-semibold text-sm hover:bg-amber-400">Save</button>
              <button onClick={() => { setShowForm(false); setEditingVoucher(null); }}
                className="flex-1 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupFormModal({ group, onChange, onSave, onClose }: {
  group: ExtraGroup; onChange: (g: ExtraGroup) => void; onSave: () => void; onClose: () => void;
}) {
  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none";
  const categories: ExtraGroup['category'][] = ['SAG', 'Non-Union', 'Special Ability', 'Stand-In', 'Photo Double'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 w-96 space-y-3" onClick={e => e.stopPropagation()}>
        <h3 className="text-gray-100 font-semibold">Extras Group</h3>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Group Name</label>
          <input value={group.name} onChange={e => onChange({ ...group, name: e.target.value })} className={inputClass} placeholder="Restaurant Patrons" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Category</label>
          <select value={group.category} onChange={e => onChange({ ...group, category: e.target.value as ExtraGroup['category'] })} className={inputClass}>
            {categories.map(c => <option key={c} value={c} className="bg-gray-800">{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Day Rate ($)</label>
            <input type="number" value={group.defaultRate} onChange={e => onChange({ ...group, defaultRate: parseFloat(e.target.value) || 0 })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">OT Rate ($)</label>
            <input type="number" value={group.defaultOvertimeRate} onChange={e => onChange({ ...group, defaultOvertimeRate: parseFloat(e.target.value) || 0 })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Notes</label>
          <textarea rows={2} value={group.notes ?? ''} onChange={e => onChange({ ...group, notes: e.target.value || undefined })}
            className={`${inputClass} resize-none`} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onSave} className="flex-1 py-2 bg-amber-500 text-gray-900 rounded font-semibold text-sm hover:bg-amber-400">Save</button>
          <button onClick={onClose} className="flex-1 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>
  );
}
