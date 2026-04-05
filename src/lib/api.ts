const API_BASE = '/api';

export const api = {
  listProjects: (): Promise<any[]> =>
    fetch(`${API_BASE}/projects`).then(r => r.json()),

  createProject: (name: string): Promise<any> =>
    fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(r => r.json()),

  getProject: (id: string): Promise<any> =>
    fetch(`${API_BASE}/project/${id}`).then(r => r.json()),

  deleteProject: (id: string): Promise<any> =>
    fetch(`${API_BASE}/project/${id}`, { method: 'DELETE' }).then(r => r.json()),

  saveScheduling: (projectId: string, data: any): Promise<any> =>
    fetch(`${API_BASE}/scheduling`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, data }),
    }).then(r => r.json()),

  saveBudgeting: (projectId: string, data: any): Promise<any> =>
    fetch(`${API_BASE}/budgeting`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, data }),
    }).then(r => r.json()),

  migrate: (): Promise<any> =>
    fetch(`${API_BASE}/migrate`, { method: 'POST' }).then(r => r.json()),

  seed: (projectId: string): Promise<any> =>
    fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    }).then(r => r.json()),
};
