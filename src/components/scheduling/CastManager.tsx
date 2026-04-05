import { useState, useMemo } from 'react';
import { useScheduling } from '../../stores/schedulingStore';
import type { CastMember } from '../../types/scheduling';

// ── Badge helpers ─────────────────────────────────────────────────────────────

function categoryBadge(category: CastMember['category']) {
  const map: Record<CastMember['category'], string> = {
    Lead: 'bg-amber-500 text-gray-900',
    Supporting: 'bg-blue-600 text-white',
    'Day Player': 'bg-gray-600 text-gray-100',
    Cameo: 'bg-purple-600 text-white',
    'Stunt Double': 'bg-orange-600 text-white',
    'Stand-In': 'bg-teal-600 text-white',
  };
  return map[category] ?? 'bg-gray-600 text-gray-100';
}

function statusBadge(status: CastMember['status']) {
  const map: Record<CastMember['status'], string> = {
    Uncast: 'bg-red-900 text-red-300',
    Shortlisted: 'bg-yellow-900 text-yellow-300',
    Offered: 'bg-blue-900 text-blue-300',
    Confirmed: 'bg-green-900 text-green-300',
    Wrapped: 'bg-gray-700 text-gray-400',
  };
  return map[status] ?? 'bg-gray-700 text-gray-400';
}

function formatRate(member: CastMember) {
  if (member.weeklyRate) return `$${member.weeklyRate.toLocaleString()}/wk`;
  if (member.dailyRate) return `$${member.dailyRate.toLocaleString()}/day`;
  return '—';
}

// ── Empty form factory ────────────────────────────────────────────────────────

function emptyMember(): Omit<CastMember, 'id'> {
  return {
    elementId: '',
    role: '',
    actor: '',
    status: 'Uncast',
    category: 'Supporting',
    union: 'SAG-AFTRA',
  };
}

// ── Cast List Tab ─────────────────────────────────────────────────────────────

type SortKey = 'role' | 'category' | 'status' | 'scenes';

function CastListTab() {
  const { state, dispatch } = useScheduling();
  const project = state.project!;
  const members = project.castMembers ?? [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<(Partial<CastMember> & { id?: string }) | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('role');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Scenes per cast member — count breakdowns where their elementId appears
  const sceneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      counts[m.id] = project.breakdowns.filter(b => b.elements.includes(m.elementId)).length;
    }
    return counts;
  }, [members, project.breakdowns]);

  const categories = ['All', ...Array.from(new Set(members.map(m => m.category)))];
  const statuses = ['All', ...Array.from(new Set(members.map(m => m.status)))];

  const sorted = useMemo(() => {
    let list = [...members];
    if (filterCategory !== 'All') list = list.filter(m => m.category === filterCategory);
    if (filterStatus !== 'All') list = list.filter(m => m.status === filterStatus);
    const catOrder: Record<string, number> = { Lead: 0, Supporting: 1, 'Day Player': 2, Cameo: 3, 'Stunt Double': 4, 'Stand-In': 5 };
    const statusOrder: Record<string, number> = { Confirmed: 0, Offered: 1, Shortlisted: 2, Uncast: 3, Wrapped: 4 };
    list.sort((a, b) => {
      if (sortKey === 'role') return a.role.localeCompare(b.role);
      if (sortKey === 'category') return (catOrder[a.category] ?? 9) - (catOrder[b.category] ?? 9);
      if (sortKey === 'status') return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (sortKey === 'scenes') return (sceneCounts[b.id] ?? 0) - (sceneCounts[a.id] ?? 0);
      return 0;
    });
    return list;
  }, [members, filterCategory, filterStatus, sortKey, sceneCounts]);

  function startEdit(member: CastMember) {
    setEditing({ ...member });
    setExpandedId(member.id);
  }

  function startNew() {
    setEditing({ ...emptyMember() });
    setExpandedId('__new__');
  }

  function cancelEdit() {
    setEditing(null);
    setExpandedId(null);
  }

  function saveEdit() {
    if (!editing) return;
    if (editing.id) {
      dispatch({ type: 'UPDATE_CAST_MEMBER', payload: editing as CastMember });
    } else {
      const id = `cast-${Date.now()}`;
      dispatch({ type: 'ADD_CAST_MEMBER', payload: { ...editing, id } as CastMember });
    }
    cancelEdit();
  }

  function deleteMember(id: string) {
    if (window.confirm('Remove this cast member?')) {
      dispatch({ type: 'DELETE_CAST_MEMBER', payload: id });
      if (expandedId === id) cancelEdit();
    }
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      className={`text-xs px-2 py-1 rounded transition-colors ${sortKey === k ? 'bg-amber-500 text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Sort:</span>
          <SortBtn k="role" label="Role" />
          <SortBtn k="category" label="Category" />
          <SortBtn k="status" label="Status" />
          <SortBtn k="scenes" label="Scenes" />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-500">Category:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-200"
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-200"
          >
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <button
            onClick={startNew}
            className="px-3 py-1.5 bg-amber-500 text-gray-900 text-sm font-semibold rounded hover:bg-amber-400 transition-colors"
          >
            + Add Cast Member
          </button>
        </div>
      </div>

      {/* New member form (when expandedId === '__new__') */}
      {expandedId === '__new__' && editing && (
        <div className="mx-5 mt-4 mb-2 bg-gray-800 border border-amber-500 rounded-lg p-4">
          <h3 className="text-amber-400 text-sm font-semibold mb-3">New Cast Member</h3>
          <EditForm editing={editing} setEditing={setEditing} onSave={saveEdit} onCancel={cancelEdit} />
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-5 pt-3">
        {sorted.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-12">
            {members.length === 0 ? 'No cast members yet. Click "+ Add Cast Member" to start.' : 'No results match the current filters.'}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-1 text-xs text-gray-500 font-medium uppercase tracking-wide">
              <div>Role</div>
              <div>Actor</div>
              <div>Category</div>
              <div>Status</div>
              <div>Union</div>
              <div>Rate</div>
              <div>Scenes</div>
              <div></div>
            </div>
            {sorted.map(member => (
              <div key={member.id} className="rounded-lg overflow-hidden">
                {/* Row */}
                <div
                  className={`grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 px-3 py-2.5 items-center cursor-pointer transition-colors ${expandedId === member.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-750'}`}
                  onClick={() => {
                    if (expandedId === member.id) {
                      cancelEdit();
                    } else {
                      startEdit(member);
                    }
                  }}
                >
                  <div className="text-gray-100 text-sm font-medium truncate">{member.role}</div>
                  <div className="text-gray-400 text-sm truncate">{member.actor || <span className="text-gray-600 italic">TBD</span>}</div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBadge(member.category)}`}>
                      {member.category}
                    </span>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs truncate">{member.union}</div>
                  <div className="text-gray-300 text-xs">{formatRate(member)}</div>
                  <div className="text-gray-300 text-xs">{sceneCounts[member.id] ?? 0}</div>
                  <div onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 rounded transition-colors"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Inline edit panel */}
                {expandedId === member.id && editing && (
                  <div className="bg-gray-750 border-t border-gray-700 px-4 py-4 bg-gray-700">
                    <EditForm editing={editing} setEditing={setEditing} onSave={saveEdit} onCancel={cancelEdit} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared EditForm ───────────────────────────────────────────────────────────

function EditForm({
  editing,
  setEditing,
  onSave,
  onCancel,
}: {
  editing: Partial<CastMember>;
  setEditing: (val: Partial<CastMember>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (key: keyof CastMember, val: string | number | string[] | undefined) =>
    setEditing({ ...editing, [key]: val });

  const inputCls = 'w-full bg-gray-800 border border-gray-600 rounded px-2.5 py-1.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500';
  const labelCls = 'block text-xs text-gray-400 mb-1';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Role *</label>
          <input className={inputCls} value={editing.role ?? ''} onChange={e => set('role', e.target.value)} placeholder="Character name" />
        </div>
        <div>
          <label className={labelCls}>Actor</label>
          <input className={inputCls} value={editing.actor ?? ''} onChange={e => set('actor', e.target.value)} placeholder="Actor name" />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={editing.category ?? 'Supporting'} onChange={e => set('category', e.target.value)}>
            {(['Lead', 'Supporting', 'Day Player', 'Cameo', 'Stunt Double', 'Stand-In'] as const).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={editing.status ?? 'Uncast'} onChange={e => set('status', e.target.value)}>
            {(['Uncast', 'Shortlisted', 'Offered', 'Confirmed', 'Wrapped'] as const).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Union</label>
          <select className={inputCls} value={editing.union ?? 'SAG-AFTRA'} onChange={e => set('union', e.target.value)}>
            {(['SAG-AFTRA', 'Non-Union', 'Taft-Hartley', 'Fi-Core'] as const).map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Daily Rate ($)</label>
          <input className={inputCls} type="number" value={editing.dailyRate ?? ''} onChange={e => set('dailyRate', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>Weekly Rate ($)</label>
          <input className={inputCls} type="number" value={editing.weeklyRate ?? ''} onChange={e => set('weeklyRate', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>Guaranteed Days</label>
          <input className={inputCls} type="number" value={editing.guaranteedDays ?? ''} onChange={e => set('guaranteedDays', e.target.value ? Number(e.target.value) : undefined)} placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Start Date</label>
          <input className={inputCls} type="date" value={editing.startDate ?? ''} onChange={e => set('startDate', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>End Date (Wrap)</label>
          <input className={inputCls} type="date" value={editing.endDate ?? ''} onChange={e => set('endDate', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Agent / Manager</label>
          <input className={inputCls} value={editing.agent ?? ''} onChange={e => set('agent', e.target.value)} placeholder="Name" />
        </div>
        <div>
          <label className={labelCls}>Agent Phone</label>
          <input className={inputCls} value={editing.agentPhone ?? ''} onChange={e => set('agentPhone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Agent Email</label>
          <input className={inputCls} value={editing.agentEmail ?? ''} onChange={e => set('agentEmail', e.target.value)} placeholder="agent@example.com" />
        </div>
        <div>
          <label className={labelCls}>Element ID (links to breakdown)</label>
          <input className={inputCls} value={editing.elementId ?? ''} onChange={e => set('elementId', e.target.value)} placeholder="el-vin" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={editing.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Special requirements, wardrobe, etc."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Fitting Dates (comma-separated YYYY-MM-DD)</label>
          <input
            className={inputCls}
            value={(editing.fittingDates ?? []).join(', ')}
            onChange={e => set('fittingDates', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="2026-05-15, 2026-05-20"
          />
        </div>
        <div>
          <label className={labelCls}>Rehearsal Dates (comma-separated YYYY-MM-DD)</label>
          <input
            className={inputCls}
            value={(editing.rehearsalDates ?? []).join(', ')}
            onChange={e => set('rehearsalDates', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="2026-05-18, 2026-05-22"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button onClick={onSave} className="px-4 py-1.5 bg-amber-500 text-gray-900 text-sm font-semibold rounded hover:bg-amber-400 transition-colors">
          Save
        </button>
        <button onClick={onCancel} className="px-4 py-1.5 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Availability Grid Tab ─────────────────────────────────────────────────────

type DayCode = 'W' | 'H' | 'F' | 'R' | 'O';

function AvailabilityGridTab() {
  const { state } = useScheduling();
  const project = state.project!;
  const members = project.castMembers ?? [];

  // Build ordered shoot days from strip board
  const shootDays = useMemo(() => {
    const days: { dayNumber: number; label?: string; sceneIds: string[] }[] = [];
    let current: { dayNumber: number; label?: string; sceneIds: string[] } | null = null;

    for (const item of project.stripBoard) {
      if (item.type === 'dayBreak') {
        if (current) days.push(current);
        current = { dayNumber: item.dayNumber, label: item.label, sceneIds: [] };
      } else if (item.type === 'scene' && current) {
        current.sceneIds.push(item.breakdownId);
      }
    }
    if (current) days.push(current);
    return days;
  }, [project.stripBoard]);

  // Map breakdownId → elements
  const breakdownElements = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const b of project.breakdowns) map[b.id] = b.elements;
    return map;
  }, [project.breakdowns]);

  // For each member × day, compute the code
  function getCode(member: CastMember, day: { sceneIds: string[] }): DayCode {
    const isWorking = day.sceneIds.some(sid => (breakdownElements[sid] ?? []).includes(member.elementId));
    if (isWorking) return 'W';
    // Check fitting/rehearsal dates — we don't have exact day dates without shootStartDate math,
    // so skip for now (can be future enhancement); just show O if not working
    return 'O';
  }

  const cellStyle: Record<DayCode, string> = {
    W: 'bg-green-700 text-green-100',
    H: 'bg-amber-700 text-amber-100',
    F: 'bg-purple-700 text-purple-100',
    R: 'bg-blue-700 text-blue-100',
    O: 'bg-gray-800 text-gray-600',
  };

  if (members.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No cast members. Add some in the Cast List tab.
      </div>
    );
  }

  if (shootDays.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No shoot days found. Add day breaks in the Strip Board.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-5">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        {(['W', 'H', 'F', 'R', 'O'] as DayCode[]).map(code => {
          const labels: Record<DayCode, string> = { W: 'Working', H: 'Hold', F: 'Fitting', R: 'Rehearsal', O: 'Off' };
          return (
            <span key={code} className="flex items-center gap-1.5">
              <span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${cellStyle[code]}`}>{code}</span>
              <span className="text-gray-400">{labels[code]}</span>
            </span>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-400 px-3 py-2 bg-gray-800 sticky left-0 z-10 min-w-36 border border-gray-700">Cast Member</th>
              {shootDays.map(day => (
                <th key={day.dayNumber} className="px-2 py-2 bg-gray-800 text-gray-400 text-center border border-gray-700 min-w-10">
                  <div className="font-semibold">D{day.dayNumber}</div>
                  {day.label && <div className="text-gray-600 text-xs font-normal truncate max-w-10">{day.label}</div>}
                </th>
              ))}
              <th className="px-3 py-2 bg-gray-800 text-gray-400 text-center border border-gray-700 min-w-12">Work<br/>Days</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              const codes = shootDays.map(day => getCode(member, day));
              const workDays = codes.filter(c => c === 'W').length;
              return (
                <tr key={member.id} className="hover:bg-gray-750">
                  <td className="px-3 py-1.5 bg-gray-800 sticky left-0 z-10 border border-gray-700 whitespace-nowrap">
                    <span className="text-gray-100 font-medium">{member.role}</span>
                    {member.actor && <span className="text-gray-500 ml-1">({member.actor})</span>}
                  </td>
                  {codes.map((code, i) => (
                    <td key={i} className={`text-center font-bold border border-gray-700 ${cellStyle[code]}`}>
                      {code !== 'O' ? code : '·'}
                    </td>
                  ))}
                  <td className="text-center text-amber-400 font-semibold border border-gray-700 bg-gray-800">{workDays}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-3 py-1.5 bg-gray-800 sticky left-0 z-10 border border-gray-700 text-gray-400 font-medium text-xs uppercase">Cast/Day</td>
              {shootDays.map((day, i) => {
                const count = members.filter(m => getCode(m, day) === 'W').length;
                return (
                  <td key={i} className="text-center text-amber-400 font-semibold border border-gray-700 bg-gray-800">{count || '·'}</td>
                );
              })}
              <td className="border border-gray-700 bg-gray-800" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Deal Memo Tab ─────────────────────────────────────────────────────────────

function DealMemoTab() {
  const { state } = useScheduling();
  const members = state.project?.castMembers ?? [];

  const { breakdowns, stripBoard } = state.project!;
  const sceneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      counts[m.id] = breakdowns.filter(b => b.elements.includes(m.elementId)).length;
    }
    return counts;
  }, [members, breakdowns]);

  if (members.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No cast members. Add some in the Cast List tab.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-100 font-semibold">Deal Memos</h2>
        <button
          className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors"
          onClick={() => window.print()}
        >
          Print / Export
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {members.map(member => (
          <div key={member.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 print:border print:border-gray-300 print:bg-white print:text-black space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-gray-100 font-bold text-base print:text-black">{member.role}</div>
                <div className="text-gray-400 text-sm print:text-gray-600">{member.actor || <span className="italic text-gray-600">Actor TBD</span>}</div>
              </div>
              <div className="flex gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBadge(member.category)} print:border`}>
                  {member.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(member.status)} print:border`}>
                  {member.status}
                </span>
              </div>
            </div>

            {/* Deal terms */}
            <div className="border-t border-gray-700 print:border-gray-300 pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <DealRow label="Union" value={member.union} />
              <DealRow label="Rate" value={formatRate(member)} />
              <DealRow label="Guaranteed Days" value={member.guaranteedDays ? String(member.guaranteedDays) : '—'} />
              <DealRow label="Scenes" value={String(sceneCounts[member.id] ?? 0)} />
              {member.startDate && <DealRow label="Start" value={member.startDate} />}
              {member.endDate && <DealRow label="Wrap" value={member.endDate} />}
            </div>

            {/* Agent */}
            {member.agent && (
              <div className="border-t border-gray-700 print:border-gray-300 pt-3 text-sm">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Agent / Rep</div>
                <div className="text-gray-200 print:text-black">{member.agent}</div>
                {member.agentPhone && <div className="text-gray-400 text-xs print:text-gray-600">{member.agentPhone}</div>}
                {member.agentEmail && <div className="text-gray-400 text-xs print:text-gray-600">{member.agentEmail}</div>}
              </div>
            )}

            {/* Fitting / rehearsal dates */}
            {((member.fittingDates?.length ?? 0) > 0 || (member.rehearsalDates?.length ?? 0) > 0) && (
              <div className="border-t border-gray-700 print:border-gray-300 pt-3 text-xs space-y-1">
                {(member.fittingDates?.length ?? 0) > 0 && (
                  <div><span className="text-purple-400 font-medium print:text-purple-700">Fittings: </span><span className="text-gray-400 print:text-gray-600">{member.fittingDates!.join(', ')}</span></div>
                )}
                {(member.rehearsalDates?.length ?? 0) > 0 && (
                  <div><span className="text-blue-400 font-medium print:text-blue-700">Rehearsals: </span><span className="text-gray-400 print:text-gray-600">{member.rehearsalDates!.join(', ')}</span></div>
                )}
              </div>
            )}

            {/* Notes */}
            {member.notes && (
              <div className="border-t border-gray-700 print:border-gray-300 pt-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</div>
                <div className="text-gray-300 text-xs leading-relaxed print:text-gray-700">{member.notes}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DealRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="text-gray-500 print:text-gray-600">{label}</div>
      <div className="text-gray-200 font-medium print:text-black">{value}</div>
    </>
  );
}

// ── Main CastManager ──────────────────────────────────────────────────────────

type Tab = 'list' | 'grid' | 'memo';

export default function CastManager() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const { state } = useScheduling();
  const memberCount = state.project?.castMembers?.length ?? 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'list', label: 'Cast List' },
    { id: 'grid', label: 'Availability Grid' },
    { id: 'memo', label: 'Deal Memo' },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      {/* Page header */}
      <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-gray-100 font-bold text-base">Cast Manager</h1>
          <div className="text-gray-500 text-xs">{memberCount} cast member{memberCount !== 1 ? 's' : ''}</div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 ml-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-sm rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-gray-900 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'list' && <CastListTab />}
      {activeTab === 'grid' && <AvailabilityGridTab />}
      {activeTab === 'memo' && <DealMemoTab />}
    </div>
  );
}
