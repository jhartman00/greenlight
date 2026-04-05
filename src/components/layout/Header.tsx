import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScheduling } from '../../stores/schedulingStore';
import { useBudgeting } from '../../stores/budgetingStore';

export default function Header() {
  const location = useLocation();
  const { state: schedState, dispatch: schedDispatch } = useScheduling();
  const { state: budgetState } = useBudgeting();

  const isScheduling = location.pathname.startsWith('/scheduling');
  const isBudgeting = location.pathname.startsWith('/budgeting');

  const projectName = isScheduling ? schedState.project?.name : budgetState.project?.name;

  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNameClick = () => {
    if (projectName) { setNameValue(projectName); setEditing(true); }
  };

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  const handleNameSave = () => {
    if (nameValue.trim() && schedState.project && isScheduling) {
      schedDispatch({ type: 'SET_PROJECT', payload: { ...schedState.project, name: nameValue.trim() } });
    }
    setEditing(false);
  };

  const moduleBadge = isScheduling ? 'Scheduling' : isBudgeting ? 'Budgeting' : '';

  return (
    <header className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-4 flex-shrink-0 no-print">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {editing ? (
          <input ref={inputRef} value={nameValue} onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditing(false); }}
            className="bg-gray-800 text-gray-100 text-sm font-semibold px-2 py-1 rounded border border-amber-500 outline-none" />
        ) : (
          <span onClick={handleNameClick}
            className="text-gray-100 text-sm font-semibold truncate cursor-pointer hover:text-amber-400 transition-colors"
            title="Click to rename project">
            {projectName || 'No Project'}
          </span>
        )}
        {moduleBadge && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-gray-900 font-bold uppercase tracking-wide flex-shrink-0">{moduleBadge}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          Auto-saved
        </span>
      </div>
    </header>
  );
}
