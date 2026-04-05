import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduling } from '../../stores/schedulingStore';
import type { CostumeItem, SceneCostume, BreakdownSheet, Element } from '../../types/scheduling';

type Tab = 'plot' | 'inventory' | 'continuity';

const CONDITION_COLORS: Record<CostumeItem['condition'], string> = {
  'New': 'text-green-400',
  'Aged': 'text-yellow-400',
  'Distressed': 'text-orange-400',
  'Bloody': 'text-red-400',
  'Wet': 'text-blue-400',
  'Clean': 'text-gray-300',
};

const EMPTY_COSTUME: Omit<CostumeItem, 'id'> = {
  characterId: '',
  name: '',
  description: '',
  pieces: [],
  condition: 'New',
  color: '#888888',
};

export default function WardrobeManager() {
  const { state, dispatch } = useScheduling();
  const [activeTab, setActiveTab] = useState<Tab>('plot');
  const [editingCostume, setEditingCostume] = useState<CostumeItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (!state.project) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;
  }

  const { project } = state;
  const costumes = project.costumes ?? [];
  const sceneCostumes = project.sceneCostumes ?? [];
  const { breakdowns, elements } = project;

  const castElements = elements.filter(e => e.category === 'Cast');

  // Build scene order from strip board
  const sceneOrder = project.stripBoard
    .filter(item => item.type === 'scene')
    .map(item => item.type === 'scene' ? breakdowns.find(b => b.id === item.breakdownId) : undefined)
    .filter((b): b is BreakdownSheet => !!b);

  const getCostumeForCharacterInScene = (sceneId: string, characterId: string): SceneCostume | undefined =>
    sceneCostumes.find(sc => sc.sceneId === sceneId && sc.characterId === characterId);

  const handleSaveCostume = (costume: CostumeItem) => {
    if (costumes.find(c => c.id === costume.id)) {
      dispatch({ type: 'UPDATE_COSTUME', payload: costume });
    } else {
      dispatch({ type: 'ADD_COSTUME', payload: costume });
    }
    setShowForm(false);
    setEditingCostume(null);
  };

  const handleDeleteCostume = (id: string) => {
    if (window.confirm('Delete this costume?')) dispatch({ type: 'DELETE_COSTUME', payload: id });
  };

  const handleAssignCostume = (sceneId: string, characterId: string, costumeId: string) => {
    if (!costumeId) {
      dispatch({ type: 'DELETE_SCENE_COSTUME', payload: { sceneId, characterId } });
    } else {
      dispatch({ type: 'UPDATE_SCENE_COSTUME', payload: { sceneId, characterId, costumeId, changeNumber: 1 } });
    }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-xs font-semibold transition-colors ${activeTab === t ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'}`;

  // Characters who have costumes
  const wardrobeCharacterIds = [...new Set(costumes.map(c => c.characterId))];
  const wardrobeCharacters = wardrobeCharacterIds
    .map(id => castElements.find(e => e.id === id))
    .filter((e): e is Element => !!e);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Wardrobe / Costumes</h2>
          <p className="text-gray-500 text-xs">{costumes.length} costume items — {wardrobeCharacters.length} characters</p>
        </div>
        <button
          onClick={() => { setEditingCostume({ ...EMPTY_COSTUME, id: uuidv4(), characterId: castElements[0]?.id ?? '' }); setShowForm(true); }}
          className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400"
        >
          + New Costume
        </button>
      </div>

      <div className="flex border-b border-gray-700 px-4 flex-shrink-0">
        <button className={tabClass('plot')} onClick={() => setActiveTab('plot')}>Costume Plot</button>
        <button className={tabClass('inventory')} onClick={() => setActiveTab('inventory')}>Inventory</button>
        <button className={tabClass('continuity')} onClick={() => setActiveTab('continuity')}>Continuity</button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'plot' && (
          <CostumePlot
            allCastElements={castElements}
            sceneOrder={sceneOrder}
            costumes={costumes}
            sceneCostumes={sceneCostumes}
            onAssign={handleAssignCostume}
          />
        )}
        {activeTab === 'inventory' && (
          <CostumeInventory
            costumes={costumes}
            castElements={castElements}
            sceneCostumes={sceneCostumes}
            breakdowns={breakdowns}
            onEdit={(c) => { setEditingCostume({ ...c }); setShowForm(true); }}
            onDelete={handleDeleteCostume}
          />
        )}
        {activeTab === 'continuity' && (
          <ContinuityView
            characters={wardrobeCharacters}
            sceneOrder={sceneOrder}
            costumes={costumes}
            getCostumeForCharacterInScene={getCostumeForCharacterInScene}
          />
        )}
      </div>

      {showForm && editingCostume && (
        <CostumeFormPanel
          costume={editingCostume}
          castElements={castElements}
          onChange={setEditingCostume}
          onSave={() => handleSaveCostume(editingCostume)}
          onClose={() => { setShowForm(false); setEditingCostume(null); }}
        />
      )}
    </div>
  );
}

function CostumePlot({ allCastElements, sceneOrder, costumes, sceneCostumes, onAssign }: {
  allCastElements: Element[];
  sceneOrder: BreakdownSheet[];
  costumes: CostumeItem[];
  sceneCostumes: SceneCostume[];
  onAssign: (sceneId: string, characterId: string, costumeId: string) => void;
}) {
  const plotChars = allCastElements;

  if (sceneOrder.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">No scenes in the strip board.</div>;
  }

  return (
    <div className="overflow-auto p-4">
      <p className="text-xs text-gray-500 mb-3">Rows = characters, columns = scenes (in shooting order). Click a cell to assign a costume.</p>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse" style={{ minWidth: `${Math.max(600, sceneOrder.length * 100 + 180)}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 bg-gray-900 z-20 px-3 py-2 text-left text-gray-400 font-semibold border-b border-r border-gray-700 w-44">
                Character
              </th>
              {sceneOrder.map(scene => (
                <th key={scene.id} className="px-2 py-2 text-center border-b border-gray-700 font-semibold text-gray-400 min-w-20">
                  <div>Sc {scene.sceneNumber}</div>
                  <div className="text-gray-600 font-normal text-xs">{scene.intExt}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plotChars.map(char => {
              const charCostumes = costumes.filter(c => c.characterId === char.id);
              return (
                <tr key={char.id} className="border-b border-gray-800">
                  <td className="sticky left-0 bg-gray-900 z-10 px-3 py-2 border-r border-gray-700 text-gray-300 font-medium text-xs w-44">
                    <div className="truncate max-w-40">{char.name}</div>
                  </td>
                  {sceneOrder.map(scene => {
                    const sc = sceneCostumes.find(x => x.sceneId === scene.id && x.characterId === char.id);
                    const costume = sc ? costumes.find(c => c.id === sc.costumeId) : undefined;
                    const sceneHasChar = scene.elements.includes(char.id);

                    if (!sceneHasChar) {
                      return (
                        <td key={scene.id} className="px-2 py-1.5 text-center border-r border-gray-800">
                          <span className="text-gray-700">—</span>
                        </td>
                      );
                    }

                    return (
                      <td key={scene.id} className="px-1 py-1 border-r border-gray-800 min-w-20">
                        <select
                          value={sc?.costumeId ?? ''}
                          onChange={e => onAssign(scene.id, char.id, e.target.value)}
                          className="w-full bg-transparent text-xs text-center outline-none cursor-pointer rounded"
                          style={{ color: costume?.color ?? '#6b7280' }}
                          title={costume ? `${costume.name} (${costume.condition})` : 'Unassigned'}
                        >
                          <option value="" className="bg-gray-800 text-gray-400">—</option>
                          {charCostumes.map(c => (
                            <option key={c.id} value={c.id} className="bg-gray-800 text-gray-200">{c.name}</option>
                          ))}
                        </select>
                        {costume && (
                          <div className="flex items-center justify-center mt-0.5 gap-1">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: costume.color }} />
                            <span className="text-gray-500 truncate" style={{ fontSize: '9px', maxWidth: '60px' }}>{costume.name}</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CostumeInventory({ costumes, castElements, sceneCostumes, breakdowns, onEdit, onDelete }: {
  costumes: CostumeItem[];
  castElements: Element[];
  sceneCostumes: SceneCostume[];
  breakdowns: BreakdownSheet[];
  onEdit: (c: CostumeItem) => void;
  onDelete: (id: string) => void;
}) {
  const grouped = castElements
    .map(char => ({ char, items: costumes.filter(c => c.characterId === char.id) }))
    .filter(g => g.items.length > 0);

  const ungrouped = costumes.filter(c => !castElements.find(e => e.id === c.characterId));

  if (costumes.length === 0) {
    return <div className="p-8 text-center text-gray-500">No costumes yet. Click + New Costume to add one.</div>;
  }

  const renderCostumeCard = (costume: CostumeItem) => {
    const scenesUsed = sceneCostumes.filter(sc => sc.costumeId === costume.id);
    const sceneNumbers = scenesUsed.map(sc => {
      const b = breakdowns.find(b => b.id === sc.sceneId);
      return b?.sceneNumber ?? '?';
    });

    return (
      <div key={costume.id} className="bg-gray-800 rounded border border-gray-700 p-3 flex gap-3 group">
        <div className="w-8 h-full flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full border-2 border-gray-600" style={{ backgroundColor: costume.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-100 font-semibold text-sm">{costume.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(costume)} className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded hover:text-amber-400">Edit</button>
              <button onClick={() => onDelete(costume.id)} className="text-xs px-1.5 py-0.5 bg-gray-700 text-red-400 rounded hover:bg-red-900/50">Del</button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">{costume.description}</p>
          <div className="flex flex-wrap gap-1 mb-1">
            {costume.pieces.map((piece, i) => (
              <span key={i} className="text-xs bg-gray-700 text-gray-300 rounded px-1.5 py-0.5">{piece}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={CONDITION_COLORS[costume.condition]}>{costume.condition}</span>
            {sceneNumbers.length > 0 && (
              <span className="text-gray-500">Scenes: {sceneNumbers.map(n => `Sc ${n}`).join(', ')}</span>
            )}
          </div>
          {costume.continuityNotes && (
            <p className="text-xs text-yellow-500/80 mt-1 italic">⚠ {costume.continuityNotes}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl">
      {grouped.map(({ char, items }) => (
        <div key={char.id}>
          <h3 className="text-amber-400 font-semibold text-sm mb-3">{char.name}</h3>
          <div className="space-y-2">
            {items.map(renderCostumeCard)}
          </div>
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div>
          <h3 className="text-gray-400 font-semibold text-sm mb-3">Other</h3>
          <div className="space-y-2">{ungrouped.map(renderCostumeCard)}</div>
        </div>
      )}
    </div>
  );
}

function ContinuityView({ characters, sceneOrder, costumes, getCostumeForCharacterInScene }: {
  characters: Element[];
  sceneOrder: BreakdownSheet[];
  costumes: CostumeItem[];
  getCostumeForCharacterInScene: (sceneId: string, characterId: string) => SceneCostume | undefined;
}) {
  if (characters.length === 0) {
    return <div className="p-8 text-center text-gray-500">No costumes assigned to characters yet.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <p className="text-xs text-gray-500">Costume timeline in shooting order. Flags potential continuity issues (same costume in non-adjacent scenes).</p>
      {characters.map(char => {
        const charScenes = sceneOrder.filter(scene =>
          scene.elements.includes(char.id) && getCostumeForCharacterInScene(scene.id, char.id)
        );

        if (charScenes.length === 0) return null;

        // Check continuity issues: same costume worn in non-adjacent slots
        const costumeSequence = charScenes.map(scene => {
          const sc = getCostumeForCharacterInScene(scene.id, char.id);
          return { scene, costume: sc ? costumes.find(c => c.id === sc.costumeId) : undefined };
        });

        const issues: string[] = [];
        for (let i = 1; i < costumeSequence.length; i++) {
          const prev = costumeSequence[i - 1];
          const curr = costumeSequence[i];
          if (prev.costume && curr.costume && prev.costume.id === curr.costume.id) {
            // Same costume — check if it's SUPPOSED to match (same day/continuity)
            // Flag if conditions suggest a change is expected
            if (prev.costume.condition === 'Clean' && i > 2) {
              issues.push(`Sc ${curr.scene.sceneNumber}: Same costume as Sc ${prev.scene.sceneNumber} — verify continuity`);
            }
          }
        }

        return (
          <div key={char.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-700 flex items-center justify-between">
              <span className="text-amber-400 font-semibold text-sm">{char.name}</span>
              <span className="text-gray-500 text-xs">{charScenes.length} scenes with costumes</span>
            </div>
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {costumeSequence.map(({ scene, costume }, idx) => (
                  <div key={scene.id} className="flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500">Sc {scene.sceneNumber}</div>
                    {costume ? (
                      <div
                        className="w-14 h-14 rounded border-2 border-gray-600 flex items-center justify-center relative"
                        style={{ backgroundColor: costume.color + '33', borderColor: costume.color }}
                        title={`${costume.name}\n${costume.condition}${costume.continuityNotes ? '\n⚠ ' + costume.continuityNotes : ''}`}
                      >
                        <div className="text-center" style={{ fontSize: '9px', color: costume.color }}>
                          <div className="font-semibold leading-tight px-1">{costume.name.slice(0, 12)}</div>
                          <div className="text-gray-500">{costume.condition}</div>
                        </div>
                        {costume.continuityNotes && (
                          <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">⚠</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded border border-dashed border-gray-600 flex items-center justify-center">
                        <span className="text-gray-600 text-xs">—</span>
                      </div>
                    )}
                    {idx < costumeSequence.length - 1 && <div className="text-gray-600 text-xs">→</div>}
                  </div>
                ))}
              </div>
              {issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {issues.map((issue, i) => (
                    <p key={i} className="text-xs text-yellow-400 flex items-center gap-1">
                      <span>⚠</span> {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CostumeFormPanel({ costume, castElements, onChange, onSave, onClose }: {
  costume: CostumeItem;
  castElements: Element[];
  onChange: (c: CostumeItem) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [piecesText, setPiecesText] = useState(costume.pieces.join('\n'));
  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200 focus:border-amber-500 focus:outline-none";
  const labelClass = "block text-xs text-gray-400 mb-1";
  const conditions: CostumeItem['condition'][] = ['New', 'Aged', 'Distressed', 'Bloody', 'Wet', 'Clean'];

  const handleSave = () => {
    onChange({ ...costume, pieces: piecesText.split('\n').map(s => s.trim()).filter(Boolean) });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-end z-50" onClick={onClose}>
      <div className="w-96 bg-gray-800 h-full border-l border-gray-700 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-gray-100 font-semibold text-sm">{costume.name || 'New Costume'}</h3>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">Save</button>
            <button onClick={onClose} className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className={labelClass}>Character</label>
            <select value={costume.characterId} onChange={e => onChange({ ...costume, characterId: e.target.value })} className={inputClass}>
              <option value="" className="bg-gray-800">— Select character —</option>
              {castElements.map(el => <option key={el.id} value={el.id} className="bg-gray-800">{el.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Costume Name</label>
            <input value={costume.name} onChange={e => onChange({ ...costume, name: e.target.value })} className={inputClass} placeholder="Business Suit, Hospital Gown, etc." />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={2} value={costume.description} onChange={e => onChange({ ...costume, description: e.target.value })}
              className={`${inputClass} resize-none`} placeholder="Detailed description…" />
          </div>
          <div>
            <label className={labelClass}>Pieces (one per line)</label>
            <textarea rows={4} value={piecesText} onChange={e => setPiecesText(e.target.value)}
              className={`${inputClass} resize-none font-mono text-xs`}
              placeholder="Navy blazer&#10;White dress shirt&#10;Grey trousers" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Condition</label>
              <select value={costume.condition} onChange={e => onChange({ ...costume, condition: e.target.value as CostumeItem['condition'] })} className={inputClass}>
                {conditions.map(c => <option key={c} value={c} className="bg-gray-800">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <div className="flex gap-2">
                <input type="color" value={costume.color} onChange={e => onChange({ ...costume, color: e.target.value })}
                  className="w-10 h-9 rounded border border-gray-600 bg-gray-700 cursor-pointer" />
                <input value={costume.color} onChange={e => onChange({ ...costume, color: e.target.value })}
                  className={`flex-1 ${inputClass}`} />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea rows={2} value={costume.notes ?? ''} onChange={e => onChange({ ...costume, notes: e.target.value || undefined })}
              className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Continuity Notes</label>
            <textarea rows={2} value={costume.continuityNotes ?? ''} onChange={e => onChange({ ...costume, continuityNotes: e.target.value || undefined })}
              className={`${inputClass} resize-none`} placeholder="Sleeve rolled up in Sc 5, IV removed after Sc 3…" />
          </div>
        </div>
      </div>
    </div>
  );
}
