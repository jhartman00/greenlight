export type ElementCategory =
  | 'Cast' | 'Extras' | 'Stunts' | 'Vehicles' | 'Props'
  | 'Wardrobe' | 'Makeup/Hair' | 'Livestock/Animals'
  | 'Sound Effects/Music' | 'Special Effects' | 'Special Equipment'
  | 'Art Department' | 'Set Dressing' | 'Greenery'
  | 'Visual Effects' | 'Mechanical Effects' | 'Miscellaneous'
  | 'Notes' | 'Security';

export interface Element {
  id: string;
  category: ElementCategory;
  name: string;
  notes?: string;
}

export interface BreakdownSheet {
  id: string;
  sceneNumber: string;
  intExt: 'INT' | 'EXT' | 'INT/EXT';
  dayNight: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  location: string;
  setName: string;
  description: string;
  scriptPage: number;
  pageCount: string;
  elements: string[];
  notes: string;
  estimatedTime?: string;
  scriptContent?: string;
}

export type StripBoardItem =
  | { type: 'scene'; id: string; breakdownId: string }
  | { type: 'dayBreak'; id: string; dayNumber: number; label?: string }
  | { type: 'banner'; id: string; text: string; color: string };

// ── Extras Manager ──────────────────────────────────────────────────────────

export interface ExtraGroup {
  id: string;
  name: string;
  category: 'SAG' | 'Non-Union' | 'Special Ability' | 'Stand-In' | 'Photo Double';
  defaultRate: number;
  defaultOvertimeRate: number;
  notes?: string;
}

export interface SceneExtras {
  sceneId: string;
  groups: {
    groupId: string;
    headcount: number;
    rate?: number;
    callTime?: string;
    wrapTime?: string;
    wardrobe?: string;
    notes?: string;
    mealPenalty?: boolean;
  }[];
}

export interface ExtrasVoucher {
  id: string;
  date: string;
  sceneId: string;
  groupId: string;
  name: string;
  ssn_last4?: string;
  callTime: string;
  wrapTime: string;
  hoursWorked: number;
  mealPenalty: boolean;
  rate: number;
  totalPay: number;
  notes?: string;
}

// ── Wardrobe / Costumes ─────────────────────────────────────────────────────

export interface CostumeItem {
  id: string;
  characterId: string;
  name: string;
  description: string;
  pieces: string[];
  condition: 'New' | 'Aged' | 'Distressed' | 'Bloody' | 'Wet' | 'Clean';
  color: string;
  notes?: string;
  continuityNotes?: string;
}

export interface SceneCostume {
  sceneId: string;
  characterId: string;
  costumeId: string;
  changeNumber: number;
  notes?: string;
}

// ── Script Changes ──────────────────────────────────────────────────────────

export type RevisionColor =
  | 'White' | 'Blue' | 'Pink' | 'Yellow' | 'Green'
  | 'Goldenrod' | 'Buff' | 'Salmon' | 'Cherry'
  | '2nd Blue' | '2nd Pink' | '2nd Yellow' | '2nd Green';

export interface ScriptRevision {
  id: string;
  revisionNumber: number;
  color: RevisionColor;
  date: string;
  author: string;
  description: string;
  pagesChanged: string[];
  scenesAffected: string[];
  isLocked: boolean;
}

export interface LockedPage {
  pageNumber: string;
  lockedAtRevision: number;
  cannotChange: boolean;
}

export interface ScriptChange {
  id: string;
  revisionId: string;
  sceneNumber: string;
  changeType: 'Added' | 'Deleted' | 'Modified' | 'Moved';
  description: string;
  oldContent?: string;
  newContent?: string;
  impactedElements: string[];
  impactedDepartments: string[];
}

// ── Sets Manager ────────────────────────────────────────────────────────────

export type SetStatus =
  | 'Planned' | 'In Construction' | 'Ready' | 'In Use'
  | 'Strike Scheduled' | 'Struck' | 'Permanent';

export interface ProductionSet {
  id: string;
  name: string;
  type: 'Studio Build' | 'Practical Location' | 'Hybrid' | 'Virtual/LED' | 'Green Screen';
  location: string;
  status: SetStatus;
  buildDate?: string;
  readyDate?: string;
  strikeDate?: string;
  estimatedCost: number;
  actualCost?: number;
  sqFootage?: number;
  linkedScenes: string[];
  linkedLocationName: string;
  departments: {
    art?: string;
    construction?: string;
    paint?: string;
    greens?: string;
    electric?: string;
    grip?: string;
    props?: string;
    setDressing?: string;
  };
  photos: string[];
  notes?: string;
}

// ── Cast Manager ─────────────────────────────────────────────────────────────

export interface CastMember {
  id: string;
  elementId: string;
  role: string;
  actor?: string;
  status: 'Uncast' | 'Shortlisted' | 'Offered' | 'Confirmed' | 'Wrapped';
  category: 'Lead' | 'Supporting' | 'Day Player' | 'Cameo' | 'Stunt Double' | 'Stand-In';
  union: 'SAG-AFTRA' | 'Non-Union' | 'Taft-Hartley' | 'Fi-Core';
  dailyRate?: number;
  weeklyRate?: number;
  guaranteedDays?: number;
  startDate?: string;
  endDate?: string;
  agent?: string;
  agentPhone?: string;
  agentEmail?: string;
  notes?: string;
  fittingDates?: string[];
  rehearsalDates?: string[];
}

// ── Project ─────────────────────────────────────────────────────────────────

export interface SchedulingProject {
  id: string;
  name: string;
  elements: Element[];
  breakdowns: BreakdownSheet[];
  stripBoard: StripBoardItem[];
  shootStartDate?: string;
  extraGroups?: ExtraGroup[];
  sceneExtras?: SceneExtras[];
  extrasVouchers?: ExtrasVoucher[];
  costumes?: CostumeItem[];
  sceneCostumes?: SceneCostume[];
  revisions?: ScriptRevision[];
  scriptChanges?: ScriptChange[];
  lockedPages?: LockedPage[];
  sets?: ProductionSet[];
  castMembers?: CastMember[];
  createdAt: string;
  updatedAt: string;
}
