# Task: Add Cast Manager Feature

## Context
Greenlight is a film production scheduling & budgeting app at `/Users/nova/projects/greenlight`. 
Stack: React 19 + TypeScript + Vite + Tailwind v4 + React Router v7. Dark theme (bg-gray-900, amber-500 accents).
Data persists as JSONB in Neon Postgres via Vercel serverless functions.
All routes are scoped: `/project/:projectId/scheduling/*` and `/project/:projectId/budgeting/*`.

## What to Build

### Cast Manager — `components/scheduling/CastManager.tsx`

A dedicated page for managing cast members beyond the basic Elements list. Add under Scheduling sidebar as "Cast" nav item (between "Elements" and "Extras").

### Data Model — add to `types/scheduling.ts`

```typescript
interface CastMember {
  id: string;                    // matches element ID (e.g. 'el-vin')
  elementId: string;             // link back to Element
  role: string;                  // character name
  actor?: string;                // actor name (empty until cast)
  status: 'Uncast' | 'Shortlisted' | 'Offered' | 'Confirmed' | 'Wrapped';
  category: 'Lead' | 'Supporting' | 'Day Player' | 'Cameo' | 'Stunt Double' | 'Stand-In';
  union: 'SAG-AFTRA' | 'Non-Union' | 'Taft-Hartley' | 'Fi-Core';
  dailyRate?: number;
  weeklyRate?: number;
  guaranteedDays?: number;
  startDate?: string;            // first work day
  endDate?: string;              // last work day (wrap)
  agent?: string;                // agent/manager name
  agentPhone?: string;
  agentEmail?: string;
  notes?: string;
  fittingDates?: string[];       // wardrobe fitting dates
  rehearsalDates?: string[];     // rehearsal dates
}
```

### UI Layout

**Three tabs:**

#### Tab 1: Cast List (default)
- Table/card view of all cast members
- Columns: Role, Actor, Category badge (Lead=amber, Supporting=blue, Day Player=gray), Status badge (Uncast=red, Shortlisted=yellow, Offered=blue, Confirmed=green, Wrapped=gray), Union, Rate, Work Days, Scenes
- Click row → expand inline to edit all fields
- "Scenes" column: count of scenes this cast member appears in (derived from breakdowns where their element ID is in the elements array)
- Sort by: role name, category, status, scenes count
- Filter by: category, status

#### Tab 2: Availability Grid
- Matrix: rows = cast members, columns = shoot days (from strip board day breaks)
- Cells show: W (working — scene scheduled that day), H (hold — on call but not in scene), O (off), F (fitting), R (rehearsal)
- Color coded: W=green, H=amber, O=gray, F=purple, R=blue
- Work days auto-calculated from strip board (which scenes are on which day, which cast are in those scenes)
- Fitting/rehearsal days from the cast member's fittingDates/rehearsalDates arrays
- Totals row: work days per cast member
- Totals column: cast count per day

#### Tab 3: Deal Memo
- Per-cast-member deal summary card
- Shows: role, actor, category, union, rate (daily/weekly), guaranteed days, start/end, agent contact
- Print-friendly layout (clean, no dark bg for print)
- "Export All" button (future — just show the cards for now)

### Sample Data for Mistborn Seed

Add to `api/seed-mistborn.ts`:

```typescript
const castMembers = [
  { id: 'cast-vin', elementId: 'el-vin', role: 'Vin', actor: '', status: 'Uncast', category: 'Lead', union: 'SAG-AFTRA', weeklyRate: 125000, guaranteedDays: 45, notes: 'Requires 6 weeks wirework training pre-production. Age range 17-22. Must do own stunts where possible.', fittingDates: ['2026-05-15', '2026-05-20', '2026-05-25'], rehearsalDates: ['2026-05-18', '2026-05-22', '2026-05-26', '2026-05-28'] },
  { id: 'cast-kelsier', elementId: 'el-kelsier', role: 'Kelsier', actor: '', status: 'Uncast', category: 'Lead', union: 'SAG-AFTRA', weeklyRate: 187500, guaranteedDays: 35, notes: 'Charismatic, athletic. Heavy wirework. Hathsin arm scars every day.', fittingDates: ['2026-05-15', '2026-05-22'], rehearsalDates: ['2026-05-18', '2026-05-26'] },
  { id: 'cast-elend', elementId: 'el-elend', role: 'Elend Venture', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', weeklyRate: 35000, guaranteedDays: 15, notes: 'Bookish, aristocratic. Scenes 7, 10, 11, 15.', fittingDates: ['2026-05-20'], rehearsalDates: ['2026-05-22'] },
  { id: 'cast-sazed', elementId: 'el-sazed', role: 'Sazed', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', weeklyRate: 25000, guaranteedDays: 10, notes: 'Tall, bald. Prosthetic ears. Terrisman accent work needed.', fittingDates: ['2026-05-18'], rehearsalDates: ['2026-05-22'] },
  { id: 'cast-breeze', elementId: 'el-breeze', role: 'Breeze', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 5000, guaranteedDays: 8, notes: 'Distinguished, well-dressed. Soother — subtle performance.' },
  { id: 'cast-ham', elementId: 'el-ham', role: 'Ham', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 5000, guaranteedDays: 6, notes: 'Muscular build required. Philosophical delivery.' },
  { id: 'cast-clubs', elementId: 'el-clubs', role: 'Clubs', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 4000, guaranteedDays: 5, notes: 'Older, grumpy. Carpenter hands.' },
  { id: 'cast-dockson', elementId: 'el-dockson', role: 'Dockson', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 4000, guaranteedDays: 6, notes: 'Kelsier right hand. Organized, practical.' },
  { id: 'cast-marsh', elementId: 'el-marsh', role: 'Marsh', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', dailyRate: 5000, guaranteedDays: 4, notes: 'Stern. Becomes Steel Inquisitor — needs to work with prosthetics team.' },
  { id: 'cast-lordruler', elementId: 'el-lordruler', role: 'Lord Ruler', actor: '', status: 'Uncast', category: 'Supporting', union: 'SAG-AFTRA', weeklyRate: 50000, guaranteedDays: 8, notes: 'Commanding presence. Ages rapidly in climax — prosthetic/CG work. Bare feet deliberate.', fittingDates: ['2026-05-20'], rehearsalDates: ['2026-05-28'] },
  { id: 'cast-inquisitor', elementId: 'el-inquisitor1', role: 'Steel Inquisitor', actor: '', status: 'Uncast', category: 'Day Player', union: 'SAG-AFTRA', dailyRate: 3500, guaranteedDays: 8, notes: '2hr prosthetic application per day. Spike eyes. Heavy stunt work.' },
  { id: 'cast-straff', elementId: 'el-straff', role: 'Straff Venture', actor: '', status: 'Uncast', category: 'Day Player', union: 'SAG-AFTRA', dailyRate: 3000, guaranteedDays: 2, notes: 'Elend father. Cruel nobleman. Ball scene only.' },
  { id: 'cast-shan', elementId: 'el-shan', role: 'Shan Elariel', actor: '', status: 'Uncast', category: 'Day Player', union: 'SAG-AFTRA', dailyRate: 4000, guaranteedDays: 6, notes: 'Mistborn antagonist. Major fight scene (Sc. 12). Wirework required.', fittingDates: ['2026-05-20'], rehearsalDates: ['2026-05-26'] },
];
```

### Integration Points

1. **Sidebar** (`Sidebar.tsx`): Add "Cast" nav link between "Elements" and "Extras" → `/project/:projectId/scheduling/cast`
2. **App.tsx**: Add route `scheduling/cast` → `CastManager`
3. **Store** (`schedulingStore.tsx`): Add `castMembers: CastMember[]` to state, ADD/UPDATE/DELETE actions, LOAD from API
4. **SchedulingProject type**: Add `castMembers?: CastMember[]` field
5. **Seed**: Add `castMembers` to the Mistborn seed data and include in the scheduling_data JSONB

### Important
- Use `useParams` for all navigation — NO hardcoded paths
- Match existing dark theme exactly
- All data reads from the store (which loads from API on mount)
- Mutations dispatch to store → store auto-saves to API (debounced)
- Don't break any existing components
- Commit with descriptive message when done
