import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BreakdownSheet, Element } from '../../types/scheduling';
import { getStripColor } from '../../utils/colors';

interface StripProps {
  id: string;
  breakdown: BreakdownSheet;
  elements: Element[];
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function Strip({ id, breakdown, elements, onSelect, onContextMenu }: StripProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: getStripColor(breakdown.intExt, breakdown.dayNight),
    color: '#111827',
  };

  const castElements = elements.filter(e => breakdown.elements.includes(e.id) && e.category === 'Cast');

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center h-7 text-xs border-b border-gray-300 cursor-pointer hover:brightness-95 transition-all select-none"
      onClick={onSelect} onContextMenu={onContextMenu}>
      <div {...attributes} {...listeners}
        className="flex items-center justify-center w-6 h-full flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/10"
        onClick={e => e.stopPropagation()}>
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.4">
          <circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/>
        </svg>
      </div>
      <div className="w-10 flex-shrink-0 px-1 font-bold text-center truncate">{breakdown.sceneNumber}</div>
      <div className="w-16 flex-shrink-0 px-1 text-center"><span className="font-medium">{breakdown.intExt}</span></div>
      <div className="w-12 flex-shrink-0 px-1 text-center font-medium">{breakdown.dayNight}</div>
      <div className="w-36 flex-shrink-0 min-w-0 px-1 truncate" title={`${breakdown.setName} - ${breakdown.location}`}>
        <span className="font-medium">{breakdown.setName}</span>
        <span className="opacity-60 ml-1">{breakdown.location}</span>
      </div>
      <div className="flex-1 min-w-0 px-1 truncate opacity-70" title={breakdown.description}>{breakdown.description}</div>
      <div className="w-12 flex-shrink-0 px-1 text-center text-xs font-mono">{breakdown.pageCount}</div>
      <div className="w-20 flex-shrink-0 px-1 flex gap-0.5 flex-wrap overflow-hidden">
        {castElements.slice(0, 5).map(el => {
          const num = el.name.match(/\((\d+)\)/)?.[1] || '';
          return (
            <span key={el.id} className="text-xs px-1 rounded font-bold"
              style={{ backgroundColor: '#374151', color: '#f3f4f6', fontSize: '9px' }} title={el.name}>
              {num}
            </span>
          );
        })}
      </div>
    </div>
  );
}
