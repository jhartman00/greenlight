import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  SchedulingProject, BreakdownSheet, Element, StripBoardItem,
  ExtraGroup, SceneExtras, ExtrasVoucher,
  CostumeItem, SceneCostume,
  ScriptRevision, ScriptChange, LockedPage,
  ProductionSet,
} from '../types/scheduling';
import { sampleSchedulingProject } from '../utils/sampleData';

type ActiveView = 'stripboard' | 'breakdowns' | 'elements' | 'dood' | 'calendar' | 'extras' | 'wardrobe' | 'script' | 'sets' | 'reports';

interface SchedulingState {
  project: SchedulingProject | null;
  selectedBreakdownId: string | null;
  activeView: ActiveView;
}

export type SchedulingAction =
  | { type: 'SET_PROJECT'; payload: SchedulingProject }
  | { type: 'UPDATE_BREAKDOWN'; payload: BreakdownSheet }
  | { type: 'ADD_BREAKDOWN'; payload: BreakdownSheet }
  | { type: 'DELETE_BREAKDOWN'; payload: string }
  | { type: 'REORDER_STRIP_BOARD'; payload: StripBoardItem[] }
  | { type: 'ADD_DAY_BREAK'; payload: { afterIndex: number; dayNumber: number; label?: string } }
  | { type: 'ADD_BANNER'; payload: { afterIndex: number; text: string; color: string } }
  | { type: 'ADD_ELEMENT'; payload: Element }
  | { type: 'UPDATE_ELEMENT'; payload: Element }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SET_SELECTED_BREAKDOWN'; payload: string | null }
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView }
  | { type: 'LOAD_SAMPLE' }
  | { type: 'DELETE_STRIP_ITEM'; payload: string }
  // Extras
  | { type: 'ADD_EXTRA_GROUP'; payload: ExtraGroup }
  | { type: 'UPDATE_EXTRA_GROUP'; payload: ExtraGroup }
  | { type: 'DELETE_EXTRA_GROUP'; payload: string }
  | { type: 'UPDATE_SCENE_EXTRAS'; payload: SceneExtras }
  | { type: 'ADD_EXTRAS_VOUCHER'; payload: ExtrasVoucher }
  | { type: 'UPDATE_EXTRAS_VOUCHER'; payload: ExtrasVoucher }
  | { type: 'DELETE_EXTRAS_VOUCHER'; payload: string }
  // Costumes
  | { type: 'ADD_COSTUME'; payload: CostumeItem }
  | { type: 'UPDATE_COSTUME'; payload: CostumeItem }
  | { type: 'DELETE_COSTUME'; payload: string }
  | { type: 'UPDATE_SCENE_COSTUME'; payload: SceneCostume }
  | { type: 'DELETE_SCENE_COSTUME'; payload: { sceneId: string; characterId: string } }
  // Script
  | { type: 'ADD_REVISION'; payload: ScriptRevision }
  | { type: 'UPDATE_REVISION'; payload: ScriptRevision }
  | { type: 'DELETE_REVISION'; payload: string }
  | { type: 'ADD_SCRIPT_CHANGE'; payload: ScriptChange }
  | { type: 'UPDATE_SCRIPT_CHANGE'; payload: ScriptChange }
  | { type: 'DELETE_SCRIPT_CHANGE'; payload: string }
  | { type: 'ADD_LOCKED_PAGE'; payload: LockedPage }
  | { type: 'DELETE_LOCKED_PAGE'; payload: string }
  // Sets
  | { type: 'ADD_SET'; payload: ProductionSet }
  | { type: 'UPDATE_SET'; payload: ProductionSet }
  | { type: 'DELETE_SET'; payload: string };

export type { SchedulingState };

export function schedulingReducer(state: SchedulingState, action: SchedulingAction): SchedulingState {
  if (!state.project && action.type !== 'SET_PROJECT' && action.type !== 'LOAD_SAMPLE') {
    return state;
  }

  const now = new Date().toISOString();

  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.payload };

    case 'LOAD_SAMPLE':
      return { ...state, project: { ...sampleSchedulingProject, id: uuidv4(), createdAt: now, updatedAt: now } };

    case 'UPDATE_BREAKDOWN': {
      const project = state.project!;
      return {
        ...state,
        project: {
          ...project,
          breakdowns: project.breakdowns.map(b => b.id === action.payload.id ? action.payload : b),
          updatedAt: now,
        },
      };
    }

    case 'ADD_BREAKDOWN': {
      const project = state.project!;
      const newItem: StripBoardItem = { type: 'scene', id: uuidv4(), breakdownId: action.payload.id };
      return {
        ...state,
        project: {
          ...project,
          breakdowns: [...project.breakdowns, action.payload],
          stripBoard: [...project.stripBoard, newItem],
          updatedAt: now,
        },
      };
    }

    case 'DELETE_BREAKDOWN': {
      const project = state.project!;
      return {
        ...state,
        project: {
          ...project,
          breakdowns: project.breakdowns.filter(b => b.id !== action.payload),
          stripBoard: project.stripBoard.filter(item =>
            !(item.type === 'scene' && item.breakdownId === action.payload)
          ),
          updatedAt: now,
        },
        selectedBreakdownId: state.selectedBreakdownId === action.payload ? null : state.selectedBreakdownId,
      };
    }

    case 'REORDER_STRIP_BOARD': {
      const project = state.project!;
      return {
        ...state,
        project: { ...project, stripBoard: action.payload, updatedAt: now },
      };
    }

    case 'ADD_DAY_BREAK': {
      const project = state.project!;
      const newBreak: StripBoardItem = {
        type: 'dayBreak',
        id: uuidv4(),
        dayNumber: action.payload.dayNumber,
        label: action.payload.label,
      };
      const newBoard = [...project.stripBoard];
      newBoard.splice(action.payload.afterIndex + 1, 0, newBreak);
      return {
        ...state,
        project: { ...project, stripBoard: newBoard, updatedAt: now },
      };
    }

    case 'ADD_BANNER': {
      const project = state.project!;
      const newBanner: StripBoardItem = {
        type: 'banner',
        id: uuidv4(),
        text: action.payload.text,
        color: action.payload.color,
      };
      const newBoard = [...project.stripBoard];
      newBoard.splice(action.payload.afterIndex + 1, 0, newBanner);
      return {
        ...state,
        project: { ...project, stripBoard: newBoard, updatedAt: now },
      };
    }

    case 'ADD_ELEMENT': {
      const project = state.project!;
      return {
        ...state,
        project: { ...project, elements: [...project.elements, action.payload], updatedAt: now },
      };
    }

    case 'UPDATE_ELEMENT': {
      const project = state.project!;
      return {
        ...state,
        project: {
          ...project,
          elements: project.elements.map(e => e.id === action.payload.id ? action.payload : e),
          updatedAt: now,
        },
      };
    }

    case 'DELETE_ELEMENT': {
      const project = state.project!;
      return {
        ...state,
        project: {
          ...project,
          elements: project.elements.filter(e => e.id !== action.payload),
          breakdowns: project.breakdowns.map(b => ({
            ...b,
            elements: b.elements.filter(eid => eid !== action.payload),
          })),
          updatedAt: now,
        },
      };
    }

    case 'DELETE_STRIP_ITEM': {
      const project = state.project!;
      return {
        ...state,
        project: {
          ...project,
          stripBoard: project.stripBoard.filter(item => {
            if (item.type === 'dayBreak') return item.id !== action.payload;
            if (item.type === 'banner') return item.id !== action.payload;
            return true;
          }),
          updatedAt: now,
        },
      };
    }

    case 'SET_SELECTED_BREAKDOWN':
      return { ...state, selectedBreakdownId: action.payload };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    // ── Extras ────────────────────────────────────────────────────────────
    case 'ADD_EXTRA_GROUP': {
      const project = state.project!;
      return { ...state, project: { ...project, extraGroups: [...(project.extraGroups ?? []), action.payload], updatedAt: now } };
    }
    case 'UPDATE_EXTRA_GROUP': {
      const project = state.project!;
      return { ...state, project: { ...project, extraGroups: (project.extraGroups ?? []).map(g => g.id === action.payload.id ? action.payload : g), updatedAt: now } };
    }
    case 'DELETE_EXTRA_GROUP': {
      const project = state.project!;
      return { ...state, project: { ...project, extraGroups: (project.extraGroups ?? []).filter(g => g.id !== action.payload), updatedAt: now } };
    }
    case 'UPDATE_SCENE_EXTRAS': {
      const project = state.project!;
      const existing = (project.sceneExtras ?? []).filter(se => se.sceneId !== action.payload.sceneId);
      return { ...state, project: { ...project, sceneExtras: [...existing, action.payload], updatedAt: now } };
    }
    case 'ADD_EXTRAS_VOUCHER': {
      const project = state.project!;
      return { ...state, project: { ...project, extrasVouchers: [...(project.extrasVouchers ?? []), action.payload], updatedAt: now } };
    }
    case 'UPDATE_EXTRAS_VOUCHER': {
      const project = state.project!;
      return { ...state, project: { ...project, extrasVouchers: (project.extrasVouchers ?? []).map(v => v.id === action.payload.id ? action.payload : v), updatedAt: now } };
    }
    case 'DELETE_EXTRAS_VOUCHER': {
      const project = state.project!;
      return { ...state, project: { ...project, extrasVouchers: (project.extrasVouchers ?? []).filter(v => v.id !== action.payload), updatedAt: now } };
    }

    // ── Costumes ──────────────────────────────────────────────────────────
    case 'ADD_COSTUME': {
      const project = state.project!;
      return { ...state, project: { ...project, costumes: [...(project.costumes ?? []), action.payload], updatedAt: now } };
    }
    case 'UPDATE_COSTUME': {
      const project = state.project!;
      return { ...state, project: { ...project, costumes: (project.costumes ?? []).map(c => c.id === action.payload.id ? action.payload : c), updatedAt: now } };
    }
    case 'DELETE_COSTUME': {
      const project = state.project!;
      return { ...state, project: { ...project, costumes: (project.costumes ?? []).filter(c => c.id !== action.payload), updatedAt: now } };
    }
    case 'UPDATE_SCENE_COSTUME': {
      const project = state.project!;
      const filtered = (project.sceneCostumes ?? []).filter(sc =>
        !(sc.sceneId === action.payload.sceneId && sc.characterId === action.payload.characterId)
      );
      return { ...state, project: { ...project, sceneCostumes: [...filtered, action.payload], updatedAt: now } };
    }
    case 'DELETE_SCENE_COSTUME': {
      const project = state.project!;
      return {
        ...state,
        project: {
          ...project,
          sceneCostumes: (project.sceneCostumes ?? []).filter(sc =>
            !(sc.sceneId === action.payload.sceneId && sc.characterId === action.payload.characterId)
          ),
          updatedAt: now,
        },
      };
    }

    // ── Script ────────────────────────────────────────────────────────────
    case 'ADD_REVISION': {
      const project = state.project!;
      return { ...state, project: { ...project, revisions: [...(project.revisions ?? []), action.payload], updatedAt: now } };
    }
    case 'UPDATE_REVISION': {
      const project = state.project!;
      return { ...state, project: { ...project, revisions: (project.revisions ?? []).map(r => r.id === action.payload.id ? action.payload : r), updatedAt: now } };
    }
    case 'DELETE_REVISION': {
      const project = state.project!;
      return { ...state, project: { ...project, revisions: (project.revisions ?? []).filter(r => r.id !== action.payload), updatedAt: now } };
    }
    case 'ADD_SCRIPT_CHANGE': {
      const project = state.project!;
      return { ...state, project: { ...project, scriptChanges: [...(project.scriptChanges ?? []), action.payload], updatedAt: now } };
    }
    case 'UPDATE_SCRIPT_CHANGE': {
      const project = state.project!;
      return { ...state, project: { ...project, scriptChanges: (project.scriptChanges ?? []).map(c => c.id === action.payload.id ? action.payload : c), updatedAt: now } };
    }
    case 'DELETE_SCRIPT_CHANGE': {
      const project = state.project!;
      return { ...state, project: { ...project, scriptChanges: (project.scriptChanges ?? []).filter(c => c.id !== action.payload), updatedAt: now } };
    }
    case 'ADD_LOCKED_PAGE': {
      const project = state.project!;
      const filtered = (project.lockedPages ?? []).filter(p => p.pageNumber !== action.payload.pageNumber);
      return { ...state, project: { ...project, lockedPages: [...filtered, action.payload], updatedAt: now } };
    }
    case 'DELETE_LOCKED_PAGE': {
      const project = state.project!;
      return { ...state, project: { ...project, lockedPages: (project.lockedPages ?? []).filter(p => p.pageNumber !== action.payload), updatedAt: now } };
    }

    // ── Sets ──────────────────────────────────────────────────────────────
    case 'ADD_SET': {
      const project = state.project!;
      return { ...state, project: { ...project, sets: [...(project.sets ?? []), action.payload], updatedAt: now } };
    }
    case 'UPDATE_SET': {
      const project = state.project!;
      return { ...state, project: { ...project, sets: (project.sets ?? []).map(s => s.id === action.payload.id ? action.payload : s), updatedAt: now } };
    }
    case 'DELETE_SET': {
      const project = state.project!;
      return { ...state, project: { ...project, sets: (project.sets ?? []).filter(s => s.id !== action.payload), updatedAt: now } };
    }

    default:
      return state;
  }
}

interface SchedulingContextValue {
  state: SchedulingState;
  dispatch: React.Dispatch<SchedulingAction>;
}

const SchedulingContext = createContext<SchedulingContextValue | null>(null);

const STORAGE_KEY = 'moviemagic_scheduling';

export function SchedulingProvider({ children }: { children: React.ReactNode }) {
  const savedStr = localStorage.getItem(STORAGE_KEY);
  const initialProject = savedStr ? JSON.parse(savedStr) : sampleSchedulingProject;

  const [state, dispatch] = useReducer(schedulingReducer, {
    project: initialProject,
    selectedBreakdownId: null,
    activeView: 'stripboard' as ActiveView,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (state.project) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.project]);

  return (
    <SchedulingContext.Provider value={{ state, dispatch }}>
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const ctx = useContext(SchedulingContext);
  if (!ctx) throw new Error('useScheduling must be used within SchedulingProvider');
  return ctx;
}
