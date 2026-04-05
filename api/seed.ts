import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { sampleSchedulingProject, sampleBudgetProject } from '../src/utils/sampleData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  try {
    await sql`
      UPDATE projects
      SET scheduling_data = ${JSON.stringify(sampleSchedulingProject)}::jsonb,
          budgeting_data = ${JSON.stringify(sampleBudgetProject)}::jsonb,
          updated_at = NOW()
      WHERE id = ${projectId}
    `;
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
