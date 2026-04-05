import { useState, useEffect } from 'react';
import { useScheduling } from '../../stores/schedulingStore';
import type { BreakdownSheet as BreakdownSheetType, ElementCategory } from '../../types/scheduling';
import { ELEMENT_CATEGORY_COLORS } from '../../utils/colors';

const CATEGORIES: ElementCategory[] = [
  'Cast', 'Extras', 'Stunts', 'Vehicles', 'Props', 'Wardrobe', 'Makeup/Hair',
  'Livestock/Animals', 'Sound Effects/Music', 'Special Effects', 'Special Equipment',
  'Art Department', 'Set Dressing', 'Greenery', 'Visual Effects', 'Mechanical Effects',
  'Miscellaneous', 'Notes', 'Security',
];

export default function BreakdownSheetPanel() {
  const { state, dispatch } = useScheduling();
  const { project, selectedBreakdownId } = state;

  const breakdown = project?.breakdowns.find(b => b.id === selectedBreakdownId);
  const [form, setForm] = useState<BreakdownSheetType | null>(null);

  useEffect(() => {
    if (breakdown) setForm({ ...breakdown });
  }, [selectedBreakdownId, breakdown?.id]);

  if (!project || !selectedBreakdownId || !form) return null;

  const handleSave = () => {
    if (!form) return;
    dispatch({ type: 'UPDATE_BREAKDOWN', payload: form });
    dispatch({ type: 'SET_SELECTED_BREAKDOWN', payload: null });
  };

  const handleDelete = () => {
    if (window.confirm('Delete this scene breakdown?')) {
      dispatch({ type: 'DELETE_BREAKDOWN', payload: form.id });
    }
  };

  const toggleElement = (elementId: string) => {
    setForm(prev => {
      if (!prev) return prev;
      const has = prev.elements.includes(elementId);
      return { ...prev, elements: has ? prev.elements.filter(id => id !== elementId) : [...prev.elements, elementId] };
    });
  };

  const elementsByCategory = CATEGORIES.map(cat => ({
    category: cat,
    elements: project.elements.filter(e => e.category === cat),
  })).filter(g => g.elements.length > 0);

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl z-40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
        <div>
          <h2 className="text-gray-100 font-bold text-base">Scene {form.sceneNumber}</h2>
          <p className="text-gray-500 text-xs">{form.setName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="px-3 py-1.5 text-xs bg-red-900 text-red-300 rounded hover:bg-red-800">Delete</button>
          <button onClick={() => dispatch({ type: 'SET_SELECTED_BREAKDOWN', payload: null })} className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-amber-500 text-gray-900 rounded font-semibold hover:bg-amber-400">Save</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Scene #</label>
            <input value={form.sceneNumber} onChange={e => setForm(p => p && ({ ...p, sceneNumber: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">INT/EXT</label>
            <select value={form.intExt} onChange={e => setForm(p => p && ({ ...p, intExt: e.target.value as BreakdownSheetType['intExt'] }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500">
              <option>INT</option><option>EXT</option><option>INT/EXT</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Day/Night</label>
            <select value={form.dayNight} onChange={e => setForm(p => p && ({ ...p, dayNight: e.target.value as BreakdownSheetType['dayNight'] }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500">
              <option>DAY</option><option>NIGHT</option><option>DAWN</option><option>DUSK</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pages</label>
            <input value={form.pageCount} onChange={e => setForm(p => p && ({ ...p, pageCount: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" placeholder="2/8" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Set Name</label>
            <input value={form.setName} onChange={e => setForm(p => p && ({ ...p, setName: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Location</label>
            <input value={form.location} onChange={e => setForm(p => p && ({ ...p, location: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => p && ({ ...p, description: e.target.value }))}
            rows={3} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => p && ({ ...p, notes: e.target.value }))}
            rows={2} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Script Page</label>
            <input type="number" value={form.scriptPage} onChange={e => setForm(p => p && ({ ...p, scriptPage: parseInt(e.target.value) || 0 }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Est. Time</label>
            <input value={form.estimatedTime || ''} onChange={e => setForm(p => p && ({ ...p, estimatedTime: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" placeholder="1/2 day" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Elements</h3>
          <div className="space-y-3">
            {elementsByCategory.map(({ category, elements }) => (
              <div key={category}>
                <div className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: ELEMENT_CATEGORY_COLORS[category] || '#9ca3af' }}>
                  {category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {elements.map(el => {
                    const isSelected = form.elements.includes(el.id);
                    return (
                      <button key={el.id} onClick={() => toggleElement(el.id)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${isSelected ? 'text-gray-900 font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        style={isSelected ? { backgroundColor: ELEMENT_CATEGORY_COLORS[category] || '#9ca3af' } : {}}>
                        {el.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
