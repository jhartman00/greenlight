import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { projectId } = req.query as { projectId: string };
    try {
      const { rows } = await sql`SELECT budgeting_data FROM projects WHERE id = ${projectId}`;
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(rows[0].budgeting_data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { projectId, data } = req.body;
    try {
      await sql`
        UPDATE projects SET budgeting_data = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
        WHERE id = ${projectId}
      `;
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
