# Movie Magic Clone — Full Spec

A React + TypeScript + Vite clone of Entertainment Partners' **Movie Magic Scheduling** and **Movie Magic Budgeting**. Two modules in one app, linked together. All data persisted to localStorage. Dark theme (film industry aesthetic — dark grays, accent gold/amber).

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin — import `tailwindcss` in CSS, no config file needed)
- React Router v6 (sidebar nav between modules)
- @dnd-kit for drag-and-drop (strip board)
- uuid for IDs
- localStorage for persistence (JSON)

## Architecture

```
src/
  App.tsx                    — Router + Layout (sidebar nav)
  main.tsx                   — Entry
  index.css                  — Tailwind import + custom theme vars
  types/
    scheduling.ts            — All scheduling types
    budgeting.ts             — All budgeting types
  stores/
    schedulingStore.ts       — React context + reducer for scheduling state
    budgetingStore.ts        — React context + reducer for budgeting state
  components/
    layout/
      Sidebar.tsx            — App sidebar (Scheduling | Budgeting toggle)
      Header.tsx             — Top bar with project name, module indicator
    scheduling/
      BreakdownSheet.tsx     — Single scene breakdown form
      BreakdownList.tsx      — List of all breakdown sheets (table)
      StripBoard.tsx         — The main strip board (colored strips, drag to reorder)
      Strip.tsx              — Single strip (scene) on the board
      DayBreak.tsx           — Day break divider on the strip board
      ElementManager.tsx     — Manage element categories + elements
      DayOutOfDays.tsx       — DOOD report (grid: cast vs shoot days)
      CalendarView.tsx       — Calendar showing shoot days
      Reports.tsx            — Generate scheduling reports
    budgeting/
      TopSheet.tsx           — Budget overview (account totals, grand total)
      AccountList.tsx        — List of all accounts with sub-accounts
      AccountDetail.tsx      — Single account detail view (line items)
      LineItemEditor.tsx     — Edit a single line item (desc, units, rate, qty, total)
      GlobalsEditor.tsx      — Globals settings (currency, pay weeks, tax rates)
      FringesEditor.tsx      — Fringe benefits configuration
      BudgetReports.tsx      — Budget reports (summary, detail, variance)
      ActualsTracker.tsx     — Track actual spend vs budget
  utils/
    colors.ts                — Strip color mapping (INT/EXT, DAY/NIGHT)
    calculations.ts          — Budget math (fringes, totals, variance)
    sampleData.ts            — Sample project data for demo
    export.ts                — Export to CSV/PDF-printable HTML
```

---

## Module 1: Movie Magic Scheduling

### Data Model

```typescript
// Element categories (standard film production)
type ElementCategory = 
  | 'Cast' | 'Extras' | 'Stunts' | 'Vehicles' | 'Props' 
  | 'Wardrobe' | 'Makeup/Hair' | 'Livestock/Animals'
  | 'Sound Effects/Music' | 'Special Effects' | 'Special Equipment'
  | 'Art Department' | 'Set Dressing' | 'Greenery'
  | 'Visual Effects' | 'Mechanical Effects' | 'Miscellaneous'
  | 'Notes' | 'Security';

interface Element {
  id: string;
  category: ElementCategory;
  name: string;
  notes?: string;
}

interface BreakdownSheet {
  id: string;
  sceneNumber: string;       // "1", "1A", "2", etc.
  intExt: 'INT' | 'EXT' | 'INT/EXT';
  dayNight: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  location: string;
  setName: string;
  description: string;       // Scene description / action summary
  scriptPage: number;        // Starting page in script
  pageCount: string;         // Page count in 8ths: "2 4/8", "1/8", etc.
  elements: string[];        // Element IDs assigned to this scene
  notes: string;
  estimatedTime?: string;    // "0.5 days" etc.
}

type StripBoardItem = 
  | { type: 'scene'; breakdownId: string }
  | { type: 'dayBreak'; dayNumber: number; label?: string }
  | { type: 'banner'; text: string; color: string };

interface SchedulingProject {
  id: string;
  name: string;
  elements: Element[];
  breakdowns: BreakdownSheet[];
  stripBoard: StripBoardItem[];
  createdAt: string;
  updatedAt: string;
}
```

### Features

#### Breakdown Sheets
- Table view showing all scenes (scene #, INT/EXT, DAY/NIGHT, location, page count, description)
- Click a row to open full breakdown sheet editor
- Breakdown sheet form: scene number, INT/EXT dropdown, DAY/NIGHT dropdown, location, set, description, script page, page count (8ths selector — dropdown for numerator 0-7, displays as fractions), notes
- Element assignment: categorized multi-select. Show element categories as collapsible sections. Click to add/remove elements to/from the scene.
- Bulk add scenes: paste a simple scene list (number, INT/EXT, location, description) and auto-generate breakdown sheets

#### Strip Board
- **THE core feature.** Vertical list of colored horizontal strips, each representing a scene.
- Strip colors based on INT/EXT + DAY/NIGHT:
  - INT/DAY = White
  - INT/NIGHT = Blue  
  - EXT/DAY = Yellow
  - EXT/NIGHT = Green
  - INT/EXT DAY = White/Yellow stripe
  - INT/EXT NIGHT = Blue/Green stripe
- Each strip shows: scene #, INT/EXT, set/location, description (truncated), page count, cast members (by number)
- **Drag and drop to reorder** strips (this changes shooting order)
- **Day breaks**: thick black bars between strips marking end of day. Drag to reposition. Show "END OF DAY 1", "END OF DAY 2" etc. Auto-renumber when moved.
- **Banners**: colored header bars for "WEEK 1", "SECOND UNIT", etc.
- Column headers at top: Scene, INT/EXT, D/N, Set, Description, Pages, Cast
- Right-click context menu: Insert Day Break, Insert Banner, Delete Strip, Move to Top, Move to Bottom
- Summary bar at bottom: Total scenes, Total pages, Total days, Avg pages/day

#### Element Manager
- Grid of element categories (colored cards like the real MMS)
- Click a category to see/add/edit/delete elements in it
- Each category has its own color (Cast = red, Props = purple, Wardrobe = orange, etc.)
- Show element usage count (how many scenes use it)

#### Day Out of Days (DOOD)
- Grid report: rows = cast members, columns = shoot days
- Cells show status codes: W (Work), SWF (Start/Work/Finish), SW (Start/Work), WF (Work/Finish), H (Hold), T (Travel), R (Rehearse), — (not needed)
- Summary column: total work days, total hold days
- Cast members sorted by number of work days (most to least)

#### Calendar View
- Month calendar grid
- Each day that's a shoot day shows: Day #, scene count, page count
- Click a day to see which scenes are scheduled
- Color-coded by workload (light = few pages, dark = many pages)

---

## Module 2: Movie Magic Budgeting

### Data Model

```typescript
interface BudgetGlobals {
  currency: string;           // "USD", "EUR", "GBP", etc.
  currencySymbol: string;     // "$", "€", "£"
  prepWeeks: number;
  shootWeeks: number;
  wrapWeeks: number;
  payDaysPerWeek: number;     // typically 5 or 6
  overtimeRate: number;       // multiplier, e.g. 1.5
  taxRate: number;            // percentage
  contingencyPercent: number; // typically 10
}

interface Fringe {
  id: string;
  name: string;              // "Social Security", "Medicare", "SAG Pension", etc.
  type: 'percentage' | 'flat';
  value: number;             // percentage (0-100) or flat dollar amount
  cap?: number;              // salary cap (fringes only apply up to this amount)
  appliesTo: string[];       // account IDs this fringe applies to
}

interface LineItem {
  id: string;
  description: string;
  units: number;
  unitType: string;          // "Days", "Weeks", "Flat", "Allow", "Lot"
  rate: number;
  quantity: number;
  subtotal: number;          // calculated: units × rate × quantity
  fringeTotal: number;       // calculated from applicable fringes
  total: number;             // subtotal + fringeTotal
  notes?: string;
  actualSpend?: number;      // for variance tracking
}

interface Account {
  id: string;
  code: string;              // "1100", "2200", etc.
  name: string;              // "Producer", "Camera Department"
  lineItems: LineItem[];
  subtotal: number;          // sum of all line item totals
}

interface AccountGroup {
  id: string;
  code: string;              // "1000", "2000", "3000", "4000"
  name: string;              // "Above The Line", "Below The Line", "Post Production", "Other"
  accounts: Account[];
  subtotal: number;          // sum of all account subtotals
}

interface BudgetProject {
  id: string;
  name: string;
  globals: BudgetGlobals;
  fringes: Fringe[];
  accountGroups: AccountGroup[];
  grandTotal: number;
  contingency: number;
  totalWithContingency: number;
  lockedBudget?: number;     // snapshot of locked budget for variance
  createdAt: string;
  updatedAt: string;
}
```

### Features

#### Top Sheet
- **THE budget overview page.** Like a spreadsheet summary.
- Shows all account groups and their accounts with totals
- Columns: Account Code, Account Name, Budget Total
- Group rows are bold with subtotals
- Bottom section: Subtotal (all groups), Fringes Total, Contingency (% configurable), **Grand Total**
- Click any account to drill down to detail
- Lock Budget button: snapshots current total for variance tracking
- Color indicators: green (under budget), yellow (near budget), red (over budget) — when actuals are tracked

#### Account Detail
- Shows all line items for a selected account
- Editable inline table: Description, Units, Unit Type (dropdown), Rate ($), Quantity, Subtotal (calc), Fringes (calc), Total (calc)
- Add/delete line items
- Account subtotal at bottom
- Notes field per line item
- "Add Standard Items" button with templates (e.g., Camera Dept pre-fills: Camera Operator, 1st AC, 2nd AC, DIT, Camera Rental, Lenses, etc.)

#### Globals Editor
- Form to set: Currency, Prep/Shoot/Wrap weeks, Pay days/week, OT rate, Tax rate, Contingency %
- Changes cascade immediately to all calculations
- Show impact preview: "Changing shoot weeks from 6 to 8 will increase budget by ~$X"

#### Fringes Editor
- List of all fringes with: Name, Type (% or flat), Value, Cap, Applies To
- Add/edit/delete fringes
- Preset templates: "US Standard" (SS 6.2%, Medicare 1.45%, FUI, SUI), "SAG-AFTRA" (Pension 19%, H&W 1%), "DGA", "WGA", "IATSE"
- Toggle fringes on/off globally

#### Actuals Tracker
- Add actual spend per line item
- Side-by-side: Budget vs Actual vs Variance
- Variance = Actual - Budget (negative = under, positive = over)
- Color coding: green/yellow/red
- Completion % per account

#### Budget Reports
- **Summary Report**: Account groups + totals (printable)
- **Detail Report**: Every line item expanded (printable)  
- **Variance Report**: Budget vs Actuals with variance column
- **Cash Flow**: Estimated spend per week/month (based on shoot schedule if linked)
- All reports can be "printed" (open in new window with print-friendly CSS)

---

## Shared Features

### Project Management
- Create/open/delete projects
- Each project can have both a schedule and a budget
- **Link scheduling to budgeting**: shooting days from schedule auto-populate shoot weeks in budget globals

### Sample Data
- Include a complete sample project: "THE LAST LIGHT" (indie drama, ~30 scenes, 15 cast members)
- Full breakdown sheets, strip board, budget with realistic numbers
- User can load sample data from welcome screen or create blank project

### UI/UX
- **Dark theme**: bg-gray-900, cards bg-gray-800, text-gray-100, accent amber-500/gold
- Film industry aesthetic: think dark screening room with warm accent lights
- Sidebar: Film slate icon, project name, module switcher (Scheduling | Budgeting)
- Responsive but desktop-primary (this is pro software, not mobile)
- Keyboard shortcuts: Ctrl+S save, Ctrl+N new item, Delete remove, arrow keys navigate
- All modals/editors slide in from right (panel pattern)
- Toast notifications for save/delete/error
- Tables with alternating row shading, fixed headers, horizontal scroll for wide content

### Data Persistence
- All data in localStorage under `movie-magic-projects` key
- Auto-save on every change (debounced 500ms)
- Import/Export project as JSON file
- Export reports as CSV

---

## Implementation Notes

- Use React Context + useReducer for state management (one store per module)
- Tailwind for all styling — NO separate CSS files except index.css for Tailwind import and any CSS custom properties
- For Tailwind v4 with Vite: use `@tailwindcss/vite` plugin in vite.config.ts and `@import "tailwindcss"` in index.css. No tailwind.config needed.
- @dnd-kit for strip board drag and drop
- All calculations derived (never store what you can compute, except for snapshot/lock)
- Toast system: simple div in top-right corner, auto-dismiss after 3s
- Print: use `window.print()` with @media print styles hiding nav/sidebar

## Getting Started

Dependencies are already installed:
- react, react-dom, react-router-dom
- tailwindcss, @tailwindcss/vite
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- uuid

Just configure vite.config.ts with the Tailwind plugin and build out the components.
