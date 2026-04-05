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
}

export type StripBoardItem =
  | { type: 'scene'; id: string; breakdownId: string }
  | { type: 'dayBreak'; id: string; dayNumber: number; label?: string }
  | { type: 'banner'; id: string; text: string; color: string };

export interface SchedulingProject {
  id: string;
  name: string;
  elements: Element[];
  breakdowns: BreakdownSheet[];
  stripBoard: StripBoardItem[];
  shootStartDate?: string;
  createdAt: string;
  updatedAt: string;
}
