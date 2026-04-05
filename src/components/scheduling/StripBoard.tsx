import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useScheduling } from '../../stores/schedulingStore';
import Strip from './Strip';
import DayBreak from './DayBreak';


interface ContextMenu {
  x: number;
  y: number;
  itemId: string;
  itemIndex: number;
}

function parsePageCount(pc: string): number {
  if (!pc) return 0;
  const matchFull = pc.match(/^(\d+)\s+(\d+)\/8$/);
  if (matchFull) return parseInt(matchFull[1]) + parseInt(matchFull[2]) / 8;
  const matchEighths = pc.match(/^(\d+)\/8$/);
  if (matchEighths) return parseInt(matchEighths[1]) / 8;
  const matchWhole = pc.match(/^(\d+)\s+0\/8$/);
  if (matchWhole) return parseInt(matchWhole[1]);
  return parseFloat(pc) || 0;
}

function BannerItem({ id, text, onContextMenu }: { id: string; text: string; onContextMenu: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: '#78350f',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center h-6 border-b border-amber-700 select-none"
      onContextMenu={onContextMenu}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-6 h-full flex-shrink-0 cursor-grab hover:bg-amber-900"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="#fde68a">
          <circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/>
        </svg>
      </div>
      <div className="flex-1 text-center text-xs font-bold text-amber-200 uppercase tracking-widest">{text}</div>
    </div>
  );
}

export default function StripBoard() {
  const { state, dispatch } = useScheduling();
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    function handleClick() { setContextMenu(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!state.project) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No project loaded.
      </div>
    );
  }

  const { project } = state;
  const stripBoard = project.stripBoard;

  const ids = stripBoard.map(item => item.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newBoard = arrayMove(stripBoard, oldIndex, newIndex);
    dispatch({ type: 'REORDER_STRIP_BOARD', payload: newBoard });
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId, itemIndex: index });
  };

  const handleContextAction = (action: string) => {
    if (!contextMenu) return;
    const { itemIndex, itemId } = contextMenu;

    switch (action) {
      case 'insertDayBreak': {
        const dayNumber = stripBoard.filter(i => i.type === 'dayBreak').length + 1;
        dispatch({ type: 'ADD_DAY_BREAK', payload: { afterIndex: itemIndex, dayNumber, label: `END OF DAY ${dayNumber}` } });
        break;
      }
      case 'insertBanner': {
        const text = window.prompt('Banner text:') || 'NEW BANNER';
        dispatch({ type: 'ADD_BANNER', payload: { afterIndex: itemIndex, text, color: '#f59e0b' } });
        break;
      }
      case 'delete': {
        const item = stripBoard[itemIndex];
        if (item.type === 'scene') {
          dispatch({ type: 'DELETE_BREAKDOWN', payload: item.breakdownId });
        } else {
          dispatch({ type: 'DELETE_STRIP_ITEM', payload: itemId });
        }
        break;
      }
      case 'moveTop': {
        const newBoard = [...stripBoard];
        const [moved] = newBoard.splice(itemIndex, 1);
        newBoard.unshift(moved);
        dispatch({ type: 'REORDER_STRIP_BOARD', payload: newBoard });
        break;
      }
      case 'moveBottom': {
        const newBoard = [...stripBoard];
        const [moved] = newBoard.splice(itemIndex, 1);
        newBoard.push(moved);
        dispatch({ type: 'REORDER_STRIP_BOARD', payload: newBoard });
        break;
      }
    }
    setContextMenu(null);
  };

  const sceneItems = stripBoard.filter(i => i.type === 'scene');
  const totalPages = sceneItems.reduce((sum, item) => {
    if (item.type !== 'scene') return sum;
    const bd = project.breakdowns.find(b => b.id === item.breakdownId);
    return sum + (bd ? parsePageCount(bd.pageCount) : 0);
  }, 0);
  const totalDays = stripBoard.filter(i => i.type === 'dayBreak').length;
  const avgPages = totalDays > 0 ? (totalPages / totalDays).toFixed(2) : '0';

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-800">
      {/* Column headers */}
      <div className="flex items-center h-8 bg-gray-900 border-b border-gray-600 text-xs text-gray-400 font-semibold flex-shrink-0">
        <div className="w-6 flex-shrink-0" />
        <div className="w-10 flex-shrink-0 px-1 text-center">Sc#</div>
        <div className="w-16 flex-shrink-0 px-1 text-center">INT/EXT</div>
        <div className="w-12 flex-shrink-0 px-1 text-center">D/N</div>
        <div className="flex-1 min-w-0 px-1">Set / Location</div>
        <div className="w-12 flex-shrink-0 px-1 text-center">Pages</div>
      </div>

      {/* Strip list */}
      <div className="flex-1 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {stripBoard.map((item, index) => {
              if (item.type === 'dayBreak') {
                return (
                  <DayBreak
                    key={item.id}
                    id={item.id}
                    dayNumber={item.dayNumber}
                    label={item.label}
                    onContextMenu={(e) => handleContextMenu(e, item.id, index)}
                  />
                );
              }

              if (item.type === 'banner') {
                return (
                  <BannerItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    onContextMenu={(e) => handleContextMenu(e, item.id, index)}
                  />
                );
              }

              if (item.type === 'scene') {
                const breakdown = project.breakdowns.find(b => b.id === item.breakdownId);
                if (!breakdown) return null;
                return (
                  <Strip
                    key={item.id}
                    id={item.id}
                    breakdown={breakdown}
                    onSelect={() => dispatch({ type: 'SET_SELECTED_BREAKDOWN', payload: breakdown.id })}
                    onContextMenu={(e) => handleContextMenu(e, item.id, index)}
                  />
                );
              }

              return null;
            })}
          </SortableContext>
        </DndContext>
      </div>

      {/* Summary bar */}
      <div className="h-8 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-6 text-xs text-gray-400 flex-shrink-0">
        <span>Total Scenes: <span className="text-gray-200 font-semibold">{sceneItems.length}</span></span>
        <span>Total Pages: <span className="text-gray-200 font-semibold">{totalPages.toFixed(2)}</span></span>
        <span>Total Days: <span className="text-gray-200 font-semibold">{totalDays}</span></span>
        <span>Avg Pages/Day: <span className="text-gray-200 font-semibold">{avgPages}</span></span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {([
            { action: 'insertDayBreak', label: 'Insert Day Break After' },
            { action: 'insertBanner', label: 'Insert Banner After' },
            null,
            { action: 'moveTop', label: 'Move to Top' },
            { action: 'moveBottom', label: 'Move to Bottom' },
            null,
            { action: 'delete', label: 'Delete', danger: true },
          ] as Array<{ action: string; label: string; danger?: boolean } | null>).map((item, i) =>
            item === null ? (
              <div key={i} className="border-t border-gray-700 my-1" />
            ) : (
              <button
                key={item.action}
                onClick={() => handleContextAction(item.action)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  item.danger ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
