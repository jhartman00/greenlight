# Task: Migrate from localStorage to Neon Postgres + Multi-Project Support

## Context
- Greenlight is a film production scheduling & budgeting app
- Currently uses localStorage for all persistence (keys: `greenlight_scheduling`, `greenlight_budgeting`)
- Neon Postgres is connected to the Vercel project — env vars available via `vercel env pull`
- Stack: React 19 + TypeScript + Vite + Tailwind v4 + React Router v7

## Requirements

### 1. Pull Neon connection env vars
Run `vercel env pull .env.local` to get the database connection string.

### 2. Add Vercel Postgres SDK
Install `@vercel/postgres` for the serverless-friendly Postgres client.

### 3. Create API routes
Since this is a Vite SPA (not Next.js), we need Vercel serverless functions in `/api/` directory at the project root:

```
api/
  migrate.ts         — POST: run schema migration (create tables)
  seed.ts            — POST: seed sample data into a new project
  projects.ts        — GET: list all projects, POST: create new project
  project/[id].ts    — GET: single project with all data, PUT: update, DELETE
  scheduling.ts      — GET/POST/PUT/DELETE for scheduling entities (scenes, elements, strips, extras, wardrobe, script, sets)
  budgeting.ts       — GET/POST/PUT/DELETE for budgeting entities (accounts, line items, globals, fringes, actuals)
```

Each function uses `import { sql } from '@vercel/postgres'` — no connection string needed, it reads from env automatically.

### 4. Database Schema

One `projects` table + JSONB columns for simplicity (don't over-normalize — this is a portfolio app):

```sql
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduling_data JSONB DEFAULT '{}',
  budgeting_data JSONB DEFAULT '{}'
);
```

This keeps the migration simple — the entire scheduling state and budgeting state are stored as JSONB. The app already serializes/deserializes these blobs for localStorage. Same pattern, different backend.

### 5. Client-side API layer

Create `src/lib/api.ts`:

```typescript
const API_BASE = '/api';

export const api = {
  // Projects
  listProjects: () => fetch(`${API_BASE}/projects`).then(r => r.json()),
  createProject: (name: string) => fetch(`${API_BASE}/projects`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name }) }).then(r => r.json()),
  getProject: (id: string) => fetch(`${API_BASE}/project/${id}`).then(r => r.json()),
  deleteProject: (id: string) => fetch(`${API_BASE}/project/${id}`, { method: 'DELETE' }).then(r => r.json()),
  
  // Save state (debounced from stores)
  saveScheduling: (projectId: string, data: any) => fetch(`${API_BASE}/scheduling`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ projectId, data }) }).then(r => r.json()),
  saveBudgeting: (projectId: string, data: any) => fetch(`${API_BASE}/budgeting`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ projectId, data }) }).then(r => r.json()),
  
  // Seed
  migrate: () => fetch(`${API_BASE}/migrate`, { method: 'POST' }).then(r => r.json()),
  seed: (projectId: string) => fetch(`${API_BASE}/seed`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ projectId }) }).then(r => r.json()),
};
```

### 6. Multi-Project Support

**New route:** `/` → Project selector page (list projects, create new, delete)
**Existing routes:** `/project/:projectId/scheduling/*` and `/project/:projectId/budgeting/*`

- Project selector shows cards for each project (name, created date, scene count, budget total)
- "New Project" button → name input → creates empty project
- "Load Sample Data" button on empty projects → calls seed endpoint
- Clicking a project card → navigates to `/project/:id/scheduling/stripboard`

**Update App.tsx routing:**
- `/` → ProjectSelector component
- `/project/:projectId/scheduling/*` → existing scheduling routes
- `/project/:projectId/budgeting/*` → existing budgeting routes

**Update stores:**
- Remove ALL localStorage reads/writes
- Add `currentProjectId` to both stores
- On project load: fetch from API → dispatch SET_PROJECT
- On mutations: optimistic local update, then debounced save to API (500ms debounce)
- Add a `useAutoSave` hook that watches state changes and saves to API

**Update Sidebar:**
- Add project name at top with link back to `/` (project selector)
- Update all nav links to include `/project/:projectId/` prefix

### 7. Migration endpoint
`POST /api/migrate` creates the table if it doesn't exist. Call this once on first deploy or add a button in the UI.

### 8. Important Notes
- Keep the app working locally with `vercel dev` (reads .env.local for DB connection)
- The Vercel build is just `tsc -b && vite build` — API routes in `/api/` are auto-detected by Vercel as serverless functions
- Don't break existing UI/components — this is a persistence + routing change only
- Test files are in `src/__tests__/` — excluded from tsconfig.app.json already
- Commit with descriptive message when done
