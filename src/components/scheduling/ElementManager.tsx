import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduling } from '../../stores/schedulingStore';
import type { ElementCategory } from '../../types/scheduling';
import { ELEMENT_CATEGORY_COLORS } from '../../utils/colors';

const ALL_CATEGORIES: ElementCategory[] = [
  'Cast', 'Extras', 'Stunts', 'Vehicles', 'Props', 'Wardrobe', 'Makeup/Hair',
  'Livestock/Animals', 'Sound Effects/Music', 'Special Effects', 'Special Equipment',
  'Art Department', 'Set Dressing', 'Greenery', 'Visual Effects', 'Mechanical Effects',
  'Miscellaneous', 'Notes', 'Security',
];

interface EditingElement { id: string | null; name: string; notes: string; category: ElementCategory; }

export default function ElementManager() {
  const { state, dispatch } = useScheduling();
  const [expandedCategories, setExpandedCategories] = useState<Set<ElementCategory>>(new Set(['Cast']));
  const [editing, setEditing] = useState<EditingElement | null>(null);

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project } = state;

  const toggleCategory = (cat: ElementCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const handleSave = () => {
    if (!editing || !editing.name.trim()) return;
    if (editing.id) {
      dispatch({ type: 'UPDATE_ELEMENT', payload: { id: editing.id, category: editing.category, name: editing.name.trim(), notes: editing.notes } });
    } else {
      dispatch({ type: 'ADD_ELEMENT', payload: { id: uuidv4(), category: editing.category, name: editing.name.trim(), notes: editing.notes } });
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this element? It will be removed from all scenes.')) {
      dispatch({ type: 'DELETE_ELEMENT', payload: id });
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-gray-100 font-semibold text-sm">Element Manager</h2>
          <p className="text-gray-500 text-xs">{project.elements.length} total elements</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-3 max-w-4xl">
          {ALL_CATEGORIES.map(category => {
            const elements = project.elements.filter(e => e.category === category);
            const color = ELEMENT_CATEGORY_COLORS[category] || '#9ca3af';
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                style={{ borderLeftColor: color, borderLeftWidth: '3px' }}>
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-750 select-none"
                  onClick={() => toggleCategory(category)}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm font-semibold text-gray-200">{category}</span>
                    <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded-full">{elements.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditing({ id: null, name: '', notes: '', category }); setExpandedCategories(p => new Set([...p, category])); }}
                      className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">+ Add</button>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-700 px-4 py-3 space-y-2">
                    {elements.length === 0 && <p className="text-gray-600 text-xs italic">No elements. Click + Add to create one.</p>}
                    {elements.map(el => (
                      <div key={el.id} className="flex items-center justify-between rounded px-3 py-2 group hover:bg-gray-700">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-200">{el.name}</div>
                          {el.notes && <div className="text-xs text-gray-500 truncate">{el.notes}</div>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 ml-2">
                          <button onClick={() => setEditing({ id: el.id, name: el.name, notes: el.notes || '', category: el.category })}
                            className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded hover:bg-gray-500">Edit</button>
                          <button onClick={() => handleDelete(el.id)}
                            className="text-xs px-2 py-0.5 bg-red-900 text-red-300 rounded hover:bg-red-800">Del</button>
                        </div>
                      </div>
                    ))}
                    {editing && editing.category === category && (
                      <div className="bg-gray-700 rounded p-3 space-y-2">
                        <input autoFocus placeholder="Element name" value={editing.name}
                          onChange={e => setEditing(p => p && ({ ...p, name: e.target.value }))}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
                          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(null); }} />
                        <input placeholder="Notes (optional)" value={editing.notes}
                          onChange={e => setEditing(p => p && ({ ...p, notes: e.target.value }))}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
                        <div className="flex gap-2">
                          <button onClick={handleSave} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">Save</button>
                          <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
