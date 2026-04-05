# Movie Magic Clone v2 — Feature Additions & Polish

Read SPEC.md for existing architecture context. This adds 4 new feature modules and fixes polish issues.

## Tech Notes
- Existing stack: React 18 + TypeScript + Vite + Tailwind v4 (@tailwindcss/vite) + React Router v6 + @dnd-kit + uuid
- State: React Context + useReducer per module
- **Persistence: Vercel Postgres** (replaces localStorage)
- Theme: Dark (bg-gray-900, accent amber-500/gold)
- DO NOT break any existing functionality. Add to it.

---

## PERSISTENCE LAYER: Vercel Postgres

Replace localStorage with Vercel Postgres for all data persistence.

### Setup
- `@vercel/postgres` SDK for serverless-friendly Postgres access
- Vercel project must have a Postgres database provisioned (Dashboard → Storage → Create Database)
- Connection via `POSTGRES_URL` env var (auto-set by Vercel when linked)
- For local dev: `.env.local` with connection string from Vercel dashboard

### Database Schema

```sql
-- Core tables for existing data
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduling module
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  scene_number TEXT NOT NULL,
  page_count NUMERIC,
  int_ext TEXT,
  set_name TEXT,
  time_of_day TEXT,
  script_day TEXT,
  description TEXT,
  notes TEXT,
  sort_order INTEGER,
  data JSONB DEFAULT '{}' -- flexible overflow for extra fields
);

CREATE TABLE elements (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSONB DEFAULT '{}'
);

CREATE TABLE scene_elements (
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  element_id UUID REFERENCES elements(id) ON DELETE CASCADE,
  PRIMARY KEY (scene_id, element_id)
);

CREATE TABLE shoot_days (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date TEXT,
  data JSONB DEFAULT '{}'
);

CREATE TABLE strip_board_entries (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  shoot_day_id UUID REFERENCES shoot_days(id) ON DELETE SET NULL,
  sort_order INTEGER,
  data JSONB DEFAULT '{}'
);

-- Budgeting module
CREATE TABLE budget_globals (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC,
  data JSONB DEFAULT '{}'
);

CREATE TABLE budget_accounts (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  account_number TEXT,
  name TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER,
  data JSONB DEFAULT '{}'
);

CREATE TABLE budget_line_items (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES budget_accounts(id) ON DELETE CASCADE,
  description TEXT,
  units NUMERIC,
  unit_type TEXT,
  rate NUMERIC,
  quantity NUMERIC,
  data JSONB DEFAULT '{}'
);

CREATE TABLE budget_fringes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate NUMERIC,
  data JSONB DEFAULT '{}'
);

CREATE TABLE budget_actuals (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  account_id UUID REFERENCES budget_accounts(id) ON DELETE SET NULL,
  description TEXT,
  amount NUMERIC,
  date TEXT,
  data JSONB DEFAULT '{}'
);

-- NEW v2 tables
CREATE TABLE extra_groups (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_rate NUMERIC,
  default_overtime_rate NUMERIC,
  notes TEXT
);

CREATE TABLE scene_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  group_id UUID REFERENCES extra_groups(id) ON DELETE CASCADE,
  headcount INTEGER,
  rate NUMERIC,
  call_time TEXT,
  wrap_time TEXT,
  wardrobe TEXT,
  meal_penalty BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE extras_vouchers (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  group_id UUID REFERENCES extra_groups(id) ON DELETE CASCADE,
  date TEXT,
  name TEXT,
  ssn_last4 TEXT,
  call_time TEXT,
  wrap_time TEXT,
  hours_worked NUMERIC,
  meal_penalty BOOLEAN DEFAULT FALSE,
  rate NUMERIC,
  total_pay NUMERIC,
  notes TEXT
);

CREATE TABLE costumes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  character_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  pieces JSONB DEFAULT '[]',
  condition TEXT,
  color TEXT,
  notes TEXT,
  continuity_notes TEXT
);

CREATE TABLE scene_costumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  character_id UUID,
  costume_id UUID REFERENCES costumes(id) ON DELETE CASCADE,
  change_number INTEGER DEFAULT 1,
  notes TEXT
);

CREATE TABLE script_revisions (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  revision_number INTEGER,
  color TEXT NOT NULL,
  date TEXT,
  author TEXT,
  description TEXT,
  pages_changed JSONB DEFAULT '[]',
  scenes_affected JSONB DEFAULT '[]',
  is_locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE script_changes (
  id UUID PRIMARY KEY,
  revision_id UUID REFERENCES script_revisions(id) ON DELETE CASCADE,
  scene_number TEXT,
  change_type TEXT,
  description TEXT,
  old_content TEXT,
  new_content TEXT,
  impacted_elements JSONB DEFAULT '[]',
  impacted_departments JSONB DEFAULT '[]'
);

CREATE TABLE locked_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  page_number TEXT,
  locked_at_revision INTEGER,
  cannot_change BOOLEAN DEFAULT FALSE
);

CREATE TABLE production_sets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  status TEXT DEFAULT 'Planned',
  build_date TEXT,
  ready_date TEXT,
  strike_date TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  sq_footage NUMERIC,
  linked_scenes JSONB DEFAULT '[]',
  linked_location_name TEXT,
  departments JSONB DEFAULT '{}',
  photos JSONB DEFAULT '[]',
  notes TEXT
);
```

### API Layer

Create `/api/` route handlers (Vite + Vercel serverless functions):

```
api/
  db.ts              — shared Postgres client (sql from @vercel/postgres)
  seed.ts            — POST: seed sample data
  projects/
    index.ts         — GET: list, POST: create
    [id].ts          — GET/PUT/DELETE single project
  scheduling/
    scenes.ts        — CRUD for scenes
    elements.ts      — CRUD for elements
    extras.ts        — CRUD for extra groups + scene extras + vouchers
    wardrobe.ts      — CRUD for costumes + scene costumes
    script.ts        — CRUD for revisions + changes + locked pages
    sets.ts          — CRUD for production sets
    strip-board.ts   — CRUD for strip board entries + shoot days
  budgeting/
    accounts.ts      — CRUD for accounts + line items
    globals.ts       — CRUD for globals
    fringes.ts       — CRUD for fringes
    actuals.ts       — CRUD for actuals
```

### Data Access Pattern

- Create a `lib/api.ts` client with typed fetch wrappers for each endpoint
- Stores call API on load (replace localStorage reads) and on mutations (replace localStorage writes)
- Optimistic updates: update local state immediately, then sync to DB. On error, rollback + show toast.
- Sample data: `api/seed.ts` inserts all sample data on first load (check if project exists first)
- Local dev: use `vercel env pull` to get `.env.local`, then `vercel dev` (or configure Vite proxy)

### Vercel Config

- `vercel.json` with rewrites for API routes if needed
- Database: provision via Vercel Dashboard → Storage → Postgres
- Run schema migration on first deploy via a seed/migrate endpoint or Vercel build hook

---

## NEW FEATURE 1: Extras Manager

Add under Scheduling module sidebar as "Extras" nav item.

### Data Model (add to types/scheduling.ts)

```typescript
interface ExtraGroup {
  id: string;
  name: string;              // "Restaurant Patrons", "Hospital Visitors", etc.
  category: 'SAG' | 'Non-Union' | 'Special Ability' | 'Stand-In' | 'Photo Double';
  defaultRate: number;       // daily rate
  defaultOvertimeRate: number;
  notes?: string;
}

interface SceneExtras {
  sceneId: string;           // breakdown sheet ID
  groups: {
    groupId: string;
    headcount: number;
    rate?: number;           // override per-scene if different from default
    callTime?: string;       // "6:00 AM"
    wrapTime?: string;       // "6:00 PM"
    wardrobe?: string;       // "Business casual", "Hospital gowns"
    notes?: string;
    mealPenalty?: boolean;
  }[];
}

interface ExtrasVoucher {
  id: string;
  date: string;
  sceneId: string;
  groupId: string;
  name: string;              // extra's name
  ssn_last4?: string;        // last 4 digits only
  callTime: string;
  wrapTime: string;
  hoursWorked: number;
  mealPenalty: boolean;
  rate: number;
  totalPay: number;
  notes?: string;
}
```

### UI: `components/scheduling/ExtrasManager.tsx`

- **Extras Groups panel** (left): List of all extra groups with category badges (SAG=red, Non-Union=blue, etc.), headcount totals, default rates
- **Scene Assignment panel** (right): Select a scene → assign extras groups with headcount, call/wrap times, wardrobe notes
- **Voucher tab**: Simple voucher log (add name, hours, calculate pay). Totals at bottom.
- **Summary stats**: Total extras across all scenes, total extras budget estimate, SAG vs Non-Union breakdown
- Add/edit/delete groups. Bulk assign a group to multiple scenes at once.

---

## NEW FEATURE 2: Wardrobe / Costumes

Add under Scheduling module sidebar as "Wardrobe" nav item.

### Data Model (add to types/scheduling.ts)

```typescript
interface CostumeItem {
  id: string;
  characterId: string;       // element ID (cast member)
  name: string;              // "Business Suit", "Hospital Gown", "Casual Day 1"
  description: string;       // detailed description
  pieces: string[];          // ["Navy blazer", "White shirt", "Gray slacks", "Brown oxfords"]
  condition: 'New' | 'Aged' | 'Distressed' | 'Bloody' | 'Wet' | 'Clean';
  color: string;             // primary color for visual reference
  notes?: string;
  continuityNotes?: string;  // "Sleeve rolled up left arm in Sc. 5"
}

interface SceneCostume {
  sceneId: string;
  characterId: string;
  costumeId: string;
  changeNumber: number;      // costume change # within the scene (1, 2, etc.)
  notes?: string;            // scene-specific notes
}
```

### UI: `components/scheduling/WardrobeManager.tsx`

- **Costume Plot** (main view): Grid/matrix — rows = characters, columns = scenes. Cells show costume name + change #. Color-coded by costume. Click cell to assign/change costume.
- **Costume Inventory** (tab): List all costume items grouped by character. Add/edit/delete. Shows which scenes each costume appears in.
- **Continuity View** (tab): Timeline view per character showing costume changes across scenes in shooting order (not script order). Highlights continuity issues (e.g., same costume worn in non-consecutive scenes that should match).
- Each costume item shows a colored swatch (user picks color) for quick visual reference on the plot.

---

## NEW FEATURE 3: Script Changes Tracking

Add under Scheduling module sidebar as "Script" nav item.

### Data Model (add to types/scheduling.ts)

```typescript
type RevisionColor = 'White' | 'Blue' | 'Pink' | 'Yellow' | 'Green' | 'Goldenrod' | 'Buff' | 'Salmon' | 'Cherry' | '2nd Blue' | '2nd Pink' | '2nd Yellow' | '2nd Green';

interface ScriptRevision {
  id: string;
  revisionNumber: number;    // 1, 2, 3...
  color: RevisionColor;      // follows industry standard order
  date: string;              // revision date
  author: string;            // who made the changes
  description: string;       // "Act 2 restructure", "Added flashback sequence"
  pagesChanged: string[];    // ["12", "13", "14-16", "22A"]
  scenesAffected: string[];  // scene numbers that changed
  isLocked: boolean;         // once locked, becomes baseline for next revision
}

interface LockedPage {
  pageNumber: string;
  lockedAtRevision: number;
  cannotChange: boolean;     // true once production has filmed
}

interface ScriptChange {
  id: string;
  revisionId: string;
  sceneNumber: string;
  changeType: 'Added' | 'Deleted' | 'Modified' | 'Moved';
  description: string;       // what changed
  oldContent?: string;       // brief summary of what was there before
  newContent?: string;       // brief summary of what replaced it
  impactedElements: string[]; // element IDs affected (new cast, dropped props, etc.)
  impactedDepartments: string[]; // "Camera", "Art", "Wardrobe", etc.
}
```

### UI: `components/scheduling/ScriptManager.tsx`

- **Revision History** (main): Timeline of revisions with color bars (actual CSS colors matching industry standard page colors — White=#fff, Blue=#add8e6, Pink=#ffb6c1, Yellow=#ffffe0, Green=#90ee90, Goldenrod=#daa520, Buff=#f0dc82, Salmon=#fa8072, Cherry=#de3163)
- Each revision card shows: revision #, color, date, author, description, pages changed count, scenes affected count
- **Lock Revision** button: locks current revision as baseline
- **Add Revision** button: auto-increments color in standard order
- **Change Log** (tab): Detailed list of all changes across all revisions. Filterable by scene, revision, change type, department
- **Pages Affected** (tab): Visual page map — grid of page numbers, color-coded by latest revision that touched them. Locked pages shown with a lock icon.
- **Impact Analysis**: When adding a change, show which departments are impacted (auto-detect from elements: if cast changes → Wardrobe, Makeup, AD; if location changes → Locations, Transportation, Art)
- **Current Revision banner** at top: Shows active revision color + number. "Working Draft: Revision 3 (Pink) — March 15, 2026"

### Color Reference (CSS hex values for revision bars):
```
White: #FFFFFF, Blue: #ADD8E6, Pink: #FFB6C1, Yellow: #FFFFE0
Green: #90EE90, Goldenrod: #DAA520, Buff: #F0DC82, Salmon: #FA8072
Cherry: #DE3163, 2nd Blue: #87CEEB, 2nd Pink: #FF69B4
2nd Yellow: #FFD700, 2nd Green: #32CD32
```

---

## NEW FEATURE 4: Sets Manager

Add under Scheduling module sidebar as "Sets" nav item.

### Data Model (add to types/scheduling.ts)

```typescript
type SetStatus = 'Planned' | 'In Construction' | 'Ready' | 'In Use' | 'Strike Scheduled' | 'Struck' | 'Permanent';

interface ProductionSet {
  id: string;
  name: string;              // "ICU Room 412", "Downtown Street"
  type: 'Studio Build' | 'Practical Location' | 'Hybrid' | 'Virtual/LED' | 'Green Screen';
  location: string;          // stage number or address
  status: SetStatus;
  buildDate?: string;        // when construction starts
  readyDate?: string;        // when available for shooting
  strikeDate?: string;       // when torn down
  estimatedCost: number;     // build cost
  actualCost?: number;       // tracked cost
  sqFootage?: number;
  linkedScenes: string[];    // scene numbers that use this set
  linkedLocationName: string; // maps to breakdown sheet location field
  departments: {             // department-specific notes
    art?: string;
    construction?: string;
    paint?: string;
    greens?: string;
    electric?: string;
    grip?: string;
    props?: string;
    setDressing?: string;
  };
  photos: string[];          // placeholder URLs/paths
  notes?: string;
}
```

### UI: `components/scheduling/SetsManager.tsx`

- **Sets Overview** (main): Card grid of all sets. Each card shows: name, type badge, status badge (color: Planned=gray, In Construction=yellow, Ready=green, In Use=blue, Strike Scheduled=orange, Struck=red), location, scene count, cost
- **Set Detail** (click card → slide panel): Full editor with all fields. Linked scenes list (clickable). Department notes accordion. Build/Ready/Strike date timeline.
- **Timeline View** (tab): Gantt-style horizontal timeline. Rows = sets. Bars show build → ready → shoot days → strike. Color-coded by status. Shows overlaps.
- **Budget Summary** (tab): Table of all sets with estimated vs actual costs. Total. Variance. Links to budgeting module's Art Department account.
- Auto-link: When a set's `linkedLocationName` matches a breakdown sheet's `setName` or `location`, auto-populate `linkedScenes`.

---

## POLISH FIXES

### Fix 1: Top Sheet → Account Drill-Down
Currently clicking an account in Top Sheet dispatches SET_SELECTED_ACCOUNT and navigates to /budgeting/accounts, but the account detail doesn't auto-open. Fix: The AccountList component should read the selectedAccountId from context on mount and auto-scroll to + expand that account's line items inline.

### Fix 2: Scheduling Reports
`components/scheduling/Reports.tsx` is an empty export. Build it out:
- **Schedule Summary**: Total scenes, total pages, shoot days, pages/day avg
- **Day-by-Day Report**: For each shoot day — scenes, locations, cast required, page count, estimated hours
- **Cast List Report**: All cast with their scene appearances, total work days
- **Location Report**: All locations with scenes shot there, total days at each location
- **Element Report**: All elements grouped by category with scene assignments
- Add a "Reports" link to the Scheduling sidebar nav
- Print button for each report

### Fix 3: Account Detail Inline Expand
On the Accounts page, clicking an account row should expand it inline to show line items (description, units, unit type, rate, qty, subtotal, fringes, total). Clicking again collapses it. Add/edit/delete line items inline.

---

## SIDEBAR NAVIGATION UPDATE

The sidebar needs to accommodate the new views. Update Sidebar.tsx:

**SCHEDULING:**
- Strip Board
- Breakdowns
- Elements
- Extras ← NEW
- Wardrobe ← NEW
- Sets ← NEW
- Script ← NEW
- Day Out of Days
- Calendar
- Reports ← ADD LINK

**BUDGETING:** (unchanged)
- Top Sheet
- Accounts
- Globals
- Fringes
- Actuals
- Reports

---

## ROUTING UPDATE

Add these routes to App.tsx:
- `/scheduling/extras` → ExtrasManager
- `/scheduling/wardrobe` → WardrobeManager
- `/scheduling/script` → ScriptManager
- `/scheduling/sets` → SetsManager

---

## STORES UPDATE

### schedulingStore.tsx additions:
- Add state fields: `extraGroups`, `sceneExtras`, `extrasVouchers`, `costumes`, `sceneCostumes`, `revisions`, `scriptChanges`, `lockedPages`, `sets`
- Add corresponding actions: ADD/UPDATE/DELETE for each entity type + LOAD actions for hydrating from API
- Add selectors: `getExtrasForScene`, `getCostumesForCharacter`, `getCurrentRevision`, `getScenesForSet`
- **Replace all localStorage persistence with API calls** via `lib/api.ts`
- On mount: fetch all data from API endpoints → dispatch LOAD actions
- On mutations: optimistic local update → API call → rollback on error

### Sample Data additions (sampleData.ts):
- Add 3-4 extras groups (Restaurant Patrons, Hospital Visitors, Street Pedestrians, Police Officers)
- Add 8-10 costumes across main characters
- Add 2 script revisions (White original + Blue first revision)
- Add 5-6 sets (ICU Room, Hospital Corridor, Downtown Street, Fletcher Living Room, Park, Highway)

---

## IMPLEMENTATION ORDER

1. **Vercel Postgres setup** — install `@vercel/postgres`, create schema migration, API route handlers, `lib/api.ts` client
2. **Migrate existing persistence** — replace all localStorage reads/writes with API calls in both stores
3. Types first (add all new interfaces to scheduling.ts)
4. Store updates (new state, actions, reducers, LOAD actions, API integration)
5. Sidebar + routing updates
6. Polish fixes (Reports, AccountDetail, TopSheet drill-down)
7. Sets Manager (simplest new feature)
8. Extras Manager
9. Wardrobe Manager
10. Script Changes (most complex)
11. Seed endpoint with sample data for all tables

**Do NOT create placeholder/stub components.** Each component must be fully functional with real UI, real data binding, and real interactivity.

**Commit when done with a descriptive message.**

---

## DOCUMENTATION (after everything is complete)

After all features, tests, and deployment are done, create comprehensive documentation:

### README.md (project root)
- Project overview and screenshots
- Features list (Scheduling + Budgeting + all v2 features)
- Tech stack
- Getting started (local dev)
- Running tests (Jest + Playwright)
- Deployment (Vercel)
- Architecture overview (file structure, state management, data flow)
- Shareable link

### docs/ directory
- `docs/ARCHITECTURE.md` — detailed component tree, state management patterns, data model relationships
- `docs/FEATURES.md` — every feature with description and usage
- `docs/TESTING.md` — test coverage map, how to add tests, CI setup
