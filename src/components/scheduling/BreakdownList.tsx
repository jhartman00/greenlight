import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduling } from '../../stores/schedulingStore';
import BreakdownSheetPanel from './BreakdownSheet';
import type { BreakdownSheet } from '../../types/scheduling';
import { getStripColor } from '../../utils/colors';

export default function BreakdownList() {
  const { state, dispatch } = useScheduling();
  const [showNewForm, setShowNewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'sceneNumber' | 'stripOrder'>('sceneNumber');
  const [newScene, setNewScene] = useState({
    sceneNumber: '', intExt: 'INT' as BreakdownSheet['intExt'],
    dayNight: 'DAY' as BreakdownSheet['dayNight'],
    location: '', setName: '', description: '', pageCount: '1/8',
  });

  if (!state.project) return <div className="flex-1 flex items-center justify-center text-gray-500">No project loaded.</div>;

  const { project, selectedBreakdownId } = state;

  let breakdowns = [...project.breakdowns];
  if (sortBy === 'sceneNumber') {
    breakdowns.sort((a, b) => {
      const na = parseFloat(a.sceneNumber.replace(/[^0-9.]/g, '')) || 0;
      const nb = parseFloat(b.sceneNumber.replace(/[^0-9.]/g, '')) || 0;
      return na - nb;
    });
  } else {
    const stripOrder = project.stripBoard.filter(i => i.type === 'scene').map(i => (i as {type:'scene';id:string;breakdownId:string}).breakdownId);
    breakdowns.sort((a, b) => {
      const ia = stripOrder.indexOf(a.id);
      const ib = stripOrder.indexOf(b.id);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }

  const handleAddScene = () => {
    if (!newScene.sceneNumber.trim()) return;
    const bd: BreakdownSheet = {
      id: uuidv4(), sceneNumber: newScene.sceneNumber, intExt: newScene.intExt,
      dayNight: newScene.dayNight, location: newScene.location, setName: newScene.setName,
      description: newScene.description, scriptPage: 0, pageCount: newScene.pageCount, elements: [], notes: '',
    };
    dispatch({ type: 'ADD_BREAKDOWN', payload: bd });
    setShowNewForm(false);
    setNewScene({ sceneNumber: '', intExt: 'INT', dayNight: 'DAY', location: '', setName: '', description: '', pageCount: '1/8' });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-300">Breakdown List</span>
          <span className="text-xs text-gray-500">{project.breakdowns.length} scenes</span>
        </div>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none">
            <option value="sceneNumber">Sort: Scene #</option>
            <option value="stripOrder">Sort: Strip Order</option>
          </select>
          <button onClick={() => setShowNewForm(true)}
            className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">
            + Add Scene
          </button>
        </div>
      </div>

      {showNewForm && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-600 flex-shrink-0">
          <input placeholder="Scene #" value={newScene.sceneNumber} onChange={e => setNewScene(p => ({ ...p, sceneNumber: e.target.value }))}
            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-amber-500" />
          <select value={newScene.intExt} onChange={e => setNewScene(p => ({ ...p, intExt: e.target.value as any }))}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100">
            <option>INT</option><option>EXT</option><option>INT/EXT</option>
          </select>
          <select value={newScene.dayNight} onChange={e => setNewScene(p => ({ ...p, dayNight: e.target.value as any }))}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100">
            <option>DAY</option><option>NIGHT</option><option>DAWN</option><option>DUSK</option>
          </select>
          <input placeholder="Set Name" value={newScene.setName} onChange={e => setNewScene(p => ({ ...p, setName: e.target.value }))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-amber-500" />
          <input placeholder="Location" value={newScene.location} onChange={e => setNewScene(p => ({ ...p, location: e.target.value }))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-amber-500" />
          <input placeholder="Pages" value={newScene.pageCount} onChange={e => setNewScene(p => ({ ...p, pageCount: e.target.value }))}
            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none" />
          <button onClick={handleAddScene} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-xs font-semibold hover:bg-amber-400">Add</button>
          <button onClick={() => setShowNewForm(false)} className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-xs hover:bg-gray-500">Cancel</button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="text-gray-400 font-semibold border-b border-gray-700">
              <th className="px-3 py-2 text-left w-16">Scene #</th>
              <th className="px-3 py-2 text-left w-16">INT/EXT</th>
              <th className="px-3 py-2 text-left w-16">D/N</th>
              <th className="px-3 py-2 text-left">Set Name</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-right w-16">Pages</th>
              <th className="px-3 py-2 text-right w-16">Cast</th>
              <th className="px-3 py-2 text-right w-16">Elements</th>
            </tr>
          </thead>
          <tbody>
            {breakdowns.map(bd => {
              const bg = getStripColor(bd.intExt, bd.dayNight);
              const castCount = project.elements.filter(e => bd.elements.includes(e.id) && e.category === 'Cast').length;
              const isSelected = bd.id === selectedBreakdownId;
              return (
                <tr key={bd.id} onClick={() => dispatch({ type: 'SET_SELECTED_BREAKDOWN', payload: bd.id })}
                  className={`border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${isSelected ? 'ring-1 ring-amber-500' : ''}`}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: bg }} />
                      <span className="font-bold text-gray-100">{bd.sceneNumber}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-400">{bd.intExt}</td>
                  <td className="px-3 py-2 text-gray-400">{bd.dayNight}</td>
                  <td className="px-3 py-2 text-gray-200 max-w-48 truncate">{bd.setName}</td>
                  <td className="px-3 py-2 text-gray-400 max-w-48 truncate">{bd.location}</td>
                  <td className="px-3 py-2 text-right text-gray-300 font-mono">{bd.pageCount}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{castCount}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{bd.elements.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedBreakdownId && <BreakdownSheetPanel />}
    </div>
  );
}
