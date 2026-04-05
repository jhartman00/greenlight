import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DayBreakProps {
  id: string;
  dayNumber: number;
  label?: string;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function DayBreak({ id, dayNumber, label, onContextMenu }: DayBreakProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center h-6 bg-gray-900 border-b border-gray-600 select-none"
      onContextMenu={onContextMenu}>
      <div {...attributes} {...listeners}
        className="flex items-center justify-center w-6 h-full flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-gray-700">
        <svg width="10" height="14" viewBox="0 0 10 14" fill="#6b7280">
          <circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/>
        </svg>
      </div>
      <div className="flex-1 text-center text-xs font-bold tracking-widest uppercase text-amber-400">
        {label || `END OF DAY ${dayNumber}`}
      </div>
    </div>
  );
}
