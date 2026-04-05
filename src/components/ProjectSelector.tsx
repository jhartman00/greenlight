import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  scheduling_data: any;
  budgeting_data: any;
}

const FilmSlateIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2"/>
    <path d="M17 2L12 7 7 2"/>
    <path d="M2 7l5-5M7 7l5-5M12 7l5-5M17 7l5-5"/>
  </svg>
);

export default function ProjectSelector() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [seeding, setSeeding] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listProjects();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        // Table might not exist yet
        setError('Database not initialized. Click "Initialize Database" to set up.');
        setProjects([]);
      }
    } catch {
      setError('Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  async function handleMigrate() {
    setMigrating(true);
    try {
      await api.migrate();
      await loadProjects();
    } catch {
      setError('Migration failed.');
    } finally {
      setMigrating(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const project = await api.createProject(newName.trim());
      setNewName('');
      setShowNewInput(false);
      await loadProjects();
      navigate(`/project/${project.id}/scheduling/stripboard`);
    } catch {
      setError('Failed to create project.');
    } finally {
      setCreating(false);
    }
  }

  async function handleSeed(projectId: string) {
    setSeeding(projectId);
    try {
      await api.seed(projectId);
      await loadProjects();
    } catch {
      setError('Failed to seed project.');
    } finally {
      setSeeding(null);
    }
  }

  async function handleDelete(projectId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(projectId);
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch {
      setError('Failed to delete project.');
    } finally {
      setDeleting(null);
    }
  }

  function getSceneCount(project: Project): number {
    return project.scheduling_data?.breakdowns?.length ?? 0;
  }

  function getBudgetTotal(project: Project): string {
    const total = project.budgeting_data?.totalWithContingency;
    if (!total) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);
  }

  function isEmpty(project: Project): boolean {
    return !project.scheduling_data?.breakdowns?.length && !project.budgeting_data?.accountGroups?.length;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-5 flex items-center gap-3">
        <div className="text-amber-500"><FilmSlateIcon /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-100">Greenlight</h1>
          <p className="text-xs text-gray-500">Production Suite</p>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Projects</h2>
          <div className="flex gap-2">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="px-3 py-2 text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded transition-colors"
            >
              {migrating ? 'Initializing…' : 'Initialize DB'}
            </button>
            <button
              onClick={() => setShowNewInput(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded transition-colors"
            >
              + New Project
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {showNewInput && (
          <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNewInput(false); }}
              placeholder="Project name…"
              className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold text-sm rounded transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => { setShowNewInput(false); setNewName(''); }}
              className="px-3 py-2 text-gray-400 hover:text-gray-200 text-sm rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm">Loading projects…</div>
        ) : projects.length === 0 && !error ? (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-2">No projects yet.</p>
            <p className="text-sm">Click "+ New Project" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}/scheduling/stripboard`)}
                className="bg-gray-900 border border-gray-700 hover:border-amber-500/50 rounded-lg p-5 cursor-pointer transition-colors group relative"
              >
                <button
                  onClick={e => handleDelete(project.id, e)}
                  disabled={deleting === project.id}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-lg leading-none"
                  title="Delete project"
                >
                  ×
                </button>
                <h3 className="font-semibold text-gray-100 mb-3 pr-6 truncate">{project.name}</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Scenes</span>
                    <span className="text-gray-400">{getSceneCount(project)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget</span>
                    <span className="text-gray-400">{getBudgetTotal(project)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span className="text-gray-400">{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {isEmpty(project) && (
                  <button
                    onClick={e => { e.stopPropagation(); handleSeed(project.id); }}
                    disabled={seeding === project.id}
                    className="mt-4 w-full py-1.5 text-xs border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                  >
                    {seeding === project.id ? 'Loading…' : 'Load Sample Data'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
