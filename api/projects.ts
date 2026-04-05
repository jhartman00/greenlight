import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT id, name, created_at, updated_at, scheduling_data, budgeting_data FROM projects ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
      const { rows } = await sql`
        INSERT INTO projects (name, scheduling_data, budgeting_data)
        VALUES (${name}, '{}', '{}')
        RETURNING id, name, created_at, updated_at, scheduling_data, budgeting_data
      `;
      return res.status(201).json(rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
