import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduling } from '../../stores/schedulingStore';
import type { ScriptRevision, ScriptChange, LockedPage, RevisionColor, BreakdownSheet } from '../../types/scheduling';

type Tab = 'script' | 'revisions' | 'changes' | 'pages';

const REVISION_COLORS: Record<RevisionColor, string> = {
  'White': '#FFFFFF',
  'Blue': '#ADD8E6',
  'Pink': '#FFB6C1',
  'Yellow': '#FFFFE0',
  'Green': '#90EE90',
  'Goldenrod': '#DAA520',
  'Buff': '#F0DC82',
  'Salmon': '#FA8072',
  'Cherry': '#DE3163',
  '2nd Blue': '#87CEEB',
  '2nd Pink': '#FF69B4',
  '2nd Yellow': '#FFD700',
  '2nd Green': '#32CD32',
};

const REVISION_ORDER: RevisionColor[] = [
  'White', 'Blue', 'Pink', 'Yellow', 'Green', 'Goldenrod', 'Buff', 'Salmon', 'Cherry',
  '2nd Blue', '2nd Pink', '2nd Yellow', '2nd Green',
];

const CHANGE_TYPE_COLORS: Record<ScriptChange['changeType'], string> = {
  'Added': 'bg-green-900 text-green-200',
  'Deleted': 'bg-red-900 text-red-200',
  'Modified': 'bg-yellow-900 text-yellow-200',
  'Moved': 'bg-blue-900 text-blue-200',
};


export default function ScriptManager() {
  const { state, dispatch } = useScheduling();
  const [activeTab, setActiveTab] = useState<Tab>('script');
  const [showAddRevision, setShowAddRevision] = useState(false);
  const [showAddChange, setShowAddChange] = useState(false);
  const [filterRevisionId, setFilterRevisionId] = useState<string>('all');
  const [filterChangeType, setFilterChangeType] = useState<string>('all');
  const [editingChange, setEditingChange] = useState<ScriptChange | null>(null);

  if (!state.project) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;
  }

  const { project } = state;
  const revisions = (project.revisions ?? []).sort((a, b) => a.revisionNumber - b.revisionNumber);
  const scriptChanges = project.scriptChanges ?? [];
  const lockedPages = project.lockedPages ?? [];
  const breakdowns = (project.breakdowns ?? []).sort((a, b) => a.scriptPage - b.scriptPage);

  const currentRevision = revisions.find(r => !r.isLocked) ?? revisions[revisions.length - 1];

  const getNextColor = (): RevisionColor => {
    const usedColors = revisions.map(r => r.color);
    return REVISION_ORDER.find(c => !usedColors.includes(c)) ?? 'White';
  };

  const handleAddRevision = () => {
    const nextColor = getNextColor();
    const newRevision: ScriptRevision = {
      id: uuidv4(),
      revisionNumber: revisions.length + 1,
      color: nextColor,
      date: new Date().toISOString().slice(0, 10),
      author: '',
      description: '',
      pagesChanged: [],
      scenesAffected: [],
      isLocked: false,
    };
    dispatch({ type: 'ADD_REVISION', payload: newRevision });
    setShowAddRevision(false);
  };

  const handleLockRevision = (id: string) => {
    const rev = revisions.find(r => r.id === id);
    if (!rev) return;
    dispatch({ type: 'UPDATE_REVISION', payload: { ...rev, isLocked: true } });
  };

  const handleUpdateRevision = (rev: ScriptRevision) => {
    dispatch({ type: 'UPDATE_REVISION', payload: rev });
  };

  const handleDeleteRevision = (id: string) => {
    if (window.confirm('Delete this revision? All associated changes will remain.')) {
      dispatch({ type: 'DELETE_REVISION', payload: id });
    }
  };

  const handleSaveChange = (change: ScriptChange) => {
    if (scriptChanges.find(c => c.id === change.id)) {
      dispatch({ type: 'UPDATE_SCRIPT_CHANGE', payload: change });
    } else {
      dispatch({ type: 'ADD_SCRIPT_CHANGE', payload: change });
    }
    setEditingChange(null);
    setShowAddChange(false);
  };

  const handleDeleteChange = (id: string) => {
    dispatch({ type: 'DELETE_SCRIPT_CHANGE', payload: id });
  };

  const handleToggleLockPage = (pageNumber: string) => {
    const existing = lockedPages.find(p => p.pageNumber === pageNumber);
    if (existing) {
      dispatch({ type: 'DELETE_LOCKED_PAGE', payload: pageNumber });
    } else {
      dispatch({ type: 'ADD_LOCKED_PAGE', payload: { pageNumber, lockedAtRevision: currentRevision?.revisionNumber ?? 1, cannotChange: true } });
    }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-xs font-semibold transition-colors ${activeTab === t ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-100 font-semibold text-sm">Script Changes</h2>
            {currentRevision && (
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="w-4 h-4 rounded border border-gray-600"
                  style={{ backgroundColor: REVISION_COLORS[currentRevision.color] }}
                />
                <span className="text-xs text-gray-400">
                  Working Draft: Revision {currentRevision.revisionNumber} ({currentRevision.color}) — {currentRevision.date}
                </span>
                {currentRevision.isLocked && (
                  <span className="text-xs bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-semibold">🔒 Locked</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {activeTab === 'revisions' && (
              <button onClick={() => setShowAddRevision(true)} className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
                + New Revision
              </button>
            )}
            {activeTab === 'changes' && (
              <button onClick={() => { setEditingChange(buildEmptyChange(revisions)); setShowAddChange(true); }}
                className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
                + Log Change
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-700 px-4 flex-shrink-0">
        <button className={tabClass('script')} onClick={() => setActiveTab('script')}>Script</button>
        <button className={tabClass('revisions')} onClick={() => setActiveTab('revisions')}>Revisions</button>
        <button className={tabClass('changes')} onClick={() => setActiveTab('changes')}>Changes</button>
        <button className={tabClass('pages')} onClick={() => setActiveTab('pages')}>Pages</button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'script' && (
          <ScriptView
            breakdowns={breakdowns}
            revisions={revisions}
            scriptChanges={scriptChanges}
            lockedPages={lockedPages}
          />
        )}

        {activeTab === 'revisions' && (
          <RevisionHistory
            revisions={revisions}
            scriptChanges={scriptChanges}
            onLock={handleLockRevision}
            onUpdate={handleUpdateRevision}
            onDelete={handleDeleteRevision}
            showAddForm={showAddRevision}
            onCancelAdd={() => setShowAddRevision(false)}
            onConfirmAdd={handleAddRevision}
            nextColor={getNextColor()}
          />
        )}

        {activeTab === 'changes' && (
          <ChangeLog
            changes={scriptChanges}
            revisions={revisions}
            filterRevisionId={filterRevisionId}
            filterChangeType={filterChangeType}
            onFilterRevision={setFilterRevisionId}
            onFilterType={setFilterChangeType}
            onEdit={(c) => { setEditingChange({ ...c }); setShowAddChange(true); }}
            onDelete={handleDeleteChange}
          />
        )}

        {activeTab === 'pages' && (
          <PagesAffected
            revisions={revisions}
            lockedPages={lockedPages}
            onToggleLock={handleToggleLockPage}
          />
        )}
      </div>

      {/* Add/Edit change modal */}
      {showAddChange && editingChange && (
        <ChangeFormModal
          change={editingChange}
          revisions={revisions}
          onChange={setEditingChange}
          onSave={() => handleSaveChange(editingChange)}
          onClose={() => { setShowAddChange(false); setEditingChange(null); }}
        />
      )}
    </div>
  );
}

function ScriptView({ breakdowns, revisions, scriptChanges, lockedPages }: {
  breakdowns: BreakdownSheet[];
  revisions: ScriptRevision[];
  scriptChanges: ScriptChange[];
  lockedPages: LockedPage[];
}) {
  const [showChanges, setShowChanges] = useState(false);

  const currentRevision = revisions.find(r => !r.isLocked) ?? revisions[revisions.length - 1];

  // For a given scene, find the highest-numbered revision with a change touching it
  const getSceneRevisionColor = (sceneNumber: string): string => {
    const changesForScene = scriptChanges.filter(c => c.sceneNumber === sceneNumber);
    if (changesForScene.length === 0) return REVISION_COLORS['White'];
    let highestRev: ScriptRevision | undefined;
    for (const change of changesForScene) {
      const rev = revisions.find(r => r.id === change.revisionId);
      if (rev && (!highestRev || rev.revisionNumber > highestRev.revisionNumber)) {
        highestRev = rev;
      }
    }
    return highestRev ? REVISION_COLORS[highestRev.color] : REVISION_COLORS['White'];
  };

  const isPageLocked = (scriptPage: number, pageCount: string): boolean => {
    const pageCountNum = parseFloat(pageCount) || 1;
    const endPage = scriptPage + pageCountNum;
    return lockedPages.some(lp => {
      const lpNum = parseFloat(lp.pageNumber);
      return !isNaN(lpNum) && lpNum >= scriptPage && lpNum < endPage;
    });
  };

  const formatSlugLine = (bd: BreakdownSheet): string => {
    return `${bd.intExt}. ${bd.setName.toUpperCase()} — ${bd.dayNight}`;
  };

  if (breakdowns.length === 0) {
    return <div className="text-center py-12 text-gray-500">No scenes in breakdown yet. Add scenes in the Breakdown tab.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Current revision banner */}
      {currentRevision && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded mb-5 border border-gray-700"
          style={{ backgroundColor: `${REVISION_COLORS[currentRevision.color]}18` }}
        >
          <div
            className="w-5 h-5 rounded border border-gray-500 flex-shrink-0"
            style={{ backgroundColor: REVISION_COLORS[currentRevision.color] }}
          />
          <div className="flex-1">
            <span className="text-gray-200 text-sm font-semibold">
              Current Revision: {currentRevision.revisionNumber} — {currentRevision.color}
            </span>
            <span className="text-gray-400 text-xs ml-3">{currentRevision.date}</span>
            {currentRevision.author && (
              <span className="text-gray-500 text-xs ml-2">by {currentRevision.author}</span>
            )}
          </div>
          {currentRevision.isLocked && (
            <span className="text-xs bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-semibold">🔒 Locked</span>
          )}
          {/* Toggle */}
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <span className="text-xs text-gray-400">Show Changes</span>
            <button
              onClick={() => setShowChanges(v => !v)}
              className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors ${showChanges ? 'bg-amber-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${showChanges ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </label>
        </div>
      )}

      {/* Scene list */}
      <div className="space-y-3">
        {breakdowns.map(bd => {
          const revColor = getSceneRevisionColor(bd.sceneNumber);
          const locked = isPageLocked(bd.scriptPage, bd.pageCount);
          const sceneChanges = scriptChanges.filter(c => c.sceneNumber === bd.sceneNumber);

          return (
            <div key={bd.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
              <div className="flex items-stretch">
                {/* Left color bar = revision color */}
                <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: revColor }} />

                <div className="flex-1 px-4 py-3 font-mono">
                  {/* Scene header row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-700 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-gray-600">
                      {bd.sceneNumber}
                    </span>
                    <span className="text-gray-100 font-bold text-sm tracking-wide uppercase flex-1">
                      {formatSlugLine(bd)}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-500 bg-gray-700/60 px-1.5 py-0.5 rounded">
                        p.{bd.scriptPage} · {bd.pageCount} pg
                      </span>
                      {locked && <span title="Page locked">🔒</span>}
                    </div>
                  </div>

                  {/* Action/description */}
                  {bd.description && (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{bd.description}</p>
                  )}

                  {/* Scene notes */}
                  {bd.notes && (
                    <p className="text-gray-500 text-xs italic mt-1.5">{bd.notes}</p>
                  )}

                  {/* Elements */}
                  {bd.elements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bd.elements.map(el => (
                        <span key={el} className="text-xs bg-gray-700 text-gray-400 border border-gray-600 rounded px-1.5 py-0.5">{el}</span>
                      ))}
                    </div>
                  )}

                  {/* Inline changes */}
                  {showChanges && sceneChanges.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-gray-700 pt-3">
                      {sceneChanges.map(change => {
                        const rev = revisions.find(r => r.id === change.revisionId);
                        const revColor2 = rev ? REVISION_COLORS[rev.color] : '#888';
                        const borderClass =
                          change.changeType === 'Added' ? 'border-green-500' :
                          change.changeType === 'Deleted' ? 'border-red-500' :
                          change.changeType === 'Moved' ? 'border-blue-500' :
                          'border-amber-400';
                        const bgClass =
                          change.changeType === 'Added' ? 'bg-green-900/20' :
                          change.changeType === 'Deleted' ? 'bg-red-900/20' :
                          change.changeType === 'Moved' ? 'bg-blue-900/20' :
                          'bg-amber-900/20';

                        return (
                          <div key={change.id} className={`rounded border-l-2 pl-2.5 py-1.5 pr-2 ${borderClass} ${bgClass}`}>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              {/* Revision color dot */}
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-500 flex-shrink-0 inline-block"
                                style={{ backgroundColor: revColor2 }}
                              />
                              {rev && (
                                <span className="text-xs text-gray-400">Rev {rev.revisionNumber}</span>
                              )}
                              <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${CHANGE_TYPE_COLORS[change.changeType]}`}>
                                {change.changeType}
                              </span>
                              {change.impactedDepartments.map(dept => (
                                <span key={dept} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded px-1 py-0.5">{dept}</span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-300">{change.description}</p>
                            {change.changeType === 'Deleted' && change.oldContent && (
                              <p className="text-xs text-red-400 line-through mt-0.5">{change.oldContent}</p>
                            )}
                            {change.changeType === 'Added' && change.newContent && (
                              <p className="text-xs text-green-300 mt-0.5">{change.newContent}</p>
                            )}
                            {change.changeType === 'Modified' && (change.oldContent || change.newContent) && (
                              <div className="mt-0.5 space-y-0.5">
                                {change.oldContent && <p className="text-xs text-red-400 line-through">{change.oldContent}</p>}
                                {change.newContent && <p className="text-xs text-green-300">{change.newContent}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildEmptyChange(revisions: ScriptRevision[]): ScriptChange {
  const latestUnlocked = revisions.find(r => !r.isLocked);
  return {
    id: uuidv4(),
    revisionId: latestUnlocked?.id ?? revisions[revisions.length - 1]?.id ?? '',
    sceneNumber: '',
    changeType: 'Modified',
    description: '',
    impactedElements: [],
    impactedDepartments: [],
  };
}

function RevisionHistory({ revisions, scriptChanges, onLock, onUpdate, onDelete, showAddForm, onCancelAdd, onConfirmAdd, nextColor }: {
  revisions: ScriptRevision[];
  scriptChanges: ScriptChange[];
  onLock: (id: string) => void;
  onUpdate: (r: ScriptRevision) => void;
  onDelete: (id: string) => void;
  showAddForm: boolean;
  onCancelAdd: () => void;
  onConfirmAdd: () => void;
  nextColor: RevisionColor;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (revisions.length === 0 && !showAddForm) {
    return <div className="text-center py-12 text-gray-500">No revisions yet. Click + New Revision to start.</div>;
  }

  return (
    <div className="max-w-3xl space-y-3">
      {showAddForm && (
        <div className="bg-gray-800 rounded border border-amber-500/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded border-2 border-gray-500 flex-shrink-0" style={{ backgroundColor: REVISION_COLORS[nextColor] }} />
            <div>
              <div className="text-gray-100 font-semibold">Revision {revisions.length + 1} — {nextColor}</div>
              <div className="text-xs text-gray-400">Next in standard sequence</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onConfirmAdd} className="px-4 py-1.5 bg-amber-500 text-gray-900 rounded text-sm font-semibold hover:bg-amber-400">
              Create Revision
            </button>
            <button onClick={onCancelAdd} className="px-4 py-1.5 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {[...revisions].reverse().map(rev => {
        const changes = scriptChanges.filter(c => c.revisionId === rev.id);
        const isExpanded = expandedId === rev.id;
        const bgColor = REVISION_COLORS[rev.color];
        const isDark = ['Goldenrod', 'Cherry', 'Green', 'Salmon', '2nd Green'].includes(rev.color);

        return (
          <div key={rev.id} className={`bg-gray-800 rounded border overflow-hidden ${rev.isLocked ? 'border-gray-600' : 'border-gray-700'}`}>
            {/* Color bar */}
            <div className="flex items-stretch">
              <div className="w-3 flex-shrink-0" style={{ backgroundColor: bgColor }} />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border-2 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: bgColor, borderColor: bgColor }}
                    >
                      <span className="font-bold text-xs" style={{ color: isDark ? '#fff' : '#374151' }}>{rev.revisionNumber}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-100 font-semibold">Revision {rev.revisionNumber}</span>
                        <span className="text-xs text-gray-500">{rev.color}</span>
                        {rev.isLocked && <span className="text-xs bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-semibold">🔒 Locked</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{rev.date} — {rev.author || 'Author unknown'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!rev.isLocked && (
                      <button onClick={() => onLock(rev.id)}
                        className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs hover:bg-red-800/70">
                        🔒 Lock
                      </button>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">
                      {isExpanded ? 'Collapse' : 'Edit'}
                    </button>
                    <button onClick={() => onDelete(rev.id)}
                      className="px-2 py-1 bg-gray-700 text-red-400 rounded text-xs hover:bg-red-900/50">✕</button>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mt-2">{rev.description || <span className="text-gray-600 italic">No description</span>}</p>

                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{rev.pagesChanged.length} pages changed</span>
                  <span>{rev.scenesAffected.length} scenes affected</span>
                  <span>{changes.length} logged changes</span>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t border-gray-700 pt-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <input value={rev.description} onChange={e => onUpdate({ ...rev, description: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Date</label>
                        <input type="date" value={rev.date} onChange={e => onUpdate({ ...rev, date: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Author</label>
                        <input value={rev.author} onChange={e => onUpdate({ ...rev, author: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pages Changed (comma-separated)</label>
                      <input value={rev.pagesChanged.join(', ')}
                        onChange={e => onUpdate({ ...rev, pagesChanged: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Scenes Affected (comma-separated)</label>
                      <input value={rev.scenesAffected.join(', ')}
                        onChange={e => onUpdate({ ...rev, scenesAffected: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChangeLog({ changes, revisions, filterRevisionId, filterChangeType, onFilterRevision, onFilterType, onEdit, onDelete }: {
  changes: ScriptChange[];
  revisions: ScriptRevision[];
  filterRevisionId: string;
  filterChangeType: string;
  onFilterRevision: (id: string) => void;
  onFilterType: (t: string) => void;
  onEdit: (c: ScriptChange) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = changes.filter(c => {
    if (filterRevisionId !== 'all' && c.revisionId !== filterRevisionId) return false;
    if (filterChangeType !== 'all' && c.changeType !== filterChangeType) return false;
    return true;
  });

  const selectClass = "bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:border-amber-500 focus:outline-none";

  return (
    <div className="max-w-4xl">
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterRevisionId} onChange={e => onFilterRevision(e.target.value)} className={selectClass}>
          <option value="all">All Revisions</option>
          {revisions.map(r => <option key={r.id} value={r.id} className="bg-gray-800">Rev {r.revisionNumber} ({r.color})</option>)}
        </select>
        <select value={filterChangeType} onChange={e => onFilterType(e.target.value)} className={selectClass}>
          <option value="all">All Types</option>
          {['Added', 'Deleted', 'Modified', 'Moved'].map(t => <option key={t} value={t} className="bg-gray-800">{t}</option>)}
        </select>
        <span className="text-xs text-gray-500 self-center">{filtered.length} change{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">No changes match the current filter.</div>
        )}
        {filtered.map(change => {
          const rev = revisions.find(r => r.id === change.revisionId);
          const revColor = rev ? REVISION_COLORS[rev.color] : '#888';
          return (
            <div key={change.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
              <div className="flex items-stretch">
                <div className="w-2 flex-shrink-0" style={{ backgroundColor: revColor }} />
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-amber-300 font-bold text-xs">Sc {change.sceneNumber}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${CHANGE_TYPE_COLORS[change.changeType]}`}>
                        {change.changeType}
                      </span>
                      {rev && (
                        <span className="text-xs text-gray-500">Rev {rev.revisionNumber} ({rev.color})</span>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => onEdit(change)} className="text-xs text-gray-500 hover:text-amber-400 px-1">✎</button>
                      <button onClick={() => onDelete(change.id)} className="text-xs text-gray-500 hover:text-red-400 px-1">✕</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 mt-1">{change.description}</p>
                  {(change.oldContent || change.newContent) && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {change.oldContent && (
                        <div className="bg-red-900/20 rounded p-2 text-xs text-red-300">
                          <div className="text-gray-500 mb-0.5">Before:</div>
                          {change.oldContent}
                        </div>
                      )}
                      {change.newContent && (
                        <div className="bg-green-900/20 rounded p-2 text-xs text-green-300">
                          <div className="text-gray-500 mb-0.5">After:</div>
                          {change.newContent}
                        </div>
                      )}
                    </div>
                  )}
                  {change.impactedDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {change.impactedDepartments.map(dept => (
                        <span key={dept} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded px-1.5 py-0.5">{dept}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PagesAffected({ revisions, lockedPages, onToggleLock }: {
  revisions: ScriptRevision[];
  lockedPages: LockedPage[];
  onToggleLock: (pageNum: string) => void;
}) {
  // Collect all page numbers mentioned
  const pageRevisionMap = new Map<string, ScriptRevision>();
  for (const rev of revisions) {
    for (const page of rev.pagesChanged) {
      // Later revisions overwrite earlier
      pageRevisionMap.set(page, rev);
    }
  }

  const allPages = [...pageRevisionMap.keys()].sort((a, b) => {
    const numA = parseFloat(a.replace(/[A-Za-z]/g, ''));
    const numB = parseFloat(b.replace(/[A-Za-z]/g, ''));
    return numA - numB;
  });

  if (allPages.length === 0) {
    return <div className="text-center py-12 text-gray-500">No pages listed in any revision yet.</div>;
  }

  return (
    <div className="max-w-4xl">
      <p className="text-xs text-gray-500 mb-4">Pages colored by latest revision that touched them. Click a page to toggle locked status.</p>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {revisions.map(rev => (
          <div key={rev.id} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: REVISION_COLORS[rev.color] }} />
            <span>Rev {rev.revisionNumber} ({rev.color})</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="text-base">🔒</span>
          <span>Locked (filmed)</span>
        </div>
      </div>

      {/* Page grid */}
      <div className="flex flex-wrap gap-2">
        {allPages.map(page => {
          const rev = pageRevisionMap.get(page);
          const locked = lockedPages.find(p => p.pageNumber === page);
          const bgColor = rev ? REVISION_COLORS[rev.color] : '#374151';
          const isDark = rev ? ['Goldenrod', 'Cherry', 'Green', 'Salmon', '2nd Green'].includes(rev.color) : false;

          return (
            <button
              key={page}
              onClick={() => onToggleLock(page)}
              title={`Page ${page} — ${rev?.color ?? 'Unknown'} (Rev ${rev?.revisionNumber ?? '?'})${locked ? '\n🔒 Locked' : '\nClick to lock'}`}
              className="relative w-12 h-14 rounded border-2 flex items-center justify-center transition-transform hover:scale-105"
              style={{
                backgroundColor: bgColor,
                borderColor: locked ? '#dc2626' : 'transparent',
              }}
            >
              <span
                className="font-bold text-sm"
                style={{ color: isDark ? '#fff' : '#1f2937' }}
              >
                {page}
              </span>
              {locked && (
                <span className="absolute -top-1 -right-1 text-xs">🔒</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-sm text-gray-400">
        <span>Total pages tracked: <span className="text-gray-200 font-semibold">{allPages.length}</span></span>
        <span>Locked pages: <span className="text-red-400 font-semibold">{lockedPages.length}</span></span>
      </div>
    </div>
  );
}

function ChangeFormModal({ change, revisions, onChange, onSave, onClose }: {
  change: ScriptChange;
  revisions: ScriptRevision[];
  onChange: (c: ScriptChange) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [deptInput, setDeptInput] = useState(change.impactedDepartments.join(', '));
  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none";
  const labelClass = "block text-xs text-gray-400 mb-1";
  const changeTypes: ScriptChange['changeType'][] = ['Added', 'Deleted', 'Modified', 'Moved'];
  const commonDepts = ['Camera', 'Art Department', 'Wardrobe', 'AD', 'Locations', 'Transportation', 'Stunts', 'VFX', 'Props', 'Casting', 'Sound'];

  const handleSave = () => {
    onChange({ ...change, impactedDepartments: deptInput.split(',').map(s => s.trim()).filter(Boolean) });
    onSave();
  };

  const toggleDept = (dept: string) => {
    const current = deptInput.split(',').map(s => s.trim()).filter(Boolean);
    if (current.includes(dept)) {
      setDeptInput(current.filter(d => d !== dept).join(', '));
    } else {
      setDeptInput([...current, dept].join(', '));
    }
  };

  const selectedDepts = deptInput.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 w-[520px] max-h-[80vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
        <h3 className="text-gray-100 font-semibold">Script Change</h3>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Revision</label>
            <select value={change.revisionId} onChange={e => onChange({ ...change, revisionId: e.target.value })} className={inputClass}>
              {revisions.map(r => <option key={r.id} value={r.id} className="bg-gray-800">Rev {r.revisionNumber} ({r.color})</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Scene Number</label>
            <input value={change.sceneNumber} onChange={e => onChange({ ...change, sceneNumber: e.target.value })}
              className={inputClass} placeholder="12, 4A, etc." />
          </div>
        </div>

        <div>
          <label className={labelClass}>Change Type</label>
          <div className="flex gap-2">
            {changeTypes.map(t => (
              <button key={t} onClick={() => onChange({ ...change, changeType: t })}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${change.changeType === t ? CHANGE_TYPE_COLORS[t] : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Description of change</label>
          <textarea rows={2} value={change.description} onChange={e => onChange({ ...change, description: e.target.value })}
            className={`${inputClass} resize-none`} placeholder="What changed?" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Before (old content)</label>
            <textarea rows={2} value={change.oldContent ?? ''} onChange={e => onChange({ ...change, oldContent: e.target.value || undefined })}
              className={`${inputClass} resize-none text-xs`} placeholder="What was there before…" />
          </div>
          <div>
            <label className={labelClass}>After (new content)</label>
            <textarea rows={2} value={change.newContent ?? ''} onChange={e => onChange({ ...change, newContent: e.target.value || undefined })}
              className={`${inputClass} resize-none text-xs`} placeholder="What replaced it…" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Impacted Departments</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {commonDepts.map(dept => (
              <button key={dept} onClick={() => toggleDept(dept)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${selectedDepts.includes(dept) ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'}`}>
                {dept}
              </button>
            ))}
          </div>
          <input value={deptInput} onChange={e => setDeptInput(e.target.value)}
            className={`${inputClass} text-xs`} placeholder="Camera, Art Department, Wardrobe…" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="flex-1 py-2 bg-amber-500 text-gray-900 rounded font-semibold text-sm hover:bg-amber-400">Save</button>
          <button onClick={onClose} className="flex-1 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>
  );
}
