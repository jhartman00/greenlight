import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface ProjectListItem {
  id: string;
  name: string;
  created_at: string;
  scheduling_data: Record<string, unknown>;
  budgeting_data: Record<string, unknown>;
}

const FilmSlateIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2L12 7 7 2"/>
    <path d="M2 7l5-5M7 7l5-5M12 7l5-5M17 7l5-5"/>
  </svg>
);

function sceneCount(p: ProjectListItem): number {
  const breakdowns = (p.scheduling_data as Record<string, unknown>)?.breakdowns;
  return Array.isArray(breakdowns) ? breakdowns.length : 0;
}

function budgetTotal(p: ProjectListItem): number {
  return Number((p.budgeting_data as Record<string, unknown>)?.grandTotal ?? 0);
}

export default function ProjectSelector() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [seeding, setSeedingId] = useState<string | null>(null);
  const [deleting, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.listProjects()
      .then(setProjects)
      .catch(() => setError('Could not load projects. Run migration first.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const project = await api.createProject(name);
      setNewName('');
      setCreating(false);
      navigate(`/project/${project.id}/scheduling/stripboard`);
    } catch {
      setError('Failed to create project.');
    }
  };

  const handleSeed = async (projectId: string) => {
    setSeedingId(projectId);
    try {
      await api.seed(projectId);
      await load();
    } catch {
      setError('Failed to load sample data.');
    } finally {
      setSeedingId(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    setDeletingId(projectId);
    try {
      await api.deleteProject(projectId);
      setProjects(ps => ps.filter(p => p.id !== projectId));
    } catch {
      setError('Failed to delete project.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="text-amber-500"><FilmSlateIcon /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Greenlight</h1>
            <p className="text-gray-500 text-sm">Production Suite</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-4">✕</button>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-200">Projects</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-1.5 text-sm rounded bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 transition-colors"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Create form */}
        {creating && (
          <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-3">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
              placeholder="Project name…"
              className="flex-1 bg-gray-700 text-gray-100 px-3 py-1.5 rounded text-sm outline-none border border-gray-600 focus:border-amber-500"
            />
            <button onClick={handleCreate} disabled={!newName.trim()} className="px-4 py-1.5 text-sm rounded bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-40 transition-colors">
              Create
            </button>
            <button onClick={() => { setCreating(false); setNewName(''); }} className="px-3 py-1.5 text-sm rounded text-gray-400 hover:text-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        )}

        {/* Project list */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="mb-2">No projects yet.</p>
            <p className="text-sm">Create a new project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(project => {
              const scenes = sceneCount(project);
              const budget = budgetTotal(project);
              const isEmpty = scenes === 0 && budget === 0;
              return (
                <div
                  key={project.id}
                  className="group bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-amber-500/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/project/${project.id}/scheduling/stripboard`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-100 truncate group-hover:text-amber-400 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                        <span>{scenes} scene{scenes !== 1 ? 's' : ''}</span>
                        {budget > 0 && <span>${budget.toLocaleString()} budget</span>}
                        {isEmpty && <span className="text-gray-600 italic">empty</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      {isEmpty && (
                        <button
                          onClick={() => handleSeed(project.id)}
                          disabled={seeding === project.id}
                          className="px-3 py-1 text-xs rounded bg-gray-700 text-amber-400 hover:bg-gray-600 border border-gray-600 transition-colors disabled:opacity-50"
                        >
                          {seeding === project.id ? 'Loading…' : 'Load Sample Data'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deleting === project.id}
                        className="px-3 py-1 text-xs rounded bg-gray-700 text-red-400 hover:bg-red-900/40 border border-gray-600 hover:border-red-700 transition-colors disabled:opacity-50"
                      >
                        {deleting === project.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
