import { schedulingReducer } from '../stores/schedulingStore';
import type { SchedulingState } from '../stores/schedulingStore';
import type {
  SchedulingProject, BreakdownSheet, Element, StripBoardItem,
  ExtraGroup, SceneExtras, ExtrasVoucher, CostumeItem,
  ScriptRevision, ScriptChange, ProductionSet,
} from '../types/scheduling';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = '2024-01-01T00:00:00.000Z';

const minimalProject: SchedulingProject = {
  id: 'proj-1',
  name: 'Test Project',
  elements: [],
  breakdowns: [],
  stripBoard: [],
  extraGroups: [],
  sceneExtras: [],
  extrasVouchers: [],
  costumes: [],
  sceneCostumes: [],
  revisions: [],
  scriptChanges: [],
  lockedPages: [],
  sets: [],
  createdAt: NOW,
  updatedAt: NOW,
};

const baseState: SchedulingState = {
  project: { ...minimalProject },
  selectedBreakdownId: null,
  activeView: 'stripboard',
};

const noProjectState: SchedulingState = {
  project: null,
  selectedBreakdownId: null,
  activeView: 'stripboard',
};

function makeBreakdown(overrides: Partial<BreakdownSheet> = {}): BreakdownSheet {
  return {
    id: 'bd-1',
    sceneNumber: '1',
    intExt: 'INT',
    dayNight: 'DAY',
    location: 'Studio',
    setName: 'Room A',
    description: 'Test scene',
    scriptPage: 1,
    pageCount: '1/8',
    elements: [],
    notes: '',
    ...overrides,
  };
}

function makeElement(overrides: Partial<Element> = {}): Element {
  return {
    id: 'elem-1',
    category: 'Cast',
    name: 'Actor A',
    ...overrides,
  };
}

// ── Guard: no project ─────────────────────────────────────────────────────────

describe('schedulingReducer guard', () => {
  it('returns unchanged state when project is null and action is not SET_PROJECT/LOAD_SAMPLE', () => {
    const result = schedulingReducer(noProjectState, { type: 'SET_ACTIVE_VIEW', payload: 'breakdowns' });
    expect(result).toBe(noProjectState);
  });
});

// ── SET_PROJECT ───────────────────────────────────────────────────────────────

describe('SET_PROJECT', () => {
  it('sets the project in state', () => {
    const state = schedulingReducer(noProjectState, { type: 'SET_PROJECT', payload: minimalProject });
    expect(state.project).toEqual(minimalProject);
  });
});

// ── LOAD_SAMPLE ───────────────────────────────────────────────────────────────

describe('LOAD_SAMPLE', () => {
  it('loads sample project with breakdowns and elements', () => {
    const state = schedulingReducer(noProjectState, { type: 'LOAD_SAMPLE' });
    expect(state.project).not.toBeNull();
    expect(state.project!.breakdowns.length).toBeGreaterThan(0);
    expect(state.project!.elements.length).toBeGreaterThan(0);
  });

  it('generates a new id for the loaded project', () => {
    const s1 = schedulingReducer(noProjectState, { type: 'LOAD_SAMPLE' });
    const s2 = schedulingReducer(noProjectState, { type: 'LOAD_SAMPLE' });
    expect(s1.project!.id).not.toBe(s2.project!.id);
  });
});

// ── UPDATE_BREAKDOWN ──────────────────────────────────────────────────────────

describe('UPDATE_BREAKDOWN', () => {
  it('updates the matching breakdown', () => {
    const bd = makeBreakdown({ id: 'bd-1', sceneNumber: '1' });
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, breakdowns: [bd] },
    };
    const updated = { ...bd, sceneNumber: '1A', description: 'Updated' };
    const result = schedulingReducer(state, { type: 'UPDATE_BREAKDOWN', payload: updated });
    expect(result.project!.breakdowns[0].sceneNumber).toBe('1A');
    expect(result.project!.breakdowns[0].description).toBe('Updated');
  });

  it('does not modify other breakdowns', () => {
    const bd1 = makeBreakdown({ id: 'bd-1', sceneNumber: '1' });
    const bd2 = makeBreakdown({ id: 'bd-2', sceneNumber: '2' });
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, breakdowns: [bd1, bd2] },
    };
    const result = schedulingReducer(state, { type: 'UPDATE_BREAKDOWN', payload: { ...bd1, sceneNumber: 'X' } });
    expect(result.project!.breakdowns[1].sceneNumber).toBe('2');
  });
});

// ── ADD_BREAKDOWN ─────────────────────────────────────────────────────────────

describe('ADD_BREAKDOWN', () => {
  it('adds the breakdown to the breakdowns array', () => {
    const bd = makeBreakdown({ id: 'bd-new' });
    const result = schedulingReducer(baseState, { type: 'ADD_BREAKDOWN', payload: bd });
    expect(result.project!.breakdowns).toHaveLength(1);
    expect(result.project!.breakdowns[0].id).toBe('bd-new');
  });

  it('adds a scene strip board item for the new breakdown', () => {
    const bd = makeBreakdown({ id: 'bd-new' });
    const result = schedulingReducer(baseState, { type: 'ADD_BREAKDOWN', payload: bd });
    const sceneItems = result.project!.stripBoard.filter(
      (item): item is Extract<StripBoardItem, { type: 'scene' }> => item.type === 'scene'
    );
    expect(sceneItems[0].breakdownId).toBe('bd-new');
  });
});

// ── DELETE_BREAKDOWN ──────────────────────────────────────────────────────────

describe('DELETE_BREAKDOWN', () => {
  it('removes the breakdown from the array', () => {
    const bd1 = makeBreakdown({ id: 'bd-1' });
    const bd2 = makeBreakdown({ id: 'bd-2' });
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, breakdowns: [bd1, bd2] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_BREAKDOWN', payload: 'bd-1' });
    expect(result.project!.breakdowns).toHaveLength(1);
    expect(result.project!.breakdowns[0].id).toBe('bd-2');
  });

  it('also removes the corresponding strip board item', () => {
    const bd = makeBreakdown({ id: 'bd-1' });
    const stripItem: StripBoardItem = { type: 'scene', id: 'si-1', breakdownId: 'bd-1' };
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, breakdowns: [bd], stripBoard: [stripItem] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_BREAKDOWN', payload: 'bd-1' });
    expect(result.project!.stripBoard).toHaveLength(0);
  });

  it('clears selectedBreakdownId if it matches the deleted breakdown', () => {
    const bd = makeBreakdown({ id: 'bd-1' });
    const state: SchedulingState = {
      ...baseState,
      selectedBreakdownId: 'bd-1',
      project: { ...minimalProject, breakdowns: [bd] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_BREAKDOWN', payload: 'bd-1' });
    expect(result.selectedBreakdownId).toBeNull();
  });
});

// ── REORDER_STRIP_BOARD ───────────────────────────────────────────────────────

describe('REORDER_STRIP_BOARD', () => {
  it('replaces the strip board with the new order', () => {
    const item1: StripBoardItem = { type: 'scene', id: 'si-1', breakdownId: 'bd-1' };
    const item2: StripBoardItem = { type: 'scene', id: 'si-2', breakdownId: 'bd-2' };
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, stripBoard: [item1, item2] },
    };
    const result = schedulingReducer(state, { type: 'REORDER_STRIP_BOARD', payload: [item2, item1] });
    expect(result.project!.stripBoard[0].id).toBe('si-2');
    expect(result.project!.stripBoard[1].id).toBe('si-1');
  });
});

// ── ADD_DAY_BREAK ─────────────────────────────────────────────────────────────

describe('ADD_DAY_BREAK', () => {
  it('inserts a day break after the specified index', () => {
    const item: StripBoardItem = { type: 'scene', id: 'si-1', breakdownId: 'bd-1' };
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, stripBoard: [item] },
    };
    const result = schedulingReducer(state, {
      type: 'ADD_DAY_BREAK',
      payload: { afterIndex: 0, dayNumber: 1, label: 'Day 1' },
    });
    expect(result.project!.stripBoard).toHaveLength(2);
    const dayBreak = result.project!.stripBoard[1];
    expect(dayBreak.type).toBe('dayBreak');
    if (dayBreak.type === 'dayBreak') {
      expect(dayBreak.dayNumber).toBe(1);
    }
  });
});

// ── ADD_BANNER ────────────────────────────────────────────────────────────────

describe('ADD_BANNER', () => {
  it('inserts a banner at the correct position', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, stripBoard: [] },
    };
    const result = schedulingReducer(state, {
      type: 'ADD_BANNER',
      payload: { afterIndex: -1, text: 'WEEK 1', color: 'amber' },
    });
    expect(result.project!.stripBoard).toHaveLength(1);
    const banner = result.project!.stripBoard[0];
    expect(banner.type).toBe('banner');
    if (banner.type === 'banner') {
      expect(banner.text).toBe('WEEK 1');
    }
  });
});

// ── DELETE_STRIP_ITEM ─────────────────────────────────────────────────────────

describe('DELETE_STRIP_ITEM', () => {
  it('removes a day break by id', () => {
    const item: StripBoardItem = { type: 'dayBreak', id: 'db-1', dayNumber: 1 };
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, stripBoard: [item] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_STRIP_ITEM', payload: 'db-1' });
    expect(result.project!.stripBoard).toHaveLength(0);
  });

  it('does not remove scene items', () => {
    const item: StripBoardItem = { type: 'scene', id: 'si-1', breakdownId: 'bd-1' };
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, stripBoard: [item] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_STRIP_ITEM', payload: 'si-1' });
    expect(result.project!.stripBoard).toHaveLength(1);
  });
});

// ── ADD_ELEMENT ───────────────────────────────────────────────────────────────

describe('ADD_ELEMENT', () => {
  it('adds element to the project elements array', () => {
    const elem = makeElement({ id: 'e-1', name: 'Hero' });
    const result = schedulingReducer(baseState, { type: 'ADD_ELEMENT', payload: elem });
    expect(result.project!.elements).toHaveLength(1);
    expect(result.project!.elements[0].name).toBe('Hero');
  });
});

// ── UPDATE_ELEMENT ────────────────────────────────────────────────────────────

describe('UPDATE_ELEMENT', () => {
  it('updates the matching element', () => {
    const elem = makeElement({ id: 'e-1', name: 'Old Name' });
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, elements: [elem] },
    };
    const result = schedulingReducer(state, {
      type: 'UPDATE_ELEMENT',
      payload: { ...elem, name: 'New Name' },
    });
    expect(result.project!.elements[0].name).toBe('New Name');
  });
});

// ── DELETE_ELEMENT ────────────────────────────────────────────────────────────

describe('DELETE_ELEMENT', () => {
  it('removes element from elements array', () => {
    const elem = makeElement({ id: 'e-1' });
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, elements: [elem] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_ELEMENT', payload: 'e-1' });
    expect(result.project!.elements).toHaveLength(0);
  });

  it('removes element id from all breakdowns', () => {
    const elem = makeElement({ id: 'e-1' });
    const bd = makeBreakdown({ id: 'bd-1', elements: ['e-1', 'e-2'] });
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, elements: [elem], breakdowns: [bd] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_ELEMENT', payload: 'e-1' });
    expect(result.project!.breakdowns[0].elements).toEqual(['e-2']);
  });
});

// ── SET_SELECTED_BREAKDOWN ────────────────────────────────────────────────────

describe('SET_SELECTED_BREAKDOWN', () => {
  it('sets the selected breakdown id', () => {
    const result = schedulingReducer(baseState, { type: 'SET_SELECTED_BREAKDOWN', payload: 'bd-5' });
    expect(result.selectedBreakdownId).toBe('bd-5');
  });

  it('can set to null', () => {
    const state: SchedulingState = { ...baseState, selectedBreakdownId: 'bd-1' };
    const result = schedulingReducer(state, { type: 'SET_SELECTED_BREAKDOWN', payload: null });
    expect(result.selectedBreakdownId).toBeNull();
  });
});

// ── SET_ACTIVE_VIEW ───────────────────────────────────────────────────────────

describe('SET_ACTIVE_VIEW', () => {
  it('changes the active view', () => {
    const result = schedulingReducer(baseState, { type: 'SET_ACTIVE_VIEW', payload: 'breakdowns' });
    expect(result.activeView).toBe('breakdowns');
  });
});

// ── Extras CRUD ───────────────────────────────────────────────────────────────

describe('Extras actions', () => {
  const group: ExtraGroup = {
    id: 'eg-1', name: 'SAG', category: 'SAG',
    defaultRate: 180, defaultOvertimeRate: 270,
  };

  it('ADD_EXTRA_GROUP adds group', () => {
    const result = schedulingReducer(baseState, { type: 'ADD_EXTRA_GROUP', payload: group });
    expect(result.project!.extraGroups).toHaveLength(1);
  });

  it('UPDATE_EXTRA_GROUP updates group', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, extraGroups: [group] },
    };
    const result = schedulingReducer(state, {
      type: 'UPDATE_EXTRA_GROUP',
      payload: { ...group, name: 'SAG-AFTRA' },
    });
    expect(result.project!.extraGroups![0].name).toBe('SAG-AFTRA');
  });

  it('DELETE_EXTRA_GROUP removes group', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, extraGroups: [group] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_EXTRA_GROUP', payload: 'eg-1' });
    expect(result.project!.extraGroups).toHaveLength(0);
  });

  it('UPDATE_SCENE_EXTRAS upserts scene extras', () => {
    const se: SceneExtras = { sceneId: 's-1', groups: [] };
    const result = schedulingReducer(baseState, { type: 'UPDATE_SCENE_EXTRAS', payload: se });
    expect(result.project!.sceneExtras).toHaveLength(1);
    // Update again replaces
    const se2: SceneExtras = { sceneId: 's-1', groups: [{ groupId: 'g1', headcount: 5 }] };
    const result2 = schedulingReducer(result, { type: 'UPDATE_SCENE_EXTRAS', payload: se2 });
    expect(result2.project!.sceneExtras).toHaveLength(1);
    expect(result2.project!.sceneExtras![0].groups[0].headcount).toBe(5);
  });

  it('ADD/UPDATE/DELETE EXTRAS_VOUCHER works', () => {
    const voucher: ExtrasVoucher = {
      id: 'v-1', date: '2024-01-01', sceneId: 's-1', groupId: 'eg-1',
      name: 'John Doe', callTime: '07:00', wrapTime: '19:00',
      hoursWorked: 12, mealPenalty: false, rate: 180, totalPay: 2160,
    };
    let state = schedulingReducer(baseState, { type: 'ADD_EXTRAS_VOUCHER', payload: voucher });
    expect(state.project!.extrasVouchers).toHaveLength(1);

    state = schedulingReducer(state, {
      type: 'UPDATE_EXTRAS_VOUCHER',
      payload: { ...voucher, totalPay: 3000 },
    });
    expect(state.project!.extrasVouchers![0].totalPay).toBe(3000);

    state = schedulingReducer(state, { type: 'DELETE_EXTRAS_VOUCHER', payload: 'v-1' });
    expect(state.project!.extrasVouchers).toHaveLength(0);
  });
});

// ── Costumes CRUD ─────────────────────────────────────────────────────────────

describe('Costume actions', () => {
  const costume: CostumeItem = {
    id: 'c-1', characterId: 'char-1', name: 'Hero Outfit',
    description: 'Blue suit', pieces: ['jacket', 'pants'],
    condition: 'New', color: 'blue',
  };

  it('ADD_COSTUME adds costume', () => {
    const result = schedulingReducer(baseState, { type: 'ADD_COSTUME', payload: costume });
    expect(result.project!.costumes).toHaveLength(1);
  });

  it('UPDATE_COSTUME updates costume', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, costumes: [costume] },
    };
    const result = schedulingReducer(state, {
      type: 'UPDATE_COSTUME',
      payload: { ...costume, condition: 'Aged' },
    });
    expect(result.project!.costumes![0].condition).toBe('Aged');
  });

  it('DELETE_COSTUME removes costume', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, costumes: [costume] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_COSTUME', payload: 'c-1' });
    expect(result.project!.costumes).toHaveLength(0);
  });
});

// ── Script CRUD ───────────────────────────────────────────────────────────────

describe('Script actions', () => {
  const revision: ScriptRevision = {
    id: 'rev-1', revisionNumber: 1, color: 'Blue', date: '2024-01-01',
    author: 'Writer', description: 'First draft',
    pagesChanged: ['1-5'], scenesAffected: ['1'], isLocked: false,
  };
  const change: ScriptChange = {
    id: 'sc-1', revisionId: 'rev-1', sceneNumber: '1',
    changeType: 'Modified', description: 'Scene updated',
    impactedElements: [], impactedDepartments: [],
  };

  it('ADD_REVISION adds revision', () => {
    const result = schedulingReducer(baseState, { type: 'ADD_REVISION', payload: revision });
    expect(result.project!.revisions).toHaveLength(1);
  });

  it('UPDATE_REVISION updates revision', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, revisions: [revision] },
    };
    const result = schedulingReducer(state, {
      type: 'UPDATE_REVISION',
      payload: { ...revision, isLocked: true },
    });
    expect(result.project!.revisions![0].isLocked).toBe(true);
  });

  it('DELETE_REVISION removes revision', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, revisions: [revision] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_REVISION', payload: 'rev-1' });
    expect(result.project!.revisions).toHaveLength(0);
  });

  it('ADD/UPDATE/DELETE SCRIPT_CHANGE works', () => {
    let state = schedulingReducer(baseState, { type: 'ADD_SCRIPT_CHANGE', payload: change });
    expect(state.project!.scriptChanges).toHaveLength(1);

    state = schedulingReducer(state, {
      type: 'UPDATE_SCRIPT_CHANGE',
      payload: { ...change, description: 'Updated desc' },
    });
    expect(state.project!.scriptChanges![0].description).toBe('Updated desc');

    state = schedulingReducer(state, { type: 'DELETE_SCRIPT_CHANGE', payload: 'sc-1' });
    expect(state.project!.scriptChanges).toHaveLength(0);
  });

  it('ADD_LOCKED_PAGE adds a locked page (upsert by pageNumber)', () => {
    let state = schedulingReducer(baseState, {
      type: 'ADD_LOCKED_PAGE',
      payload: { pageNumber: '5', lockedAtRevision: 1, cannotChange: false },
    });
    expect(state.project!.lockedPages).toHaveLength(1);
    // Upsert: adding same page replaces it
    state = schedulingReducer(state, {
      type: 'ADD_LOCKED_PAGE',
      payload: { pageNumber: '5', lockedAtRevision: 2, cannotChange: true },
    });
    expect(state.project!.lockedPages).toHaveLength(1);
    expect(state.project!.lockedPages![0].lockedAtRevision).toBe(2);
  });

  it('DELETE_LOCKED_PAGE removes locked page', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, lockedPages: [{ pageNumber: '5', lockedAtRevision: 1, cannotChange: false }] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_LOCKED_PAGE', payload: '5' });
    expect(result.project!.lockedPages).toHaveLength(0);
  });
});

// ── Sets CRUD ─────────────────────────────────────────────────────────────────

describe('Sets actions', () => {
  const set: ProductionSet = {
    id: 'set-1', name: 'Hospital Room', type: 'Studio Build',
    location: 'Stage 4', status: 'Planned', estimatedCost: 50000,
    linkedScenes: ['1', '2'], linkedLocationName: 'Mercy General',
    departments: {}, photos: [],
  };

  it('ADD_SET adds set', () => {
    const result = schedulingReducer(baseState, { type: 'ADD_SET', payload: set });
    expect(result.project!.sets).toHaveLength(1);
  });

  it('UPDATE_SET updates set', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, sets: [set] },
    };
    const result = schedulingReducer(state, {
      type: 'UPDATE_SET',
      payload: { ...set, status: 'Ready' },
    });
    expect(result.project!.sets![0].status).toBe('Ready');
  });

  it('DELETE_SET removes set', () => {
    const state: SchedulingState = {
      ...baseState,
      project: { ...minimalProject, sets: [set] },
    };
    const result = schedulingReducer(state, { type: 'DELETE_SET', payload: 'set-1' });
    expect(result.project!.sets).toHaveLength(0);
  });
});
