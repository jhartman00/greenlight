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


  return (
    <div ref={setNodeRef} style={style}
      className="flex flex-wrap items-start py-1 text-xs border-b border-gray-300 cursor-pointer hover:brightness-95 transition-all select-none"
      onClick={onSelect} onContextMenu={onContextMenu}>
      {/* Top row: core info */}
      <div className="flex items-center w-full">
        <div {...attributes} {...listeners}
          className="flex items-center justify-center w-6 flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/10"
          onClick={e => e.stopPropagation()}>
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity="0.4">
            <circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/>
            <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
            <circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/>
          </svg>
        </div>
        <div className="w-10 flex-shrink-0 px-1 font-bold text-center">{breakdown.sceneNumber}</div>
        <div className="w-16 flex-shrink-0 px-1 text-center"><span className="font-medium">{breakdown.intExt}</span></div>
        <div className="w-12 flex-shrink-0 px-1 text-center font-medium">{breakdown.dayNight}</div>
        <div className="flex-1 min-w-0 px-1">
          <span className="font-medium">{breakdown.setName}</span>
          <span className="opacity-60 ml-1">— {breakdown.location}</span>
        </div>
        <div className="w-12 flex-shrink-0 px-1 text-center font-mono">{breakdown.pageCount}</div>
      </div>
      {/* Second row: description */}
      {breakdown.description && (
        <div className="w-full pl-[104px] pr-2 pt-0.5 opacity-70 leading-snug break-words">
          {breakdown.description}
        </div>
      )}
    </div>
  );
}
