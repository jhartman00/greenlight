# Movie Magic Clone — Test Suite Spec

After all v2 features are complete and building clean, add this comprehensive test suite.

## Setup

Install test dependencies:
```bash
npm install -D @playwright/test jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest jest-environment-jsdom identity-obj-proxy
npx playwright install chromium
```

Add to package.json scripts:
```json
{
  "test": "jest --config jest.config.ts",
  "test:e2e": "playwright test",
  "test:all": "jest && playwright test"
}
```

## Playwright E2E Tests (`e2e/`)

Create `playwright.config.ts` at project root:
- baseURL: http://localhost:4200
- webServer: start `npm run dev -- --port 4200`
- Use chromium only
- Screenshot on failure

### Test Files:

#### `e2e/navigation.spec.ts`
- All sidebar links navigate to correct routes
- All 15+ pages render without JS errors
- Default route redirects to /scheduling/stripboard
- Module switching (Scheduling ↔ Budgeting) works

#### `e2e/scheduling/strip-board.spec.ts`
- Strips render with correct background colors (INT/DAY=white, INT/NIGHT=blue, EXT/DAY=yellow, EXT/NIGHT=green)
- Day breaks visible between scene groups
- Summary stats show correct totals (20 scenes, 5 days)
- Scene data visible on strips (scene #, location, description, page count)
- Right-click context menu appears (if implemented)

#### `e2e/scheduling/breakdowns.spec.ts`
- Table shows all 20 sample scenes
- Correct column headers (Sc#, INT/EXT, D/N, Set, Location, Pages, Cast, Elements)
- Click scene row opens detail panel
- Detail panel has form fields (scene #, INT/EXT dropdown, DAY/NIGHT dropdown, etc.)
- Edit a field, save, verify change persists after page reload
- Add new scene, verify it appears in list
- Delete scene, verify removal

#### `e2e/scheduling/elements.spec.ts`
- Element categories render with correct names
- Cast category shows 10 cast members
- Total element count displayed
- Add a new element to a category
- Delete an element

#### `e2e/scheduling/dood.spec.ts`
- Grid renders with 10 cast member rows and 5 day columns
- Status codes visible (W, SW, WF, SWF)
- Total work days column shows correct values
- Export CSV button exists

#### `e2e/scheduling/calendar.spec.ts`
- Calendar grid renders current month
- 5 shoot days highlighted with scene counts
- Weekends correctly skipped

#### `e2e/scheduling/extras.spec.ts`
- Extras groups list renders with sample data
- Create new extras group
- Assign extras to a scene with headcount
- Voucher creation and pay calculation

#### `e2e/scheduling/wardrobe.spec.ts`
- Costume plot grid renders (characters × scenes)
- Costume inventory lists items
- Add new costume item
- Assign costume to scene

#### `e2e/scheduling/script.spec.ts`
- Revision timeline renders with colored bars
- Add new revision (auto-selects next color in sequence)
- Change log shows entries
- Lock revision functionality

#### `e2e/scheduling/sets.spec.ts`
- Set cards render with status badges
- Click card opens detail panel
- Timeline view renders
- Budget summary shows costs

#### `e2e/scheduling/reports.spec.ts`
- Scheduling reports page renders (not blank)
- Multiple report types available
- Print button exists

#### `e2e/budgeting/topsheet.spec.ts`
- All 4 account groups visible with correct totals
- Grand total renders correctly ($1,474,800)
- Contingency calculated (10%)
- Lock Budget button works
- Click account navigates to account detail

#### `e2e/budgeting/accounts.spec.ts`
- All accounts listed with hierarchy
- Click account expands to show line items inline
- Line items show description, units, rate, qty, total
- Edit line item, verify recalculation
- Add/delete line items

#### `e2e/budgeting/globals.spec.ts`
- All global fields render with values
- Edit shoot weeks, verify budget totals update
- Currency display correct

#### `e2e/budgeting/fringes.spec.ts`
- 4 fringes render (Social Security, Medicare, SAG, Workers Comp)
- Toggle fringe on/off
- Preset templates load
- Rate and cap values editable

#### `e2e/budgeting/actuals.spec.ts`
- Budget vs Actual columns visible
- Variance calculated correctly
- Color coding (green=under, red=over)

#### `e2e/budgeting/reports.spec.ts`
- Summary tab shows correct totals and percentages
- Detail tab shows line items
- Variance tab shows budget vs actual
- Print button exists

#### `e2e/persistence.spec.ts`
- Modify data, reload page, verify data persists
- Clear localStorage, reload, verify sample data loads fresh
- Both scheduling and budgeting data persist independently

---

## Jest Unit Tests (`src/__tests__/`)

Create `jest.config.ts` at project root:
- preset: ts-jest
- testEnvironment: jsdom
- moduleNameMapper for CSS/assets
- transform for TypeScript

### Test Files:

#### `src/__tests__/utils/calculations.test.ts`
- `calculateFringes`: percentage fringe, flat fringe, capped fringe, no applicable fringes
- `calculateLineItemTotal`: basic (units × rate × qty), with fringes, zero values
- `calculateAccountTotal`: sum of line items
- `calculateBudgetTotal`: sum of all account groups
- `calculateVariance`: under budget, over budget, exactly on budget
- `calculateContingency`: percentage of total

#### `src/__tests__/utils/colors.test.ts`
- `getStripColor`: returns correct hex for all 8 combinations (INT/EXT × DAY/NIGHT/DAWN/DUSK)
- `getStripColors`: returns bg + text + stripe for INT/EXT variants
- `getStripClass`: returns correct Tailwind classes
- `getCategoryColor`: all 19 element categories return non-empty string
- `ELEMENT_CATEGORY_COLORS`: all 19 categories have hex values

#### `src/__tests__/stores/schedulingStore.test.ts`
- LOAD_SAMPLE: produces valid project
- ADD_BREAKDOWN: adds to breakdowns + strip board
- UPDATE_BREAKDOWN: updates correct breakdown
- DELETE_BREAKDOWN: removes from breakdowns + strip board
- REORDER_STRIP_BOARD: new order persisted
- ADD_DAY_BREAK: inserted at correct position
- ADD/UPDATE/DELETE_ELEMENT: CRUD operations
- DELETE_STRIP_ITEM: removes correct item
- New v2 actions: ADD/UPDATE/DELETE for extras groups, scene extras, costumes, revisions, sets

#### `src/__tests__/stores/budgetingStore.test.ts`
- LOAD_SAMPLE: produces valid project with correct totals
- ADD/UPDATE/DELETE_LINE_ITEM: CRUD operations
- UPDATE_GLOBALS: changes cascade to calculations
- TOGGLE_FRINGE: enables/disables fringe, recalculates totals
- LOCK_BUDGET: snapshots current total
- UPDATE_ACTUAL: records actual spend, calculates variance
- SET_SELECTED_ACCOUNT: stores selection for drill-down

#### `src/__tests__/utils/sampleData.test.ts`
- All breakdown IDs referenced in strip board exist
- All element IDs referenced in breakdowns exist in elements array
- All character IDs in costumes exist as cast elements
- All scene IDs in scene-extras/scene-costumes exist in breakdowns
- Budget account codes are unique
- No empty arrays or null required fields
- Revision colors follow correct order

---

## All tests must pass before committing. Run `npm run test:all` to verify.
